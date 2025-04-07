'use client';

import React from 'react';
import './css/ContractA4.css';

// Types pour les données du contrat
interface ContractTemplateProps {
  // Données de l'entreprise
  company: {
    name: string;
    address: string;
    siret: string;
    representant: string;
    conventionCollective?: string;
    sector?: string; // Secteur d'activité
  };
  
  // Données de l'employé
  employee: {
    firstName: string;
    lastName: string;
    address: string;
    birthDate?: string;
    nationality?: string;
    socialSecurityNumber?: string;
    gender?: 'M' | 'F' | 'U'; // Ajout du genre grammatical
  };
  
  // Détails du contrat
  contractDetails: {
    type: 'CDI' | 'CDD';
    workingHours: number;
    position: string;
    classification?: string;
    startDate: string;
    endDate?: string; // Pour les CDD
    motifCDD?: string; // Motif du CDD
    trialPeriod?: boolean;
    trialPeriodDuration?: string;
    workplace: string;
    mobilityClause?: boolean;
    mobilityRadius?: number;
    scheduleType?: 'fixed' | 'variable' | 'shifts';
    workingDays?: string;
    salary: number;
    hourlyRate?: number;
    paymentDate?: string;
    benefits?: {
      expenseReimbursement?: boolean;
      transportAllowance?: boolean;
      lunchVouchers?: boolean;
      lunchVoucherAmount?: number;
      lunchVoucherEmployerContribution?: number;
      mutualInsurance?: boolean;
      mutualInsuranceEmployerContribution?: number;
      professionalPhone?: boolean;
    };
    customLeaves?: boolean;
    customLeavesDetails?: string;
    nonCompete?: boolean;
    nonCompeteDuration?: string;
    nonCompeteArea?: string;
    nonCompeteCompensation?: string;
    nonSolicitation?: boolean;
    noticePeriod?: 'legal' | '1-month' | '2-months' | '3-months' | 'collective';
    teleworking?: boolean; // Télétravail
    teleworkingDays?: number; // Nombre de jours en télétravail
    teleworkingAllowance?: number; // Indemnité de télétravail
    responsabilityLevel?: 'entry' | 'intermediate' | 'expert' | 'manager'; // Niveau de responsabilité
    coefficient?: string; // Coefficient conventionnel
  };
  
  // Options d'affichage
  displayOptions: {
    hasPreambule: boolean;
    includeDataProtection?: boolean;
    includeImageRights?: boolean;
    includeWorkRules?: boolean;
    includeWorkClothes?: boolean;
    includeInternalRules?: boolean;
    includeConfidentiality?: boolean;
    includeIntellectualProperty?: boolean;
    includeTeleworking?: boolean;
    teleworkingType?: 'regular' | 'occasional' | 'mixed';
    employerProvidesEquipment?: boolean; 
    showSignatures?: boolean;
  };
}

