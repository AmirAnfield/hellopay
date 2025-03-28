"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, FileText, ArrowLeft } from "lucide-react";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

// Schéma de validation pour le formulaire
const payslipSchema = z.object({
  // Informations employeur
  employerName: z.string().min(1, { message: "Le nom de l'entreprise est requis" }),
  employerAddress: z.string().min(1, { message: "L'adresse est requise" }),
  employerSiret: z.string().min(14).max(14, { message: "Le SIRET doit contenir 14 chiffres" }),
  employerUrssaf: z.string().min(1, { message: "Le numéro URSSAF est requis" }),
  
  // Informations salarié
  employeeName: z.string().min(1, { message: "Le nom du salarié est requis" }),
  employeeAddress: z.string().min(1, { message: "L'adresse du salarié est requise" }),
  employeePosition: z.string().min(1, { message: "Le poste du salarié est requis" }),
  employeeSocialSecurityNumber: z.string().min(15).max(15, { message: "Le numéro de sécurité sociale doit contenir 15 chiffres" }),
  isExecutive: z.boolean().optional(),
  
  // Période
  periodMonth: z.string().min(1, { message: "Le mois est requis" }),
  periodYear: z.string().min(4).max(4, { message: "L'année est requise" }),
  
  // Rémunération
  hourlyRate: z.string().min(1, { message: "Le taux horaire est requis" }),
  hoursWorked: z.string().min(1, { message: "Les heures travaillées sont requises" }),
  
  // Congés payés
  paidLeaveAcquired: z.string().optional(),
  paidLeaveTaken: z.string().optional(),
  paidLeaveRemaining: z.string().optional(),
});

type PayslipFormValues = z.infer<typeof payslipSchema>;

