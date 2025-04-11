"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import { auth } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Style personnalisé pour afficher les messages d'erreur en orange (warning)
const WarningFormMessage = ({ children }: { children: React.ReactNode }) => {
  if (!children) return null;
  return (
    <div className="text-amber-500 text-xs font-medium mt-1">
      {children}
    </div>
  );
};

// Schéma de validation avec Zod
const employeeFormSchema = z.object({
  // Informations personnelles
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  position: z.string().optional(),
  companyId: z.string().optional(),
  
  // Coordonnées
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  
  // Informations administratives
  socialSecurityNumber: z.string().optional(),
  iban: z.string().optional(),
  
  // Adresse
  address: z.string().optional(),
  addressComplement: z.string().optional().nullable(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional().default("France"),
}).superRefine((data, ctx) => {
  // Validations pour affichage des messages mais sans bloquer la soumission
  if (data.firstName && data.firstName.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le prénom devrait comporter au moins 2 caractères",
      path: ["firstName"],
    });
  }

  if (data.lastName && data.lastName.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le nom devrait comporter au moins 2 caractères",
      path: ["lastName"],
    });
  }

  if (data.position && data.position.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le poste devrait comporter au moins 2 caractères",
      path: ["position"],
    });
  }

  if (data.email && !data.email.includes("@")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Format email non valide",
      path: ["email"],
    });
  }

  if (data.phoneNumber && data.phoneNumber.length < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le téléphone devrait comporter au moins 10 caractères",
      path: ["phoneNumber"],
    });
  }

  if (data.socialSecurityNumber && (data.socialSecurityNumber.length < 13 || data.socialSecurityNumber.length > 15)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le numéro de sécurité sociale devrait comporter entre 13 et 15 caractères",
      path: ["socialSecurityNumber"],
    });
  }

  if (data.iban && data.iban.length < 15) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "IBAN devrait comporter au moins 15 caractères",
      path: ["iban"],
    });
  }

  if (data.address && data.address.length < 5) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Adresse devrait comporter au moins 5 caractères",
      path: ["address"],
    });
  }

  if (data.city && data.city.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La ville devrait comporter au moins 2 caractères",
      path: ["city"],
    });
  }

  if (data.postalCode && data.postalCode.length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Le code postal devrait comporter au moins 2 caractères",
      path: ["postalCode"],
    });
  }
  
  // Toujours retourner les données telles quelles, même si non conformes
  return data;
});

// Types pour les props et le formulaire
type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeFormProps {
  employeeId?: string;
  defaultCompanyId?: string;
}

