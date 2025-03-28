import { PayslipProps } from './PayslipTemplate';

/**
 * Données de test pour une fiche de paie standard - employé à temps plein
 */
export const fullTimeEmployeeData: PayslipProps = {
  employee: {
    firstName: 'Sophie',
    lastName: 'Martin',
    address: '15 Avenue des Lilas',
    postalCode: '75013',
    city: 'Paris',
    socialSecurityNumber: '2 85 01 75 123 456 78',
    position: 'Responsable Marketing',
    employmentDate: '15/03/2019',
  },
  employer: {
    name: 'Digital Marketing SAS',
    address: '56 Rue de la République',
    postalCode: '69002',
    city: 'Lyon',
    siret: '123 456 789 00045',
    ape: '7311Z',
  },
  salary: {
    period: 'Juin 2023',
    periodStart: '01/06/2023',
    periodEnd: '30/06/2023',
    paymentDate: '28/06/2023',
    items: [
      {
        label: 'Salaire de base',
        base: 151.67,
        rate: 32.5,
        amount: 4929.28,
        isAddition: true,
      },
      {
        label: 'Prime d\'ancienneté',
        amount: 250.00,
        isAddition: true,
      },
      {
        label: 'Prime de résultat',
        amount: 500.00,
        isAddition: true,
      },
      {
        label: 'Tickets restaurant',
        base: 22,
        rate: 9.5,
        amount: 115.50,
        isAddition: true,
      },
      {
        label: 'Sécurité Sociale - Maladie',
        base: 5794.78,
        rate: 0.0075,
        amount: 43.46,
        isAddition: false,
      },
      {
        label: 'Sécurité Sociale - Vieillesse plafonnée',
        base: 3664.00,
        rate: 0.0690,
        amount: 252.82,
        isAddition: false,
      },
      {
        label: 'Sécurité Sociale - Vieillesse déplafonnée',
        base: 5794.78,
        rate: 0.0040,
        amount: 23.18,
        isAddition: false,
      },
      {
        label: 'Retraite complémentaire',
        base: 5794.78,
        rate: 0.0380,
        amount: 220.20,
        isAddition: false,
      },
      {
        label: 'Assurance chômage',
        base: 5794.78,
        rate: 0.024,
        amount: 139.07,
        isAddition: false,
      },
      {
        label: 'CSG déductible',
        base: 5794.78,
        rate: 0.0617,
        amount: 357.54,
        isAddition: false,
      },
      {
        label: 'CSG/CRDS non déductible',
        base: 5794.78,
        rate: 0.029,
        amount: 168.05,
        isAddition: false,
      },
    ],
    grossSalary: 5794.78,
    netBeforeTax: 4590.46,
    netToPay: 4422.41,
    netSocial: 4590.46,
    totalEmployeeContributions: 1204.32,
    totalEmployerContributions: 2549.70,
    paymentMethod: 'Virement bancaire',
  },
};

/**
 * Données de test pour une fiche de paie - employé à temps partiel
 */
export const partTimeEmployeeData: PayslipProps = {
  employee: {
    firstName: 'Thomas',
    lastName: 'Dubois',
    address: '8 Rue Victor Hugo',
    postalCode: '33000',
    city: 'Bordeaux',
    socialSecurityNumber: '1 83 12 33 789 123 45',
    position: 'Assistant Administratif',
    employmentDate: '05/09/2021',
  },
  employer: {
    name: 'Bureau Services SARL',
    address: '24 Cours de l\'Intendance',
    postalCode: '33000',
    city: 'Bordeaux',
    siret: '987 654 321 00022',
    ape: '8211Z',
  },
  salary: {
    period: 'Mai 2023',
    periodStart: '01/05/2023',
    periodEnd: '31/05/2023',
    paymentDate: '29/05/2023',
    items: [
      {
        label: 'Salaire de base (80%)',
        base: 121.33,
        rate: 14.5,
        amount: 1759.29,
        isAddition: true,
      },
      {
        label: 'Prime de transport',
        amount: 75.00,
        isAddition: true,
      },
      {
        label: 'Sécurité Sociale - Maladie',
        base: 1834.29,
        rate: 0.0075,
        amount: 13.76,
        isAddition: false,
      },
      {
        label: 'Sécurité Sociale - Vieillesse plafonnée',
        base: 1834.29,
        rate: 0.0690,
        amount: 126.57,
        isAddition: false,
      },
      {
        label: 'Sécurité Sociale - Vieillesse déplafonnée',
        base: 1834.29,
        rate: 0.0040,
        amount: 7.34,
        isAddition: false,
      },
      {
        label: 'Retraite complémentaire',
        base: 1834.29,
        rate: 0.0380,
        amount: 69.70,
        isAddition: false,
      },
      {
        label: 'Assurance chômage',
        base: 1834.29,
        rate: 0.024,
        amount: 44.02,
        isAddition: false,
      },
      {
        label: 'CSG déductible',
        base: 1834.29,
        rate: 0.0617,
        amount: 113.18,
        isAddition: false,
      },
      {
        label: 'CSG/CRDS non déductible',
        base: 1834.29,
        rate: 0.029,
        amount: 53.19,
        isAddition: false,
      },
    ],
    grossSalary: 1834.29,
    netBeforeTax: 1459.72,
    netToPay: 1406.53,
    netSocial: 1459.72,
    totalEmployeeContributions: 374.57,
    totalEmployerContributions: 789.13,
    paymentMethod: 'Virement bancaire',
  },
};

