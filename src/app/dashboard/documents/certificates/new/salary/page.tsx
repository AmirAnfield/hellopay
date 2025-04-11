"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageContainer, PageHeader, LoadingState } from "@/components/shared/PageContainer";
import { CreditCard, User, Building, Calendar } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { createCertificate } from "@/services/certificate-service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CertificatePreview from "@/components/certificates/CertificatePreview";

interface Company {
  id: string;
  name: string;
  address?: string;
  city?: string;
  postalCode?: string;
  siret?: string;
  email?: string;
  phone?: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  companyId: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  socialSecurityNumber?: string;
  startDate?: string;
  contractType?: string;
  baseSalary?: number;
}

export default function SalaryCertificatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  
  // Form state
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [period, setPeriod] = useState("3");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);
  const [salaryDetail, setSalaryDetail] = useState<"detailed" | "summary">("detailed");
  const [grossSalary, setGrossSalary] = useState<number>(0);
  const [netSalary, setNetSalary] = useState<number>(0);
  const [taxableSalary, setTaxableSalary] = useState<number>(0);
  const [signature, setSignature] = useState<"manual" | "electronic">("manual");
  const [language, setLanguage] = useState<"fr" | "en">("fr");
  const [certificateId, setCertificateId] = useState<string | null>(null);
  const [previewGenerated, setPreviewGenerated] = useState(false);
  
  // Charger les entreprises et employés
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.uid) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const userId = user.uid;
        
        // Charger les entreprises
        const companiesRef = collection(db, `users/${userId}/companies`);
        const companiesSnapshot = await getDocs(companiesRef);
        const companiesList: Company[] = [];
        
        if (!companiesSnapshot.empty) {
          companiesSnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.isArchived) {
              companiesList.push({
                id: doc.id,
                name: data.name || "Entreprise sans nom",
                address: data.address,
                city: data.city,
                postalCode: data.postalCode,
                siret: data.siret,
                email: data.email,
                phone: data.phone
              });
            }
          });
        }
        
        setCompanies(companiesList);
        
        // Charger tous les employés
        const employeesRef = collection(db, `users/${userId}/employees`);
        const employeesSnapshot = await getDocs(employeesRef);
        const employeesList: Employee[] = [];
        
        if (!employeesSnapshot.empty) {
          employeesSnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.isArchived) {
              employeesList.push({
                id: doc.id,
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                position: data.position || "Employé",
                companyId: data.companyId || "",
                birthDate: data.birthDate,
                birthPlace: data.birthPlace,
                address: data.address,
                city: data.city,
                postalCode: data.postalCode,
                socialSecurityNumber: data.socialSecurityNumber,
                startDate: data.startDate || data.hiringDate,
                contractType: data.contractType || "CDI",
                baseSalary: Number(data.baseSalary) || 0
              });
            }
          });
        }
        
        setEmployees(employeesList);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les données. Veuillez réessayer."
        });
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);
  
  // Filtrer les employés lorsqu'une entreprise est sélectionnée
  useEffect(() => {
    if (selectedCompanyId) {
      const filtered = employees.filter(emp => emp.companyId === selectedCompanyId);
      setFilteredEmployees(filtered);
      setSelectedEmployeeId(""); // Réinitialiser l'employé sélectionné
      setSelectedEmployee(null);
    } else {
      setFilteredEmployees([]);
    }
  }, [selectedCompanyId, employees]);
  
  // Mettre à jour l'employé sélectionné
  useEffect(() => {
    if (selectedEmployeeId) {
      const employee = employees.find(emp => emp.id === selectedEmployeeId) || null;
      setSelectedEmployee(employee);
      if (employee && employee.baseSalary) {
        setGrossSalary(employee.baseSalary);
        // Estimation approximative pour le net (environ 80% du brut)
        setNetSalary(Math.round(employee.baseSalary * 0.8));
        // Estimation approximative pour le net imposable (environ 90% du brut)
        setTaxableSalary(Math.round(employee.baseSalary * 0.9));
      }
    } else {
      setSelectedEmployee(null);
    }
  }, [selectedEmployeeId, employees]);
  
  // Mettre à jour les dates de début et de fin pour la période personnalisée
  useEffect(() => {
    if (!isCustomPeriod) {
      const today = new Date();
      const periodMonths = parseInt(period);
      const endDate = today.toISOString().split('T')[0];
      const startDate = new Date(today.getFullYear(), today.getMonth() - periodMonths, today.getDate()).toISOString().split('T')[0];
      
      setCustomEndDate(endDate);
      setCustomStartDate(startDate);
    }
  }, [period, isCustomPeriod]);
  
  // Gérer la soumission du formulaire
  const handleSubmit = async () => {
    if (!selectedCompanyId || !selectedEmployeeId) {
      toast({
        variant: "destructive",
        title: "Données manquantes",
        description: "Veuillez sélectionner une entreprise et un employé"
      });
      return;
    }
    
    try {
      // Récupérer l'entreprise sélectionnée
      const company = companies.find(c => c.id === selectedCompanyId);
      
      // Créer un titre pour l'attestation
      const title = `Attestation de salaire - ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`;
      
      // Options pour l'attestation
      const options = {
        isCustomPeriod,
        periodMonths: parseInt(period),
        startDate: customStartDate || null,
        endDate: customEndDate || null,
        salaryDetail,
        grossSalary,
        netSalary,
        taxableSalary,
        signature,
        language,
        employeeName: `${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`,
        companyName: company?.name || "",
        showSalary: true,
        salaryType: "monthly",
        position: selectedEmployee?.position || "",
        contractType: selectedEmployee?.contractType || "CDI",
        noEndDate: false
      };
      
      // Créer l'attestation dans Firestore
      const id = await createCertificate({
        employeeId: selectedEmployeeId,
        companyId: selectedCompanyId,
        type: 'attestation-salaire',
        title: title,
        options: options
      });
      
      setCertificateId(id);
      setPreviewGenerated(true);
      
      // Notification de succès
      toast({
        title: "Attestation créée",
        description: "L'attestation de salaire a été créée avec succès"
      });
      
      // Si on est en mode prévisualisation, on ne redirige pas
      if (!previewGenerated) {
      // Redirection vers la page des attestations
      router.push("/dashboard/documents/certificates");
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'attestation:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer l'attestation. Veuillez réessayer."
      });
    }
  };
  
  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Attestation de salaire"
          description="Créer une attestation de salaire pour un employé"
          actions={
            <Button variant="outline" onClick={() => router.back()}>
              Retour
            </Button>
          }
        />
        <LoadingState />
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <PageHeader
        title="Attestation de salaire"
        description="Créer une attestation de salaire pour un employé"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            Retour
          </Button>
        }
      />
      
      <div className="grid gap-6">
        <Tabs defaultValue="form">
          <TabsList className="mb-4">
            <TabsTrigger value="form">Formulaire</TabsTrigger>
            <TabsTrigger value="preview" disabled={!certificateId}>Aperçu</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Sélectionner l&apos;entreprise et l&apos;employé
            </CardTitle>
            <CardDescription>
              Choisissez l&apos;entreprise et l&apos;employé pour lesquels vous souhaitez créer une attestation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Select
                  value={selectedCompanyId}
                  onValueChange={setSelectedCompanyId}
                >
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Sélectionner une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employee">Employé</Label>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={setSelectedEmployeeId}
                  disabled={!selectedCompanyId || filteredEmployees.length === 0}
                >
                  <SelectTrigger id="employee">
                    <SelectValue placeholder={selectedCompanyId ? (filteredEmployees.length > 0 ? "Sélectionner un employé" : "Aucun employé disponible") : "Sélectionnez d'abord une entreprise"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEmployees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {selectedEmployee && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Détails de l&apos;employé
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><span className="text-muted-foreground">Nom:</span> {selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                    <p><span className="text-muted-foreground">Poste:</span> {selectedEmployee.position || "Non spécifié"}</p>
                    <p><span className="text-muted-foreground">Type de contrat:</span> {selectedEmployee.contractType || "CDI"}</p>
                  </div>
                  <div>
                    <p><span className="text-muted-foreground">Date d&apos;embauche:</span> {selectedEmployee.startDate || "Non spécifiée"}</p>
                    <p><span className="text-muted-foreground">Salaire de base:</span> {selectedEmployee.baseSalary ? `${selectedEmployee.baseSalary} €` : "Non spécifié"}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Période concernée
            </CardTitle>
            <CardDescription>
              Définissez la période pour laquelle vous souhaitez générer l&apos;attestation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period">Période</Label>
                <Select
                  value={isCustomPeriod ? "custom" : period}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setIsCustomPeriod(true);
                    } else {
                      setIsCustomPeriod(false);
                      setPeriod(value);
                    }
                  }}
                >
                  <SelectTrigger id="period">
                    <SelectValue placeholder="Sélectionner une période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 derniers mois</SelectItem>
                    <SelectItem value="6">6 derniers mois</SelectItem>
                    <SelectItem value="12">12 derniers mois</SelectItem>
                    <SelectItem value="custom">Période personnalisée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isCustomPeriod && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Informations salariales
            </CardTitle>
            <CardDescription>
              Précisez les montants et le niveau de détail souhaité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salaryDetail">Affichage</Label>
                <Select
                  value={salaryDetail}
                  onValueChange={(value) => setSalaryDetail(value as "detailed" | "summary")}
                >
                  <SelectTrigger id="salaryDetail">
                    <SelectValue placeholder="Sélectionner un niveau de détail" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed">Détaillé (brut/net/imposable)</SelectItem>
                    <SelectItem value="summary">Résumé (montant net uniquement)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grossSalary">Salaire brut mensuel</Label>
                  <Input
                    id="grossSalary"
                    type="number"
                    value={grossSalary.toString()}
                    onChange={(e) => setGrossSalary(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="netSalary">Salaire net mensuel</Label>
                  <Input
                    id="netSalary"
                    type="number"
                    value={netSalary.toString()}
                    onChange={(e) => setNetSalary(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxableSalary">Salaire net imposable</Label>
                  <Input
                    id="taxableSalary"
                    type="number"
                    value={taxableSalary.toString()}
                    onChange={(e) => setTaxableSalary(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Options supplémentaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signature">Type de signature</Label>
                  <Select
                    value={signature}
                    onValueChange={(value) => setSignature(value as "manual" | "electronic")}
                  >
                    <SelectTrigger id="signature">
                      <SelectValue placeholder="Sélectionner le type de signature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manuelle (à imprimer puis signer)</SelectItem>
                      <SelectItem value="electronic">Électronique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Langue du document</Label>
                  <Select
                    value={language}
                    onValueChange={(value) => setLanguage(value as "fr" | "en")}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Sélectionner la langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedCompanyId || !selectedEmployeeId}>
                  {previewGenerated ? "Mettre à jour" : "Générer l'attestation"}
            </Button>
          </CardFooter>
        </Card>
          </TabsContent>
          
          <TabsContent value="preview">
            {certificateId && (
              <div className="space-y-4">
                <CertificatePreview 
                  certificateId={certificateId}
                  type="attestation-salaire"
                  autoGenerate={true}
                />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => router.back()}>
                    Annuler
                  </Button>
                  <Button onClick={() => router.push("/dashboard/documents/certificates")}>
                    Terminer
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
} 