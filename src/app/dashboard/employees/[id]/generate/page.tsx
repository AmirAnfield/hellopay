'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PageContainer, PageHeader, LoadingState } from '@/components/shared/PageContainer';
import { format, addMonths, isValid, differenceInCalendarMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { ChevronLeft, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';

// Définition du schéma de validation du formulaire
const generatePayslipsSchema = z.object({
  startDate: z.date({ required_error: "Veuillez sélectionner une date de début" }),
  endDate: z.date({ required_error: "Veuillez sélectionner une date de fin" }),
  salaryType: z.enum(['hourly', 'fixed'], { required_error: "Veuillez sélectionner un type de salaire" }),
  hourlyRate: z.number().min(0).optional(),
  hoursWorked: z.number().min(0).optional(),
  fixedSalary: z.number().min(0).optional(),
  includePaidLeave: z.boolean().default(true),
}).refine(data => 
  (data.salaryType === 'hourly' && data.hourlyRate && data.hoursWorked) || 
  (data.salaryType === 'fixed' && data.fixedSalary), {
  message: "Veuillez remplir les champs correspondant au type de salaire sélectionné",
  path: ["salaryType"],
}).refine(data => {
  return data.endDate >= data.startDate;
}, {
  message: "La date de fin doit être postérieure à la date de début",
  path: ["endDate"]
});

type GeneratePayslipsFormValues = z.infer<typeof generatePayslipsSchema>;

// Interface pour l'employé
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  hourlyRate: number;
  baseSalary: number;
  monthlyHours: number;
  isExecutive: boolean;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
}

// Interface pour les bulletins générés
interface GeneratedPayslip {
  id: string;
  period: string;
  grossSalary: number;
  netSalary: number;
}

export default function GeneratePayslipsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { status } = useSession();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [monthCount, setMonthCount] = useState(0);
  const [generatedPayslips, setGeneratedPayslips] = useState<GeneratedPayslip[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Configurer le formulaire avec react-hook-form
  const form = useForm<GeneratePayslipsFormValues>({
    resolver: zodResolver(generatePayslipsSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: addMonths(new Date(), 1),
      salaryType: 'hourly',
      hourlyRate: 0,
      hoursWorked: 0,
      fixedSalary: 0,
      includePaidLeave: true,
    },
  });

  const watchSalaryType = form.watch('salaryType');
  const watchStartDate = form.watch('startDate');
  const watchEndDate = form.watch('endDate');

  // Mettre à jour le nombre de mois
  useEffect(() => {
    if (isValid(watchStartDate) && isValid(watchEndDate)) {
      const months = differenceInCalendarMonths(watchEndDate, watchStartDate) + 1;
      setMonthCount(Math.max(0, months));
    } else {
      setMonthCount(0);
    }
  }, [watchStartDate, watchEndDate]);

  // Charger les données de l'employé
  useEffect(() => {
    const fetchEmployee = async () => {
      if (status === 'loading') return;
      if (status === 'unauthenticated') {
        router.push('/auth/login');
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/employees/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Employé introuvable');
            router.push('/dashboard/employees');
            return;
          }
          throw new Error('Erreur lors du chargement des données de l\'employé');
        }

        const data = await response.json();
        setEmployee(data);

        // Initialiser le formulaire avec les données de l'employé
        form.setValue('hourlyRate', data.hourlyRate);
        form.setValue('hoursWorked', data.monthlyHours);
        form.setValue('fixedSalary', data.baseSalary);

      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement des données de l\'employé');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [params.id, router, status, form]);

  // Gérer la soumission du formulaire
  const onSubmit = async (data: GeneratePayslipsFormValues) => {
    if (!employee) return;
    
    try {
      setIsGenerating(true);
      
      // Préparer les données à envoyer
      const payload = {
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: format(data.endDate, 'yyyy-MM-dd'),
        hoursWorked: data.salaryType === 'hourly' ? data.hoursWorked : null,
        hourlyRate: data.salaryType === 'hourly' ? data.hourlyRate : null,
        fixedSalary: data.salaryType === 'fixed' ? data.fixedSalary : null,
        includePaidLeave: data.includePaidLeave,
        salaryType: data.salaryType
      };
      
      // Appeler l'API pour générer les bulletins
      const response = await fetch(`/api/employees/${params.id}/generatePayslips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération des bulletins');
      }
      
      const result = await response.json();
      
      // Afficher les bulletins générés
      setGeneratedPayslips(result.payslips);
      setShowSuccessDialog(true);
      
      toast.success(`${result.payslips.length} bulletin(s) de paie généré(s) avec succès`);
      
    } catch (error) {
      console.error('Erreur lors de la génération des bulletins:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération des bulletins');
    } finally {
      setIsGenerating(false);
    }
  };

  // Formater un montant en devise
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Si le chargement est en cours, afficher un état de chargement
  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader
          title="Chargement..."
          description="Chargement des données de l'employé"
        />
        <Card>
          <CardContent className="pt-6">
            <LoadingState />
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Si l'employé n'a pas été trouvé, rediriger
  if (!employee) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Génération multiple de bulletins"
        description={`${employee.firstName} ${employee.lastName} - ${employee.position}`}
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Période de génération</CardTitle>
              <CardDescription>
                Définissez la période pour laquelle vous souhaitez générer des bulletins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début</Label>
                  <Controller
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, 'MMMM yyyy', { locale: fr })
                            ) : (
                              <span>Sélectionner le mois de début</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {form.formState.errors.startDate && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.startDate.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Controller
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, 'MMMM yyyy', { locale: fr })
                            ) : (
                              <span>Sélectionner le mois de fin</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < watchStartDate || date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {form.formState.errors.endDate && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded text-blue-600 text-sm">
                {monthCount > 0 ? (
                  <p>{monthCount} bulletin{monthCount > 1 ? 's' : ''} sera{monthCount > 1 ? 'ont' : ''} généré{monthCount > 1 ? 's' : ''}</p>
                ) : (
                  <p>Veuillez sélectionner une période valide</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Type de rémunération</CardTitle>
              <CardDescription>
                Choisissez le type de rémunération et renseignez les informations nécessaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Controller
                  control={form.control}
                  name="salaryType"
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hourly" id="hourly" />
                        <Label htmlFor="hourly">Taux horaire</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed" id="fixed" />
                        <Label htmlFor="fixed">Salaire fixe</Label>
                      </div>
                    </RadioGroup>
                  )}
                />

                {watchSalaryType === 'hourly' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Taux horaire (€/h)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        step="0.01"
                        {...form.register('hourlyRate', { valueAsNumber: true })}
                      />
                      {form.formState.errors.hourlyRate && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.hourlyRate.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hoursWorked">Heures travaillées par mois</Label>
                      <Input
                        id="hoursWorked"
                        type="number"
                        step="0.01"
                        {...form.register('hoursWorked', { valueAsNumber: true })}
                      />
                      {form.formState.errors.hoursWorked && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.hoursWorked.message}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="fixedSalary">Salaire mensuel brut</Label>
                    <Input
                      id="fixedSalary"
                      type="number"
                      step="0.01"
                      {...form.register('fixedSalary', { valueAsNumber: true })}
                    />
                    {form.formState.errors.fixedSalary && (
                      <p className="text-red-500 text-sm">
                        {form.formState.errors.fixedSalary.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Options supplémentaires</CardTitle>
              <CardDescription>
                Paramètres additionnels pour la génération des bulletins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Controller
                  control={form.control}
                  name="includePaidLeave"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="includePaidLeave"
                    />
                  )}
                />
                <Label htmlFor="includePaidLeave">Inclure le calcul des congés payés</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isGenerating || monthCount === 0}
              >
                {isGenerating ? (
                  'Génération en cours...'
                ) : (
                  `Générer ${monthCount} bulletin${monthCount > 1 ? 's' : ''}`
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>

      {/* Dialog de succès */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Génération réussie</AlertDialogTitle>
            <AlertDialogDescription>
              {generatedPayslips.length} bulletin{generatedPayslips.length > 1 ? 's' : ''} de paie {generatedPayslips.length > 1 ? 'ont été générés' : 'a été généré'} avec succès.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="max-h-60 overflow-y-auto my-4">
            <div className="border rounded-md divide-y">
              {generatedPayslips.map((payslip) => (
                <div key={payslip.id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{payslip.period}</p>
                    <p className="text-sm text-muted-foreground">
                      Brut: {formatCurrency(payslip.grossSalary)} / Net: {formatCurrency(payslip.netSalary)}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/payslips/${payslip.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Voir
                  </Link>
                </div>
              ))}
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Fermer</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/dashboard/payslips">
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Voir tous les bulletins
                </Button>
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
} 