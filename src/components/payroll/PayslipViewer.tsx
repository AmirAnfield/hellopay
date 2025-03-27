'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BulletinPaie } from '@/services/payroll/PayrollHistoryService';
import { EmployeeInfo, EmployerInfo, PayslipGeneratorService } from '@/services/payroll/PayslipGeneratorService';
import { Download, Save, Printer } from 'lucide-react';

interface PayslipViewerProps {
  bulletin: BulletinPaie;
  employee: EmployeeInfo;
  employer: EmployerInfo;
  onSave?: () => Promise<void>;
}

export default function PayslipViewer({ bulletin, employee, employer, onSave }: PayslipViewerProps) {
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Format des nombres avec 2 décimales
  const formatNumber = (num: number) => num.toFixed(2).replace('.', ',') + ' €';
  
  // Formater le mois (ex: Mars 2023)
  const formatMonthYear = (mois: number, annee: number) => {
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return `${monthNames[mois - 1]} ${annee}`;
  };
  
  // Télécharger le bulletin en PDF
  const handleDownloadPDF = async () => {
    try {
      setGenerating(true);
      
      // Simuler un délai de génération
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans l'implémentation réelle, nous utiliserions PDF-lib ou jsPDF
      // pour générer un PDF à partir du bulletin
      
      // Pour l'instant, nous utilisons simplement une alerte pour simuler
      alert(`Le PDF pour ${employee.lastName} ${employee.firstName} (${formatMonthYear(bulletin.mois, bulletin.annee)}) a été généré et téléchargé.`);
      
      setGenerating(false);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      setGenerating(false);
      alert('Erreur lors de la génération du PDF');
    }
  };
  
  // Sauvegarder le bulletin
  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setSaving(true);
      await onSave();
      setSaving(false);
      alert('Bulletin de paie sauvegardé avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaving(false);
      alert('Erreur lors de la sauvegarde du bulletin');
    }
  };
  
  return (
    <div className="mx-auto max-w-4xl p-4 bg-white rounded-lg shadow-lg border border-gray-200 print:shadow-none print:border-none">
      {/* En-tête du bulletin */}
      <div className="flex flex-col md:flex-row justify-between pb-4 border-b border-gray-300 print:pb-2">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-bold text-blue-800">{employer.name}</h2>
          <p className="text-sm text-gray-600">{employer.address}</p>
          <p className="text-sm text-gray-600">SIRET: {employer.siret}</p>
          <p className="text-sm text-gray-600">Code APE: {employer.apeCode}</p>
        </div>
        
        <div className="text-right">
          <h3 className="text-lg font-semibold">{employee.firstName} {employee.lastName}</h3>
          <p className="text-sm text-gray-600">{employee.position}</p>
          <p className="text-sm text-gray-600">
            Date d'embauche: {employee.hireDate.toLocaleDateString('fr-FR')}
          </p>
          <p className="text-sm text-gray-600">
            N° SS: {employee.socialSecurityNumber || 'Non renseigné'}
          </p>
        </div>
      </div>
      
      {/* Titre du bulletin */}
      <div className="text-center my-6">
        <h1 className="text-2xl font-bold">Bulletin de paie</h1>
        <p className="text-lg text-gray-600">{formatMonthYear(bulletin.mois, bulletin.annee)}</p>
      </div>
      
      {/* Détails du salaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Rémunération brute</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Salaire de base</td>
                  <td className="py-2 text-right">{formatNumber(bulletin.detailsBrut.base)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Heures supplémentaires (25%)</td>
                  <td className="py-2 text-right">{formatNumber(bulletin.detailsBrut.heureSup25)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Heures supplémentaires (50%)</td>
                  <td className="py-2 text-right">{formatNumber(bulletin.detailsBrut.heureSup50)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Primes</td>
                  <td className="py-2 text-right">{formatNumber(bulletin.detailsBrut.primes)}</td>
                </tr>
                <tr className="font-bold text-lg">
                  <td className="py-2">Total brut</td>
                  <td className="py-2 text-right">{formatNumber(bulletin.brutTotal)}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Cotisations salariales</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Santé</td>
                  <td className="py-2 text-right">{formatNumber(bulletin.detailsCotisations.santé)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Retraite</td>
                  <td className="py-2 text-right">{formatNumber(bulletin.detailsCotisations.retraite)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Chômage</td>
                  <td className="py-2 text-right">{formatNumber(bulletin.detailsCotisations.chômage)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Autres (CSG, CRDS...)</td>
                  <td className="py-2 text-right">{formatNumber(bulletin.detailsCotisations.autres)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2">Total cotisations</td>
                  <td className="py-2 text-right">{formatNumber(bulletin.totalCotisations)}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      
      {/* Salaire net et congés */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Net à payer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-2xl font-bold text-center text-blue-800">
                {formatNumber(bulletin.netTotal)}
              </p>
              <p className="text-center text-sm text-gray-600 mt-2">
                Virement effectué le 30/{bulletin.mois < 10 ? '0' + bulletin.mois : bulletin.mois}/{bulletin.annee}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Congés payés</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Congés acquis ce mois</td>
                  <td className="py-2 text-right">{bulletin.congesCumules} jours</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Congés pris</td>
                  <td className="py-2 text-right">{bulletin.congesPris} jours</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2">Solde congés</td>
                  <td className="py-2 text-right">
                    {(bulletin.congesCumules - bulletin.congesPris).toFixed(1)} jours
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      
      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 print:hidden">
        <Button
          onClick={handleDownloadPDF}
          disabled={generating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="mr-2 h-4 w-4" />
          {generating ? 'Génération...' : 'Télécharger le PDF'}
        </Button>
        
        {onSave && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder dans Supabase'}
          </Button>
        )}
        
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="border-gray-300"
        >
          <Printer className="mr-2 h-4 w-4" />
          Imprimer
        </Button>
      </div>
      
      {/* Pied de page */}
      <div className="mt-8 text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
        <p>
          Ce bulletin est établi à titre informatif. Pour toute question, veuillez contacter le service RH.
        </p>
        <p className="mt-1">
          Généré le {new Date().toLocaleDateString('fr-FR')} par HelloPay
        </p>
      </div>
    </div>
  );
} 