export default function EmployeeForm({ employeeId, defaultCompanyId }: EmployeeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [companies, setCompanies] = useState<Array<{id: string, name: string}>>([]);
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!employeeId;

  // Initialiser le formulaire avec des valeurs par défaut
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      position: "",
      companyId: defaultCompanyId || "",
      email: "",
      phoneNumber: "",
      socialSecurityNumber: "",
      iban: "",
      address: "",
      addressComplement: "",
      city: "",
      postalCode: "",
      country: "France",
    },
  });

  // Charger les entreprises depuis Firestore
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        if (!auth.currentUser) {
          return;
        }
        
        const userId = auth.currentUser.uid;
        const companiesRef = collection(db, `users/${userId}/companies`);
        const companiesSnapshot = await getDocs(companiesRef);
        
        const companiesData: Array<{id: string, name: string}> = [];
        
        companiesSnapshot.forEach((doc) => {
          const data = doc.data();
          // Ne récupérer que les entreprises actives (non archivées)
          if (!data.isArchived) {
            companiesData.push({
              id: doc.id,
              name: data.name || ''
            });
          }
        });
        
        setCompanies(companiesData);
      } catch (e) {
        console.error("Erreur lors de la récupération des entreprises:", e);
      }
    };
    
    fetchCompanies();
  }, []);

  // Si en mode édition, charger les données de l'employé
  useEffect(() => {
    if (isEditMode && employeeId) {
      fetchEmployeeData(employeeId);
    } else if (defaultCompanyId) {
      form.setValue("companyId", defaultCompanyId);
    }
  }, [employeeId, defaultCompanyId, form]);

  async function fetchEmployeeData(id: string) {
    setIsFetching(true);
    try {
      // Récupérer depuis Firestore
      if (!auth.currentUser) {
        throw new Error("Vous devez être connecté pour voir les détails de l'employé");
      }
      
      const userId = auth.currentUser.uid;
      
      // Chemin pour l'employé dans Firestore
      const employeeRef = doc(db, `users/${userId}/employees`, id);
      const employeeDoc = await getDoc(employeeRef);
      
      if (employeeDoc.exists()) {
        const employeeData = employeeDoc.data();
        
        // Remplir le formulaire avec les données existantes
        form.reset({
          firstName: employeeData.firstName || "",
          lastName: employeeData.lastName || "",
          position: employeeData.position || "",
          companyId: employeeData.companyId || "",
          email: employeeData.email || "",
          phoneNumber: employeeData.phoneNumber || employeeData.phone || "",
          socialSecurityNumber: employeeData.socialSecurityNumber || "",
          iban: employeeData.iban || "",
          address: employeeData.address || "",
          addressComplement: employeeData.addressComplement || "",
          city: employeeData.city || "",
          postalCode: employeeData.postalCode || "",
          country: employeeData.country || "France",
        });
      } else {
        throw new Error("Employé non trouvé");
      }
    } catch (err) {
      console.error("Erreur:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err instanceof Error 
          ? err.message 
          : "Impossible de charger les informations de l'employé."
      });
    } finally {
      setIsFetching(false);
    }
  }

  async function onSubmit(data: EmployeeFormValues) {
    setIsLoading(true);
    
    // Trim all string fields to remove leading/trailing whitespace
    Object.keys(data).forEach(key => {
      if (typeof data[key as keyof EmployeeFormValues] === 'string') {
        data[key as keyof EmployeeFormValues] = (data[key as keyof EmployeeFormValues] as string).trim();
      }
    });
    
    
    try {
      // Vérifier que l'utilisateur est connecté
      if (!auth.currentUser) {
        throw new Error("Vous devez être connecté pour enregistrer un employé");
      }
      
      const userId = auth.currentUser.uid;
      
      // Trouver le nom de l'entreprise pour l'affichage
      const company = companies.find(c => c.id === data.companyId);
      const companyName = company ? company.name : '';
      
      // Valeurs par défaut pour les champs vides
      const defaultValues = {
        firstName: data.firstName || "Employé",
        lastName: data.lastName || "Sans nom",
        position: data.position || "Poste non spécifié",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        socialSecurityNumber: data.socialSecurityNumber || "",
        iban: data.iban || "",
        address: data.address || "",
        addressComplement: data.addressComplement || "",
        city: data.city || "",
        postalCode: data.postalCode || "",
        country: data.country || "France",
      };
      
      // Format des données pour Firestore avec valeurs par défaut
      const employeeData = {
        ...defaultValues,
        companyId: data.companyId || "",
        companyName,
        phone: defaultValues.phoneNumber, // Assurer la compatibilité avec les deux noms de propriétés
        updatedAt: new Date()
      };
      
      // Sauvegarder dans Firestore
      if (isEditMode) {
        // Mise à jour de l'employé existant
        const employeeRef = doc(db, `users/${userId}/employees`, employeeId as string);
        await setDoc(employeeRef, {
          ...employeeData,
          updatedAt: new Date()
        }, { merge: true });
      } else {
        // Création d'un nouvel employé
        const newEmployeeId = `employee-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const employeeRef = doc(db, `users/${userId}/employees`, newEmployeeId);
        await setDoc(employeeRef, {
          ...employeeData,
          id: newEmployeeId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isArchived: false,
          isLocked: false
        });
      }
      
      // Notification avec message spécifique pour la création
      toast({
        title: isEditMode ? "Employé mis à jour" : "Employé créé",
        description: isEditMode 
          ? `Employé ${employeeData.firstName} ${employeeData.lastName} mis à jour.` 
          : `Employé ${employeeData.firstName} ${employeeData.lastName} créé. Vous pourrez le modifier plus tard.`,
        variant: "default",
      });
      
      // Rediriger vers la liste des employés
      const fullName = `${employeeData.firstName} ${employeeData.lastName}`;
      router.push(`/dashboard/employees?action=${isEditMode ? 'updated' : 'created'}&name=${encodeURIComponent(fullName)}`);
      
    } catch (err) {
      console.error("Erreur:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err instanceof Error 
          ? err.message 
          : "Une erreur est survenue lors de l'enregistrement de l'employé."
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancel() {
    router.back();
  }

  // Affichage du chargement lors de la récupération des données
  if (isEditMode && isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-3">
        <Button variant="ghost" onClick={handleCancel} className="mr-3 h-7">
          <ArrowLeft className="h-3 w-3 mr-1" />
          Retour
        </Button>
        <h1 className="text-base font-medium">
          {isEditMode ? "Modifier l'employé" : "Ajouter un employé"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          {/* Informations générales */}
          <Card className="shadow-sm">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm font-medium">Informations de l'employé</CardTitle>
              <CardDescription className="text-xs">
                <span className="text-amber-500 font-medium">Tous les champs sont facultatifs.</span> Les messages en orange sont uniquement des suggestions de format.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom" {...field} className="h-7 text-sm" />
                      </FormControl>
                      <WarningFormMessage>{form.formState.errors.firstName?.message}</WarningFormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom" {...field} className="h-7 text-sm" />
                      </FormControl>
                      <WarningFormMessage>{form.formState.errors.lastName?.message}</WarningFormMessage>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemple.fr" {...field} value={field.value || ''} className="h-7 text-sm" />
                      </FormControl>
                      <WarningFormMessage>{form.formState.errors.email?.message}</WarningFormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 0123456789" {...field} value={field.value || ''} className="h-7 text-sm" />
                      </FormControl>
                      <WarningFormMessage>{form.formState.errors.phoneNumber?.message}</WarningFormMessage>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informations administratives */}
          <Card className="shadow-sm">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm font-medium">Informations administratives</CardTitle>
              <CardDescription className="text-xs">
                <span className="text-amber-500 font-medium">Tous les champs sont facultatifs.</span> Ces informations peuvent être ajoutées ultérieurement.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="socialSecurityNumber"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Numéro de sécurité sociale</FormLabel>
                      <FormControl>
                        <Input placeholder="Numéro de sécurité sociale" {...field} value={field.value || ''} className="h-7 text-sm" />
                      </FormControl>
                      <WarningFormMessage>{form.formState.errors.socialSecurityNumber?.message}</WarningFormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">IBAN</FormLabel>
                      <FormControl>
                        <Input placeholder="IBAN" {...field} value={field.value || ''} className="h-7 text-sm" />
                      </FormControl>
                      <WarningFormMessage>{form.formState.errors.iban?.message}</WarningFormMessage>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Adresse */}
          <Card className="shadow-sm">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm font-medium">Adresse</CardTitle>
              <CardDescription className="text-xs">
                <span className="text-amber-500 font-medium">Tous les champs sont facultatifs.</span> L&apos;adresse peut être complétée plus tard.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-1 space-y-3">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Numéro et nom de rue" {...field} value={field.value || ''} className="h-7 text-sm" />
                    </FormControl>
                    <WarningFormMessage>{form.formState.errors.address?.message}</WarningFormMessage>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="addressComplement"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">Complément d&apos;adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Bâtiment, étage, etc." {...field} value={field.value || ''} className="h-7 text-sm" />
                    </FormControl>
                    <WarningFormMessage>{form.formState.errors.addressComplement?.message}</WarningFormMessage>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Code postal</FormLabel>
                      <FormControl>
                        <Input placeholder="Code postal" {...field} value={field.value || ''} className="h-7 text-sm" />
                      </FormControl>
                      <WarningFormMessage>{form.formState.errors.postalCode?.message}</WarningFormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-medium">Ville</FormLabel>
                      <FormControl>
                        <Input placeholder="Ville" {...field} value={field.value || ''} className="h-7 text-sm" />
                      </FormControl>
                      <WarningFormMessage>{form.formState.errors.city?.message}</WarningFormMessage>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-medium">Pays</FormLabel>
                    <FormControl>
                      <Input placeholder="Pays" {...field} value={field.value || ''} className="h-7 text-sm" />
                    </FormControl>
                    <WarningFormMessage>{form.formState.errors.country?.message}</WarningFormMessage>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="h-7 text-xs"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-7 text-xs gap-1"
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              <Save className="h-3 w-3 mr-1" />
              {isEditMode ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 