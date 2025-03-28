'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PayrollCalculationService, 
  BrutSalaireInput, 
  StatutSalarie 
} from '@/services/payroll/PayrollCalculationService';
import { BulletinPaie } from '@/services/payroll/PayrollHistoryService';
import { EmployeeInfo, EmployerInfo } from '@/services/payroll/PayslipGeneratorService';
import PayslipViewer from './PayslipViewer';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

// Schéma de validation du formulaire
const formSchema = z.object({
  employeeFirstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  employeeLastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  employeePosition: z.string().min(2, 'Le poste doit être spécifié'),
  employeeDepartment: z.string().optional(),
  employeeHireDate: z.string().min(1, 'La date d\'embauche est requise'),
  employeeSocialSecurity: z.string().optional(),
  salaireBase: z.coerce.number().min(0, 'Le salaire ne peut pas être négatif'),
  heuresSup25: z.coerce.number().min(0, 'Les heures ne peuvent pas être négatives'),
  heuresSup50: z.coerce.number().min(0, 'Les heures ne peuvent pas être négatives'),
  primes: z.coerce.number().min(0, 'Les primes ne peuvent pas être négatives'),
  statut: z.enum(['cadre', 'non-cadre']),
  congesPris: z.coerce.number().min(0, 'Les congés ne peuvent pas être négatifs'),
  mois: z.coerce.number().min(1).max(12, 'Le mois doit être entre 1 et 12'),
  annee: z.coerce.number().min(2000).max(2100, 'L\'année doit être valide'),
});

// Type déduit du schéma
type FormValues = z.infer<typeof formSchema>;

// Données employeur par défaut
const defaultEmployer: EmployerInfo = {
  name: 'HelloPay SAS',
  address: '12 Rue de l\'Innovation, 75001 Paris',
  siret: '12345678901234',
  apeCode: '6201Z'
};

