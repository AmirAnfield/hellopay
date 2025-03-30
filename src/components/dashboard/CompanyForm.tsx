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
const companyFormSchema = z.object({
  // Champs obligatoires - exactement comme dans src/lib/validators/companies.ts
  name: z.string()
    .min(2, "La raison sociale doit comporter au moins 2 caractères")
    .trim(),
  
  siret: z.string()
    .regex(/^\d{14}$/, "Le SIRET doit comporter exactement 14 chiffres")
    .trim(),
  
  address: z.string()
    .min(5, "L'adresse doit comporter au moins 5 caractères")
    .trim(),
  
  city: z.string()
    .min(2, "La ville doit comporter au moins 2 caractères")
    .trim(),
  
  postalCode: z.string()
    .min(2, "Le code postal doit comporter au moins 2 caractères")
    .trim(),
  
  country: z.string()
    .trim()
    .default("France"),
  
  // Champs optionnels - exactement comme dans le schéma serveur
  activityCode: z.string().trim().optional().nullable(),
  urssafNumber: z.string().trim().optional().nullable(),
  legalForm: z.string().trim().default("SARL").optional().nullable(),
  vatNumber: z.string().trim().optional().nullable(),
  phoneNumber: z.string().trim().optional().nullable(),
  email: z.string().email("Format d'email invalide").trim().optional().nullable(),
  website: z.string().url("Format d'URL invalide").trim().optional().nullable(),
  legalRepresentative: z.string().trim().optional().nullable(),
  legalRepresentativeRole: z.string().trim().optional().nullable(),
});

// Types pour les props et le formulaire
type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface CompanyFormProps {
  companyId?: string;
}

