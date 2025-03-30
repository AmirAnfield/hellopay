"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Calculator, Database, Code as CodeIcon } from "lucide-react";
import {
  PageContainer,
  PageHeader
} from "@/components/shared/PageContainer";

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState("introduction");

  return (
    <PageContainer>
      <PageHeader
        title="Guide de la paie"
        description="Comprendre les principes et mécanismes du calcul des bulletins de paie en France"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="md:col-span-1 overflow-x-auto">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Chapitres</CardTitle>
            <CardDescription>Navigation du guide</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <nav className="space-y-2 min-w-[200px]">
              <button 
                onClick={() => setActiveTab("introduction")}
                className={`w-full text-left p-2 rounded-md flex items-center gap-2 ${
                  activeTab === "introduction" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <Book className="h-4 w-4 flex-shrink-0" />
                <span>Introduction</span>
              </button>
              <button 
                onClick={() => setActiveTab("rubriques")}
                className={`w-full text-left p-2 rounded-md flex items-center gap-2 ${
                  activeTab === "rubriques" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <Calculator className="h-4 w-4 flex-shrink-0" />
                <span>Rubriques du bulletin</span>
              </button>
              <button 
                onClick={() => setActiveTab("calcul")}
                className={`w-full text-left p-2 rounded-md flex items-center gap-2 ${
                  activeTab === "calcul" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <Calculator className="h-4 w-4 flex-shrink-0" />
                <span>Calcul du bulletin</span>
              </button>
              <button 
                onClick={() => setActiveTab("algorithme")}
                className={`w-full text-left p-2 rounded-md flex items-center gap-2 ${
                  activeTab === "algorithme" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <CodeIcon className="h-4 w-4 flex-shrink-0" />
                <span>Logique algorithmique</span>
              </button>
              <button 
                onClick={() => setActiveTab("database")}
                className={`w-full text-left p-2 rounded-md flex items-center gap-2 ${
                  activeTab === "database" 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
              >
                <Database className="h-4 w-4 flex-shrink-0" />
                <span>Modèle de base de données</span>
              </button>
            </nav>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3 overflow-hidden">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>
              {activeTab === "introduction" && "Guide de la paie en France"}
              {activeTab === "rubriques" && "Rubriques du bulletin de paie"}
              {activeTab === "calcul" && "Calcul du bulletin de paie"}
              {activeTab === "algorithme" && "Logique algorithmique"}
              {activeTab === "database" && "Modèle de base de données"}
            </CardTitle>
            <CardDescription>
              {activeTab === "introduction" && "Comprendre les fondamentaux du bulletin de paie"}
              {activeTab === "rubriques" && "Détail des composants d'un bulletin de paie"}
              {activeTab === "calcul" && "Méthode de calcul du brut au net"}
              {activeTab === "algorithme" && "Étapes de génération automatisée"}
              {activeTab === "database" && "Structure recommandée pour le stockage des données"}
            </CardDescription>
          </CardHeader>
          <CardContent className="prose max-w-none prose-headings:mb-4 prose-headings:mt-6 prose-p:mt-3 prose-p:leading-7 px-4 sm:px-6 pb-6 overflow-x-auto">
            {activeTab === "introduction" && (
              <>
                <h2>Introduction au bulletin de paie</h2>
                <p>Le bulletin de paie est un document obligatoire qui doit être remis à chaque salarié lors du versement de sa rémunération. Il a pour objet de détailler les différents éléments composant la rémunération du salarié et de justifier le paiement du salaire.</p>
                
                <h3>Importance juridique</h3>
                <p>Le bulletin de paie constitue une preuve de l'existence et de la réalité de la relation de travail, ainsi que du versement du salaire. Il est également utile pour le salarié afin de justifier de ses droits (chômage, retraite, maladie...).</p>
                
                <h3>Mentions obligatoires</h3>
                <p>Plusieurs mentions sont obligatoires sur un bulletin de paie :</p>
                <ul className="pl-5 sm:pl-6">
                  <li>Identification de l'employeur (nom, adresse, numéro SIRET, code APE)</li>
                  <li>Identification du salarié (nom, emploi, position, niveau, échelon, coefficient)</li>
                  <li>Période et nombre d'heures de travail</li>
                  <li>Salaire brut</li>
                  <li>Nature et montant des cotisations patronales et salariales</li>
                  <li>Avantages en nature et frais professionnels</li>
                  <li>Net à payer avant impôt sur le revenu</li>
                  <li>Montant de l'impôt sur le revenu prélevé à la source</li>
                  <li>Montant net payé</li>
                </ul>
                
                <h3>Bulletin simplifié</h3>
                <p>Depuis 2018, un modèle de bulletin simplifié est entré en vigueur, regroupant les cotisations par risque couvert (santé, accidents du travail, retraite, assurance chômage, etc.).</p>
              </>
            )}

            {activeTab === "rubriques" && (
              <>
                <h2>Rubriques du bulletin de paie</h2>
                <p>Un bulletin de paie est composé de plusieurs sections principales :</p>
                
                <h3>Informations d'identification</h3>
                <ul className="pl-5 sm:pl-6">
                  <li><strong>Employeur</strong> : Raison sociale, adresse, SIRET, code APE/NAF</li>
                  <li><strong>Salarié</strong> : Nom, prénom, adresse, numéro de sécurité sociale</li>
                  <li><strong>Emploi</strong> : Poste, classification, coefficient, date d'embauche</li>
                </ul>
                
                <h3>Rémunération brute</h3>
                <ul className="pl-5 sm:pl-6">
                  <li><strong>Salaire de base</strong> : Calculé selon le taux horaire et le nombre d'heures travaillées</li>
                  <li><strong>Heures supplémentaires</strong> : Majorées de 25% ou 50% selon le cas</li>
                  <li><strong>Primes et indemnités</strong> : Prime d'ancienneté, 13ème mois, etc.</li>
                  <li><strong>Avantages en nature</strong> : Voiture, logement, nourriture...</li>
                </ul>
                
                <h3>Cotisations sociales</h3>
                <ul className="pl-5 sm:pl-6">
                  <li><strong>Cotisations salariales</strong> : Prélevées sur le salaire brut</li>
                  <li><strong>Cotisations patronales</strong> : À la charge de l'employeur</li>
                  <li><strong>CSG/CRDS</strong> : Contribution sociale généralisée et contribution au remboursement de la dette sociale</li>
                </ul>
                
                <h3>Éléments nets</h3>
                <ul className="pl-5 sm:pl-6">
                  <li><strong>Net imposable</strong> : Base de calcul pour l'impôt sur le revenu</li>
                  <li><strong>Prélèvement à la source</strong> : Impôt sur le revenu prélevé directement sur le salaire</li>
                  <li><strong>Net à payer</strong> : Montant final versé au salarié</li>
                </ul>
                
                <h3>Cumuls et informations complémentaires</h3>
                <ul className="pl-5 sm:pl-6">
                  <li><strong>Cumuls annuels</strong> : Totaux des salaires, cotisations depuis le début de l'année</li>
                  <li><strong>Congés payés</strong> : Solde des congés acquis et pris</li>
                  <li><strong>Allègements</strong> : Réduction Fillon, etc.</li>
                  <li><strong>Coût total employeur</strong> : Salaire brut + charges patronales</li>
                </ul>
              </>
            )}

            {activeTab === "calcul" && (
              <>
                <h2>Calcul du bulletin de paie : du brut au net</h2>
                <p>Le processus de calcul d'un bulletin de paie suit plusieurs étapes précises :</p>
                
                <h3>1. Détermination du salaire brut</h3>
                <p>Le salaire brut est calculé en fonction de la rémunération de base, à laquelle s'ajoutent différents éléments :</p>
                <ul className="pl-5 sm:pl-6">
                  <li><strong>Salaire de base</strong> : Taux horaire × nombre d'heures travaillées</li>
                  <li><strong>Heures supplémentaires</strong> : Avec majoration selon la législation</li>
                  <li><strong>Primes et indemnités</strong> : Prime d'ancienneté, de rendement, etc.</li>
                  <li><strong>Avantages en nature</strong> : Évalués selon des forfaits ou valeurs réelles</li>
                </ul>
                
                <h3>2. Calcul des cotisations sociales salariales</h3>
                <p>Les cotisations sont prélevées sur le salaire brut, avec des taux variables selon la nature de la cotisation :</p>
                <ul className="pl-5 sm:pl-6">
                  <li><strong>Assurance maladie</strong> : 0% pour les salaires ≤ 2,5 SMIC</li>
                  <li><strong>Retraite de base</strong> : 6,90% sur le salaire dans la limite du PMSS</li>
                  <li><strong>Retraite complémentaire</strong> : 3,15% sur tranche 1, 8,64% sur tranche 2</li>
                  <li><strong>Assurance chômage</strong> : 0,86% jusqu'à 4 PMSS</li>
                  <li><strong>CSG déductible</strong> : 6,80% sur 98,25% du salaire brut</li>
                  <li><strong>CSG/CRDS non déductible</strong> : 2,90% sur 98,25% du salaire brut</li>
                </ul>
                
                <h3>3. Détermination du net imposable</h3>
                <p>Le net imposable est obtenu par la formule :</p>
                <pre className="overflow-x-auto text-sm p-2">Net imposable = Salaire brut - Cotisations salariales (hors CSG/CRDS non déductible)</pre>
                
                <h3>4. Calcul du net à payer avant impôt</h3>
                <p>Le net à payer avant impôt correspond à :</p>
                <pre className="overflow-x-auto text-sm p-2">Net à payer avant impôt = Salaire brut - Toutes les cotisations salariales</pre>
                
                <h3>5. Prélèvement à la source</h3>
                <p>L'impôt sur le revenu est prélevé directement sur le salaire selon le taux transmis par l'administration fiscale :</p>
                <pre className="overflow-x-auto text-sm p-2">Montant prélevé = Net imposable × Taux personnalisé</pre>
                
                <h3>6. Calcul du net à payer</h3>
                <p>Le montant final versé au salarié est :</p>
                <pre className="overflow-x-auto text-sm p-2">Net à payer = Net à payer avant impôt - Prélèvement à la source + Remboursements de frais éventuels</pre>
              </>
            )}

            {activeTab === "algorithme" && (
              <>
                <h2>Logique algorithmique de la paie</h2>
                <p>La génération automatique d'un bulletin de paie suit un processus algorithmique précis :</p>
                
                <h3>1. Collecte des données d'entrée</h3>
                <ul className="pl-5 sm:pl-6">
                  <li>Informations du salarié (identité, poste, taux horaire, etc.)</li>
                  <li>Informations de l'employeur (raison sociale, SIRET, etc.)</li>
                  <li>Période de paie (dates de début et fin)</li>
                  <li>Paramètres légaux en vigueur (SMIC, plafond de sécurité sociale, etc.)</li>
                  <li>Taux de cotisations applicables</li>
                  <li>Éléments variables (heures travaillées, absences, primes, etc.)</li>
                </ul>
                
                <h3>2. Calcul des éléments de rémunération</h3>
                <pre className="overflow-x-auto text-sm p-2 whitespace-pre-wrap md:whitespace-pre">
{`// Calcul du salaire de base
salaire_base = taux_horaire * heures_travaillees;

// Calcul des heures supplémentaires
if (heures_sup_25 > 0) {
  montant_heures_sup_25 = heures_sup_25 * taux_horaire * 1.25;
}

if (heures_sup_50 > 0) {
  montant_heures_sup_50 = heures_sup_50 * taux_horaire * 1.50;
}

// Calcul des primes
total_primes = somme(primes);

// Calcul du salaire brut
salaire_brut = salaire_base + montant_heures_sup_25 + montant_heures_sup_50 + total_primes + avantages_nature;`}
                </pre>
                
                <h3>3. Calcul des cotisations sociales</h3>
                <pre className="overflow-x-auto text-sm p-2 whitespace-pre-wrap md:whitespace-pre">
{`// Base CSG/CRDS
base_csg_crds = salaire_brut * 0.9825;

// Plafond mensuel de sécurité sociale (PMSS)
plafond_ss = 3428; // Valeur 2023

// Calcul par types de cotisations
for (cotisation of liste_cotisations) {
  switch(cotisation.base) {
    case "TOTAL":
      base = salaire_brut;
      break;
    case "PLAFONNEE":
      base = min(salaire_brut, plafond_ss);
      break;
    case "TRANCHE_1":
      base = min(salaire_brut, plafond_ss);
      break;
    case "TRANCHE_2":
      base = max(0, min(salaire_brut, plafond_ss * 8) - plafond_ss);
      break;
    case "CSG_CRDS":
      base = base_csg_crds;
      break;
  }
  
  // Calcul montant cotisation
  cotisation.montant_salarial = base * (cotisation.taux_salarial / 100);
  cotisation.montant_patronal = base * (cotisation.taux_patronal / 100);
}`}
                </pre>
                
                <h3>4. Détermination des montants finaux</h3>
                <pre className="overflow-x-auto text-sm p-2 whitespace-pre-wrap md:whitespace-pre">
{`// Total des cotisations salariales
total_cotisations_salariales = somme(cotisations.montant_salarial);

// Total des cotisations patronales
total_cotisations_patronales = somme(cotisations.montant_patronal);

// Net imposable et net à payer
net_imposable = salaire_brut - (total_cotisations_salariales - csg_crds_non_deductible);
net_avant_impot = salaire_brut - total_cotisations_salariales;
impot_preleve = net_imposable * taux_prelevement_source;
net_a_payer = net_avant_impot - impot_preleve;

// Coût total employeur
cout_employeur = salaire_brut + total_cotisations_patronales;`}
                </pre>
                
                <h3>5. Génération du document</h3>
                <p>Une fois tous les calculs effectués, l'algorithme génère le bulletin de paie au format souhaité (HTML, PDF, etc.) en respectant la présentation légale requise.</p>
              </>
            )}

            {activeTab === "database" && (
              <>
                <h2>Modèle de base de données pour la gestion de paie</h2>
                <p>Une structure de base de données efficace pour un système de paie devrait comprendre les tables suivantes :</p>
                
                <h3>1. Table des utilisateurs (Users)</h3>
                <pre className="overflow-x-auto text-sm p-2 whitespace-pre-wrap md:whitespace-pre">
Users
├── id (Primary Key, UUID)
├── email (Unique)
├── name
├── role (admin, employer, employee)
├── password_hash
├── created_at
└── updated_at</pre>
                
                <h3>2. Table des entreprises (Companies)</h3>
                <pre className="overflow-x-auto text-sm p-2 whitespace-pre-wrap md:whitespace-pre">
Companies
├── id (Primary Key, UUID)
├── user_id (Foreign Key → Users)
├── name
├── siret (Unique, 14 digits)
├── ape_code
├── urssaf_number
├── address
├── postal_code
├── city
├── country
├── phone
├── email
└── logo_url</pre>
                
                <h3>3. Table des employés (Employees)</h3>
                <pre className="overflow-x-auto text-sm p-2 whitespace-pre-wrap md:whitespace-pre">
Employees
├── id (Primary Key, UUID)
├── company_id (Foreign Key → Companies)
├── first_name
├── last_name
├── birth_date
├── social_security_number (15 digits)
├── address
├── postal_code
├── city
├── country
├── phone
├── email
├── position
├── department
├── employment_start_date
├── employment_end_date (nullable)
├── contract_type (CDI, CDD, etc.)
├── hourly_rate
├── is_executive
└── working_hours_per_week</pre>
                
                <h3>4. Table des bulletins de paie (Payslips)</h3>
                <pre className="overflow-x-auto text-sm p-2 whitespace-pre-wrap md:whitespace-pre">
Payslips
├── id (Primary Key, UUID)
├── employee_id (Foreign Key → Employees)
├── company_id (Foreign Key → Companies)
├── period_start (Date)
├── period_end (Date)
├── payment_date (Date)
├── fiscal_year (Integer)
├── hours_worked (Decimal)
├── extra_hours_125 (Decimal)
├── extra_hours_150 (Decimal)
├── gross_salary (Decimal)
├── net_before_tax (Decimal)
├── net_salary (Decimal)
├── employer_cost (Decimal)
├── employee_contributions (Decimal)
├── employer_contributions (Decimal)
├── tax_amount (Decimal)
├── paid_leave_acquired (Decimal)
├── paid_leave_taken (Decimal)
├── paid_leave_remaining (Decimal)
├── cumulative_gross_ytd (Decimal)
├── cumulative_net_ytd (Decimal)
├── pdf_url
├── status (draft, final)
├── created_at
└── updated_at</pre>
                
                <h3>5. Table des contributions (Contributions)</h3>
                <pre className="overflow-x-auto text-sm p-2 whitespace-pre-wrap md:whitespace-pre">
Contributions
├── id (Primary Key, UUID)
├── payslip_id (Foreign Key → Payslips)
├── category (security_social, retirement, unemployment, etc.)
├── label
├── base_type (total, plafond, tranche_a, tranche_b, etc.)
├── base_amount (Decimal)
├── employer_rate (Decimal)
├── employee_rate (Decimal)
├── employer_amount (Decimal)
└── employee_amount (Decimal)</pre>
                
                <h3>6. Table des paramètres de paie (PayrollParameters)</h3>
                <pre className="overflow-x-auto text-sm p-2 whitespace-pre-wrap md:whitespace-pre">
PayrollParameters
├── id (Primary Key, UUID)
├── effective_date (Date)
├── end_date (Date, nullable)
├── smic_hourly (Decimal)
├── social_security_ceiling (Decimal)
├── working_hours_per_month (Decimal)
└── is_current (Boolean)</pre>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
} 