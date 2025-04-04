"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save,
  Check,
  ChevronsLeft,
  AlertTriangle,
  Trash
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  PageContainer, 
  PageHeader, 
  LoadingState
} from "@/components/shared/PageContainer";
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  companyId: string;
  company: string;
  startDate: string;
  position: string;
  baseSalary: number;
}

interface Company {
  id: string;
  name: string;
}

interface ContractDocument {
  id: string;
  type: string;
  title: string;
  date: Date;
  employeeName: string;
  companyName: string;
  status: string;
  contractConfig: {
    employeeId: string;
    companyId: string;
    type: string;
    startDate: string;
    endDate: string | null;
    baseSalary: number;
    isFullTime: boolean;
    monthlyHours: number;
    heuresHebdo?: number;
    periodeEssai?: string;
    motifCDD?: string;
  };
  lastStep?: number;
}

export default function EditContractPage({ params }: { params: { id: string } }) {
  const resolvedParams = React.use(params as any);
  const contractId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contract, setContract] = useState<ContractDocument | null>(null);
  const [notFound, setNotFound] = useState(false);
  
  // États pour le formulaire de création de contrat
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [contractType, setContractType] = useState<string>("CDI");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>("");
  const [baseSalary, setBaseSalary] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  
  // Calculer le progrès en pourcentage
  const totalSteps = 2;
  const progress = (currentStep / totalSteps) * 100;
  
  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.uid) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const userId = user.uid;
        const companiesList: Company[] = [];
        const employeesList: Employee[] = [];
        
        // 1. Charger le contrat depuis Firestore
        try {
          const contractRef = doc(db, `users/${userId}/documents`, contractId);
          const contractSnap = await getDoc(contractRef);
          
          if (contractSnap.exists()) {
            const contractData = contractSnap.data() as ContractDocument;
            setContract(contractData);
            
            // Initialiser les champs du formulaire
            setSelectedCompany(contractData.contractConfig?.companyId || "");
            setSelectedEmployee(contractData.contractConfig?.employeeId || "");
            setContractType(contractData.contractConfig?.type || "CDI");
            setStartDate(contractData.contractConfig?.startDate || new Date().toISOString().split('T')[0]);
            setEndDate(contractData.contractConfig?.endDate || "");
            setBaseSalary(contractData.contractConfig?.baseSalary?.toString() || "");
            setCurrentStep(contractData.lastStep || 1);
          } else {
            setNotFound(true);
            toast({
              title: "Contrat introuvable",
              description: "Le contrat que vous essayez de modifier n'existe pas.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Erreur lors du chargement du contrat:", error);
          setNotFound(true);
        }
        
        // 2. Charger les entreprises depuis Firestore
        try {
          const companiesRef = collection(db, `users/${userId}/companies`);
          const companiesSnapshot = await getDocs(companiesRef);
          
          companiesSnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.isArchived) {
              companiesList.push({
                id: doc.id,
                name: data.name || 'Entreprise sans nom'
              });
            }
          });
          
          setCompanies(companiesList);
        } catch (error) {
          console.error("Erreur lors de la récupération des entreprises:", error);
        }
        
        // 3. Charger les employés depuis Firestore
        try {
          const employeesRef = collection(db, `users/${userId}/employees`);
          const employeesSnapshot = await getDocs(employeesRef);
          
          employeesSnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.isArchived) {
              const company = companiesList.find(c => c.id === data.companyId);
              employeesList.push({
                id: doc.id,
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                companyId: data.companyId || '',
                company: company ? company.name : 'Entreprise inconnue',
                startDate: data.startDate || data.hiringDate || '',
                position: data.position || '',
                baseSalary: Number(data.baseSalary || 0)
              });
            }
          });
          
          setEmployees(employeesList);
        } catch (error) {
          console.error("Erreur lors de la récupération des employés:", error);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les données. Veuillez réessayer."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast, user, contractId]);
  
  // Fonction pour supprimer le contrat
  const handleDeleteContract = async () => {
    if (!user || !user.uid) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour supprimer ce contrat.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Supprimer le document dans Firestore
      const docRef = doc(db, `users/${user.uid}/documents`, contractId);
      await deleteDoc(docRef);
      
      toast({
        title: "Contrat supprimé",
        description: "Le contrat a été supprimé avec succès.",
      });
      
      // Rediriger vers la page des documents
      router.push("/dashboard/documents");
    } catch (error) {
      console.error("Erreur lors de la suppression du contrat:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du contrat.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      setDeleteDialogOpen(false);
    }
  };
  
  // Fonction pour passer à l'étape suivante
  const goToNextStep = () => {
    if (currentStep === 1) {
      if (!selectedCompany || !selectedEmployee) {
        toast({
          title: "Sélection incomplète",
          description: "Veuillez sélectionner une entreprise et un employé.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      saveAsDraft(currentStep + 1);  // Sauvegarde automatique lors du passage à l'étape suivante
    } else {
      // Soumettre le formulaire complet
      handleContractSubmit(true);
    }
  };
  
  // Fonction pour revenir à l'étape précédente
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Fonction pour sauvegarder le formulaire comme brouillon
  const saveAsDraft = (nextStep?: number) => {
    handleContractSubmit(false, nextStep);
  };
  
  // Fonction pour soumettre le formulaire de contrat
  const handleContractSubmit = async (isComplete: boolean, nextStep?: number) => {
    if (!user || !user.uid || !contract) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour modifier ce contrat.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const employee = employees.find(e => e.id === selectedEmployee);
      const company = companies.find(c => c.id === selectedCompany);
      
      if (!employee || !company) {
        throw new Error("Employé ou entreprise introuvable");
      }
      
      // Vérifier les champs requis pour la finalisation
      if (isComplete && currentStep === 2 && (
        !startDate ||
        (contractType !== "CDI" && !endDate) ||
        !baseSalary
      )) {
        toast({
          title: "Formulaire incomplet",
          description: "Veuillez remplir tous les champs obligatoires.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      // Préparer les données du contrat
      const contractData = {
        id: contract.id,
        type: 'contrat',
        title: `Contrat de travail - ${employee.firstName} ${employee.lastName}`,
        updatedAt: Timestamp.now(),
        employeeName: `${employee.firstName} ${employee.lastName}`,
        companyName: company.name,
        status: isComplete ? 'generated' : 'draft',
        contractConfig: {
          employeeId: selectedEmployee,
          companyId: selectedCompany,
          type: contractType,
          startDate: startDate,
          endDate: endDate || null,
          isFullTime: true,
          monthlyHours: 151.67,
          baseSalary: parseFloat(baseSalary) || 0
        },
        lastStep: nextStep || currentStep
      };
      
      // Mettre à jour dans Firestore
      const docRef = doc(db, `users/${user.uid}/documents`, contractId);
      await updateDoc(docRef, contractData);
      
      toast({
        title: isComplete ? "Contrat finalisé" : "Brouillon enregistré",
        description: isComplete 
          ? "Le contrat a été finalisé avec succès."
          : "Le brouillon a été enregistré avec succès.",
      });
      
      // Rediriger vers la page des documents si le contrat est finalisé
      if (isComplete) {
        router.push("/dashboard/documents");
      }
    } catch (error) {
      console.error("Erreur lors de la modification du contrat:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du contrat.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader 
          title="Modification de contrat" 
          description="Chargement des données du contrat..."
        />
        <LoadingState message="Chargement des données..." />
      </PageContainer>
    );
  }
  
  if (notFound) {
    return (
      <PageContainer>
        <PageHeader 
          title="Contrat introuvable" 
          description="Le contrat que vous essayez de modifier n'existe pas."
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Contrat introuvable
            </CardTitle>
            <CardDescription>
              Le contrat que vous essayez de modifier n'existe pas ou a été supprimé.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/documents")}>
              Retourner à la liste des documents
            </Button>
          </CardFooter>
        </Card>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <div className="mb-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <a href="/dashboard" className="hover:text-foreground transition-colors">Tableau de bord</a>
          <span>/</span>
          <a href="/dashboard/documents" className="hover:text-foreground transition-colors">Documents</a>
          <span>/</span>
          <a href="/dashboard/documents/contracts" className="hover:text-foreground transition-colors">Contrats</a>
          <span>/</span>
          <span>Modification</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <PageHeader 
          title="Modification de contrat" 
          description={
            currentStep === 1 
              ? "Modifiez l'entreprise et l'employé du contrat" 
              : "Modifiez les détails du contrat"
          }
          className="p-0 mb-0"
        />
        <div className="flex items-center gap-2">
          <Button 
            variant="destructive" 
            onClick={() => setDeleteDialogOpen(true)}
            className="h-8"
            size="sm"
          >
            <Trash className="h-3.5 w-3.5 mr-1" />
            Supprimer
          </Button>
          <Button 
            variant="outline" 
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            className="h-8"
            size="sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Précédent
          </Button>
          <Button 
            variant="outline" 
            onClick={() => saveAsDraft()}
            disabled={isSaving}
            className="h-8"
            size="sm"
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            Enregistrer
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard/documents")}
            className="h-8"
            size="sm"
          >
            <ChevronsLeft className="h-3.5 w-3.5 mr-1" />
            Retour
          </Button>
        </div>
      </div>
      
      {/* Barre de progression */}
      <div className="mb-4">
        <div className="space-y-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">
              Étape {currentStep} sur {totalSteps}
            </span>
            <span className="text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        <div className="flex justify-between mt-1.5">
          <div className="flex items-center">
            <Badge variant={currentStep >= 1 ? "default" : "outline"} className="h-5 px-1.5 text-[10px] mr-2">1</Badge>
            <span className={cn("text-xs", currentStep >= 1 ? "font-medium" : "text-muted-foreground")}>Entités</span>
          </div>
          <div className="flex items-center">
            <Badge variant={currentStep >= 2 ? "default" : "outline"} className="h-5 px-1.5 text-[10px] mr-2">2</Badge>
            <span className={cn("text-xs", currentStep >= 2 ? "font-medium" : "text-muted-foreground")}>Détails</span>
          </div>
        </div>
      </div>
      
      <Card className="mb-6 shadow-sm border-gray-200">
        <CardHeader className="px-5 py-4">
          <CardTitle className="text-base">
            {currentStep === 1 ? "Sélection des entités" : "Détails du contrat"}
          </CardTitle>
          <CardDescription className="text-xs">
            {currentStep === 1 
              ? "Modifiez l'entreprise et l'employé pour le contrat" 
              : "Modifiez les paramètres du contrat"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-5 pt-0 pb-4">
          {/* Étape 1: Sélection de l'entreprise et de l'employé */}
          {currentStep === 1 && (
            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-sm">Entreprise</Label>
                <Select
                  value={selectedCompany}
                  onValueChange={(value) => {
                    setSelectedCompany(value);
                    setSelectedEmployee("");
                  }}
                >
                  <SelectTrigger id="company" className="h-9">
                    <SelectValue placeholder="Sélectionner une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCompany && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Entreprise sélectionnée : {companies.find(c => c.id === selectedCompany)?.name}
                  </p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="employee" className="text-sm">Employé</Label>
                <Select
                  value={selectedEmployee}
                  onValueChange={setSelectedEmployee}
                  disabled={!selectedCompany}
                >
                  <SelectTrigger id="employee" className="h-9">
                    <SelectValue placeholder={selectedCompany ? "Sélectionner un employé" : "Sélectionnez d'abord une entreprise"} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(emp => emp.companyId === selectedCompany)
                      .map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedCompany && employees.filter(emp => emp.companyId === selectedCompany).length === 0 ? (
                  <p className="text-[11px] text-amber-600 mt-0.5">
                    Aucun employé trouvé pour cette entreprise.
                  </p>
                ) : selectedEmployee && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {(() => {
                      const emp = employees.find(e => e.id === selectedEmployee);
                      return emp ? `Poste : ${emp.position || 'Non spécifié'}` : "";
                    })()}
                  </p>
                )}
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="contract-type" className="text-sm">Type de contrat</Label>
                <Select
                  value={contractType}
                  onValueChange={setContractType}
                >
                  <SelectTrigger id="contract-type" className="h-9">
                    <SelectValue placeholder="Sélectionner un type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI (Contrat à Durée Indéterminée)</SelectItem>
                    <SelectItem value="CDD">CDD (Contrat à Durée Déterminée)</SelectItem>
                  </SelectContent>
                </Select>
                {contractType && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {contractType === "CDI" 
                      ? "Le CDI est un contrat sans limitation de durée."
                      : "Le CDD est un contrat avec une date de fin définie."}
                  </p>
                )}
              </div>
              
              {contract && (
                <div className="mt-1 p-2 bg-blue-50 rounded-md border border-blue-100">
                  <p className="text-[11px] text-blue-600">
                    Brouillon en cours d&apos;édition - dernière modification: {new Date(contract.updatedAt?.toDate?.() || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Étape 2: Détails du contrat */}
          {currentStep === 2 && (
            <div className="grid gap-3">
              {/* Sélection du type de contrat */}
              <div className="space-y-1.5">
                <Label htmlFor="contract-type" className="text-sm">Type de contrat</Label>
                <Select
                  value={contractType}
                  onValueChange={setContractType}
                >
                  <SelectTrigger id="contract-type" className="h-9">
                    <SelectValue placeholder="Sélectionner un type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI (Contrat à Durée Indéterminée)</SelectItem>
                    <SelectItem value="CDD">CDD (Contrat à Durée Déterminée)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator className="my-1" />
              
              {/* Champs communs */}
              <div className="space-y-1.5">
                <Label htmlFor="start-date" className="text-sm">Date de début du contrat</Label>
                <Input 
                  id="start-date" 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9"
                />
              </div>
              
              {/* Champs spécifiques au CDD */}
              {contractType === "CDD" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="end-date" className="text-sm">Date de fin du contrat <span className="text-red-500">*</span></Label>
                    <Input 
                      id="end-date" 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-9"
                    />
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Obligatoire pour un CDD
                    </p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="motif-cdd" className="text-sm">Motif du CDD</Label>
                    <Select
                      value={contract?.contractConfig?.motifCDD || ""}
                      onValueChange={(value) => {
                        if (contract) {
                          setContract({
                            ...contract,
                            contractConfig: {
                              ...contract.contractConfig,
                              motifCDD: value
                            }
                          });
                        }
                      }}
                    >
                      <SelectTrigger id="motif-cdd" className="h-9">
                        <SelectValue placeholder="Sélectionner un motif" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remplacement">Remplacement d&apos;un salarié</SelectItem>
                        <SelectItem value="accroissement">Accroissement temporaire d&apos;activité</SelectItem>
                        <SelectItem value="saisonnier">Emploi saisonnier</SelectItem>
                        <SelectItem value="usage">CDD d&apos;usage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              {/* Champs spécifiques au CDI */}
              {contractType === "CDI" && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="periode-essai" className="text-sm">Période d&apos;essai</Label>
                    <Select
                      value={contract?.contractConfig?.periodeEssai || ""}
                      onValueChange={(value) => {
                        if (contract) {
                          setContract({
                            ...contract,
                            contractConfig: {
                              ...contract.contractConfig,
                              periodeEssai: value
                            }
                          });
                        }
                      }}
                    >
                      <SelectTrigger id="periode-essai" className="h-9">
                        <SelectValue placeholder="Sélectionner une période" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 mois</SelectItem>
                        <SelectItem value="2">2 mois</SelectItem>
                        <SelectItem value="3">3 mois</SelectItem>
                        <SelectItem value="4">4 mois</SelectItem>
                        <SelectItem value="0">Pas de période d&apos;essai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <Separator className="my-1" />
              
              {/* Rémunération */}
              <h3 className="font-medium text-sm mt-1">Rémunération</h3>
              
              <div className="space-y-1.5">
                <Label htmlFor="base-salary" className="text-sm">Salaire mensuel brut (€)</Label>
                <Input 
                  id="base-salary" 
                  type="number" 
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  placeholder="Ex: 2500"
                  className="h-9"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="working-hours" className="text-sm">Temps de travail</Label>
                <Select
                  value={contract?.contractConfig?.isFullTime ? "full" : "partial"}
                  onValueChange={(value) => {
                    if (contract) {
                      setContract({
                        ...contract,
                        contractConfig: {
                          ...contract.contractConfig,
                          isFullTime: value === "full"
                        }
                      });
                    }
                  }}
                >
                  <SelectTrigger id="working-hours" className="h-9">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Temps plein</SelectItem>
                    <SelectItem value="partial">Temps partiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {contract?.contractConfig?.isFullTime === false && (
                <div className="space-y-1.5">
                  <Label htmlFor="partial-hours" className="text-sm">Heures hebdomadaires</Label>
                  <Input 
                    id="partial-hours" 
                    type="number" 
                    value={contract?.contractConfig?.heuresHebdo || ""}
                    onChange={(e) => {
                      if (contract) {
                        setContract({
                          ...contract,
                          contractConfig: {
                            ...contract.contractConfig,
                            heuresHebdo: e.target.value
                          }
                        });
                      }
                    }}
                    placeholder="Ex: 24"
                    className="h-9"
                  />
                </div>
              )}
              
              {/* Résumé des données de l'étape 1 */}
              <div className="mt-1">
                <Separator className="my-2" />
                <h4 className="text-sm font-medium mb-2">Récapitulatif</h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">Entreprise:</div>
                  <div className="text-sm">{companies.find(c => c.id === selectedCompany)?.name}</div>
                  
                  <div className="text-muted-foreground">Employé:</div>
                  <div className="text-sm">
                    {(() => {
                      const emp = employees.find(e => e.id === selectedEmployee);
                      return emp ? `${emp.firstName} ${emp.lastName}` : "";
                    })()}
                  </div>
                </div>
                
                <div className="mt-2 bg-amber-50 p-2 rounded-md border border-amber-100">
                  <p className="text-[11px] text-amber-600">
                    Pensez à enregistrer régulièrement vos modifications.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end px-5 py-3 border-t">
          <Button 
            onClick={goToNextStep}
            disabled={
              isSaving ||
              (currentStep === 1 && (!selectedCompany || !selectedEmployee)) ||
              (currentStep === 2 && (
                !startDate ||
                (contractType !== "CDI" && !endDate) ||
                !baseSalary
              ))
            }
            size="sm"
            className="h-8"
          >
            {currentStep < totalSteps ? (
              <>
                Suivant
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </>
            ) : (
              <>
                {isSaving ? (
                  <span className="flex items-center">
                    <span className="h-3 w-3 border-2 border-current border-t-transparent animate-spin rounded-full mr-1"></span>
                    Finalisation...
                  </span>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Finaliser
                  </>
                )}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Boîte de dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce contrat ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteContract}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center">
                  <span className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2"></span>
                  Suppression...
                </span>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
} 