export default function CompanyForm({ companyId }: CompanyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!companyId;

  // Initialiser le formulaire avec des valeurs par défaut
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      siret: "",
      address: "",
      postalCode: "",
      city: "",
      country: "France",
      activityCode: "",
      urssafNumber: "",
      legalForm: "SARL",
      vatNumber: "",
      phoneNumber: "",
      email: "",
      website: "",
      legalRepresentative: "",
      legalRepresentativeRole: "",
    },
  });

  // Si en mode édition, charger les données de l'entreprise
  useEffect(() => {
    if (isEditMode) {
      fetchCompanyData();
    }
  }, [companyId]);

  async function fetchCompanyData() {
    setIsFetching(true);
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      
      if (!response.ok) {
        const errorMsg = `Erreur ${response.status}: Impossible de récupérer les données de l'entreprise`;
        console.error(errorMsg);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les informations de l'entreprise."
        });
        setIsFetching(false);
        return;
      }
      
      const data = await response.json();
      
      // Remplir le formulaire avec les données existantes
      if (data.company) {
        const company = data.company;
        form.reset({
          name: company.name,
          siret: company.siret,
          address: company.address,
          postalCode: company.postalCode,
          city: company.city,
          country: company.country || "France",
          activityCode: company.activityCode || "",
          urssafNumber: company.urssafNumber || "",
          legalForm: company.legalForm || "SARL",
          vatNumber: company.vatNumber || "",
          phoneNumber: company.phoneNumber || "",
          email: company.email || "",
          website: company.website || "",
          legalRepresentative: company.legalRepresentative || "",
          legalRepresentativeRole: company.legalRepresentativeRole || "",
        });
      }
    } catch (err) {
      console.error("Erreur:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les informations de l'entreprise."
      });
    } finally {
      setIsFetching(false);
    }
  }

  async function onSubmit(data: CompanyFormValues) {
    setIsLoading(true);
    
    // Trim all string fields to remove leading/trailing whitespace
    Object.keys(data).forEach(key => {
      if (typeof data[key as keyof CompanyFormValues] === 'string') {
        data[key as keyof CompanyFormValues] = (data[key as keyof CompanyFormValues] as string).trim();
      }
    });
    
    console.log("Données soumises:", data);
    
    try {
      const url = isEditMode ? `/api/companies/${companyId}` : "/api/companies";
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMessage = "Une erreur est survenue";
        
        // Tenter d'extraire le message d'erreur JSON si disponible
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            if (errorData.error || errorData.message) {
              errorMessage = errorData.error || errorData.message;
            }
            
            // Si nous avons des erreurs de validation détaillées, les afficher
            if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMessage += ": " + errorData.errors.map((err: { message?: string; path?: string[] }) => 
                err.message || (err.path ? err.path.join('.') : 'Erreur de validation')
              ).join(', ');
            }
          } catch (e) {
            // Ignorer l'erreur de parsing JSON et utiliser le message par défaut
            console.error("Erreur de parsing JSON:", e);
          }
        } else {
          // Utiliser le statut HTTP comme information d'erreur si pas de JSON
          errorMessage = `Erreur ${response.status}: ${response.statusText || 'Erreur serveur'}`;
        }
        
        // Afficher l'erreur dans la console pour le débogage
        console.error("Erreur API:", errorMessage);
        
        // Afficher l'erreur à l'utilisateur
        toast({
          variant: "destructive",
          title: "Erreur",
          description: errorMessage
        });
        
        // Terminer la fonction sans throw pour éviter l'erreur de console
        setIsLoading(false);
        return;
      }

      toast({
        title: isEditMode ? "Entreprise mise à jour" : "Entreprise créée",
        description: isEditMode 
          ? "Les informations de l'entreprise ont été mises à jour avec succès." 
          : "Votre entreprise a été créée avec succès.",
      });

      // Rediriger vers la liste des entreprises
      router.push("/dashboard/companies");
    } catch (err) {
      console.error("Erreur:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err instanceof Error 
          ? err.message 
          : "Une erreur est survenue lors de l'enregistrement de l'entreprise."
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
          {isEditMode ? "Modifier l'entreprise" : "Ajouter une entreprise"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Informations générales</CardTitle>
              <CardDescription>
                Les informations principales de votre entreprise - <span className="text-destructive font-medium">* Champs obligatoires</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raison sociale <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'entreprise" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="siret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SIRET <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="14 chiffres" {...field} />
                      </FormControl>
                      <FormDescription>
                        Format: 14 chiffres sans espaces
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="legalForm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forme juridique</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une forme juridique" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SARL">SARL</SelectItem>
                          <SelectItem value="SAS">SAS</SelectItem>
                          <SelectItem value="SASU">SASU</SelectItem>
                          <SelectItem value="EURL">EURL</SelectItem>
                          <SelectItem value="SA">SA</SelectItem>
                          <SelectItem value="SCI">SCI</SelectItem>
                          <SelectItem value="EI">Entreprise Individuelle</SelectItem>
                          <SelectItem value="EIRL">EIRL</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="activityCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code APE/NAF</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 6201Z" {...field} />
                      </FormControl>
                      <FormDescription>
                        Format: 4 chiffres + 1 lettre
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urssafNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro URSSAF</FormLabel>
                      <FormControl>
                        <Input placeholder="9 chiffres" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="vatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro TVA Intracommunautaire</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: FR12345678901" {...field} />
                    </FormControl>
                    <FormDescription>
                      Format: FR suivi de 11 chiffres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Adresse */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Adresse</CardTitle>
              <CardDescription>
                Adresse du siège social - <span className="text-destructive font-medium">* Champs obligatoires</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Numéro et nom de rue" {...field} />
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
                      <FormLabel>Code postal <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Code postal" {...field} />
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
                      <FormLabel>Ville <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Ville" {...field} />
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
                    <FormLabel>Pays <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Pays" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Contact</CardTitle>
              <CardDescription>
                Les informations de contact de votre entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 0123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@entreprise.fr" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site web</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.entreprise.fr" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Représentant légal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Représentant légal</CardTitle>
              <CardDescription>
                Informations sur le représentant légal de l&apos;entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FormLabel htmlFor="legalRepresentative">Représentant légal</FormLabel>
                  <Input
                    id="legalRepresentative"
                    placeholder="Nom et prénom"
                    {...form.register("legalRepresentative")}
                  />
                </div>
                <div>
                  <FormLabel htmlFor="legalRepresentativeRole">Fonction</FormLabel>
                  <Input
                    id="legalRepresentativeRole"
                    placeholder="Ex: Gérant, Président, etc."
                    {...form.register("legalRepresentativeRole")}
                  />
                </div>
              </div>
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