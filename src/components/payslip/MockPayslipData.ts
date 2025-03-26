import { 
  PayslipProps, 
  EmployeeData, 
  EmployerData, 
  SalaryData, 
  SalaryItem 
} from './PayslipTemplate';

// Données fictives d'un employé
export const mockEmployee: EmployeeData = {
  firstName: 'Marie',
  lastName: 'Dupont',
  address: '123 Avenue de la République',
  postalCode: '75011',
  city: 'Paris',
  socialSecurityNumber: '1 85 33 75 123 456 78',
  position: 'Développeur Web Senior',
  contractType: 'cdi',
  employmentDate: '01/01/2020',
};

// Données fictives d'un employeur
export const mockEmployer: EmployerData = {
  name: 'Tech Solutions SAS',
  address: '45 Rue de l\'Innovation',
  postalCode: '75008',
  city: 'Paris',
  siret: '123 456 789 00012',
  ape: '6201Z',
};

// Éléments de salaire fictifs
const salaryItems: SalaryItem[] = [
  {
    label: 'Salaire de base',
    base: 151.67,
    rate: 30,
    amount: 4550,
    isAddition: true,
  },
  {
    label: 'Prime d\'ancienneté',
    amount: 150,
    isAddition: true,
  },
  {
    label: 'Prime exceptionnelle',
    amount: 300,
    isAddition: true,
  },
  {
    label: 'Sécurité Sociale - Maladie',
    base: 5000,
    rate: 0.0075,
    amount: 37.5,
    isAddition: false,
  },
  {
    label: 'Sécurité Sociale - Vieillesse plafonnée',
    base: 3428,
    rate: 0.0690,
    amount: 236.53,
    isAddition: false,
  },
  {
    label: 'Sécurité Sociale - Vieillesse déplafonnée',
    base: 5000,
    rate: 0.0040,
    amount: 20,
    isAddition: false,
  },
  {
    label: 'Retraite complémentaire',
    base: 5000,
    rate: 0.0380,
    amount: 190,
    isAddition: false,
  },
  {
    label: 'Assurance chômage',
    base: 5000,
    rate: 0.024,
    amount: 120,
    isAddition: false,
  },
  {
    label: 'CSG déductible',
    base: 5000,
    rate: 0.0617,
    amount: 308.5,
    isAddition: false,
  },
  {
    label: 'CSG/CRDS non déductible',
    base: 5000,
    rate: 0.029,
    amount: 145,
    isAddition: false,
  },
];

// Données fictives du salaire
export const mockSalary: SalaryData = {
  period: 'Mai 2023',
  periodStart: '01/05/2023',
  periodEnd: '31/05/2023',
  paymentDate: '28/05/2023',
  items: salaryItems,
  grossSalary: 5000,
  netBeforeTax: 3942.47,
  netToPay: 3797.47,
  netSocial: 3942.47,
  totalEmployeeContributions: 1057.53,
  totalEmployerContributions: 2250,
  paymentMethod: 'Virement bancaire',
};

// Données complètes pour le composant de fiche de paie
export const mockPayslipData: PayslipProps = {
  employee: mockEmployee,
  employer: mockEmployer,
  salary: mockSalary,
};

export default mockPayslipData; 