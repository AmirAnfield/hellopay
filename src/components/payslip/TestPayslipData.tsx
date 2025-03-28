import { PayslipData } from './PayslipCalculator';

// Données pour un employé à temps plein
export const fullTimeEmployeeData: PayslipData = {
  // Informations employeur
  employerName: "ACME Corporation",
  employerAddress: "123 Avenue des Champs-Élysées, 75008 Paris",
  employerSiret: "123 456 789 00012",
  employerUrssaf: "750 1234567 890",
  
  // Informations salarié
  employeeName: "Jean Dupont",
  employeeAddress: "45 Rue de la Paix, 75002 Paris",
  employeePosition: "Développeur Web",
  employeeSocialSecurityNumber: "1 85 12 75 123 456 78",
  isExecutive: true,
  
  // Période
  periodStart: new Date(2023, 2, 1), // 1er mars 2023
  periodEnd: new Date(2023, 2, 31), // 31 mars 2023
  paymentDate: new Date(2023, 3, 5), // 5 avril 2023
  fiscalYear: 2023,
  
  // Rémunération
  hourlyRate: 20,
  hoursWorked: 151.67, // Temps plein en France
  grossSalary: 3033.4, // 20 € × 151.67h
  netSalary: 2367.05, // Approximativement 78% du brut
  employerCost: 4247.59, // Environ 140% du brut
  
  // Cotisations
  contributions: {
    employee: 666.35, // 22% du brut
    employer: 1214.19, // 40% du brut
    details: [
      {
        name: "Sécurité sociale - Maladie, maternité",
        base: 3033.4,
        employeeRate: 0.0,
        employerRate: 0.13,
        employeeAmount: 0,
        employerAmount: 394.34
      },
      {
        name: "Sécurité sociale - Vieillesse plafonnée",
        base: 3033.4,
        employeeRate: 0.0690,
        employerRate: 0.0855,
        employeeAmount: 209.30,
        employerAmount: 259.35
      },
      {
        name: "Retraite complémentaire",
        base: 3033.4,
        employeeRate: 0.04,
        employerRate: 0.06,
        employeeAmount: 121.34,
        employerAmount: 182.00
      },
      {
        name: "Chômage",
        base: 3033.4,
        employeeRate: 0.0,
        employerRate: 0.0405,
        employeeAmount: 0,
        employerAmount: 122.85
      },
      {
        name: "CSG déductible",
        base: 2980.32, // 98.25% du brut
        employeeRate: 0.0680,
        employerRate: 0.0,
        employeeAmount: 202.66,
        employerAmount: 0
      },
      {
        name: "CSG/CRDS non déductible",
        base: 2980.32, // 98.25% du brut
        employeeRate: 0.0290,
        employerRate: 0.0,
        employeeAmount: 86.43,
        employerAmount: 0
      },
      {
        name: "Autres contributions",
        base: 3033.4,
        employeeRate: 0.0154,
        employerRate: 0.0842,
        employeeAmount: 46.72,
        employerAmount: 255.41
      }
    ]
  },
  
  // Congés payés
  paidLeaveDays: {
    acquired: 2.5, // 2.5 jours par mois
    taken: 0,
    remaining: 25 // 10 mois de travail
  },
  
  // Cumuls
  cumulativeGrossSalary: 9100.2, // 3 mois de travail
  cumulativeNetSalary: 7101.15, // 3 mois de travail
  
  // Période des cumuls
  cumulativePeriodStart: new Date(2023, 0, 1), // 1er janvier 2023
  cumulativePeriodEnd: new Date(2023, 2, 31) // 31 mars 2023
};

