import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Download, Check, Printer } from 'lucide-react';
import { ContractType, ContractConfig } from '@/types/contract';
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Spinner } from '@/components/ui/spinner';
import { loadFullContract } from '@/services/contractLoadService';
import { exportContractToPDF } from '@/services/contractExportService';

interface PreviewArticle {
  title: string;
  content: string | React.ReactNode;
  isIncluded: boolean;
}

// Types pour les articles du contrat
interface Article1Nature {
  motif?: string;
  duree?: string;
}

interface Article2EntryDate {
  startDate: string;
  trialPeriod: string;
}

interface Article2CDDEntry {
  startDate: string;
  endDate: string;
  hasTrialPeriod: boolean;
  trialPeriodDuration?: string;
}

interface Article3Functions {
  position: string;
  classification: string;
  responsibilities?: string;
}

interface Article4Workplace {
  address: string;
  includeMobilityClause: boolean;
  mobilityRadius?: number;
}

interface Article5WorkingSchedule {
  scheduleType: string;
  workingDays?: string;
}

interface Article6Remuneration {
  monthlySalary: number;
  hourlyRate: number;
  paymentDate: string;
}

interface Article7Benefits {
  hasNoBenefits: boolean;
  hasExpenseReimbursement: boolean;
  hasTransportAllowance: boolean;
  hasLunchVouchers: boolean;
  lunchVoucherAmount?: number;
  lunchVoucherEmployerContribution?: number;
  hasMutualInsurance: boolean;
  mutualInsuranceEmployerContribution?: number;
  hasProfessionalPhone: boolean;
}

interface Article8Leaves {
  collectiveAgreement: string;
  hasCustomLeaves: boolean;
  customLeavesDetails?: string;
}

interface Article9DataProtection {
  includeImageRights: boolean;
}

interface Article10Conduct {
  includeWorkClothes: boolean;
  includeInternalRules: boolean;
}

interface Article11Confidentiality {
  includeConfidentiality: boolean;
  includeIntellectualProperty: boolean;
}

interface Article12NonCompete {
  includeNonCompete: boolean;
  nonCompeteDuration?: string;
  nonCompeteArea?: string;
  nonCompeteCompensation?: number;
  includeNonSolicitation: boolean;
}

interface Article13Teleworking {
  includeTeleworking: boolean;
  teleworkingType?: 'regular' | 'occasional' | 'mixed';
  employerProvidesEquipment?: boolean;
}

interface Article14Termination {
  collectiveAgreement: string;
  noticePeriodCDI?: 'legal' | '1-month' | '2-months' | '3-months' | 'collective';
}

interface Articles {
  article1Nature?: Article1Nature;
  article2EntryDate?: Article2EntryDate;
  article2CDDEntry?: Article2CDDEntry;
  article3Functions?: Article3Functions;
  article4Workplace?: Article4Workplace;
  article5WorkingSchedule?: Article5WorkingSchedule;
  article6Remuneration?: Article6Remuneration;
  article7Benefits?: Article7Benefits;
  article8Leaves?: Article8Leaves;
  article9DataProtection?: Article9DataProtection;
  article10Conduct?: Article10Conduct;
  article11Confidentiality?: Article11Confidentiality;
  article12NonCompete?: Article12NonCompete;
  article13Teleworking?: Article13Teleworking;
  article14Termination?: Article14Termination;
  [key: string]: any;
}

interface ContractPreviewStepProps {
  onValidateContract: () => Promise<void>;
  contractConfig: ContractConfig;
  articles: Articles;
  isLoading: boolean;
  onBack: () => void;
}

