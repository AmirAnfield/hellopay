"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Calculator, History } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  PageContainer, 
  PageHeader, 
  LoadingState 
} from "@/components/shared/PageContainer";
import PayslipPreview from "@/components/PayslipPreview";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position?: string;
  companyId?: string;
}

interface Company {
  id: string;
  name: string;
}

interface PayslipCalculationResult {
  grossSalary: number;
  netSalary: number;
  employerCost: number;
  taxAmount: number;
  totalEmployeeContributions: number;
  totalEmployerContributions: number;
  contributions: Array<{
    category: string;
    label: string;
    baseType: string;
    baseAmount: number;
    employerRate: number;
    employeeRate: number;
    employerAmount: number;
    employeeAmount: number;
  }>;
}

export default function GeneratePayslipPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [calculationResult, setCalculationResult] = useState<PayslipCalculationResult | null>(null);
  
  // Récupérer la liste des entreprises et employés
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Appels API pour récupérer les données
        const companiesRes = await fetch('/api/companies');
        if (companiesRes.ok) {
          const companiesData = await companiesRes.json();
          // S'assurer que companies est un tableau
          setCompanies(Array.isArray(companiesData) ? companiesData : 
                      (companiesData.companies ? companiesData.companies : []));
        }
        
        if (selectedCompany) {
          const employeesRes = await fetch(`/api/employees?companyId=${selectedCompany}`);
          if (employeesRes.ok) {
            const employeesData = await employeesRes.json();
            // S'assurer que employees est un tableau
            setEmployees(Array.isArray(employeesData) ? employeesData : 
                       (employeesData.employees ? employeesData.employees : []));
          }
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
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
  }, [selectedCompany, toast]);
  
  // Calculer le bulletin
  const handleCalculate = async () => {
    if (!selectedEmployee || !selectedPeriod) {
      toast({
        variant: "destructive", 
        title: "Données manquantes", 
        description: "Veuillez sélectionner un employé et une période"
      });
      return;
    }
    
    setIsCalculating(true);
    try {
      const res = await fetch('/api/payslips/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          period: selectedPeriod
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors du calcul");
      }
      
      const data = await res.json();
      setCalculationResult(data);
      setActiveTab("preview");
    } catch (error) {
      console.error("Erreur lors du calcul:", error);
      toast({
        variant: "destructive",
        title: "Erreur de calcul",
        description: error instanceof Error ? error.message : "Impossible de calculer le bulletin. Veuillez réessayer."
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  // Gérer la sauvegarde du bulletin
  const handleSaveSuccess = (data: { payslipId?: string; pdfUrl?: string }) => {
    toast({
      title: "Bulletin généré",
      description: "Le bulletin de paie a été généré et sauvegardé avec succès"
    });
    
    // Rediriger vers la page du bulletin
    if (data.payslipId) {
      router.push(`/dashboard/payslips/${data.payslipId}`);
    }
  };
  
  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Générer un bulletin"
          description="Créez un nouveau bulletin de paie pour un employé"
        />
        <LoadingState message="Chargement des données..." />
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <PageHeader
        title="Générer un bulletin"
        description="Créez un nouveau bulletin de paie pour un employé"
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="mb-6 flex w-full flex-wrap overflow-x-auto md:flex-nowrap">
          <TabsTrigger value="details" className="flex-1 min-w-[130px]">
            <FileText className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">Informations</span>
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            disabled={!calculationResult}
            className="flex-1 min-w-[130px]"
          >
            <Calculator className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">Aperçu</span>
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex-1 min-w-[130px]"
          >
            <History className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">Historique</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* Formulaire */}
            <Card className="md:col-span-8">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle>Informations du bulletin</CardTitle>
                <CardDescription>Sélectionnez l'entreprise, l'employé et la période</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 px-4 sm:px-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company">Entreprise</Label>
                    <Select 
                      value={selectedCompany} 
                      onValueChange={setSelectedCompany}
                    >
                      <SelectTrigger id="company" className="w-full">
                        <SelectValue placeholder="Sélectionner une entreprise" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(companies) && companies.length > 0 ? 
                          companies.map(company => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          )) : 
                          <SelectItem value="no-companies" disabled>Aucune entreprise disponible</SelectItem>
                        }
                      </SelectContent>
                    </Select>
                    {(!Array.isArray(companies) || companies.length === 0) && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Aucune entreprise disponible. Veuillez d&apos;abord créer une entreprise.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="employee">Employé</Label>
                    <Select 
                      value={selectedEmployee} 
                      onValueChange={setSelectedEmployee}
                      disabled={!selectedCompany || !Array.isArray(employees) || employees.length === 0}
                    >
                      <SelectTrigger id="employee" className="w-full">
                        <SelectValue placeholder="Sélectionner un employé" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(employees) && employees.length > 0 ? 
                          employees.map(employee => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.firstName} {employee.lastName}
                            </SelectItem>
                          )) :
                          <SelectItem value="no-employees" disabled>Aucun employé disponible</SelectItem>
                        }
                      </SelectContent>
                    </Select>
                    {selectedCompany && (!Array.isArray(employees) || employees.length === 0) && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Aucun employé disponible pour cette entreprise. Veuillez d&apos;abord ajouter un employé.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="period">Période</Label>
                    <Select
                      value={selectedPeriod}
                      onValueChange={setSelectedPeriod}
                    >
                      <SelectTrigger id="period" className="w-full">
                        <SelectValue placeholder="Sélectionner une période" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const date = new Date();
                          date.setMonth(date.getMonth() - i);
                          const value = format(date, "yyyy-MM-dd");
                          const label = format(date, "MMMM yyyy", { locale: fr });
                          return (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-4">
                    <Switch
                      id="auto-generate"
                      checked={autoGenerate}
                      onCheckedChange={setAutoGenerate}
                    />
                    <Label htmlFor="auto-generate">
                      Générer automatiquement le PDF après calcul
                    </Label>
                  </div>
                </div>
                
                <Separator />
                
                <Button 
                  onClick={handleCalculate} 
                  disabled={!selectedEmployee || !selectedPeriod || isCalculating}
                  className="w-full sm:w-auto"
                >
                  {isCalculating ? "Calcul en cours..." : "Calculer le bulletin"}
                </Button>
              </CardContent>
            </Card>
            
            {/* Aide et informations */}
            <Card className="md:col-span-4">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle>Aide</CardTitle>
                <CardDescription>Informations sur la génération de bulletins</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="text-sm space-y-4">
                  <p>
                    Sélectionnez une entreprise, un employé et une période pour générer
                    un bulletin de paie.
                  </p>
                  <p>
                    Le système récupérera automatiquement les informations suivantes :
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Salaire brut mensuel</li>
                    <li>Statut (cadre/non cadre)</li>
                    <li>Contrat en vigueur</li>
                    <li>Cotisations applicables</li>
                    <li>Taux d'imposition</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-medium">Processus de génération :</p>
                    <ol className="list-decimal pl-5 space-y-1 mt-2">
                      <li>Sélection des informations</li>
                      <li>Calcul du bulletin</li>
                      <li>Vérification de l'aperçu</li>
                      <li>Génération au format PDF</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="preview">
          {calculationResult ? (
            <PayslipPreview
              calculationResult={calculationResult}
              employeeId={selectedEmployee}
              period={selectedPeriod}
              onSave={handleSaveSuccess}
              autoGenerate={autoGenerate}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p>Veuillez d'abord calculer le bulletin pour accéder à l'aperçu.</p>
                <Button 
                  onClick={() => setActiveTab("details")} 
                  variant="outline" 
                  className="mt-4"
                >
                  Retour au calcul
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Bulletins récents</CardTitle>
              <CardDescription>Historique des bulletins générés</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <p className="text-center py-8 text-muted-foreground">
                Fonctionnalité d'historique en cours de développement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
} 