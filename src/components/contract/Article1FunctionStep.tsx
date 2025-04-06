import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Plus, Trash } from 'lucide-react';
import { Article1Function } from '@/services/contractArticlesService';

interface Article1FunctionStepProps {
  onSaveFunction: (functionData: Article1Function) => Promise<void>;
  initialData?: Article1Function;
  isLoading: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function Article1FunctionStep({
  onSaveFunction,
  initialData,
  isLoading,
  onBack,
  onNext
}: Article1FunctionStepProps) {
  const [functionData, setFunctionData] = useState<Article1Function>(
    initialData || {
      title: '',
      description: '',
      responsibilities: ['']
    }
  );

  const handleInputChange = (field: keyof Article1Function, value: string) => {
    setFunctionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResponsibilityChange = (index: number, value: string) => {
    const newResponsibilities = [...functionData.responsibilities];
    newResponsibilities[index] = value;
    
    setFunctionData(prev => ({
      ...prev,
      responsibilities: newResponsibilities
    }));
  };

  const addResponsibility = () => {
    setFunctionData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, '']
    }));
  };

  const removeResponsibility = (index: number) => {
    if (functionData.responsibilities.length <= 1) return;
    
    const newResponsibilities = [...functionData.responsibilities];
    newResponsibilities.splice(index, 1);
    
    setFunctionData(prev => ({
      ...prev,
      responsibilities: newResponsibilities
    }));
  };

  const handleSave = async () => {
    // Filtrer les responsabilités vides
    const cleanedData = {
      ...functionData,
      responsibilities: functionData.responsibilities.filter(r => r.trim() !== '')
    };
    
    // Si toutes les responsabilités sont vides, ajouter une entrée vide
    if (cleanedData.responsibilities.length === 0) {
      cleanedData.responsibilities = [''];
    }
    
    await onSaveFunction(cleanedData);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Article 1 - Fonction</h2>
        <p className="text-gray-500">Définissez la fonction et les responsabilités de l&apos;employé</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="function-title">Intitulé du poste</Label>
          <Input
            id="function-title"
            value={functionData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Ex: Développeur Web, Comptable, Commercial..."
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="function-description">Description du poste</Label>
          <Textarea
            id="function-description"
            value={functionData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Décrivez brièvement le poste et son rôle dans l'entreprise"
            rows={3}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-3">
          <Label>Principales responsabilités</Label>
          
          {functionData.responsibilities.map((responsibility, index) => (
            <div key={index} className="flex items-start gap-2">
              <Textarea
                value={responsibility}
                onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                placeholder={`Responsabilité ${index + 1}`}
                rows={2}
                disabled={isLoading}
                className="flex-grow"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeResponsibility(index)}
                disabled={isLoading || functionData.responsibilities.length <= 1}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addResponsibility}
            disabled={isLoading}
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une responsabilité
          </Button>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isLoading} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        
        <Button 
          onClick={handleSave}
          disabled={isLoading || !functionData.title.trim()} 
          className="flex items-center"
        >
          {isLoading ? 'Enregistrement...' : 'Continuer'}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
} 