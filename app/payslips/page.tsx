'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, FileText, Download, Trash2 } from 'lucide-react';
import PayslipForm from './payslip-form';

export default function PayslipsPage() {
  const { data: session, status } = useSession();
  const [storedPayslips, setStoredPayslips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('generate');

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (status === 'unauthenticated') {
    redirect('/auth/login');
  }

  // Fonction pour charger les fiches de paie enregistrées
  const loadStoredPayslips = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/get-payslips');
      if (response.ok) {
        const data = await response.json();
        setStoredPayslips(data.payslips);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des fiches de paie:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les fiches de paie lorsqu'on accède à l'onglet
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    if (value === 'history') {
      loadStoredPayslips();
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Gestion des fiches de paie</h1>
      
      <Tabs defaultValue="generate" value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="mb-8">
          <TabsTrigger value="generate">Générer une fiche de paie</TabsTrigger>
          <TabsTrigger value="history">Historique des fiches de paie</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate">
          <PayslipForm />
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique de vos fiches de paie</CardTitle>
              <CardDescription>
                Consultez et téléchargez vos fiches de paie générées précédemment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Chargement des fiches de paie...</span>
                </div>
              ) : storedPayslips.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {storedPayslips.map((payslip) => (
                    <div 
                      key={payslip.id} 
                      className="flex items-center justify-between border p-4 rounded-md"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        <div>
                          <h3 className="font-medium">
                            Fiche de paie - {payslip.employeeFirstName} {payslip.employeeLastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Période: {payslip.period} | Montant: {payslip.netToPay.toFixed(2)} €
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(`/api/download-payslip/${payslip.id}`, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" /> Télécharger
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={async () => {
                            if (confirm("Êtes-vous sûr de vouloir supprimer cette fiche de paie ?")) {
                              const response = await fetch(`/api/delete-payslip/${payslip.id}`, {
                                method: 'DELETE',
                              });
                              if (response.ok) {
                                loadStoredPayslips();
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Aucune fiche de paie</AlertTitle>
                  <AlertDescription>
                    Vous n'avez pas encore généré de fiches de paie. Utilisez l'onglet "Générer une fiche de paie" pour créer votre première fiche.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 