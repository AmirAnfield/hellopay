// Service pour la génération des contrats de travail

export type ContractType = 'CDI' | 'CDD' | 'TempsPartiel' | 'TempsComplet';

export interface ContractData {
  // Informations employeur
  employerName: string;
  employerAddress: string;
  employerSiret: string;
  employerUrssaf: string;
  
  // Informations salarié
  employeeName: string;
  employeeAddress: string;
  employeePosition: string;
  employeeSocialSecurityNumber: string;
  
  // Informations contrat
  contractType: ContractType;
  startDate: Date;
  endDate?: Date; // Uniquement pour CDD
  trialPeriod?: number; // Période d'essai en jours
  salary: number; // Salaire brut mensuel
  workingHours?: number; // Heures de travail hebdomadaires
  jobDescription: string; // Description du poste
  collectiveAgreement?: string; // Convention collective
}

export class ContractService {
  /**
   * Génère le contenu HTML d'un contrat de travail
   */
  public static generateContractHTML(data: ContractData): string {
    // Récupération des mentions légales et clauses spécifiques au type de contrat
    const clauses = this.getContractClauses(data.contractType);
    
    // Formatage des valeurs
    const formattedSalary = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(data.salary);
    
    const formattedStartDate = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(data.startDate);
    
    const formattedEndDate = data.endDate
      ? new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(data.endDate)
      : 'indéterminée';
    
    // Construction du contenu HTML
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.5;
              margin: 0;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .title {
              font-size: 18pt;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 14pt;
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-weight: bold;
              text-decoration: underline;
              margin-bottom: 10px;
            }
            .article {
              margin-bottom: 15px;
            }
            .article-title {
              font-weight: bold;
            }
            .signatures {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .signature {
              width: 45%;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">CONTRAT DE TRAVAIL</div>
            <div class="subtitle">${this.getContractTypeLabel(data.contractType)}</div>
          </div>

          <div class="section">
            <p>ENTRE LES SOUSSIGNÉS :</p>
            <p>
              <strong>${data.employerName}</strong>, dont le siège social est situé ${data.employerAddress},
              immatriculé sous le numéro SIRET ${data.employerSiret},
              représenté par son représentant légal,<br>
              Ci-après dénommé "l'Employeur",
            </p>
            <p>D'UNE PART,</p>
            <p>ET</p>
            <p>
              <strong>${data.employeeName}</strong>, demeurant ${data.employeeAddress},
              Numéro de sécurité sociale : ${data.employeeSocialSecurityNumber},<br>
              Ci-après dénommé(e) "le Salarié",
            </p>
            <p>D'AUTRE PART,</p>
            <p>IL A ÉTÉ CONVENU CE QUI SUIT :</p>
          </div>

          <div class="article">
            <div class="article-title">Article 1 - Engagement</div>
            <p>
              Le Salarié est engagé par l'Employeur à compter du ${formattedStartDate}
              ${data.endDate ? `jusqu'au ${formattedEndDate}` : 'pour une durée indéterminée'}.
            </p>
            ${data.trialPeriod
              ? `
                <p>
                  Le Salarié sera soumis à une période d'essai de ${data.trialPeriod} jours, 
                  pendant laquelle chacune des parties pourra rompre le contrat sans préavis ni indemnité.
                </p>
              `
              : ''
            }
          </div>

          <div class="article">
            <div class="article-title">Article 2 - Fonctions</div>
            <p>
              Le Salarié est engagé en qualité de ${data.employeePosition}.
            </p>
            <p>
              À ce titre, il sera notamment chargé de : ${data.jobDescription}.
            </p>
            <p>
              Cette liste de tâches n'est pas exhaustive et pourra être modifiée selon les besoins de l'entreprise.
            </p>
          </div>

          <div class="article">
            <div class="article-title">Article 3 - Rémunération</div>
            <p>
              En contrepartie de son travail, le Salarié percevra une rémunération mensuelle brute de ${formattedSalary}.
            </p>
            <p>
              Cette rémunération lui sera versée mensuellement, au plus tard le dernier jour ouvré de chaque mois.
            </p>
          </div>

          <div class="article">
            <div class="article-title">Article 4 - Durée du travail</div>
            ${data.workingHours
              ? `
                <p>
                  Le Salarié exercera ses fonctions sur la base de ${data.workingHours} heures par semaine.
                </p>
              `
              : `
                <p>
                  Le Salarié exercera ses fonctions sur la base de la durée légale du travail de 35 heures par semaine.
                </p>
              `
            }
          </div>

          ${clauses.map(clause => `
            <div class="article">
              <div class="article-title">${clause.title}</div>
              <p>${clause.content}</p>
            </div>
          `).join('')}

          <div class="article">
            <div class="article-title">Article ${5 + clauses.length} - Convention collective</div>
            <p>
              ${data.collectiveAgreement
                ? `Le présent contrat est soumis aux dispositions de la convention collective ${data.collectiveAgreement}.`
                : 'Le présent contrat est soumis aux dispositions du Code du travail.'
              }
            </p>
          </div>

          <div class="signatures">
            <div class="signature">
              <p>Fait à _____________, le _____________</p>
              <p>L'Employeur<br>(signature précédée de la mention "Lu et approuvé")</p>
            </div>
            <div class="signature">
              <p>Fait à _____________, le _____________</p>
              <p>Le Salarié<br>(signature précédée de la mention "Lu et approuvé")</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Récupère les clauses spécifiques à un type de contrat
   */
  private static getContractClauses(contractType: ContractType): Array<{ title: string; content: string }> {
    const commonClauses = [
      {
        title: 'Article 5 - Lieu de travail',
        content: 'Le Salarié exercera ses fonctions au siège social de l\'entreprise. Toutefois, compte tenu de ses fonctions et de la nature de ses activités, il pourra être amené à se déplacer régulièrement en France et à l\'étranger.'
      },
      {
        title: 'Article 6 - Congés payés',
        content: 'Le Salarié bénéficiera des congés payés légaux, soit 2,5 jours ouvrables par mois de travail effectif, conformément aux dispositions légales et conventionnelles en vigueur.'
      }
    ];
    
    const specificClauses: Record<ContractType, Array<{ title: string; content: string }>> = {
      'CDI': [
        {
          title: 'Article 7 - Préavis',
          content: 'En cas de rupture du contrat de travail, un préavis sera applicable conformément aux dispositions légales et conventionnelles en vigueur, sauf en cas de faute grave ou lourde.'
        }
      ],
      'CDD': [
        {
          title: 'Article 7 - Indemnité de fin de contrat',
          content: 'À l\'issue du contrat, le Salarié percevra une indemnité de fin de contrat égale à 10% de la rémunération brute totale perçue durant le contrat, sauf dans les cas d\'exclusion prévus par la loi.'
        },
        {
          title: 'Article 8 - Rupture anticipée',
          content: 'Le présent contrat ne pourra être rompu avant l\'échéance du terme qu\'en cas de faute grave, de force majeure ou d\'accord entre les parties.'
        }
      ],
      'TempsPartiel': [
        {
          title: 'Article 7 - Répartition des horaires',
          content: 'Les horaires de travail seront répartis du lundi au vendredi selon un planning qui sera communiqué au Salarié avec un délai de prévenance de 7 jours. Les heures complémentaires pourront être effectuées dans la limite de 10% de la durée hebdomadaire ou mensuelle de travail prévue au contrat.'
        }
      ],
      'TempsComplet': []
    };
    
    return [...commonClauses, ...specificClauses[contractType]];
  }

  /**
   * Récupère le libellé d'un type de contrat
   */
  private static getContractTypeLabel(contractType: ContractType): string {
    const labels: Record<ContractType, string> = {
      'CDI': 'CONTRAT À DURÉE INDÉTERMINÉE',
      'CDD': 'CONTRAT À DURÉE DÉTERMINÉE',
      'TempsPartiel': 'CONTRAT À TEMPS PARTIEL',
      'TempsComplet': 'CONTRAT À TEMPS COMPLET'
    };
    
    return labels[contractType];
  }
} 