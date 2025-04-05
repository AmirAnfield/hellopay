import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Sparkles, ChevronDown, MessageSquare, Send, Save, ArrowLeft, ArrowRight, Check, Eye, Download } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { addMessageToAIMemory } from '@/lib/ai/memory';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

interface Company {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  companyId: string;
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
  options?: Option[];
}

interface Option {
  text: string;
  value: string;
  description?: string;
}

interface FormData {
  companyId?: string;
  company?: string;
  employeeId?: string;
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
  [key: string]: any;
}

// Définir une interface pour les styles de templates
interface TemplateStyles {
  container: string;
  title: string;
  subtitle: string;
  sectionTitle: string;
  section: string;
  signatures: string;
}

// Types de contrat disponibles
const CONTRACT_TYPES = [
  {
    id: 'CDI_temps_plein',
    title: 'CDI à temps plein',
    description: 'Contrat à durée indéterminée - 35h/semaine'
  },
  {
    id: 'CDI_temps_partiel',
    title: 'CDI à temps partiel',
    description: 'Contrat à durée indéterminée - Temps partiel'
  },
  {
    id: 'CDD_temps_plein',
    title: 'CDD à temps plein',
    description: 'Contrat à durée déterminée - 35h/semaine'
  },
  {
    id: 'CDD_temps_partiel',
    title: 'CDD à temps partiel',
    description: 'Contrat à durée déterminée - Temps partiel'
  },
  {
    id: 'apprentissage',
    title: 'Contrat d\'apprentissage',
    description: 'Formation en alternance - Jeunes de 16 à 29 ans'
  },
  {
    id: 'professionnalisation',
    title: 'Contrat de professionnalisation',
    description: 'Formation en alternance - Adultes en reconversion'
  }
];

// Les conventions collectives les plus courantes
const CONVENTIONS = [
  { id: 'syntec', name: 'Syntec (Bureaux d\'études techniques)', idcc: '1486' },
  { id: 'btp', name: 'Bâtiment et travaux publics', idcc: '1597, 1702, 1596, 2609' },
  { id: 'commerce', name: 'Commerce de détail et de gros', idcc: '2216, 573' },
  { id: 'hotellerie', name: 'Hôtels, cafés, restaurants', idcc: '1979' },
  { id: 'transport', name: 'Transport routier', idcc: '16' },
  { id: 'autre', name: 'Autre convention collective', idcc: '' }
];

// Templates de présentation des contrats
const CONTRACT_TEMPLATES = [
  { 
    id: 'standard', 
    name: 'Standard',
    description: 'Présentation classique et sobre'
  },
  { 
    id: 'moderne', 
    name: 'Moderne',
    description: 'Design contemporain avec mise en page aérée'
  },
  { 
    id: 'juridique', 
    name: 'Juridique',
    description: 'Format détaillé adapté aux services RH et juridiques'
  }
];

// Les étapes de création du contrat
const STEPS = [
  { id: 'welcome', name: 'Accueil' },
  { id: 'company', name: 'Entreprise' },
  { id: 'employee', name: 'Employé' },
  { id: 'contract_type', name: 'Type de contrat' },
  { id: 'convention', name: 'Convention collective' },
  { id: 'position', name: 'Poste' },
  { id: 'remuneration', name: 'Rémunération' },
  { id: 'working_conditions', name: 'Conditions de travail' },
  { id: 'specific_clauses', name: 'Clauses spécifiques' },
  { id: 'template_choice', name: 'Modèle visuel' },
  { id: 'review', name: 'Validation' }
];

