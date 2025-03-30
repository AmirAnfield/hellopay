"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarIcon, FileUp, Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Interface pour les entreprises de l'utilisateur
interface Company {
  id: string;
  name: string;
  siret: string;
}

// Schéma de validation pour le formulaire de contrat
const contractFormSchema = z.object({
  title: z.string().min(2, "Le titre doit comporter au moins 2 caractères"),
  companyId: z.string().min(1, "Veuillez sélectionner une entreprise"),
  contractType: z.string().min(1, "Veuillez sélectionner un type de contrat"),
  status: z.string().default("draft"),
  startDate: z.date({ required_error: "Veuillez sélectionner une date de début" }),
  endDate: z.date().optional().nullable(),
  description: z.string().optional(),
  reference: z.string().optional(),
  tags: z.string().optional(),
  counterpartyName: z.string().optional(),
  counterpartyEmail: z.string().email("Format d'email invalide").optional().or(z.literal('')),
  // Fichier de contrat (simulé pour l'instant)
  fileUrl: z.string().min(1, "Un fichier est requis"),
  fileName: z.string().min(1, "Un nom de fichier est requis"),
  fileSize: z.number().positive("La taille du fichier doit être positive")
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

export default function NewContractPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Configurer le formulaire avec les valeurs par défaut
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      title: "",
      companyId: "",
      contractType: "",
      status: "draft",
      description: "",
      reference: "",
      tags: "",
      counterpartyName: "",
      counterpartyEmail: "",
      // Fichier (sera rempli par le sélecteur de fichier)
      fileUrl: "",
      fileName: "",
      fileSize: 0
    }
  });

  // Charger les entreprises de l'utilisateur
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("/api/companies?limit=100");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des entreprises");
        }
        const result = await response.json();
        if (result.success && result.data) {
          setCompanies(result.data);
        } else {
          toast({
            title: "Erreur",
            description: result.message || "Impossible de charger les entreprises",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des entreprises:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les entreprises. Veuillez réessayer plus tard.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  // Gestionnaire pour le changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Simuler l'URL du fichier uploadé (en production, ce serait une URL de Supabase/S3)
      const mockFileUrl = `https://storage.example.com/contracts/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      
      // Mettre à jour le formulaire
      form.setValue("fileName", file.name);
      form.setValue("fileSize", file.size);
      form.setValue("fileUrl", mockFileUrl);
      
      // Déclencher la validation
      form.trigger(["fileName", "fileSize", "fileUrl"]);
    }
  };

  // Gestionnaire pour la soumission du formulaire
  const onSubmit = async (data: ContractFormValues) => {
    setIsSubmitting(true);
    try {
      // En production, on uploadrait d'abord le fichier vers un stockage cloud
      // puis on utiliserait l'URL retournée. Ici on simule cet upload.
      
      // Préparation des données pour l'API
      const contractData = {
        ...data,
        // Convertir les dates en ISO format
        startDate: data.startDate.toISOString(),
        endDate: data.endDate ? data.endDate.toISOString() : null,
      };
      
      // Soumettre à l'API
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(contractData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Afficher un toast de succès
        toast({
          title: "Contrat créé",
          description: "Le contrat a été créé avec succès"
        });
        
        // Rediriger vers la liste des contrats
        router.push("/dashboard/contracts");
      } else {
        // Afficher un toast d'erreur
        toast({
          title: "Erreur",
          description: result.message || "Une erreur est survenue lors de la création du contrat",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création du contrat:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du contrat. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard/contracts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Nouveau contrat</h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Titre du contrat */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre du contrat*</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Contrat de travail - John Doe" {...field} />
                </FormControl>
                <FormDescription>
                  Donnez un titre clair et descriptif à votre contrat
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Sélection d'entreprise */}
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entreprise concernée*</FormLabel>
                <Select
                  disabled={isLoadingCompanies}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une entreprise" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingCompanies ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Chargement...
                      </div>
                    ) : companies.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Aucune entreprise trouvée</p>
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/dashboard/companies/new">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Créer une entreprise
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  L'entreprise associée à ce contrat
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Type de contrat */}
          <FormField
            control={form.control}
            name="contractType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de contrat*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type de contrat" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="employment">Contrat de travail</SelectItem>
                    <SelectItem value="service">Contrat de service</SelectItem>
                    <SelectItem value="nda">Accord de confidentialité (NDA)</SelectItem>
                    <SelectItem value="partnership">Contrat de partenariat</SelectItem>
                    <SelectItem value="other">Autre type de contrat</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Catégorie juridique du contrat
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Statut */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="terminated">Résilié</SelectItem>
                    <SelectItem value="expired">Expiré</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  État actuel du contrat
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Date de début */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de début*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={(date) => date < new Date("1900-01-01")}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Date de prise d'effet du contrat
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Date de fin (optionnelle) */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de fin (optionnelle)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy", { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={(date) => {
                        const startDate = form.getValues("startDate");
                        return date < (startDate || new Date("1900-01-01"));
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Date d'expiration du contrat (laisser vide pour les CDI ou contrats sans échéance)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Upload de fichier */}
          <FormItem>
            <FormLabel>Fichier du contrat*</FormLabel>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-zinc-800 dark:bg-zinc-900 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              
              {/* Prévisualisation du fichier */}
              {selectedFile && (
                <div className="flex items-center p-2 mt-2 border rounded-md bg-muted/50">
                  <div className="mr-2">
                    <FileUp className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <FormDescription>
              Téléchargez le document PDF du contrat
            </FormDescription>
            {form.formState.errors.fileUrl && (
              <p className="text-sm font-medium text-destructive mt-2">
                {form.formState.errors.fileUrl.message}
              </p>
            )}
          </FormItem>
          
          {/* Description (facultative) */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (facultative)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez brièvement ce contrat..."
                    className="resize-y"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Une brève description des termes ou de l'objet du contrat
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Référence (facultative) */}
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Référence (facultative)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: CONT-2023-001" {...field} />
                </FormControl>
                <FormDescription>
                  Numéro ou code de référence interne pour ce contrat
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Tags (facultatifs) */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (facultatifs)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: urgent, juridique, projet-alpha" {...field} />
                </FormControl>
                <FormDescription>
                  Mots-clés séparés par des virgules pour faciliter la recherche
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Section pour la partie prenante */}
          <div className="space-y-4 pt-2 border-t">
            <h3 className="text-lg font-medium">Partie prenante (facultatif)</h3>
            
            {/* Nom de la partie prenante */}
            <FormField
              control={form.control}
              name="counterpartyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la partie prenante</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: John Doe, Acme Corp" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nom de l'autre partie impliquée dans ce contrat
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Email de la partie prenante */}
            <FormField
              control={form.control}
              name="counterpartyEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de la partie prenante</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: john@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    Adresse email de contact de l'autre partie
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Boutons de soumission */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/contracts")}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le contrat
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 