export default function PayslipForm() {
  const [bulletin, setBulletin] = useState<BulletinPaie | null>(null);
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null);
  const [savingToSupabase, setSavingToSupabase] = useState(false);
  const [currentTab, setCurrentTab] = useState<'form' | 'preview'>('form');
  
  // Initialisation du formulaire
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeFirstName: '',
      employeeLastName: '',
      employeePosition: '',
      employeeDepartment: '',
      employeeHireDate: new Date().toISOString().slice(0, 10),
      employeeSocialSecurity: '',
      salaireBase: 1700,
      heuresSup25: 0,
      heuresSup50: 0,
      primes: 0,
      statut: 'non-cadre' as StatutSalarie,
      congesPris: 0,
      mois: new Date().getMonth() + 1,
      annee: new Date().getFullYear(),
    },
  });
  
  // Fonction pour générer le bulletin
  const onSubmit = (values: FormValues) => {
    try {
      // Création des infos de l'employé
      const employeeInfo: EmployeeInfo = {
        id: `${values.employeeLastName.toLowerCase()}-${Date.now()}`,
        firstName: values.employeeFirstName,
        lastName: values.employeeLastName,
        position: values.employeePosition,
        department: values.employeeDepartment || undefined,
        hireDate: new Date(values.employeeHireDate),
        socialSecurityNumber: values.employeeSocialSecurity || undefined
      };
      
      // Création des données de salaire
      const salaryInput: BrutSalaireInput = {
        salaireBase: values.salaireBase,
        heuresSup25: values.heuresSup25,
        heuresSup50: values.heuresSup50,
        primes: values.primes
      };
      
      // Calcul du salaire brut et des cotisations
      const brutOutput = PayrollCalculationService.calculerSalaireBrut(salaryInput);
      const cotisations = PayrollCalculationService.calculerCotisationsSalariales(
        brutOutput.brutTotal,
        values.statut
      );
      
      // Création du bulletin
      const newBulletin: BulletinPaie = {
        id: `bulletin-${values.employeeLastName.toLowerCase()}-${values.mois}-${values.annee}-${Date.now()}`,
        employeeId: employeeInfo.id,
        mois: values.mois,
        annee: values.annee,
        brutTotal: brutOutput.brutTotal,
        netTotal: cotisations.salaireNet,
        totalCotisations: cotisations.totalCotisations,
        detailsBrut: {
          base: brutOutput.details.base,
          heureSup25: brutOutput.details.heureSup25,
          heureSup50: brutOutput.details.heureSup50,
          primes: brutOutput.details.primes
        },
        detailsCotisations: {
          santé: cotisations.details.santé,
          retraite: cotisations.details.retraite,
          chômage: cotisations.details.chômage,
          autres: cotisations.details.autres
        },
        congesCumules: 2.5, // Standard en France: 2.5 jours par mois
        congesPris: values.congesPris,
        dateGeneration: new Date(),
        estValide: true
      };
      
      // Mettre à jour l'état avec les nouvelles données
      setBulletin(newBulletin);
      setEmployee(employeeInfo);
      
      // Passer à l'onglet de visualisation
      setCurrentTab('preview');
    } catch (error) {
      console.error('Erreur lors de la génération du bulletin:', error);
      alert('Une erreur est survenue lors de la génération du bulletin.');
    }
  };
  
  // Sauvegarder dans Supabase
  const saveToSupabase = async () => {
    if (!bulletin || !employee) return;
    
    try {
      setSavingToSupabase(true);
      
      // Récupérer la session utilisateur
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Vous devez être connecté pour sauvegarder un bulletin');
      }
      
      // Formater les données pour Supabase
      const payslipData = {
        id: bulletin.id,
        user_id: session.user.id,
        employee_id: bulletin.employeeId,
        employee_name: `${employee.firstName} ${employee.lastName}`,
        month: bulletin.mois,
        year: bulletin.annee,
        brut_total: bulletin.brutTotal,
        net_total: bulletin.netTotal,
        total_cotisations: bulletin.totalCotisations,
        details_brut: bulletin.detailsBrut,
        details_cotisations: bulletin.detailsCotisations,
        conges_cumules: bulletin.congesCumules,
        conges_pris: bulletin.congesPris,
        created_at: new Date().toISOString(),
        est_valide: bulletin.estValide
      };
      
      // Enregistrer dans Supabase
      const { error } = await supabase
        .from('payslips')
        .insert(payslipData);
      
      if (error) throw error;
      
      alert('Bulletin de paie sauvegardé avec succès dans Supabase !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans Supabase:', error);
      alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setSavingToSupabase(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as 'form' | 'preview')}>
        <TabsList className="w-full">
          <TabsTrigger value="form" className="flex-1">Formulaire</TabsTrigger>
          <TabsTrigger 
            value="preview" 
            className="flex-1"
            disabled={!bulletin}
          >
            Aperçu du bulletin
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="form" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Générer un bulletin de paie</CardTitle>
            </CardHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent>
                  <div className="space-y-6">
                    {/* Informations sur l'employé */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Informations sur l'employé</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="employeeFirstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prénom</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="employeeLastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="employeePosition"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Poste / Fonction</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="employeeDepartment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Département</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Optionnel
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="employeeHireDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date d'embauche</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="employeeSocialSecurity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>N° de sécurité sociale</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                Optionnel
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Informations sur le salaire */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Rémunération</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="salaireBase"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Salaire mensuel de base</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="statut"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Statut</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un statut" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="non-cadre">Non-cadre</SelectItem>
                                  <SelectItem value="cadre">Cadre</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="heuresSup25"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Heures supplémentaires à 25%</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="heuresSup50"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Heures supplémentaires à 50%</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="primes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primes</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    {/* Informations sur le bulletin */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Informations du bulletin</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="mois"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mois</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(parseInt(value))} 
                                defaultValue={field.value.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un mois" />
                                  </SelectTrigger>
                                </FormControl>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="annee"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Année</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="congesPris"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Congés pris</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.5" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Réinitialiser
                  </Button>
                  <Button type="submit">
                    Générer le bulletin
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-6">
          {bulletin && employee && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentTab('form')}
                >
                  Retour au formulaire
                </Button>
                
                <Button 
                  onClick={saveToSupabase} 
                  disabled={savingToSupabase}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {savingToSupabase ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    'Sauvegarder dans Supabase'
                  )}
                </Button>
              </div>
              
              <PayslipViewer 
                bulletin={bulletin} 
                employee={employee} 
                employer={defaultEmployer}
                onSave={saveToSupabase}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 