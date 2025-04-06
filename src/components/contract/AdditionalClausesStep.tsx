import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Info, Check, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ContractType } from '@/types/contract';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export interface AdditionalClauses {
  selectedClauses: string[];
}

interface ClauseDefinition {
  id: string;
  title: string;
  description: string;
  content: string;
  availableFor: ('CDI' | 'CDD' | 'both')[];
  recommended: boolean;
}

interface AdditionalClausesStepProps {
  onSaveClauses: (data: AdditionalClauses) => Promise<void>;
  initialData?: AdditionalClauses;
  contractType: ContractType;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

// Liste des clauses disponibles
const AVAILABLE_CLAUSES: ClauseDefinition[] = [
  {
    id: 'confidentiality',
    title: 'Clause de confidentialité',
    description: 'Oblige le salarié à ne pas divulguer d\'informations confidentielles pendant et après le contrat',
    content: `Le Salarié s'engage à conserver une discrétion absolue sur l'ensemble des informations auxquelles il pourrait avoir accès, directement ou indirectement, du fait de ses fonctions au sein de l'Entreprise.

Cette obligation de confidentialité concerne l'ensemble des informations relatives à l'Entreprise, à ses clients, à ses méthodes et savoir-faire, à son organisation, ses résultats et plus généralement à son activité.

Le Salarié s'engage à ne pas divulguer ces informations ni à les exploiter à titre personnel ou au profit de tiers, pendant toute la durée de son contrat et pendant une période de 5 ans après la cessation de celui-ci, quelle qu'en soit la cause.

Le non-respect de cette clause est susceptible d'entraîner des poursuites judiciaires et la mise en cause de la responsabilité civile et/ou pénale du Salarié.`,
    availableFor: ['both'],
    recommended: true
  },
  {
    id: 'exclusivity',
    title: 'Clause d\'exclusivité',
    description: 'Interdit au salarié d\'exercer une autre activité professionnelle pendant la durée du contrat',
    content: `Compte tenu de la nature des fonctions du Salarié, de leur importance et de la confiance qui préside aux relations professionnelles, le Salarié s'engage à consacrer l'intégralité de son activité professionnelle au service de l'Entreprise.

En conséquence, pendant toute la durée du présent contrat, le Salarié s'engage à ne pas exercer d'autre activité professionnelle, salariée ou non, sans l'accord écrit préalable de l'Entreprise.

En cas de non-respect de cette clause, l'Entreprise pourra mettre fin au contrat de travail pour faute grave, sans préjudice de dommages et intérêts éventuels.`,
    availableFor: ['CDI'],
    recommended: false
  },
  {
    id: 'non_compete',
    title: 'Clause de non-concurrence',
    description: 'Interdit au salarié de travailler pour un concurrent après la fin du contrat',
    content: `À l'issue du contrat, quelle qu'en soit la cause, le Salarié s'interdit pendant une durée de [durée] mois, d'exercer, directement ou indirectement, à titre personnel ou pour le compte d'un tiers, une activité concurrente à celle de l'Entreprise.

Cette interdiction s'applique dans les départements suivants : [liste des départements].

En contrepartie de cette obligation, le Salarié percevra, après la rupture effective du contrat et pendant toute la durée d'application de cette clause, une indemnité mensuelle spéciale égale à [pourcentage]% de la moyenne mensuelle des salaires perçus au cours des 12 derniers mois précédant la rupture du contrat.

En cas de violation de cette clause, le Salarié sera redevable d'une pénalité fixée à [montant] euros, l'Entreprise étant alors libérée du versement de l'indemnité prévue, et pouvant en outre demander le remboursement des indemnités déjà versées.

L'Entreprise se réserve le droit de renoncer à l'application de cette clause, auquel cas l'indemnité ne sera pas due. Cette renonciation devra être notifiée au Salarié par écrit dans un délai de 15 jours suivant la notification de la rupture du contrat.`,
    availableFor: ['CDI'],
    recommended: true
  },
  {
    id: 'intellectual_property',
    title: 'Clause de propriété intellectuelle',
    description: 'Attribue à l\'employeur les droits sur les créations réalisées par le salarié',
    content: `Le Salarié reconnaît que tous les droits de propriété intellectuelle sur les œuvres, logiciels, bases de données, créations, inventions et plus généralement tous les travaux qu'il pourrait réaliser dans le cadre de ses fonctions appartiennent à l'Entreprise, conformément aux dispositions légales.

En conséquence, le Salarié cède à l'Entreprise, à titre exclusif, l'ensemble des droits patrimoniaux d'auteur sur ses créations, notamment les droits de reproduction, de représentation, d'adaptation, de modification, de commercialisation, et ce pour toute la durée légale de protection des droits et pour le monde entier.

Cette cession est consentie sans contrepartie financière supplémentaire, la rémunération du Salarié comprenant le prix de cette cession.

Le Salarié s'engage à informer l'Entreprise de toute invention qu'il pourrait réaliser dans le cadre de ses fonctions et à ne pas déposer, en son nom propre, de brevet ou autre titre de propriété industrielle.`,
    availableFor: ['both'],
    recommended: true
  },
  {
    id: 'remote_work',
    title: 'Clause de télétravail',
    description: 'Définit les conditions de travail à distance pour le salarié',
    content: `Le Salarié pourra exercer ses fonctions en télétravail, selon les modalités suivantes :

- Fréquence : [nombre] jours par semaine, les [jours concernés]
- Lieu du télétravail : au domicile du Salarié situé à l'adresse mentionnée au début du présent contrat
- Plages horaires : les mêmes que celles prévues à l'article relatif à la durée du travail

L'Entreprise mettra à disposition du Salarié le matériel nécessaire à l'exercice de ses fonctions en télétravail. Ce matériel reste la propriété de l'Entreprise et devra être restitué en cas de cessation du contrat de travail.

Le Salarié s'engage à prendre soin du matériel confié, à respecter les règles de sécurité informatique de l'Entreprise et à préserver la confidentialité des informations.

Le Salarié bénéficie des mêmes droits et est soumis aux mêmes obligations que les salariés travaillant dans les locaux de l'Entreprise.

L'Entreprise ou le Salarié peut décider, à tout moment, de mettre fin au télétravail, moyennant un délai de prévenance de [durée].`,
    availableFor: ['both'],
    recommended: false
  },
  {
    id: 'salary_bonus',
    title: 'Clause de prime sur objectifs',
    description: 'Prévoit une rémunération variable en fonction d\'objectifs définis',
    content: `En complément de sa rémunération fixe, le Salarié pourra percevoir une prime annuelle variable conditionnée à l'atteinte d'objectifs.

Cette prime, d'un montant maximum brut de [montant] euros par an, sera calculée selon les critères suivants :
- [critère 1] : [pourcentage]%
- [critère 2] : [pourcentage]%
- [critère 3] : [pourcentage]%

Les objectifs précis seront fixés chaque année lors d'un entretien entre le Salarié et sa hiérarchie.

La prime sera versée au plus tard dans les trois mois suivant la fin de la période d'évaluation, sous réserve que le Salarié soit toujours présent dans l'Entreprise à cette date.

L'Entreprise se réserve le droit de modifier les critères d'attribution de la prime ainsi que son montant, après information préalable du Salarié.`,
    availableFor: ['both'],
    recommended: false
  },
  {
    id: 'renewal_preference',
    title: 'Clause de priorité de réembauche',
    description: 'Donne priorité au salarié pour un emploi similaire après la fin du CDD',
    content: `À l'issue du présent contrat à durée déterminée, le Salarié bénéficiera d'une priorité de réembauche sur un poste similaire dans l'Entreprise, dans les conditions prévues par l'article L.1244-2 du Code du travail.

Pour bénéficier de cette priorité, le Salarié devra faire connaître son souhait par écrit à l'Entreprise dans un délai de trois mois suivant la fin du contrat.

La priorité de réembauche est valable pendant une durée d'un an à compter de la date de fin du contrat à durée déterminée.`,
    availableFor: ['CDD'],
    recommended: true
  },
  {
    id: 'trial_period',
    title: 'Clause de période d\'essai',
    description: 'Définit une période d\'essai permettant de tester les compétences du salarié',
    content: `Le présent contrat comporte une période d'essai de [durée] [mois/semaines], conformément aux dispositions légales et conventionnelles.

Pendant cette période, chacune des parties pourra rompre le contrat sans indemnité, sous réserve du respect du délai de prévenance prévu par la loi.

Le délai de prévenance à respecter par l'Entreprise est de :
- 24 heures en deçà de 8 jours de présence
- 48 heures entre 8 jours et 1 mois de présence
- 2 semaines après 1 mois de présence
- 1 mois après 3 mois de présence

Le délai de prévenance à respecter par le Salarié est de :
- 24 heures en deçà de 8 jours de présence
- 48 heures à partir de 8 jours de présence

La période d'essai pourra être renouvelée une fois pour une durée de [durée] [mois/semaines], avec l'accord exprès des deux parties, formalisé par écrit avant le terme de la période initiale.`,
    availableFor: ['CDI'],
    recommended: true
  }
];

export function AdditionalClausesStep({
  onSaveClauses,
  initialData,
  contractType,
  isLoading,
  onBack,
  onNext
}: AdditionalClausesStepProps) {
  const [selectedClauses, setSelectedClauses] = useState<string[]>(
    initialData?.selectedClauses || []
  );

  // Filtrer les clauses disponibles en fonction du type de contrat
  const availableClauses = AVAILABLE_CLAUSES.filter(clause => 
    clause.availableFor.includes('both') || clause.availableFor.includes(contractType)
  );

  // Gérer la sélection/désélection d'une clause
  const toggleClause = (clauseId: string) => {
    if (selectedClauses.includes(clauseId)) {
      setSelectedClauses(selectedClauses.filter(id => id !== clauseId));
    } else {
      setSelectedClauses([...selectedClauses, clauseId]);
    }
  };

  const handleSave = async () => {
    const data: AdditionalClauses = {
      selectedClauses
    };
    
    await onSaveClauses(data);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Clauses supplémentaires</h2>
        <p className="text-gray-500">
          Sélectionnez les clauses additionnelles à inclure dans votre contrat
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-700 font-medium">
              Personnalisez votre contrat avec des clauses supplémentaires
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Les clauses marquées comme "Recommandées" sont généralement incluses dans les contrats de ce type.
              Vous pouvez consulter le contenu de chaque clause en cliquant dessus.
            </p>
          </div>
        </div>
      </div>

      <Alert variant="default" className="bg-yellow-50 border-yellow-200">
        <Info className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Important</AlertTitle>
        <AlertDescription className="text-yellow-700">
          Certaines clauses (comme la non-concurrence) nécessitent d&apos;être adaptées à votre situation spécifique.
          Consultez un professionnel du droit si vous avez des doutes sur leur application.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {availableClauses.map((clause) => (
          <div 
            key={clause.id} 
            className={cn(
              "border rounded-md transition-colors",
              selectedClauses.includes(clause.id) 
                ? "border-green-200 bg-green-50" 
                : "border-gray-200 hover:border-gray-300 bg-white"
            )}
          >
            <div className="flex items-center p-4">
              <Checkbox
                id={`clause-${clause.id}`}
                checked={selectedClauses.includes(clause.id)}
                onCheckedChange={() => toggleClause(clause.id)}
                disabled={isLoading}
                className="mr-3"
              />
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <Label 
                    htmlFor={`clause-${clause.id}`} 
                    className="font-medium cursor-pointer text-base"
                  >
                    {clause.title}
                  </Label>
                  
                  {clause.recommended && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Recommandée
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{clause.description}</p>
              </div>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={clause.id} className="border-t border-gray-200">
                <AccordionTrigger className="px-4 py-2 text-sm">
                  Voir le contenu
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="whitespace-pre-line text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
                    {clause.content}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>

      <Separator />

      <div className="mt-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Aperçu des clauses sélectionnées</h3>
          <span className="text-sm text-gray-600">
            {selectedClauses.length} clause{selectedClauses.length !== 1 ? 's' : ''} sélectionnée{selectedClauses.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {selectedClauses.length > 0 ? (
          <div className="space-y-2">
            {selectedClauses.map((clauseId) => {
              const clause = AVAILABLE_CLAUSES.find(c => c.id === clauseId);
              return (
                <div key={clauseId} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{clause?.title}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <X className="h-5 w-5 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Aucune clause supplémentaire sélectionnée</p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <Button 
          onClick={handleSave}
          disabled={isLoading} 
          className="flex items-center"
        >
          {isLoading ? 'Enregistrement...' : 'Continuer'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 