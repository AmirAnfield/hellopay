'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageContainer, PageHeader, LoadingState } from '@/components/shared/PageContainer';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft, Eye, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';

// Définition du schéma de validation du formulaire
const contributionSchema = z.object({
  id: z.string().optional().nullable(),
  category: z.string(),
  label: z.string(),
  baseType: z.string(),
  baseAmount: z.number().min(0),
  employeeRate: z.number().min(0).max(100),
  employerRate: z.number().min(0).max(100),
  employeeAmount: z.number().min(0),
  employerAmount: z.number().min(0),
});

const payslipFormSchema = z.object({
  grossSalary: z.number().positive(),
  hourlyRate: z.number().positive(),
  hoursWorked: z.number().positive(),
  contributions: z.array(contributionSchema),
  taxAmount: z.number().min(0),
});

type PayslipFormValues = z.infer<typeof payslipFormSchema>;

type Contribution = {
  id: string;
  category: string;
  label: string;
  baseType: string;
  baseAmount: number;
  employeeRate: number;
  employerRate: number;
  employeeAmount: number;
  employerAmount: number;
};

type Payslip = {
  id: string;
  status: string;
  employeeName: string;
  employerName: string;
  grossSalary: number;
  netSalary: number;
  employeeContributions: number;
  employerContributions: number;
  employerCost: number;
  periodStart: string;
  periodEnd: string;
  hourlyRate: number;
  hoursWorked: number;
  taxAmount: number;
  pdfUrl: string | null;
  contributions: Contribution[];
};

