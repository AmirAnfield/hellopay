/**
 * Script de migration des données vers Firestore
 * Ce script est utilisé pour initialiser la structure Firestore pour le MVP 0.26
 */

// Importations
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialisation de Firebase Admin
try {
  // Utiliser les variables d'environnement ou un fichier de configuration
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : require('../../firebase-admin-key.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

} catch (error) {
  console.error('Erreur lors de l\'initialisation de Firebase Admin:', error);
  process.exit(1);
}

const db = admin.firestore();

/**
 * Structure de la base de données Firestore pour HelloPay
 */
const collections = [
  // Utilisateurs
  {
    name: 'users',
    documents: [
      // Document modèle pour les utilisateurs
      {
        id: 'template',
        data: {
          email: 'template@example.com',
          displayName: 'Utilisateur modèle',
          role: 'user',
          plan: 'free',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          settings: {
            theme: 'light',
            language: 'fr',
            notifications: true
          }
        }
      }
    ]
  },
  
  // Entreprises
  {
    name: 'companies',
    documents: [
      // Document modèle pour les entreprises
      {
        id: 'template',
        data: {
          name: 'Entreprise modèle',
          siret: '12345678901234',
          address: {
            street: '1 rue de l\'exemple',
            city: 'Paris',
            postalCode: '75000',
            country: 'France'
          },
          contact: {
            email: 'contact@example.com',
            phone: '+33123456789'
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          ownerId: 'user_id_placeholder',
          settings: {
            fiscalYear: 'calendar',
            paymentMethod: 'transfer',
            defaultCurrency: 'EUR'
          }
        }
      }
    ]
  },
  
  // Employés
  {
    name: 'employees',
    documents: [
      // Document modèle pour les employés
      {
        id: 'template',
        data: {
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com',
          phone: '+33612345678',
          companyId: 'company_id_placeholder',
          position: 'Développeur',
          status: 'active',
          hiring: {
            date: '2023-01-15',
            contract: 'CDI',
            salary: {
              base: 3500,
              currency: 'EUR',
              period: 'monthly'
            }
          },
          documents: {
            contract: ['contract_id_1'],
            payslips: ['payslip_id_1'],
            certificates: []
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      }
    ]
  },
  
  // Documents
  {
    name: 'documents',
    documents: [
      // Document modèle pour les documents
      {
        id: 'template',
        data: {
          name: 'Document modèle',
          type: 'payslip',
          status: 'active',
          url: 'https://example.com/document.pdf',
          employeeId: 'employee_id_placeholder',
          companyId: 'company_id_placeholder',
          metadata: {
            month: 'janvier',
            year: '2023',
            size: 1024 * 1024 // 1 MB
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          expiresAt: null
        }
      }
    ]
  },

  // Configurations
  {
    name: 'configurations',
    documents: [
      // Document pour les paramètres globaux
      {
        id: 'global',
        data: {
          version: '0.26.0',
          maintenance: false,
          features: {
            documentGeneration: true,
            electronicSignature: false,
            analytics: true
          },
          limits: {
            freeStorage: 100 * 1024 * 1024, // 100 MB
            maxEmployees: {
              free: 5,
              standard: 20,
              premium: 100
            }
          },
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }
      },
      
      // Document pour les modèles de documents
      {
        id: 'templates',
        data: {
          payslip: {
            standard: {
              name: 'Bulletin de paie standard',
              fields: ['salaryBase', 'bonus', 'deductions', 'netSalary'],
              design: 'standard'
            },
            detailed: {
              name: 'Bulletin de paie détaillé',
              fields: ['salaryBase', 'bonus', 'overtime', 'socialContributions', 'taxWithholding', 'netSalary'],
              design: 'detailed'
            }
          },
          contract: {
            permanent: {
              name: 'Contrat CDI',
              sections: ['parties', 'position', 'duration', 'compensation', 'termination'],
              design: 'legal'
            },
            temporary: {
              name: 'Contrat CDD',
              sections: ['parties', 'position', 'duration', 'compensation', 'endDate'],
              design: 'legal'
            }
          }
        }
      }
    ]
  }
];

/**
 * Crée une collection et ses documents
 */
async function createCollection(collection) {
  console.log(`Création de la collection: ${collection.name}`);
  
  for (const doc of collection.documents) {
    try {
      // Ne pas écraser les documents existants
      const docRef = db.collection(collection.name).doc(doc.id);
      const docSnapshot = await docRef.get();
      
      if (!docSnapshot.exists) {
        await docRef.set(doc.data);
        console.log(`  - Document créé: ${doc.id}`);
      } else {
        console.log(`  - Document existant ignoré: ${doc.id}`);
      }
    } catch (error) {
      console.error(`  - Erreur lors de la création du document ${doc.id}:`, error);
    }
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('Début de la migration vers Firestore...');
  
  try {
    // Création des collections et documents
    for (const collection of collections) {
      await createCollection(collection);
    }
    
    console.log('Migration vers Firestore terminée avec succès');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécution
main(); 