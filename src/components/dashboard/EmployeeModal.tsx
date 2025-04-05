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
import { collection, getDocs } from "firebase/firestore";

// Schéma de validation pour le formulaire employé
const employeeFormSchema = z.object({
  firstName: z.string()
    .min(2, "Le prénom doit comporter au moins 2 caractères")
    .trim(),
  
  lastName: z.string()
    .min(2, "Le nom doit comporter au moins 2 caractères")
    .trim(),
  
  email: z.string()
    .email("Adresse email invalide")
    .trim(),
  
  phone: z.string()
    .min(10, "Le numéro de téléphone doit comporter au moins 10 caractères")
    .trim(),
  
  address: z.string()
    .min(5, "L'adresse doit comporter au moins 5 caractères")
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

  socialSecurityNumber: z.string()
    .min(13, "Le numéro de sécurité sociale doit comporter au moins 13 caractères")
    .max(15, "Le numéro de sécurité sociale ne peut pas dépasser 15 caractères")
    .trim(),
  
  iban: z.string()
    .min(15, "L'IBAN doit comporter au moins 15 caractères")
    .trim(),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

interface EmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeCreated?: () => void;
}

// Fonction pour masquer l'IBAN
function maskIban(iban: string): string {
  if (!iban || iban.length < 10) return iban;
  
  // Garder les 4 premiers et les 4 derniers caractères visibles
  const firstFour = iban.slice(0, 4);
  const lastFour = iban.slice(-4);
  const middle = iban.slice(4, -4).replace(/./g, '*');
  
  return `${firstFour}${middle}${lastFour}`;
}

export default function EmployeeModal({ open, onOpenChange, onEmployeeCreated }: EmployeeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { showNotification } = useNotification();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      addressComplement: "",
      city: "",
      postalCode: "",
      socialSecurityNumber: "",
      iban: "",
    },
  });

  async function onSubmit(data: EmployeeFormValues) {
    if (!user || !user.uid) {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour créer un employé."
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Créer un ID unique pour le nouvel employé
      const employeeId = `employee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Récupérer la première entreprise de l'utilisateur (si disponible)
      let firstCompanyId = "";
      try {
        const companiesRef = collection(db, `users/${user.uid}/companies`);
        const companiesSnapshot = await getDocs(companiesRef);
        if (!companiesSnapshot.empty) {
          firstCompanyId = companiesSnapshot.docs[0].id;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des entreprises:", error);
      }
      
      // Ajouter des champs supplémentaires
      const employeeData = {
        ...data,
        id: employeeId,
        country: "France",
        companyId: firstCompanyId, // Assigner l'ID de la première entreprise
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.uid
      };
      
      // Sauvegarder dans Firestore
      const employeeRef = doc(db, `users/${user.uid}/employees`, employeeId);
      await setDoc(employeeRef, employeeData);
      
      // Toast standard
      toast({
        title: "Employé créé",
        description: "L'employé a été créé avec succès."
      });
      
      // Notification dans la barre de navigation
      showNotification(
        "Employé créé avec succès",
        `L'employé ${data.firstName} ${data.lastName} a été ajouté à votre compte.`,
        "success",
        20000 // 20 secondes
      );
      
      // Réinitialiser le formulaire
      form.reset();
      
      // Fermer la modale
      onOpenChange(false);
      
      // Callback pour informer le parent que l'employé a été créé
      if (onEmployeeCreated) {
        onEmployeeCreated();
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'employé:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer l'employé. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-2 bg-muted/30">
          <DialogTitle className="text-xl">Créer un nouvel employé</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour ajouter un nouvel employé.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 pt-2 space-y-1">
            <Accordion type="single" collapsible defaultValue="personal-info" className="space-y-4">
              <AccordionItem value="personal-info" className="border rounded-md overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 font-medium text-sm">
                  Informations personnelles
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="firstName"
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
                      name="lastName"
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@exemple.com" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Téléphone *</FormLabel>
                          <FormControl>
                            <Input placeholder="Numéro de téléphone" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
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
                            placeholder="Bâtiment, étage, etc." 
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
              
              <AccordionItem value="banking-info" className="border rounded-md overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 font-medium text-sm">
                  Informations bancaires et administratives
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2 space-y-3">
                  <FormField
                    control={form.control}
                    name="socialSecurityNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Numéro de sécurité sociale *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: 1 89 05 75 120 005 42" 
                            {...field} 
                            className="h-9" 
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="iban"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">IBAN *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" 
                            {...field} 
                            className="h-9" 
                            onChange={(e) => {
                              // Garder la valeur complète dans le champ form
                              field.onChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground mt-1">
                          {field.value ? (
                            <>IBAN masqué : {maskIban(field.value)}</>
                          ) : (
                            <>Exemple : FR76 1234 5678 9123 4567 8912 345</>
                          )}
                        </div>
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
                  "Créer l'employé"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 