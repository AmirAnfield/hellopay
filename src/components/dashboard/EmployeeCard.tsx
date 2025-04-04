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

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  addressComplement?: string;
  postalCode: string;
  city: string;
  birthDate: string;
  birthPlace?: string;
  nationality?: string;
  socialSecurityNumber?: string;
  iban?: string;
  hiringDate?: string;
  position?: string;
  isLocked?: boolean;
  isArchived?: boolean;
  company?: {
    id: string;
    name: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface EmployeeCardProps {
  employee: Employee;
  layout?: 'grid' | 'list';
  onDelete?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
}

const EmployeeCard = ({ 
  employee, 
  onDelete, 
  onArchive, 
  onUnarchive 
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
  const initials = `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();

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
      <>
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
      </>
    );
  }

  // Affichage en grille
  return (
    <>
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
      </Card>
        
      {/* Dialog pour la prévisualisation */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="sticky top-0 bg-background z-10">
            <DialogTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              {employeeDetails && `${employeeDetails.firstName} ${employeeDetails.lastName}`}
            </DialogTitle>
          </DialogHeader>
          {employeeDetails && (
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-md font-medium mb-2">Informations personnelles</h3>
                  <div className="space-y-1.5 rounded-md border p-3">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <UserRound className="h-3 w-3" />
                        <span>Nom complet</span>
                      </div>
                      <div className="text-xs font-medium">
                        {employeeDetails.firstName} {employeeDetails.lastName}
                      </div>
                    </div>
                    
                    {employeeDetails.email && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>Email</span>
                        </div>
                        <div className="text-xs font-medium">{employeeDetails.email}</div>
                      </div>
                    )}
                    
                    {employeeDetails.phoneNumber && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>Téléphone</span>
                        </div>
                        <div className="text-xs font-medium">{employeeDetails.phoneNumber}</div>
                      </div>
                    )}
                    
                    {employeeDetails.birthDate && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Date de naissance</div>
                        <div className="text-xs font-medium">
                          {format(new Date(employeeDetails.birthDate), 'dd MMMM yyyy', { locale: fr })}
                        </div>
                      </div>
                    )}
                    
                    {employeeDetails.birthPlace && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Lieu de naissance</div>
                        <div className="text-xs font-medium">{employeeDetails.birthPlace}</div>
                      </div>
                    )}
                    
                    {employeeDetails.nationality && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Nationalité</div>
                        <div className="text-xs font-medium">{employeeDetails.nationality}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-md font-medium mb-2">Adresse</h3>
                  <div className="space-y-1.5 rounded-md border p-3">
                    {employeeDetails.address && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Adresse</div>
                        <div className="text-xs font-medium">{employeeDetails.address}</div>
                      </div>
                    )}
                    
                    {employeeDetails.addressComplement && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Complément</div>
                        <div className="text-xs font-medium">{employeeDetails.addressComplement}</div>
                      </div>
                    )}
                    
                    {(employeeDetails.postalCode || employeeDetails.city) && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Ville</div>
                        <div className="text-xs font-medium">
                          {employeeDetails.postalCode && `${employeeDetails.postalCode}, `}
                          {employeeDetails.city}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-md font-medium mb-2">Informations administratives</h3>
                  <div className="space-y-1.5 rounded-md border p-3">
                    {employeeDetails.socialSecurityNumber && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          <span>Numéro de sécurité sociale</span>
                        </div>
                        <div className="text-xs font-medium">{employeeDetails.socialSecurityNumber}</div>
                      </div>
                    )}
                    
                    {employeeDetails.iban && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          <span>IBAN</span>
                        </div>
                        <div className="text-xs font-medium">
                          {employeeDetails.iban.substring(0, 4)}
                          {'•'.repeat(Math.max(0, employeeDetails.iban.length - 8))}
                          {employeeDetails.iban.substring(employeeDetails.iban.length - 4)}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="text-xs text-muted-foreground">Statut</div>
                      <div className="text-xs font-medium flex items-center gap-1">
                        {employeeDetails.isLocked ? (
                          <>
                            <Lock className="h-3 w-3 text-amber-500" />
                            Verrouillé
                          </>
                        ) : (
                          <>
                            <Unlock className="h-3 w-3" />
                            Déverrouillé
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-md font-medium mb-2">Informations professionnelles</h3>
                  <div className="space-y-1.5 rounded-md border p-3">
                    {employeeDetails.position && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Poste</div>
                        <div className="text-xs font-medium">{employeeDetails.position}</div>
                      </div>
                    )}
                    
                    {employeeDetails.hiringDate && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Date d&apos;embauche</div>
                        <div className="text-xs font-medium">
                          {format(new Date(employeeDetails.hiringDate), 'dd MMMM yyyy', { locale: fr })}
                        </div>
                      </div>
                    )}
                    
                    {employeeDetails.company && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>Entreprise</span>
                        </div>
                        <div className="text-xs font-medium">{employeeDetails.company.name}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="border-t pt-3 mt-4 flex justify-end gap-2 sticky bottom-0 bg-background">
            <Button onClick={() => setIsPreviewOpen(false)} variant="outline" size="sm" className="h-7 text-xs">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Alerte de suppression */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet employé ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées à l&apos;employé &quot;{employee.firstName} {employee.lastName}&quot; seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmployeeCard; 