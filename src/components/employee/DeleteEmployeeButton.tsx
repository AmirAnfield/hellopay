'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DeleteConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { Trash2 } from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface DeleteEmployeeButtonProps {
  employeeId: string;
  companyId: string;
  employeeName: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onSuccess?: () => void;
  className?: string;
  iconOnly?: boolean;
}

export default function DeleteEmployeeButton({ 
  employeeId, 
  companyId,
  employeeName,
  variant = 'destructive',
  size = 'sm',
  onSuccess,
  className,
  iconOnly = false
}: DeleteEmployeeButtonProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Supprimer l'employé de Firestore
      const employeeRef = doc(db, 'employees', employeeId);
      await deleteDoc(employeeRef);
      
      // Notification de succès
      toast({
        title: "Employé supprimé",
        description: `${employeeName} a été supprimé avec succès.`,
      });
      
      // Callback de succès (si fourni)
      if (onSuccess) {
        onSuccess();
      } else {
        // Rediriger vers la liste des employés de l'entreprise
        router.push(`/dashboard/companies/${companyId}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'employé:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'employé.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DeleteConfirmationDialog
      itemName={employeeName}
      onConfirm={handleDelete}
      trigger={
        <Button 
          variant={variant} 
          size={size}
          disabled={isDeleting}
          className={className}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {!iconOnly && "Supprimer"}
        </Button>
      }
    />
  );
} 