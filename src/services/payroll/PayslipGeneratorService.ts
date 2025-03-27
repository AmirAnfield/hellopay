// Service pour générer les bulletins de paie au format PDF

import { BulletinPaie } from './PayrollHistoryService';

/**
 * Interface pour les options de génération du bulletin de paie
 */
export interface PayslipGenerationOptions {
  logoPath?: string;            // Chemin vers le logo de l'entreprise
  includeSociety?: boolean;     // Inclure les informations de la société
  includeDetails?: boolean;     // Inclure les détails des calculs
  template?: 'standard' | 'simplified'; // Type de template à utiliser
}

/**
 * Interface pour les informations de l'employeur
 */
export interface EmployerInfo {
  name: string;                 // Nom de l'entreprise
  address: string;              // Adresse
  siret: string;                // Numéro SIRET
  apeCode: string;              // Code APE
  urssafNumber?: string;        // Numéro URSSAF
}

/**
 * Interface pour les informations de l'employé
 */
export interface EmployeeInfo {
  id: string;                   // Identifiant unique
  firstName: string;            // Prénom
  lastName: string;             // Nom
  position: string;             // Poste/Fonction
  department?: string;          // Département
  hireDate: Date;               // Date d'embauche
  socialSecurityNumber?: string; // Numéro de sécurité sociale
}

/**
 * Service pour générer des bulletins de paie au format PDF
 */
export class PayslipGeneratorService {
  /**
   * Génère un nom de fichier pour le bulletin de paie
   * @param employeeName Nom de l'employé
   * @param month Mois du bulletin
   * @param year Année du bulletin
   * @param id Identifiant unique (facultatif)
   * @returns Nom de fichier formaté
   */
  public static generateFileName(employeeName: string, month: number, year: number, id?: string): string {
    // Tableau des noms de mois en français
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    
    // Construction du nom de fichier
    const fileName = `payslip_${employeeName.replace(/\s+/g, '_')}_${monthNames[month - 1]}_${year}`;
    
    // Ajout de l'identifiant si fourni
    return id ? `${fileName}_${id}.pdf` : `${fileName}.pdf`;
  }
  
  /**
   * Génère un bulletin de paie au format PDF (implémentation simplifiée)
   * Note: L'implémentation complète nécessiterait une bibliothèque de génération PDF
   * comme PDFKit, jsPDF ou pdfmake.
   * 
   * @param bulletin Les données du bulletin de paie
   * @param employeeInfo Informations sur l'employé
   * @param employerInfo Informations sur l'employeur
   * @param options Options de génération
   * @returns Chemin du fichier PDF généré (simulation)
   */
  public static async generatePayslipPDF(
    bulletin: BulletinPaie,
    employeeInfo: EmployeeInfo,
    employerInfo: EmployerInfo,
    options: PayslipGenerationOptions = {}
  ): Promise<string> {
    // Dans une implémentation réelle, nous utiliserions une bibliothèque PDF
    // et générerions un PDF complet avec toutes les données
    
    // Pour cet exemple, nous simulons la génération d'un fichier
    const fileName = this.generateFileName(
      `${employeeInfo.lastName}`,
      bulletin.mois,
      bulletin.annee,
      bulletin.id
    );
    
    // Simulation du chemin du fichier généré
    const filePath = `payslips/${fileName}`;
    
    // Dans une vraie implémentation :
    // 1. Créer un document PDF
    // 2. Ajouter l'en-tête avec les informations de l'entreprise et de l'employé
    // 3. Ajouter le corps avec les détails du salaire
    // 4. Ajouter le pied de page avec les totaux
    // 5. Enregistrer le fichier
    
    // Retourne le chemin simulé
    return filePath;
  }
  
