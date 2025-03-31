/**
 * Script de migration des utilisateurs de NextAuth vers Firebase Auth
 */

const { PrismaClient } = require('@prisma/client');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const fs = require('fs');

// Initialiser Prisma
const prisma = new PrismaClient();

// Charger les informations de service Firebase Admin
function getServiceAccount() {
  // Par défaut, on cherche le fichier dans le répertoire scripts
  const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
  
  try {
    if (fs.existsSync(serviceAccountPath)) {
      return require(serviceAccountPath);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } else {
      throw new Error('Aucun compte de service Firebase trouvé');
    }
  } catch (error) {
    console.error('Erreur lors du chargement du compte de service:', error);
    process.exit(1);
  }
}

async function migrateUsers() {
  console.log('Démarrage de la migration des utilisateurs vers Firebase...');
  
  // Initialiser Firebase Admin
  try {
    admin.initializeApp({
      credential: admin.credential.cert(getServiceAccount())
    });
    
    console.log('Firebase Admin initialisé');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Firebase Admin:', error);
    process.exit(1);
  }
  
  // Récupérer tous les utilisateurs
  try {
    const users = await prisma.user.findMany();
    console.log(`${users.length} utilisateurs trouvés dans la base de données.`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        // Vérifier si l'utilisateur existe déjà dans Firebase
        try {
          await admin.auth().getUserByEmail(user.email);
          console.log(`L'utilisateur ${user.email} existe déjà dans Firebase. Ignoré.`);
          continue;
        } catch (firebaseError) {
          // Si l'utilisateur n'existe pas, on continue la création
          if (firebaseError.code !== 'auth/user-not-found') {
            throw firebaseError;
          }
        }
        
        // Créer l'utilisateur dans Firebase
        const userRecord = await admin.auth().createUser({
          uid: user.id, // Utiliser le même ID que dans la base de données
          email: user.email,
          displayName: user.name || 'Utilisateur',
          emailVerified: user.emailVerified ? true : false,
          disabled: false,
          // On ne peut pas migrer les mots de passe hachés de bcrypt directement
          // Les utilisateurs devront réinitialiser leur mot de passe
        });
        
        // Définir les claims utilisateur pour les rôles
        await admin.auth().setCustomUserClaims(user.id, {
          role: user.role || 'user'
        });
        
        console.log(`✓ Utilisateur migré avec succès: ${user.email}`);
        successCount++;
      } catch (error) {
        console.error(`✗ Erreur lors de la migration de l'utilisateur ${user.email}:`, error);
        errorCount++;
      }
    }
    
    console.log('\nRésumé de la migration:');
    console.log(`- Total d'utilisateurs: ${users.length}`);
    console.log(`- Migrés avec succès: ${successCount}`);
    console.log(`- Échecs: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('\nUne ou plusieurs erreurs sont survenues pendant la migration.');
      console.log('Les utilisateurs concernés devront être créés manuellement ou réessayez la migration.');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Migration terminée.');
  }
}

// Exécuter la migration
migrateUsers().catch(error => {
  console.error('Erreur non gérée lors de la migration:', error);
  process.exit(1);
}); 