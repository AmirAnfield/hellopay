import { ContractData } from "@/lib/validators/contracts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Modèles d'articles pour chaque type de contrat
const CONTRACT_TEMPLATES = {
  CDI_temps_plein: {
    title: "CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE À TEMPS PLEIN",
    articles: [
      {
        id: "identification",
        title: "IDENTIFICATION DES PARTIES",
        template: (data: ContractData) => `
          ENTRE LES SOUSSIGNÉS :
          
          ${data.employeur.raisonSociale}, ${data.employeur.formeJuridique}, dont le siège social est situé ${data.employeur.adresse}, ${data.employeur.codePostal} ${data.employeur.ville}, immatriculée sous le numéro SIRET ${data.employeur.siret || ""}, représentée par ${data.employeur.representant} en sa qualité de ${data.employeur.fonction},
          
          Ci-après dénommée "l'Employeur",
          D'UNE PART,
          
          ET
          
          ${data.salarie.civilite} ${data.salarie.prenom} ${data.salarie.nom}, né(e) le ${format(new Date(data.salarie.dateNaissance), "dd MMMM yyyy", { locale: fr })} à ${data.salarie.lieuNaissance}, demeurant ${data.salarie.adresse}, ${data.salarie.codePostal} ${data.salarie.ville}, ${data.salarie.numeroSecuriteSociale ? `Numéro de sécurité sociale : ${data.salarie.numeroSecuriteSociale}` : ""}
          
          Ci-après dénommé(e) "le Salarié",
          D'AUTRE PART,
          
          IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :
        `
      },
      {
        id: "objet",
        title: "Article 1 : OBJET DU CONTRAT",
        template: (data: ContractData) => `
          Le présent contrat est conclu pour une durée indéterminée, à temps plein, à compter du ${format(new Date(data.contrat.dateDebut), "dd MMMM yyyy", { locale: fr })}.
          
          Il est régi par le Code du travail et la convention collective ${data.employeur.conventionCollective || "applicable à l'entreprise"} ${data.employeur.codeConvention ? `(IDCC: ${data.employeur.codeConvention})` : ""}.
        `
      },
      {
        id: "fonction",
        title: "Article 2 : FONCTIONS ET LIEU DE TRAVAIL",
        template: (data: ContractData) => `
          Le Salarié est engagé en qualité de ${data.contrat.intitulePoste} au coefficient ${data.contrat.qualification || ""}.
          
          Dans le cadre de ses fonctions, le Salarié sera notamment chargé de : [Détail des missions]
          
          Le lieu de travail est fixé à ${data.contrat.lieuTravail}.
          ${data.clauses.mobilite.active ? `Cependant, le Salarié pourra être amené à exercer ses fonctions dans un autre lieu, conformément à la clause de mobilité prévue au présent contrat.` : ""}
        `
      },
      {
        id: "essai",
        title: "Article 3 : PÉRIODE D'ESSAI",
        template: (data: ContractData) => {
          if (!data.periodeEssai.active) {
            return `Le présent contrat ne comporte pas de période d'essai.`;
          }
          
          let dureeEssai = `${data.periodeEssai.duree} ${data.periodeEssai.unite}`;
          let textRenouvellement = "";
          
          if (data.periodeEssai.renouvelable && data.periodeEssai.dureeRenouvellement) {
            textRenouvellement = `Cette période d'essai pourra être renouvelée une fois pour une durée de ${data.periodeEssai.dureeRenouvellement} ${data.periodeEssai.uniteRenouvellement || data.periodeEssai.unite}, par accord écrit entre les parties avant l'expiration de la période initiale.`;
          }
          
          return `
            Le présent contrat comporte une période d'essai de ${dureeEssai} à compter de la prise de fonction du Salarié.
            
            ${textRenouvellement}
            
            Pendant cette période d'essai, chacune des parties pourra mettre fin au contrat sans indemnité ni préavis, sous réserve du respect des dispositions légales applicables.
          `;
        }
      },
      {
        id: "duree",
        title: "Article 4 : DURÉE ET HORAIRES DE TRAVAIL",
        template: (data: ContractData) => `
          La durée du travail est fixée à ${data.travail.dureeHebdo} heures par semaine, réparties sur ${data.travail.joursTravailes.length} jours (${data.travail.joursTravailes.join(", ")}).
          
          Les horaires de travail sont les suivants : ${data.travail.repartitionHoraires || "selon les horaires en vigueur dans l'entreprise"}.
          
          Le Salarié s'engage à respecter ces horaires ainsi que toute modification qui pourrait y être apportée pour des raisons de service.
        `
      },
      {
        id: "remuneration",
        title: "Article 5 : RÉMUNÉRATION",
        template: (data: ContractData) => {
          let primesText = "";
          if (data.remuneration.primes && data.remuneration.primes.length > 0) {
            primesText = `
              Le Salarié percevra également les primes suivantes :
              ${data.remuneration.primes.map(prime => `- ${prime.nom} : ${prime.montant} € (${prime.frequence})${prime.conditions ? ` sous condition de ${prime.conditions}` : ""}`).join("\n")}
            `;
          }
          
          let avantagesText = "";
          if (data.remuneration.avantagesNature && data.remuneration.avantagesNature.length > 0) {
            avantagesText = `
              Le Salarié bénéficiera des avantages en nature suivants :
              ${data.remuneration.avantagesNature.map(avantage => `- ${avantage.nom}${avantage.valeur ? ` d'une valeur de ${avantage.valeur} €` : ""}${avantage.description ? ` : ${avantage.description}` : ""}`).join("\n")}
            `;
          }
          
          return `
            En contrepartie de son travail, le Salarié percevra une rémunération mensuelle brute de ${data.remuneration.salaireBrutMensuel.toFixed(2)} euros, correspondant à un taux horaire brut de ${data.remuneration.tauxHoraire.toFixed(2)} euros, pour la durée du travail convenue.
            
            Cette rémunération lui sera versée mensuellement, le dernier jour du mois, par virement bancaire.
            
            ${primesText}
            
            ${avantagesText}
          `;
        }
      },
      {
        id: "conges",
        title: "Article 6 : CONGÉS PAYÉS",
        template: (data: ContractData) => {
          let textConges = "";
          switch(data.conges.droitConges) {
            case "légal":
              textConges = "Le Salarié bénéficiera des congés payés conformément aux dispositions légales, soit 2,5 jours ouvrables par mois de travail effectif, dans la limite de 30 jours ouvrables pour une année complète de travail.";
              break;
            case "conventionnel":
              textConges = "Le Salarié bénéficiera des congés payés conformément aux dispositions de la convention collective applicable, soit [préciser le nombre] jours par an.";
              break;
            case "spécifique":
              textConges = `Le Salarié bénéficiera de ${data.conges.nbJoursCongesSpecifiques || 0} jours de congés payés par an.`;
              break;
          }
          
          return `
            ${textConges}
            
            Les dates de congés sont déterminées selon les nécessités du service et en accord avec l'Employeur.
          `;
        }
      },
      {
        id: "preavis",
        title: "Article 7 : PRÉAVIS",
        template: (data: ContractData) => `
          En cas de rupture du contrat de travail après la période d'essai, les parties devront respecter un préavis conformément aux dispositions légales et conventionnelles en vigueur${data.conges.dureePrevis ? `, soit ${data.conges.dureePrevis}` : ""}.
          
          Le préavis ne sera pas dû en cas de faute grave ou lourde.
        `
      },
      {
        id: "retraite",
        title: "Article 8 : RÉGIMES DE RETRAITE ET DE PRÉVOYANCE",
        template: (data: ContractData) => `
          Le Salarié sera affilié aux régimes de retraite complémentaire et de prévoyance en vigueur dans l'entreprise.
          
          Caisse de retraite complémentaire : ${data.employeur.caisseRetraite || "[À compléter]"}
          Organisme de prévoyance : ${data.employeur.organismePrevoyance || "[À compléter]"}
        `
      }
    ]
  },
  
  CDI_temps_partiel: {
    title: "CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE À TEMPS PARTIEL",
    articles: [
      // Articles similaires avec adaptations pour le temps partiel
      {
        id: "identification",
        title: "IDENTIFICATION DES PARTIES",
        template: (data: ContractData) => `
          ENTRE LES SOUSSIGNÉS :
          
          ${data.employeur.raisonSociale}, ${data.employeur.formeJuridique}, dont le siège social est situé ${data.employeur.adresse}, ${data.employeur.codePostal} ${data.employeur.ville}, immatriculée sous le numéro SIRET ${data.employeur.siret || ""}, représentée par ${data.employeur.representant} en sa qualité de ${data.employeur.fonction},
          
          Ci-après dénommée "l'Employeur",
          D'UNE PART,
          
          ET
          
          ${data.salarie.civilite} ${data.salarie.prenom} ${data.salarie.nom}, né(e) le ${format(new Date(data.salarie.dateNaissance), "dd MMMM yyyy", { locale: fr })} à ${data.salarie.lieuNaissance}, demeurant ${data.salarie.adresse}, ${data.salarie.codePostal} ${data.salarie.ville}, ${data.salarie.numeroSecuriteSociale ? `Numéro de sécurité sociale : ${data.salarie.numeroSecuriteSociale}` : ""}
          
          Ci-après dénommé(e) "le Salarié",
          D'AUTRE PART,
          
          IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :
        `
      },
      {
        id: "objet",
        title: "Article 1 : OBJET DU CONTRAT",
        template: (data: ContractData) => `
          Le présent contrat est conclu pour une durée indéterminée, à temps partiel, à compter du ${format(new Date(data.contrat.dateDebut), "dd MMMM yyyy", { locale: fr })}.
          
          Il est régi par le Code du travail et la convention collective ${data.employeur.conventionCollective || "applicable à l'entreprise"} ${data.employeur.codeConvention ? `(IDCC: ${data.employeur.codeConvention})` : ""}.
        `
      },
      {
        id: "duree",
        title: "Article 4 : DURÉE ET HORAIRES DE TRAVAIL",
        template: (data: ContractData) => `
          La durée du travail est fixée à ${data.travail.dureeHebdo} heures par semaine, soit environ ${(data.travail.dureeHebdo * 52) / 12} heures par mois.
          
          Les horaires de travail sont répartis comme suit : ${data.travail.repartitionHoraires || "[À préciser]"}.
          
          Toute modification de la répartition des horaires sera notifiée au Salarié au moins 7 jours à l'avance, sauf dans les cas suivants : ${data.travail.modificationRepartition || "circonstances exceptionnelles"}.
          
          Le Salarié sera informé de ses horaires de travail par ${data.travail.modalitesCommunication || "écrit"}.
          
          Conformément aux dispositions légales, le Salarié peut effectuer des heures complémentaires dans la limite de ${data.travail.heuresComplementaires}% de la durée contractuelle de travail.
        `
      }
    ]
  },
  
  CDD_temps_plein: {
    title: "CONTRAT DE TRAVAIL À DURÉE DÉTERMINÉE À TEMPS PLEIN",
    articles: [
      // Articles similaires avec adaptations pour le CDD
      {
        id: "objet",
        title: "Article 1 : OBJET DU CONTRAT",
        template: (data: ContractData) => `
          Le présent contrat est conclu pour une durée déterminée à compter du ${format(new Date(data.contrat.dateDebut), "dd MMMM yyyy", { locale: fr })} et se terminera le ${data.contrat.dateFin ? format(new Date(data.contrat.dateFin), "dd MMMM yyyy", { locale: fr }) : "à l'issue de [préciser l'événement]"}.
          
          ${!data.contrat.dateFin ? `La durée minimale du présent contrat est fixée à ${data.contrat.dureeMinimale}.` : ""}
          
          Ce contrat est conclu pour le motif suivant : ${data.contrat.motifCDD || "[Préciser le motif du recours au CDD]"}.
          
          ${data.contrat.personneRemplacee ? `Ce contrat est conclu pour le remplacement de ${data.contrat.personneRemplacee}.` : ""}
          
          Il est régi par le Code du travail et la convention collective ${data.employeur.conventionCollective || "applicable à l'entreprise"} ${data.employeur.codeConvention ? `(IDCC: ${data.employeur.codeConvention})` : ""}.
        `
      },
      {
        id: "indemnite",
        title: "Article 9 : INDEMNITÉ DE FIN DE CONTRAT",
        template: (data: ContractData) => `
          À l'issue du contrat, le Salarié percevra une indemnité de fin de contrat égale à 10% de la rémunération totale brute perçue pendant la durée du contrat, sauf dans les cas d'exclusion prévus par la loi.
        `
      }
    ]
  },
  
  CDD_temps_partiel: {
    title: "CONTRAT DE TRAVAIL À DURÉE DÉTERMINÉE À TEMPS PARTIEL",
    articles: [
      // Combinaison des spécificités CDD et temps partiel
    ]
  }
};

