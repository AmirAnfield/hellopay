"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';

export default function TestPayslipPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleGeneratePayslip = async (type: string) => {
    setLoading(type);
    
    try {
      // Appeler l'API de test
      const response = await fetch(`/api/test-payslip?type=${type}`, {
        method: 'GET',
      });
      
      if (response.ok) {
        // Créer un objet URL pour le téléchargement
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Télécharger automatiquement le fichier
        const a = document.createElement('a');
        const filename = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || `fiche_paie_${type}.pdf`;
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        console.error('Erreur lors de la génération de la fiche de paie:', await response.text());
        alert('Erreur lors de la génération de la fiche de paie. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération de la fiche de paie. Veuillez réessayer.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Tester la génération de fiches de paie</h1>
      
      <p className="mb-6 text-gray-600">
        Cette page vous permet de générer rapidement des fiches de paie à partir de données de test prédéfinies.
        Sélectionnez l&apos;un des profils ci-dessous pour générer un PDF.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Employé à temps plein</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium">Jean Dupont</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Poste</p>
                <p className="font-medium">Développeur Web</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rémunération</p>
                <p className="font-medium">151.67h × 20€/h = 3,033.40€ brut</p>
              </div>
              <Button 
                onClick={() => handleGeneratePayslip('fullTime')}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2"
              >
                {loading === 'fullTime' ? 'Génération...' : (
                  <>
                    <Download className="h-4 w-4" /> Générer PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Employé à temps partiel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium">Marie Martin</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Poste</p>
                <p className="font-medium">Assistant administratif</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rémunération</p>
                <p className="font-medium">86.67h × 15€/h = 1,300.05€ brut</p>
              </div>
              <Button 
                onClick={() => handleGeneratePayslip('partTime')}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2"
              >
                {loading === 'partTime' ? 'Génération...' : (
                  <>
                    <Download className="h-4 w-4" /> Générer PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Employé avec heures sup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nom</p>
                <p className="font-medium">Thomas Bernard</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Poste</p>
                <p className="font-medium">Technicien de maintenance</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rémunération</p>
                <p className="font-medium">169.67h × 18€/h = 3,129.06€ brut</p>
              </div>
              <Button 
                onClick={() => handleGeneratePayslip('overtime')}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2"
              >
                {loading === 'overtime' ? 'Génération...' : (
                  <>
                    <Download className="h-4 w-4" /> Générer PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Comment ça marche ?</h2>
        <p className="text-gray-600 mb-2">
          Cette page utilise notre API pour générer des fiches de paie à partir de données prédéfinies.
          Le processus est le suivant :
        </p>
        <ol className="list-decimal pl-5 text-gray-600 space-y-1">
          <li>Sélection du type d&apos;employé (temps plein, temps partiel, heures supplémentaires)</li>
          <li>Appel à l&apos;API avec les données prédéfinies</li>
          <li>Génération d&apos;un document HTML formaté</li>
          <li>Conversion du HTML en PDF avec Puppeteer</li>
          <li>Téléchargement automatique du fichier PDF généré</li>
        </ol>
      </div>
    </div>
  );
} 