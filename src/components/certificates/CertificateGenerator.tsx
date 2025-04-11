'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Building, 
  User, 
  CreditCard, 
  Calendar,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  createCertificate, 
  generateCertificatePDF,
  updateCertificate
} from '@/services/certificate-service';
import CertificatePreview from '@/components/certificates/CertificatePreview';

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
  address?: string;
  city?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  position?: string;
  salary?: number;
  birthDate?: string;
  socialSecurityNumber?: string;
  startDate?: string;
  endDate?: string;
  companyId: string;
}

interface CertificateGeneratorProps {
  type: 'attestation-travail' | 'attestation-salaire' | 'attestation-presence';
  initialData?: any;
  certificateId?: string;
}

export default function CertificateGenerator({ 
  type, 
  initialData,
  certificateId
}: CertificateGeneratorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const certificateRef = useRef<HTMLDivElement>(null);
  
  // États pour les données
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  
  // États du formulaire
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState("company");
  const [generatedCertificateId, setGeneratedCertificateId] = useState<string | null>(certificateId || null);
  
  // Options communes
  const [showAddress, setShowAddress] = useState(true);
  const [showSSN, setShowSSN] = useState(false);
  const [addStamp, setAddStamp] = useState(true);
  const [addPurpose, setAddPurpose] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [addQrCode, setAddQrCode] = useState(false);
  const [hrName, setHrName] = useState("");
  const [hrPosition, setHrPosition] = useState("Responsable RH");
  
  // Options spécifiques pour attestation-salaire
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryType, setSalaryType] = useState("monthly");
  
  // Options spécifiques pour attestation-presence
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Fonction pour charger les données initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Récupérer les entreprises
        const companiesSnapshot = await getDocs(collection(db, `users/${user.uid}/companies`));
        const companiesData: Company[] = [];
        
        companiesSnapshot.forEach((doc) => {
          companiesData.push({ id: doc.id, ...doc.data() } as Company);
        });
        
        setCompanies(companiesData);
        
        // Récupérer tous les employés
        const employeesSnapshot = await getDocs(collection(db, `users/${user.uid}/employees`));
        const employeesData: Employee[] = [];
        
        employeesSnapshot.forEach((doc) => {
          employeesData.push({ id: doc.id, ...doc.data() } as Employee);
        });
        
        setEmployees(employeesData);
        
        // Si nous sommes en mode édition, charger les données du certificat
        if (initialData) {
          // Pré-remplir le formulaire avec les données initiales
          setSelectedCompanyId(initialData.companyId || "");
          setSelectedEmployeeId(initialData.employeeId || "");
          setShowAddress(initialData.options?.showAddress !== false);
          setShowSSN(initialData.options?.showSSN === true);
          setAddStamp(initialData.options?.addStamp !== false);
          setAddPurpose(!!initialData.options?.purpose);
          setPurpose(initialData.options?.purpose || "");
          setAddQrCode(initialData.options?.addQrCode === true);
          setHrName(initialData.options?.hrName || "");
          setHrPosition(initialData.options?.hrPosition || "Responsable RH");
          
          // Options spécifiques par type
          if (type === 'attestation-salaire') {
            setSalaryAmount(initialData.options?.salaryAmount || "");
            setSalaryType(initialData.options?.salaryType || "monthly");
          }
          
          if (type === 'attestation-presence') {
            setStartDate(initialData.options?.startDate || "");
            setEndDate(initialData.options?.endDate || "");
          }
          
          // Filtrer les employés pour la société sélectionnée
          if (initialData.companyId) {
            const filtered = employeesData.filter(emp => emp.companyId === initialData.companyId);
            setFilteredEmployees(filtered);
            
            // Trouver l'employé sélectionné
            if (initialData.employeeId) {
              const employee = filtered.find(emp => emp.id === initialData.employeeId);
              setSelectedEmployee(employee || null);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les données initiales. Veuillez réessayer."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, [user, initialData, type, toast]);
  
  // Mettre à jour les employés filtrés lorsque l'entreprise change
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSelectedEmployeeId("");
    setSelectedEmployee(null);
    
    const filtered = employees.filter(emp => emp.companyId === companyId);
    setFilteredEmployees(filtered);
  };
  
  // Mettre à jour l'employé sélectionné
  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    const employee = filteredEmployees.find(emp => emp.id === employeeId);
    setSelectedEmployee(employee || null);
  };
  
  // Générer ou mettre à jour le certificat
  const handleGenerate = async () => {
    if (!selectedCompanyId || !selectedEmployeeId) {
      toast({
        variant: "destructive",
        title: "Données manquantes",
        description: "Veuillez sélectionner une entreprise et un employé"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Préparer les options en fonction du type de certificat
      const options: Record<string, any> = {
        showAddress,
        showSSN,
        addStamp,
        addQrCode,
        hrName,
        hrPosition
      };
      
      // Ajouter le but si nécessaire
      if (addPurpose) {
        options.purpose = purpose;
      }
      
      // Options spécifiques pour chaque type
      if (type === 'attestation-salaire') {
        options.salaryAmount = salaryAmount;
        options.salaryType = salaryType;
      }
      
      if (type === 'attestation-presence') {
        options.startDate = startDate;
        options.endDate = endDate;
      }
      
      // Créer un nouveau certificat ou mettre à jour l'existant
      let certId;
      if (generatedCertificateId) {
        // Mise à jour d'un certificat existant
        await updateCertificate(generatedCertificateId, {
          type,
          companyId: selectedCompanyId,
          employeeId: selectedEmployeeId,
          options
        });
        certId = generatedCertificateId;
      } else {
        // Création d'un nouveau certificat
        certId = await createCertificate({
          type,
          companyId: selectedCompanyId,
          employeeId: selectedEmployeeId,
          options
        });
        setGeneratedCertificateId(certId);
      }
      
      // Générer le PDF
      await generateCertificatePDF(certId);
      
      toast({
        title: "Attestation générée",
        description: "L'attestation a été générée avec succès"
      });
      
      // Changer l'onglet actif pour voir la prévisualisation
      setActiveTab("preview");
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de générer l'attestation"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Fonction pour sauvegarder et retourner à la liste
  const handleSaveAndExit = async () => {
    await handleGenerate();
    router.push("/dashboard/documents/certificates");
  };
  
  // Obtenir le titre et l'icône en fonction du type
  const getTitleAndIcon = () => {
    switch (type) {
      case 'attestation-travail':
        return { 
          title: "Attestation de travail", 
          icon: <Building className="h-5 w-5 mr-2" /> 
        };
      case 'attestation-salaire':
        return { 
          title: "Attestation de salaire", 
          icon: <CreditCard className="h-5 w-5 mr-2" /> 
        };
      case 'attestation-presence':
        return { 
          title: "Attestation de présence", 
          icon: <UserCheck className="h-5 w-5 mr-2" /> 
        };
      default:
        return { 
          title: "Attestation", 
          icon: <User className="h-5 w-5 mr-2" /> 
        };
    }
  };
  
  const { title, icon } = getTitleAndIcon();
  
  return (
    <div className="flex h-[calc(100vh-120px)]">
      {/* Partie gauche: Configuration */}
      <div className="w-[400px] overflow-auto p-4 border-r">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          {icon} {title}
        </h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="company">Entreprise & Employé</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="company">
            <div className="space-y-4">
              {/* Sélection de l'entreprise */}
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Select
                  value={selectedCompanyId}
                  onValueChange={handleCompanyChange}
                  disabled={isLoading || companies.length === 0}
                >
                  <SelectTrigger id="company">
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
              </div>
              
              {/* Sélection de l'employé */}
              <div className="space-y-2">
                <Label htmlFor="employee">Employé</Label>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={handleEmployeeChange}
                  disabled={isLoading || !selectedCompanyId || filteredEmployees.length === 0}
                >
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Informations de l'employé sélectionné */}
              {selectedEmployee && (
                <Card className="mt-4">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium mb-2">Informations de l'employé</h3>
                    <p className="text-sm">
                      Nom: <span className="font-medium">{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                    </p>
                    {selectedEmployee.position && (
                      <p className="text-sm">
                        Poste: <span className="font-medium">{selectedEmployee.position}</span>
                      </p>
                    )}
                    {selectedEmployee.startDate && (
                      <p className="text-sm">
                        Date d'embauche: <span className="font-medium">{selectedEmployee.startDate}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="options">
            <div className="space-y-4">
              {/* Options communes à tous les types */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Options générales</h3>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showAddress" 
                    checked={showAddress} 
                    onCheckedChange={(checked) => setShowAddress(checked as boolean)} 
                  />
                  <Label htmlFor="showAddress">Afficher l'adresse</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showSSN" 
                    checked={showSSN} 
                    onCheckedChange={(checked) => setShowSSN(checked as boolean)} 
                  />
                  <Label htmlFor="showSSN">Afficher le numéro de sécurité sociale</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="addStamp" 
                    checked={addStamp} 
                    onCheckedChange={(checked) => setAddStamp(checked as boolean)} 
                  />
                  <Label htmlFor="addStamp">Ajouter un tampon</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="addQrCode" 
                    checked={addQrCode} 
                    onCheckedChange={(checked) => setAddQrCode(checked as boolean)} 
                  />
                  <Label htmlFor="addQrCode">Ajouter un QR code de vérification</Label>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="addPurpose" 
                      checked={addPurpose} 
                      onCheckedChange={(checked) => setAddPurpose(checked as boolean)} 
                    />
                    <Label htmlFor="addPurpose">Ajouter un objet</Label>
                  </div>
                  
                  {addPurpose && (
                    <Input
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="À qui de droit..."
                    />
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="hrName">Nom du signataire</Label>
                  <Input
                    id="hrName"
                    value={hrName}
                    onChange={(e) => setHrName(e.target.value)}
                    placeholder="Nom du responsable RH"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hrPosition">Fonction du signataire</Label>
                  <Input
                    id="hrPosition"
                    value={hrPosition}
                    onChange={(e) => setHrPosition(e.target.value)}
                    placeholder="Responsable RH"
                  />
                </div>
              </div>
              
              {/* Options spécifiques pour attestation-salaire */}
              {type === 'attestation-salaire' && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-sm font-medium">Options spécifiques</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salaryAmount">Montant du salaire</Label>
                    <Input
                      id="salaryAmount"
                      value={salaryAmount}
                      onChange={(e) => setSalaryAmount(e.target.value)}
                      placeholder="Montant du salaire"
                      type="number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salaryType">Type de salaire</Label>
                    <Select
                      value={salaryType}
                      onValueChange={setSalaryType}
                    >
                      <SelectTrigger id="salaryType">
                        <SelectValue placeholder="Type de salaire" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Horaire</SelectItem>
                        <SelectItem value="daily">Journalier</SelectItem>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="annual">Annuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              {/* Options spécifiques pour attestation-presence */}
              {type === 'attestation-presence' && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-sm font-medium">Période de présence</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="JJ/MM/AAAA"
                      type="date"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="JJ/MM/AAAA"
                      type="date"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 space-y-2">
          <Button 
            onClick={handleGenerate} 
            className="w-full"
            disabled={isLoading || isSaving || !selectedCompanyId || !selectedEmployeeId}
          >
            {generatedCertificateId ? "Mettre à jour" : "Générer l'attestation"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleSaveAndExit} 
            className="w-full"
            disabled={isLoading || isSaving || !selectedCompanyId || !selectedEmployeeId}
          >
            Sauvegarder et quitter
          </Button>
        </div>
      </div>
      
      {/* Partie droite: Aperçu */}
      <div className="flex-1 overflow-auto p-4" ref={certificateRef}>
        {generatedCertificateId ? (
          <CertificatePreview 
            certificateId={generatedCertificateId} 
            type={type}
            autoGenerate={true}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground">
              Remplissez le formulaire et générez l'attestation pour voir l'aperçu
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 