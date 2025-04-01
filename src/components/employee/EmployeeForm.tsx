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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save } from "lucide-react";

// Schéma de validation avec Zod
const employeeFormSchema = z.object({
  // Informations personnelles
  firstName: z.string()
    .min(2, "Le prénom doit comporter au moins 2 caractères")
    .trim(),
  
  lastName: z.string()
    .min(2, "Le nom doit comporter au moins 2 caractères")
    .trim(),
  
  position: z.string()
    .min(2, "Le poste doit comporter au moins 2 caractères")
    .trim(),
  
  companyId: z.string()
    .min(1, "Veuillez sélectionner une entreprise"),
  
  // Champs optionnels
  email: z.string().email("Format d'email invalide").optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().default("France").optional().nullable(),
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
      address: "",
      city: "",
      postalCode: "",
      country: "France",
    },
  });

  // Charger les entreprises depuis localStorage
  useEffect(() => {
    const fetchCompanies = () => {
      if (typeof window !== 'undefined') {
        try {
          const companiesStr = localStorage.getItem('companies');
          if (companiesStr) {
            const parsedCompanies = JSON.parse(companiesStr);
            setCompanies(parsedCompanies.map((company: any) => ({
              id: company.id,
              name: company.name
            })));
          }
        } catch (e) {
          console.error("Erreur lors de la récupération des entreprises:", e);
        }
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
      // En mode développement, récupérer depuis localStorage
      if (typeof window !== 'undefined') {
        try {
          const employeesStr = localStorage.getItem('employees');
          if (employeesStr) {
            const employees = JSON.parse(employeesStr);
            const employee = employees.find((e: { id: string }) => e.id === id);
            
            if (employee) {
              // Remplir le formulaire avec les données existantes
              form.reset({
                firstName: employee.firstName || "",
                lastName: employee.lastName || "",
                position: employee.position || "",
                companyId: employee.companyId || "",
                email: employee.email || "",
                phoneNumber: employee.phoneNumber || "",
                address: employee.address || "",
                city: employee.city || "",
                postalCode: employee.postalCode || "",
                country: employee.country || "France",
              });
              
              setIsFetching(false);
              return;
            }
          }
        } catch (e) {
          console.error("Erreur lors de la récupération depuis localStorage:", e);
        }
      }
      
      // Si aucune donnée n'a été trouvée, afficher un message d'erreur
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les informations de l'employé."
      });
    } catch (err) {
      console.error("Erreur:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les informations de l'employé."
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
    
    console.log("Données soumises:", data);
    
    try {
      // En mode développement, sauvegarder dans localStorage
      if (typeof window !== 'undefined') {
        try {
          const employeesStr = localStorage.getItem('employees');
          const employees = employeesStr ? JSON.parse(employeesStr) : [];
          
          // Trouver le nom de l'entreprise pour l'affichage
          const company = companies.find(c => c.id === data.companyId);
          const companyName = company ? company.name : '';
          
          if (isEditMode) {
            // Mettre à jour l'employé existant
            const updatedEmployees = employees.map((employee: { id: string }) => {
              if (employee.id === employeeId) {
                return {
                  ...employee,
                  ...data,
                  companyName,
                  updatedAt: new Date()
                };
              }
              return employee;
            });
            
            localStorage.setItem('employees', JSON.stringify(updatedEmployees));
          } else {
            // Créer un nouvel employé
            const newEmployeeId = `employee-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            const newEmployee = {
              ...data,
              id: newEmployeeId,
              companyName,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            employees.push(newEmployee);
            localStorage.setItem('employees', JSON.stringify(employees));
          }
          
          // Simuler un délai pour l'enregistrement
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Notification
          toast({
            title: isEditMode ? "Employé mis à jour" : "Employé créé",
            description: isEditMode 
              ? `Les informations de l'employé "${data.firstName} ${data.lastName}" ont été mises à jour avec succès.` 
              : `L'employé "${data.firstName} ${data.lastName}" a été créé avec succès.`,
            variant: "default",
          });
          
          // Rediriger vers la liste des employés après un court délai
          const fullName = `${data.firstName} ${data.lastName}`;
          setTimeout(() => {
            window.location.href = `/dashboard/employees?action=${isEditMode ? 'updated' : 'created'}&name=${encodeURIComponent(fullName)}`;
          }, 1500);
          return;
        } catch (e) {
          console.error("Erreur lors de la sauvegarde dans localStorage:", e);
          throw new Error("Impossible de sauvegarder l'employé");
        }
      }
      
      // Si nous sommes ici, c'est qu'il y a un problème
      throw new Error("Problème lors de l'enregistrement de l'employé");
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
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={handleCancel} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? "Modifier l'employé" : "Ajouter un employé"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Informations de l'employé</CardTitle>
              <CardDescription>
                Les informations principales de l'employé - <span className="text-destructive font-medium">* Champs obligatoires</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Nom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poste <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Poste ou fonction" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entreprise <span className="text-destructive">*</span></FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une entreprise" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.length > 0 ? (
                          companies.map(company => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-companies" disabled>
                            Aucune entreprise disponible
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemple.fr" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 0123456789" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Adresse */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Adresse</CardTitle>
              <CardDescription>
                Adresse de l'employé (optionnel)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Numéro et nom de rue" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal</FormLabel>
                      <FormControl>
                        <Input placeholder="Code postal" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input placeholder="Ville" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays</FormLabel>
                    <FormControl>
                      <Input placeholder="Pays" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4 mr-1" />
              {isEditMode ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 