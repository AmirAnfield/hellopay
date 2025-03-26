// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Fonction simple pour hacher un mot de passe
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  const passwordHash = hashPassword('HelloPay2024!');

  await prisma.user.upsert({
    where: { email: 'test@hellopay.fr' },
    update: {},
    create: {
      name: 'Utilisateur Test',
      email: 'test@hellopay.fr',
      passwordHash,
      role: 'user',
    },
  });

  console.log('🌱 Utilisateur test créé avec succès.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect()); 