"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { 
  UserRound, 
  Mail,
  Phone,
  CreditCard,
  Hash,
  Building2,
  Edit,
  Eye,
  Archive,
  Lock,
  Unlock,
  Trash,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { Employee } from '@/types/firebase';

// Interface locale pour les props du composant
interface EmployeeCardProps {
  employee: Employee;
  layout?: 'grid' | 'list';
  onDelete?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onEmployeeUpdated?: () => void;
}

const EmployeeCard = ({ 
  employee, 
  onDelete, 
  onArchive, 
  onUnarchive,
  onEmployeeUpdated
}: EmployeeCardProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [employeeDetails, setEmployeeDetails] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(employee.isLocked || false);
  
  // Préparation des initiales pour l'avatar
  const initials = `${employee.firstName?.charAt(0) || ''}${employee.lastName?.charAt(0) || ''}`.toUpperCase();

  const handleView = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour voir cet employé.",
          variant: "destructive",
        });
        return;
      }

      // Récupérer l'employé depuis la collection employees (non nested)
      const employeeDoc = await getDoc(doc(db, "employees", employee.id));
      
      if (!employeeDoc.exists()) {
        // Si l'employé n'existe pas dans la collection principale, essayer dans les sous-collections d'entreprises
        let foundEmployee = false;
        
        // Récupérer l'employé directement dans la collection utilisateur/employés
        const employeeNestedDoc = await getDoc(doc(db, `users/${user.uid}/employees`, employee.id));
        
        if (employeeNestedDoc.exists()) {
          // Cast the data to Employee and include the id
          const employeeData = {
            id: employeeNestedDoc.id,
            ...employeeNestedDoc.data(),
          } as Employee;
          
          setEmployeeDetails(employeeData);
          foundEmployee = true;
        }
        
        if (!foundEmployee) {
          toast({
            title: "Erreur",
            description: "Cet employé n'existe pas.",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Cast the data to Employee and include the id
        const employeeData = {
          id: employeeDoc.id,
          ...employeeDoc.data()
        } as Employee;

        setEmployeeDetails(employeeData);
      }
      
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error fetching employee:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les détails de l'employé.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/employees/${employee.id}/edit`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour supprimer cet employé.",
          variant: "destructive",
        });
        return;
      }
      
      await deleteDoc(doc(db, `users/${user.uid}/employees`, employee.id));
      
      toast({
        title: "Employé supprimé",
        description: `L'employé ${employee.firstName} ${employee.lastName} a été supprimé avec succès.`,
      });
      
      if (onDelete) {
        onDelete();
      } else if (onEmployeeUpdated) {
        onEmployeeUpdated();
      }
      
      setShowDeleteAlert(false);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer cet employé.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleArchive = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour archiver cet employé.",
          variant: "destructive",
        });
        return;
      }
      
      const employeeRef = doc(db, `users/${user.uid}/employees`, employee.id);
      await updateDoc(employeeRef, {
        isArchived: true,
      });
      
      toast({
        title: "Employé archivé",
        description: `L'employé ${employee.firstName} ${employee.lastName} a été archivé.`,
      });
      
      if (onArchive) {
        onArchive();
      } else if (onEmployeeUpdated) {
        onEmployeeUpdated();
      }
    } catch (error) {
      console.error("Erreur lors de l'archivage:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'archiver cet employé.",
        variant: "destructive",
      });
    }
  };
  
  const handleUnarchive = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour désarchiver cet employé.",
          variant: "destructive",
        });
        return;
      }
      
      const employeeRef = doc(db, `users/${user.uid}/employees`, employee.id);
      await updateDoc(employeeRef, {
        isArchived: false,
      });
      
      toast({
        title: "Employé désarchivé",
        description: `L'employé ${employee.firstName} ${employee.lastName} a été désarchivé.`,
      });
      
      if (onUnarchive) {
        onUnarchive();
      } else if (onEmployeeUpdated) {
        onEmployeeUpdated();
      }
    } catch (error) {
      console.error("Erreur lors du désarchivage:", error);
      toast({
        title: "Erreur",
        description: "Impossible de désarchiver cet employé.",
        variant: "destructive",
      });
    }
  };
  
  const handleLockToggle = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour verrouiller/déverrouiller cet employé.",
          variant: "destructive",
        });
        return;
      }
      
      const employeeRef = doc(db, `users/${user.uid}/employees`, employee.id);
      const employeeDoc = await getDoc(employeeRef);
      
      if (!employeeDoc.exists()) {
        throw new Error("Employé non trouvé");
      }
      
      const currentData = employeeDoc.data();
      const newLockState = !currentData.isLocked;
      
      await updateDoc(employeeRef, {
        isLocked: newLockState,
      });
      
      // Mettre à jour l'état local
      setIsLocked(newLockState);
      
      if (employeeDetails) {
        setEmployeeDetails({
          ...employeeDetails,
          isLocked: newLockState,
        });
      }
      
      toast({
        title: newLockState ? "Employé verrouillé" : "Employé déverrouillé",
        description: newLockState
          ? "Cet employé est maintenant protégé contre les modifications."
          : "Cet employé peut maintenant être modifié.",
      });
      
      if (onEmployeeUpdated) {
        onEmployeeUpdated();
      }
    } catch (error) {
      console.error("Erreur lors du verrouillage/déverrouillage:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier l'état de verrouillage.",
      });
    }
  };
  
  // Affichage spécial pour les archives
  if (employee.isArchived) {
    return (
      <Card className="border-t-0 border-l-0 border-r-0 border-b">
        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base">
                  {employee.firstName} {employee.lastName}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {employee.position || 'Non spécifié'}
                </p>
              </div>
            </div>
            <div className="flex flex-row gap-2 justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleView}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleUnarchive}
                className="h-8 w-8 p-0"
              >
                <Archive className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Affichage standard
  return (
    <Card className="border-t-0 border-l-0 border-r-0 border-b">
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-base">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-xs text-muted-foreground truncate">{employee.position || 'Non spécifié'}</p>
            </div>
          </div>
          <div className="flex flex-row gap-2 justify-end">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleView}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0"
              disabled={isLocked}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLockToggle}
              className="h-8 w-8 p-0"
            >
              {isLocked ? (
                <Lock className="h-4 w-4 text-amber-500" />
              ) : (
                <Unlock className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleArchive}
              className="h-8 w-8 p-0"
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDeleteAlert(true)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Boîte de dialogue de confirmation de suppression */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet employé ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cet employé sera définitivement supprimé
              de votre base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default EmployeeCard; 