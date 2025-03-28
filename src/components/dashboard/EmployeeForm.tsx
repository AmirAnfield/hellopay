"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

// Types pour le formulaire
interface EmployeeFormData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  socialSecurityNumber: string;
  position: string;
  department: string;
  contractType: string;
  isExecutive: boolean;
  startDate: string;
  endDate: string;
  trialPeriodEndDate: string;
  hourlyRate: number;
  monthlyHours: number;
  baseSalary: number;
  bonusAmount: number;
  bonusDescription: string;
  iban: string;
  bic: string;
  companyId: string;
}

// Type pour les entreprises
interface Company {
  id: string;
  name: string;
}

interface EmployeeFormProps {
  employeeId?: string;
  initialCompanyId?: string;
}

// Fonction principale du formulaire
export default function EmployeeForm({ employeeId, initialCompanyId }: EmployeeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
    email: "",
    phoneNumber: "",
    birthDate: "",
    birthPlace: "",
    nationality: "Française",
    socialSecurityNumber: "",
    position: "",
    department: "",
    contractType: "CDI",
    isExecutive: false,
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: "",
    trialPeriodEndDate: "",
    hourlyRate: 11.27, // SMIC horaire par défaut
    monthlyHours: 151.67, // Heures mensuelles standard
    baseSalary: 1709.28, // SMIC mensuel par défaut
    bonusAmount: 0,
    bonusDescription: "",
    iban: "",
    bic: "",
    companyId: initialCompanyId || "",
  });

  useEffect(() => {
    // Charger la liste des entreprises
    fetchCompanies();
    
    // Si on est en mode édition, charger les données de l'employé
    if (employeeId) {
      fetchEmployeeData(employeeId);
    } else {
      setIsLoading(false);
    }
  }, [employeeId, initialCompanyId]);

  // Fonction pour récupérer les entreprises
  async function fetchCompanies() {
    try {
      const response = await fetch("/api/companies");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des entreprises");
      }
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (err) {
      console.error("Erreur:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les entreprises. Veuillez réessayer."
      });
    }
  }

  // Fonction pour récupérer les données d'un employé existant
  async function fetchEmployeeData(id: string) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/employees/${id}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données de l'employé");
      }
      const data = await response.json();
      
      if (data.employee) {
        // Formatter les dates pour les champs de type date
        const employee = data.employee;
        const formattedEmployee = {
          ...employee,
          birthDate: employee.birthDate ? format(new Date(employee.birthDate), "yyyy-MM-dd") : "",
          startDate: employee.startDate ? format(new Date(employee.startDate), "yyyy-MM-dd") : "",
          endDate: employee.endDate ? format(new Date(employee.endDate), "yyyy-MM-dd") : "",
          trialPeriodEndDate: employee.trialPeriodEndDate 
            ? format(new Date(employee.trialPeriodEndDate), "yyyy-MM-dd") 
            : "",
        };
        
        setFormData(formattedEmployee as EmployeeFormData);
      }
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les données de l'employé. Veuillez réessayer.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données de l'employé. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Gestionnaire de changement pour les champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Traitement spécial pour les champs numériques
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Calcul automatique du salaire de base si le taux horaire ou les heures changent
    if (name === "hourlyRate" || name === "monthlyHours") {
      const hourlyRate = name === "hourlyRate" ? parseFloat(value) : formData.hourlyRate;
      const monthlyHours = name === "monthlyHours" ? parseFloat(value) : formData.monthlyHours;
      const calculatedSalary = hourlyRate * monthlyHours;
      
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
        baseSalary: isNaN(calculatedSalary) ? prev.baseSalary : calculatedSalary,
      }));
    }
  };

  // Gestionnaire pour les cases à cocher
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Gestionnaire de soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation de base du formulaire
      if (!formData.firstName || !formData.lastName || !formData.socialSecurityNumber || !formData.companyId) {
        throw new Error("Veuillez remplir tous les champs obligatoires");
      }

      // Création ou mise à jour de l'employé
      const url = employeeId
        ? `/api/employees/${employeeId}`
        : "/api/employees";
      
      const method = employeeId ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Une erreur est survenue");
      }

      toast({
        title: employeeId ? "Employé mis à jour" : "Employé créé",
        description: employeeId 
          ? "L&apos;employé a été mis à jour avec succès." 
          : "L&apos;employé a été créé avec succès.",
      });

      // Redirection après succès
      if (formData.companyId) {
        router.push(`/dashboard/companies/${formData.companyId}`);
      } else {
        router.push("/dashboard/employees");
      }
    } catch (err) {
      console.error("Erreur:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Annuler et retourner à la page précédente
  const handleCancel = () => {
    router.back();
  };

  // Affichage du chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{employeeId ? "Modifier un employé" : "Créer un nouvel employé"}</CardTitle>
            <CardDescription>
              {employeeId 
                ? "Modifiez les informations de l&apos;employé ci-dessous." 
                : "Renseignez les informations du nouvel employé ci-dessous."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Section entreprise */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Entreprise</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyId">Entreprise *</Label>
                  <select
                    id="companyId"
                    name="companyId"
                    value={formData.companyId}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Sélectionnez une entreprise</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Section identité */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Identité</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="birthDate">Date de naissance</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="birthPlace">Lieu de naissance</Label>
                  <Input
                    id="birthPlace"
                    name="birthPlace"
                    value={formData.birthPlace}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nationality">Nationalité</Label>
                  <Input
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="socialSecurityNumber">Numéro de sécurité sociale *</Label>
                  <Input
                    id="socialSecurityNumber"
                    name="socialSecurityNumber"
                    value={formData.socialSecurityNumber}
                    onChange={handleChange}
                    placeholder="15 chiffres"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Section contact */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="address">Adresse *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="postalCode">Code postal *</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Téléphone</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Section informations professionnelles */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Informations professionnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="position">Poste occupé *</Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Service / Département</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contractType">Type de contrat *</Label>
                  <select
                    id="contractType"
                    name="contractType"
                    value={formData.contractType}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Alternance">Alternance</option>
                    <option value="Stage">Stage</option>
                    <option value="Intérim">Intérim</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Date d&apos;embauche *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">Date de fin (si applicable)</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="trialPeriodEndDate">Fin période d'essai</Label>
                  <Input
                    id="trialPeriodEndDate"
                    name="trialPeriodEndDate"
                    type="date"
                    value={formData.trialPeriodEndDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    id="isExecutive"
                    checked={formData.isExecutive}
                    onCheckedChange={(checked) => handleCheckboxChange("isExecutive", checked === true)}
                  />
                  <label
                    htmlFor="isExecutive"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Statut cadre
                  </label>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Section rémunération */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Rémunération</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="hourlyRate">Taux horaire (€) *</Label>
                  <Input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monthlyHours">Heures mensuelles *</Label>
                  <Input
                    id="monthlyHours"
                    name="monthlyHours"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthlyHours}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="baseSalary">Salaire mensuel brut (€) *</Label>
                  <Input
                    id="baseSalary"
                    name="baseSalary"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.baseSalary}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bonusAmount">Montant prime mensuelle (€)</Label>
                  <Input
                    id="bonusAmount"
                    name="bonusAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.bonusAmount}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label htmlFor="bonusDescription">Description de la prime</Label>
                  <Input
                    id="bonusDescription"
                    name="bonusDescription"
                    value={formData.bonusDescription}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Section coordonnées bancaires */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Coordonnées bancaires</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    name="iban"
                    value={formData.iban}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bic">BIC</Label>
                  <Input
                    id="bic"
                    name="bic"
                    value={formData.bic}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {employeeId ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </div>
  );
} 