import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { faker } from '@faker-js/faker/locale/fr';

// Initialiser le client Prisma
const prisma = new PrismaClient();

// Paramètres de génération
const NUM_USERS = 3;
const NUM_COMPANIES_PER_USER = 3;
const NUM_CONTRACTS_PER_COMPANY = 100; // Pour un total d'environ 900 contrats

// Types de contrats disponibles
const contractTypes = ['employment', 'service', 'nda', 'partnership', 'other'];
const contractStatuses = ['draft', 'active', 'terminated', 'expired'];

// Fonction d'aide pour générer un nombre aléatoire entre min et max
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Fonction d'aide pour obtenir un élément aléatoire d'un tableau
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Fonction de génération de tags
function generateTags(): string {
  const numTags = randomInt(0, 4);
  const tags = [];
  
  const possibleTags = [
    'urgent', 'confidentiel', 'important', 'renouvelable', 'annuel',
    'prioritaire', 'commercial', 'technique', 'juridique', 'fiscal',
    'stratégique', 'partenariat', 'international', 'national', 'local'
  ];
  
  for (let i = 0; i < numTags; i++) {
    tags.push(randomItem(possibleTags));
  }
  
  return [...new Set(tags)].join(','); // Éliminer les doublons
}

// Fonction principale de seeding
async function seed() {
  console.log('🌱 Démarrage du seeding...');
  
  // Supprimer toutes les données existantes
  await prisma.contract.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.payslip.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('✅ Toutes les données existantes ont été supprimées');
  
  // Créer les utilisateurs
  const users = [];
  
  for (let i = 0; i < NUM_USERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }),
        passwordHash: await hash('password123', 10),
        image: faker.image.avatar(),
        role: i === 0 ? 'admin' : 'user',
      },
    });
    
    users.push(user);
    console.log(`👤 Utilisateur créé: ${user.name} (${user.email})`);
  }
  
  console.log(`✅ ${users.length} utilisateurs créés`);
  
  // Créer les entreprises pour chaque utilisateur
  const companies = [];
  
  for (const user of users) {
    for (let i = 0; i < NUM_COMPANIES_PER_USER; i++) {
      const companyName = faker.company.name();
      
      const company = await prisma.company.create({
        data: {
          name: companyName,
          siret: faker.string.numeric(14),
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          country: 'France',
          activityCode: faker.string.alphanumeric(5).toUpperCase(),
          urssafNumber: faker.string.numeric(9),
          legalForm: randomItem(['SAS', 'SARL', 'EURL', 'SA', 'SCI']),
          vatNumber: `FR${faker.string.numeric(11)}`,
          phoneNumber: faker.phone.number(),
          email: faker.internet.email({ firstName: companyName.split(' ')[0] }),
          website: faker.internet.url(),
          legalRepresentative: `${faker.person.firstName()} ${faker.person.lastName()}`,
          legalRepresentativeRole: randomItem(['Président', 'Directeur Général', 'Gérant']),
          userId: user.id,
        },
      });
      
      companies.push(company);
      console.log(`🏢 Entreprise créée: ${company.name} (${company.siret})`);
    }
  }
  
  console.log(`✅ ${companies.length} entreprises créées`);
  
  // Créer les contrats pour chaque entreprise
  let contractsCreated = 0;
  
  for (const company of companies) {
    const user = users.find(u => u.id === company.userId);
    if (!user) continue;
    
    for (let i = 0; i < NUM_CONTRACTS_PER_COMPANY; i++) {
      const title = `Contrat ${randomItem([
        'de service', 
        'de travail', 
        'de confidentialité', 
        'de partenariat', 
        'de prestation'
      ])} - ${faker.lorem.words(3)}`;
      
      const contractType = randomItem(contractTypes);
      const status = randomItem(contractStatuses);
      
      // Dates aléatoires sur les 3 dernières années
      const startDate = faker.date.past({ years: 3 });
      let endDate = null;
      
      // 70% des contrats ont une date de fin
      if (Math.random() < 0.7) {
        // Date de fin entre la date de début et aujourd'hui + 2 ans
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 2);
        endDate = faker.date.between({ from: startDate, to: maxDate });
      }
      
      // Données de fichier simulées
      const fileName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
      const fileSize = randomInt(100000, 5000000); // Taille entre 100KB et 5MB
      
      const contract = await prisma.contract.create({
        data: {
          title,
          description: Math.random() < 0.8 ? faker.lorem.paragraph() : null, // 80% ont une description
          reference: Math.random() < 0.6 ? `REF-${faker.string.alphanumeric(8).toUpperCase()}` : null, // 60% ont une référence
          status,
          contractType,
          startDate,
          endDate,
          companyId: company.id,
          counterpartyName: Math.random() < 0.7 ? `${faker.person.firstName()} ${faker.person.lastName()}` : null,
          counterpartyEmail: Math.random() < 0.6 ? faker.internet.email() : null,
          tags: Math.random() < 0.5 ? generateTags() : null, // 50% ont des tags
          fileName,
          fileSize,
          fileType: 'application/pdf',
          fileUrl: `https://example.com/uploads/${fileName}`,
          fileKey: `uploads/${fileName}`,
          userId: user.id,
          createdAt: faker.date.between({ from: startDate, to: new Date() }),
        },
      });
      
      contractsCreated++;
      
      if (contractsCreated % 100 === 0) {
        console.log(`📄 ${contractsCreated} contrats créés...`);
      }
    }
  }
  
  console.log(`✅ ${contractsCreated} contrats créés au total`);
  console.log('🌱 Seeding terminé avec succès!');
}

// Exécuter le seeding
seed()
  .catch((error) => {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    // Fermer la connexion Prisma
    await prisma.$disconnect();
  }); 