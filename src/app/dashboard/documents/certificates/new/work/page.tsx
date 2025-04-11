"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageContainer, PageHeader, LoadingState } from "@/components/shared/PageContainer";
import { Briefcase, User, Building } from "lucide-react";
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
}

export default function WorkCertificatePage() {
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
  const [showAddress, setShowAddress] = useState(true);
  const [showSSN, setShowSSN] = useState(false);
  const [addStamp, setAddStamp] = useState(true);
  const [addPurpose, setAddPurpose] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [addQrCode, setAddQrCode] = useState(false);
  const [hrName, setHrName] = useState("");
  const [hrPosition, setHrPosition] = useState("Responsable RH");
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
                contractType: data.contractType || "CDI"
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
    } else {
      setSelectedEmployee(null);
    }
  }, [selectedEmployeeId, employees]);
  
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
      const title = `Attestation de travail - ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`;
      
      // Options pour l'attestation
      const options: Record<string, any> = {
        signatory: hrName || null,
        hrPosition: hrPosition || null,
        addStamp,
        addPurpose,
        addQrCode,
        employeeName: `${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`,
        companyName: company?.name || "",
        position: selectedEmployee?.position || "",
        contractType: selectedEmployee?.contractType || "CDI"
      };
      
      // Ajouter purpose seulement si addPurpose est true et si la valeur n'est pas vide
      if (addPurpose && purpose?.trim()) {
        options.purpose = purpose;
      }
      
      // Créer l'attestation dans Firestore
      const id = await createCertificate({
        employeeId: selectedEmployeeId,
        companyId: selectedCompanyId,
        type: 'attestation-travail',
        title: title,
        options: options
      });
      
      setCertificateId(id);
      setPreviewGenerated(true);
      
      // Notification de succès
      toast({
        title: "Attestation créée",
        description: "L'attestation de travail a été créée avec succès"
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
          title="Attestation de travail"
          description="Créer une attestation pour un employé"
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
        title="Attestation de travail"
        description="Créer une attestation pour un employé"
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
                        {selectedEmployee.address && (
                          <p><span className="text-muted-foreground">Adresse:</span> {selectedEmployee.address}, {selectedEmployee.postalCode} {selectedEmployee.city}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Options de l&apos;attestation
                </CardTitle>
                <CardDescription>
                  Personnalisez les informations incluses dans l&apos;attestation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Informations personnelles</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="showAddress" checked={showAddress} onCheckedChange={(checked) => setShowAddress(checked as boolean)} />
                    <Label htmlFor="showAddress" className="text-sm font-normal">Afficher l&apos;adresse de l&apos;employé</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="showSSN" checked={showSSN} onCheckedChange={(checked) => setShowSSN(checked as boolean)} />
                    <Label htmlFor="showSSN" className="text-sm font-normal">Afficher le numéro de sécurité sociale</Label>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Personnalisation</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="addStamp" checked={addStamp} onCheckedChange={(checked) => setAddStamp(checked as boolean)} />
                    <Label htmlFor="addStamp" className="text-sm font-normal">Ajouter le cachet de l&apos;entreprise</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="addPurpose" checked={addPurpose} onCheckedChange={(checked) => setAddPurpose(checked as boolean)} />
                    <Label htmlFor="addPurpose" className="text-sm font-normal">Ajouter un objet (ex: dossier de location, préfecture)</Label>
                  </div>
                  
                  {addPurpose && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="purpose" className="text-sm">Objet de l&apos;attestation</Label>
                      <Input
                        id="purpose"
                        placeholder="ex: Dossier de location, Demande de visa..."
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="addQrCode" checked={addQrCode} onCheckedChange={(checked) => setAddQrCode(checked as boolean)} />
                    <Label htmlFor="addQrCode" className="text-sm font-normal">Ajouter un QR Code de vérification</Label>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Signataire</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hrName" className="text-sm">Nom du responsable</Label>
                      <Input
                        id="hrName"
                        placeholder="Nom et prénom du signataire"
                        value={hrName}
                        onChange={(e) => setHrName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hrPosition" className="text-sm">Fonction du responsable</Label>
                      <Input
                        id="hrPosition"
                        placeholder="ex: Responsable RH"
                        value={hrPosition}
                        onChange={(e) => setHrPosition(e.target.value)}
                      />
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
                  type="attestation-travail"
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