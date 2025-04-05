import React, { useState, useEffect } from 'react';
import { AIContractMemory, AISuggestion } from '@/types/firebase';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, User, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { AIAssistant } from './AIAssistant';
import { useAIContractMemory } from '@/hooks/useAIContractMemory';
import { suggestClause } from '@/lib/ai/service';

interface Company {
  id: string;
  name: string;
  siret?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  [key: string]: unknown;
}

interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  socialSecurityNumber?: string;
  [key: string]: unknown;
}

interface StepPartiesProps {
  memory: AIContractMemory | null;
  onUpdateMemory: (
    field: keyof AIContractMemory, 
    value: AIContractMemory[keyof AIContractMemory]
  ) => Promise<void>;
  onComplete: () => void;
}

export function StepParties({ memory, onUpdateMemory, onComplete }: StepPartiesProps) {
  const [subStep, setSubStep] = useState<1 | 2>(1);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { addMessage } = useAIContractMemory();
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);

  // Charger les données des entreprises et employés
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        
        // Récupérer les entreprises
        const companiesCollection = collection(firestore, `users/${currentUser.uid}/companies`);
        const companiesSnapshot = await getDocs(companiesCollection);
        
        const companiesData: Company[] = [];
        companiesSnapshot.forEach((doc) => {
          companiesData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setCompanies(companiesData);
        
        // Récupérer les employés
        const employeesCollection = collection(firestore, `users/${currentUser.uid}/employees`);
        const employeesSnapshot = await getDocs(employeesCollection);
        
        const employeesData: Employee[] = [];
        employeesSnapshot.forEach((doc) => {
          employeesData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setEmployees(employeesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: 'Erreur de chargement',
          description: 'Impossible de charger les entreprises et les employés',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser, toast]);

  // Valider la sélection de l'entreprise
  const validateCompanySelection = async () => {
    if (!memory?.company?.id) {
      toast({
        title: 'Sélection requise',
        description: 'Veuillez sélectionner une entreprise avant de continuer',
        variant: 'destructive',
      });
      return;
    }
    
    // Ajouter un message à l'historique IA
    await addMessage({
      role: 'user',
      content: `J'ai sélectionné l'entreprise ${memory.company.name} pour ce contrat.`
    });
    
    setSubStep(2);
  };

  // Validation finale, aller à l'étape suivante
  const validateEmployeeSelection = async () => {
    if (!memory?.employee?.id) {
      toast({
        title: 'Champ requis',
        description: 'Veuillez sélectionner un employé pour continuer.',
        variant: 'destructive',
      });
      return;
    }

    // Générer une suggestion IA pour les parties du contrat
    await generateIntroductionClause();
    
    // Aller à l'étape suivante
    onComplete();
  };

  // Sélection d'une entreprise
  const handleCompanySelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    if (!companyId) return;
    
    const company = companies.find(comp => comp.id === companyId);
    if (!company) return;
    
    try {
      // Mettre à jour la mémoire avec les données de l'entreprise
      await onUpdateMemory('company', {
        id: company.id,
        name: company.name || '',
        siret: company.siret || '',
        address: company.address || '',
        postalCode: company.postalCode || '',
        city: company.city || '',
      });
      
      toast({
        title: 'Entreprise sélectionnée',
        description: `Les informations de ${company.name} ont été chargées.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'entreprise:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sélectionner l\'entreprise',
        variant: 'destructive',
      });
    }
  };

  // Sélection d'un employé
  const handleEmployeeSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const employeeId = e.target.value;
    if (!employeeId) return;
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    try {
      // Construire le nom complet
      const firstName = employee.firstName || '';
      const lastName = employee.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Mettre à jour la mémoire avec les données de l'employé
      await onUpdateMemory('employee', {
        id: employee.id,
        fullName,
        firstName,
        lastName,
        birthDate: employee.birthDate || '',
        birthPlace: employee.birthPlace || '',
        address: employee.address || '',
        postalCode: employee.postalCode || '',
        city: employee.city || '',
        socialSecurityNumber: employee.socialSecurityNumber || '',
      });
      
      toast({
        title: 'Employé sélectionné',
        description: `Les informations de ${fullName} ont été chargées.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Erreur lors de la sélection de l\'employé:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sélectionner l\'employé',
        variant: 'destructive',
      });
    }
  };

  // Générer une suggestion avec l'IA sur les parties sélectionnées
  const generateIntroductionClause = async () => {
    if (!memory) return;
    
    try {
      setIsLoadingAI(true);
      
      // Appeler le service d'IA avec Genkit
      const aiSuggestion = await suggestClause(memory, 1);
      
      // Stocker la suggestion
      setSuggestion(aiSuggestion);
      
      // Ajouter un message à l'historique (réponse de l'IA)
      await addMessage({
        role: 'assistant',
        content: aiSuggestion.suggestion
      });
      
      // Mettre à jour la clause d'introduction
      if (memory.clauses) {
        await onUpdateMemory('clauses', {
          ...memory.clauses,
          introduction: aiSuggestion.suggestion
        });
      }
      
    } catch (error) {
      console.error('Erreur lors de la génération de la clause:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer une suggestion pour les parties du contrat.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progression des sous-étapes */}
      <div className="flex mb-6">
        <div className="w-1/2 pr-2">
          <div className={`p-3 rounded-md flex items-center space-x-3 ${subStep === 1 ? 'bg-primary text-white' : 'bg-muted'}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${subStep === 1 ? 'bg-white text-primary' : 'bg-primary/20 text-primary'}`}>1</span>
            <span className="font-medium">Entreprise</span>
          </div>
        </div>
        <div className="w-1/2 pl-2">
          <div className={`p-3 rounded-md flex items-center space-x-3 ${subStep === 2 ? 'bg-primary text-white' : 'bg-muted'}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${subStep === 2 ? 'bg-white text-primary' : 'bg-primary/20 text-primary'}`}>2</span>
            <span className="font-medium">Employé</span>
          </div>
        </div>
      </div>

      {subStep === 1 && (
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <h3 className="text-lg font-medium mb-5">Sélection de l&apos;entreprise</h3>
          
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <Building2 className="h-5 w-5 text-primary" />
              <div className="flex-grow">
                <select
                  className="w-full p-3 text-base border rounded-md bg-white"
                  onChange={handleCompanySelect}
                  value={memory?.company?.id || ''}
                  disabled={isLoading}
                >
                  <option value="" disabled>Choisir une entreprise</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {memory?.company?.name && (
            <div className="bg-blue-50 rounded-md border border-blue-100 p-4">
              <h4 className="text-sm font-medium mb-3">Informations de l&apos;entreprise</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Raison sociale</p>
                  <p className="text-sm">{memory.company.name}</p>
                </div>
                
                {memory.company.siret && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">SIRET</p>
                    <p className="text-sm">{memory.company.siret}</p>
                  </div>
                )}
                
                {(memory.company.address || memory.company.postalCode || memory.company.city) && (
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs font-medium text-gray-500">Adresse</p>
                    <p className="text-sm">
                      {memory.company.address}{' '}
                      {memory.company.postalCode}{' '}
                      {memory.company.city}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={validateCompanySelection}>
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {subStep === 2 && (
        <div className="bg-white rounded-lg shadow-sm border p-5">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-medium">Sélection du salarié</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSubStep(1)}
            >
              Retour à l&apos;entreprise
            </Button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="h-5 w-5 text-primary" />
              <div className="flex-grow">
                <select
                  className="w-full p-3 text-base border rounded-md bg-white"
                  onChange={handleEmployeeSelect}
                  value={memory?.employee?.id || ''}
                  disabled={isLoading}
                >
                  <option value="" disabled>Choisir un employé</option>
                  {employees.map(employee => {
                    const displayName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
                    return (
                      <option key={employee.id} value={employee.id}>
                        {displayName || `Employé ${employee.id.substring(0, 4)}`}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
          
          {memory?.employee?.fullName && (
            <div className="bg-blue-50 rounded-md border border-blue-100 p-4">
              <h4 className="text-sm font-medium mb-3">Informations du salarié</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Nom complet</p>
                  <p className="text-sm">{memory.employee.fullName}</p>
                </div>
                
                {memory.employee.birthDate && memory.employee.birthPlace && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Naissance</p>
                    <p className="text-sm">Né(e) le {memory.employee.birthDate} à {memory.employee.birthPlace}</p>
                  </div>
                )}
                
                {(memory.employee.address || memory.employee.postalCode || memory.employee.city) && (
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs font-medium text-gray-500">Adresse</p>
                    <p className="text-sm">
                      {memory.employee.address}{' '}
                      {memory.employee.postalCode}{' '}
                      {memory.employee.city}
                    </p>
                  </div>
                )}
                
                {memory.employee.socialSecurityNumber && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Numéro de sécurité sociale</p>
                    <p className="text-sm">{memory.employee.socialSecurityNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button onClick={validateEmployeeSelection}>
              Valider
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <AIAssistant 
        memory={memory}
        isLoading={isLoadingAI}
        suggestion={suggestion}
        onAcceptSuggestion={(aiSuggestion) => {
          if (memory?.clauses) {
            onUpdateMemory('clauses', {
              ...memory.clauses,
              introduction: aiSuggestion.suggestion
            });
          }
        }}
        onModifySuggestion={(modifiedText) => {
          if (memory?.clauses) {
            onUpdateMemory('clauses', {
              ...memory.clauses,
              introduction: modifiedText
            });
          }
        }}
        onAskQuestion={async (question) => {
          await addMessage({
            role: 'user',
            content: question
          });
        }}
      />
    </div>
  );
} 