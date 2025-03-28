// Service pour le calcul de la paie

/**
 * Interface pour les paramètres d'entrée du calcul du salaire brut
 */
export interface BrutSalaireInput {
  salaireBase: number;          // salaire mensuel de base
  heuresSup25: number;          // nb heures sup à 125%
  heuresSup50: number;          // nb heures sup à 150%
  primes: number;               // primes diverses (montant)
}

/**
 * Interface pour le résultat du calcul du salaire brut
 */
export interface BrutSalaireOutput {
  brutTotal: number;
  details: {
    base: number;
    heureSup25: number;
    heureSup50: number;
    primes: number;
  }
}

/**
 * Interface pour les cotisations salariales
 */
export interface CotisationsSalariales {
  totalCotisations: number;
  salaireBrut: number;
  salaireNet: number;
  details: {
    santé: number;
    retraite: number;
    chômage: number;
    autres: number;
  }
}

/**
 * Définit le statut du salarié
 */
export type StatutSalarie = 'cadre' | 'non-cadre';

/**
 * Service de calcul de la paie
 */
export class PayrollCalculationService {
  
  /**
   * Constante définissant le nombre d'heures de travail mensuel standard (35h/semaine)
   * 35 heures × 52 semaines / 12 mois = 151.67 heures par mois
   */
  private static readonly HEURES_MENSUELLES_STANDARD = 151.67;
  
  /**
   * Plafond de la Sécurité Sociale (2024)
   */
  private static readonly PLAFOND_SECURITE_SOCIALE = 3867;
  
  /**
   * Taux de cotisations par catégorie pour un non-cadre
   */
  private static readonly TAUX_COTISATIONS_NON_CADRE = {
    santé: 0.07,             // 7% pour la santé
    retraite: 0.115,         // 11.5% pour la retraite
    chômage: 0,              // 0% pour le chômage (pris en charge par l'employeur)
    autres: 0.097            // 9.7% pour CSG/CRDS et autres
  };
  
  /**
   * Taux de cotisations par catégorie pour un cadre
   */
  private static readonly TAUX_COTISATIONS_CADRE = {
    santé: 0.07,             // 7% pour la santé
    retraite: 0.125,         // 12.5% pour la retraite (taux plus élevé)
    chômage: 0,              // 0% pour le chômage (pris en charge par l'employeur)
    autres: 0.097            // 9.7% pour CSG/CRDS et autres
  };
  
  /**
   * Calcule le salaire brut mensuel total
   * @param input Paramètres d'entrée pour le calcul
   * @returns Le salaire brut total et les détails de calcul
   */
  public static calculerSalaireBrut(input: BrutSalaireInput): BrutSalaireOutput {
    // Calcul du taux horaire de base
    const tauxHoraire = input.salaireBase / this.HEURES_MENSUELLES_STANDARD;
    
    // Calcul des montants pour les heures supplémentaires
    const montantHeuresSup25 = this.arrondir(tauxHoraire * 1.25 * input.heuresSup25);
    const montantHeuresSup50 = this.arrondir(tauxHoraire * 1.5 * input.heuresSup50);
    
    // Calcul du brut total
    const brutTotal = this.arrondir(input.salaireBase + montantHeuresSup25 + montantHeuresSup50 + input.primes);
    
    // Construction de l'objet résultat
    return {
      brutTotal,
      details: {
        base: input.salaireBase,
        heureSup25: montantHeuresSup25,
        heureSup50: montantHeuresSup50,
        primes: input.primes
      }
    };
  }
  
  /**
   * Calcule les cotisations salariales à partir du salaire brut
   * @param salaireBrut Le salaire brut mensuel
   * @param statut Le statut du salarié (cadre ou non-cadre)
   * @returns Les cotisations salariales et le salaire net
   */
  public static calculerCotisationsSalariales(salaireBrut: number, statut: StatutSalarie = 'non-cadre'): CotisationsSalariales {
    // Sélection des taux de cotisation selon le statut
    const taux = statut === 'cadre' ? this.TAUX_COTISATIONS_CADRE : this.TAUX_COTISATIONS_NON_CADRE;
    
    // Calcul des cotisations par catégorie
    const cotisationSante = this.arrondir(salaireBrut * taux.santé);
    
    // Pour la retraite, on prend en compte le plafond de la sécurité sociale
    let cotisationRetraite: number;
    if (statut === 'cadre' && salaireBrut > this.PLAFOND_SECURITE_SOCIALE) {
      // Pour les cadres, certaines cotisations sont plafonnées
      const tauxRetraitePlafonne = 0.069; // 6.9% pour la partie plafonnée
      const tauxRetraiteNonPlafonne = taux.retraite - tauxRetraitePlafonne; // Différence pour la partie non plafonnée
      
      const cotisationRetraitePlafonnee = this.arrondir(this.PLAFOND_SECURITE_SOCIALE * tauxRetraitePlafonne);
      const cotisationRetraiteNonPlafonnee = this.arrondir(salaireBrut * tauxRetraiteNonPlafonne);
      
      cotisationRetraite = cotisationRetraitePlafonnee + cotisationRetraiteNonPlafonnee;
    } else {
      cotisationRetraite = this.arrondir(salaireBrut * taux.retraite);
    }
    
    const cotisationChomage = this.arrondir(salaireBrut * taux.chômage);
    const cotisationAutres = this.arrondir(salaireBrut * taux.autres);
    
    // Calcul du total des cotisations
    const totalCotisations = this.arrondir(cotisationSante + cotisationRetraite + cotisationChomage + cotisationAutres);
    
    // Calcul du salaire net
    const salaireNet = this.arrondir(salaireBrut - totalCotisations);
    
    return {
      totalCotisations,
      salaireBrut,
      salaireNet,
      details: {
        santé: cotisationSante,
        retraite: cotisationRetraite,
        chômage: cotisationChomage,
        autres: cotisationAutres
      }
    };
  }
  
  /**
   * Calcule le salaire net mensuel complet (brut → cotisations → net)
   * @param input Paramètres d'entrée pour le calcul du brut
   * @param statut Le statut du salarié (cadre ou non-cadre)
   * @returns Le détail complet du calcul, du brut au net
   */
  public static calculerSalaireNet(input: BrutSalaireInput, statut: StatutSalarie = 'non-cadre'): {
    brut: BrutSalaireOutput;
    cotisations: CotisationsSalariales;
  } {
    // Calcul du salaire brut
    const brut = this.calculerSalaireBrut(input);
    
    // Calcul des cotisations et du net
    const cotisations = this.calculerCotisationsSalariales(brut.brutTotal, statut);
    
    return {
      brut,
      cotisations
    };
  }
  
  /**
   * Arrondit un nombre à 2 décimales
   * @param value Valeur à arrondir
   * @returns Valeur arrondie à 2 décimales
   */
  private static arrondir(value: number): number {
    return Math.round(value * 100) / 100;
  }
} 