import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, HelpCircle, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContractType, Company } from '@/types/contract';
import { Separator } from "@/components/ui/separator";
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface Article4Workplace {
  address: string;
  addressLine2?: string;
  zipCode?: string;
  city?: string;
  useCompanyAddress: boolean;
  includeMobilityClause: boolean;
  mobilityRadius?: number;
  mobilityDetails?: string;
}

interface Article4WorkplaceStepProps {
  onSaveWorkplace: (data: Article4Workplace) => Promise<void>;
  initialData?: Article4Workplace;
  contractType: ContractType;
  company?: Company;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function Article4WorkplaceStep({
  onSaveWorkplace,
  initialData,
  contractType,
  company,
  isLoading,
  onBack,
  onNext
}: Article4WorkplaceStepProps) {
  const isCDI = contractType === 'CDI';
  
  // États
  const [useCompanyAddress, setUseCompanyAddress] = useState<boolean>(
    initialData?.useCompanyAddress || (company?.address ? true : false)
  );
  
  const [address, setAddress] = useState<string>(
    initialData?.address || (useCompanyAddress && company?.address ? company.address : '')
  );
  
  const [addressLine2, setAddressLine2] = useState<string>(
    initialData?.addressLine2 || ''
  );
  
  const [zipCode, setZipCode] = useState<string>(
    initialData?.zipCode || (useCompanyAddress && company?.zipCode ? company.zipCode : '')
  );
  
  const [city, setCity] = useState<string>(
    initialData?.city || (useCompanyAddress && company?.city ? company.city : '')
  );
  
  const [includeMobilityClause, setIncludeMobilityClause] = useState<boolean>(
    initialData?.includeMobilityClause || false
  );
  
  const [mobilityRadius, setMobilityRadius] = useState<number>(
    initialData?.mobilityRadius || 30
  );
  
  const [mobilityDetails, setMobilityDetails] = useState<string>(
    initialData?.mobilityDetails || ''
  );

  // Effet pour mettre à jour l'adresse lorsque useCompanyAddress change
  useEffect(() => {
    if (useCompanyAddress && company) {
      setAddress(company.address || '');
      // Vérifier si l'entreprise utilise zipCode ou postalCode
      setZipCode(company.zipCode || company.postalCode || '');
      setCity(company.city || '');
    }
  }, [useCompanyAddress, company]);

  // Fonction pour obtenir l'adresse complète
  const getFullAddress = (): string => {
    if (useCompanyAddress && company) {
      const companyAddress = [
        company.address,
        company.addressLine2,
        (company.zipCode || company.postalCode) && company.city 
          ? `${company.zipCode || company.postalCode} ${company.city}` 
          : company.city
      ].filter(Boolean).join(', ');
      
      return companyAddress || '[adresse de l\'entreprise]';
    } else {
      const fullAddress = [
        address,
        addressLine2,
        zipCode && city ? `${zipCode} ${city}` : city
      ].filter(Boolean).join(', ');
      
      return fullAddress || '[adresse à préciser]';
    }
  };

  const handleSave = async () => {    
    const data: Article4Workplace = {
      useCompanyAddress,
      address: useCompanyAddress && company ? company.address || '' : address,
      addressLine2: useCompanyAddress && company ? company.addressLine2 || '' : addressLine2,
      zipCode: useCompanyAddress && company ? company.zipCode || company.postalCode || '' : zipCode,
      city: useCompanyAddress && company ? company.city || '' : city,
      includeMobilityClause,
      mobilityRadius: includeMobilityClause ? mobilityRadius : undefined,
      mobilityDetails: includeMobilityClause ? mobilityDetails : undefined
    };
    
    await onSaveWorkplace(data);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 4 – Lieu de travail</h2>
        <p className="text-gray-500">
          Définissez le lieu principal de travail {isCDI ? 'du salarié' : 'pour la durée du contrat'}
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-sm text-blue-700 font-medium">
          {isCDI 
            ? 'Contrat à Durée Indéterminée (CDI)' 
            : 'Contrat à Durée Déterminée (CDD)'}
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Cet article est obligatoire dans tous les contrats. Il précise où le salarié exercera son activité. 
          {isCDI && " Il peut aussi prévoir une clause de mobilité si besoin."}
        </p>
      </div>

      <div className="space-y-6">
        {company && (
          <div className="space-y-3">
            <Label className="text-base font-medium">Source de l'adresse</Label>
            <RadioGroup 
              value={useCompanyAddress ? "company" : "custom"}
              onValueChange={(value) => setUseCompanyAddress(value === "company")}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="company" id="company-address" />
                <Label htmlFor="company-address" className="flex items-center cursor-pointer">
                  <Building className="mr-2 h-4 w-4" />
                  Adresse de l'entreprise
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="custom" id="custom-address" />
                <Label htmlFor="custom-address" className="cursor-pointer">
                  Autre adresse
                </Label>
              </div>
            </RadioGroup>
            
            {useCompanyAddress && company && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm font-medium">Adresse de l'entreprise :</p>
                <p className="text-sm mt-1">{company.address}</p>
                {company.addressLine2 && <p className="text-sm">{company.addressLine2}</p>}
                <p className="text-sm">
                  {(company.zipCode || company.postalCode) && company.city 
                    ? `${company.zipCode || company.postalCode} ${company.city}` 
                    : company.city}
                </p>
              </div>
            )}
          </div>
        )}

        {(!useCompanyAddress || !company) && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="workplace-address" className="text-base font-medium">Adresse du lieu de travail</Label>
              <Input
                id="workplace-address"
                className="mt-2"
                placeholder="Numéro et nom de rue"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isLoading || (useCompanyAddress && !!company)}
              />
            </div>
            
            <div>
              <Label htmlFor="workplace-address-line2" className="text-sm">Complément d'adresse (facultatif)</Label>
              <Input
                id="workplace-address-line2"
                className="mt-1"
                placeholder="Bâtiment, étage, etc."
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                disabled={isLoading || (useCompanyAddress && !!company)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workplace-zipcode" className="text-sm">Code postal</Label>
                <Input
                  id="workplace-zipcode"
                  className="mt-1"
                  placeholder="Code postal"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  disabled={isLoading || (useCompanyAddress && !!company)}
                />
              </div>
              <div>
                <Label htmlFor="workplace-city" className="text-sm">Ville</Label>
                <Input
                  id="workplace-city"
                  className="mt-1"
                  placeholder="Ville"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isLoading || (useCompanyAddress && !!company)}
                />
              </div>
            </div>
          </div>
        )}

        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="include-mobility"
                checked={includeMobilityClause}
                onCheckedChange={setIncludeMobilityClause}
                disabled={isLoading}
              />
              <Label htmlFor="include-mobility" className="cursor-pointer font-medium">
                Inclure une clause de mobilité
              </Label>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Une clause de mobilité permet à l'employeur de modifier le lieu de travail du salarié dans un périmètre défini.
                    {!isCDI && " Pour un CDD, cette clause doit être très limitée et justifiée par la nature du travail."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {includeMobilityClause && (
            <div className="rounded-md border p-4 bg-gray-50 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobility-radius" className="text-sm">
                  Rayon de mobilité : {mobilityRadius} km
                </Label>
                <Slider
                  id="mobility-radius"
                  min={5}
                  max={100}
                  step={5}
                  value={[mobilityRadius]}
                  onValueChange={(values) => setMobilityRadius(values[0])}
                  disabled={isLoading}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>5 km</span>
                  <span>25 km</span>
                  <span>50 km</span>
                  <span>75 km</span>
                  <span>100 km</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="mobility-details" className="text-sm">
                  Précisions sur la clause de mobilité (facultatif)
                </Label>
                <Textarea
                  id="mobility-details"
                  value={mobilityDetails}
                  onChange={(e) => setMobilityDetails(e.target.value)}
                  placeholder="Ex: Modalités spécifiques, délai de prévenance..."
                  rows={3}
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 mb-4">
          <p className="text-gray-600 italic text-sm mb-2">
            Aperçu du texte qui sera généré :
          </p>
          <div className="p-4 bg-gray-50 rounded-md border">
            {isCDI ? (
              <>
                <p className="text-sm">
                  Le Salarié exercera ses fonctions principalement au sein de l&apos;établissement situé à <span className="font-medium">{getFullAddress()}</span>.
                </p>
                
                {includeMobilityClause && (
                  <p className="text-sm mt-2">
                    L&apos;employeur se réserve toutefois la possibilité de modifier ce lieu d&apos;exécution, dans un périmètre géographique de <span className="font-medium">{mobilityRadius} kilomètres</span> {mobilityDetails ? `avec les modalités suivantes: ${mobilityDetails}` : "et en lien avec l'activité de l'entreprise"}. Toute modification substantielle fera l&apos;objet d&apos;une information ou d&apos;un accord préalable, conformément à la réglementation en vigueur.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm">
                  Le Salarié exercera ses missions au sein de l&apos;établissement situé à <span className="font-medium">{getFullAddress()}</span>.
                </p>
                
                {includeMobilityClause ? (
                  <p className="text-sm mt-2">
                    Le Salarié accepte que ses fonctions puissent s&apos;exercer dans tout autre établissement relevant de l&apos;entreprise, dans un rayon de <span className="font-medium">{mobilityRadius} kilomètres</span> autour du lieu initial, sans que cela ne constitue une modification du contrat.
                    {mobilityDetails && <span className="text-sm"> {mobilityDetails}</span>}
                  </p>
                ) : (
                  <p className="text-sm mt-2">
                    Toute intervention ponctuelle sur un autre site de l&apos;entreprise pourra être demandée, dans le respect du cadre défini à l&apos;article 3 et sans que cela ne constitue une modification du contrat.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <Button 
          onClick={handleSave}
          disabled={isLoading || (!useCompanyAddress && (!address.trim() || !city.trim() || !zipCode.trim()))} 
          className="flex items-center"
        >
          {isLoading ? 'Enregistrement...' : 'Continuer'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 