// Clauses additionnelles optionnelles
const OPTIONAL_CLAUSES = {
  confidentialite: {
    title: "CLAUSE DE CONFIDENTIALITÉ",
    template: (data: ContractData) => `
      Le Salarié s'engage à respecter la plus stricte confidentialité en ce qui concerne les informations de toute nature auxquelles il aura accès dans le cadre de ses fonctions.
      
      Cette obligation de confidentialité s'applique pendant toute la durée du contrat et persistera après la rupture de celui-ci, quelle qu'en soit la cause, pour une durée indéterminée.
    `
  },
  nonConcurrence: {
    title: "CLAUSE DE NON-CONCURRENCE",
    template: (data: ContractData) => `
      En raison de la nature des fonctions exercées et des informations détenues par le Salarié, ce dernier s'interdit, en cas de rupture du présent contrat de travail, quelle qu'en soit la cause, de s'intéresser directement ou indirectement, à quelque titre que ce soit, à toute entreprise ayant une activité concurrente de celle de l'Employeur.
      
      Cette interdiction s'applique pendant une durée de ${data.clauses.nonConcurrence.duree} mois à compter de la date de rupture effective du contrat de travail et dans le périmètre géographique suivant : ${data.clauses.nonConcurrence.zone}.
      
      En contrepartie de cette obligation, le Salarié percevra, après la rupture effective du contrat de travail et pendant la durée de l'interdiction, une indemnité mensuelle égale à ${data.clauses.nonConcurrence.indemnite}% de la moyenne mensuelle des salaires perçus par lui au cours des 12 derniers mois de présence dans l'entreprise.
      
      L'Employeur se réserve la possibilité de renoncer à l'application de cette clause, auquel cas il en informera le Salarié par écrit au plus tard à la date de rupture effective du contrat de travail.
    `
  },
  mobilite: {
    title: "CLAUSE DE MOBILITÉ",
    template: (data: ContractData) => `
      Le lieu de travail du Salarié est fixé à ${data.contrat.lieuTravail}.
      
      Toutefois, compte tenu de la nature des fonctions du Salarié et des nécessités de l'entreprise, ce dernier accepte d'exercer son activité dans tout autre établissement de l'entreprise situé dans le périmètre suivant : ${data.clauses.mobilite.perimetre}.
      
      En cas de changement temporaire ou définitif du lieu de travail, le Salarié en sera informé avec un préavis raisonnable.
    `
  },
  exclusivite: {
    title: "CLAUSE D'EXCLUSIVITÉ",
    template: (data: ContractData) => `
      Pendant toute la durée du présent contrat, le Salarié s'engage à consacrer l'intégralité de son activité professionnelle à l'exécution de son contrat.
      
      Le Salarié s'interdit donc d'exercer, directement ou indirectement, à titre gratuit ou onéreux, toute autre activité professionnelle, sauf accord écrit préalable de l'Employeur.
    `
  },
  teletravail: {
    title: "CLAUSE DE TÉLÉTRAVAIL",
    template: (data: ContractData) => `
      Le Salarié exercera ses fonctions en télétravail selon les modalités suivantes : ${data.clauses.teletravail.modalites}.
      
      Le Salarié s'engage à disposer d'un espace de travail adapté et d'une connexion internet permettant l'exercice normal de ses fonctions en télétravail.
      
      L'Employeur mettra à disposition du Salarié les équipements nécessaires à l'exécution de ses fonctions en télétravail.
    `
  },
  proprieteIntellectuelle: {
    title: "CLAUSE DE PROPRIÉTÉ INTELLECTUELLE",
    template: (data: ContractData) => `
      Conformément aux dispositions légales, le Salarié cède à l'Employeur, à titre exclusif, l'intégralité des droits de propriété intellectuelle sur toutes les œuvres, inventions et créations qu'il pourrait réaliser dans le cadre de ses fonctions.
      
      Cette cession est consentie pour la durée des droits de propriété intellectuelle concernés et pour le monde entier.
    `
  },
  deditFormation: {
    title: "CLAUSE DE DÉDIT-FORMATION",
    template: (data: ContractData) => `
      En cas de départ volontaire du Salarié avant l'expiration d'un délai de [X] mois suivant une formation financée par l'Employeur dont le coût dépasserait [Y] euros, le Salarié s'engage à rembourser à l'Employeur tout ou partie des frais de formation selon les modalités suivantes : ${data.clauses.deditFormation.conditions}.
    `
  }
};