  /**
   * Génère un bulletin de paie au format HTML
   * @param bulletin Les données du bulletin de paie
   * @param employeeInfo Informations sur l'employé
   * @param employerInfo Informations sur l'employeur
   * @param options Options de génération
   * @returns Chaîne HTML du bulletin
   */
  public static generatePayslipHTML(
    bulletin: BulletinPaie,
    employeeInfo: EmployeeInfo, 
    employerInfo: EmployerInfo,
    options: PayslipGenerationOptions = {}
  ): string {
    // Format des nombres avec 2 décimales
    const formatNumber = (num: number) => num.toFixed(2).replace('.', ',');
    
    // Données formatées pour l'affichage
    const formattedData = {
      brutTotal: formatNumber(bulletin.brutTotal),
      netTotal: formatNumber(bulletin.netTotal),
      totalCotisations: formatNumber(bulletin.totalCotisations),
      detailsBrut: {
        base: formatNumber(bulletin.detailsBrut.base),
        heureSup25: formatNumber(bulletin.detailsBrut.heureSup25),
        heureSup50: formatNumber(bulletin.detailsBrut.heureSup50),
        primes: formatNumber(bulletin.detailsBrut.primes)
      },
      detailsCotisations: {
        santé: formatNumber(bulletin.detailsCotisations.santé),
        retraite: formatNumber(bulletin.detailsCotisations.retraite),
        chômage: formatNumber(bulletin.detailsCotisations.chômage),
        autres: formatNumber(bulletin.detailsCotisations.autres)
      },
      congesCumules: bulletin.congesCumules.toString(),
      congesPris: bulletin.congesPris.toString(),
      moisAnnee: `${new Date(bulletin.annee, bulletin.mois - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
    };
    
    // Construction de la chaîne HTML (version simplifiée)
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bulletin de paie - ${employeeInfo.lastName} ${employeeInfo.firstName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .bulletin { border: 1px solid #ccc; max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .company-info, .employee-info { flex: 1; }
          .bulletin-title { text-align: center; margin: 20px 0; font-size: 1.2em; font-weight: bold; }
          .section { margin: 20px 0; }
          .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          .amount { text-align: right; }
          .total-row { font-weight: bold; background-color: #f9f9f9; }
          .footer { margin-top: 30px; font-size: 0.8em; color: #666; }
        </style>
      </head>
      <body>
        <div class="bulletin">
          <div class="header">
            <div class="company-info">
              <h2>${employerInfo.name}</h2>
              <p>${employerInfo.address}</p>
              <p>SIRET: ${employerInfo.siret}</p>
              <p>Code APE: ${employerInfo.apeCode}</p>
            </div>
            <div class="employee-info">
              <h3>${employeeInfo.lastName} ${employeeInfo.firstName}</h3>
              <p>Fonction: ${employeeInfo.position}</p>
              <p>Date d'embauche: ${employeeInfo.hireDate.toLocaleDateString('fr-FR')}</p>
              <p>Département: ${employeeInfo.department || 'N/A'}</p>
            </div>
          </div>
          
          <div class="bulletin-title">
            Bulletin de paie - ${formattedData.moisAnnee}
          </div>
          
          <div class="section">
            <div class="section-title">Rémunération brute</div>
            <table>
              <tr>
                <th>Élément</th>
                <th class="amount">Montant (€)</th>
              </tr>
              <tr>
                <td>Salaire de base</td>
                <td class="amount">${formattedData.detailsBrut.base}</td>
              </tr>
              <tr>
                <td>Heures supplémentaires (25%)</td>
                <td class="amount">${formattedData.detailsBrut.heureSup25}</td>
              </tr>
              <tr>
                <td>Heures supplémentaires (50%)</td>
                <td class="amount">${formattedData.detailsBrut.heureSup50}</td>
              </tr>
              <tr>
                <td>Primes</td>
                <td class="amount">${formattedData.detailsBrut.primes}</td>
              </tr>
              <tr class="total-row">
                <td>Total brut</td>
                <td class="amount">${formattedData.brutTotal}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">Cotisations sociales</div>
            <table>
              <tr>
                <th>Cotisation</th>
                <th class="amount">Montant (€)</th>
              </tr>
              <tr>
                <td>Santé</td>
                <td class="amount">${formattedData.detailsCotisations.santé}</td>
              </tr>
              <tr>
                <td>Retraite</td>
                <td class="amount">${formattedData.detailsCotisations.retraite}</td>
              </tr>
              <tr>
                <td>Chômage</td>
                <td class="amount">${formattedData.detailsCotisations.chômage}</td>
              </tr>
              <tr>
                <td>Autres (CSG, CRDS, etc.)</td>
                <td class="amount">${formattedData.detailsCotisations.autres}</td>
              </tr>
              <tr class="total-row">
                <td>Total cotisations</td>
                <td class="amount">${formattedData.totalCotisations}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">Net à payer</div>
            <table>
              <tr class="total-row">
                <td>Salaire net</td>
                <td class="amount">${formattedData.netTotal}</td>
              </tr>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">Congés payés</div>
            <table>
              <tr>
                <th>Élément</th>
                <th class="amount">Jours</th>
              </tr>
              <tr>
                <td>Congés acquis ce mois</td>
                <td class="amount">${formattedData.congesCumules}</td>
              </tr>
              <tr>
                <td>Congés pris ce mois</td>
                <td class="amount">${formattedData.congesPris}</td>
              </tr>
            </table>
          </div>
          
          <div class="footer">
            <p>Ce bulletin est établi à titre informatif. Pour toute question, veuillez contacter le service RH.</p>
            <p>Généré le ${new Date().toLocaleDateString('fr-FR')} par HelloPay</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return html;
  }
} 