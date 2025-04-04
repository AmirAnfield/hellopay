"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  Building2,
  Edit,
  Eye,
  Lock,
  MoreVertical,
  Trash,
  Unlock,
  Users,
  ExternalLink,
  X,
  UserRound,
  Phone,
  Mail,
  Hash,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
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
import { doc, deleteDoc, updateDoc, getDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Types for the company
interface Company {
  id: string;
  name: string;
  siret: string;
  address?: string;
  addressComplement?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  employeeCount?: number;
  isLocked?: boolean;
  isArchived?: boolean;
  createdAt?: any;
  updatedAt?: any;
  ownerId?: string;
  legalForm?: string;
  apeCode?: string;
  urssafRegion?: string;
  collectiveAgreement?: string;
}

interface CompanyCardProps {
  company: Company;
  layout: 'grid' | 'list';
  onArchive?: () => void;
  onUnarchive?: () => void;
}

const CompanyCard = ({ company, layout, onArchive, onUnarchive }: CompanyCardProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<Company>(company);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  
  // États pour gérer les sections pliables/dépliables
  const [isInfoSectionOpen, setIsInfoSectionOpen] = useState(true);
  const [isAddressSectionOpen, setIsAddressSectionOpen] = useState(true);
  const [isAdditionalSectionOpen, setIsAdditionalSectionOpen] = useState(true);

  const handleEdit = () => {
    router.push(`/dashboard/companies/${company.id}/edit`);
  };

  const handleDelete = async () => {
    if (!auth.currentUser) return;
    
    setIsDeleting(true);
    try {
      const userId = auth.currentUser.uid;
      await deleteDoc(doc(db, `users/${userId}/companies`, company.id));
      
      toast({
        title: "Entreprise supprimée",
        description: `L'entreprise "${company.name}" a été supprimée avec succès.`,
      });
      
      // Rediriger vers la liste avec un message de succès
      router.push(`/dashboard/companies?action=deleted&name=${encodeURIComponent(company.name)}`);
      
    } catch (error) {
      console.error("Erreur lors de la suppression de l'entreprise:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer cette entreprise.",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  const handleLockToggle = async () => {
    if (!auth.currentUser) return;
    
    try {
      const userId = auth.currentUser.uid;
      const companyRef = doc(db, `users/${userId}/companies`, company.id);
      
      // Get current data to ensure we have the latest lock state
      const companyDoc = await getDoc(companyRef);
      if (!companyDoc.exists()) {
        throw new Error("Entreprise non trouvée");
      }
      
      const currentData = companyDoc.data();
      const newLockState = !currentData.isLocked;
      
      await updateDoc(companyRef, {
        isLocked: newLockState,
      });
      
      // Update local state
      setCompanyDetails({
        ...companyDetails,
        isLocked: newLockState,
      });
      
      toast({
        title: newLockState ? "Entreprise verrouillée" : "Entreprise déverrouillée",
        description: newLockState
          ? "Cette entreprise est maintenant protégée contre les modifications."
          : "Cette entreprise peut maintenant être modifiée.",
      });
    } catch (error) {
      console.error("Erreur lors du verrouillage/déverrouillage de l'entreprise:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier l'état de verrouillage.",
      });
    }
  };

  const handleArchive = async () => {
    if (!auth.currentUser) return;
    
    try {
      const userId = auth.currentUser.uid;
      const companyRef = doc(db, `users/${userId}/companies`, company.id);
      
      await updateDoc(companyRef, {
        isArchived: true,
      });
      
      // Update local state
      setCompanyDetails({
        ...companyDetails,
        isArchived: true,
      });
      
      toast({
        title: "Entreprise archivée",
        description: `L'entreprise "${company.name}" a été archivée.`,
      });
      
      if (onArchive) {
        onArchive();
      }
    } catch (error) {
      console.error("Erreur lors de l'archivage de l'entreprise:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'archiver cette entreprise.",
      });
    }
  };
  
  const handleUnarchive = async () => {
    if (!auth.currentUser) return;
    
    try {
      const userId = auth.currentUser.uid;
      const companyRef = doc(db, `users/${userId}/companies`, company.id);
      
      await updateDoc(companyRef, {
        isArchived: false,
      });
      
      // Update local state
      setCompanyDetails({
        ...companyDetails,
        isArchived: false,
      });
      
      toast({
        title: "Entreprise désarchivée",
        description: `L'entreprise "${company.name}" a été désarchivée.`,
      });
      
      if (onUnarchive) {
        onUnarchive();
      }
    } catch (error) {
      console.error("Erreur lors du désarchivage de l'entreprise:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de désarchiver cette entreprise.",
      });
    }
  };
  
  const handlePreview = async () => {
    if (!auth.currentUser) return;
    
    try {
      const userId = auth.currentUser.uid;
      const companyRef = doc(db, `users/${userId}/companies`, company.id);
      const companyDoc = await getDoc(companyRef);
      
      if (companyDoc.exists()) {
        const data = companyDoc.data() as Company;
        setCompanyDetails({
          ...data,
          id: company.id,
        });
        setShowPreviewDialog(true);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de l'entreprise:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les détails de cette entreprise.",
      });
    }
  };
  
  const getFirstLetters = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Gestion du contenu des sections pliables
  const toggleInfoSection = () => setIsInfoSectionOpen(!isInfoSectionOpen);
  const toggleAddressSection = () => setIsAddressSectionOpen(!isAddressSectionOpen);
  const toggleAdditionalSection = () => setIsAdditionalSectionOpen(!isAdditionalSectionOpen);

  // Si l'entreprise est archivée, affichage spécial
  if (company.isArchived) {
    return (
      <>
        <Card className="border-t-0 border-l-0 border-r-0 border-b">
          <div className="p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getFirstLetters(company.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-base">
                    {company.name}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">{company.siret}</p>
                </div>
              </div>
              <div className="flex flex-row gap-2 justify-end">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handlePreview}
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

  // Style similaire à EmployeeCard
  return (
    <>
      <Card className="border-t-0 border-l-0 border-r-0 border-b">
        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getFirstLetters(company.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base">
                  {company.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">{company.siret}</p>
              </div>
            </div>
            <div className="flex flex-row gap-2 justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handlePreview}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
                disabled={companyDetails.isLocked}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLockToggle}
                className="h-8 w-8 p-0"
              >
                {companyDetails.isLocked ? (
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
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="sticky top-0 bg-background z-10">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {companyDetails.name}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between cursor-pointer" onClick={toggleInfoSection}>
                  <h3 className="text-md font-medium">Informations de l'entreprise</h3>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    {isInfoSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                {isInfoSectionOpen && (
                  <div className="space-y-1.5 rounded-md border p-3 mt-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>Nom</span>
                      </div>
                      <div className="text-xs font-medium">
                        {companyDetails.name}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        <span>SIRET</span>
                      </div>
                      <div className="text-xs font-medium">{companyDetails.siret}</div>
                    </div>
                    
                    {companyDetails.legalForm && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Forme juridique</div>
                        <div className="text-xs font-medium">{companyDetails.legalForm}</div>
                      </div>
                    )}
                    
                    {companyDetails.apeCode && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Code APE</div>
                        <div className="text-xs font-medium">{companyDetails.apeCode}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between cursor-pointer" onClick={toggleAddressSection}>
                  <h3 className="text-md font-medium">Adresse</h3>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    {isAddressSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                {isAddressSectionOpen && (
                  <div className="space-y-1.5 rounded-md border p-3 mt-2">
                    {companyDetails.address && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Adresse</div>
                        <div className="text-xs font-medium">{companyDetails.address}</div>
                      </div>
                    )}
                    
                    {companyDetails.addressComplement && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Complément</div>
                        <div className="text-xs font-medium">{companyDetails.addressComplement}</div>
                      </div>
                    )}
                    
                    {(companyDetails.postalCode || companyDetails.city) && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Ville</div>
                        <div className="text-xs font-medium">
                          {companyDetails.postalCode && `${companyDetails.postalCode}, `}
                          {companyDetails.city}
                        </div>
                      </div>
                    )}
                    
                    {companyDetails.country && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Pays</div>
                        <div className="text-xs font-medium">{companyDetails.country}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between cursor-pointer" onClick={toggleAdditionalSection}>
                  <h3 className="text-md font-medium">Informations complémentaires</h3>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    {isAdditionalSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                {isAdditionalSectionOpen && (
                  <div className="space-y-1.5 rounded-md border p-3 mt-2">
                    {companyDetails.urssafRegion && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Région URSSAF</div>
                        <div className="text-xs font-medium">{companyDetails.urssafRegion}</div>
                      </div>
                    )}
                    
                    {companyDetails.collectiveAgreement && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="text-xs text-muted-foreground">Convention collective</div>
                        <div className="text-xs font-medium">{companyDetails.collectiveAgreement}</div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="text-xs text-muted-foreground">Employés</div>
                      <div className="text-xs font-medium">{companyDetails.employeeCount || 0}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="text-xs text-muted-foreground">Statut</div>
                      <div className="text-xs font-medium flex items-center gap-1">
                        {companyDetails.isLocked ? (
                          <>
                            <Lock className="h-3 w-3 text-amber-500" />
                            Verrouillée
                          </>
                        ) : (
                          <>
                            <Unlock className="h-3 w-3" />
                            Déverrouillée
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t pt-3 mt-4 flex justify-end gap-2 sticky bottom-0 bg-background">
            <Button onClick={() => setShowPreviewDialog(false)} variant="outline" size="sm" className="h-7 text-xs">
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette entreprise ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées à l&apos;entreprise &quot;{company.name}&quot; seront définitivement supprimées.
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

export default CompanyCard;