// Fonction principale pour générer le contrat
export function generateContractFromTemplate(contractData: ContractData) {
  // Déterminer le type de contrat
  const contractType = contractData.contrat.type;
  
  // Obtenir le template correspondant au type de contrat
  const template = CONTRACT_TEMPLATES[contractType] || CONTRACT_TEMPLATES.CDI_temps_plein;
  
  // Générer le contenu du contrat à partir du template
  let contractContent = `
    <h1 style="text-align: center;">${template.title}</h1>
    
    <div style="margin-bottom: 20px;">
  `;
  
  // Ajouter chaque article du template
  template.articles.forEach(article => {
    contractContent += `
      <h2>${article.title}</h2>
      <div>${article.template(contractData)}</div>
    `;
  });
  
  // Ajouter les clauses optionnelles
  const clauses = contractData.clauses;
  
  if (clauses.confidentialite) {
    contractContent += `
      <h2>${OPTIONAL_CLAUSES.confidentialite.title}</h2>
      <div>${OPTIONAL_CLAUSES.confidentialite.template(contractData)}</div>
    `;
  }
  
  if (clauses.nonConcurrence.active) {
    contractContent += `
      <h2>${OPTIONAL_CLAUSES.nonConcurrence.title}</h2>
      <div>${OPTIONAL_CLAUSES.nonConcurrence.template(contractData)}</div>
    `;
  }
  
  if (clauses.mobilite.active) {
    contractContent += `
      <h2>${OPTIONAL_CLAUSES.mobilite.title}</h2>
      <div>${OPTIONAL_CLAUSES.mobilite.template(contractData)}</div>
    `;
  }
  
  if (clauses.exclusivite) {
    contractContent += `
      <h2>${OPTIONAL_CLAUSES.exclusivite.title}</h2>
      <div>${OPTIONAL_CLAUSES.exclusivite.template(contractData)}</div>
    `;
  }
  
  if (clauses.teletravail.active) {
    contractContent += `
      <h2>${OPTIONAL_CLAUSES.teletravail.title}</h2>
      <div>${OPTIONAL_CLAUSES.teletravail.template(contractData)}</div>
    `;
  }
  
  if (clauses.proprieteIntellectuelle) {
    contractContent += `
      <h2>${OPTIONAL_CLAUSES.proprieteIntellectuelle.title}</h2>
      <div>${OPTIONAL_CLAUSES.proprieteIntellectuelle.template(contractData)}</div>
    `;
  }
  
  if (clauses.deditFormation.active) {
    contractContent += `
      <h2>${OPTIONAL_CLAUSES.deditFormation.title}</h2>
      <div>${OPTIONAL_CLAUSES.deditFormation.template(contractData)}</div>
    `;
  }
  
  // Ajouter la section signature
  contractContent += `
    <h2>SIGNATURE</h2>
    <div>
      Fait en deux exemplaires originaux à ${contractData.generation.lieuSignature || "_________________"}, le ${contractData.generation.dateSignature ? format(new Date(contractData.generation.dateSignature), "dd MMMM yyyy", { locale: fr }) : "_______________"}.
      
      <div style="display: flex; justify-content: space-between; margin-top: 40px;">
        <div>
          <p><strong>Pour l'Employeur</strong></p>
          <p>${contractData.employeur.representant}</p>
          <p>${contractData.employeur.fonction}</p>
          <p style="margin-top: 50px;">Signature</p>
        </div>
        
        <div>
          <p><strong>Le Salarié</strong></p>
          <p>${contractData.salarie.civilite} ${contractData.salarie.prenom} ${contractData.salarie.nom}</p>
          <p>Mention "Lu et approuvé"</p>
          <p style="margin-top: 50px;">Signature</p>
        </div>
      </div>
    </div>
  `;
  
  contractContent += `
    </div>
  `;
  
  return contractContent;
} 