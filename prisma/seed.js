// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Utilisation de bcrypt avec un salt de 10 rounds
  const passwordHash = await bcrypt.hash('Password123', 10);

  await prisma.user.upsert({
    where: { email: 'test@hellopay.fr' },
    update: {
      passwordHash
    },
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