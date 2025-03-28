'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export function PayslipForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('enterprise');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/payslips');
    } catch (error) {
      console.error('Erreur lors de la génération de la fiche de paie', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextTab = () => {
    if (activeTab === 'enterprise') setActiveTab('employee');
    else if (activeTab === 'employee') setActiveTab('remuneration');
  };

  const goToPreviousTab = () => {
    if (activeTab === 'remuneration') setActiveTab('employee');
    else if (activeTab === 'employee') setActiveTab('enterprise');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="enterprise">Entreprise</TabsTrigger>
          <TabsTrigger value="employee">Employé</TabsTrigger>
          <TabsTrigger value="remuneration">Rémunération</TabsTrigger>
        </TabsList>

        {/* Onglet Entreprise */}
        <TabsContent value="enterprise">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Informations de l&apos;entreprise</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
                <Input id="companyName" placeholder="Nom de l'entreprise" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="siret">Numéro SIRET</Label>
                <Input id="siret" placeholder="123 456 789 00012" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" placeholder="Adresse complète" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="postalCode">Code postal</Label>
                <Input id="postalCode" placeholder="75001" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input id="city" placeholder="Paris" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="urssaf">Code URSSAF</Label>
                <Input id="urssaf" placeholder="Code URSSAF" className="mt-1" />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="button" onClick={goToNextTab}>
                Suivant
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Onglet Employé */}
        <TabsContent value="employee">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Informations de l&apos;employé</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="employeeLastName">Nom</Label>
                <Input id="employeeLastName" placeholder="Nom de famille" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="employeeFirstName">Prénom</Label>
                <Input id="employeeFirstName" placeholder="Prénom" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="employeeAddress">Adresse</Label>
                <Input id="employeeAddress" placeholder="Adresse complète" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="employeePostalCode">Code postal</Label>
                <Input id="employeePostalCode" placeholder="75001" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="employeeCity">Ville</Label>
                <Input id="employeeCity" placeholder="Paris" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="socialSecurityNumber">Numéro de sécurité sociale</Label>
                <Input id="socialSecurityNumber" placeholder="1 85 07 75 120 456" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="position">Poste occupé</Label>
                <Input id="position" placeholder="Développeur, Designer, etc." className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="contractType">Type de contrat</Label>
                <Select defaultValue="cdi">
                  <SelectTrigger id="contractType" className="mt-1">
                    <SelectValue placeholder="Sélectionner un type de contrat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cdi">CDI</SelectItem>
                    <SelectItem value="cdd">CDD</SelectItem>
                    <SelectItem value="interim">Intérim</SelectItem>
                    <SelectItem value="apprentissage">Apprentissage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={goToPreviousTab}>
                Précédent
              </Button>
              <Button type="button" onClick={goToNextTab}>
                Suivant
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Onglet Rémunération */}
        <TabsContent value="remuneration">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Informations de rémunération</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Période</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="periodStart">Date de début</Label>
                  <Input id="periodStart" type="date" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="periodEnd">Date de fin</Label>
                  <Input id="periodEnd" type="date" className="mt-1" />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Salaire brut</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="baseSalary">Salaire de base</Label>
                  <Input id="baseSalary" type="number" placeholder="0.00" step="0.01" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="workingHours">Heures travaillées</Label>
                  <Input id="workingHours" type="number" placeholder="151.67" step="0.01" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="overtimeHours">Heures supplémentaires</Label>
                  <Input id="overtimeHours" type="number" placeholder="0" step="0.01" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="bonus">Primes</Label>
                  <Input id="bonus" type="number" placeholder="0.00" step="0.01" className="mt-1" />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Cotisations</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="useDefaultContributions" defaultChecked />
                  <Label htmlFor="useDefaultContributions">Utiliser les cotisations par défaut</Label>
                </div>
                
                <div className="text-sm text-gray-500">
                  Les taux de cotisation standard pour les charges salariales et patronales seront appliqués automatiquement.
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Commentaires</h3>
              <div>
                <Label htmlFor="comments">Remarques spécifiques à cette fiche de paie</Label>
                <textarea 
                  id="comments" 
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md" 
                  rows={3}
                  placeholder="Commentaires additionnels (congés, absence, etc.)"
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={goToPreviousTab}>
                Précédent
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Génération en cours...' : 'Générer la fiche de paie'}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
} 