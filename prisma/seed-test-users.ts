const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUsers() {
  // Test user 1
  await prisma.user.upsert({
    where: { email: 'test@hellopay.fr' },
    update: { emailVerified: new Date() },
    create: {
      name: 'Utilisateur Test',
      email: 'test@hellopay.fr',
      passwordHash: '$2a$10$SJfATPomwXJfT3xO.OKcOO3Mr1jA/AeClR4a9yVxEhKSPJxCgRXJW', // password123
      emailVerified: new Date(),
      role: 'user'
    },
  });

  // Test user 2
  await prisma.user.upsert({
    where: { email: 'demo@hellopay.fr' },
    update: { emailVerified: new Date() },
    create: {
      name: 'Démo HelloPay',
      email: 'demo@hellopay.fr',
      passwordHash: '$2a$10$SJfATPomwXJfT3xO.OKcOO3Mr1jA/AeClR4a9yVxEhKSPJxCgRXJW', // password123
      emailVerified: new Date(),
      role: 'user'
    },
  });

  console.log('✅ Comptes de test créés ou mis à jour');
}

createTestUsers()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 