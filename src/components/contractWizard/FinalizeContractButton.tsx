import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LockIcon, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
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

interface FinalizeContractButtonProps {
  contractId: string;
  memoryId?: string;
  className?: string;
  disabled?: boolean;
}

interface VerificationResult {
  contractType: string;
  isValid: boolean;
  warnings: string[];
  recommendation: string;
}

export function FinalizeContractButton({
  contractId,
  memoryId,
  className = '',
  disabled = false
}: FinalizeContractButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Fonction pour vérifier la cohérence du contrat
  const verifyContract = async () => {
    if (isVerifying) return;

    try {
      setIsVerifying(true);
      
      // Appeler la fonction Cloud de vérification
      const verifyContractConsistency = httpsCallable<
        { contractId?: string; memoryId?: string },
        VerificationResult
      >(functions, 'verifyContractConsistency');

      const verificationResponse = await verifyContractConsistency({
        contractId,
        memoryId
      });

      // Enregistrer le résultat de la vérification
      setVerificationResult(verificationResponse.data);
      
      // Afficher la boîte de dialogue avec les résultats
      setShowVerificationDialog(true);

    } catch (error) {
      console.error("Erreur lors de la vérification du contrat:", error);
      toast({
        title: "Erreur de vérification",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la vérification du contrat",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Fonction pour finaliser le contrat
  const handleFinalizeContract = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      // Confirmation de l'utilisateur
      const confirmFinalize = window.confirm(
        "Cette action va finaliser le contrat et générer un document PDF. Une fois finalisé, le contrat ne pourra plus être modifié. Voulez-vous continuer ?"
      );

      if (!confirmFinalize) {
        setIsLoading(false);
        return;
      }

      // Appeler la fonction Cloud pour générer le PDF
      const exportContractPdf = httpsCallable<
        { contractId: string; memoryId?: string },
        { pdfUrl: string; fileName: string; success: boolean; message?: string }
      >(functions, 'exportContractPdf');

      // Générer le PDF
      const exportResponse = await exportContractPdf({
        contractId,
        memoryId
      });

      if (!exportResponse.data.success) {
        throw new Error(exportResponse.data.message || "Échec de la génération du PDF");
      }

      // Verrouiller le contrat
      const lockContract = httpsCallable<
        { contractId: string },
        { success: boolean; message?: string }
      >(functions, 'lockContract');

      const lockResponse = await lockContract({
        contractId
      });

      if (!lockResponse.data.success) {
        throw new Error(lockResponse.data.message || "Échec du verrouillage du contrat");
      }

      // Notification de succès
      toast({
        title: "Contrat finalisé",
        description: "Le contrat a été finalisé et le PDF a été généré avec succès.",
        variant: "default",
      });

      // Redirection vers la page de visualisation
      router.push(`/dashboard/contracts/${contractId}/view`);

    } catch (error) {
      console.error("Erreur lors de la finalisation du contrat:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la finalisation du contrat",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={verifyContract}
          disabled={disabled || isVerifying || isLoading}
          variant="outline"
          className="gap-2"
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Vérification...
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              Vérifier le contrat
            </>
          )}
        </Button>
        
        <Button
          onClick={handleFinalizeContract}
          disabled={disabled || isLoading || isVerifying}
          className={`${className} gap-2`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Finalisation en cours...
            </>
          ) : (
            <>
              <LockIcon className="h-4 w-4" />
              Finaliser le contrat
            </>
          )}
        </Button>
      </div>

      <AlertDialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {verificationResult?.isValid 
                ? "Contrat valide" 
                : "Contrat incomplet ou non conforme"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>{verificationResult?.recommendation}</p>
              
              {verificationResult?.warnings && verificationResult.warnings.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold">Éléments à corriger:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {verificationResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Fermer</AlertDialogCancel>
            {verificationResult?.isValid && (
              <AlertDialogAction onClick={handleFinalizeContract}>
                Finaliser le contrat
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 