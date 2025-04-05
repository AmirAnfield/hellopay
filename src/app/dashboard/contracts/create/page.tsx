"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { v4 as uuidv4 } from "uuid";
import { collection, getDocs } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase/config";

// Étapes du formulaire
const WIZARD_STEPS = [
  { id: "parties", title: "Parties", description: "Identification des parties contractantes" },
  { id: "contrat", title: "Contrat", description: "Type et paramètres du contrat" },
  { id: "essai", title: "Période d'essai", description: "Conditions de la période d'essai" },
  { id: "travail", title: "Travail", description: "Durée du travail et horaires" },
  { id: "remuneration", title: "Rémunération", description: "Salaire et avantages" },
  { id: "conges", title: "Congés", description: "Congés et dispositions légales" },
  { id: "clauses", title: "Clauses", description: "Clauses contractuelles optionnelles" },
  { id: "recapitulatif", title: "Récapitulatif", description: "Validation et génération du contrat" }
];

// État initial du formulaire
const initialContractState = {
  id: `contract-${Date.now()}-${uuidv4().substring(0, 8)}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  // Étape 1 : Identification des parties
  employeur: {
    raisonSociale: "",
    formeJuridique: "",
    siret: "",
    adresse: "",
    codePostal: "",
    ville: "",
    representant: "",
    fonction: "",
    conventionCollective: "",
    codeConvention: "",
    caisseRetraite: "",
    organismePrevoyance: ""
  },
  salarie: {
    civilite: "",
    nom: "",
    prenom: "",
    dateNaissance: "",
    lieuNaissance: "",
    nationalite: "",
    adresse: "",
    codePostal: "",
    ville: "",
    numeroSecuriteSociale: ""
  },
  
  // Étape 2 : Type de contrat et poste
  contrat: {
    type: "CDI_temps_plein", // CDI_temps_plein, CDI_temps_partiel, CDD_temps_plein, CDD_temps_partiel
    intitulePoste: "",
    qualification: "",
    motifCDD: "",
    personneRemplacee: "",
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: "",
    dureeMinimale: "",
    renouvelable: false,
    lieuTravail: ""
  },
  
  // Étape 3 : Période d'essai
  periodeEssai: {
    active: true,
    duree: 2, // en mois
    unite: "mois", // jours, semaines, mois
    renouvelable: false,
    dureeRenouvellement: 2,
    uniteRenouvellement: "mois" // jours, semaines, mois
  },
  
  // Étape 4 : Durée du travail
  travail: {
    dureeHebdo: 35,
    dureeJournaliere: 7,
    repartitionHoraires: "",
    joursTravailes: ["lundi", "mardi", "mercredi", "jeudi", "vendredi"],
    heuresComplementaires: 10, // % max d'heures complémentaires
    modificationRepartition: "",
    modalitesCommunication: ""
  },
  
  // Étape 5 : Rémunération
  remuneration: {
    tauxHoraire: 0,
    salaireBrutMensuel: 0,
    salaireNetMensuel: 0, // Calculé automatiquement
    salaireBrutAnnuel: 0, // Calculé automatiquement
    salaireNetAnnuel: 0, // Calculé automatiquement
    primes: [],
    avantagesNature: [],
    periodiciteVersement: "mensuel"
  },
  
  // Étape 6 : Congés et autres dispositions
  conges: {
    droitConges: "légal", // légal, conventionnel, spécifique
    nbJoursCongesSpecifiques: 0,
    dureePrevis: "",
    retraite: "",
    prevoyance: ""
  },
  
  // Étape 7 : Clauses optionnelles
  clauses: {
    confidentialite: false,
    nonConcurrence: {
      active: false,
      duree: 12,
      zone: "France",
      indemnite: 30
    },
    mobilite: {
      active: false,
      perimetre: ""
    },
    exclusivite: false,
    teletravail: {
      active: false,
      modalites: ""
    },
    proprieteIntellectuelle: false,
    deditFormation: {
      active: false,
      conditions: ""
    }
  },
  
  // Étape 8 : Génération
  generation: {
    dateSignature: new Date().toISOString().split('T')[0],
    lieuSignature: "",
    documentGenere: null
  },
  
  // Suivi du processus
  status: "draft",
  wizardProgress: {
    currentStep: "parties",
    completedSteps: []
  }
};

// Définition des types pour notre composant
interface Company {
  id: string;
  name?: string;
  raisonSociale?: string;
  formeJuridique?: string;
  siret?: string;
  address?: string;
  adresse?: string;
  postalCode?: string;
  codePostal?: string;
  city?: string;
  ville?: string;
  representant?: string;
  fonction?: string;
  conventionCollective?: string;
  codeConvention?: string;
  caisseRetraite?: string;
  organismePrevoyance?: string;
  [key: string]: any;
}

interface Employee {
  id: string;
  firstName?: string;
  prenom?: string;
  lastName?: string;
  nom?: string;
  email?: string;
  phone?: string;
  civilite?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  nationalite?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  numeroSecuriteSociale?: string;
  [key: string]: any;
}

export default function CreateContractPage() {
  const router = useRouter();
  const [contractData, setContractData] = useState(initialContractState);
  const [currentStep, setCurrentStep] = useState("parties");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);

  // Charger les données nécessaires
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // On n'utilise plus les API, mais Firestore directement
        if (!auth.currentUser) {
          const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
              await fetchFirestoreData(user.uid);
            } else {
              setIsLoading(false);
              toast({
                title: "Erreur d'authentification",
                description: "Veuillez vous connecter pour créer un contrat",
                variant: "destructive",
              });
            }
            unsubscribe();
          });
        } else {
          await fetchFirestoreData(auth.currentUser.uid);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    const fetchFirestoreData = async (userId: string) => {
      try {
        // Récupérer les entreprises
        console.log("Récupération des entreprises pour l'utilisateur:", userId);
        const companiesCollection = collection(firestore, `users/${userId}/companies`);
        const companiesSnapshot = await getDocs(companiesCollection);
        
        const companiesData: Company[] = [];
        companiesSnapshot.forEach((doc) => {
          companiesData.push({
            id: doc.id,
            ...doc.data() as Record<string, any>
          });
        });
        console.log(`${companiesData.length} entreprises trouvées:`, companiesData);
        setCompanies(companiesData);
        
        // Récupérer les employés
        console.log("Récupération des employés pour l'utilisateur:", userId);
        const employeesCollection = collection(firestore, `users/${userId}/employees`);
        const employeesSnapshot = await getDocs(employeesCollection);
        
        const employeesData: Employee[] = [];
        employeesSnapshot.forEach((doc) => {
          employeesData.push({
            id: doc.id,
            ...doc.data() as Record<string, any>
          });
        });
        console.log(`${employeesData.length} employés trouvés:`, employeesData);
        setEmployees(employeesData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données Firestore:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcul de la progression
  useEffect(() => {
    const currentStepIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
    const progressValue = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100;
    setProgress(progressValue);
  }, [currentStep]);

  // Mise à jour des données du contrat
  const handleDataChange = (stepId: string, newData: Record<string, any>) => {
    setContractData(prev => {
      const updatedData = {
        ...prev,
        [stepId]: {
          ...prev[stepId as keyof typeof prev],
          ...newData
        },
        updatedAt: new Date().toISOString()
      };
      
      // Calcul automatique pour la rémunération
      if (stepId === "remuneration") {
        if (newData.tauxHoraire && !newData.salaireBrutMensuel) {
          const heuresHebdo = prev.travail.dureeHebdo || 35;
          const salaireHebdo = newData.tauxHoraire * heuresHebdo;
          updatedData.remuneration.salaireBrutMensuel = (salaireHebdo * 52) / 12;
        }
        
        if (newData.salaireBrutMensuel && !newData.tauxHoraire) {
          const heuresHebdo = prev.travail.dureeHebdo || 35;
          const heuresMensuel = (heuresHebdo * 52) / 12;
          updatedData.remuneration.tauxHoraire = newData.salaireBrutMensuel / heuresMensuel;
        }
        
        // Calcul estimatif du net (approx. -23% de charges)
        updatedData.remuneration.salaireNetMensuel = updatedData.remuneration.salaireBrutMensuel * 0.77;
        updatedData.remuneration.salaireBrutAnnuel = updatedData.remuneration.salaireBrutMensuel * 12;
        updatedData.remuneration.salaireNetAnnuel = updatedData.remuneration.salaireNetMensuel * 12;
      }
      
      return updatedData;
    });
  };

  // Navigation entre les étapes
  const goToStep = (stepId: string) => {
    setCurrentStep(stepId);
    setContractData(prev => ({
      ...prev,
      wizardProgress: {
        ...prev.wizardProgress,
        currentStep: stepId
      }
    }));
  };

  const goToNextStep = () => {
    const currentStepIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      const nextStep = WIZARD_STEPS[currentStepIndex + 1].id;
      
      // Marquer l'étape actuelle comme complétée
      const completedSteps = [...contractData.wizardProgress.completedSteps];
      if (!completedSteps.includes(currentStep)) {
        completedSteps.push(currentStep);
      }
      
      setCurrentStep(nextStep);
      setContractData(prev => ({
        ...prev,
        wizardProgress: {
          currentStep: nextStep,
          completedSteps
        }
      }));

      // Activer le bouton Save après avoir validé l'étape 1
      if (currentStep === "parties") {
        setSaveButtonEnabled(true);
      }
    }
  };

  const goToPreviousStep = () => {
    const currentStepIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
    if (currentStepIndex > 0) {
      const prevStep = WIZARD_STEPS[currentStepIndex - 1].id;
      setCurrentStep(prevStep);
      setContractData(prev => ({
        ...prev,
        wizardProgress: {
          ...prev.wizardProgress,
          currentStep: prevStep
        }
      }));
    }
  };

  // Sauvegarde du brouillon
  const saveAsDraft = async () => {
    setIsSaving(true);
    try {
      // Convertir les données en FormData
      const formData = new FormData();
      formData.append('contractData', JSON.stringify(contractData));
      
      // Envoyer à l'API
      const response = await fetch("/api/contracts", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Brouillon enregistré",
          description: "Le contrat a été sauvegardé avec succès",
        });
      } else {
        throw new Error(result.message || "Une erreur est survenue lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Génération finale du contrat
  const generateContract = async () => {
    setIsSaving(true);
    try {
      // Finaliser le contrat
      const finalContract = {
        ...contractData,
        status: "active",
        updatedAt: new Date().toISOString(),
        generation: {
          ...contractData.generation,
          dateGeneration: new Date().toISOString()
        }
      };
      
      // Convertir les données en FormData
      const formData = new FormData();
      formData.append('contractData', JSON.stringify(finalContract));
      formData.append('generatePdf', 'true');
      
      // Envoyer à l'API
      const response = await fetch("/api/contracts/generate", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Contrat généré",
          description: "Le contrat a été généré et enregistré avec succès",
        });
        router.push(`/dashboard/contracts/${result.data.id}`);
      } else {
        throw new Error(result.message || "Une erreur est survenue lors de la génération");
      }
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la génération",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Rendu des étapes du formulaire
  const renderStepContent = () => {
    switch (currentStep) {
      case "parties":
        return <PartiesContractantesStep 
                 data={contractData.employeur} 
                 salarieData={contractData.salarie}
                 companies={companies}
                 employees={employees}
                 onChange={(newData) => handleDataChange("employeur", newData)}
                 onChangeSalarie={(newData) => handleDataChange("salarie", newData)}
              />;
      case "contrat":
        return <TypeContratStep 
                 data={contractData.contrat}
                 onChange={(newData) => handleDataChange("contrat", newData)}
              />;
      case "essai":
        return <PeriodeEssaiStep 
                 data={contractData.periodeEssai}
                 contractType={contractData.contrat.type}
                 onChange={(newData) => handleDataChange("periodeEssai", newData)}
              />;
      case "travail":
        return <DureeTravailStep 
                 data={contractData.travail}
                 contractType={contractData.contrat.type}
                 onChange={(newData) => handleDataChange("travail", newData)}
              />;
      case "remuneration":
        return <RemunerationStep 
                 data={contractData.remuneration}
                 travailData={contractData.travail}
                 onChange={(newData) => handleDataChange("remuneration", newData)}
              />;
      case "conges":
        return <CongesDispositionsStep 
                 data={contractData.conges}
                 onChange={(newData) => handleDataChange("conges", newData)}
              />;
      case "clauses":
        return <ClausesOptionellesStep 
                 data={contractData.clauses}
                 onChange={(newData) => handleDataChange("clauses", newData)}
              />;
      case "recapitulatif":
        return <RecapitulatifStep 
                 data={contractData}
                 onGenerate={generateContract}
              />;
      default:
        return <div>Étape non implémentée</div>;
    }
  };

  // Composants des étapes individuelles
  // Note: Ces composants seraient idéalement séparés dans des fichiers distincts
  const PartiesContractantesStep = ({ 
    data, 
    salarieData, 
    companies, 
    employees, 
    onChange, 
    onChangeSalarie 
  }: {
    data: Record<string, any>;
    salarieData: Record<string, any>;
    companies: Company[];
    employees: Employee[];
    onChange: (data: Record<string, any>) => void;
    onChangeSalarie: (data: Record<string, any>) => void;
  }) => {
    const [subStep, setSubStep] = useState<1 | 2>(1);
    const [companySelected, setCompanySelected] = useState(false);
    const [employeeSelected, setEmployeeSelected] = useState(false);

    const validateCompanySelection = () => {
      if (data.raisonSociale) {
        setCompanySelected(true);
        setSubStep(2);
      } else {
        toast({
          title: "Sélection requise",
          description: "Veuillez sélectionner une entreprise avant de continuer",
          variant: "destructive",
        });
      }
    };

    const validateEmployeeSelection = () => {
      if (salarieData.nom) {
        setEmployeeSelected(true);
      } else {
        toast({
          title: "Sélection requise",
          description: "Veuillez sélectionner un employé avant de continuer",
          variant: "destructive",
        });
      }
    };

    return (
      <div className="space-y-8">
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
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium mb-6">Sélection de l'entreprise</h3>
            
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                <div className="flex-grow">
                  <select
                    className="w-full p-3 text-base border rounded-md bg-white"
                    onChange={(e) => {
                      const companyId = e.target.value;
                      if (companyId) {
                        const company = companies.find(comp => comp.id === companyId);
                        if (company) {
                          console.log("Entreprise sélectionnée:", company);
                          onChange({
                            raisonSociale: company.name || company.raisonSociale || "",
                            formeJuridique: company.formeJuridique || "",
                            siret: company.siret || "",
                            adresse: company.address || company.adresse || "",
                            codePostal: company.postalCode || company.codePostal || "",
                            ville: company.city || company.ville || "",
                            representant: company.representant || "",
                            fonction: company.fonction || "",
                            conventionCollective: company.conventionCollective || "",
                            codeConvention: company.codeConvention || "",
                            caisseRetraite: company.caisseRetraite || "",
                            organismePrevoyance: company.organismePrevoyance || ""
                          });
                          toast({
                            title: "Entreprise sélectionnée",
                            description: `Les informations de ${company.name || company.raisonSociale} ont été chargées.`,
                            variant: "default",
                          });
                        }
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Choisir une entreprise</option>
                    {companies && companies.length > 0 ? (
                      companies.map(company => {
                        const displayName = company.name || company.raisonSociale || 
                                            company.nom || `Entreprise ${company.id.substring(0, 4)}`;
                        return (
                          <option key={company.id} value={company.id}>
                            {displayName}
                          </option>
                        );
                      })
                    ) : (
                      <option value="" disabled>Aucune entreprise disponible</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
            
            {data.raisonSociale && (
              <div className="bg-blue-50 rounded-md border border-blue-100 p-4">
                <h4 className="text-sm font-medium mb-4">Informations de l'entreprise</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Raison sociale</p>
                    <p className="text-sm">{data.raisonSociale}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Forme juridique</p>
                    <p className="text-sm">{data.formeJuridique || "-"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">SIRET</p>
                    <p className="text-sm">{data.siret || "-"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Adresse</p>
                    <p className="text-sm">{data.adresse}, {data.codePostal} {data.ville}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Représentant</p>
                    <p className="text-sm">{data.representant || "-"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Fonction</p>
                    <p className="text-sm">{data.fonction || "-"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Convention collective</p>
                    <p className="text-sm">{data.conventionCollective || "-"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Code IDCC</p>
                    <p className="text-sm">{data.codeConvention || "-"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Caisse de retraite</p>
                    <p className="text-sm">{data.caisseRetraite || "-"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Organisme de prévoyance</p>
                    <p className="text-sm">{data.organismePrevoyance || "-"}</p>
                  </div>
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
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Sélection du salarié</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSubStep(1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <div className="flex-grow">
                  <select
                    className="w-full p-3 text-base border rounded-md bg-white"
                    onChange={(e) => {
                      const employeeId = e.target.value;
                      if (employeeId) {
                        const employee = employees.find(emp => emp.id === employeeId);
                        if (employee) {
                          console.log("Employé sélectionné:", employee);
                          onChangeSalarie({
                            civilite: employee.civilite || "",
                            nom: employee.nom || employee.lastName || "",
                            prenom: employee.prenom || employee.firstName || "",
                            dateNaissance: employee.dateNaissance || employee.birthDate || "",
                            lieuNaissance: employee.lieuNaissance || employee.birthPlace || "",
                            nationalite: employee.nationalite || employee.nationality || "",
                            adresse: employee.adresse || employee.address || "",
                            codePostal: employee.codePostal || employee.postalCode || "",
                            ville: employee.ville || employee.city || "",
                            numeroSecuriteSociale: employee.numeroSecuriteSociale || employee.socialSecurityNumber || ""
                          });
                          toast({
                            title: "Employé sélectionné",
                            description: `Les informations de ${employee.prenom || employee.firstName || ""} ${employee.nom || employee.lastName || ""} ont été chargées.`,
                            variant: "default",
                          });
                        }
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Choisir un employé</option>
                    {employees && employees.length > 0 ? (
                      employees.map(employee => {
                        const firstName = employee.prenom || employee.firstName || "";
                        const lastName = employee.nom || employee.lastName || "";
                        const displayName = firstName && lastName 
                          ? `${firstName} ${lastName}`
                          : employee.name || `Employé ${employee.id.substring(0, 4)}`;
                        return (
                          <option key={employee.id} value={employee.id}>
                            {displayName}
                          </option>
                        );
                      })
                    ) : (
                      <option value="" disabled>Aucun employé disponible</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
            
            {salarieData.nom && (
              <div className="bg-blue-50 rounded-md border border-blue-100 p-4">
                <h4 className="text-sm font-medium mb-4">Informations du salarié</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Nom complet</p>
                    <p className="text-sm">{salarieData.civilite} {salarieData.prenom} {salarieData.nom}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Date de naissance</p>
                    <p className="text-sm">{salarieData.dateNaissance || "-"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Lieu de naissance</p>
                    <p className="text-sm">{salarieData.lieuNaissance || "-"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Nationalité</p>
                    <p className="text-sm">{salarieData.nationalite || "-"}</p>
                  </div>
                  
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-xs font-medium text-gray-500">Adresse</p>
                    <p className="text-sm">{salarieData.adresse}, {salarieData.codePostal} {salarieData.ville}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Numéro de sécurité sociale</p>
                    <p className="text-sm">{salarieData.numeroSecuriteSociale || "-"}</p>
                  </div>
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

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-700">
          <div className="flex items-start space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
            <div>
              <p>Vous devez sélectionner une entreprise et un salarié pour créer un contrat.</p>
              <p className="mt-1">Si l&apos;entreprise ou le salarié souhaité n&apos;apparaît pas dans la liste, veuillez d&apos;abord le créer depuis le tableau de bord.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const TypeContratStep = ({ data, onChange }) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b">
          <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">1</span>
          <h3 className="text-base font-medium">Type de contrat</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm font-medium">Sélectionnez le type de contrat <span className="text-destructive">*</span></label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div 
                className={`border rounded-md p-4 transition-colors cursor-pointer ${data.type === 'CDI_temps_plein' ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}
                onClick={() => onChange({ ...data, type: 'CDI_temps_plein' })}
              >
                <div className="flex items-center space-x-2">
                  <div className={`h-4 w-4 rounded-full ${data.type === 'CDI_temps_plein' ? 'bg-primary' : 'border'}`}></div>
                  <span className="font-medium text-sm">CDI à temps plein</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Contrat à durée indéterminée à temps complet</p>
              </div>
              
              <div 
                className={`border rounded-md p-4 transition-colors cursor-pointer ${data.type === 'CDI_temps_partiel' ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}
                onClick={() => onChange({ ...data, type: 'CDI_temps_partiel' })}
              >
                <div className="flex items-center space-x-2">
                  <div className={`h-4 w-4 rounded-full ${data.type === 'CDI_temps_partiel' ? 'bg-primary' : 'border'}`}></div>
                  <span className="font-medium text-sm">CDI à temps partiel</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Contrat à durée indéterminée à temps partiel</p>
              </div>
              
              <div 
                className={`border rounded-md p-4 transition-colors cursor-pointer ${data.type === 'CDD_temps_plein' ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}
                onClick={() => onChange({ ...data, type: 'CDD_temps_plein' })}
              >
                <div className="flex items-center space-x-2">
                  <div className={`h-4 w-4 rounded-full ${data.type === 'CDD_temps_plein' ? 'bg-primary' : 'border'}`}></div>
                  <span className="font-medium text-sm">CDD à temps plein</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Contrat à durée déterminée à temps complet</p>
              </div>
              
              <div 
                className={`border rounded-md p-4 transition-colors cursor-pointer ${data.type === 'CDD_temps_partiel' ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}
                onClick={() => onChange({ ...data, type: 'CDD_temps_partiel' })}
              >
                <div className="flex items-center space-x-2">
                  <div className={`h-4 w-4 rounded-full ${data.type === 'CDD_temps_partiel' ? 'bg-primary' : 'border'}`}></div>
                  <span className="font-medium text-sm">CDD à temps partiel</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Contrat à durée déterminée à temps partiel</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 pb-2 border-b pt-4">
          <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">2</span>
          <h3 className="text-base font-medium">Poste et lieu de travail</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="intitulePoste" className="text-sm font-medium">Intitulé du poste <span className="text-destructive">*</span></label>
            <input 
              id="intitulePoste"
              type="text"
              className="w-full p-2 border rounded-md text-sm" 
              value={data.intitulePoste}
              onChange={(e) => onChange({ ...data, intitulePoste: e.target.value })}
              placeholder="Ex: Développeur Web, Comptable..."
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="qualification" className="text-sm font-medium">Qualification / Coefficient <span className="text-destructive">*</span></label>
            <input 
              id="qualification"
              type="text"
              className="w-full p-2 border rounded-md text-sm" 
              value={data.qualification}
              onChange={(e) => onChange({ ...data, qualification: e.target.value })}
              placeholder="Ex: Cadre, Agent de maîtrise, Niveau II..."
            />
          </div>
          
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label htmlFor="lieuTravail" className="text-sm font-medium">Lieu de travail <span className="text-destructive">*</span></label>
            <input 
              id="lieuTravail"
              type="text"
              className="w-full p-2 border rounded-md text-sm" 
              value={data.lieuTravail}
              onChange={(e) => onChange({ ...data, lieuTravail: e.target.value })}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 pb-2 border-b pt-4">
          <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">3</span>
          <h3 className="text-base font-medium">Dates du contrat</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="dateDebut" className="text-sm font-medium">Date de début <span className="text-destructive">*</span></label>
            <input 
              id="dateDebut"
              type="date"
              className="w-full p-2 border rounded-md text-sm" 
              value={data.dateDebut}
              onChange={(e) => onChange({ ...data, dateDebut: e.target.value })}
            />
          </div>
          
          {(data.type === 'CDD_temps_plein' || data.type === 'CDD_temps_partiel') && (
            <>
              <div className="space-y-2">
                <label htmlFor="dateFin" className="text-sm font-medium">Date de fin <span className="text-destructive">*</span></label>
                <input 
                  id="dateFin"
                  type="date"
                  className="w-full p-2 border rounded-md text-sm" 
                  value={data.dateFin || ""}
                  onChange={(e) => onChange({ ...data, dateFin: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="motifCDD" className="text-sm font-medium">Motif du CDD <span className="text-destructive">*</span></label>
                <select 
                  id="motifCDD"
                  className="w-full p-2 border rounded-md text-sm"
                  value={data.motifCDD || ""}
                  onChange={(e) => onChange({ ...data, motifCDD: e.target.value })}
                >
                  <option value="">Sélectionner</option>
                  <option value="Remplacement salarié absent">Remplacement d'un salarié absent</option>
                  <option value="Accroissement temporaire d'activité">Accroissement temporaire d'activité</option>
                  <option value="Emploi saisonnier">Emploi saisonnier</option>
                  <option value="Emploi d'usage">Emploi d'usage</option>
                  <option value="Remplacement chef d'entreprise">Remplacement du chef d'entreprise</option>
                </select>
              </div>
              
              {data.motifCDD === "Remplacement salarié absent" && (
                <div className="space-y-2">
                  <label htmlFor="personneRemplacee" className="text-sm font-medium">Personne remplacée <span className="text-destructive">*</span></label>
                  <input 
                    id="personneRemplacee"
                    type="text"
                    className="w-full p-2 border rounded-md text-sm" 
                    value={data.personneRemplacee || ""}
                    onChange={(e) => onChange({ ...data, personneRemplacee: e.target.value })}
                  />
                </div>
              )}
              
              <div className="space-y-2 flex items-center">
                <label className="inline-flex items-center text-sm font-medium cursor-pointer">
                  <input 
                    type="checkbox"
                    className="mr-2 h-4 w-4"
                    checked={data.renouvelable}
                    onChange={(e) => onChange({ ...data, renouvelable: e.target.checked })}
                  />
                  Contrat renouvelable
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };
  
  const PeriodeEssaiStep = ({ data, contractType, onChange }) => {
    return (
      <div className="space-y-6">
        <div className="bg-muted p-4 rounded-md">
          <div className="flex items-start space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-0.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            <div>
              <h4 className="text-sm font-medium">Durées maximales légales de la période d'essai</h4>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                {contractType.startsWith('CDI') ? (
                  <>
                    <li>• Ouvriers et employés : 2 mois</li>
                    <li>• Techniciens et agents de maîtrise : 3 mois</li>
                    <li>• Cadres : 4 mois</li>
                  </>
                ) : (
                  <>
                    <li>• CDD inférieur à 6 mois : 1 jour par semaine (max 2 semaines)</li>
                    <li>• CDD supérieur à 6 mois : 1 mois maximum</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center text-sm font-medium">
            <input 
              type="checkbox"
              className="mr-2 h-4 w-4"
              checked={data.active}
              onChange={(e) => onChange({ ...data, active: e.target.checked })}
            />
            Inclure une période d'essai
          </label>
        </div>
        
        {data.active && (
          <div className="border rounded-md p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="duree" className="text-sm font-medium">Durée <span className="text-destructive">*</span></label>
                <div className="flex space-x-2">
                  <input 
                    id="duree"
                    type="number"
                    min="1"
                    className="w-20 p-2 border rounded-md text-sm" 
                    value={data.duree}
                    onChange={(e) => onChange({ ...data, duree: parseInt(e.target.value) || 0 })}
                  />
                  <select 
                    id="unite"
                    className="flex-1 p-2 border rounded-md text-sm"
                    value={data.unite}
                    onChange={(e) => onChange({ ...data, unite: e.target.value })}
                  >
                    <option value="jours">Jours</option>
                    <option value="semaines">Semaines</option>
                    <option value="mois">Mois</option>
                  </select>
                </div>
              </div>
              
              {contractType.startsWith('CDI') && (
                <div className="space-y-2">
                  <label className="inline-flex items-center text-sm font-medium">
                    <input 
                      type="checkbox"
                      className="mr-2 h-4 w-4"
                      checked={data.renouvelable}
                      onChange={(e) => onChange({ ...data, renouvelable: e.target.checked })}
                    />
                    Période d'essai renouvelable
                  </label>
                </div>
              )}
              
              {data.renouvelable && (
                <div className="space-y-2">
                  <label htmlFor="dureeRenouvellement" className="text-sm font-medium">Durée du renouvellement <span className="text-destructive">*</span></label>
                  <div className="flex space-x-2">
                    <input 
                      id="dureeRenouvellement"
                      type="number"
                      min="1"
                      className="w-20 p-2 border rounded-md text-sm" 
                      value={data.dureeRenouvellement || 0}
                      onChange={(e) => onChange({ ...data, dureeRenouvellement: parseInt(e.target.value) || 0 })}
                    />
                    <select 
                      id="uniteRenouvellement"
                      className="flex-1 p-2 border rounded-md text-sm"
                      value={data.uniteRenouvellement || data.unite}
                      onChange={(e) => onChange({ ...data, uniteRenouvellement: e.target.value })}
                    >
                      <option value="jours">Jours</option>
                      <option value="semaines">Semaines</option>
                      <option value="mois">Mois</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const DureeTravailStep = ({ data, contractType, onChange }) => {
    const isTempsPartiel = contractType.includes('temps_partiel');
    
    const handleJoursTravailChange = (jour, checked) => {
      let newJours = [...data.joursTravailes];
      
      if (checked && !newJours.includes(jour)) {
        newJours.push(jour);
      } else if (!checked && newJours.includes(jour)) {
        newJours = newJours.filter(j => j !== jour);
      }
      
      onChange({ ...data, joursTravailes: newJours });
    };
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6 bg-muted/30 p-5 rounded-lg border">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">1</span>
              <h3 className="text-base font-medium">Durée du travail</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="dureeHebdo" className="text-sm font-medium">
                  Durée hebdomadaire de travail <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input 
                    id="dureeHebdo"
                    type="number"
                    min="1"
                    max={isTempsPartiel ? "34" : "48"}
                    className="w-20 p-2 border rounded-md text-sm" 
                    value={data.dureeHebdo}
                    onChange={(e) => onChange({ ...data, dureeHebdo: parseFloat(e.target.value) || 35 })}
                  />
                  <span className="text-sm">heures par semaine</span>
                </div>
                {isTempsPartiel && (
                  <p className="text-xs text-muted-foreground mt-1">Pour un temps partiel, la durée doit être inférieure à 35h.</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="dureeJournaliere" className="text-sm font-medium">
                  Durée journalière moyenne
                </label>
                <div className="flex items-center space-x-2">
                  <input 
                    id="dureeJournaliere"
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    className="w-20 p-2 border rounded-md text-sm" 
                    value={data.dureeJournaliere}
                    onChange={(e) => onChange({ ...data, dureeJournaliere: parseFloat(e.target.value) || 7 })}
                  />
                  <span className="text-sm">heures par jour</span>
                </div>
              </div>
              
              {isTempsPartiel && (
                <div className="space-y-2">
                  <label htmlFor="heuresComplementaires" className="text-sm font-medium">
                    Heures complémentaires maximum <span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input 
                      id="heuresComplementaires"
                      type="number"
                      min="0"
                      max="33"
                      className="w-20 p-2 border rounded-md text-sm" 
                      value={data.heuresComplementaires}
                      onChange={(e) => onChange({ ...data, heuresComplementaires: parseFloat(e.target.value) || 10 })}
                    />
                    <span className="text-sm">% de la durée contractuelle</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Le pourcentage légal est de 10%, mais peut aller jusqu'à 33% par accord collectif.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6 bg-muted/30 p-5 rounded-lg border">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">2</span>
              <h3 className="text-base font-medium">Jours travaillés</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Jours de travail <span className="text-destructive">*</span></label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'].map((jour) => (
                  <div key={jour} className="flex items-center space-x-2">
                    <input 
                      type="checkbox"
                      id={`jour-${jour}`}
                      checked={data.joursTravailes.includes(jour)}
                      onChange={(e) => handleJoursTravailChange(jour, e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`jour-${jour}`} className="text-sm capitalize">{jour}</label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Sélectionnez les jours habituellement travaillés.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/30 p-5 rounded-lg border space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">3</span>
            <h3 className="text-base font-medium">Répartition des horaires</h3>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="repartitionHoraires" className="text-sm font-medium">
              Détail de la répartition des horaires {isTempsPartiel && <span className="text-destructive">*</span>}
            </label>
            <textarea 
              id="repartitionHoraires"
              className="w-full p-3 border rounded-md text-sm h-24" 
              value={data.repartitionHoraires || ""}
              onChange={(e) => onChange({ ...data, repartitionHoraires: e.target.value })}
              placeholder={isTempsPartiel 
                ? "Ex: Lundi, mardi, jeudi de 9h à 13h et de 14h à 17h, soit 7h par jour." 
                : "Ex: Du lundi au vendredi de 9h à 12h30 et de 14h à 17h30. Ou : Selon les horaires en vigueur dans l'entreprise."}
            />
            {isTempsPartiel && (
              <p className="text-xs text-primary-foreground">
                <span className="text-destructive font-semibold">Important:</span> Pour un contrat à temps partiel, la répartition des horaires de travail, 
                les limites d'heures complémentaires, et les modalités de modification éventuelle sont une mention obligatoire.
              </p>
            )}
          </div>
          
          {isTempsPartiel && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="modalitesCommunication" className="text-sm font-medium">
                    Modalités de communication des horaires <span className="text-destructive">*</span>
                  </label>
                  <input 
                    id="modalitesCommunication"
                    type="text"
                    className="w-full p-2 border rounded-md text-sm" 
                    value={data.modalitesCommunication || ""}
                    onChange={(e) => onChange({ ...data, modalitesCommunication: e.target.value })}
                    placeholder="Ex: Planning transmis une semaine à l'avance par email"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="modificationRepartition" className="text-sm font-medium">
                    Cas de modification de la répartition <span className="text-destructive">*</span>
                  </label>
                  <input 
                    id="modificationRepartition"
                    type="text"
                    className="w-full p-2 border rounded-md text-sm" 
                    value={data.modificationRepartition || ""}
                    onChange={(e) => onChange({ ...data, modificationRepartition: e.target.value })}
                    placeholder="Ex: Surcroît d'activité, absence d'un salarié..."
                  />
                </div>
              </div>
              
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Règles spécifiques au temps partiel</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      Le contrat à temps partiel doit obligatoirement préciser la répartition des horaires de travail, 
                      les limites d'heures complémentaires, et les modalités de modification éventuelle.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };
  
  const RemunerationStep = ({ data, travailData, onChange }) => {
    // Fonction pour ajouter une prime
    const ajouterPrime = () => {
      const newPrimes = [...data.primes, { nom: "", montant: 0, frequence: "mensuelle", conditions: "" }];
      onChange({ ...data, primes: newPrimes });
    };
    
    // Fonction pour mettre à jour une prime
    const updatePrime = (index, field, value) => {
      const newPrimes = [...data.primes];
      newPrimes[index] = { ...newPrimes[index], [field]: value };
      onChange({ ...data, primes: newPrimes });
    };
    
    // Fonction pour supprimer une prime
    const supprimerPrime = (index) => {
      const newPrimes = [...data.primes];
      newPrimes.splice(index, 1);
      onChange({ ...data, primes: newPrimes });
    };
    
    // Fonction pour ajouter un avantage
    const ajouterAvantage = () => {
      const newAvantages = [...data.avantagesNature, { nom: "", description: "", valeur: 0 }];
      onChange({ ...data, avantagesNature: newAvantages });
    };
    
    // Fonction pour mettre à jour un avantage
    const updateAvantage = (index, field, value) => {
      const newAvantages = [...data.avantagesNature];
      newAvantages[index] = { ...newAvantages[index], [field]: value };
      onChange({ ...data, avantagesNature: newAvantages });
    };
    
    // Fonction pour supprimer un avantage
    const supprimerAvantage = (index) => {
      const newAvantages = [...data.avantagesNature];
      newAvantages.splice(index, 1);
      onChange({ ...data, avantagesNature: newAvantages });
    };
    
    // Pour calculer le salaire brut mensuel si on entre le taux horaire
    const updateTauxHoraire = (value) => {
      const tauxHoraire = parseFloat(value) || 0;
      const heuresHebdo = travailData.dureeHebdo || 35;
      const salaireBrutMensuel = (tauxHoraire * heuresHebdo * 52) / 12;
      
      onChange({
        ...data,
        tauxHoraire,
        salaireBrutMensuel,
        salaireNetMensuel: salaireBrutMensuel * 0.77,
        salaireBrutAnnuel: salaireBrutMensuel * 12,
        salaireNetAnnuel: salaireBrutMensuel * 0.77 * 12
      });
    };
    
    // Pour calculer le taux horaire si on entre le salaire brut mensuel
    const updateSalaireBrutMensuel = (value) => {
      const salaireBrutMensuel = parseFloat(value) || 0;
      const heuresHebdo = travailData.dureeHebdo || 35;
      const heuresMensuel = (heuresHebdo * 52) / 12;
      const tauxHoraire = salaireBrutMensuel / heuresMensuel;
      
      onChange({
        ...data,
        tauxHoraire,
        salaireBrutMensuel,
        salaireNetMensuel: salaireBrutMensuel * 0.77,
        salaireBrutAnnuel: salaireBrutMensuel * 12,
        salaireNetAnnuel: salaireBrutMensuel * 0.77 * 12
      });
    };
    
    return (
      <div className="space-y-6">
        <div className="bg-muted/30 p-5 rounded-lg border space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">1</span>
            <h3 className="text-base font-medium">Salaire de base</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="tauxHoraire" className="text-sm font-medium">Taux horaire brut <span className="text-destructive">*</span></label>
              <div className="relative">
                <input 
                  id="tauxHoraire"
                  type="number"
                  step="0.01"
                  min="11.52"
                  className="w-full p-2 pl-7 border rounded-md text-sm" 
                  value={data.tauxHoraire.toFixed(2)}
                  onChange={(e) => updateTauxHoraire(e.target.value)}
                />
                <span className="absolute left-2.5 top-2.5 text-sm text-muted-foreground">€</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Le SMIC horaire brut est de 11.52€ en 2023.</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="salaireBrutMensuel" className="text-sm font-medium">Salaire mensuel brut <span className="text-destructive">*</span></label>
              <div className="relative">
                <input 
                  id="salaireBrutMensuel"
                  type="number"
                  step="1"
                  min="1746.38"
                  className="w-full p-2 pl-7 border rounded-md text-sm" 
                  value={data.salaireBrutMensuel.toFixed(2)}
                  onChange={(e) => updateSalaireBrutMensuel(e.target.value)}
                />
                <span className="absolute left-2.5 top-2.5 text-sm text-muted-foreground">€</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Pour {travailData.dureeHebdo}h par semaine</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Salaire mensuel net estimé</label>
              <div className="relative">
                <input 
                  type="text"
                  className="w-full p-2 pl-7 border rounded-md text-sm bg-muted/50" 
                  value={data.salaireNetMensuel.toFixed(2)}
                  readOnly
                />
                <span className="absolute left-2.5 top-2.5 text-sm text-muted-foreground">€</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Estimation basée sur 23% de charges sociales</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Salaire annuel brut estimé</label>
              <div className="relative">
                <input 
                  type="text"
                  className="w-full p-2 pl-7 border rounded-md text-sm bg-muted/50" 
                  value={data.salaireBrutAnnuel.toFixed(2)}
                  readOnly
                />
                <span className="absolute left-2.5 top-2.5 text-sm text-muted-foreground">€</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Sur 12 mois</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="periodiciteVersement" className="text-sm font-medium">Périodicité de versement</label>
              <select 
                id="periodiciteVersement"
                className="w-full p-2 border rounded-md text-sm"
                value={data.periodiciteVersement}
                onChange={(e) => onChange({ ...data, periodiciteVersement: e.target.value })}
              >
                <option value="mensuel">Mensuel</option>
                <option value="hebdomadaire">Hebdomadaire</option>
                <option value="bimensuel">Bimensuel</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/30 p-5 rounded-lg border space-y-6">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center space-x-2">
              <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">2</span>
              <h3 className="text-base font-medium">Primes et compléments de salaire</h3>
            </div>
            <button
              type="button"
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-md"
              onClick={ajouterPrime}
            >
              + Ajouter une prime
            </button>
          </div>
          
          {data.primes.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Aucune prime ou complément de salaire
            </div>
          ) : (
            <div className="space-y-4">
              {data.primes.map((prime, index) => (
                <div key={index} className="border rounded-md p-3 relative">
                  <button 
                    type="button" 
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    onClick={() => supprimerPrime(index)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Intitulé</label>
                      <input 
                        type="text"
                        className="w-full p-2 border rounded-md text-sm" 
                        value={prime.nom}
                        onChange={(e) => updatePrime(index, 'nom', e.target.value)}
                        placeholder="Ex: Prime de performance"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Montant</label>
                      <div className="relative">
                        <input 
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full p-2 pl-7 border rounded-md text-sm" 
                          value={prime.montant}
                          onChange={(e) => updatePrime(index, 'montant', parseFloat(e.target.value) || 0)}
                        />
                        <span className="absolute left-2.5 top-2.5 text-sm text-muted-foreground">€</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Fréquence</label>
                      <select 
                        className="w-full p-2 border rounded-md text-sm"
                        value={prime.frequence}
                        onChange={(e) => updatePrime(index, 'frequence', e.target.value)}
                      >
                        <option value="mensuelle">Mensuelle</option>
                        <option value="trimestrielle">Trimestrielle</option>
                        <option value="semestrielle">Semestrielle</option>
                        <option value="annuelle">Annuelle</option>
                      </select>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Conditions (optionnel)</label>
                      <input 
                        type="text"
                        className="w-full p-2 border rounded-md text-sm" 
                        value={prime.conditions || ""}
                        onChange={(e) => updatePrime(index, 'conditions', e.target.value)}
                        placeholder="Ex: Atteinte des objectifs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-muted/30 p-5 rounded-lg border space-y-6">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center space-x-2">
              <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">3</span>
              <h3 className="text-base font-medium">Avantages en nature</h3>
            </div>
            <button
              type="button"
              className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-2 py-1 rounded-md"
              onClick={ajouterAvantage}
            >
              + Ajouter un avantage
            </button>
          </div>
          
          {data.avantagesNature.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Aucun avantage en nature
            </div>
          ) : (
            <div className="space-y-4">
              {data.avantagesNature.map((avantage, index) => (
                <div key={index} className="border rounded-md p-3 relative">
                  <button 
                    type="button" 
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                    onClick={() => supprimerAvantage(index)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Type d'avantage</label>
                      <input 
                        type="text"
                        className="w-full p-2 border rounded-md text-sm" 
                        value={avantage.nom}
                        onChange={(e) => updateAvantage(index, 'nom', e.target.value)}
                        placeholder="Ex: Véhicule de fonction"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Valeur (optionnel)</label>
                      <div className="relative">
                        <input 
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full p-2 pl-7 border rounded-md text-sm" 
                          value={avantage.valeur || ""}
                          onChange={(e) => updateAvantage(index, 'valeur', parseFloat(e.target.value) || 0)}
                        />
                        <span className="absolute left-2.5 top-2.5 text-sm text-muted-foreground">€</span>
                      </div>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 space-y-1">
                      <label className="text-xs font-medium">Description (optionnel)</label>
                      <input 
                        type="text"
                        className="w-full p-2 border rounded-md text-sm" 
                        value={avantage.description || ""}
                        onChange={(e) => updateAvantage(index, 'description', e.target.value)}
                        placeholder="Ex: Modèle Peugeot 208, usage privé autorisé"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const CongesDispositionsStep = ({ data, onChange }) => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-muted/30 p-5 rounded-lg border space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">1</span>
              <h3 className="text-base font-medium">Congés payés</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Régime de congés payés <span className="text-destructive">*</span></label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio"
                      id="droitConges-legal"
                      checked={data.droitConges === "légal"}
                      onChange={() => onChange({ ...data, droitConges: "légal" })}
                      className="h-4 w-4"
                    />
                    <label htmlFor="droitConges-legal" className="text-sm">Régime légal (2,5 jours ouvrables par mois)</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio"
                      id="droitConges-conventionnel"
                      checked={data.droitConges === "conventionnel"}
                      onChange={() => onChange({ ...data, droitConges: "conventionnel" })}
                      className="h-4 w-4"
                    />
                    <label htmlFor="droitConges-conventionnel" className="text-sm">Régime conventionnel</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input 
                      type="radio"
                      id="droitConges-specifique"
                      checked={data.droitConges === "spécifique"}
                      onChange={() => onChange({ ...data, droitConges: "spécifique" })}
                      className="h-4 w-4"
                    />
                    <label htmlFor="droitConges-specifique" className="text-sm">Régime spécifique</label>
                  </div>
                </div>
              </div>
              
              {data.droitConges === "spécifique" && (
                <div className="space-y-2">
                  <label htmlFor="nbJoursCongesSpecifiques" className="text-sm font-medium">
                    Nombre de jours par an <span className="text-destructive">*</span>
                  </label>
                  <input 
                    id="nbJoursCongesSpecifiques"
                    type="number"
                    min="1"
                    max="50"
                    className="w-24 p-2 border rounded-md text-sm" 
                    value={data.nbJoursCongesSpecifiques}
                    onChange={(e) => onChange({ ...data, nbJoursCongesSpecifiques: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 mt-0.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Rappel</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Le régime légal est de 2,5 jours ouvrables par mois de travail effectif, 
                    soit 5 semaines pour une année complète de travail.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/30 p-5 rounded-lg border space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b">
              <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">2</span>
              <h3 className="text-base font-medium">Délai de préavis</h3>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="dureePrevis" className="text-sm font-medium">Durée du préavis en cas de rupture</label>
              <input 
                id="dureePrevis"
                type="text"
                className="w-full p-2 border rounded-md text-sm" 
                value={data.dureePrevis || ""}
                onChange={(e) => onChange({ ...data, dureePrevis: e.target.value })}
                placeholder="Ex: 2 mois pour un cadre, 1 mois pour un non-cadre"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Si non précisé, le contrat fera référence aux dispositions légales et conventionnelles en vigueur.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-muted/30 p-5 rounded-lg border space-y-6">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <span className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">3</span>
            <h3 className="text-base font-medium">Organismes de protection sociale</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="retraite" className="text-sm font-medium">Caisse de retraite complémentaire</label>
              <input 
                id="retraite"
                type="text"
                className="w-full p-2 border rounded-md text-sm" 
                value={data.retraite || ""}
                onChange={(e) => onChange({ ...data, retraite: e.target.value })}
                placeholder="Ex: Agirc-Arrco"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="prevoyance" className="text-sm font-medium">Organisme de prévoyance</label>
              <input 
                id="prevoyance"
                type="text"
                className="w-full p-2 border rounded-md text-sm" 
                value={data.prevoyance || ""}
                onChange={(e) => onChange({ ...data, prevoyance: e.target.value })}
                placeholder="Ex: AG2R, Malakoff"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const ClausesOptionellesStep = ({ data, onChange }) => {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-6">
          <h3 className="text-base font-medium mb-2">Clauses contractuelles optionnelles</h3>
          <p className="text-sm text-muted-foreground">
            Les clauses suivantes sont optionnelles et peuvent être incluses dans le contrat en fonction des spécificités du poste et de vos besoins. 
            Cochez uniquement celles qui sont pertinentes pour ce contrat.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-muted/30 p-5 rounded-lg border">
            <div className="flex items-center justify-between space-x-3 mb-4">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox"
                  id="clause-confidentialite"
                  checked={data.confidentialite}
                  onChange={(e) => onChange({ ...data, confidentialite: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="clause-confidentialite" className="text-base font-medium">Clause de confidentialité</label>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Engage le salarié à ne pas divulguer les informations confidentielles auxquelles il a accès, 
              pendant et après son contrat.
            </p>
          </div>
          
          <div className={`bg-muted/30 p-5 rounded-lg border ${data.nonConcurrence.active ? 'border-primary' : ''}`}>
            <div className="flex items-center justify-between space-x-3 mb-3">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox"
                  id="clause-nonConcurrence"
                  checked={data.nonConcurrence.active}
                  onChange={(e) => onChange({ 
                    ...data, 
                    nonConcurrence: { 
                      ...data.nonConcurrence, 
                      active: e.target.checked 
                    } 
                  })}
                  className="h-4 w-4"
                />
                <label htmlFor="clause-nonConcurrence" className="text-base font-medium">Clause de non-concurrence</label>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Interdit au salarié d'exercer une activité concurrente pendant une période définie après son départ.
            </p>
            
            {data.nonConcurrence.active && (
              <div className="border-t pt-3 mt-3 space-y-3">
                <div className="space-y-1">
                  <label htmlFor="nonConcurrence-duree" className="text-xs font-medium">Durée (en mois) <span className="text-destructive">*</span></label>
                  <input 
                    id="nonConcurrence-duree"
                    type="number"
                    min="1"
                    max="24"
                    className="w-full p-2 border rounded-md text-sm" 
                    value={data.nonConcurrence.duree || 12}
                    onChange={(e) => onChange({ 
                      ...data, 
                      nonConcurrence: { 
                        ...data.nonConcurrence, 
                        duree: parseInt(e.target.value) || 12 
                      } 
                    })}
                  />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="nonConcurrence-zone" className="text-xs font-medium">Zone géographique <span className="text-destructive">*</span></label>
                  <input 
                    id="nonConcurrence-zone"
                    type="text"
                    className="w-full p-2 border rounded-md text-sm" 
                    value={data.nonConcurrence.zone || ""}
                    onChange={(e) => onChange({ 
                      ...data, 
                      nonConcurrence: { 
                        ...data.nonConcurrence, 
                        zone: e.target.value 
                      } 
                    })}
                    placeholder="Ex: France, Île-de-France, rayon de 50 km..."
                  />
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="nonConcurrence-indemnite" className="text-xs font-medium">
                    Indemnité mensuelle (% du salaire) <span className="text-destructive">*</span>
                  </label>
                  <input 
                    id="nonConcurrence-indemnite"
                    type="number"
                    min="25"
                    max="100"
                    className="w-full p-2 border rounded-md text-sm" 
                    value={data.nonConcurrence.indemnite || 30}
                    onChange={(e) => onChange({ 
                      ...data, 
                      nonConcurrence: { 
                        ...data.nonConcurrence, 
                        indemnite: parseInt(e.target.value) || 30 
                      } 
                    })}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className={`bg-muted/30 p-5 rounded-lg border ${data.mobilite.active ? 'border-primary' : ''}`}>
            <div className="flex items-center justify-between space-x-3 mb-3">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox"
                  id="clause-mobilite"
                  checked={data.mobilite.active}
                  onChange={(e) => onChange({ 
                    ...data, 
                    mobilite: { 
                      ...data.mobilite, 
                      active: e.target.checked 
                    } 
                  })}
                  className="h-4 w-4"
                />
                <label htmlFor="clause-mobilite" className="text-base font-medium">Clause de mobilité</label>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Permet à l'employeur de modifier le lieu de travail du salarié dans un périmètre défini.
            </p>
            
            {data.mobilite.active && (
              <div className="border-t pt-3 mt-3 space-y-3">
                <div className="space-y-1">
                  <label htmlFor="mobilite-perimetre" className="text-xs font-medium">Périmètre géographique <span className="text-destructive">*</span></label>
                  <input 
                    id="mobilite-perimetre"
                    type="text"
                    className="w-full p-2 border rounded-md text-sm" 
                    value={data.mobilite.perimetre || ""}
                    onChange={(e) => onChange({ 
                      ...data, 
                      mobilite: { 
                        ...data.mobilite, 
                        perimetre: e.target.value 
                      } 
                    })}
                    placeholder="Ex: Île-de-France, tous les établissements du groupe..."
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-muted/30 p-5 rounded-lg border">
            <div className="flex items-center justify-between space-x-3 mb-4">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox"
                  id="clause-exclusivite"
                  checked={data.exclusivite}
                  onChange={(e) => onChange({ ...data, exclusivite: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="clause-exclusivite" className="text-base font-medium">Clause d'exclusivité</label>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Interdit au salarié d'exercer d'autres activités professionnelles pendant la durée du contrat.
            </p>
          </div>
          
          <div className={`bg-muted/30 p-5 rounded-lg border ${data.teletravail.active ? 'border-primary' : ''}`}>
            <div className="flex items-center justify-between space-x-3 mb-3">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox"
                  id="clause-teletravail"
                  checked={data.teletravail.active}
                  onChange={(e) => onChange({ 
                    ...data, 
                    teletravail: { 
                      ...data.teletravail, 
                      active: e.target.checked 
                    } 
                  })}
                  className="h-4 w-4"
                />
                <label htmlFor="clause-teletravail" className="text-base font-medium">Clause de télétravail</label>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Définit les conditions dans lesquelles le salarié peut travailler à distance.
            </p>
            
            {data.teletravail.active && (
              <div className="border-t pt-3 mt-3 space-y-3">
                <div className="space-y-1">
                  <label htmlFor="teletravail-modalites" className="text-xs font-medium">Modalités de télétravail <span className="text-destructive">*</span></label>
                  <textarea 
                    id="teletravail-modalites"
                    className="w-full p-2 border rounded-md text-sm h-20" 
                    value={data.teletravail.modalites || ""}
                    onChange={(e) => onChange({ 
                      ...data, 
                      teletravail: { 
                        ...data.teletravail, 
                        modalites: e.target.value 
                      } 
                    })}
                    placeholder="Ex: 2 jours par semaine, jours fixes mardi et jeudi, matériel fourni par l'employeur..."
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-muted/30 p-5 rounded-lg border">
            <div className="flex items-center justify-between space-x-3 mb-4">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox"
                  id="clause-proprieteIntellectuelle"
                  checked={data.proprieteIntellectuelle}
                  onChange={(e) => onChange({ ...data, proprieteIntellectuelle: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="clause-proprieteIntellectuelle" className="text-base font-medium">Propriété intellectuelle</label>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Attribue à l'employeur les droits sur les créations réalisées par le salarié dans le cadre de ses fonctions.
            </p>
          </div>
          
          <div className={`bg-muted/30 p-5 rounded-lg border ${data.deditFormation.active ? 'border-primary' : ''}`}>
            <div className="flex items-center justify-between space-x-3 mb-3">
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox"
                  id="clause-deditFormation"
                  checked={data.deditFormation.active}
                  onChange={(e) => onChange({ 
                    ...data, 
                    deditFormation: { 
                      ...data.deditFormation, 
                      active: e.target.checked 
                    } 
                  })}
                  className="h-4 w-4"
                />
                <label htmlFor="clause-deditFormation" className="text-base font-medium">Clause de dédit-formation</label>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Oblige le salarié à rembourser tout ou partie des frais de formation en cas de départ anticipé.
            </p>
            
            {data.deditFormation.active && (
              <div className="border-t pt-3 mt-3 space-y-3">
                <div className="space-y-1">
                  <label htmlFor="deditFormation-conditions" className="text-xs font-medium">Conditions <span className="text-destructive">*</span></label>
                  <textarea 
                    id="deditFormation-conditions"
                    className="w-full p-2 border rounded-md text-sm h-20" 
                    value={data.deditFormation.conditions || ""}
                    onChange={(e) => onChange({ 
                      ...data, 
                      deditFormation: { 
                        ...data.deditFormation, 
                        conditions: e.target.value 
                      } 
                    })}
                    placeholder="Ex: Pour toute formation d'un coût supérieur à 3000€, remboursement dégressif sur 3 ans..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  const RecapitulatifStep = ({ data, onGenerate }) => {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mb-6">
          <div className="flex items-start space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-0.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
            <div>
              <h3 className="text-base font-medium">Récapitulatif du contrat de travail</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Vérifiez les informations saisies avant de générer le contrat. 
                Pour modifier une section, utilisez les onglets de navigation ou les boutons "Précédent".
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 p-5 rounded-lg border">
            <h3 className="font-medium text-sm border-b pb-2 mb-3 flex items-center">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2">1</span>
              Informations générales
            </h3>
            
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Type de contrat</dt>
                <dd>{
                  data.contrat.type === "CDI_temps_plein" ? "CDI à temps plein" :
                  data.contrat.type === "CDI_temps_partiel" ? "CDI à temps partiel" :
                  data.contrat.type === "CDD_temps_plein" ? "CDD à temps plein" :
                  data.contrat.type === "CDD_temps_partiel" ? "CDD à temps partiel" : 
                  data.contrat.type
                }</dd>
              </div>
              
              {(data.contrat.type === "CDD_temps_plein" || data.contrat.type === "CDD_temps_partiel") && (
                <div>
                  <dt className="text-xs text-muted-foreground">Motif du CDD</dt>
                  <dd>{data.contrat.motifCDD || "-"}</dd>
                </div>
              )}
              
              <div>
                <dt className="text-xs text-muted-foreground">Poste</dt>
                <dd>{data.contrat.intitulePoste || "-"}</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Qualification</dt>
                <dd>{data.contrat.qualification || "-"}</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Début du contrat</dt>
                <dd>{data.contrat.dateDebut || "-"}</dd>
              </div>
              
              {(data.contrat.type === "CDD_temps_plein" || data.contrat.type === "CDD_temps_partiel") && (
                <div>
                  <dt className="text-xs text-muted-foreground">Fin du contrat</dt>
                  <dd>{data.contrat.dateFin || "-"}</dd>
                </div>
              )}
              
              <div>
                <dt className="text-xs text-muted-foreground">Lieu de travail</dt>
                <dd>{data.contrat.lieuTravail || "-"}</dd>
              </div>
            </dl>
          </div>
          
          <div className="bg-muted/30 p-5 rounded-lg border">
            <h3 className="font-medium text-sm border-b pb-2 mb-3 flex items-center">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2">2</span>
              Employeur
            </h3>
            
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Entreprise</dt>
                <dd>{data.employeur.raisonSociale || "-"}</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Forme juridique</dt>
                <dd>{data.employeur.formeJuridique || "-"}</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Représentant</dt>
                <dd>{data.employeur.representant || "-"}</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Fonction</dt>
                <dd>{data.employeur.fonction || "-"}</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Adresse</dt>
                <dd>{data.employeur.adresse ? `${data.employeur.adresse}, ${data.employeur.codePostal} ${data.employeur.ville}` : "-"}</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Convention collective</dt>
                <dd>{data.employeur.conventionCollective || "-"}</dd>
              </div>
            </dl>
          </div>
          
          <div className="bg-muted/30 p-5 rounded-lg border">
            <h3 className="font-medium text-sm border-b pb-2 mb-3 flex items-center">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2">3</span>
              Salarié
            </h3>
            
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Nom complet</dt>
                <dd>{`${data.salarie.civilite} ${data.salarie.prenom} ${data.salarie.nom}`.trim() || "-"}</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Date de naissance</dt>
                <dd>{data.salarie.dateNaissance || "-"}</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Lieu de naissance</dt>
                <dd>{data.salarie.lieuNaissance || "-"}</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Adresse</dt>
                <dd>{data.salarie.adresse ? `${data.salarie.adresse}, ${data.salarie.codePostal} ${data.salarie.ville}` : "-"}</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Numéro de sécurité sociale</dt>
                <dd>{data.salarie.numeroSecuriteSociale || "-"}</dd>
              </div>
            </dl>
          </div>
          
          <div className="bg-muted/30 p-5 rounded-lg border">
            <h3 className="font-medium text-sm border-b pb-2 mb-3 flex items-center">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2">4</span>
              Période d'essai et temps de travail
            </h3>
            
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Période d'essai</dt>
                <dd>{data.periodeEssai.active 
                  ? `${data.periodeEssai.duree} ${data.periodeEssai.unite}${data.periodeEssai.renouvelable ? ', renouvelable' : ''}` 
                  : "Non prévue"}</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Durée hebdomadaire</dt>
                <dd>{data.travail.dureeHebdo} heures</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Jours travaillés</dt>
                <dd>{data.travail.joursTravailes.length > 0 
                  ? data.travail.joursTravailes.map(j => j.charAt(0).toUpperCase() + j.slice(1)).join(', ') 
                  : "-"}</dd>
              </div>
              
              {(data.contrat.type === "CDI_temps_partiel" || data.contrat.type === "CDD_temps_partiel") && (
                <div>
                  <dt className="text-xs text-muted-foreground">Heures complémentaires max</dt>
                  <dd>{data.travail.heuresComplementaires}% de la durée contractuelle</dd>
                </div>
              )}
            </dl>
          </div>
          
          <div className="bg-muted/30 p-5 rounded-lg border">
            <h3 className="font-medium text-sm border-b pb-2 mb-3 flex items-center">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2">5</span>
              Rémunération
            </h3>
            
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Taux horaire brut</dt>
                <dd>{data.remuneration.tauxHoraire.toFixed(2)} €</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Salaire mensuel brut</dt>
                <dd>{data.remuneration.salaireBrutMensuel.toFixed(2)} €</dd>
              </div>
              
              <div>
                <dt className="text-xs text-muted-foreground">Salaire mensuel net estimé</dt>
                <dd>{data.remuneration.salaireNetMensuel.toFixed(2)} €</dd>
              </div>
              
              {data.remuneration.primes.length > 0 && (
                <div>
                  <dt className="text-xs text-muted-foreground">Primes</dt>
                  <dd>
                    <ul className="list-disc pl-4 text-xs">
                      {data.remuneration.primes.map((prime, index) => (
                        <li key={index}>{prime.nom} : {prime.montant} € ({prime.frequence})</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              
              {data.remuneration.avantagesNature.length > 0 && (
                <div>
                  <dt className="text-xs text-muted-foreground">Avantages en nature</dt>
                  <dd>
                    <ul className="list-disc pl-4 text-xs">
                      {data.remuneration.avantagesNature.map((avantage, index) => (
                        <li key={index}>{avantage.nom}{avantage.valeur ? ` (${avantage.valeur} €)` : ''}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </div>
          
          <div className="bg-muted/30 p-5 rounded-lg border">
            <h3 className="font-medium text-sm border-b pb-2 mb-3 flex items-center">
              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-2">6</span>
              Clauses optionnelles
            </h3>
            
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Clauses incluses</dt>
                <dd>
                  <ul className="list-disc pl-4 text-xs">
                    {data.confidentialite && <li>Clause de confidentialité</li>}
                    {data.nonConcurrence.active && <li>Clause de non-concurrence ({data.nonConcurrence.duree} mois, {data.nonConcurrence.indemnite}%)</li>}
                    {data.mobilite.active && <li>Clause de mobilité</li>}
                    {data.exclusivite && <li>Clause d'exclusivité</li>}
                    {data.teletravail.active && <li>Clause de télétravail</li>}
                    {data.proprieteIntellectuelle && <li>Clause de propriété intellectuelle</li>}
                    {data.deditFormation.active && <li>Clause de dédit-formation</li>}
                    {!data.confidentialite && !data.nonConcurrence.active && !data.mobilite.active && !data.exclusivite && !data.teletravail.active && !data.proprieteIntellectuelle && !data.deditFormation.active && <li>Aucune clause optionnelle</li>}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div className="p-5 bg-muted/30 rounded-lg border mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Informations de signature</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="dateSignature" className="text-sm font-medium">Date de signature</label>
              <input 
                id="dateSignature"
                type="date"
                className="w-full p-2 border rounded-md text-sm" 
                value={data.generation.dateSignature}
                onChange={(e) => onChange({ 
                  ...data, 
                  generation: { 
                    ...data.generation, 
                    dateSignature: e.target.value 
                  } 
                })}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="lieuSignature" className="text-sm font-medium">Lieu de signature</label>
              <input 
                id="lieuSignature"
                type="text"
                className="w-full p-2 border rounded-md text-sm" 
                value={data.generation.lieuSignature || ""}
                onChange={(e) => onChange({ 
                  ...data, 
                  generation: { 
                    ...data.generation, 
                    lieuSignature: e.target.value 
                  } 
                })}
                placeholder="Ex: Paris"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-center pt-6">
          <Button 
            onClick={onGenerate} 
            className="py-6 px-8 text-base rounded-md flex items-center space-x-2 bg-primary hover:bg-primary/90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span className="ml-2">Générer le contrat de travail</span>
          </Button>
        </div>
      </div>
    );
  };

  const ContractPreview = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 h-full overflow-auto">
        <h3 className="text-lg font-medium border-b pb-3 mb-5">Aperçu du contrat</h3>
        {contractData.employeur.raisonSociale && contractData.salarie.nom ? (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold uppercase mb-2">CONTRAT DE TRAVAIL</h1>
              <p className="text-muted-foreground">
                {contractData.contrat.type === "CDI_temps_plein" && "Contrat à durée indéterminée à temps plein"}
                {contractData.contrat.type === "CDI_temps_partiel" && "Contrat à durée indéterminée à temps partiel"}
                {contractData.contrat.type === "CDD_temps_plein" && "Contrat à durée déterminée à temps plein"}
                {contractData.contrat.type === "CDD_temps_partiel" && "Contrat à durée déterminée à temps partiel"}
              </p>
            </div>
            
            <div className="space-y-5">
              <h2 className="font-semibold text-lg">ENTRE LES SOUSSIGNÉS :</h2>
              
              <div className="pl-4 space-y-1">
                <p><span className="font-medium">{contractData.employeur.raisonSociale}</span>, {contractData.employeur.formeJuridique}</p>
                <p>Immatriculée au RCS sous le numéro SIRET {contractData.employeur.siret}</p>
                <p>Dont le siège social est situé {contractData.employeur.adresse}, {contractData.employeur.codePostal} {contractData.employeur.ville}</p>
                <p>Représentée par {contractData.employeur.representant} en qualité de {contractData.employeur.fonction}</p>
                <p className="font-medium mt-2">Ci-après désignée "l'employeur"</p>
              </div>
              
              <div className="pl-4 space-y-1">
                <p>ET</p>
                <p className="mt-2"><span className="font-medium">{contractData.salarie.civilite} {contractData.salarie.prenom} {contractData.salarie.nom}</span></p>
                <p>Né(e) le {contractData.salarie.dateNaissance} à {contractData.salarie.lieuNaissance}</p>
                <p>Demeurant {contractData.salarie.adresse}, {contractData.salarie.codePostal} {contractData.salarie.ville}</p>
                <p>De nationalité {contractData.salarie.nationalite}</p>
                <p>Numéro de sécurité sociale : {contractData.salarie.numeroSecuriteSociale}</p>
                <p className="font-medium mt-2">Ci-après désigné(e) "le salarié"</p>
              </div>
            </div>
            
            {contractData.contrat.intitulePoste && (
              <div className="space-y-5 mt-8">
                <h2 className="font-semibold text-lg">ARTICLE 1 - ENGAGEMENT ET QUALIFICATION</h2>
                <p className="pl-4">Le salarié est engagé en qualité de <span className="font-medium">{contractData.contrat.intitulePoste}</span>, statut {contractData.contrat.qualification}.</p>
              </div>
            )}
            
            {/* Plus d'articles selon les données du contrat */}
            <div className="text-center text-muted-foreground italic mt-8">
              <p>Aperçu du contrat - les détails seront complétés au fur et à mesure de votre progression</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-20"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
            <p className="text-center max-w-xs">Sélectionnez une entreprise et un employé pour visualiser l'aperçu du contrat</p>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement des données en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-[1600px] mx-auto">
      {/* En-tête et navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Link href="/dashboard/documents" className="inline-flex items-center text-sm text-muted-foreground mb-2 hover:text-primary transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour à document
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Créer un nouveau contrat</h1>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={goToPreviousStep}
            disabled={currentStep === WIZARD_STEPS[0].id}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={saveAsDraft}
            disabled={isSaving || !saveButtonEnabled}
            className="h-10 w-10 relative"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/contracts")}
            className="h-10 w-10 text-destructive hover:text-destructive"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className=""><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={currentStep === WIZARD_STEPS[WIZARD_STEPS.length - 1].id ? generateContract : goToNextStep}
            disabled={isSaving}
            className="h-10 w-10"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Barre de progression unifiée */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-primary">{WIZARD_STEPS.findIndex(step => step.id === currentStep) + 1}</span>
            <span className="text-sm text-muted-foreground mx-1.5">/</span>
            <span className="text-sm text-muted-foreground">{WIZARD_STEPS.length}</span>
            <span className="text-sm font-medium ml-3">{WIZARD_STEPS.find(step => step.id === currentStep)?.title}</span>
          </div>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% complété</span>
        </div>
        <Progress value={progress} className="h-2 mb-4" />
      </div>
      
      {/* Nouvelle mise en page: formulaire à gauche et aperçu à droite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulaire interactif */}
        <div className="lg:col-span-5 xl:col-span-5">
          <div className="bg-blue-50 dark:bg-slate-800/30 rounded-lg p-5 h-full">
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-0 space-y-6">
                {renderStepContent()}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Aperçu du contrat (grande taille) */}
        <div className="lg:col-span-7 xl:col-span-7">
          <ContractPreview />
        </div>
      </div>
    </div>
  );
} 