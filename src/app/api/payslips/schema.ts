// Schéma de la table bulletins de paie pour Supabase

export interface PayslipRecord {
  id: string;                   // ID unique du bulletin
  user_id: string;              // ID de l'utilisateur (lien vers auth.users)
  employee_id: string;          // ID interne de l'employé
  employee_name: string;        // Nom complet de l'employé
  month: number;                // Mois du bulletin (1-12)
  year: number;                 // Année du bulletin
  brut_total: number;           // Montant brut total
  net_total: number;            // Montant net total
  total_cotisations: number;    // Total des cotisations
  details_brut: {               // Détails du calcul du brut
    base: number;
    heureSup25: number;
    heureSup50: number;
    primes: number;
  };
  details_cotisations: {        // Détails des cotisations
    santé: number;
    retraite: number;
    chômage: number;
    autres: number;
  };
  conges_cumules: number;       // Nombre de jours de congés cumulés
  conges_pris: number;          // Nombre de jours de congés pris
  pdf_url?: string;             // URL du PDF généré
  created_at: string;           // Date de création (format ISO)
  updated_at?: string;          // Date de dernière mise à jour
  est_valide: boolean;          // Indique si le bulletin est validé
}

/**
 * Structure SQL de la table Supabase 'payslips'
 * 
 * CREATE TABLE payslips (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id UUID REFERENCES auth.users(id) NOT NULL,
 *   employee_id TEXT NOT NULL,
 *   employee_name TEXT NOT NULL,
 *   month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
 *   year INTEGER NOT NULL,
 *   brut_total DECIMAL(10, 2) NOT NULL,
 *   net_total DECIMAL(10, 2) NOT NULL,
 *   total_cotisations DECIMAL(10, 2) NOT NULL,
 *   details_brut JSONB NOT NULL,
 *   details_cotisations JSONB NOT NULL,
 *   conges_cumules DECIMAL(5, 2) NOT NULL,
 *   conges_pris DECIMAL(5, 2) NOT NULL,
 *   pdf_url TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
 *   updated_at TIMESTAMP WITH TIME ZONE,
 *   est_valide BOOLEAN DEFAULT FALSE
 * );
 * 
 * -- Index pour améliorer les performances
 * CREATE INDEX payslips_user_id_idx ON payslips(user_id);
 * CREATE INDEX payslips_employee_id_idx ON payslips(employee_id);
 * CREATE INDEX payslips_year_month_idx ON payslips(year, month);
 */ 