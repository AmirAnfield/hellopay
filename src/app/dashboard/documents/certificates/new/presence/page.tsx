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
import { UserCheck, User, Building, Calendar } from "lucide-react";
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

export default function PresenceCertificatePage() {
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showAddress, setShowAddress] = useState(true);
  const [showRegularAttendance, setShowRegularAttendance] = useState(true);
  const [showAbsences, setShowAbsences] = useState(false);
  const [absenceText, setAbsenceText] = useState("");
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
      
      // Initialiser la période par défaut à 3 mois en arrière
      const today = new Date();
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      
      setEndDate(today.toISOString().split('T')[0]);
      setStartDate(threeMonthsAgo.toISOString().split('T')[0]);
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
    
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Dates manquantes",
        description: "Veuillez spécifier les dates de début et de fin"
      });
      return;
    }
    
    try {
      // Récupérer l'entreprise sélectionnée
      const company = companies.find(c => c.id === selectedCompanyId);
      
      // Créer un titre pour l'attestation
      const title = `Attestation de présence - ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`;
      
      // Options pour l'attestation
      const options: Record<string, any> = {
        startDate: startDate || null,
        endDate: endDate || null,
        showAddress,
        showRegularAttendance,
        showAbsences,
        employeeName: `${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`,
        companyName: company?.name || "",
        position: selectedEmployee?.position || "",
        contractType: selectedEmployee?.contractType || "CDI"
      };
      
      // Ajouter absenceText seulement si showAbsences est true et si la valeur n'est pas vide
      if (showAbsences && absenceText?.trim()) {
        options.absenceText = absenceText;
      }
      
      // Ajouter les champs du signataire s'ils ne sont pas vides
      if (hrName?.trim()) {
        options.hrName = hrName;
      }
      if (hrPosition?.trim()) {
        options.hrPosition = hrPosition;
      }
      
      // Créer l'attestation dans Firestore
      const id = await createCertificate({
        employeeId: selectedEmployeeId,
        companyId: selectedCompanyId,
        type: 'attestation-presence',
        title: title,
        options: options
      });
      
      setCertificateId(id);
      setPreviewGenerated(true);
      
      // Notification de succès
      toast({
        title: "Attestation créée",
        description: "L'attestation de présence a été créée avec succès"
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
          title="Attestation de présence"
          description="Créer une attestation de présence pour un employé"
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
        title="Attestation de présence"
        description="Créer une attestation de présence pour un employé"
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
                  <Calendar className="h-5 w-5" />
                  Période de présence
                </CardTitle>
                <CardDescription>
                  Définissez la période pour laquelle vous attestez la présence de l&apos;employé
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Options de l&apos;attestation
                </CardTitle>
                <CardDescription>
                  Personnalisez les informations incluses dans l&apos;attestation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="showAddress" checked={showAddress} onCheckedChange={(checked) => setShowAddress(checked as boolean)} />
                    <Label htmlFor="showAddress" className="text-sm font-normal">Afficher l&apos;adresse de l&apos;employé</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="showRegularAttendance" checked={showRegularAttendance} onCheckedChange={(checked) => setShowRegularAttendance(checked as boolean)} />
                    <Label htmlFor="showRegularAttendance" className="text-sm font-normal">Mentionner l&apos;assiduité de l&apos;employé</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox id="showAbsences" checked={showAbsences} onCheckedChange={(checked) => setShowAbsences(checked as boolean)} />
                    <Label htmlFor="showAbsences" className="text-sm font-normal">Mentionner les absences (si applicable)</Label>
                  </div>
                  
                  {showAbsences && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor="absenceText" className="text-sm">Détails des absences</Label>
                      <Input
                        id="absenceText"
                        placeholder="ex: 2 jours pour maladie en janvier..."
                        value={absenceText}
                        onChange={(e) => setAbsenceText(e.target.value)}
                      />
                    </div>
                  )}
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
                <Button onClick={handleSubmit} disabled={!selectedCompanyId || !selectedEmployeeId || !startDate || !endDate}>
                  Générer l&apos;attestation
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="preview">
            {certificateId && (
              <CertificatePreview 
                certificateId={certificateId}
                type="attestation-presence"
                autoGenerate={true}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
} 