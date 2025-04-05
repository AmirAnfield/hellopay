import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Sparkles, Send, Save, Eye, Star } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { firestore } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { addMessageToAIMemory } from '@/lib/ai/memory';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { useCompanyCache } from '@/hooks/useCompanyCache';
import { isFavorite, toggleCompanyFavorite } from '@/services/favorites-service';
import ContractPreview, { ContractData } from './ContractPreview';

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
  const [isRealtimePreview, setIsRealtimePreview] = useState(false);
  const [favoriteCompanies, setFavoriteCompanies] = useState<Company[]>([]);
  const [companyFavoriteStatus, setCompanyFavoriteStatus] = useState<{[key: string]: boolean}>({});

  // Utiliser le hook de cache pour les entreprises
  const { getCachedCompanies, updateCache, isCacheValid } = useCompanyCache();

  const chatRef = useRef<HTMLDivElement>(null);
  
  // Progression
  const getCurrentStepIndex = () => {
    const index = STEPS.findIndex(step => step.id === currentStep);
    return index >= 0 ? index : 0;
  };
  
  const progress = ((getCurrentStepIndex() + 1) / STEPS.length) * 100;

  // Charger les entreprises depuis Firestore avec cache
  const loadCompanies = async (search = '') => {
    if (!currentUser) {
      console.error("Pas d'utilisateur connecté");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Vérifier si les données sont en cache
      if (isCacheValid(search)) {
        console.log("Utilisation des données en cache pour les entreprises");
        const cachedData = getCachedCompanies(search);
        if (cachedData) {
          setCompanies(cachedData);
          console.log(`Entreprises chargées depuis le cache: ${cachedData.length}`);
          return;
        }
      }
      
      // Si pas de cache valide, charger depuis Firestore
      const userId = currentUser.uid;
      const companiesResults: Company[] = [];
      
      // 1. Charger les entreprises depuis la collection personnelle de l'utilisateur
      console.log("Recherche dans la collection utilisateur:", `users/${userId}/companies`);
      const userCompaniesRef = collection(firestore, `users/${userId}/companies`);
      const userCompaniesSnap = await getDocs(userCompaniesRef);
      
      userCompaniesSnap.forEach(doc => {
        const data = doc.data();
        companiesResults.push({
          id: doc.id,
          name: data.name || 'Entreprise sans nom'
        });
      });
      
      console.log(`[1] Entreprises de l'utilisateur trouvées: ${userCompaniesSnap.size}`);
      
      // 2. Charger les entreprises depuis la collection globale où l'utilisateur est propriétaire
      console.log("Recherche des entreprises possédées:", `companies où ownerId=${userId}`);
      const ownedCompaniesRef = collection(firestore, 'companies');
      const ownedCompaniesQuery = query(ownedCompaniesRef, where('ownerId', '==', userId));
      const ownedCompaniesSnap = await getDocs(ownedCompaniesQuery);
      
      ownedCompaniesSnap.forEach(doc => {
        // Éviter les doublons
        if (!companiesResults.some(c => c.id === doc.id)) {
          const data = doc.data();
          companiesResults.push({
            id: doc.id,
            name: data.name || 'Entreprise sans nom'
          });
        }
      });
      
      console.log(`[2] Entreprises possédées globalement: ${ownedCompaniesSnap.size}`);
      
      // 3. Si on a un terme de recherche, rechercher globalement
      if (search) {
        console.log(`Recherche globale pour: "${search}"`);
        const searchCompaniesRef = collection(firestore, 'companies');
        const searchQuery = query(
          searchCompaniesRef,
          where('name', '>=', search),
          where('name', '<=', search + '\uf8ff'),
          limit(10)
        );
        const searchResults = await getDocs(searchQuery);
        
        searchResults.forEach(doc => {
          // Éviter les doublons
          if (!companiesResults.some(c => c.id === doc.id)) {
            const data = doc.data();
            companiesResults.push({
              id: doc.id,
              name: data.name || 'Entreprise sans nom'
            });
          }
        });
        
        console.log(`[3] Résultats de recherche: ${searchResults.size}`);
      }
      
      // Mettre à jour le cache
      updateCache(companiesResults, search);
      
      // Mettre à jour l'état
      console.log(`Total des entreprises trouvées: ${companiesResults.length}`);
      setCompanies(companiesResults);
      
      // Vérifier quelles entreprises sont des favoris
      checkCompanyFavorites(companiesResults);
      
      // Débogage
      if (companiesResults.length === 0) {
        toast({
          title: "Information",
          description: "Aucune entreprise trouvée. Veuillez en créer une d'abord.",
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les entreprises: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier quelles entreprises sont des favoris
  const checkCompanyFavorites = async (companiesToCheck: Company[]) => {
    if (!currentUser) return;
    
    const favoriteStatus: {[key: string]: boolean} = {};
    
    for (const company of companiesToCheck) {
      favoriteStatus[company.id] = await isFavorite(company.id, 'company');
    }
    
    setCompanyFavoriteStatus(favoriteStatus);
    
    // Filtrer et définir les entreprises favorites
    const favorites = companiesToCheck.filter(company => favoriteStatus[company.id]);
    setFavoriteCompanies(favorites);
  };

  // Basculer le statut de favori d'une entreprise
  const handleToggleFavorite = async (company: Company) => {
    try {
      const newStatus = await toggleCompanyFavorite(company);
      
      setCompanyFavoriteStatus(prev => ({
        ...prev,
        [company.id]: newStatus
      }));
      
      // Mettre à jour la liste des favoris
      if (newStatus) {
        setFavoriteCompanies(prev => [...prev, company]);
      } else {
        setFavoriteCompanies(prev => prev.filter(c => c.id !== company.id));
      }
      
      toast({
        title: newStatus ? "Ajouté aux favoris" : "Retiré des favoris",
        description: `${company.name} a été ${newStatus ? 'ajouté à' : 'retiré de'} vos favoris.`
      });
    } catch (error) {
      console.error("Erreur lors du changement de statut favori:", error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de modifier le statut de favori.'
      });
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
      console.log("Préparation des options d'entreprises pour l'affichage:", companies.length);
      
      // Remplacer les options par la liste des entreprises
      options = getCompaniesOptions();
      
      // Ajouter l'option pour voir la prévisualisation en temps réel
      if (currentStep !== 'welcome' && formData.company) {
        addExtraOptions(options);
      }
      
      // Afficher un message de débogage
      toast({
        title: "Entreprises disponibles",
        description: `${companies.length} entreprises chargées pour la sélection.`,
      });
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
        "Bonjour ! Je suis votre assistant pour la création de contrat de travail. Je vais vous guider étape par étape pour générer un contrat personnalisé.",
        [{ text: "Commencer", value: "start" }]
      );
    }
  }, []);

  // Fonction de débogage
  const debugCompanies = () => {
    console.log("=== DEBUG ENTREPRISES ===");
    console.log("User ID:", currentUser?.uid);
    console.log("Nombre d'entreprises chargées:", companies.length);
    console.log("Liste des entreprises:", companies);
    console.log("Entreprise sélectionnée:", formData.companyId);
    console.log("========================");
    
    // Afficher un toast pour l'utilisateur
    toast({
      title: "Débogage entreprises",
      description: `${companies.length} entreprises trouvées. Voir la console pour plus de détails.`,
    });
  };

  // Gérer les réponses de l'assistant en fonction de l'étape
  const handleAssistantResponse = (step: string) => {
    setCurrentStep(step);
    
    switch (step) {
      case 'company':
        // Vérifier si des entreprises sont disponibles
        if (companies.length === 0) {
          // Proposer de créer une entreprise si aucune n'est disponible
          addMessage(
            'assistant',
            "Je ne trouve pas d'entreprise disponible dans votre compte. Vous devez d'abord créer ou ajouter une entreprise avant de pouvoir générer un contrat. Veuillez saisir le nom de l'entreprise pour laquelle vous souhaitez créer ce contrat.",
            [{ 
              text: "Créer une nouvelle entreprise", 
              value: "new_company",
              description: "Vous pourrez entrer les détails de l'entreprise" 
            }]
          );
        } else {
          // Débogage pour comprendre le problème
          setTimeout(debugCompanies, 1000);
          
          addMessage(
            'assistant',
            "Pour quelle entreprise souhaitez-vous créer ce contrat ? Vous pouvez sélectionner dans la liste ou saisir le nom d'une nouvelle entreprise.",
            companies.map(company => ({
              text: company.name,
              value: company.id,
              description: `ID: ${company.id}`
            }))
          );
        }
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

  // Gérer la fermeture des modes de prévisualisation
  const handleClosePreview = () => {
    setIsPreviewMode(false);
    setIsRealtimePreview(false);
  };

  // Rendu de la prévisualisation en temps réel
  const renderRealtimePreview = () => {
    return (
      <ContractPreview 
        data={formData as ContractData}
        onClose={handleClosePreview}
        templateId={formData.templateId as string}
        realtime={true}
        contractTypes={CONTRACT_TYPES}
        conventions={CONVENTIONS}
      />
    );
  };

  // Rendu du contrat généré
  const renderContractPreview = () => {
    return (
      <ContractPreview 
        data={formData as ContractData}
        onClose={handleClosePreview}
        templateId={formData.templateId as string}
        contractTypes={CONTRACT_TYPES}
        conventions={CONVENTIONS}
      />
    );
  };

  // Gérer l'affichage des entreprises avec les favoris en premier
  const getCompaniesOptions = () => {
    // Trier les entreprises : favoris d'abord, puis ordre alphabétique
    const sortedCompanies = [...companies].sort((a, b) => {
      const aIsFavorite = companyFavoriteStatus[a.id] || false;
      const bIsFavorite = companyFavoriteStatus[b.id] || false;
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      return a.name.localeCompare(b.name);
    });
    
    return sortedCompanies.map(company => ({
      text: company.name + (companyFavoriteStatus[company.id] ? ' ⭐' : ''),
      value: company.id,
      description: `ID: ${company.id}`
    }));
  };

  // Ajouter des options supplémentaires
  const addExtraOptions = (options: Option[]) => {
    // Ajouter l'option de prévisualisation en temps réel
    if (!options.some(o => o.value === 'realtime_preview')) {
      options.push({
        text: "Prévisualisation en temps réel",
        value: "realtime_preview",
        description: "Voir le contrat se construire au fur et à mesure"
      });
    }
  };

  if (isRealtimePreview) {
    return renderRealtimePreview();
  }

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
                          <div className="font-medium flex items-center justify-between">
                            <span>{option.text}</span>
                            
                            {/* Afficher un bouton de favori pour les entreprises */}
                            {currentStep === 'company' && companies.some(c => c.id === option.value) && (
                              <button 
                                className="ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const company = companies.find(c => c.id === option.value);
                                  if (company) handleToggleFavorite(company);
                                }}
                              >
                                <Star 
                                  className={`h-4 w-4 ${companyFavoriteStatus[option.value] ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
                                />
                              </button>
                            )}
                          </div>
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