export default function EditPayslipPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showValidateDialog, setShowValidateDialog] = useState(false);

  // Définir les états de calcul
  const [totalEmployeeContributions, setTotalEmployeeContributions] = useState(0);
  const [totalEmployerContributions, setTotalEmployerContributions] = useState(0);
  const [netBeforeTax, setNetBeforeTax] = useState(0);
  const [netSalary, setNetSalary] = useState(0);
  const [employerCost, setEmployerCost] = useState(0);

  // Configurer le formulaire avec react-hook-form
  const form = useForm<PayslipFormValues>({
    resolver: zodResolver(payslipFormSchema),
    defaultValues: {
      grossSalary: 0,
      hourlyRate: 0,
      hoursWorked: 0,
      contributions: [],
      taxAmount: 0,
    },
    mode: 'onChange',
  });

  // Configurer le tableau de champs pour les contributions
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'contributions',
  });

  // Charger les données du bulletin
  useEffect(() => {
    const fetchPayslip = async () => {
      if (status === 'loading') return;
      if (status === 'unauthenticated') {
        router.push('/auth/login');
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/payslips/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Bulletin introuvable');
            router.push('/dashboard/payslips');
            return;
          }
          throw new Error('Erreur lors du chargement du bulletin');
        }

        const data = await response.json();
        
        // Vérifier si le bulletin est modifiable
        if (data.status === 'final') {
          toast.error('Ce bulletin est déjà validé et ne peut plus être modifié');
          router.push(`/dashboard/payslips/${params.id}`);
          return;
        }

        setPayslip(data);

        // Initialiser le formulaire avec les données du bulletin
        form.reset({
          grossSalary: data.grossSalary,
          hourlyRate: data.hourlyRate,
          hoursWorked: data.hoursWorked,
          contributions: data.contributions || [],
          taxAmount: data.taxAmount || 0,
        });

        // Initialiser les valeurs calculées
        updateCalculations(
          data.grossSalary,
          data.contributions || [],
          data.taxAmount || 0
        );

      } catch (error) {
        console.error('Erreur lors du chargement du bulletin:', error);
        toast.error('Erreur lors du chargement du bulletin');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayslip();
  }, [params.id, router, status]);

  // Mettre à jour les calculs lorsque les champs du formulaire changent
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (!value.grossSalary) return;
      
      // Calculer les montants des contributions
      let updatedContributions = [...(value.contributions || [])];
      
      // Mettre à jour le montant de la base pour chaque contribution
      updatedContributions = updatedContributions.map(contribution => {
        let baseAmount = value.grossSalary;
        
        // Calculer les montants des contributions
        const employeeAmount = (baseAmount * contribution.employeeRate) / 100;
        const employerAmount = (baseAmount * contribution.employerRate) / 100;
        
        return {
          ...contribution,
          baseAmount,
          employeeAmount,
          employerAmount
        };
      });
      
      // Mettre à jour les contributions dans le formulaire si nécessaire
      if (name?.includes('grossSalary') || name?.includes('hoursWorked') || name?.includes('hourlyRate')) {
        updatedContributions.forEach((contribution, index) => {
          form.setValue(`contributions.${index}.baseAmount`, contribution.baseAmount);
          form.setValue(`contributions.${index}.employeeAmount`, contribution.employeeAmount);
          form.setValue(`contributions.${index}.employerAmount`, contribution.employerAmount);
        });
      }
      
      // Mettre à jour les calculs globaux
      updateCalculations(
        value.grossSalary,
        updatedContributions,
        value.taxAmount || 0
      );
    });

    return () => subscription.unsubscribe();
  }, [form, form.watch]);

  // Fonction pour calculer les totaux
  const updateCalculations = (
    grossSalary: number,
    contributions: Contribution[],
    taxAmount: number
  ) => {
    // Calculer les totaux des contributions
    const employeeTotal = contributions.reduce(
      (sum, contrib) => sum + contrib.employeeAmount,
      0
    );
    const employerTotal = contributions.reduce(
      (sum, contrib) => sum + contrib.employerAmount,
      0
    );
    
    // Calculer le net avant impôt
    const calculatedNetBeforeTax = grossSalary - employeeTotal;
    
    // Calculer le net à payer
    const calculatedNetSalary = calculatedNetBeforeTax - taxAmount;
    
    // Calculer le coût employeur
    const calculatedEmployerCost = grossSalary + employerTotal;
    
    // Mettre à jour les états
    setTotalEmployeeContributions(employeeTotal);
    setTotalEmployerContributions(employerTotal);
    setNetBeforeTax(calculatedNetBeforeTax);
    setNetSalary(calculatedNetSalary);
    setEmployerCost(calculatedEmployerCost);
  };

  // Gérer la soumission du formulaire
  const onSubmit = async (data: PayslipFormValues) => {
    if (!payslip) return;
    
    try {
      setIsSaving(true);
      
      // Préparer les données à envoyer
      const updatedPayslip = {
        grossSalary: data.grossSalary,
        hourlyRate: data.hourlyRate,
        hoursWorked: data.hoursWorked,
        contributions: data.contributions,
        employeeContributions: totalEmployeeContributions,
        employerContributions: totalEmployerContributions,
        netSalary: netSalary,
        employerCost: employerCost,
        taxAmount: data.taxAmount,
      };
      
      // Appeler l'API pour mettre à jour le bulletin
      const response = await fetch(`/api/payslips/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPayslip),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du bulletin');
      }
      
      const result = await response.json();
      
      // Mettre à jour l'état local
      setPayslip({
        ...payslip,
        ...updatedPayslip,
        contributions: data.contributions,
      });
      
      toast.success('Bulletin mis à jour avec succès');
      
      // Si l'URL du PDF a été mise à jour, la récupérer
      if (result.pdfUrl) {
        setPayslip(prev => prev ? { ...prev, pdfUrl: result.pdfUrl } : null);
      }
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bulletin:', error);
      toast.error('Erreur lors de la mise à jour du bulletin');
    } finally {
      setIsSaving(false);
    }
  };

  // Gérer la prévisualisation du bulletin
  const handlePreview = async () => {
    try {
      setIsPreviewing(true);
      
      // Récupérer les données du formulaire
      const data = form.getValues();
      
      // Préparer les données à envoyer
      const previewData = {
        grossSalary: data.grossSalary,
        hourlyRate: data.hourlyRate,
        hoursWorked: data.hoursWorked,
        contributions: data.contributions,
        employeeContributions: totalEmployeeContributions,
        employerContributions: totalEmployerContributions,
        netSalary: netSalary,
        employerCost: employerCost,
        taxAmount: data.taxAmount,
      };
      
      // Appeler l'API pour générer la prévisualisation
      const response = await fetch(`/api/payslips/${params.id}/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(previewData),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération de la prévisualisation');
      }
      
      const result = await response.json();
      
      // Ouvrir la prévisualisation dans un nouvel onglet
      if (result.previewUrl) {
        setPreviewUrl(result.previewUrl);
        window.open(result.previewUrl, '_blank');
      }
      
    } catch (error) {
      console.error('Erreur lors de la prévisualisation:', error);
      toast.error('Erreur lors de la génération de la prévisualisation');
    } finally {
      setIsPreviewing(false);
    }
  };

  // Gérer la validation définitive du bulletin
  const handleValidate = async () => {
    if (!payslip) return;
    
    try {
      setIsValidating(true);
      
      // Appeler l'API pour valider le bulletin
      const response = await fetch(`/api/payslips/${params.id}/validate`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la validation du bulletin');
      }
      
      const result = await response.json();
      
      toast.success('Bulletin validé avec succès');
      
      // Rediriger vers la page de détail
      router.push(`/dashboard/payslips/${params.id}`);
      
    } catch (error) {
      console.error('Erreur lors de la validation du bulletin:', error);
      toast.error('Erreur lors de la validation du bulletin');
    } finally {
      setIsValidating(false);
      setShowValidateDialog(false);
    }
  };

  // Formater un nombre en devise
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Formater un pourcentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(2)} %`;
  };

  // Si le chargement est en cours, afficher un état de chargement
  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Chargement..."
          description="Chargement des données du bulletin de paie"
        />
        <Card>
          <CardContent className="pt-6">
            <LoadingState />
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Si le bulletin n'a pas été trouvé, rediriger
  if (!payslip) {
    return null;
  }

  // Regrouper les contributions par catégorie
  const contributionsByCategory = fields.reduce((acc, contribution) => {
    const category = contribution.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(contribution);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <PageContainer>
      <PageHeader
        title="Édition du bulletin de paie"
        description={`${payslip.employeeName} - ${format(new Date(payslip.periodStart), 'MMMM yyyy', { locale: fr })}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button variant="outline" onClick={handlePreview} disabled={isPreviewing}>
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <AlertDialogTrigger asChild>
              <Button variant="default">
                <CheckCircle className="h-4 w-4 mr-2" />
                Valider définitivement
              </Button>
            </AlertDialogTrigger>
          </div>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>
                Informations générales sur le bulletin de paie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="employeeName">Salarié</Label>
                  <Input
                    id="employeeName"
                    value={payslip.employeeName}
                    disabled
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="employerName">Employeur</Label>
                  <Input
                    id="employerName"
                    value={payslip.employerName}
                    disabled
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="period">Période</Label>
                  <Input
                    id="period"
                    value={format(new Date(payslip.periodStart), 'MMMM yyyy', { locale: fr })}
                    disabled
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="grossSalary">Salaire brut</Label>
                  <Input
                    id="grossSalary"
                    type="number"
                    step="0.01"
                    className="mt-1"
                    {...form.register('grossSalary', { valueAsNumber: true })}
                  />
                  {form.formState.errors.grossSalary && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.grossSalary.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Taux horaire</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    className="mt-1"
                    {...form.register('hourlyRate', { valueAsNumber: true })}
                  />
                  {form.formState.errors.hourlyRate && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.hourlyRate.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="hoursWorked">Heures travaillées</Label>
                  <Input
                    id="hoursWorked"
                    type="number"
                    step="0.01"
                    className="mt-1"
                    {...form.register('hoursWorked', { valueAsNumber: true })}
                  />
                  {form.formState.errors.hoursWorked && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.hoursWorked.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contributions et charges</CardTitle>
              <CardDescription>
                Détail des contributions salariales et patronales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(contributionsByCategory).map(([category, contributions], categoryIndex) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="text-base font-medium">
                      {category}
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Libellé</TableHead>
                            <TableHead className="text-right">Base</TableHead>
                            <TableHead className="text-right">Taux salarial</TableHead>
                            <TableHead className="text-right">Montant salarial</TableHead>
                            <TableHead className="text-right">Taux patronal</TableHead>
                            <TableHead className="text-right">Montant patronal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contributions.map((contribution, index) => {
                            const fieldIndex = fields.findIndex(field => field.id === contribution.id);
                            if (fieldIndex === -1) return null;
                            
                            return (
                              <TableRow key={contribution.id}>
                                <TableCell>{contribution.label}</TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(form.getValues(`contributions.${fieldIndex}.baseAmount`))}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    className="w-20 text-right ml-auto"
                                    {...form.register(`contributions.${fieldIndex}.employeeRate`, { 
                                      valueAsNumber: true,
                                      onChange: e => {
                                        const rate = parseFloat(e.target.value);
                                        const baseAmount = form.getValues(`contributions.${fieldIndex}.baseAmount`);
                                        const amount = (baseAmount * rate) / 100;
                                        form.setValue(`contributions.${fieldIndex}.employeeAmount`, amount);
                                      }
                                    })}
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(form.getValues(`contributions.${fieldIndex}.employeeAmount`))}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    className="w-20 text-right ml-auto"
                                    {...form.register(`contributions.${fieldIndex}.employerRate`, { 
                                      valueAsNumber: true,
                                      onChange: e => {
                                        const rate = parseFloat(e.target.value);
                                        const baseAmount = form.getValues(`contributions.${fieldIndex}.baseAmount`);
                                        const amount = (baseAmount * rate) / 100;
                                        form.setValue(`contributions.${fieldIndex}.employerAmount`, amount);
                                      }
                                    })}
                                  />
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(form.getValues(`contributions.${fieldIndex}.employerAmount`))}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Impôt sur le revenu</CardTitle>
              <CardDescription>
                Prélèvement à la source
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 max-w-md">
                <div>
                  <Label htmlFor="taxAmount">Montant du prélèvement</Label>
                  <Input
                    id="taxAmount"
                    type="number"
                    step="0.01"
                    className="mt-1"
                    {...form.register('taxAmount', { valueAsNumber: true })}
                  />
                  {form.formState.errors.taxAmount && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.taxAmount.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
              <CardDescription>
                Résumé des montants calculés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Salaire brut:</span>
                    <span className="font-medium">{formatCurrency(form.getValues('grossSalary') || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total cotisations salariales:</span>
                    <span className="font-medium">{formatCurrency(totalEmployeeContributions)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net avant impôt:</span>
                    <span className="font-medium">{formatCurrency(netBeforeTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impôt prélevé à la source:</span>
                    <span className="font-medium">{formatCurrency(form.getValues('taxAmount') || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Net à payer:</span>
                    <span className="font-semibold">{formatCurrency(netSalary)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Salaire brut:</span>
                    <span className="font-medium">{formatCurrency(form.getValues('grossSalary') || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total cotisations patronales:</span>
                    <span className="font-medium">{formatCurrency(totalEmployerContributions)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Coût total employeur:</span>
                    <span className="font-semibold">{formatCurrency(employerCost)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>

      {/* Dialog de confirmation pour la validation définitive */}
      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Valider définitivement ce bulletin ?</AlertDialogTitle>
            <AlertDialogDescription>
              Après validation, ce bulletin ne pourra plus être modifié. 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleValidate}
              disabled={isValidating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isValidating ? 'Validation...' : 'Valider définitivement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
} 