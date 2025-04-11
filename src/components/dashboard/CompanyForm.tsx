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
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";

// Schéma de validation avec Zod
const companyFormSchema = z.object({
  // Champs obligatoires - exactement comme dans src/lib/validators/companies.ts
  name: z.string()
    .min(2, "La raison sociale doit comporter au moins 2 caractères")
    .trim(),
  
  siret: z.string()
    .min(5, "Le SIRET doit comporter au moins 5 caractères")
    .max(14, "Le SIRET ne peut pas dépasser 14 caractères")
    .trim(),
  
  address: z.string()
    .min(2, "L'adresse doit comporter au moins 2 caractères")
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
  apeCode: z.string().optional(),
  urssafRegion: z.string().optional(),
  collectiveAgreement: z.string().optional(),
  legalForm: z.string().default("SARL").optional(),
  vatNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
  // Email est optionnel mais s'il est fourni, il doit être valide
  email: z.union([
    z.string().email("Format d'email invalide"),
    z.string().length(0)
  ]).optional(),
  website: z.string().optional(),
  legalFirstName: z.string().optional(),
  legalLastName: z.string().optional(),
  legalRepresentativeRole: z.string().optional(),
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
      apeCode: "",
      urssafRegion: "",
      collectiveAgreement: "",
      legalForm: "SARL",
      vatNumber: "",
      phoneNumber: "",
      email: "",
      website: "",
      legalFirstName: "",
      legalLastName: "",
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
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }

      const userId = auth.currentUser.uid;
      const companyDocRef = doc(db, `users/${userId}/companies/${companyId}`);
      const companySnapshot = await getDoc(companyDocRef);
      
      if (companySnapshot.exists()) {
        const companyData = companySnapshot.data();
        
        // Vérifier si l'entreprise est verrouillée
        if (companyData.isLocked) {
        toast({
            title: "Accès refusé",
            description: "Cette entreprise est verrouillée et ne peut pas être modifiée.",
          variant: "destructive",
            duration: 5000,
        });
          
          // Rediriger vers la liste des entreprises
          setTimeout(() => {
            router.push("/dashboard/companies");
          }, 1500);
        setIsFetching(false);
        return;
      }
      
      // Remplir le formulaire avec les données existantes
        form.reset({
          name: companyData.name || "",
          siret: companyData.siret || "",
          address: companyData.address || "",
          postalCode: companyData.postalCode || "",
          city: companyData.city || "",
          country: companyData.country || "France",
          apeCode: companyData.apeCode || "",
          urssafRegion: companyData.urssafRegion || "",
          collectiveAgreement: companyData.collectiveAgreement || "",
          legalForm: companyData.legalForm || "SARL",
          vatNumber: companyData.vatNumber || "",
          phoneNumber: companyData.phoneNumber || "",
          email: companyData.email || "",
          website: companyData.website || "",
          legalFirstName: companyData.legalFirstName || "",
          legalLastName: companyData.legalLastName || "",
          legalRepresentativeRole: companyData.legalRepresentativeRole || "",
        });
        
        setIsFetching(false);
        return;
      }
      
      // Si l'entreprise n'existe pas
      throw new Error("Cette entreprise n'existe pas");
    } catch (err) {
      console.error("Erreur:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err instanceof Error 
          ? err.message 
          : "Une erreur est survenue lors de la récupération des informations de l'entreprise."
      });
      
      // Rediriger vers la liste des entreprises
      setTimeout(() => {
        router.push("/dashboard/companies");
      }, 2000);
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
    
    // Ajouter 'https://' au début de l'URL du site web si ce n'est pas déjà le cas
    if (data.website && data.website.trim() !== '' && !data.website.startsWith('http')) {
      data.website = `https://${data.website}`;
    }
    
    // Combiner prénom et nom pour le représentant légal pour la compatibilité avec d'autres parties de l'application
    const legalRepresentative = data.legalFirstName && data.legalLastName 
      ? `${data.legalFirstName} ${data.legalLastName}`
      : '';
    
    
    try {
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié");
      }

      const userId = auth.currentUser.uid;
      
      if (isEditMode) {
        // Mettre à jour l'entreprise existante
        const companyRef = doc(db, `users/${userId}/companies/${companyId}`);
        await updateDoc(companyRef, {
          ...data,
          legalRepresentative, // Ajouter le champ combiné pour la compatibilité
          updatedAt: serverTimestamp()
        });
        
        // Notification de succès - plus visible
        toast({
          title: "Entreprise mise à jour",
          description: `Les informations de l'entreprise "${data.name}" ont été mises à jour avec succès.`,
          variant: "default",
        });
        
        // Redirection avec paramètres pour afficher une notification sur la page de destination
        setTimeout(() => {
          router.push(`/dashboard/companies?action=updated&name=${encodeURIComponent(data.name)}`);
        }, 1000);
      } else {
        // Créer une nouvelle entreprise
        const companiesRef = collection(db, `users/${userId}/companies`);
        await addDoc(companiesRef, {
          ...data,
          legalRepresentative, // Ajouter le champ combiné pour la compatibilité
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ownerId: userId
        });
        
        // Notification de succès
        toast({
          title: "Entreprise créée",
          description: `L'entreprise "${data.name}" a été créée avec succès.`,
          variant: "default",
        });
        
        // Rediriger vers la liste des entreprises avec paramètres pour notification
        setTimeout(() => {
          router.push(`/dashboard/companies?action=created&name=${encodeURIComponent(data.name)}`);
        }, 1000);
      }
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
                        <Input placeholder="5 à 14 chiffres" {...field} />
                      </FormControl>
                      <FormDescription>
                        Format: 5 à 14 chiffres sans espaces
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
                          <SelectItem value="SNC">SNC</SelectItem>
                          <SelectItem value="Micro-entreprise">Micro-entreprise</SelectItem>
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
                  name="apeCode"
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
                  name="urssafRegion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URSSAF Région</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 12" {...field} />
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

              <FormField
                control={form.control}
                name="collectiveAgreement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Convention Collective</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Convention Collective Nationale des Bureaux d'Études Techniques" {...field} />
                    </FormControl>
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
                      <Input 
                        placeholder="www.entreprise.fr" 
                        value={field.value || ''} 
                        onChange={(e) => {
                          // Supprime automatiquement les préfixes http:// ou https:// lors de la saisie
                          const value = e.target.value.replace(/^https?:\/\//, '');
                          field.onChange(value);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription>
                      Le préfixe https:// sera automatiquement ajouté
                    </FormDescription>
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
                  <FormLabel htmlFor="legalFirstName">Prénom</FormLabel>
                  <Input
                    id="legalFirstName"
                    placeholder="Prénom"
                    {...form.register("legalFirstName")}
                  />
                </div>
                <div>
                  <FormLabel htmlFor="legalLastName">Nom</FormLabel>
                  <Input
                    id="legalLastName"
                    placeholder="Nom"
                    {...form.register("legalLastName")}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="legalRepresentativeRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fonction</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Gérant, Président, etc." {...field} />
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