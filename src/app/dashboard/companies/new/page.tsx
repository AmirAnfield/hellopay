"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createCompany } from "@/services/company-service";
import Link from "next/link";
import { Building, ChevronLeft } from "lucide-react";

// Schéma de validation pour le formulaire d'entreprise
const companyFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  siret: z.string().regex(/^\d{14}$/, {
    message: "Le SIRET doit contenir exactement 14 chiffres.",
  }),
  address: z.string().min(5, {
    message: "L'adresse doit contenir au moins 5 caractères.",
  }),
  postalCode: z.string().regex(/^\d{5}$/, {
    message: "Le code postal doit contenir exactement 5 chiffres.",
  }),
  city: z.string().min(2, {
    message: "La ville doit contenir au moins 2 caractères.",
  }),
  country: z.string().default("France"),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }).optional().or(z.literal('')),
  phoneNumber: z.string().optional().or(z.literal('')),
  activityCode: z.string().optional().or(z.literal('')),
  urssafNumber: z.string().optional().or(z.literal('')),
  legalForm: z.string().optional().or(z.literal('')),
});

export default function NewCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Initialiser le formulaire
  const form = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      siret: "",
      address: "",
      postalCode: "",
      city: "",
      country: "France",
      email: "",
      phoneNumber: "",
      activityCode: "",
      urssafNumber: "",
      legalForm: "",
    },
  });
  
  // Fonction pour soumettre le formulaire
  const onSubmit = async (values: z.infer<typeof companyFormSchema>) => {
    setLoading(true);
    try {
      console.log("Soumission du formulaire:", values);
      
      // Créer l'entreprise dans Firestore
      const companyId = await createCompany(values);
      
      toast.success("Entreprise créée avec succès");
      
      // Rediriger vers la page de détails de l'entreprise
      router.push(`/dashboard/companies/${companyId}`);
    } catch (error) {
      console.error("Erreur détaillée lors de la création de l'entreprise:", error);
      
      let errorMessage = "Une erreur est survenue lors de la création de l'entreprise";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        // Afficher un message plus convivial pour les erreurs de validation
        if (errorMessage.includes("Validation failed")) {
          errorMessage = errorMessage.replace("Validation failed: ", "");
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center space-x-2 mb-6">
        <Link 
          href="/dashboard" 
          className="flex items-center text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour au tableau de bord
        </Link>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-primary/10 p-2 rounded-full">
          <Building className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Ajouter une entreprise</h1>
          <p className="text-gray-500">Renseignez les informations de votre entreprise</p>
        </div>
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>
            Saisissez les informations de base de votre entreprise. Les champs marqués d&apos;un astérisque (*) sont obligatoires.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raison sociale *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'entreprise" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="siret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SIRET *</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901234" {...field} />
                      </FormControl>
                      <FormDescription>
                        14 chiffres sans espaces
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Adresse *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 rue du Commerce" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code postal *</FormLabel>
                      <FormControl>
                        <Input placeholder="75001" {...field} />
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
                      <FormLabel>Ville *</FormLabel>
                      <FormControl>
                        <Input placeholder="Paris" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays *</FormLabel>
                      <FormControl>
                        <Input placeholder="France" {...field} />
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
                        <Input placeholder="contact@entreprise.fr" {...field} />
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
                        <Input placeholder="01 23 45 67 89" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="activityCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code APE/NAF</FormLabel>
                      <FormControl>
                        <Input placeholder="1234Z" {...field} />
                      </FormControl>
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
                        <Input placeholder="123456789" {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input placeholder="SARL, SAS, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end pt-4 space-x-4">
                <Button variant="outline" type="button" onClick={() => router.push('/dashboard')}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Création en cours..." : "Créer l'entreprise"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 