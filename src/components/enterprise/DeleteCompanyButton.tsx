"use client";

import React, { useState } from 'react';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

interface DeleteCompanyButtonProps {
  companyId: string;
}

const DeleteCompanyButton: React.FC<DeleteCompanyButtonProps> = ({ companyId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      // Simuler un délai pour l'action de suppression
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // En environnement de développement, suppression du localStorage
      if (typeof window !== 'undefined') {
        try {
          const companiesStr = localStorage.getItem('companies');
          if (companiesStr) {
            const companies = JSON.parse(companiesStr);
            
            // Récupérer le nom de l'entreprise avant de la supprimer
            const companyToDelete = companies.find((c: { id: string }) => c.id === companyId);
            const companyName = companyToDelete?.name || '';
            
            // Filtrer pour supprimer l'entreprise avec l'ID correspondant
            const updatedCompanies = companies.filter((c: { id: string }) => c.id !== companyId);
            
            // Enregistrer le tableau mis à jour dans localStorage
            localStorage.setItem('companies', JSON.stringify(updatedCompanies));
            
            // Vérifier que la suppression a fonctionné
            const verificationStr = localStorage.getItem('companies');
            const verification = verificationStr ? JSON.parse(verificationStr) : [];
            
            toast({
              title: "Entreprise supprimée",
              description: "L'entreprise a été supprimée avec succès.",
            });
            
            // Rediriger vers la liste des entreprises après un court délai
            setTimeout(() => {
              // Forcer un rechargement complet de la page avec des paramètres d'action
              window.location.href = `/dashboard/companies?action=deleted&name=${encodeURIComponent(companyName)}`;
            }, 1500);
          }
        } catch (e) {
          console.error("Erreur lors de la suppression de l'entreprise du localStorage:", e);
        }
      }
      
    } catch (error) {
      console.error("Erreur lors de la suppression de l'entreprise:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'entreprise. Veuillez réessayer.",
      });
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setIsOpen(true)}
        size="sm"
      >
        <Trash className="h-4 w-4 mr-2" />
        Supprimer
      </Button>
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cette entreprise sera définitivement supprimée
              de notre serveur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground"
            >
              {isLoading ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteCompanyButton; 