export function ContractTemplate({
  company,
  employee,
  contractDetails,
  displayOptions,
}: ContractTemplateProps) {
  const isCDI = contractDetails.type === 'CDI';
  const isPartTime = contractDetails.workingHours < 35;
  const isCadre = contractDetails.classification?.toLowerCase().includes('cadre') || false;
  
  // Fonction d'adaptation au genre grammatical
  const genreFlex = (masc: string, fem: string, univ?: string): string => {
    if (employee.gender === 'F') return fem;
    if (employee.gender === 'U') return univ || `L'employé·e`; // Utiliser le terme universel si fourni ou un terme par défaut
    return masc; // Par défaut, masculin
  };

  // Version spécifique pour "Le/La/L'" qui gère les articles
  const genreArticle = (withApostrophe: boolean = false): string => {
    if (employee.gender === 'F') return withApostrophe ? "L'" : "La";
    if (employee.gender === 'U') return "L'";
    return withApostrophe ? "L'" : "Le";
  };

  // Version spécifique pour les accords (é/ée/é·e)
  const genreAccord = (root: string): string => {
    if (employee.gender === 'F') return `${root}e`;
    if (employee.gender === 'U') return `${root}·e`;
    return root;
  };

  // Version spécifique pour les pronoms (il/elle/iel)
  const genrePronom = (): string => {
    if (employee.gender === 'F') return "elle";
    if (employee.gender === 'U') return "iel";
    return "il";
  };
  
  // Format de date pour l'affichage
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Calculer la durée entre deux dates (pour CDD)
  const calculateDuration = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} jours`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mois`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      if (remainingMonths > 0) {
        return `${years} an${years > 1 ? 's' : ''} et ${remainingMonths} mois`;
      }
      return `${years} an${years > 1 ? 's' : ''}`;
    }
  };
  
  // Calculer le taux horaire si non spécifié
  const hourlyRate = contractDetails.hourlyRate || 
    (contractDetails.salary / (contractDetails.workingHours * 52/12)).toFixed(2);
  
  // Determine les clauses additionnelles pertinentes
  const getAdditionalClauses = () => {
    const clauses = [];
    
    // Clause spécifique télétravail
    if (contractDetails.teleworking) {
      clauses.push({
        title: "Télétravail",
        content: `${genreFlex("Le salarié", "La salariée", "L'employé·e")} est autorisé${genreAccord("e")} à effectuer ${contractDetails.teleworkingDays} jour(s) de télétravail par semaine à son domicile. ${contractDetails.teleworkingAllowance ? `Une indemnité forfaitaire mensuelle de ${contractDetails.teleworkingAllowance}€ est versée pour compenser les frais liés au télétravail.` : ""}`
      });
    }
    
    // Clauses spécifiques selon le niveau de responsabilité
    if (contractDetails.responsabilityLevel === 'manager' || 
        contractDetails.classification?.toLowerCase().includes('manager') || 
        contractDetails.classification?.toLowerCase().includes('directeur')) {
      clauses.push({
        title: "Délégation de pouvoir",
        content: `${genreFlex("Le salarié", "La salariée", "L'employé·e")} se voit confier la responsabilité de superviser une équipe et disposera de l'autorité nécessaire pour prendre des décisions relevant de son périmètre d'action.`
      });
    }
    
    // Clauses spécifiques selon le secteur d'activité
    if (company.sector === 'IT' || contractDetails.position.toLowerCase().includes('développeur') || contractDetails.position.toLowerCase().includes('développeuse')) {
      clauses.push({
        title: "Propriété intellectuelle renforcée",
        content: `Tous les travaux, codes sources, algorithmes, designs et autres créations intellectuelles réalisés par ${genreFlex("le salarié", "la salariée", "l'employé·e")} dans le cadre de ses fonctions sont la propriété exclusive de l'entreprise, y compris les travaux dérivés ou adaptés.`
      });
    }
    
    // Clauses spécifiques pour les cadres
    if (isCadre) {
      clauses.push({
        title: "Convention de forfait",
        content: `En raison de son autonomie dans l'organisation de son emploi du temps et de la nature de ses fonctions, ${genreFlex("le salarié", "la salariée", "l'employé·e")} est soumis${genreAccord("e")} à une convention de forfait annuel en jours, fixée à 218 jours par année complète de travail, incluant la journée de solidarité.`
      });
    }
    
    return clauses;
  };
  
  // Récupération des clauses additionnelles
  const additionalClauses = getAdditionalClauses();
  
  // Classe CSS conditionnelle selon le type de contrat
  const contractTypeClass = isCDI ? 'contract-cdi' : 'contract-cdd';
  const contractStatusClass = isCadre ? 'contract-cadre' : 'contract-non-cadre';
  const contractTimeClass = isPartTime ? 'contract-temps-partiel' : 'contract-temps-plein';
  
  return (
    <div className={`contract-a4-page ${contractTypeClass} ${contractStatusClass} ${contractTimeClass}`}>
      <div className="contract-header">
        <div className="contract-title">
          CONTRAT DE TRAVAIL À DURÉE {isCDI ? 'INDÉTERMINÉE' : 'DÉTERMINÉE'}
        </div>
        <div className="contract-subtitle">
          {isPartTime ? 'À TEMPS PARTIEL' : 'À TEMPS PLEIN'} 
          {isCadre && ' - STATUT CADRE'}
        </div>
      </div>
      
      <div className="contract-parties">
        <div className="contract-party">
          <div className="contract-party-title">L'EMPLOYEUR</div>
          <p>
            <strong>{company.name}</strong><br />
            Siège social : {company.address}<br />
            SIRET : {company.siret}<br />
            Représenté par : {company.representant}
            {company.conventionCollective && (
              <><br />Convention collective : {company.conventionCollective}</>
            )}
          </p>
        </div>
        
        <div className="contract-party">
          <div className="contract-party-title">
            {genreFlex("LE SALARIÉ", "LA SALARIÉE", "L'EMPLOYÉ·E")}
          </div>
          <p>
            <strong>{employee.firstName} {employee.lastName}</strong><br />
            Demeurant : {employee.address}<br />
            {employee.birthDate && <>Né${genreAccord("é")} le : {formatDate(employee.birthDate)}<br /></>}
            {employee.nationality && <>Nationalité : {employee.nationality}<br /></>}
            {employee.socialSecurityNumber && <>N° SS : {employee.socialSecurityNumber}</>}
          </p>
        </div>
      </div>
      
      {displayOptions.hasPreambule && (
        <div className="contract-article avoid-break">
          <div className="contract-article-title">PRÉAMBULE</div>
          <div className="contract-article-content">
            <p>
              Il a été convenu entre les parties ce qui suit, conformément aux dispositions du Code du travail 
              et de la convention collective applicable à l'entreprise.
            </p>
            <p>
              Le présent contrat est conclu dans le contexte suivant :
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginTop: '5px' }}>
              <li>Développement des activités de l'entreprise</li>
              <li>Besoin de compétences spécifiques</li>
              <li>Volonté d'établir une relation de travail {isCDI ? 'durable' : 'temporaire'} et mutuellement bénéfique</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="contract-article avoid-break">
        <div className="contract-article-title">ARTICLE 1 – NATURE DU CONTRAT</div>
        <div className="contract-article-content">
          {isCDI ? (
            <p>
              Le présent contrat est conclu pour une durée indéterminée, conformément aux dispositions de l'article L.1221-1 du Code du travail. Il prendra effet à compter du <span className="variable-field">{formatDate(contractDetails.startDate)}</span>, selon les conditions définies ci-après.
              <br /><br />
              Il est régi par les dispositions légales et réglementaires applicables, ainsi que par les dispositions de la convention collective applicable à l'entreprise 
              {company.conventionCollective && (<>, à savoir la <span className="variable-field">{company.conventionCollective}</span></>)}.
            </p>
          ) : (
            <p className="contract-key-clause">
              Le présent contrat est conclu pour une durée déterminée, en application des articles L.1242-1 et suivants du Code du travail.
              {contractDetails.motifCDD && (
                <><br />Motif du recours au CDD : <span className="variable-field">{contractDetails.motifCDD}</span></>
              )}
              <br />Il débutera le <span className="variable-field">{formatDate(contractDetails.startDate)}</span> et prendra fin le <span className="variable-field">{formatDate(contractDetails.endDate)}</span>
              {contractDetails.startDate && contractDetails.endDate && (
                <>, soit une durée de <span className="variable-field">{calculateDuration(contractDetails.startDate, contractDetails.endDate)}</span></>
              )}, 
              sauf cas de rupture anticipée prévue par la loi.
              <br /><br />
              Ce contrat est soumis aux dispositions légales et réglementaires en vigueur, notamment les articles L.1242-1 et suivants du Code du travail. Il ne peut avoir ni pour objet ni pour effet de pourvoir durablement un emploi lié à l'activité normale et permanente de l'entreprise.
            </p>
          )}
        </div>
      </div>
      
      <div className="contract-article avoid-break">
        <div className="contract-article-title">ARTICLE 2 – DATE D'ENTRÉE EN FONCTION</div>
        <div className="contract-article-content">
          <p>
            {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} prendra ses fonctions à compter du <span className="variable-field">{formatDate(contractDetails.startDate)}</span>, 
            date qui marque le début effectif de la relation de travail.
            {contractDetails.trialPeriod && (
              <>
                <br /><br />
                Une période d'essai de <span className="variable-field">{contractDetails.trialPeriodDuration}</span> est prévue. 
                Durant cette période, chacune des parties peut rompre le contrat de travail sans indemnité ni préavis, 
                dans les conditions prévues par la loi.
                <br />
                {!isCDI && (
                  <>
                    Cette période d'essai ne peut excéder une durée calculée à raison d'un jour par semaine, 
                    dans la limite de deux semaines lorsque la durée du contrat est au plus égale à six mois et 
                    d'un mois dans les autres cas.
                  </>
                )}
              </>
            )}
          </p>
        </div>
      </div>
      
      <div className="contract-article avoid-break">
        <div className="contract-article-title">ARTICLE 3 – FONCTIONS</div>
        <div className="contract-article-content">
          <p>
            {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} est engagé{genreAccord("é")} en qualité de <span className="variable-field">{contractDetails.position}</span>,
            {contractDetails.classification && (
              <> relevant de la classification <span className="variable-field">{contractDetails.classification}</span> 
              {contractDetails.coefficient && (<> (coefficient <span className="variable-field">{contractDetails.coefficient}</span>)</>)} selon la convention collective</>
            )}.
            <br /><br />
            Dans le cadre de ses fonctions, {genreFlex("le Salarié", "la Salariée", "l'employé·e")} sera notamment chargé{genreAccord("e")} de :
            <br />
            <span style={{ fontStyle: 'italic', marginLeft: '15px', display: 'block', marginTop: '5px' }}>
              [Descriptif des principales tâches et responsabilités]
            </span>
            <br />
            {genreFlex("Le salarié", "La salariée", "l'employé·e")} s'engage à exécuter son travail avec soin et diligence, conformément aux instructions qui lui seront données par la direction de l'entreprise. Cette description n'est pas exhaustive et pourra être adaptée selon les nécessités du service.
          </p>
        </div>
      </div>
      
      <div className="contract-article avoid-break">
        <div className="contract-article-title">ARTICLE 4 – LIEU DE TRAVAIL</div>
        <div className="contract-article-content">
          <p>
            {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} exercera ses fonctions principalement à l'adresse suivante : <span className="variable-field">{contractDetails.workplace}</span>. 
            {contractDetails.mobilityClause ? (
              <>
                <br /><br />
                <strong>Clause de mobilité :</strong> {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} pourra être amené{genreAccord("é")} à exercer ses fonctions dans un autre établissement 
                de l'entreprise dans un rayon de <span className="variable-field">{contractDetails.mobilityRadius}</span> km autour du lieu 
                de travail principal, en fonction des nécessités de service.
                <br />
                Cette clause s'applique dans le respect des dispositions légales relatives à la vie privée et familiale du salarié.
              </>
            ) : (
              <>
                <br />
                L'Employeur se réserve la possibilité de modifier ce lieu dans un périmètre raisonnable, dans l'intérêt de l'entreprise, 
                sous réserve de respecter un délai de prévenance raisonnable.
              </>
            )}
            <br /><br />
            L'employeur se réserve le droit de demander {genrePronom()} d'effectuer des déplacements professionnels temporaires selon les besoins de l'entreprise.
          </p>
        </div>
      </div>
      
      <div className="contract-article avoid-break">
        <div className="contract-article-title">ARTICLE 5 – DURÉE ET ORGANISATION DU TRAVAIL</div>
        <div className="contract-article-content">
          {isPartTime ? (
            <p>
              {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} travaillera <span className="variable-field">{contractDetails.workingHours}</span> heures par semaine, 
              soit <span className="variable-field">{Math.round(contractDetails.workingHours / 35 * 100)}</span>% d'un temps complet.
              {contractDetails.workingDays && (
                <>
                  <br /><br />
                  <strong>Répartition des horaires :</strong> {contractDetails.workingDays}
                </>
              )}
              <br /><br />
              Cette répartition ne pourra être modifiée qu'avec l'accord écrit {genreAccord("de")}, sauf circonstances exceptionnelles, 
              et moyennant un délai de prévenance de 7 jours calendaires minimum.
              <br /><br />
              Le recours aux heures complémentaires est possible dans la limite de 1/3 de la durée contractuelle, avec une 
              majoration de salaire conformément aux dispositions légales (10% pour les heures accomplies dans la limite 
              de 1/10e de la durée contractuelle, puis 25% pour les heures suivantes).
            </p>
          ) : isCadre ? (
            <p>
              En raison de la nature de ses fonctions, de ses responsabilités et de son autonomie dans l'organisation de son emploi du temps, 
              {genreFlex(" le Salarié", " la Salariée", " l'employé·e")} relève des dispositions de l'article L. 3121-43 du Code du travail relatif aux cadres autonomes.
              <br /><br />
              {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} est donc soumis{genreAccord("e")} à une convention de forfait annuel en jours, fixée à 218 jours par année complète de travail, 
              incluant la journée de solidarité.
              <br /><br />
              {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} bénéficie d'un temps de repos quotidien d'au moins 11 heures consécutives et d'un temps de repos 
              hebdomadaire d'au moins 35 heures consécutives. Un suivi régulier de sa charge de travail sera effectué par la direction.
            </p>
          ) : (
            <p>
              Le temps de travail est fixé à 35 heures hebdomadaires, réparties selon les horaires collectifs en vigueur dans l'entreprise.
              {contractDetails.scheduleType && (
                <>
                  <br /><br />
                  <strong>Type d'horaires :</strong> {
                    contractDetails.scheduleType === 'fixed' ? 'Horaires fixes' :
                    contractDetails.scheduleType === 'variable' ? 'Horaires variables' :
                    'Travail en équipes successives'
                  }
                </>
              )}
              <br /><br />
              Ces horaires pourront être modifiés selon les nécessités de service, dans le respect des dispositions légales 
              et conventionnelles relatives à la durée du travail.
              <br /><br />
              {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} pourra être amené{genreAccord("é")} à effectuer des heures supplémentaires en fonction des besoins de l'entreprise,
              dans le respect des dispositions légales et conventionnelles. Ces heures seront indemnisées conformément à la législation en vigueur.
            </p>
          )}
        </div>
      </div>
      
      <div className="contract-article avoid-break">
        <div className="contract-article-title">ARTICLE 6 – RÉMUNÉRATION</div>
        <div className="contract-article-content">
          <p>
            {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} percevra une rémunération brute mensuelle de <span className="variable-field">{contractDetails.salary.toLocaleString('fr-FR')}</span> €, 
            correspondant à un taux horaire brut de <span className="variable-field">{hourlyRate}</span> €.
            {isPartTime && (
              <> Cette rémunération correspond à <span className="variable-field">{Math.round(contractDetails.workingHours / 35 * 100)}</span>% du temps complet.</>
            )}
            {contractDetails.paymentDate && (
              <>
                <br /><br />
                Le salaire sera versé mensuellement, à date fixe, le <span className="variable-field">{contractDetails.paymentDate}</span> de chaque mois.
              </>
            )}
            <br /><br />
            Cette rémunération inclut tous les éléments de salaire prévus par les dispositions légales et conventionnelles applicables.
            Elle pourra être revue dans le cadre des procédures d'évaluation et de révision des salaires de l'entreprise.
            <br /><br />
            {isPartTime ? "Les heures complémentaires" : "Les heures supplémentaires"} seront rémunérées selon les règles légales et conventionnelles.
            {!isCDI && (
              <>
                <br /><br />
                Au terme du contrat, {genreFlex("le Salarié", "la Salariée", "l'employé·e")} percevra une indemnité de fin de contrat égale à 10% de la rémunération totale brute perçue pendant la durée du contrat, 
                sauf dans les cas d'exclusion prévus par la loi.
              </>
            )}
          </p>
        </div>
      </div>
      
      <div className="contract-article avoid-break">
        <div className="contract-article-title">ARTICLE 7 – AVANTAGES ET FRAIS PROFESSIONNELS</div>
        <div className="contract-article-content">
          {contractDetails.benefits && Object.values(contractDetails.benefits).some(v => v) ? (
            <p>
              {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} bénéficiera des avantages suivants :
              <br />
              {contractDetails.benefits.expenseReimbursement && (
                <span className="variable-field">• Remboursement des frais professionnels sur présentation de justificatifs</span>
              )}
              {contractDetails.benefits.transportAllowance && (
                <>
                  <br />
                  <span className="variable-field">• Remboursement des frais de transport à hauteur de 50% conformément à la législation en vigueur</span>
                </>
              )}
              {contractDetails.benefits.lunchVouchers && (
                <>
                  <br />
                  <span className="variable-field">• Tickets restaurant d'une valeur de {contractDetails.benefits.lunchVoucherAmount}€ (dont {contractDetails.benefits.lunchVoucherEmployerContribution}% pris en charge par l'employeur)</span>
                </>
              )}
              {contractDetails.benefits.mutualInsurance && (
                <>
                  <br />
                  <span className="variable-field">• Mutuelle d'entreprise avec une prise en charge employeur de {contractDetails.benefits.mutualInsuranceEmployerContribution}%</span>
                </>
              )}
              {contractDetails.benefits.professionalPhone && (
                <>
                  <br />
                  <span className="variable-field">• Téléphone professionnel mis à disposition</span>
                </>
              )}
              <br /><br />
              Ces avantages sont soumis aux règles fiscales et sociales en vigueur et peuvent évoluer selon les dispositions légales 
              et la politique de l'entreprise.
            </p>
          ) : (
            <p>
              Aucun avantage spécifique n'est prvu au contrat, hormis ceux prévus par les dispositions légales et conventionnelles.
              <br /><br />
              Les frais professionnels exposés par {genreFlex("le Salarié", "la Salariée", "l'employé·e")} dans le cadre de ses fonctions lui seront remboursés sur 
              présentation de justificatifs et dans le respect des procédures internes de l'entreprise.
            </p>
          )}
        </div>
      </div>
      
      <div className="contract-article avoid-break">
        <div className="contract-article-title">ARTICLE 8 – CONGÉS ET ABSENCES</div>
        <div className="contract-article-content">
          <p>
            {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} bénéficie de 2,5 jours ouvrables de congés payés par mois de travail effectif. 
            {!isCDI && (
              <> Pour les CDD, ces congés seront compensés par une indemnité en fin de contrat si non pris.</>
            )}
            <br /><br />
            Les dates de congés seront déterminées en accord avec l'employeur, en fonction des nécessités du service 
            et en tenant compte, dans la mesure du possible, des souhaits {genreAccord("de")}.
            {contractDetails.customLeaves && contractDetails.customLeavesDetails && (
              <>
                <br /><br />
                <strong>Congés supplémentaires :</strong> {contractDetails.customLeavesDetails}
              </>
            )}
            <br /><br />
            Des absences spécifiques peuvent être accordées conformément à la convention collective et au Code du travail 
            (événements familiaux, congés pour examens médicaux...).
            <br /><br />
            Toute absence doit être justifiée dans les conditions prévues par le règlement intérieur ou les usages de l'entreprise.
          </p>
        </div>
      </div>
      
      <div className="contract-article avoid-break">
        <div className="contract-article-title">ARTICLE 9 – RUPTURE DU CONTRAT ET PRÉAVIS</div>
        <div className="contract-article-content">
          {isCDI ? (
            <p>
              Le contrat pourra être rompu à l'initiative de l'une ou l'autre des parties dans le respect du délai de préavis 
              applicable {contractDetails.noticePeriod && contractDetails.noticePeriod !== 'legal' ? (
                <>
                  de <span className="variable-field">{
                    contractDetails.noticePeriod === '1-month' ? '1 mois' :
                    contractDetails.noticePeriod === '2-months' ? '2 mois' :
                    contractDetails.noticePeriod === '3-months' ? '3 mois' :
                    'selon la convention collective'
                  }</span>
                </>
              ) : (
                <>selon la convention collective ou la loi.</>
              )}
              <br /><br />
              En cas de licenciement (sauf faute grave ou faute lourde), {genreFlex("le Salarié", "la Salariée", "l'employé·e")} percevra les indemnités légales et conventionnelles de licenciement s'il remplit les conditions requises.
              <br /><br />
              En cas de démission, {genreFlex("le Salarié", "la Salariée", "l'employé·e")} respectera le délai de préavis applicable à sa catégorie professionnelle selon la convention collective ou, à défaut, les dispositions légales.
            </p>
          ) : (
            <p>
              Le contrat ne peut être rompu avant son terme que dans les cas suivants : accord commun, faute grave, 
              force majeure, inaptitude constatée par le médecin du travail, ou embauche {genreAccord("de")} en CDI.
              <br /><br />
              La rupture anticipée du contrat en dehors de ces cas entraîne, selon la partie à l'origine de la rupture :
              <br />
              - Pour l'employeur : le versement de dommages et intérêts d'un montant au moins égal aux rémunérations restant dues jusqu'au terme du contrat.
              <br />
              - Pour {genreFlex("le salarié", "la salariée", "l'employé·e")} : des dommages et intérêts correspondant au préjudice subi par l'employeur.
            </p>
          )}
        </div>
      </div>
      
      {/* Articles optionnels */}
      {displayOptions.includeDataProtection && (
        <div className="contract-article avoid-break">
          <div className="contract-article-title">ARTICLE 10 – DONNÉES PERSONNELLES ET DROIT À L'IMAGE</div>
          <div className="contract-article-content">
            <p>
              {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} autorise l'Employeur à collecter, traiter et conserver ses données personnelles dans le respect du Règlement 
              Général sur la Protection des Données (RGPD – UE 2016/679), uniquement à des fins liées à l'exécution du contrat de travail.
              <br /><br />
              Les données sont conservées pendant la durée du contrat et au-delà conformément aux obligations légales de conservation. 
              {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} dispose d'un droit d'accès, de rectification, d'effacement et de portabilité de ses données, ainsi que d'un 
              droit à la limitation du traitement dans les conditions prévues par la réglementation.
              {displayOptions.includeImageRights && (
                <>
                  <br /><br />
                  <strong>Droit à l'image :</strong> {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} autorise l'Employeur à utiliser son image dans le cadre des supports de 
                  communication internes et/ou externes de l'entreprise. Cette autorisation est donnée à titre gracieux pour la durée 
                  du contrat de travail et pourra être révoquée à tout moment par écrit.
                </>
              )}
            </p>
          </div>
        </div>
      )}
      
      {(displayOptions.includeWorkRules || displayOptions.includeWorkClothes || displayOptions.includeInternalRules) && (
        <div className="contract-article avoid-break">
          <div className="contract-article-title">ARTICLE 11 – TENUE ET RÈGLES INTERNES</div>
          <div className="contract-article-content">
            <p>
              {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} s'engage à respecter les consignes internes de l'entreprise, notamment 
              {displayOptions.includeInternalRules && (
                <> le règlement intérieur dont {genreAccord("il")} reconnaît avoir pris connaissance</>
              )}
              {(displayOptions.includeInternalRules && displayOptions.includeWorkClothes) && (
                <> et</>
              )}
              {displayOptions.includeWorkClothes && (
                <> les règles relatives à la tenue vestimentaire</>
              )}.
              <br /><br />
              {displayOptions.includeWorkClothes ? (
                <>
                  Une tenue professionnelle est requise. Elle sera fournie par l'employeur et devra être portée 
                  en état correct pendant le temps de travail. L'entretien de cette tenue est à la charge de l'employeur.
                </>
              ) : (
                <>
                  {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} s'engage à adopter une tenue vestimentaire et un comportement adaptés aux fonctions exercées et conformes à l'image de l'entreprise.
                </>
              )}
              <br /><br />
              Le non-respect de ces règles pourra donner lieu à des sanctions disciplinaires selon la procédure prévue par le règlement intérieur.
            </p>
          </div>
        </div>
      )}
      
      {(displayOptions.includeConfidentiality || displayOptions.includeIntellectualProperty) && (
        <div className="contract-article avoid-break">
          <div className="contract-article-title">ARTICLE 12 – CONFIDENTIALITÉ ET PROPRIÉTÉ INTELLECTUELLE</div>
          <div className="contract-article-content">
            <p>
              {displayOptions.includeConfidentiality && (
                <>
                  <strong>Confidentialité :</strong> {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} s'engage à une stricte confidentialité concernant toutes les informations 
                  sensibles, techniques, commerciales, juridiques ou stratégiques obtenues dans le cadre de ses fonctions.
                  <br />
                  Cette obligation subsiste pendant toute la durée du contrat et persiste après sa rupture, quelle qu'en soit la cause.
                </>
              )}
              
              {(displayOptions.includeConfidentiality && displayOptions.includeIntellectualProperty) && (
                <><br /><br /></>
              )}
              
              {displayOptions.includeIntellectualProperty && (
                <>
                  <strong>Propriété intellectuelle :</strong> Toute création (écrite, visuelle, technique, informatique) réalisée par {genreFlex("le Salarié", "la Salariée", "l'employé·e")} 
                  dans le cadre de son contrat de travail appartient intégralement à l'Employeur, conformément aux dispositions du Code de la propriété intellectuelle.
                  <br />
                  {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} cède à l'Employeur tous les droits patrimoniaux sur les œuvres qu'{genreAccord("il")} pourrait être amené{genreAccord("é")} à créer
                  dans le cadre de ses fonctions, et ce pour toute la durée légale de protection du droit d'auteur.
                </>
              )}
            </p>
          </div>
        </div>
      )}
      
      {contractDetails.nonCompete && isCDI && (
        <div className="contract-article avoid-break">
          <div className="contract-article-title">ARTICLE 13 – NON-CONCURRENCE ET NON-SOLLICITATION</div>
          <div className="contract-article-content">
            <p>
              <strong>Clause de non-concurrence :</strong> À l'issue du contrat, quelle qu'en soit la cause, {genreFlex("le Salarié", "la Salariée", "l'employé·e")} s'interdit pendant 
              une durée de <span className="variable-field">{contractDetails.nonCompeteDuration}</span> 
              et dans un rayon de <span className="variable-field">{contractDetails.nonCompeteArea}</span>, d'exercer une activité concurrente 
              à celle de l'Employeur, soit à titre personnel, soit pour le compte d'un tiers ou d'une entreprise concurrente.
              <br /><br />
              Cette interdiction concerne les activités suivantes : [Description des activités concernées]
              <br /><br />
              En contrepartie de cette obligation, {genreFlex("le Salarié", "la Salariée", "l'employé·e")} percevra, après la rupture du contrat de travail et pendant toute la durée 
              d'application de cette clause, une indemnité mensuelle spéciale égale à <span className="variable-field">{contractDetails.nonCompeteCompensation}</span>% 
              de la moyenne mensuelle des salaires bruts perçus au cours des 12 derniers mois précédant la rupture du contrat.
              <br /><br />
              L'Employeur se réserve la faculté de libérer {genreFlex("le Salarié", "la Salariée", "l'employé·e")} de cette obligation, auquel cas l'indemnité ne sera pas due.
              Cette libération devra être notifiée par écrit dans un délai de [délai] à compter de la notification de la rupture du contrat.
              
              {contractDetails.nonSolicitation && (
                <>
                  <br /><br />
                  <strong>Clause de non-sollicitation :</strong> {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} s'engage, pendant une période de 12 mois suivant la cessation 
                  de son contrat de travail, à ne pas solliciter directement ou indirectement les clients, collaborateurs ou fournisseurs
                  de l'Employeur avec lesquels {genreAccord("il")} a été en relation dans le cadre de ses fonctions.
                </>
              )}
            </p>
          </div>
        </div>
      )}
      
      {displayOptions.includeTeleworking && (
        <div className="contract-article avoid-break">
          <div className="contract-article-title">ARTICLE 14 – TÉLÉTRAVAIL</div>
          <div className="contract-article-content">
            <p>
              {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} pourra exercer une partie de son activité à distance, dans les conditions suivantes :
              <br /><br />
              <strong>Type de télétravail :</strong> {
                displayOptions.teleworkingType === 'regular' ? 'Télétravail régulier' :
                displayOptions.teleworkingType === 'occasional' ? 'Télétravail occasionnel' :
                'Télétravail mixte (régulier et occasionnel)'
              }
              <br /><br />
              <strong>Organisation :</strong> Les jours, horaires et modalités précises du télétravail feront l'objet d'un accord spécifique 
              entre les parties. {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} devra être joignable et disponible pendant les horaires habituels de travail.
              <br /><br />
              <strong>Équipements :</strong> {displayOptions.employerProvidesEquipment ? 
                `L'employeur fournira ${genreAccord("à")} {genreAccord("la")} {genreAccord("l'employé·e")} les équipements nécessaires à l'exercice de ses fonctions en télétravail (ordinateur, téléphone, etc.).` :
                `${genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} utilisera ses propres équipements pour l'exercice de ses fonctions en télétravail.`
              }
              <br /><br />
              <strong>Frais :</strong> L'Employeur prendra en charge les coûts directement engendrés par le télétravail, notamment 
              les coûts d'abonnement, de communications et d'outils liés à l'exercice du télétravail.
              <br /><br />
              <strong>Santé et sécurité :</strong> {genreFlex("Le Salarié", "La Salariée", "L'Employé·e")} s'engage à respecter les règles de santé et de sécurité communiquées par l'Employeur.
              Le télétravail peut être suspendu à tout moment en cas de difficultés techniques ou organisationnelles.
            </p>
          </div>
        </div>
      )}
      
      {/* Clauses additionnelles dynamiques */}
      {additionalClauses.length > 0 && additionalClauses.map((clause, index) => (
        <div key={index} className="contract-article avoid-break">
          <div className="contract-article-title">ARTICLE {15 + index} – {clause.title.toUpperCase()}</div>
          <div className="contract-article-content">
            <p>{clause.content}</p>
          </div>
        </div>
      ))}
      
      {/* Signatures */}
      {displayOptions.showSignatures && (
        <div className="contract-signatures">
          <div className="signature-block">
            <div className="signature-title">L'EMPLOYEUR</div>
            <div className="signature-line"></div>
            <p>Fait à ______________, le ______________</p>
            <p>Signature précédée de la mention "Lu et approuvé"</p>
          </div>
          
          <div className="signature-block">
            <div className="signature-title">
              {genreFlex("LE SALARIÉ", "LA SALARIÉE", "L'EMPLOYÉ·E")}
            </div>
            <div className="signature-line"></div>
            <p>Fait à ______________, le ______________</p>
            <p>Signature précédée de la mention "Lu et approuvé"</p>
          </div>
        </div>
      )}
      
      <div className="contract-footer">
        Le présent contrat est établi en deux exemplaires originaux dont un est remis {genreAccord("à")} {genreAccord("la")} {genreAccord("l'employé·e")}.
      </div>
    </div>
  );
} 