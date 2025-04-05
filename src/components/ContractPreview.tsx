import React, { useMemo } from 'react';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

// Définir une interface pour les styles de templates
interface TemplateStyles {
  container: string;
  title: string;
  subtitle: string;
  sectionTitle: string;
  section: string;
  signatures: string;
}

// Interface pour les données du contrat
export interface ContractData {
  company?: string;
  employee?: string;
  contractType?: string;
  convention?: string;
  position?: string;
  salary?: number;
  salaryUnit?: string;
  startDate?: string;
  endDate?: string;
  trialPeriod?: string;
  workingHours?: string;
  workLocation?: string;
  specificClauses?: string[];
  templateId?: string;
  [key: string]: unknown;
}

interface ContractPreviewProps {
  data: ContractData;
  onClose: () => void;
  templateId?: string;
  realtime?: boolean;
  contractTypes?: Array<{ id: string; title: string; description: string }>;
  conventions?: Array<{ id: string; name: string; idcc: string }>;
}

export default function ContractPreview({ 
  data, 
  onClose, 
  templateId = 'standard',
  realtime = false,
  contractTypes = [],
  conventions = []
}: ContractPreviewProps) {
  
  // Récupérer le nom du type de contrat
  const contractTypeName = useMemo(() => {
    const type = contractTypes.find(t => t.id === data.contractType);
    return type?.title || data.contractType || 'Contrat de travail';
  }, [data.contractType, contractTypes]);
  
  // Récupérer le nom de la convention collective
  const conventionName = useMemo(() => {
    const convention = conventions.find(c => c.id === data.convention);
    return convention?.name || 'Non spécifiée';
  }, [data.convention, conventions]);
  
  // Déterminer si c'est un CDD ou une autre forme de contrat à durée limitée
  const isLimitedDuration = useMemo(() => {
    return data.contractType?.includes('CDD') || 
           data.contractType === 'apprentissage' || 
           data.contractType === 'professionnalisation';
  }, [data.contractType]);
  
  // Récupérer les styles du template
  const templateStyles: TemplateStyles = useMemo(() => {
    switch (templateId) {
      case 'moderne':
        return {
          container: "bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto",
          title: "text-center text-2xl font-bold mb-8 text-indigo-700",
          subtitle: "text-center font-medium mb-8 text-gray-500",
          sectionTitle: "text-lg font-semibold mb-3 text-indigo-600 border-b border-indigo-100 pb-1",
          section: "mb-6",
          signatures: "mt-10 grid grid-cols-2 gap-10"
        };
      case 'juridique':
        return {
          container: "bg-white rounded-lg shadow border border-gray-300 p-8 max-w-5xl mx-auto font-serif",
          title: "text-center text-xl font-bold mb-6 text-gray-800",
          subtitle: "text-center font-medium mb-6 text-gray-600",
          sectionTitle: "text-base font-bold mb-2 text-gray-800 uppercase tracking-wide",
          section: "mb-5 text-sm",
          signatures: "mt-12 flex justify-between"
        };
      case 'standard':
      default:
        return {
          container: "bg-white rounded-lg shadow-sm border p-6 max-w-4xl mx-auto",
          title: "text-center text-xl font-bold mb-6",
          subtitle: "text-center font-semibold mb-6",
          sectionTitle: "text-lg font-semibold mb-2",
          section: "mb-4",
          signatures: "flex justify-between mt-6"
        };
    }
  }, [templateId]);
  
  return (
    <div className={templateStyles.container}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">
          {realtime ? "Prévisualisation en temps réel" : "Aperçu du contrat"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
      
      <div className="prose max-w-none">
        <h1 className={templateStyles.title}>CONTRAT DE TRAVAIL</h1>
        
        <div className={templateStyles.subtitle}>
          {contractTypeName}
        </div>
        
        <div className={templateStyles.section}>
          <p>Entre les soussignés :</p>
          <p><strong>L&apos;employeur :</strong> {data.company || &apos;[Nom de l&apos;entreprise]&apos;}</p>
          <p><strong>Convention collective applicable :</strong> {conventionName}</p>
          <p><strong>Et l&apos;employé(e) :</strong> {data.employee || &apos;[Nom de l&apos;employé(e)]&apos;}</p>
        </div>
        
        <div className={templateStyles.section}>
          <h2 className={templateStyles.sectionTitle}>Article 1 - Fonction</h2>
          <p>Le/La salarié(e) est engagé(e) en qualité de {data.position || &apos;[Poste]&apos;}.</p>
        </div>
        
        <div className={templateStyles.section}>
          <h2 className={templateStyles.sectionTitle}>Article 2 - Durée du contrat</h2>
          {isLimitedDuration ? (
            <p>Le présent contrat est conclu pour une durée déterminée. Il commence le {data.startDate || &apos;[Date de début]&apos;} et se termine le {data.endDate || &apos;[Date de fin]&apos;}.</p>
          ) : (
            <p>Le présent contrat est conclu pour une durée indéterminée à compter du {data.startDate || &apos;[Date de début]&apos;}.</p>
          )}
        </div>
        
        <div className={templateStyles.section}>
          <h2 className={templateStyles.sectionTitle}>Article 3 - Rémunération</h2>
          <p>En contrepartie de son travail, le/la salarié(e) percevra une rémunération {data.salaryUnit || &apos;mensuelle brute&apos;} de {data.salary || &apos;[Montant]&apos;} euros.</p>
        </div>
        
        <div className={templateStyles.section}>
          <h2 className={templateStyles.sectionTitle}>Article 4 - Durée du travail</h2>
          {data.contractType?.includes(&apos;temps_partiel&apos;) ? (
            <p>Le/La salarié(e) est engagé(e) à temps partiel. L&apos;horaire hebdomadaire est fixé à {data.workingHours || &apos;24 heures&apos;}.</p>
          ) : (
            <p>Le/La salarié(e) est engagé(e) à temps plein. L&apos;horaire hebdomadaire est fixé à 35 heures, conformément à la durée légale du travail.</p>
          )}
        </div>
        
        <div className={templateStyles.section}>
          <h2 className={templateStyles.sectionTitle}>Article 5 - Période d&apos;essai</h2>
          <p>Le présent contrat est soumis à une période d&apos;essai de {data.trialPeriod || (data.contractType?.includes(&apos;CDI&apos;) ? &apos;2 mois&apos; : &apos;2 semaines&apos;)}.</p>
        </div>
        
        {data.specificClauses && data.specificClauses.length > 0 && !data.specificClauses.includes(&apos;aucune&apos;) && (
          <div className={templateStyles.section}>
            <h2 className={templateStyles.sectionTitle}>Article 6 - Clauses spécifiques</h2>
            {data.specificClauses.includes(&apos;non_concurrence&apos;) && (
              <div className="mb-2">
                <h3 className="font-medium text-base">Clause de non-concurrence</h3>
                <p>Pendant la durée du présent contrat et après sa cessation, quelle qu&apos;en soit la cause, le salarié s&apos;interdit d&apos;exercer une activité concurrente à celle de l&apos;employeur, directement ou indirectement, pour son compte ou pour le compte d&apos;un tiers. Cette interdiction est limitée à une durée de 12 mois et au territoire français. En contrepartie, le salarié percevra une indemnité mensuelle égale à 30% de son salaire moyen des 12 derniers mois.</p>
              </div>
            )}
            
            {data.specificClauses.includes(&apos;confidentialite&apos;) && (
              <div className="mb-2">
                <h3 className="font-medium text-base">Clause de confidentialité</h3>
                <p>Le salarié s&apos;engage à observer une discrétion absolue sur l&apos;ensemble des informations auxquelles il a accès dans le cadre de ses fonctions. Cette obligation persiste après la fin du contrat de travail.</p>
              </div>
            )}
            
            {data.specificClauses.includes(&apos;mobilite&apos;) && (
              <div className="mb-2">
                <h3 className="font-medium text-base">Clause de mobilité</h3>
                <p>Le lieu de travail actuel du salarié pourra être modifié dans la région {data.workLocation?.split(&apos;,&apos;)[1] || &apos;Île-de-France&apos;} selon les nécessités de l&apos;entreprise. Le salarié en sera informé avec un préavis raisonnable.</p>
              </div>
            )}
            
            {data.specificClauses.includes(&apos;propriete_intellectuelle&apos;) && (
              <div className="mb-2">
                <h3 className="font-medium text-base">Clause de propriété intellectuelle</h3>
                <p>Les inventions, créations et développements réalisés par le salarié dans le cadre de ses fonctions appartiennent de plein droit à l&apos;employeur, conformément aux dispositions du Code de la propriété intellectuelle.</p>
              </div>
            )}
            
            {data.specificClauses.includes(&apos;renouvellement&apos;) && (
              <div className="mb-2">
                <h3 className="font-medium text-base">Clause de renouvellement</h3>
                <p>Le présent contrat pourra être renouvelé une fois pour une durée maximale égale à la durée initiale, sans que la durée totale du contrat puisse excéder la durée maximale prévue par la loi.</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-8">
          <p>Fait à __________________, le __________________</p>
          
          <div className={templateStyles.signatures}>
            <div>
              <p>L&apos;employeur</p>
              <p>(signature)</p>
            </div>
            
            <div>
              <p>Le/La salarié(e)</p>
              <p>(signature précédée de la mention &quot;lu et approuvé&quot;)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 