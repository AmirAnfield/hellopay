import React from 'react';
import { AIContractMemory } from '@/types/firebase';
import { Loader2 } from 'lucide-react';

interface ContractPreviewProps {
  memory: AIContractMemory | null;
  isLoading?: boolean;
}

export function ContractPreview({ memory, isLoading = false }: ContractPreviewProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 h-full overflow-auto">
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p className="text-muted-foreground">Génération du contrat en cours...</p>
        </div>
      </div>
    );
  }

  if (!memory || (!memory.company?.name && !memory.employee?.fullName)) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 h-full overflow-auto">
        <h3 className="text-lg font-medium border-b pb-3 mb-5">Aperçu du contrat</h3>
        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-20">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <line x1="10" y1="9" x2="8" y2="9"></line>
          </svg>
          <p className="text-center max-w-xs">Sélectionnez une entreprise et un employé pour visualiser l'aperçu du contrat</p>
        </div>
      </div>
    );
  }

  // Déterminer le type de contrat pour l'affichage
  const getContractTypeDisplay = () => {
    switch (memory.contractType) {
      case 'CDI_temps_plein':
        return 'Contrat à durée indéterminée à temps plein';
      case 'CDI_temps_partiel':
        return 'Contrat à durée indéterminée à temps partiel';
      case 'CDD_temps_plein':
        return 'Contrat à durée déterminée à temps plein';
      case 'CDD_temps_partiel':
        return 'Contrat à durée déterminée à temps partiel';
      default:
        return 'Contrat de travail';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 h-full overflow-auto">
      <h3 className="text-lg font-medium border-b pb-3 mb-5">Aperçu du contrat</h3>
      
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold uppercase mb-2">CONTRAT DE TRAVAIL</h1>
          <p className="text-muted-foreground">
            {getContractTypeDisplay()}
          </p>
        </div>
        
        <div className="space-y-5">
          <h2 className="font-semibold text-lg">ENTRE LES SOUSSIGNÉS :</h2>
          
          <div className="pl-4 space-y-1">
            {memory.company?.name && (
              <>
                <p><span className="font-medium">{memory.company.name}</span>{memory.company?.siret && `, SIRET ${memory.company.siret}`}</p>
                {(memory.company?.address || memory.company?.postalCode || memory.company?.city) && (
                  <p>Dont le siège social est situé {memory.company.address || ''} {memory.company.postalCode || ''} {memory.company.city || ''}</p>
                )}
                <p className="font-medium mt-2">Ci-après désignée "l'employeur"</p>
              </>
            )}
          </div>
          
          <div className="pl-4 space-y-1">
            <p>ET</p>
            {memory.employee?.fullName && (
              <>
                <p className="mt-2"><span className="font-medium">{memory.employee.fullName}</span></p>
                {memory.employee.birthDate && memory.employee.birthPlace && (
                  <p>Né(e) le {memory.employee.birthDate} à {memory.employee.birthPlace}</p>
                )}
                {(memory.employee?.address || memory.employee?.postalCode || memory.employee?.city) && (
                  <p>Demeurant {memory.employee.address || ''} {memory.employee.postalCode || ''} {memory.employee.city || ''}</p>
                )}
                {memory.employee.socialSecurityNumber && (
                  <p>Numéro de sécurité sociale : {memory.employee.socialSecurityNumber}</p>
                )}
                <p className="font-medium mt-2">Ci-après désigné(e) "le salarié"</p>
              </>
            )}
          </div>
        </div>
        
        {/* Clauses du contrat générées par l'IA */}
        {memory.clauses.introduction && (
          <div className="space-y-5 mt-8">
            <h2 className="font-semibold text-lg">PRÉAMBULE</h2>
            <div className="pl-4 whitespace-pre-line">{memory.clauses.introduction}</div>
          </div>
        )}
        
        {memory.fields.position && (
          <div className="space-y-5 mt-8">
            <h2 className="font-semibold text-lg">ARTICLE 1 - ENGAGEMENT ET QUALIFICATION</h2>
            <p className="pl-4">Le salarié est engagé en qualité de <span className="font-medium">{memory.fields.position}</span>
              {memory.fields.qualification && `, statut ${memory.fields.qualification}`}.
            </p>
          </div>
        )}
        
        {memory.clauses.duties && (
          <div className="space-y-5 mt-8">
            <h2 className="font-semibold text-lg">ARTICLE 2 - FONCTIONS</h2>
            <div className="pl-4 whitespace-pre-line">{memory.clauses.duties}</div>
          </div>
        )}
        
        {memory.clauses.duration && (
          <div className="space-y-5 mt-8">
            <h2 className="font-semibold text-lg">ARTICLE 3 - DURÉE DU CONTRAT</h2>
            <div className="pl-4 whitespace-pre-line">{memory.clauses.duration}</div>
          </div>
        )}
        
        {memory.clauses.trialPeriod && (
          <div className="space-y-5 mt-8">
            <h2 className="font-semibold text-lg">ARTICLE 4 - PÉRIODE D'ESSAI</h2>
            <div className="pl-4 whitespace-pre-line">{memory.clauses.trialPeriod}</div>
          </div>
        )}
        
        {memory.clauses.workingTime && (
          <div className="space-y-5 mt-8">
            <h2 className="font-semibold text-lg">ARTICLE 5 - DURÉE DU TRAVAIL</h2>
            <div className="pl-4 whitespace-pre-line">{memory.clauses.workingTime}</div>
          </div>
        )}
        
        {memory.clauses.remuneration && (
          <div className="space-y-5 mt-8">
            <h2 className="font-semibold text-lg">ARTICLE 6 - RÉMUNÉRATION</h2>
            <div className="pl-4 whitespace-pre-line">{memory.clauses.remuneration}</div>
          </div>
        )}
        
        {memory.clauses.termination && (
          <div className="space-y-5 mt-8">
            <h2 className="font-semibold text-lg">ARTICLE 7 - RUPTURE DU CONTRAT</h2>
            <div className="pl-4 whitespace-pre-line">{memory.clauses.termination}</div>
          </div>
        )}
        
        {/* Afficher les clauses supplémentaires si elles existent */}
        {Object.entries(memory.clauses)
          .filter(([key]) => !['introduction', 'duties', 'duration', 'trialPeriod', 'workingTime', 'remuneration', 'termination'].includes(key))
          .filter(([_, value]) => value)
          .map(([key, value], index) => (
            <div key={key} className="space-y-5 mt-8">
              <h2 className="font-semibold text-lg">ARTICLE {index + 8} - {key.toUpperCase()}</h2>
              <div className="pl-4 whitespace-pre-line">{value}</div>
            </div>
          ))}
        
        {/* Message indiquant que le contrat est en cours de création */}
        <div className="text-center text-muted-foreground italic mt-8">
          <p>Aperçu du contrat - les détails seront complétés au fur et à mesure de votre progression</p>
          <p className="text-xs mt-1">Étape actuelle: {memory.step}/4</p>
        </div>
      </div>
    </div>
  );
} 