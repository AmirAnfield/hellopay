"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, File, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Contract } from "./ContractTable";

// Type de données pour l'entreprise
interface Company {
  id: string;
  name: string;
}

// Validation du formulaire avec Zod
const formSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  status: z.enum(["draft", "active", "terminated", "expired"]),
  contractType: z.enum(["employment", "service", "nda", "partnership", "other"]),
  startDate: z.date({ required_error: "La date de début est requise" }),
  endDate: z.date().optional().nullable(),
  companyId: z.string({ required_error: "L'entreprise est requise" }),
  counterpartyName: z.string().optional().nullable(),
  counterpartyEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  tags: z.string().optional().nullable(),
});

interface ContractFormProps {
  onSubmit: (formData: FormData) => void;
  initialData?: Contract | null;
  companies?: Company[];
  formId?: string;
  isEdit?: boolean;
}

export default function ContractForm({
  onSubmit,
  initialData,
  companies = [],
  formId = "contract-form",
  isEdit = false,
}: ContractFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Configuration du formulaire avec react-hook-form et zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      reference: initialData?.reference || "",
      status: (initialData?.status as any) || "draft",
      contractType: (initialData?.contractType as any) || "service",
      startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
      endDate: initialData?.endDate ? new Date(initialData.endDate) : null,
      companyId: initialData?.companyId || "",
      counterpartyName: initialData?.counterpartyName || "",
      counterpartyEmail: initialData?.counterpartyEmail || "",
      tags: initialData?.tags || "",
    },
  });

  // Gestion du téléchargement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFileError(null);

    if (selectedFile) {
      // Vérifier la taille du fichier (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setFileError("Le fichier ne doit pas dépasser 10MB");
        setFile(null);
        return;
      }

      // Vérifier le type de fichier
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setFileError("Seuls les fichiers PDF, DOC et DOCX sont acceptés");
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  // Supprimer le fichier sélectionné
  const removeFile = () => {
    setFile(null);
    setFileError(null);
  };

  // Soumettre le formulaire
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // Si c'est un nouveau contrat, un fichier est obligatoire
      if (!isEdit && !file) {
        setFileError("Le contrat doit avoir un fichier joint");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();

      // Ajouter toutes les valeurs du formulaire
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      // Ajouter le fichier s'il existe
      if (file) {
        formData.append("file", file);
      }

      // Appeler la fonction de soumission
      await onSubmit(formData);
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données initiales
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        reference: initialData.reference || "",
        status: (initialData.status as any) || "draft",
        contractType: (initialData.contractType as any) || "service",
        startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
        endDate: initialData.endDate ? new Date(initialData.endDate) : null,
        companyId: initialData.companyId || "",
        counterpartyName: initialData.counterpartyName || "",
        counterpartyEmail: initialData.counterpartyEmail || "",
        tags: initialData.tags || "",
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informations principales */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Titre du contrat" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description du contrat"
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence</FormLabel>
                  <FormControl>
                    <Input placeholder="Numéro de référence" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Tags séparés par des virgules"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ex: commercial, confidentiel, urgent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Statut et type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut <span className="text-destructive">*</span></FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contractType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de contrat <span className="text-destructive">*</span></FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="employment">Contrat de travail</SelectItem>
                    <SelectItem value="service">Contrat de service</SelectItem>
                    <SelectItem value="nda">Accord de confidentialité</SelectItem>
                    <SelectItem value="partnership">Partenariat</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de début <span className="text-destructive">*</span></FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd MMMM yyyy", { locale: fr })
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
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd MMMM yyyy", { locale: fr })
                        ) : (
                          <span>Non spécifiée</span>
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
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Entreprise */}
        <FormField
          control={form.control}
          name="companyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entreprise <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une entreprise" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Partie prenante */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="counterpartyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la partie prenante</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du contact" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="counterpartyEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email de la partie prenante</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Email du contact"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Téléchargement de fichier */}
        <div className="space-y-2">
          <FormLabel>
            Document du contrat
            {!isEdit && <span className="text-destructive"> *</span>}
          </FormLabel>

          {!file && !initialData?.fileUrl ? (
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center">
              <input
                id="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium mb-1">
                  Cliquer pour télécharger
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  PDF, DOC, DOCX jusqu&apos;à 10MB
                </p>
              </label>
            </div>
          ) : (
            <div className="flex items-center p-3 border rounded-md bg-muted/50">
              <div className="mr-3">
                <File className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {file ? file.name : initialData?.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {file
                    ? (file.size / 1024 / 1024).toFixed(2) + " MB"
                    : initialData?.fileSize
                    ? (initialData.fileSize / 1024 / 1024).toFixed(2) + " MB"
                    : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={removeFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {fileError && (
            <p className="text-sm font-medium text-destructive mt-2">
              {fileError}
            </p>
          )}

          {isEdit && !file && initialData?.fileUrl && (
            <p className="text-xs text-muted-foreground mt-2">
              Laisser vide pour conserver le fichier actuel.
            </p>
          )}
        </div>
      </form>
    </Form>
  );
}