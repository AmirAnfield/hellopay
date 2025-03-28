// Données de test pour les bulletins de paie

import { BulletinPaie } from '@/services/payroll/PayrollHistoryService';
import { PayrollCalculationService, BrutSalaireInput, StatutSalarie } from '@/services/payroll/PayrollCalculationService';
import { EmployeeInfo, EmployerInfo } from '@/services/payroll/PayslipGeneratorService';

/**
 * Données de test pour un employeur
 */
export const employerTestData: EmployerInfo = {
  name: 'HelloPay SAS',
  address: '12 Rue de l\'Innovation, 75001 Paris',
  siret: '12345678901234',
  apeCode: '6201Z',
  urssafNumber: '217500001234'
};

/**
 * Génération d'un bulletin de paie de test complet
 */
export function generateTestPayslip(
  employeeInfo: EmployeeInfo,
  brutInput: BrutSalaireInput,
  statut: StatutSalarie,
  mois: number,
  annee: number,
  congesPris: number = 0
): BulletinPaie {
  // Calcul du salaire brut et des cotisations
  const brutOutput = PayrollCalculationService.calculerSalaireBrut(brutInput);
  const cotisations = PayrollCalculationService.calculerCotisationsSalariales(brutOutput.brutTotal, statut);
  
  // Création du bulletin
  return {
    id: `test-${statut}-${mois}-${annee}`,
    employeeId: employeeInfo.id,
    mois,
    annee,
    brutTotal: brutOutput.brutTotal,
    netTotal: cotisations.salaireNet,
    totalCotisations: cotisations.totalCotisations,
    detailsBrut: {
      base: brutOutput.details.base,
      heureSup25: brutOutput.details.heureSup25,
      heureSup50: brutOutput.details.heureSup50,
      primes: brutOutput.details.primes
    },
    detailsCotisations: {
      santé: cotisations.details.santé,
      retraite: cotisations.details.retraite,
      chômage: cotisations.details.chômage,
      autres: cotisations.details.autres
    },
    congesCumules: 2.5, // Standard: 2.5 jours par mois
    congesPris,
    dateGeneration: new Date(),
    estValide: true
  };
}

/**
 * Données de test pour un employé cadre
 */
export const cadreTestData = {
  employee: {
    id: 'EMP001',
    firstName: 'Jean',
    lastName: 'Dupont',
    position: 'Directeur Technique',
    department: 'Informatique',
    hireDate: new Date('2020-01-15'),
    socialSecurityNumber: '1750101234567'
  } as EmployeeInfo,
  
  salaryInput: {
    salaireBase: 4500,
    heuresSup25: 8,
    heuresSup50: 2,
    primes: 350
  } as BrutSalaireInput,
  
  statut: 'cadre' as StatutSalarie,
  
  // Générer le bulletin de paie
  getBulletin(mois: number = new Date().getMonth() + 1, annee: number = new Date().getFullYear(), congesPris: number = 2): BulletinPaie {
    return generateTestPayslip(
      this.employee,
      this.salaryInput,
      this.statut,
      mois,
      annee,
      congesPris
    );
  }
};

/**
 * Données de test pour un employé non-cadre
 */
export const nonCadreTestData = {
  employee: {
    id: 'EMP002',
    firstName: 'Marie',
    lastName: 'Martin',
    position: 'Développeuse Web',
    department: 'Informatique',
    hireDate: new Date('2022-04-20'),
    socialSecurityNumber: '2740201234567'
  } as EmployeeInfo,
  
  salaryInput: {
    salaireBase: 2800,
    heuresSup25: 12,
    heuresSup50: 0,
    primes: 150
  } as BrutSalaireInput,
  
  statut: 'non-cadre' as StatutSalarie,
  
  // Générer le bulletin de paie
  getBulletin(mois: number = new Date().getMonth() + 1, annee: number = new Date().getFullYear(), congesPris: number = 0): BulletinPaie {
    return generateTestPayslip(
      this.employee,
      this.salaryInput,
      this.statut,
      mois,
      annee,
      congesPris
    );
  }
};

/**
 * Données de test pour un employé à temps partiel
 */
export const tempsPartielTestData = {
  employee: {
    id: 'EMP003',
    firstName: 'Sophie',
    lastName: 'Dubois',
    position: 'Assistante Administrative',
    department: 'Administration',
    hireDate: new Date('2021-09-01'),
    socialSecurityNumber: '2850901234567'
  } as EmployeeInfo,
  
  salaryInput: {
    salaireBase: 1400, // Base pour 80% d'un temps plein
    heuresSup25: 4,
    heuresSup50: 0,
    primes: 80
  } as BrutSalaireInput,
  
  statut: 'non-cadre' as StatutSalarie,
  
  // Générer le bulletin de paie
  getBulletin(mois: number = new Date().getMonth() + 1, annee: number = new Date().getFullYear(), congesPris: number = 1): BulletinPaie {
    return generateTestPayslip(
      this.employee,
      this.salaryInput,
      this.statut,
      mois,
      annee,
      congesPris
    );
  }
};

/**
 * Ensemble des bulletins de test pour les 3 derniers mois
 */
export function generateTestPayslips(): BulletinPaie[] {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  const bulletins: BulletinPaie[] = [];
  
  // Générer 3 mois de bulletins pour chaque employé de test
  for (let i = 0; i < 3; i++) {
    // Calcul du mois et année (en remontant dans le temps)
    let month = currentMonth - i;
    let year = currentYear;
    
    // Gestion du changement d'année
    if (month <= 0) {
      month += 12;
      year -= 1;
    }
    
    // Ajouter les bulletins pour chaque profil
    bulletins.push(cadreTestData.getBulletin(month, year, i === 0 ? 2 : i === 1 ? 3 : 0));
    bulletins.push(nonCadreTestData.getBulletin(month, year, i === 0 ? 0 : i === 1 ? 2 : 1));
    bulletins.push(tempsPartielTestData.getBulletin(month, year, i === 0 ? 1 : i === 1 ? 0 : 2));
  }
  
  return bulletins;
}

/**
 * Données de test au format JSON prêtes à être stockées en base de données
 */
export const payslipTestDataJSON = generateTestPayslips().map(bulletin => ({
  id: bulletin.id,
  employee_id: bulletin.employeeId,
  month: bulletin.mois,
  year: bulletin.annee,
  brut_total: bulletin.brutTotal,
  net_total: bulletin.netTotal,
  total_cotisations: bulletin.totalCotisations,
  details_brut: bulletin.detailsBrut,
  details_cotisations: bulletin.detailsCotisations,
  conges_cumules: bulletin.congesCumules,
  conges_pris: bulletin.congesPris,
  date_generation: bulletin.dateGeneration,
  est_valide: bulletin.estValide
})); 