'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Type pour une fiche de paie
type Payslip = {
  id: string;
  employeeName: string;
  period: string;
  createdAt: string;
  grossAmount: number;
  netAmount: number;
  status: 'generated' | 'sent' | 'paid';
};

// Données fictives pour la démonstration
const mockPayslips: Payslip[] = [
  {
    id: '1',
    employeeName: 'Jean Dupont',
    period: 'Janvier 2023',
    createdAt: '15/01/2023',
    grossAmount: 2500,
    netAmount: 1950,
    status: 'paid',
  },
  {
    id: '2',
    employeeName: 'Marie Martin',
    period: 'Janvier 2023',
    createdAt: '15/01/2023',
    grossAmount: 3200,
    netAmount: 2496,
    status: 'sent',
  },
  {
    id: '3',
    employeeName: 'Sophie Dubois',
    period: 'Janvier 2023',
    createdAt: '16/01/2023',
    grossAmount: 2800,
    netAmount: 2184,
    status: 'generated',
  },
];

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>(mockPayslips);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fonction pour supprimer une fiche de paie
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette fiche de paie ?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      setPayslips(payslips.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour afficher une fiche de paie
  const handleView = (id: string) => {
    // Dans un cas réel, on redirigerait vers la page de détail de la fiche de paie
    alert(`Affichage de la fiche de paie ID: ${id}`);
  };
  
  // Fonction pour télécharger une fiche de paie
  const handleDownload = async (id: string) => {
    setIsLoading(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Supprimer le console.log
      // Remplacer par une action plus appropriée si nécessaire
      window.open(`/api/download-payslip/${id}`, '_blank');
    } catch (error) {
      console.error('Erreur lors du téléchargement', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour envoyer une fiche de paie par e-mail
  const handleSend = async (id: string) => {
    setIsLoading(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Mettre à jour le statut
      setPayslips(payslips.map(p => p.id === id ? {...p, status: 'sent' as const} : p));
    } catch (error) {
      console.error('Erreur lors de l\'envoi', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher le statut sous forme plus lisible
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'generated': return 'Générée';
      case 'sent': return 'Envoyée';
      case 'paid': return 'Payée';
      default: return status;
    }
  };

  // Afficher le statut avec une couleur différente
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'generated': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fiches de paie</h1>
        <Link href="/payslips/create">
          <Button>Nouvelle fiche de paie</Button>
        </Link>
      </div>
      
      <Card className="p-6">
        {payslips.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Aucune fiche de paie trouvée</p>
            <Link href="/payslips/create">
              <Button>Créer votre première fiche de paie</Button>
            </Link>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employé</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Montant brut</TableHead>
                <TableHead>Montant net</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.map((payslip) => (
                <TableRow key={payslip.id}>
                  <TableCell className="font-medium">{payslip.employeeName}</TableCell>
                  <TableCell>{payslip.period}</TableCell>
                  <TableCell>{payslip.createdAt}</TableCell>
                  <TableCell>{payslip.grossAmount.toFixed(2)} €</TableCell>
                  <TableCell>{payslip.netAmount.toFixed(2)} €</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payslip.status)}`}>
                      {getStatusLabel(payslip.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleView(payslip.id)}
                        disabled={isLoading}
                      >
                        Voir
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDownload(payslip.id)}
                        disabled={isLoading}
                      >
                        Télécharger
                      </Button>
                      {payslip.status === 'generated' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleSend(payslip.id)}
                          disabled={isLoading}
                        >
                          Envoyer
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(payslip.id)}
                        disabled={isLoading}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
} 