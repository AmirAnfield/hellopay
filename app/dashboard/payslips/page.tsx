'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { FileText, Download, Trash2, Search, FileDown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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

// Type pour les fiches de paie
type Payslip = {
  id: string;
  employerName: string;
  employerSiret: string;
  employeeFirstName: string;
  employeeLastName: string;
  employeePosition: string;
  period: string;
  grossSalary: number;
  netToPay: number;
  paymentDate: string;
  createdAt: string;
  fileName: string;
};

export default function PayslipsDashboard() {
  const { data: session, status } = useSession();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [filteredPayslips, setFilteredPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [payslipToDelete, setPayslipToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (status === 'unauthenticated') {
    redirect('/auth/login');
  }

  // Charger les fiches de paie
  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/get-payslips');
        if (response.ok) {
          const data = await response.json();
          setPayslips(data.payslips);
          setFilteredPayslips(data.payslips);
        } else {
          toast.error('Erreur lors du chargement des fiches de paie');
        }
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchPayslips();
    }
  }, [status]);

  // Filtrer les fiches de paie
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = payslips.filter(
        (payslip) =>
          payslip.employeeFirstName.toLowerCase().includes(term) ||
          payslip.employeeLastName.toLowerCase().includes(term) ||
          payslip.period.toLowerCase().includes(term) ||
          payslip.employerName.toLowerCase().includes(term)
      );
      setFilteredPayslips(filtered);
    } else {
      setFilteredPayslips(payslips);
    }
  }, [searchTerm, payslips]);

  // Télécharger une fiche de paie
  const handleDownload = (id: string) => {
    window.open(`/api/download-payslip/${id}`, '_blank');
  };

  // Supprimer une fiche de paie
  const confirmDelete = (id: string) => {
    setPayslipToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!payslipToDelete) return;
    
    try {
      const response = await fetch(`/api/delete-payslip/${payslipToDelete}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Mettre à jour l'état local
        const updatedPayslips = payslips.filter(payslip => payslip.id !== payslipToDelete);
        setPayslips(updatedPayslips);
        setFilteredPayslips(updatedPayslips);
        toast.success('Fiche de paie supprimée avec succès');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setPayslipToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Mes fiches de paie</CardTitle>
              <CardDescription>
                Consultez et gérez vos fiches de paie archivées.
              </CardDescription>
            </div>
            <Button onClick={() => redirect('/payslips')}>
              <FileDown className="mr-2 h-4 w-4" />
              Nouvelle fiche de paie
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, période..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
            </div>
          ) : filteredPayslips.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Salarié</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Montant net</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayslips.map((payslip) => (
                    <TableRow key={payslip.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-blue-500" />
                          <div>
                            <div>{payslip.employeeFirstName} {payslip.employeeLastName}</div>
                            <div className="text-xs text-muted-foreground">{payslip.employeePosition}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{payslip.period}</TableCell>
                      <TableCell>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(payslip.netToPay)}</TableCell>
                      <TableCell>{formatDate(payslip.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(payslip.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-100"
                            onClick={() => confirmDelete(payslip.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold">Aucune fiche de paie trouvée</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Aucun résultat pour votre recherche." 
                  : "Vous n'avez pas encore généré de fiches de paie."}
              </p>
              {!searchTerm && (
                <Button 
                  className="mt-4"
                  onClick={() => redirect('/payslips')}
                >
                  Générer votre première fiche de paie
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette fiche de paie ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 