/**
 * Données de test pour une fiche de paie - avec heures supplémentaires
 */
export const overtimeEmployeeData: PayslipProps = {
  employee: {
    firstName: 'Julien',
    lastName: 'Leroy',
    address: '12 Rue des Écoles',
    postalCode: '59000',
    city: 'Lille',
    socialSecurityNumber: '1 86 07 59 456 789 12',
    position: 'Technicien de Maintenance',
    employmentDate: '10/02/2018',
  },
  employer: {
    name: 'Industrie Nord SARL',
    address: '45 Boulevard Louis XIV',
    postalCode: '59800',
    city: 'Lille',
    siret: '456 789 123 00033',
    ape: '3312Z',
  },
  salary: {
    period: 'Juillet 2023',
    periodStart: '01/07/2023',
    periodEnd: '31/07/2023',
    paymentDate: '28/07/2023',
    items: [
      {
        label: 'Salaire de base',
        base: 151.67,
        rate: 18.5,
        amount: 2805.90,
        isAddition: true,
      },
      {
        label: 'Heures supplémentaires (25%)',
        base: 12,
        rate: 23.13,
        amount: 277.56,
        isAddition: true,
      },
      {
        label: 'Heures supplémentaires (50%)',
        base: 5,
        rate: 27.75,
        amount: 138.75,
        isAddition: true,
      },
      {
        label: 'Prime de déplacement',
        amount: 120.00,
        isAddition: true,
      },
      {
        label: 'Sécurité Sociale - Maladie',
        base: 3342.21,
        rate: 0.0075,
        amount: 25.07,
        isAddition: false,
      },
      {
        label: 'Sécurité Sociale - Vieillesse plafonnée',
        base: 3342.21,
        rate: 0.0690,
        amount: 230.61,
        isAddition: false,
      },
      {
        label: 'Sécurité Sociale - Vieillesse déplafonnée',
        base: 3342.21,
        rate: 0.0040,
        amount: 13.37,
        isAddition: false,
      },
      {
        label: 'Retraite complémentaire',
        base: 3342.21,
        rate: 0.0380,
        amount: 127.00,
        isAddition: false,
      },
      {
        label: 'Assurance chômage',
        base: 3342.21,
        rate: 0.024,
        amount: 80.21,
        isAddition: false,
      },
      {
        label: 'CSG déductible',
        base: 3342.21,
        rate: 0.0617,
        amount: 206.21,
        isAddition: false,
      },
      {
        label: 'CSG/CRDS non déductible',
        base: 3342.21,
        rate: 0.029,
        amount: 96.92,
        isAddition: false,
      },
    ],
    grossSalary: 3342.21,
    netBeforeTax: 2659.74,
    netToPay: 2562.82,
    netSocial: 2659.74,
    totalEmployeeContributions: 682.47,
    totalEmployerContributions: 1437.15,
    paymentMethod: 'Virement bancaire',
  },
};

export const testData = {
  fullTime: fullTimeEmployeeData,
  partTime: partTimeEmployeeData,
  overtime: overtimeEmployeeData
}; 