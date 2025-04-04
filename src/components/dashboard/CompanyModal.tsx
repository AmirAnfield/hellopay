"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2 } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNotification } from "@/components/ui/notification-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schéma de validation avec Zod - version simplifiée
const companyFormSchema = z.object({
  name: z.string()
    .min(2, "La raison sociale doit comporter au moins 2 caractères")
    .trim(),
  
  siret: z.string()
    .min(5, "Le SIRET doit comporter au moins 5 caractères")
    .max(14, "Le SIRET ne peut pas dépasser 14 caractères")
    .trim(),
  
  legalForm: z.string()
    .min(1, "La forme juridique est requise")
    .default("SARL"),
  
  address: z.string()
    .min(2, "L'adresse doit comporter au moins 2 caractères")
    .trim(),
  
  addressComplement: z.string()
    .optional()
    .nullable()
    .transform(val => val === null ? "" : val),
  
  city: z.string()
    .min(2, "La ville doit comporter au moins 2 caractères")
    .trim(),
  
  postalCode: z.string()
    .min(2, "Le code postal doit comporter au moins 2 caractères")
    .trim(),
  
  apeCode: z.string()
    .min(2, "Le code APE doit comporter au moins 2 caractères")
    .trim(),
  
  urssafRegion: z.string()
    .min(2, "La région URSSAF est requise")
    .trim(),
  
  collectiveAgreement: z.string()
    .min(2, "La convention collective est requise")
    .trim(),
  
  legalFirstName: z.string()
    .min(2, "Le prénom du représentant légal est requis")
    .trim(),
  
  legalLastName: z.string()
    .min(2, "Le nom du représentant légal est requis")
    .trim(),
  
  legalRepresentativeRole: z.string()
    .min(2, "La fonction du représentant légal est requise")
    .trim(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

interface CompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyCreated?: () => void;
}

export default function CompanyModal({ open, onOpenChange, onCompanyCreated }: CompanyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { showNotification } = useNotification();

  // Initialiser le formulaire avec des valeurs par défaut
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      siret: "",
      legalForm: "SARL",
      address: "",
      addressComplement: "",
      postalCode: "",
      city: "",
      apeCode: "",
      urssafRegion: "",
      collectiveAgreement: "",
      legalFirstName: "",
      legalLastName: "",
      legalRepresentativeRole: "",
    },
  });

  async function onSubmit(data: CompanyFormValues) {
    console.log("Fonction onSubmit appelée avec les données:", data);
    
    if (!user || !user.uid) {
      console.error("Erreur d'authentification: Utilisateur non connecté");
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour créer une entreprise."
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Créer un ID unique pour la nouvelle entreprise
      const companyId = `company-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Construire le nom complet du représentant légal
      const legalRepresentative = `${data.legalFirstName} ${data.legalLastName}`;
      
      // Ajouter des champs supplémentaires
      const companyData = {
        ...data,
        id: companyId,
        legalRepresentative, // Ajouter le champ combiné pour la compatibilité
        country: "France",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.uid
      };
      
      console.log("Tentative de sauvegarde de l'entreprise:", companyId);
      
      try {
        // Sauvegarder dans Firestore
        const companyRef = doc(db, `users/${user.uid}/companies`, companyId);
        await setDoc(companyRef, companyData);
        console.log("Entreprise créée avec succès:", companyId);
        
        // Toast standard (moins visible)
        toast({
          title: "Entreprise créée",
          description: "L'entreprise a été créée avec succès."
        });
        
        // Notification dans la barre de navigation (plus visible)
        showNotification(
          "Entreprise créée avec succès",
          `L'entreprise "${data.name}" a été ajoutée à votre compte.`,
          "success",
          20000 // 20 secondes
        );
        
        // Réinitialiser le formulaire
        form.reset();
        
        // Fermer la modale
        onOpenChange(false);
        
        // Callback pour informer le parent que l'entreprise a été créée
        if (onCompanyCreated) {
          onCompanyCreated();
        }
      } catch (firestoreError) {
        console.error("Erreur Firestore spécifique:", firestoreError);
        toast({
          variant: "destructive",
          title: "Erreur de base de données",
          description: `Erreur lors de la sauvegarde: ${firestoreError.message || "Erreur inconnue"}`
        });
      }
    } catch (error: any) {
      console.error("Erreur lors de la création de l'entreprise:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de créer l'entreprise: ${error.message || "Erreur inconnue"}`
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-2 bg-muted/30">
          <DialogTitle className="text-xl">Créer une nouvelle entreprise</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour ajouter une nouvelle entreprise.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form 
            onSubmit={(e) => {
              console.log("Formulaire soumis - Event:", e);
              form.handleSubmit(onSubmit)(e);
            }} 
            className="p-6 pt-2 space-y-1"
          >
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mb-4"
              onClick={() => {
                // Remplir avec des données de test
                form.reset({
                  name: "Entreprise Test",
                  siret: "12345678901234",
                  legalForm: "SARL",
                  address: "123 Rue de Test",
                  addressComplement: "Étage 2",
                  postalCode: "75001",
                  city: "Paris",
                  apeCode: "6201Z",
                  urssafRegion: "Île-de-France",
                  collectiveAgreement: "Syntec",
                  legalFirstName: "Jean",
                  legalLastName: "Dupont",
                  legalRepresentativeRole: "Gérant"
                });
                console.log("Données de test chargées");
              }}
            >
              Remplir avec des données de test
            </Button>
            
            <Accordion type="single" collapsible defaultValue="company-info" className="space-y-4">
              <AccordionItem value="company-info" className="border rounded-md overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 font-medium text-sm">
                  Informations de l&apos;entreprise
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Raison sociale *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom de l&apos;entreprise" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="siret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">SIRET *</FormLabel>
                          <FormControl>
                            <Input placeholder="5 à 14 chiffres" {...field} className="h-9" />
                          </FormControl>
                          <FormDescription className="text-[10px]">
                            Format : 5 à 14 chiffres sans espaces
                          </FormDescription>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="legalForm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Forme juridique *</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Sélectionner" />
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
                              <SelectItem value="SNC">SNC</SelectItem>
                              <SelectItem value="Micro-entreprise">Micro-entreprise</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="apeCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Code APE *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 6201Z" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="collectiveAgreement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Convention collective *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Syntec, Commerce de détail..." {...field} className="h-9" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="urssafRegion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Région URSSAF *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Île-de-France, PACA..." {...field} className="h-9" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="address-info" className="border rounded-md overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 font-medium text-sm">
                  Adresse
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2 space-y-3">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Adresse *</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse principale" {...field} className="h-9" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="addressComplement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Complément d&apos;adresse</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Complément d&apos;adresse" 
                            {...field} 
                            value={field.value || ""}
                            className="h-9" 
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Code postal *</FormLabel>
                          <FormControl>
                            <Input placeholder="Code postal" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Ville *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ville" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="legal-info" className="border rounded-md overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 font-medium text-sm">
                  Représentant légal
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="legalFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Prénom" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="legalLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nom" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="legalRepresentativeRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Fonction *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Gérant, Président..." {...field} className="h-9" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <DialogFooter className="pt-4 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="h-9"
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading} className="h-9">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer l'entreprise"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 