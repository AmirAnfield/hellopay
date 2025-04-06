import { ContractData } from './contractLoadService';
import { ContractConfig } from '@/types/contract';

/**
 * Génère le HTML pour le contrat complet
 */
function generateContractHTML(contractData: ContractData): string {
  const { config, article1, article2, article3, article4, article5, article6, article7, article8,
    article9, article10, article11, article12, article13, article14 } = contractData;

  const companyName = config.company?.name || '[NOM DE L\'ENTREPRISE]';
  const employeeName = config.employee?.fullName || '[NOM DE L\'EMPLOYÉ]';
  
  // Formatter les données
  const contractType = config.contractType === 'CDI' ? 'à Durée Indéterminée' : 'à Durée Déterminée';
  const workingHours = config.workingHours || 35;
  const isPartTime = workingHours < 35;
  
  // Générer le code HTML du contrat
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contrat de travail - ${employeeName}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        h1 {
          font-size: 18px;
          text-align: center;
          margin-bottom: 20px;
          text-transform: uppercase;
        }
        h2 {
          font-size: 14px;
          margin-top: 20px;
          margin-bottom: 10px;
          text-transform: uppercase;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .preambule {
          font-style: italic;
          margin-bottom: 20px;
        }
        .section {
          margin-bottom: 15px;
        }
        .signature {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }
        .signature-block {
          width: 45%;
        }
        .page-break {
          page-break-after: always;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <h1>Contrat de travail ${contractType}</h1>
      
      ${config.hasPreambule ? `
      <div class="preambule">
        <p>Entre les soussignés :</p>
        <p><strong>${companyName}</strong>, ${config.company?.address || ''} ${config.company?.city || ''}, représentée par ${config.company?.representative || 'son représentant légal'},</p>
        <p>Ci-après dénommée "l'Employeur",</p>
        <p>D'une part,</p>
        <p>ET</p>
        <p><strong>${employeeName}</strong>, demeurant ${config.employee?.address || ''} ${config.employee?.city || ''},</p>
        <p>Ci-après dénommé(e) "le Salarié",</p>
        <p>D'autre part,</p>
        <p>Il a été convenu ce qui suit :</p>
      </div>
      ` : ''}
      
      ${article1 ? `
      <div class="section">
        <h2>Article 1 – Nature du contrat</h2>
        <p>
          ${config.contractType === 'CDI' 
            ? `Le présent contrat est conclu pour une durée indéterminée, conformément aux dispositions de l'article L.1221-1 du Code du travail. Il prendra effet à compter du ${article1.startDate || '___'}.`
            : `Le présent contrat est conclu pour une durée déterminée, en application des articles L.1242-1 et suivants du Code du travail, pour le motif suivant : ${article1.reason || '___'}. Il débutera le ${article1.startDate || '___'} et prendra fin le ${article1.endDate || '___'}.`
          }
        </p>
        ${article1.trialPeriod ? `
        <p>Une période d'essai de ${article1.trialPeriodDuration || '___'} mois est prévue, durant laquelle chacune des parties pourra rompre le contrat sans indemnité.</p>
        ` : ''}
      </div>
      ` : ''}
      
      ${article2 ? `
      <div class="section">
        <h2>Article 2 – Date d'entrée en fonction</h2>
        <p>Le Salarié prendra ses fonctions à compter du ${article2.entryDate || '___'}, date qui marque le début effectif de la relation de travail.</p>
      </div>
      ` : ''}
      
      ${article3 ? `
      <div class="section">
        <h2>Article 3 – Fonctions</h2>
        <p>Le Salarié est engagé en qualité de ${article3.position || '___'}, relevant de la classification ${article3.classification || '___'} selon la convention collective.</p>
        <p>Les principales missions confiées sont les suivantes :</p>
        <ul>
          ${article3.duties?.map(duty => `<li>${duty}</li>`).join('') || '<li>___</li>'}
        </ul>
      </div>
      ` : ''}
      
      ${article4 ? `
      <div class="section">
        <h2>Article 4 – Lieu de travail</h2>
        <p>Le Salarié exercera ses fonctions principalement à l'adresse suivante : ${article4.mainLocation || '___'}.</p>
        ${article4.hasMobilityClause ? `
        <p>Dans l'intérêt de l'entreprise, l'Employeur se réserve le droit de modifier le lieu de travail du Salarié dans un rayon de ${article4.mobilityRadius || '___'} kilomètres.</p>
        ` : ''}
      </div>
      ` : ''}
      
      ${article5 ? `
      <div class="section">
        <h2>Article 5 – Durée et organisation du travail</h2>
        ${isPartTime 
          ? `<p>Le temps de travail est fixé à ${workingHours} heures hebdomadaires, réparties selon les horaires suivants :</p>
             ${article5.scheduleType === 'fixed' 
               ? `<p>${JSON.stringify(article5.weeklySchedule || {})}</p>` 
               : `<p>Horaires variables communiqués selon planning.</p>`}`
          : `<p>Le temps de travail est fixé à 35 heures hebdomadaires, réparties selon les horaires collectifs en vigueur dans l'entreprise.</p>`
        }
      </div>
      ` : ''}
      
      <div class="page-break"></div>
      
      ${article6 ? `
      <div class="section">
        <h2>Article 6 – Rémunération</h2>
        <p>Le Salarié percevra une rémunération brute mensuelle de ${article6.grossMonthlySalary || '___'} €, versée le ${article6.paymentDate || '___'} de chaque mois.</p>
        ${isPartTime ? `<p>Cette rémunération correspond à ${(workingHours / 35 * 100).toFixed(0)}% du temps complet.</p>` : ''}
        ${config.contractType === 'CDD' && article6.includeCDDIndemnity ? `<p>Cette rémunération inclut l'indemnité de fin de contrat de 10%.</p>` : ''}
      </div>
      ` : ''}
      
      ${article7 ? `
      <div class="section">
        <h2>Article 7 – Avantages</h2>
        <ul>
          ${article7.hasHealthInsurance ? `<li>Mutuelle d'entreprise</li>` : ''}
          ${article7.hasProfessionalExpenses ? `<li>Remboursement des frais professionnels</li>` : ''}
          ${article7.hasCompanyCar ? `<li>Véhicule de fonction</li>` : ''}
          ${article7.hasCompanyPhone ? `<li>Téléphone professionnel</li>` : ''}
          ${article7.hasCompanyLaptop ? `<li>Ordinateur portable</li>` : ''}
          ${article7.mealVouchers ? `<li>Tickets restaurant d'une valeur de ${article7.mealVouchersAmount || '___'} €</li>` : ''}
          ${article7.otherBenefits?.map(benefit => `<li>${benefit}</li>`).join('') || ''}
        </ul>
      </div>
      ` : ''}
      
      ${article8 ? `
      <div class="section">
        <h2>Article 8 – Congés et absences</h2>
        <p>Le Salarié bénéficie de ${article8.paidLeavesDays || '2,5'} jours ouvrables de congés payés par mois de travail effectif.</p>
        ${article8.extraHolidays ? `<p>Le Salarié bénéficie également de ${article8.extraHolidays} jours de congés supplémentaires.</p>` : ''}
      </div>
      ` : ''}
      
      ${article9 ? `
      <div class="section">
        <h2>Article 9 – Données personnelles et droit à l'image</h2>
        <p>Le Salarié autorise l'Employeur à collecter, traiter et conserver ses données personnelles dans le respect du Règlement Général sur la Protection des Données (RGPD).</p>
        ${article9.allowImageUse 
          ? `<p>Le Salarié autorise l'utilisation de son image à des fins de communication ${article9.imageUseScope || 'interne'}.</p>` 
          : `<p>Le Salarié n'autorise pas l'utilisation de son image.</p>`}
      </div>
      ` : ''}
      
      ${article10 ? `
      <div class="section">
        <h2>Article 10 – Tenue et règles internes</h2>
        <p>Le Salarié s'engage à respecter les consignes internes de l'entreprise, notamment le règlement intérieur.</p>
        ${article10.dressCode 
          ? `<p>Une tenue professionnelle est requise et ${article10.dressCodeProvided ? 'sera fournie par l\'employeur' : 'est à la charge du salarié'}.</p>` 
          : ''}
      </div>
      ` : ''}
      
      ${article11 ? `
      <div class="section">
        <h2>Article 11 – Confidentialité et propriété intellectuelle</h2>
        ${article11.hasConfidentialityClause 
          ? `<p>Le Salarié s'engage à une stricte confidentialité concernant toutes les informations sensibles obtenues dans le cadre de ses fonctions, pendant la durée du contrat et pour une période de ${article11.confidentialityPeriod || '___'} mois après son terme.</p>` 
          : ''}
        ${article11.intellectualProperty 
          ? `<p>Toute création réalisée dans le cadre du travail appartient intégralement à l'Employeur.</p>` 
          : ''}
      </div>
      ` : ''}
      
      ${article12 && config.contractType === 'CDI' && article12.hasNonCompeteClause ? `
      <div class="section">
        <h2>Article 12 – Non-concurrence</h2>
        <p>À l'issue du contrat, le Salarié s'interdit pendant une durée de ${article12.nonCompeteDuration || '___'} mois et dans ${article12.nonCompeteGeographicScope || '___'}, d'exercer une activité concurrente.</p>
        <p>Une contrepartie financière équivalente à ${article12.nonCompeteCompensation || '___'}% de la rémunération mensuelle brute sera versée pendant la durée d'application de cette clause.</p>
      </div>
      ` : ''}
      
      ${article13 && article13.hasTeleworking ? `
      <div class="section">
        <h2>Article 13 – Télétravail</h2>
        <p>Le Salarié pourra exercer son activité en télétravail ${article13.teleworkingDaysPerWeek || '___'} jours par semaine.</p>
        ${article13.teleworkingEquipmentProvided 
          ? `<p>L'équipement nécessaire sera fourni par l'Employeur.</p>` 
          : ''}
        ${article13.teleworkingAllowance 
          ? `<p>Une indemnité forfaitaire de ${article13.teleworkingAllowance} € sera versée mensuellement pour couvrir les frais liés au télétravail.</p>` 
          : ''}
      </div>
      ` : ''}
      
      ${article14 ? `
      <div class="section">
        <h2>Article 14 – Rupture du contrat et préavis</h2>
        ${config.contractType === 'CDI' 
          ? `<p>En cas de rupture du contrat, le délai de préavis applicable sera de ${article14.noticePeriod || '___'} mois, sauf dispositions plus favorables prévues par la convention collective.</p>` 
          : `<p>Le contrat à durée déterminée ne peut être rompu avant son terme que dans les cas suivants : accord commun, faute grave, force majeure, inaptitude constatée ou embauche en CDI.</p>`}
      </div>
      ` : ''}
      
      <div class="signature">
        <div class="signature-block">
          <p>Pour l'Employeur</p>
          <p>Fait à _____________, le _____________</p>
          <p>Signature</p>
          <p style="margin-top: 50px;">_______________________</p>
        </div>
        
        <div class="signature-block">
          <p>Le Salarié</p>
          <p>Fait à _____________, le _____________</p>
          <p>Signature précédée de la mention<br />"Lu et approuvé"</p>
          <p style="margin-top: 50px;">_______________________</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Convertit le HTML en PDF et télécharge le fichier
 * Dans un environnement réel, cela utiliserait une bibliothèque comme jsPDF ou puppeteer
 * Pour l'instant, nous utilisons l'API print du navigateur
 */
function printContract(html: string): void {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Laisser le temps au contenu de se charger
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}

/**
 * Service principal pour exporter le contrat
 */
export async function exportContractToPDF(contractData: ContractData): Promise<void> {
  try {
    // Générer le HTML du contrat
    const contractHTML = generateContractHTML(contractData);
    
    // Convertir en PDF et télécharger
    printContract(contractHTML);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Erreur lors de l\'export du contrat en PDF:', error);
    return Promise.reject(error);
  }
}

/**
 * Service pour exporter le contrat en format Word (DOCX)
 * Dans une implémentation réelle, cela utiliserait une bibliothèque comme docx
 */
export async function exportContractToWord(contractData: ContractData): Promise<void> {
  // Placeholder pour une future implémentation
  alert('L\'export en format Word sera disponible prochainement');
  return Promise.resolve();
} 