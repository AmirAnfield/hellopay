// Service pour la génération des attestations de travail

export type CertificateType = 'Emploi' | 'Travail' | 'FinContrat';

export interface CertificateData {
  // Informations employeur
  employerName: string;
  employerAddress: string;
  employerSiret: string;
  employerPhone?: string;
  employerEmail?: string;
  
  // Informations salarié
  employeeName: string;
  employeeAddress: string;
  employeePosition: string;
  employeeSocialSecurityNumber: string;
  
  // Informations emploi
  startDate: Date;
  endDate?: Date;
  certificateType: CertificateType;
  
  // Informations supplémentaires
  additionalInformation?: string;
  issuedDate: Date;
  issuedLocation: string;
}

export class CertificateService {
  /**
   * Génère le contenu HTML d'une attestation de travail
   */
  public static generateCertificateHTML(data: CertificateData): string {
    // Formatage des valeurs
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
      : 'ce jour';
    
    const formattedIssuedDate = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(data.issuedDate);

    // Récupération du contenu spécifique au type d'attestation
    const certificateContent = this.getCertificateContent(
      data.certificateType,
      {
        employerName: data.employerName,
        employeeName: data.employeeName,
        employeePosition: data.employeePosition,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        additionalInformation: data.additionalInformation
      }
    );
    
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
              margin-bottom: 40px;
            }
            .title {
              font-size: 20pt;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 10px;
              border-bottom: 1px solid #000;
              padding-bottom: 10px;
            }
            .employer-info {
              text-align: left;
              margin-bottom: 30px;
            }
            .date-location {
              text-align: right;
              margin-bottom: 40px;
            }
            .content {
              margin-bottom: 40px;
              text-align: justify;
            }
            .signature {
              text-align: right;
              margin-top: 50px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${this.getCertificateTitle(data.certificateType)}</div>
          </div>

          <div class="employer-info">
            <p>
              <strong>${data.employerName}</strong><br>
              ${data.employerAddress}<br>
              SIRET : ${data.employerSiret}<br>
              ${data.employerPhone ? `Tél : ${data.employerPhone}<br>` : ''}
              ${data.employerEmail ? `Email : ${data.employerEmail}` : ''}
            </p>
          </div>

          <div class="date-location">
            <p>${data.issuedLocation}, le ${formattedIssuedDate}</p>
          </div>

          <div class="content">
            ${certificateContent}
          </div>

          <div class="signature">
            <p>Pour valoir ce que de droit.</p>
            <p>
              <strong>${data.employerName}</strong><br>
              <em>Signature et cachet</em>
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Récupère le titre d'une attestation selon son type
   */
  private static getCertificateTitle(certificateType: CertificateType): string {
    const titles: Record<CertificateType, string> = {
      'Emploi': 'ATTESTATION D\'EMPLOI',
      'Travail': 'CERTIFICAT DE TRAVAIL',
      'FinContrat': 'ATTESTATION DE FIN DE CONTRAT'
    };
    
    return titles[certificateType];
  }

  /**
   * Récupère le contenu spécifique à un type d'attestation
   */
  private static getCertificateContent(
    certificateType: CertificateType,
    data: {
      employerName: string;
      employeeName: string;
      employeePosition: string;
      startDate: string;
      endDate: string;
      additionalInformation?: string;
    }
  ): string {
    const contentTemplates: Record<CertificateType, string> = {
      'Emploi': `
        <p>Je soussigné(e), <strong>${data.employerName}</strong>, certifie que <strong>${data.employeeName}</strong> est employé(e) dans notre entreprise depuis le <strong>${data.startDate}</strong> en qualité de <strong>${data.employeePosition}</strong>.</p>
        
        ${data.additionalInformation ? `<p>${data.additionalInformation}</p>` : ''}
        
        <p>Cette attestation est délivrée à l'intéressé(e) pour faire valoir ce que de droit.</p>
      `,
      'Travail': `
        <p>Je soussigné(e), <strong>${data.employerName}</strong>, certifie que <strong>${data.employeeName}</strong> a été employé(e) dans notre entreprise du <strong>${data.startDate}</strong> au <strong>${data.endDate}</strong> en qualité de <strong>${data.employeePosition}</strong>.</p>
        
        <p>En foi de quoi, nous délivrons cette attestation pour servir et valoir ce que de droit.</p>
        
        ${data.additionalInformation ? `<p>${data.additionalInformation}</p>` : ''}
        
        <p>Le (la) salarié(e) est libre de tout engagement envers notre entreprise.</p>
      `,
      'FinContrat': `
        <p>Je soussigné(e), <strong>${data.employerName}</strong>, certifie que <strong>${data.employeeName}</strong> a travaillé au sein de notre entreprise du <strong>${data.startDate}</strong> au <strong>${data.endDate}</strong> en qualité de <strong>${data.employeePosition}</strong>.</p>
        
        <p>Son contrat de travail prend fin ce jour pour le motif suivant : ${data.additionalInformation || 'fin de contrat à durée déterminée'}.</p>
        
        <p>Le (la) salarié(e) est libre de tout engagement envers notre entreprise.</p>
        
        <p>Cette attestation est délivrée pour faire valoir ses droits aux allocations d'assurance chômage, sous réserve de remplir les autres conditions d'attribution.</p>
      `
    };
    
    return contentTemplates[certificateType];
  }
} 