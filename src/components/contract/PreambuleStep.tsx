import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FileText, HelpCircle } from 'lucide-react';

interface PreambuleStepProps {
  onSelectPreambule: (hasPreambule: boolean) => Promise<void>;
  hasPreambule?: boolean;
  isLoading: boolean;
  onBack: () => void;
}

export function PreambuleStep({
  onSelectPreambule,
  hasPreambule,
  isLoading,
  onBack
}: PreambuleStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Préambule du contrat</h2>
        <p className="text-gray-500">Souhaitez-vous inclure un préambule dans le contrat de travail ?</p>
      </div>

      <div className="bg-blue-50 rounded-md p-4 flex items-start space-x-3 mb-6">
        <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
        <div>
          <p className="text-sm text-blue-700 font-medium">Qu&apos;est-ce qu&apos;un préambule ?</p>
          <p className="text-sm text-blue-600 mt-1">
            Le préambule introduit le contrat et rappelle le cadre légal. Il n&apos;est pas obligatoire mais constitue une bonne pratique.
          </p>
        </div>
      </div>

      <RadioGroup 
        value={hasPreambule !== undefined ? hasPreambule.toString() : undefined}
        onValueChange={(value) => !isLoading && onSelectPreambule(value === 'true')}
        className="space-y-4"
      >
        <div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="preambule-yes" disabled={isLoading} />
            <Label htmlFor="preambule-yes" className="font-medium cursor-pointer">
              Oui, inclure un préambule
            </Label>
          </div>
          
          {hasPreambule === true && (
            <Card className="mt-3 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 italic">
                      &quot;Le présent contrat précise les conditions dans lesquelles le Salarié exercera ses fonctions au sein de l&apos;Entreprise. 
                      Il est établi conformément au Code du travail et, le cas échéant, à la convention collective applicable. 
                      Les parties déclarent avoir pris connaissance de ses termes et s&apos;engagent à les respecter avec loyauté.&quot;
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="false" id="preambule-no" disabled={isLoading} />
          <Label htmlFor="preambule-no" className="font-medium cursor-pointer">
            Non, sans préambule
          </Label>
        </div>
      </RadioGroup>

      <div className="flex space-x-4 justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={onBack} 
          disabled={isLoading}
        >
          Retour
        </Button>
        
        {hasPreambule !== undefined && (
          <Button 
            disabled={isLoading} 
            className="w-full md:w-auto"
            onClick={() => onSelectPreambule(hasPreambule)}
          >
            {isLoading ? 'Enregistrement...' : 'Continuer'}
          </Button>
        )}
      </div>
    </div>
  );
} 