// Données pour un employé à temps partiel
export const partTimeEmployeeData: PayslipData = {
  // Informations employeur
  employerName: "ACME Corporation",
  employerAddress: "123 Avenue des Champs-Élysées, 75008 Paris",
  employerSiret: "123 456 789 00012",
  employerUrssaf: "750 1234567 890",
  
  // Informations salarié
  employeeName: "Marie Martin",
  employeeAddress: "28 Rue du Faubourg Saint-Honoré, 75008 Paris",
  employeePosition: "Assistant administratif",
  employeeSocialSecurityNumber: "2 88 09 75 234 567 89",
  isExecutive: false,
  
  // Période
  periodStart: new Date(2023, 2, 1), // 1er mars 2023
  periodEnd: new Date(2023, 2, 31), // 31 mars 2023
  paymentDate: new Date(2023, 3, 5), // 5 avril 2023
  fiscalYear: 2023,
  
  // Rémunération
  hourlyRate: 15,
  hoursWorked: 86.67, // 24h par semaine
  grossSalary: 1300.05, // 15 € × 86.67h
  netSalary: 1014.04, // Approximativement 78% du brut
  employerCost: 1820.07, // Environ 140% du brut
  
  // Cotisations
  contributions: {
    employee: 286.01, // 22% du brut
    employer: 520.02, // 40% du brut
    details: [
      {
        name: "Sécurité sociale - Maladie, maternité",
        base: 1300.05,
        employeeRate: 0.0,
        employerRate: 0.13,
        employeeAmount: 0,
        employerAmount: 169.01
      },
      {
        name: "Sécurité sociale - Vieillesse plafonnée",
        base: 1300.05,
        employeeRate: 0.0690,
        employerRate: 0.0855,
        employeeAmount: 89.70,
        employerAmount: 111.15
      },
      {
        name: "Retraite complémentaire",
        base: 1300.05,
        employeeRate: 0.0350,
        employerRate: 0.0550,
        employeeAmount: 45.50,
        employerAmount: 71.50
      },
      {
        name: "Chômage",
        base: 1300.05,
        employeeRate: 0.0,
        employerRate: 0.0405,
        employeeAmount: 0,
        employerAmount: 52.65
      },
      {
        name: "CSG déductible",
        base: 1277.30, // 98.25% du brut
        employeeRate: 0.0680,
        employerRate: 0.0,
        employeeAmount: 86.86,
        employerAmount: 0
      },
      {
        name: "CSG/CRDS non déductible",
        base: 1277.30, // 98.25% du brut
        employeeRate: 0.0290,
        employerRate: 0.0,
        employeeAmount: 37.04,
        employerAmount: 0
      },
      {
        name: "Autres contributions",
        base: 1300.05,
        employeeRate: 0.0207,
        employerRate: 0.0890,
        employeeAmount: 26.91,
        employerAmount: 115.70
      }
    ]
  },
  
  // Congés payés
  paidLeaveDays: {
    acquired: 1.43, // 2.5 × (24/35) proportionnel au temps partiel
    taken: 0,
    remaining: 14.3 // 10 mois de travail
  },
  
  // Cumuls
  cumulativeGrossSalary: 3900.15, // 3 mois de travail
  cumulativeNetSalary: 3042.12, // 3 mois de travail
  
  // Période des cumuls
  cumulativePeriodStart: new Date(2023, 0, 1), // 1er janvier 2023
  cumulativePeriodEnd: new Date(2023, 2, 31) // 31 mars 2023
};

// Données pour un employé avec heures supplémentaires
export const overtimeEmployeeData: PayslipData = {
  // Informations employeur
  employerName: "ACME Corporation",
  employerAddress: "123 Avenue des Champs-Élysées, 75008 Paris",
  employerSiret: "123 456 789 00012",
  employerUrssaf: "750 1234567 890",
  
  // Informations salarié
  employeeName: "Thomas Bernard",
  employeeAddress: "12 Boulevard Haussmann, 75009 Paris",
  employeePosition: "Technicien de maintenance",
  employeeSocialSecurityNumber: "1 90 05 75 345 678 90",
  isExecutive: false,
  
  // Période
  periodStart: new Date(2023, 2, 1), // 1er mars 2023
  periodEnd: new Date(2023, 2, 31), // 31 mars 2023
  paymentDate: new Date(2023, 3, 5), // 5 avril 2023
  fiscalYear: 2023,
  
  // Rémunération
  hourlyRate: 18,
  hoursWorked: 169.67, // 151.67 heures normales + 18 heures supplémentaires
  grossSalary: 3129.06, // (18 € × 151.67h) + (18 € × 1.25 × 18h) = 2730.06 + 405
  netSalary: 2440.67, // Approximativement 78% du brut
  employerCost: 4380.68, // Environ 140% du brut
  
  // Cotisations
  contributions: {
    employee: 688.39, // 22% du brut
    employer: 1251.62, // 40% du brut
    details: [
      {
        name: "Sécurité sociale - Maladie, maternité",
        base: 3129.06,
        employeeRate: 0.0,
        employerRate: 0.13,
        employeeAmount: 0,
        employerAmount: 406.78
      },
      {
        name: "Sécurité sociale - Vieillesse plafonnée",
        base: 3129.06,
        employeeRate: 0.0690,
        employerRate: 0.0855,
        employeeAmount: 215.91,
        employerAmount: 267.53
      },
      {
        name: "Retraite complémentaire",
        base: 3129.06,
        employeeRate: 0.0350,
        employerRate: 0.0550,
        employeeAmount: 109.52,
        employerAmount: 172.10
      },
      {
        name: "Chômage",
        base: 3129.06,
        employeeRate: 0.0,
        employerRate: 0.0405,
        employeeAmount: 0,
        employerAmount: 126.73
      },
      {
        name: "CSG déductible",
        base: 3074.30, // 98.25% du brut
        employeeRate: 0.0680,
        employerRate: 0.0,
        employeeAmount: 209.05,
        employerAmount: 0
      },
      {
        name: "CSG/CRDS non déductible",
        base: 3074.30, // 98.25% du brut
        employeeRate: 0.0290,
        employerRate: 0.0,
        employeeAmount: 89.15,
        employerAmount: 0
      },
      {
        name: "Autres contributions",
        base: 3129.06,
        employeeRate: 0.0207,
        employerRate: 0.0890,
        employeeAmount: 64.77,
        employerAmount: 278.49
      }
    ]
  },
  
  // Congés payés
  paidLeaveDays: {
    acquired: 2.5, // 2.5 jours par mois
    taken: 0,
    remaining: 25 // 10 mois de travail
  },
  
  // Cumuls
  cumulativeGrossSalary: 9387.18, // 3 mois de travail
  cumulativeNetSalary: 7322.01, // 3 mois de travail
  
  // Période des cumuls
  cumulativePeriodStart: new Date(2023, 0, 1), // 1er janvier 2023
  cumulativePeriodEnd: new Date(2023, 2, 31) // 31 mars 2023
}; 