// Service pour gérer l'historique et le cumul des bulletins de paie

import { BrutSalaireOutput, CotisationsSalariales } from './PayrollCalculationService';

/**
 * Interface représentant un bulletin de paie mensuel
 */
export interface BulletinPaie {
  id?: string;                // Identifiant unique du bulletin
  employeeId: string;         // Identifiant de l'employé
  mois: number;               // Mois (1-12)
  annee: number;              // Année
  brutTotal: number;          // Salaire brut total
  netTotal: number;           // Salaire net total
  totalCotisations: number;   // Total des cotisations
  detailsBrut: {              // Détails du calcul du brut
    base: number;
    heureSup25: number;
    heureSup50: number;
    primes: number;
  };
  detailsCotisations: {       // Détails des cotisations
    santé: number;
    retraite: number;
    chômage: number;
    autres: number;
  };
  congesCumules: number;      // Nombre de jours de congés cumulés
  congesPris: number;         // Nombre de jours de congés pris
  dateGeneration: Date;       // Date de génération du bulletin
  estValide: boolean;         // Indique si le bulletin est validé
}

/**
 * Interface représentant le cumul annuel des données de paie
 */
export interface CumulAnnuel {
  employeeId: string;         // Identifiant de l'employé
  annee: number;              // Année concernée
  cumulBrut: number;          // Cumul des salaires bruts
  cumulNet: number;           // Cumul des salaires nets
  cumulCotisations: number;   // Cumul des cotisations
  congesCumules: number;      // Nombre total de jours de congés cumulés
  congesPris: number;         // Nombre total de jours de congés pris
  bulletins: BulletinPaie[];  // Liste des bulletins mensuels
}

/**
 * Service pour gérer l'historique des bulletins de paie et les cumuls
 */
export class PayrollHistoryService {
  /**
   * Crée un nouveau bulletin de paie
   * @param employeeId Identifiant de l'employé
   * @param mois Mois (1-12)
   * @param annee Année
   * @param brutOutput Résultat du calcul du salaire brut
   * @param cotisations Cotisations calculées
   * @param congesCumules Nombre de jours de congés cumulés pour le mois
   * @param congesPris Nombre de jours de congés pris pour le mois
   * @returns Le bulletin de paie créé
   */
  public static creerBulletin(
    employeeId: string,
    mois: number,
    annee: number,
    brutOutput: BrutSalaireOutput,
    cotisations: CotisationsSalariales,
    congesCumules: number = 2.5, // Par défaut 2.5 jours par mois (standard français)
    congesPris: number = 0
  ): BulletinPaie {
    return {
      employeeId,
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
      congesCumules,
      congesPris,
      dateGeneration: new Date(),
      estValide: false // Par défaut, le bulletin n'est pas validé
    };
  }

  /**
   * Calcule le cumul annuel pour un employé donné
   * @param bulletins Liste des bulletins de paie d'un employé pour une année
   * @returns Le cumul annuel calculé
   */
  public static calculerCumulAnnuel(bulletins: BulletinPaie[]): CumulAnnuel | null {
    if (!bulletins || bulletins.length === 0) {
      return null;
    }

    // On récupère le premier bulletin pour les informations de base
    const premierBulletin = bulletins[0];
    
    // On calcule les cumuls
    let cumulBrut = 0;
    let cumulNet = 0;
    let cumulCotisations = 0;
    let congesCumules = 0;
    let congesPris = 0;

    // Parcours de tous les bulletins pour calculer les cumuls
    bulletins.forEach(bulletin => {
      cumulBrut += bulletin.brutTotal;
      cumulNet += bulletin.netTotal;
      cumulCotisations += bulletin.totalCotisations;
      congesCumules += bulletin.congesCumules;
      congesPris += bulletin.congesPris;
    });

    return {
      employeeId: premierBulletin.employeeId,
      annee: premierBulletin.annee,
      cumulBrut,
      cumulNet,
      cumulCotisations,
      congesCumules,
      congesPris,
      bulletins: [...bulletins].sort((a, b) => a.mois - b.mois) // Tri par mois
    };
  }

  /**
   * Formate les données pour un tableau récapitulatif mensuel
   * @param bulletins Liste des bulletins de paie
   * @returns Tableau formaté pour l'affichage
   */
  public static formaterTableauMensuel(bulletins: BulletinPaie[]): Array<{
    mois: string;
    brut: number;
    net: number;
    cotisations: number;
    congesCumules: number;
    congesPris: number;
    congesRestants: number;
  }> {
    // Noms des mois en français
    const nomsMois = [
      'JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUN',
      'JUL', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC'
    ];

    // Tri des bulletins par mois
    const bulletinsTries = [...bulletins].sort((a, b) => a.mois - b.mois);
    
    // Calcul du cumul des congés au fil des mois
    let cumulCongesTotal = 0;
    
    return bulletinsTries.map(bulletin => {
      // Mise à jour du cumul des congés
      cumulCongesTotal += bulletin.congesCumules - bulletin.congesPris;
      
      // Formatage du nom du mois (ex: JAN24)
      const nomMois = `${nomsMois[bulletin.mois - 1]}${String(bulletin.annee).slice(-2)}`;
      
      return {
        mois: nomMois,
        brut: bulletin.brutTotal,
        net: bulletin.netTotal,
        cotisations: bulletin.totalCotisations,
        congesCumules: bulletin.congesCumules,
        congesPris: bulletin.congesPris,
        congesRestants: cumulCongesTotal
      };
    });
  }
} 