export function ContractPreviewStep({
  onValidateContract,
  contractConfig,
  articles,
  isLoading,
  onBack,
}: ContractPreviewStepProps) {
  const isCDI = contractConfig.contractType === 'CDI';
  
  // Journaliser les articles reçus pour le débogage
  console.log("Articles reçus dans ContractPreviewStep:", articles);
  
  // Vérifier si des articles importants sont manquants
  const hasMissingImportantArticles = !articles.article3Functions || 
                                      !articles.article6Remuneration;
  
  // Calculer les articles à afficher
  const contractArticles: PreviewArticle[] = [
    {
      title: "Préambule",
      content: contractConfig.hasPreambule ? (
        <div className="space-y-2">
          <p className="text-gray-700">Le présent contrat est conclu dans le contexte suivant :</p>
          <ul className="list-disc pl-5">
            <li>Développement des activités de l&apos;entreprise</li>
            <li>Besoin de compétences spécifiques</li>
            <li>Volonté d&apos;établir une relation de travail durable et mutuellement bénéfique</li>
          </ul>
        </div>
      ) : (
        <p><em>Non inclus dans ce contrat</em></p>
      ),
      isIncluded: contractConfig.hasPreambule || false,
    },
    {
      title: "Article 1 – Nature du contrat",
      content: articles.article1Nature ? (
        <div className="space-y-2">
          <p className="font-medium text-gray-800">Type de contrat : <span className="font-bold">{isCDI ? 'Contrat à durée indéterminée (CDI)' : 'Contrat à durée déterminée (CDD)'}</span></p>
          
          {!isCDI && (
            <>
              <p className="font-medium text-gray-800">Motif du recours au CDD : <span className="font-normal">{articles.article1Nature?.motif || 'Non précisé'}</span></p>
              
              {articles.article1Nature?.duree && (
                <p className="font-medium text-gray-800">Durée prévue : <span className="font-normal">{articles.article1Nature.duree}</span></p>
              )}
              
              <p className="text-sm text-gray-600 mt-2">
                Ce contrat est soumis aux dispositions légales et réglementaires en vigueur, 
                notamment les articles L.1242-1 et suivants du Code du travail.
              </p>
            </>
          )}
          
          {isCDI && (
            <p className="text-sm text-gray-600 mt-2">
              Le présent contrat est conclu pour une durée indéterminée. Il est régi par les 
              dispositions légales et réglementaires applicables, ainsi que par les dispositions 
              de la convention collective applicable à l&apos;entreprise.
            </p>
          )}
        </div>
      ) : (
        <p>Contrat de travail à durée {isCDI ? 'indéterminée' : 'déterminée'}</p>
      ),
      isIncluded: true,
    },
    {
      title: "Article 2 – Entrée en fonction",
      content: isCDI ? (
        articles.article2EntryDate ? (
          <div className="space-y-2">
            <p className="font-medium text-gray-800">Date de prise de fonction : <span className="font-bold">{articles.article2EntryDate.startDate}</span></p>
            <p className="font-medium text-gray-800">Période d&apos;essai : <span className="font-bold">{articles.article2EntryDate.trialPeriod}</span></p>
            
            <p className="text-sm text-gray-600 mt-2">
              Durant cette période d&apos;essai, chacune des parties peut rompre le contrat de travail 
              sans indemnité ni préavis, dans les conditions prévues par la loi.
            </p>
          </div>
        ) : (
          <p>Date de prise de fonction et période d&apos;essai</p>
        )
      ) : (
        articles.article2CDDEntry ? (
          <div className="space-y-2">
            <p className="font-medium text-gray-800">Date de début : <span className="font-bold">{articles.article2CDDEntry.startDate}</span></p>
            <p className="font-medium text-gray-800">Date de fin : <span className="font-bold">{articles.article2CDDEntry.endDate}</span></p>
            
            {articles.article2CDDEntry.hasTrialPeriod && (
              <p className="font-medium text-gray-800">Période d&apos;essai : <span className="font-bold">{articles.article2CDDEntry.trialPeriodDuration}</span></p>
            )}
            
            <p className="text-sm text-gray-600 mt-2">
              Le contrat pourra être renouvelé dans les limites et conditions prévues par les 
              dispositions légales en vigueur, sous réserve d&apos;un accord exprès des parties.
            </p>
          </div>
        ) : (
          <p>Dates du contrat et période d&apos;essai</p>
        )
      ),
      isIncluded: true,
    },
    {
      title: "Article 3 – Fonctions",
      content: articles.article3Functions ? (
        <div className="space-y-2">
          <p className="font-medium text-gray-800">Poste : <span className="font-bold">{articles.article3Functions.position}</span></p>
          <p className="font-medium text-gray-800">Classification : <span className="font-bold">{articles.article3Functions.classification}</span></p>
          
          {articles.article3Functions.responsibilities && (
            <div>
              <p className="font-medium text-gray-800">Responsabilités :</p>
              <p className="text-gray-700 pl-2">{articles.article3Functions.responsibilities}</p>
            </div>
          )}
          
          <p className="text-sm text-gray-600 mt-2">
            Le salarié s&apos;engage à exécuter son travail avec soin et diligence, conformément aux 
            instructions qui lui seront données par la direction de l&apos;entreprise.
          </p>
        </div>
      ) : (
        <p>Définition du poste, classification et responsabilités</p>
      ),
      isIncluded: true,
    },
    {
      title: "Article 4 – Lieu de travail",
      content: articles.article4Workplace ? (
        <div className="space-y-2">
          <p className="font-medium text-gray-800">Adresse principale : <span className="font-bold">{articles.article4Workplace.address}</span></p>
          
          {articles.article4Workplace.includeMobilityClause && (
            <div>
              <p className="font-medium text-gray-800">Clause de mobilité :</p>
              <p className="text-gray-700">Le salarié pourra être amené à exercer ses fonctions dans un autre établissement 
              dans un rayon de <span className="font-bold">{articles.article4Workplace.mobilityRadius} km</span> autour du lieu de 
              travail principal, en fonction des nécessités de service.</p>
            </div>
          )}
          
          <p className="text-sm text-gray-600 mt-2">
            L&apos;employeur se réserve le droit de demander au salarié d&apos;effectuer des déplacements 
            professionnels temporaires selon les besoins de l&apos;entreprise.
          </p>
        </div>
      ) : (
        <p>Lieu d&apos;exercice de l&apos;activité professionnelle</p>
      ),
      isIncluded: true,
    },
    {
      title: "Article 5 – Durée et organisation du travail",
      content: articles.article5WorkingSchedule ? (
        <div className="space-y-2">
          <p className="font-medium text-gray-800">Durée hebdomadaire : <span className="font-bold">{contractConfig.workingHours}h</span> 
          {contractConfig.isPartTime ? " (temps partiel)" : " (temps plein)"}</p>
          
          <p className="font-medium text-gray-800">Horaires : <span className="font-bold">{articles.article5WorkingSchedule.scheduleType}</span></p>
          
          {contractConfig.isPartTime && articles.article5WorkingSchedule.workingDays && (
            <p className="font-medium text-gray-800">Jours travaillés : <span className="font-normal">{articles.article5WorkingSchedule.workingDays}</span></p>
          )}
          
          <p className="text-sm text-gray-600 mt-2">
            Ces horaires pourront être modifiés selon les nécessités de service, dans le respect
            des dispositions légales et conventionnelles relatives à la durée du travail.
          </p>
        </div>
      ) : (
        <p>Organisation du temps de travail et horaires</p>
      ),
      isIncluded: true,
    },
    {
      title: "Article 6 – Rémunération",
      content: articles.article6Remuneration ? (
        <div className="space-y-2">
          <p className="font-medium text-gray-800">Salaire mensuel brut : <span className="font-bold">{articles.article6Remuneration.monthlySalary}€</span></p>
          <p className="font-medium text-gray-800">Taux horaire : <span className="font-bold">{articles.article6Remuneration.hourlyRate}€/h</span></p>
          <p className="font-medium text-gray-800">Paiement : <span className="font-normal">le {articles.article6Remuneration.paymentDate} de chaque mois</span></p>
          
          <p className="text-sm text-gray-600 mt-2">
            Cette rémunération inclut tous les éléments de salaire prévus par les dispositions légales 
            et conventionnelles applicables. Elle pourra être revue dans le cadre des procédures
            d&apos;évaluation et de révision des salaires de l&apos;entreprise.
          </p>
        </div>
      ) : (
        <p>Rémunération et modalités de paiement</p>
      ),
      isIncluded: true,
    },
    {
      title: "Article 7 – Avantages et frais professionnels",
      content: articles.article7Benefits ? (
        articles.article7Benefits.hasNoBenefits ? (
          <p>Aucun avantage spécifique n&apos;est prévu au contrat</p>
        ) : (
          <div className="space-y-2">
            {articles.article7Benefits.hasExpenseReimbursement && (
              <p className="font-medium text-gray-800">✓ Remboursement de frais professionnels sur justificatifs</p>
            )}
            
            {articles.article7Benefits.hasTransportAllowance && (
              <p className="font-medium text-gray-800">✓ Remboursement des frais de transport à hauteur de 50%</p>
            )}
            
            {articles.article7Benefits.hasLunchVouchers && (
              <p className="font-medium text-gray-800">✓ Tickets restaurant : <span className="font-normal">{articles.article7Benefits.lunchVoucherAmount}€ 
              (dont {articles.article7Benefits.lunchVoucherEmployerContribution}% pris en charge par l&apos;employeur)</span></p>
            )}
            
            {articles.article7Benefits.hasMutualInsurance && (
              <p className="font-medium text-gray-800">✓ Mutuelle d&apos;entreprise : <span className="font-normal">
              {articles.article7Benefits.mutualInsuranceEmployerContribution}% pris en charge par l&apos;employeur</span></p>
            )}
            
            {articles.article7Benefits.hasProfessionalPhone && (
              <p className="font-medium text-gray-800">✓ Téléphone professionnel</p>
            )}
            
            <p className="text-sm text-gray-600 mt-2">
              Ces avantages sont soumis aux règles fiscales et sociales en vigueur et peuvent
              évoluer selon les dispositions légales et la politique de l&apos;entreprise.
            </p>
          </div>
        )
      ) : (
        <p>Avantages sociaux et remboursements de frais</p>
      ),
      isIncluded: true,
    },
    {
      title: "Article 8 – Congés et absences",
      content: articles.article8Leaves ? (
        <div className="space-y-2">
          <p className="font-medium text-gray-800">Convention collective applicable : <span className="font-bold">{articles.article8Leaves.collectiveAgreement}</span></p>
          <p className="font-medium text-gray-800">Congés légaux : <span className="font-normal">2,5 jours ouvrables par mois de travail effectif</span></p>
          
          {articles.article8Leaves.hasCustomLeaves && articles.article8Leaves.customLeavesDetails && (
            <div>
              <p className="font-medium text-gray-800">Congés supplémentaires :</p>
              <p className="text-gray-700 pl-2">{articles.article8Leaves.customLeavesDetails}</p>
            </div>
          )}
          
          <p className="text-sm text-gray-600 mt-2">
            Les congés devront être pris selon les modalités définies par l&apos;employeur et en accord
            avec les dispositions légales et conventionnelles. Toute absence doit être justifiée
            dans les conditions prévues par le règlement intérieur.
          </p>
        </div>
      ) : (
        <p>Congés payés et conditions d&apos;absence</p>
      ),
      isIncluded: true,
    },
    {
      title: "Article 9 – Données personnelles et droit à l'image",
      content: articles.article9DataProtection ? (
        <div className="space-y-2">
          <p className="font-medium text-gray-800">Clause RGPD : <span className="font-bold">Incluse</span></p>
          <p className="font-medium text-gray-800">Droit à l&apos;image : <span className="font-bold">
            {articles.article9DataProtection.includeImageRights ? 'Autorisé' : 'Non inclus'}</span></p>
          
          <p className="text-sm text-gray-600 mt-2">
            L&apos;employeur s&apos;engage à respecter les dispositions du RGPD concernant la collecte et
            le traitement des données personnelles du salarié. Le salarié est informé de ses droits
            d&apos;accès, de rectification et d&apos;opposition.
          </p>
        </div>
      ) : (
        <p>Conformité RGPD et droits d&apos;utilisation de l&apos;image</p>
      ),
      isIncluded: true,
    },
    {
      title: "Article 10 – Tenue et règles internes",
      content: articles.article10Conduct ? (
        <p>
          Attitude professionnelle : <strong>Requise</strong>
          <br />
          Tenue de travail : <strong>{articles.article10Conduct.includeWorkClothes ? 'Spécifiée' : 'Non applicable'}</strong>
          <br />
          Règlement intérieur : <strong>{articles.article10Conduct.includeInternalRules ? 'Mentionné' : 'Non référencé'}</strong>
        </p>
      ) : (
        <p>Engagement professionnel et règles de conduite</p>
      ),
      isIncluded: true,
    },
    {
      title: "Article 11 – Obligation de confidentialité et propriété intellectuelle",
      content: articles.article11Confidentiality ? (
        articles.article11Confidentiality.includeConfidentiality || articles.article11Confidentiality.includeIntellectualProperty ? (
          <p>
            {articles.article11Confidentiality.includeConfidentiality && (
              <>Confidentialité : <strong>Incluse</strong><br /></>
            )}
            {articles.article11Confidentiality.includeIntellectualProperty && (
              <>Propriété intellectuelle : <strong>Incluse</strong><br /></>
            )}
          </p>
        ) : (
          <p><em>Non inclus dans ce contrat</em></p>
        )
      ) : (
        <p>Confidentialité et propriété intellectuelle</p>
      ),
      isIncluded: articles.article11Confidentiality?.includeConfidentiality || articles.article11Confidentiality?.includeIntellectualProperty || false,
    },
    {
      title: "Article 12 – Non-concurrence et non-sollicitation",
      content: articles.article12NonCompete ? (
        articles.article12NonCompete.includeNonCompete || articles.article12NonCompete.includeNonSolicitation ? (
          <p>
            {articles.article12NonCompete.includeNonCompete && (
              <>
                Non-concurrence : <strong>{articles.article12NonCompete.nonCompeteDuration} mois</strong>
                <br />
                Zone : <strong>{articles.article12NonCompete.nonCompeteArea}</strong>
                <br />
                Indemnité : <strong>{articles.article12NonCompete.nonCompeteCompensation}%</strong>
                <br />
              </>
            )}
            {articles.article12NonCompete.includeNonSolicitation && (
              <>Non-sollicitation : <strong>Incluse</strong><br /></>
            )}
          </p>
        ) : (
          <p><em>Non inclus dans ce contrat</em></p>
        )
      ) : (
        <p>Clauses restrictives post-contrat</p>
      ),
      isIncluded: articles.article12NonCompete?.includeNonCompete || articles.article12NonCompete?.includeNonSolicitation || false,
    },
    {
      title: "Article 13 – Télétravail",
      content: articles.article13Teleworking ? (
        articles.article13Teleworking.includeTeleworking ? (
          <p>
            Type : <strong>
              {articles.article13Teleworking.teleworkingType === 'regular' && 'Régulier'}
              {articles.article13Teleworking.teleworkingType === 'occasional' && 'Occasionnel'}
              {articles.article13Teleworking.teleworkingType === 'mixed' && 'Mixte'}
            </strong>
            {(articles.article13Teleworking.teleworkingType === 'regular' || articles.article13Teleworking.teleworkingType === 'mixed') && (
              <>
                <br />
                Jours : définis dans le contrat
              </>
            )}
            <br />
            Équipement : <strong>{articles.article13Teleworking.employerProvidesEquipment ? 'Fourni par l\'employeur' : 'Par le salarié'}</strong>
          </p>
        ) : (
          <p><em>Non inclus dans ce contrat</em></p>
        )
      ) : (
        <p>Conditions de travail à distance</p>
      ),
      isIncluded: articles.article13Teleworking?.includeTeleworking || false,
    },
    {
      title: "Article 14 – Rupture du contrat et préavis",
      content: articles.article14Termination ? (
        <p>
          Convention : <strong>{articles.article14Termination.collectiveAgreement}</strong>
          <br />
          {isCDI ? (
            <>
              Préavis : <strong>
                {articles.article14Termination.noticePeriodCDI === 'legal' && 'Légal'}
                {articles.article14Termination.noticePeriodCDI === '1-month' && '1 mois'}
                {articles.article14Termination.noticePeriodCDI === '2-months' && '2 mois'}
                {articles.article14Termination.noticePeriodCDI === '3-months' && '3 mois'}
                {articles.article14Termination.noticePeriodCDI === 'collective' && 'Selon convention'}
              </strong>
            </>
          ) : (
            <>Rupture : conditions légales CDD</>
          )}
        </p>
      ) : (
        <p>Modalités de rupture et préavis</p>
      ),
      isIncluded: true,
    },
  ];

  // Fonction pour exporter le contrat en PDF
  const handleExportPDF = async () => {
    try {
      // Charger toutes les données du contrat
      const contractData = await loadFullContract(contractConfig.userId);
      
      if (contractData) {
        // Exporter le contrat en PDF
        await exportContractToPDF(contractData);
      }
    } catch (error) {
      console.error('Erreur lors de l\'export du contrat:', error);
      // Afficher une notification d'erreur (à implémenter)
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">Aperçu du contrat de travail</h2>
        <p className="text-gray-500">
          Vérifiez les informations avant validation finale
        </p>
      </div>

      {/* Avertissement si des articles importants sont manquants */}
      {hasMissingImportantArticles && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-4">
          <h3 className="font-semibold text-amber-800 mb-1">Attention</h3>
          <p className="text-amber-700 text-sm">
            Certaines sections importantes du contrat semblent incomplètes ou manquantes. 
            Veuillez vérifier que toutes les informations nécessaires ont été renseignées.
          </p>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
        <h3 className="font-semibold text-lg text-blue-800 mb-2">Résumé du contrat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Type :</span> {isCDI ? 'CDI' : 'CDD'}</p>
            <p><span className="font-medium">Employeur :</span> {contractConfig.company?.name || "Non défini"}</p>
            <p><span className="font-medium">Poste :</span> {articles.article3Functions?.position || "Non défini"}</p>
          </div>
          <div>
            <p><span className="font-medium">Salarié :</span> {contractConfig.employee ? `${contractConfig.employee.firstName} ${contractConfig.employee.lastName}` : "Non défini"}</p>
            <p><span className="font-medium">Temps de travail :</span> {contractConfig.workingHours || "Non défini"}h {contractConfig.isPartTime ? "(temps partiel)" : "(temps plein)"}</p>
            <p><span className="font-medium">Salaire mensuel brut :</span> {articles.article6Remuneration?.monthlySalary || "Non défini"}€</p>
          </div>
        </div>
      </div>

      {/* Ajouter un avertissement si aucun article n'est disponible */}
      {(!articles || Object.keys(articles).length === 0) ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">
            Aucune donnée de contrat disponible. Veuillez compléter les étapes précédentes.
          </p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <ScrollArea className="h-[420px]">
            <div className="p-4 pr-6"> {/* Ajout d'un padding-right plus important pour éviter le chevauchement avec la scrollbar */}
              <Accordion type="multiple" defaultValue={["article-0", "article-1", "article-2"]} className="w-full">
                {contractArticles.map((article, index) => (
                  <AccordionItem key={`article-${index}`} value={`article-${index}`} className="border-b overflow-hidden">
                    <AccordionTrigger className="hover:bg-gray-50 px-2 rounded-md">
                      <div className="flex items-center">
                        <span className="font-medium truncate">{article.title}</span>
                        {!article.isIncluded && (
                          <span className="ml-3 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">Non inclus</span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 py-2">
                      <div className="text-sm break-words">
                        {article.content}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4">
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <Button variant="outline" onClick={handleExportPDF} disabled={isLoading} className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Exporter en PDF
          </Button>
          
          <Button variant="outline" className="flex items-center">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
        </div>
        
        <Button 
          onClick={onValidateContract}
          disabled={isLoading || hasMissingImportantArticles}
          className="flex items-center bg-green-600 hover:bg-green-700"
          title={hasMissingImportantArticles ? "Veuillez compléter toutes les sections importantes du contrat avant de le valider" : ""}
        >
          {isLoading ? (
            <Spinner className="mr-2" />
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Valider le contrat
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 