export default function GenerativeAIContractWizard() {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [contractGenerated, setContractGenerated] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  
  // Progression
  const getCurrentStepIndex = () => {
    const index = STEPS.findIndex(step => step.id === currentStep);
    return index >= 0 ? index : 0;
  };
  
  const progress = ((getCurrentStepIndex() + 1) / STEPS.length) * 100;

  // Charger les entreprises depuis Firestore
  const loadCompanies = async (search = '') => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      let companiesQuery;
      
      if (search) {
        companiesQuery = query(
          collection(firestore, 'companies'),
          where('name', '>=', search),
          where('name', '<=', search + '\uf8ff'),
          orderBy('name'),
          limit(10)
        );
      } else {
        companiesQuery = query(
          collection(firestore, 'companies'),
          orderBy('name'),
          limit(10)
        );
      }
      
      const snapshot = await getDocs(companiesQuery);
      const companiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Entreprise sans nom'
      }));
      
      setCompanies(companiesData);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les entreprises. Veuillez réessayer.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les employés pour une entreprise
  const loadEmployees = async (companyId: string) => {
    if (!currentUser || !companyId) return;
    
    setIsLoading(true);
    try {
      const employeesQuery = query(
        collection(firestore, 'employees'),
        where('companyId', '==', companyId),
        orderBy('displayName'),
        limit(20)
      );
      
      const snapshot = await getDocs(employeesQuery);
      const employeesData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().displayName || `${doc.data().firstName} ${doc.data().lastName}` || 'Employé sans nom',
        companyId: doc.data().companyId
      }));
      
      setEmployees(employeesData);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les employés. Veuillez réessayer.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Ajouter un message au chat
  const addMessage = (role: 'assistant' | 'user', content: string, options?: Option[]) => {
    // Pour les entreprises, s'assurer que les options sont bien formatées
    if (role === 'assistant' && currentStep === 'company' && companies.length > 0) {
      options = companies.map(company => ({
        text: company.name,
        value: company.id,
        description: `ID: ${company.id}`
      }));
    }

    const newMessage: Message = {
      role,
      content,
      timestamp: Date.now(),
      options
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Enregistrer le message dans Firebase si nécessaire
    if (currentUser) {
      addMessageToAIMemory(currentUser.uid, {
        role,
        content
      }).catch(err => console.error('Erreur lors de l\'enregistrement du message:', err));
    }
  };

  // Faire défiler jusqu'au dernier message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Charger les entreprises au démarrage et lors de l'étape company
  useEffect(() => {
    if (currentUser && (messages.length === 0 || currentStep === 'company')) {
      loadCompanies();
    }
  }, [currentUser, currentStep, messages.length]);

  // Gérer les étapes initiales
  useEffect(() => {
    // Message de bienvenue
    if (messages.length === 0) {
      addMessage(
        'assistant',
        "Bonjour ! Je suis votre assistant pour la création de contrat de travail. Je vais vous guider étape par étape pour générer un contrat personnalisé. Commençons par l'entreprise concernée.",
        [{ text: "Commencer", value: "start" }]
      );
    }
  }, []);

  // Gérer les réponses de l'assistant en fonction de l'étape
  const handleAssistantResponse = (step: string) => {
    setCurrentStep(step);
    
    switch (step) {
      case 'company':
        addMessage(
          'assistant',
          "Pour quelle entreprise souhaitez-vous créer ce contrat ? Vous pouvez sélectionner dans la liste ou saisir le nom d'une nouvelle entreprise.",
          companies.map(company => ({
            text: company.name,
            value: company.id,
            description: `ID: ${company.id}`
          }))
        );
        break;
        
      case 'employee':
        if (formData.companyId) {
          loadEmployees(formData.companyId);
          addMessage(
            'assistant',
            `Très bien, le contrat sera établi pour ${formData.company}. Maintenant, sélectionnez l'employé concerné ou saisissez le nom d'un nouvel employé.`,
            employees.map(employee => ({
              text: employee.name,
              value: employee.id
            }))
          );
        } else {
          addMessage(
            'assistant',
            `Très bien, le contrat sera établi pour ${formData.company}. Veuillez saisir le nom de l'employé concerné.`
          );
        }
        break;
        
      case 'contract_type':
        addMessage(
          'assistant',
          `Parfait ! Le contrat sera établi entre ${formData.company} et ${formData.employee}. Quel type de contrat souhaitez-vous créer ?`,
          CONTRACT_TYPES.map(type => ({
            text: type.title,
            value: type.id,
            description: type.description
          }))
        );
        break;
        
      case 'convention':
        addMessage(
          'assistant',
          `Pour que le contrat soit conforme, j'ai besoin de savoir quelle convention collective s'applique à ${formData.company}.`,
          CONVENTIONS.map(convention => ({
            text: convention.name,
            value: convention.id,
            description: convention.idcc ? `IDCC: ${convention.idcc}` : undefined
          }))
        );
        break;
        
      case 'position':
        addMessage(
          'assistant',
          `Vous avez choisi un ${CONTRACT_TYPES.find(t => t.id === formData.contractType)?.title}. Quel est l'intitulé du poste pour ${formData.employee} ?`
        );
        break;
        
      case 'remuneration':
        addMessage(
          'assistant',
          `${formData.employee} sera embauché(e) en tant que ${formData.position}. Quel sera son salaire mensuel brut (en euros) ?`
        );
        break;
        
      case 'working_conditions':
        const isCDD = formData.contractType?.includes('CDD');
        const isPartTime = formData.contractType?.includes('temps_partiel');
        
        let message = `Le salaire de ${formData.employee} sera de ${formData.salary}€ brut par mois. `;
        
        if (isCDD) {
          message += "Quelle sera la date de début et la date de fin du contrat ? (format: JJ/MM/AAAA - JJ/MM/AAAA)";
        } else {
          message += "Quelle sera la date de début du contrat ? (format: JJ/MM/AAAA)";
        }
        
        addMessage('assistant', message);
        break;
        
      case 'specific_clauses':
        const clausesOptions = [];
        
        // Suggestions de clauses adaptées au type de contrat
        if (formData.contractType?.includes('CDI')) {
          clausesOptions.push(
            { text: "Clause de non-concurrence", value: "non_concurrence" },
            { text: "Clause de mobilité", value: "mobilite" }
          );
        }
        
        if (formData.contractType?.includes('CDD')) {
          clausesOptions.push(
            { text: "Clause de renouvellement", value: "renouvellement" }
          );
        }
        
        // Clauses générales pour tous types de contrats
        clausesOptions.push(
          { text: "Clause de confidentialité", value: "confidentialite" },
          { text: "Clause de propriété intellectuelle", value: "propriete_intellectuelle" },
          { text: "Aucune clause spécifique", value: "aucune" }
        );
        
        addMessage(
          'assistant',
          "Souhaitez-vous ajouter des clauses spécifiques à ce contrat ?",
          clausesOptions
        );
        break;
        
      case 'template_choice':
        addMessage(
          'assistant',
          "Choisissez un modèle de présentation pour votre contrat :",
          CONTRACT_TEMPLATES.map(template => ({
            text: template.name,
            value: template.id,
            description: template.description
          }))
        );
        break;
        
      case 'review':
        let dates = '';
        if (formData.contractType?.includes('CDD') || formData.contractType === 'apprentissage' || formData.contractType === 'professionnalisation') {
          dates = `du ${formData.startDate} au ${formData.endDate}`;
        } else {
          dates = `à partir du ${formData.startDate}`;
        }
        
        // Convention collective
        const convention = CONVENTIONS.find(c => c.id === formData.convention);
        
        // Clauses spécifiques
        let clausesText = '';
        if (formData.specificClauses && formData.specificClauses.length > 0 && !formData.specificClauses.includes('aucune')) {
          clausesText = formData.specificClauses.join(', ');
        } else {
          clausesText = 'Aucune clause spécifique';
        }
        
        // Template choisi
        const template = CONTRACT_TEMPLATES.find(t => t.id === formData.templateId);
        
        const summary = `
J'ai rassemblé toutes les informations nécessaires pour générer votre contrat :

• Entreprise : ${formData.company}
• Employé : ${formData.employee}
• Type de contrat : ${CONTRACT_TYPES.find(t => t.id === formData.contractType)?.title}
• Convention collective : ${convention?.name || 'Non spécifiée'}
• Poste : ${formData.position}
• Rémunération : ${formData.salary}€ ${formData.salaryUnit || 'brut mensuel'}
• Période : ${dates}
• Période d'essai : ${formData.trialPeriod || (formData.contractType?.includes('CDI') ? '2 mois' : '2 semaines')}
• Conditions de travail : ${formData.workingHours || 'À définir'}
• Lieu de travail : ${formData.workLocation || 'À définir'}
• Clauses spécifiques : ${clausesText}
• Modèle de présentation : ${template?.name || 'Standard'}

Tout est-il correct ? Je peux générer le contrat maintenant ou modifier ces informations.
        `;
        
        addMessage(
          'assistant',
          summary,
          [
            { text: "Générer le contrat", value: "generate" },
            { text: "Modifier les informations", value: "edit" }
          ]
        );
        break;
        
      case 'generate':
        setContractGenerated(true);
        addMessage(
          'assistant',
          "Votre contrat a été généré avec succès ! Vous pouvez maintenant le prévisualiser, le télécharger ou le sauvegarder dans votre espace.",
          [
            { text: "Prévisualiser", value: "preview" },
            { text: "Télécharger", value: "download" },
            { text: "Sauvegarder", value: "save" }
          ]
        );
        break;
        
      default:
        break;
    }
  };

  // Gérer la soumission du formulaire
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim() && !formData.selectedOption) return;
    
    // Ajouter le message de l'utilisateur au chat
    if (userInput.trim() || (formData.selectedOption && formData.selectedOption !== 'start')) {
      addMessage('user', userInput || formData.selectedOption || '');
    }
    
    // Traiter la réponse en fonction de l'étape actuelle
    const nextStep = getNextStep(currentStep, userInput || formData.selectedOption || '');
    
    // Mettre à jour les données du formulaire
    updateFormData(currentStep, userInput || formData.selectedOption || '');
    
    // Réinitialiser l'entrée utilisateur
    setUserInput('');
    
    // Simuler une légère latence pour l'assistant
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      handleAssistantResponse(nextStep);
    }, 1000);
  };

  // Déterminer la prochaine étape
  const getNextStep = (currentStep: string, userResponse: string): string => {
    switch (currentStep) {
      case 'welcome':
        return 'company';
      case 'company':
        return 'employee';
      case 'employee':
        return 'contract_type';
      case 'contract_type':
        return 'convention';
      case 'convention':
        return 'position';
      case 'position':
        return 'remuneration';
      case 'remuneration':
        return 'working_conditions';
      case 'working_conditions':
        return 'specific_clauses';
      case 'specific_clauses':
        return 'template_choice';
      case 'template_choice':
        return 'review';
      case 'review':
        if (userResponse === 'generate' || userResponse.toLowerCase().includes('générer')) {
          return 'generate';
        } else {
          // Retourner à l'étape de modification
          return 'company';
        }
      default:
        return currentStep;
    }
  };

  // Mettre à jour les données du formulaire
  const updateFormData = (step: string, value: string) => {
    switch (step) {
      case 'company':
        const selectedCompany = companies.find(c => c.id === value);
        if (selectedCompany) {
          setFormData(prev => ({ 
            ...prev, 
            companyId: selectedCompany.id,
            company: selectedCompany.name
          }));
        } else {
          setFormData(prev => ({ 
            ...prev, 
            company: value,
            companyId: undefined
          }));
        }
        break;
        
      case 'employee':
        const selectedEmployee = employees.find(e => e.id === value);
        if (selectedEmployee) {
          setFormData(prev => ({ 
            ...prev, 
            employeeId: selectedEmployee.id,
            employee: selectedEmployee.name
          }));
        } else {
          setFormData(prev => ({ 
            ...prev, 
            employee: value,
            employeeId: undefined
          }));
        }
        break;
        
      case 'contract_type':
        setFormData(prev => ({ ...prev, contractType: value }));
        break;
        
      case 'convention':
        setFormData(prev => ({ ...prev, convention: value }));
        break;
        
      case 'position':
        setFormData(prev => ({ ...prev, position: value }));
        break;
        
      case 'remuneration':
        // Détection du format: montant + unité (ex: "2000 brut mensuel")
        const salaryMatch = value.match(/(\d+)\s*(\w.*)?/);
        if (salaryMatch) {
          const amount = parseFloat(salaryMatch[1]);
          const unit = salaryMatch[2] || 'brut mensuel';
          setFormData(prev => ({ 
            ...prev, 
            salary: amount,
            salaryUnit: unit
          }));
        } else {
          setFormData(prev => ({ ...prev, salary: parseFloat(value) }));
        }
        break;
        
      case 'working_conditions':
        // Format attendu pour CDD: JJ/MM/AAAA - JJ/MM/AAAA - période d'essai
        if (formData.contractType?.includes('CDD') || 
            formData.contractType === 'apprentissage' || 
            formData.contractType === 'professionnalisation') {
          
          const parts = value.split('-').map(p => p.trim());
          if (parts.length >= 2) {
            const trialPeriod = parts.length > 2 ? parts[2] : '2 semaines';
            setFormData(prev => ({ 
              ...prev, 
              startDate: parts[0],
              endDate: parts[1],
              trialPeriod: trialPeriod
            }));
          } else {
            setFormData(prev => ({ 
              ...prev, 
              startDate: value,
              trialPeriod: '2 semaines'
            }));
          }
        } else {
          // Format pour CDI: JJ/MM/AAAA - période d'essai
          const parts = value.split('-').map(p => p.trim());
          const trialPeriod = parts.length > 1 ? parts[1] : '2 mois';
          setFormData(prev => ({ 
            ...prev, 
            startDate: parts[0],
            trialPeriod: trialPeriod
          }));
        }
        break;
        
      case 'specific_clauses':
        const clauses = formData.specificClauses || [];
        
        if (value === 'aucune') {
          setFormData(prev => ({ ...prev, specificClauses: ['aucune'] }));
        } else if (clauses.includes(value)) {
          // Retirer la clause si déjà sélectionnée
          setFormData(prev => ({ 
            ...prev, 
            specificClauses: clauses.filter(c => c !== value && c !== 'aucune')
          }));
        } else {
          // Ajouter la clause
          setFormData(prev => ({ 
            ...prev, 
            specificClauses: [...clauses.filter(c => c !== 'aucune'), value]
          }));
        }
        break;
        
      case 'template_choice':
        setFormData(prev => ({ ...prev, templateId: value }));
        break;
        
      default:
        break;
    }
  };

  // Gérer les clics sur les options
  const handleOptionClick = (optionValue: string) => {
    // Éviter d'ajouter le message utilisateur pour l'option "start"
    if (optionValue !== 'start') {
      setFormData(prev => ({ ...prev, selectedOption: optionValue }));
    }
    
    // Si on clique sur "Prévisualiser"
    if (optionValue === 'preview') {
      setIsPreviewMode(true);
      return;
    }
    
    // Si on clique sur "Télécharger"
    if (optionValue === 'download') {
      toast({
        title: "Téléchargement",
        description: "Le contrat est en cours de téléchargement...",
      });
      return;
    }
    
    // Si on clique sur "Sauvegarder"
    if (optionValue === 'save') {
      toast({
        title: "Sauvegarde",
        description: "Le contrat a été sauvegardé avec succès.",
      });
      return;
    }
    
    // Gérer le bouton "Commencer" sans ajouter de message utilisateur
    if (optionValue === 'start') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        handleAssistantResponse('company');
      }, 1000);
      return;
    }
    
    handleFormSubmit(new Event('submit') as any);
  };

  // Rendu du contrat généré
  const renderContractPreview = () => {
    const contractType = CONTRACT_TYPES.find(t => t.id === formData.contractType)?.title || formData.contractType;
    const templateId = formData.templateId || 'standard';
    
    // Appliquer le style selon le template choisi
    let templateStyles: TemplateStyles = {
      container: "",
      title: "",
      subtitle: "",
      sectionTitle: "",
      section: "",
      signatures: ""
    };
    
    switch (templateId) {
      case 'moderne':
        templateStyles = {
          container: "bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto",
          title: "text-center text-2xl font-bold mb-8 text-indigo-700",
          subtitle: "text-center font-medium mb-8 text-gray-500",
          sectionTitle: "text-lg font-semibold mb-3 text-indigo-600 border-b border-indigo-100 pb-1",
          section: "mb-6",
          signatures: "mt-10 grid grid-cols-2 gap-10"
        };
        break;
      case 'juridique':
        templateStyles = {
          container: "bg-white rounded-lg shadow border border-gray-300 p-8 max-w-5xl mx-auto font-serif",
          title: "text-center text-xl font-bold mb-6 text-gray-800",
          subtitle: "text-center font-medium mb-6 text-gray-600",
          sectionTitle: "text-base font-bold mb-2 text-gray-800 uppercase tracking-wide",
          section: "mb-5 text-sm",
          signatures: "mt-12 flex justify-between"
        };
        break;
      case 'standard':
      default:
        templateStyles = {
          container: "bg-white rounded-lg shadow-sm border p-6 max-w-4xl mx-auto",
          title: "text-center text-xl font-bold mb-6",
          subtitle: "text-center font-semibold mb-6",
          sectionTitle: "text-lg font-semibold mb-2",
          section: "mb-4",
          signatures: "flex justify-between mt-6"
        };
        break;
    }
    
    return (
      <div className={templateStyles.container}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Aperçu du contrat</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsPreviewMode(false)}>
            Retour
          </Button>
        </div>
        
        <div className="prose max-w-none">
          <h1 className={templateStyles.title}>CONTRAT DE TRAVAIL</h1>
          
          <div className={templateStyles.subtitle}>
            {contractType}
          </div>
          
          <div className={templateStyles.section}>
            <p>Entre les soussignés :</p>
            <p><strong>L&apos;employeur :</strong> {formData.company}</p>
            <p><strong>Convention collective applicable :</strong> {CONVENTIONS.find(c => c.id === formData.convention)?.name || 'Non spécifiée'}</p>
            <p><strong>Et l&apos;employé(e) :</strong> {formData.employee}</p>
          </div>
          
          <div className={templateStyles.section}>
            <h2 className={templateStyles.sectionTitle}>Article 1 - Fonction</h2>
            <p>Le/La salarié(e) est engagé(e) en qualité de {formData.position}.</p>
          </div>
          
          <div className={templateStyles.section}>
            <h2 className={templateStyles.sectionTitle}>Article 2 - Durée du contrat</h2>
            {formData.contractType?.includes('CDD') || formData.contractType === 'apprentissage' || formData.contractType === 'professionnalisation' ? (
              <p>Le présent contrat est conclu pour une durée déterminée. Il commence le {formData.startDate} et se termine le {formData.endDate}.</p>
            ) : (
              <p>Le présent contrat est conclu pour une durée indéterminée à compter du {formData.startDate}.</p>
            )}
          </div>
          
          <div className={templateStyles.section}>
            <h2 className={templateStyles.sectionTitle}>Article 3 - Rémunération</h2>
            <p>En contrepartie de son travail, le/la salarié(e) percevra une rémunération {formData.salaryUnit || 'mensuelle brute'} de {formData.salary} euros.</p>
          </div>
          
          <div className={templateStyles.section}>
            <h2 className={templateStyles.sectionTitle}>Article 4 - Durée du travail</h2>
            {formData.contractType?.includes('temps_partiel') ? (
              <p>Le/La salarié(e) est engagé(e) à temps partiel. L&apos;horaire hebdomadaire est fixé à {formData.workingHours || '24 heures'}.</p>
            ) : (
              <p>Le/La salarié(e) est engagé(e) à temps plein. L&apos;horaire hebdomadaire est fixé à 35 heures, conformément à la durée légale du travail.</p>
            )}
          </div>
          
          <div className={templateStyles.section}>
            <h2 className={templateStyles.sectionTitle}>Article 5 - Période d&apos;essai</h2>
            <p>Le présent contrat est soumis à une période d&apos;essai de {formData.trialPeriod || (formData.contractType?.includes('CDI') ? '2 mois' : '2 semaines')}.</p>
          </div>
          
          {formData.specificClauses && formData.specificClauses.length > 0 && !formData.specificClauses.includes('aucune') && (
            <div className={templateStyles.section}>
              <h2 className={templateStyles.sectionTitle}>Article 6 - Clauses spécifiques</h2>
              {formData.specificClauses.includes('non_concurrence') && (
                <div className="mb-2">
                  <h3 className="font-medium text-base">Clause de non-concurrence</h3>
                  <p>Pendant la durée du présent contrat et après sa cessation, quelle qu'en soit la cause, le salarié s'interdit d'exercer une activité concurrente à celle de l'employeur, directement ou indirectement, pour son compte ou pour le compte d'un tiers. Cette interdiction est limitée à une durée de 12 mois et au territoire français. En contrepartie, le salarié percevra une indemnité mensuelle égale à 30% de son salaire moyen des 12 derniers mois.</p>
                </div>
              )}
              
              {formData.specificClauses.includes('confidentialite') && (
                <div className="mb-2">
                  <h3 className="font-medium text-base">Clause de confidentialité</h3>
                  <p>Le salarié s'engage à observer une discrétion absolue sur l'ensemble des informations auxquelles il a accès dans le cadre de ses fonctions. Cette obligation persiste après la fin du contrat de travail.</p>
                </div>
              )}
              
              {formData.specificClauses.includes('mobilite') && (
                <div className="mb-2">
                  <h3 className="font-medium text-base">Clause de mobilité</h3>
                  <p>Le lieu de travail actuel du salarié pourra être modifié dans la région {formData.workLocation?.split(',')[1] || 'Île-de-France'} selon les nécessités de l'entreprise. Le salarié en sera informé avec un préavis raisonnable.</p>
                </div>
              )}
              
              {formData.specificClauses.includes('propriete_intellectuelle') && (
                <div className="mb-2">
                  <h3 className="font-medium text-base">Clause de propriété intellectuelle</h3>
                  <p>Les inventions, créations et développements réalisés par le salarié dans le cadre de ses fonctions appartiennent de plein droit à l'employeur, conformément aux dispositions du Code de la propriété intellectuelle.</p>
                </div>
              )}
              
              {formData.specificClauses.includes('renouvellement') && (
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
  };

  if (isPreviewMode) {
    return renderContractPreview();
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-primary" />
          Assistant IA - Génération de contrat
        </h2>
        
        {contractGenerated && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPreviewMode(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Aperçu
            </Button>
            <Button size="sm">
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder
            </Button>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-1 text-sm">
          <span>Progression</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div 
          ref={chatRef}
          className="flex-1 p-4 overflow-y-auto space-y-4"
          style={{ maxHeight: 'calc(100vh - 280px)' }}
        >
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                
                {message.options && message.options.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.options.map((option, optionIndex) => (
                      <div key={optionIndex}>
                        <button
                          onClick={() => handleOptionClick(option.value)}
                          className="text-left w-full px-3 py-2 rounded border border-primary/20 bg-background hover:bg-primary/10 transition-colors"
                        >
                          <div className="font-medium">{option.text}</div>
                          {option.description && (
                            <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleFormSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Tapez votre réponse..."
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-primary/30 focus:outline-none"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 