export default function NewPayslipPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PayslipFormValues>({
    resolver: zodResolver(payslipSchema),
    defaultValues: {
      employerName: "",
      employerAddress: "",
      employerSiret: "",
      employerUrssaf: "",
      employeeName: "",
      employeeAddress: "",
      employeePosition: "",
      employeeSocialSecurityNumber: "",
      isExecutive: false,
      periodMonth: new Date().getMonth() + 1 + "",
      periodYear: new Date().getFullYear() + "",
      hourlyRate: "11.27",
      hoursWorked: "151.67",
      paidLeaveAcquired: "2.5",
      paidLeaveTaken: "0",
      paidLeaveRemaining: "0",
    },
  });

  // Calculs automatiques
  const hourlyRate = parseFloat(watch("hourlyRate") || "0");
  const hoursWorked = parseFloat(watch("hoursWorked") || "0");
  const grossSalary = hourlyRate * hoursWorked;
  const employeeContributions = grossSalary * 0.22; // Environ 22% de cotisations salariales
  const employerContributions = grossSalary * 0.42; // Environ 42% de cotisations patronales
  const netSalary = grossSalary - employeeContributions;
  const employerCost = grossSalary + employerContributions;

  const onSubmit = async (data: PayslipFormValues) => {
    setIsLoading(true);

    try {
      // Préparer les données à envoyer à l'API
      const payslipData = {
        ...data,
        grossSalary,
        netSalary,
        employeeContributions,
        employerContributions,
        employerCost,
        periodStart: `${data.periodYear}-${data.periodMonth.padStart(2, '0')}-01`,
        periodEnd: `${data.periodYear}-${data.periodMonth.padStart(2, '0')}-${new Date(parseInt(data.periodYear), parseInt(data.periodMonth), 0).getDate()}`,
        paymentDate: new Date().toISOString().split('T')[0],
        fiscalYear: parseInt(data.periodYear),
      };

      // Appel à l'API pour générer le bulletin
      const response = await fetch("/api/generate-payslip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payslipData),
      });

      if (response.ok) {
        const result = await response.json();
        
        toast({
          title: "Bulletin généré avec succès",
          description: "Votre bulletin de paie a été généré et enregistré.",
        });
        
        // Rediriger vers la page de visualisation du bulletin
        router.push(`/payslips/${result.payslipId}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Une erreur est survenue lors de la génération du bulletin");
      }
    } catch (error) {
      console.error("Erreur lors de la génération du bulletin:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la génération du bulletin",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Nouveau bulletin de paie</h1>
            <p className="text-muted-foreground">
              Remplissez le formulaire pour générer un bulletin de paie
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="employer" className="w-full">
            <TabsList className="mb-6 grid grid-cols-4 w-full">
              <TabsTrigger value="employer">Employeur</TabsTrigger>
              <TabsTrigger value="employee">Salarié</TabsTrigger>
              <TabsTrigger value="salary">Rémunération</TabsTrigger>
              <TabsTrigger value="preview">Aperçu</TabsTrigger>
            </TabsList>
            
            {/* Onglet Employeur */}
            <TabsContent value="employer">
              <Card>
                <CardHeader>
                  <CardTitle>Informations sur l&apos;employeur</CardTitle>
                  <CardDescription>
                    Renseignez les informations de l&apos;entreprise
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employerName">Nom de l&apos;entreprise</Label>
                      <Input
                        id="employerName"
                        {...register("employerName")}
                        placeholder="Raison sociale"
                      />
                      {errors.employerName && (
                        <p className="text-sm text-red-500">{errors.employerName.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employerAddress">Adresse complète</Label>
                      <Input
                        id="employerAddress"
                        {...register("employerAddress")}
                        placeholder="Adresse, code postal, ville"
                      />
                      {errors.employerAddress && (
                        <p className="text-sm text-red-500">{errors.employerAddress.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employerSiret">Numéro SIRET</Label>
                      <Input
                        id="employerSiret"
                        {...register("employerSiret")}
                        placeholder="14 chiffres"
                      />
                      {errors.employerSiret && (
                        <p className="text-sm text-red-500">{errors.employerSiret.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employerUrssaf">Numéro URSSAF</Label>
                      <Input
                        id="employerUrssaf"
                        {...register("employerUrssaf")}
                        placeholder="Numéro URSSAF"
                      />
                      {errors.employerUrssaf && (
                        <p className="text-sm text-red-500">{errors.employerUrssaf.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="button" onClick={() => document.querySelector('[data-value="employee"]')?.click()}>
                    Suivant
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Onglet Salarié */}
            <TabsContent value="employee">
              <Card>
                <CardHeader>
                  <CardTitle>Informations sur le salarié</CardTitle>
                  <CardDescription>
                    Renseignez les informations du salarié
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeName">Nom et prénom du salarié</Label>
                      <Input
                        id="employeeName"
                        {...register("employeeName")}
                        placeholder="Nom complet"
                      />
                      {errors.employeeName && (
                        <p className="text-sm text-red-500">{errors.employeeName.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeAddress">Adresse complète</Label>
                      <Input
                        id="employeeAddress"
                        {...register("employeeAddress")}
                        placeholder="Adresse, code postal, ville"
                      />
                      {errors.employeeAddress && (
                        <p className="text-sm text-red-500">{errors.employeeAddress.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeePosition">Poste occupé</Label>
                      <Input
                        id="employeePosition"
                        {...register("employeePosition")}
                        placeholder="Intitulé du poste"
                      />
                      {errors.employeePosition && (
                        <p className="text-sm text-red-500">{errors.employeePosition.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeSocialSecurityNumber">Numéro de sécurité sociale</Label>
                      <Input
                        id="employeeSocialSecurityNumber"
                        {...register("employeeSocialSecurityNumber")}
                        placeholder="15 chiffres"
                      />
                      {errors.employeeSocialSecurityNumber && (
                        <p className="text-sm text-red-500">{errors.employeeSocialSecurityNumber.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="isExecutive" 
                      {...register("isExecutive")}
                    />
                    <Label htmlFor="isExecutive">Statut cadre</Label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => document.querySelector('[data-value="employer"]')?.click()}>
                    Précédent
                  </Button>
                  <Button type="button" onClick={() => document.querySelector('[data-value="salary"]')?.click()}>
                    Suivant
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Onglet Rémunération */}
            <TabsContent value="salary">
              <Card>
                <CardHeader>
                  <CardTitle>Rémunération et période</CardTitle>
                  <CardDescription>
                    Renseignez les informations de rémunération et la période concernée
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="periodMonth">Mois</Label>
                      <Select
                        onValueChange={(value) => setValue("periodMonth", value)}
                        defaultValue={watch("periodMonth")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le mois" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Janvier</SelectItem>
                          <SelectItem value="2">Février</SelectItem>
                          <SelectItem value="3">Mars</SelectItem>
                          <SelectItem value="4">Avril</SelectItem>
                          <SelectItem value="5">Mai</SelectItem>
                          <SelectItem value="6">Juin</SelectItem>
                          <SelectItem value="7">Juillet</SelectItem>
                          <SelectItem value="8">Août</SelectItem>
                          <SelectItem value="9">Septembre</SelectItem>
                          <SelectItem value="10">Octobre</SelectItem>
                          <SelectItem value="11">Novembre</SelectItem>
                          <SelectItem value="12">Décembre</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.periodMonth && (
                        <p className="text-sm text-red-500">{errors.periodMonth.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="periodYear">Année</Label>
                      <Input
                        id="periodYear"
                        {...register("periodYear")}
                        placeholder="AAAA"
                      />
                      {errors.periodYear && (
                        <p className="text-sm text-red-500">{errors.periodYear.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Taux horaire (€)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        step="0.01"
                        {...register("hourlyRate")}
                      />
                      {errors.hourlyRate && (
                        <p className="text-sm text-red-500">{errors.hourlyRate.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hoursWorked">Heures travaillées</Label>
                      <Input
                        id="hoursWorked"
                        type="number"
                        step="0.01"
                        {...register("hoursWorked")}
                      />
                      {errors.hoursWorked && (
                        <p className="text-sm text-red-500">{errors.hoursWorked.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paidLeaveAcquired">Congés acquis</Label>
                      <Input
                        id="paidLeaveAcquired"
                        type="number"
                        step="0.5"
                        {...register("paidLeaveAcquired")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paidLeaveTaken">Congés pris</Label>
                      <Input
                        id="paidLeaveTaken"
                        type="number"
                        step="0.5"
                        {...register("paidLeaveTaken")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paidLeaveRemaining">Solde congés</Label>
                      <Input
                        id="paidLeaveRemaining"
                        type="number"
                        step="0.5"
                        {...register("paidLeaveRemaining")}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => document.querySelector('[data-value="employee"]')?.click()}>
                    Précédent
                  </Button>
                  <Button type="button" onClick={() => document.querySelector('[data-value="preview"]')?.click()}>
                    Aperçu
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Onglet Aperçu */}
            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu du bulletin</CardTitle>
                  <CardDescription>
                    Vérifiez les informations avant de générer le bulletin de paie
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Employeur</h3>
                        <p className="text-sm">{watch("employerName")}</p>
                        <p className="text-sm">{watch("employerAddress")}</p>
                        <p className="text-sm">SIRET: {watch("employerSiret")}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Salarié</h3>
                        <p className="text-sm">{watch("employeeName")}</p>
                        <p className="text-sm">{watch("employeeAddress")}</p>
                        <p className="text-sm">Poste: {watch("employeePosition")}</p>
                        <p className="text-sm">Statut: {watch("isExecutive") ? "Cadre" : "Non cadre"}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Période</h3>
                        <p className="text-sm">Mois: {
                          ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", 
                           "Août", "Septembre", "Octobre", "Novembre", "Décembre"][parseInt(watch("periodMonth")) - 1]
                        } {watch("periodYear")}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Rémunération</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p>Taux horaire:</p>
                          <p className="text-right">{hourlyRate.toFixed(2)} €</p>
                          
                          <p>Heures travaillées:</p>
                          <p className="text-right">{hoursWorked.toFixed(2)}</p>
                          
                          <p>Salaire brut:</p>
                          <p className="text-right">{grossSalary.toFixed(2)} €</p>
                          
                          <p>Cotisations salariales:</p>
                          <p className="text-right">{employeeContributions.toFixed(2)} €</p>
                          
                          <p className="font-semibold">Salaire net:</p>
                          <p className="text-right font-semibold">{netSalary.toFixed(2)} €</p>
                          
                          <p>Cotisations patronales:</p>
                          <p className="text-right">{employerContributions.toFixed(2)} €</p>
                          
                          <p>Coût total employeur:</p>
                          <p className="text-right">{employerCost.toFixed(2)} €</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Congés payés</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p>Acquis:</p>
                          <p className="text-right">{watch("paidLeaveAcquired")} jours</p>
                          
                          <p>Pris:</p>
                          <p className="text-right">{watch("paidLeaveTaken")} jours</p>
                          
                          <p>Solde:</p>
                          <p className="text-right">{watch("paidLeaveRemaining")} jours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => document.querySelector('[data-value="salary"]')?.click()}>
                    Précédent
                  </Button>
                  <Button type="submit" disabled={isLoading} className="gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Génération en cours...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Générer le bulletin
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  );
} 