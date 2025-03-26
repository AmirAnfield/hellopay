import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Test de génération de fiches de paie - HelloPay',
  description: 'Page de test pour générer rapidement des fiches de paie avec différents jeux de données',
};

export default function TestPayslipPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test de génération de fiches de paie</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Comment ça marche ?</h2>
          <div className="space-y-4 mb-6">
            <p>
              Cette page permet de tester rapidement la génération de fiches de paie en PDF sans avoir à saisir de données.
              Plusieurs jeux de données prédéfinis sont disponibles pour tester différents scénarios.
            </p>
            <p>
              Cliquez sur un des boutons ci-dessous pour générer et télécharger une fiche de paie au format PDF.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Employé à temps plein</CardTitle>
              <CardDescription>
                Fiche de paie standard pour un employé travaillant à temps plein
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Employé : Sophie Martin</p>
              <p className="text-sm text-gray-500">Employeur : Digital Marketing SAS</p>
              <p className="text-sm text-gray-500">Salaire brut : 5794,78 €</p>
              <p className="text-sm text-gray-500">Net à payer : 4422,41 €</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/api/test-payslip?type=fullTime" target="_blank">
                  Générer PDF
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Employé à temps partiel</CardTitle>
              <CardDescription>
                Fiche de paie pour un employé travaillant à 80% du temps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Employé : Thomas Dubois</p>
              <p className="text-sm text-gray-500">Employeur : Bureau Services SARL</p>
              <p className="text-sm text-gray-500">Salaire brut : 1834,29 €</p>
              <p className="text-sm text-gray-500">Net à payer : 1406,53 €</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/api/test-payslip?type=partTime" target="_blank">
                  Générer PDF
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Heures supplémentaires</CardTitle>
              <CardDescription>
                Fiche de paie avec des heures supplémentaires
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Employé : Julien Leroy</p>
              <p className="text-sm text-gray-500">Employeur : Industrie Nord SARL</p>
              <p className="text-sm text-gray-500">Salaire brut : 3342,21 €</p>
              <p className="text-sm text-gray-500">Net à payer : 2562,82 €</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/api/test-payslip?type=overtime" target="_blank">
                  Générer PDF
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Note technique</h3>
          <p className="text-sm text-blue-600">
            Cette page utilise l'API <code>/api/test-payslip</code> qui génère des PDF sans authentification pour faciliter les tests.
            Pour l'intégration en production, utilisez plutôt l'API <code>/api/generate-payslip</code> qui nécessite une authentification.
          </p>
        </div>
      </div>
    </div>
  );
} 