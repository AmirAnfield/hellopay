// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Utilisation de bcrypt avec un salt de 10 rounds
  const passwordHash = await bcrypt.hash('Password123', 10);

  // Créer un utilisateur test
  const user = await prisma.user.upsert({
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

  // Créer une entreprise exemple pour l'utilisateur
  const company = await prisma.company.create({
    data: {
      name: 'HelloPay SARL',
      siret: '12345678901234',
      address: '123 rue de la Paie',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
      activityCode: '6201Z',
      urssafNumber: '123456789',
      legalForm: 'SARL',
      vatNumber: 'FR12345678901',
      phoneNumber: '0123456789',
      email: 'contact@hellopay.fr',
      website: 'https://hellopay.fr',
      legalRepresentative: 'Jean Dupont',
      legalRepresentativeRole: 'Gérant',
      userId: user.id,
    }
  });
  
  console.log('🏢 Entreprise exemple créée avec succès.');
  
  // Créer un salarié exemple
  const employee = await prisma.employee.create({
    data: {
      firstName: 'Marie',
      lastName: 'Martin',
      address: '456 avenue du Travail',
      city: 'Paris',
      postalCode: '75002',
      country: 'France',
      email: 'marie.martin@example.com',
      phoneNumber: '0612345678',
      birthDate: new Date('1985-03-15'),
      birthPlace: 'Lyon',
      nationality: 'Française',
      socialSecurityNumber: '285036912345678',
      position: 'Développeur Full-Stack',
      department: 'Technique',
      contractType: 'CDI',
      isExecutive: true,
      startDate: new Date('2022-01-10'),
      trialPeriodEndDate: new Date('2022-04-10'),
      hourlyRate: 25.5,
      monthlyHours: 151.67,
      baseSalary: 3867.59,
      bonusAmount: 200,
      bonusDescription: 'Prime de performance',
      iban: 'FR7630001007941234567890185',
      bic: 'BDFEFR2TXXX',
      paidLeaveBalance: 25,
      companyId: company.id,
    }
  });
  
  console.log('👤 Salarié exemple créé avec succès.');
  
  // Créer un bulletin de paie exemple
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const periodStart = new Date(currentYear, currentMonth - 1, 1);
  const periodEnd = new Date(currentYear, currentMonth - 1, 0);
  
  const payslip = await prisma.payslip.create({
    data: {
      employerName: company.name,
      employerAddress: `${company.address}, ${company.postalCode} ${company.city}`,
      employerSiret: company.siret,
      employerUrssaf: company.urssafNumber || '123456789',
      
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeAddress: `${employee.address}, ${employee.postalCode} ${employee.city}`,
      employeePosition: employee.position,
      employeeSocialSecurityNumber: employee.socialSecurityNumber,
      isExecutive: employee.isExecutive,
      
      periodStart,
      periodEnd,
      paymentDate: new Date(),
      fiscalYear: currentYear,
      
      hourlyRate: employee.hourlyRate,
      hoursWorked: employee.monthlyHours,
      grossSalary: employee.baseSalary,
      netSalary: employee.baseSalary * 0.78, // Approximation du net
      employerCost: employee.baseSalary * 1.42, // Approximation du coût employeur
      
      employeeContributions: employee.baseSalary * 0.22, // Approximation cotisations salariales
      employerContributions: employee.baseSalary * 0.42, // Approximation cotisations patronales
      contributionsDetails: JSON.stringify([]), // Détails vides pour l'exemple
      
      paidLeaveAcquired: 2.5,
      paidLeaveTaken: 0,
      paidLeaveRemaining: employee.paidLeaveBalance,
      
      cumulativeGrossSalary: employee.baseSalary * 3, // Exemple pour 3 mois
      cumulativeNetSalary: employee.baseSalary * 3 * 0.78, // Exemple pour 3 mois
      
      cumulativePeriodStart: new Date(currentYear, 0, 1), // 1er janvier
      cumulativePeriodEnd: periodEnd,
      
      userId: user.id,
      companyId: company.id,
      employeeId: employee.id,
    }
  });
  
  console.log('🧾 Bulletin de paie exemple créé avec succès.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect()); 