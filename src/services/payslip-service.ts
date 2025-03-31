import { auth, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { getDocument, getDocuments, setDocument, deleteDocument, updateDocument } from './firestore-service';
import { getCompany } from './company-service';
import { getEmployee } from './employee-service';
import { uploadEmployeeDocument, getDocumentUrl, deleteDocument as deleteStorageDocument } from './storage-service';
import { Payslip as FirebasePayslip } from '@/types/firebase';
import { payslipValidationSchema } from '@/schemas/validation-schemas';
import { validateOrThrow, sanitizeData } from '@/lib/utils/firestore-validation';
import { formatFileSize } from '@/lib/utils/file-utils';

// Export du type pour les bulletins de paie
export type Payslip = FirebasePayslip;

// Type pour la création d'un bulletin de paie
export interface PayslipInput {
  companyId: string;
  employeeId: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  paymentDate: Date | string;
  hoursWorked: number;
  paidLeaveTaken: number;
  additionalInfo?: {
    bonusAmount?: number;
    bonusDescription?: string;
    overtimeHours?: number;
    [key: string]: unknown;
  };
}

/**
 * Obtenir tous les bulletins de paie
 */
export async function getUserPayslips(options: {
  companyId?: string;
  employeeId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: 'draft' | 'final';
  limit?: number;
} = {}): Promise<Payslip[]> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  const where = [];
  
  // Filtrer par entreprise
  if (options.companyId) {
    where.push({ field: 'companyId', operator: '==', value: options.companyId });
  }
  
  // Filtrer par employé
  if (options.employeeId) {
    where.push({ field: 'employeeId', operator: '==', value: options.employeeId });
  }
  
  // Filtrer par date de début
  if (options.startDate) {
    const startDate = options.startDate instanceof Date 
      ? options.startDate 
      : new Date(options.startDate);
    
    where.push({ field: 'periodStart', operator: '>=', value: startDate });
  }
  
  // Filtrer par date de fin
  if (options.endDate) {
    const endDate = options.endDate instanceof Date 
      ? options.endDate 
      : new Date(options.endDate);
    
    where.push({ field: 'periodEnd', operator: '<=', value: endDate });
  }
  
  // Filtrer par statut
  if (options.status) {
    where.push({ field: 'status', operator: '==', value: options.status });
  }
  
  return getDocuments<Payslip>(`users/${auth.currentUser.uid}/payslips`, {
    where,
    orderBy: [{ field: 'periodStart', direction: 'desc' }],
    limit: options.limit
  });
}

/**
 * Obtenir les bulletins de paie d'un employé
 */
export async function getEmployeePayslips(employeeId: string, companyId: string): Promise<Payslip[]> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  return getDocuments<Payslip>(
    `users/${auth.currentUser.uid}/companies/${companyId}/payslips`,
    {
      where: [{ field: 'employeeId', operator: '==', value: employeeId }],
      orderBy: [{ field: 'year', direction: 'desc' }, { field: 'month', direction: 'desc' }]
    }
  );
}

/**
 * Obtenir un bulletin de paie par son ID
 */
export async function getPayslip(payslipId: string, companyId: string): Promise<Payslip | null> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  return getDocument<Payslip>(
    `users/${auth.currentUser.uid}/companies/${companyId}/payslips`,
    payslipId
  );
}

/**
 * Calculer un bulletin de paie
 */
export async function calculatePayslip(payslipData: PayslipInput): Promise<Payslip> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Vérifier que l'entreprise existe
  const company = await getCompany(payslipData.companyId);
  if (!company) {
    throw new Error("Entreprise non trouvée");
  }
  
  // Vérifier que l'employé existe
  const employee = await getEmployee(payslipData.companyId, payslipData.employeeId);
  if (!employee) {
    throw new Error("Employé non trouvé");
  }
  
  // Convertir les dates
  const periodStart = payslipData.periodStart instanceof Date
    ? payslipData.periodStart
    : new Date(payslipData.periodStart);
    
  const periodEnd = payslipData.periodEnd instanceof Date
    ? payslipData.periodEnd
    : new Date(payslipData.periodEnd);
    
  const paymentDate = payslipData.paymentDate instanceof Date
    ? payslipData.paymentDate
    : new Date(payslipData.paymentDate);
  
  // Récupérer l'année fiscale
  const fiscalYear = periodStart.getFullYear();
  
  // Appeler la fonction Firebase pour le calcul du bulletin
  const calculatePayslipFunction = httpsCallable<{
    userId: string;
    employee: Record<string, unknown>;
    company: Record<string, unknown>;
    payslipData: Record<string, unknown>;
  }, Payslip>(functions, 'calculatePayslip');
  
  try {
    const result = await calculatePayslipFunction({
      userId: auth.currentUser.uid,
      employee: employee as unknown as Record<string, unknown>,
      company: company as unknown as Record<string, unknown>,
      payslipData: {
        ...payslipData,
        periodStart,
        periodEnd,
        paymentDate,
        fiscalYear
      }
    });
    
    return result.data;
  } catch (error) {
    console.error('Erreur lors du calcul du bulletin:', error);
    throw new Error(`Erreur lors du calcul du bulletin: ${(error as Error).message}`);
  }
}

/**
 * Générer un bulletin de paie
 */
export async function generatePayslip(payslipData: PayslipInput): Promise<string> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Calculer le bulletin
  const calculatedPayslip = await calculatePayslip(payslipData);
  
  // Générer un ID unique pour le bulletin
  const payslipId = `payslip_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Appeler la fonction Firebase pour générer le PDF
  const generatePayslipPdfFunction = httpsCallable<{
    userId: string;
    payslip: Payslip;
  }, { pdfUrl: string }>(functions, 'generatePayslipPdf');
  
  try {
    // Enregistrer le bulletin en tant que brouillon
    await setDocument(`users/${auth.currentUser.uid}/payslips`, payslipId, {
      ...calculatedPayslip,
      id: payslipId,
      status: 'draft',
      locked: false
    }, false);
    
    // Enregistrer également dans la sous-collection de l'employé
    await setDocument(
      `users/${auth.currentUser.uid}/companies/${payslipData.companyId}/employees/${payslipData.employeeId}/payslips`, 
      payslipId, 
      {
        ...calculatedPayslip,
        id: payslipId,
        status: 'draft',
        locked: false
      }, 
      false
    );
    
    // Générer le PDF
    const result = await generatePayslipPdfFunction({
      userId: auth.currentUser.uid,
      payslip: {
        ...calculatedPayslip,
        id: payslipId
      }
    });
    
    // Mettre à jour l'URL du PDF
    await setDocument(`users/${auth.currentUser.uid}/payslips`, payslipId, {
      pdfUrl: result.data.pdfUrl
    }, true);
    
    // Mettre à jour également dans la sous-collection de l'employé
    await setDocument(
      `users/${auth.currentUser.uid}/companies/${payslipData.companyId}/employees/${payslipData.employeeId}/payslips`, 
      payslipId, 
      {
        pdfUrl: result.data.pdfUrl
      }, 
      true
    );
    
    return payslipId;
  } catch (error) {
    console.error('Erreur lors de la génération du bulletin:', error);
    throw new Error(`Erreur lors de la génération du bulletin: ${(error as Error).message}`);
  }
}

/**
 * Valider un bulletin de paie (passage de brouillon à final)
 */
export async function validatePayslip(payslipId: string, companyId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Récupérer le bulletin
  const existingPayslip = await getPayslip(payslipId, companyId);
  if (!existingPayslip) {
    throw new Error("Bulletin de paie non trouvé");
  }
  
  // Vérifier que le bulletin est au statut brouillon
  if (existingPayslip.status !== 'draft') {
    throw new Error("Ce bulletin est déjà validé");
  }
  
  // Mettre à jour le statut du bulletin
  await setDocument(`users/${auth.currentUser.uid}/payslips`, payslipId, {
    status: 'final',
    locked: true,
    validatedAt: new Date(),
    validatedBy: auth.currentUser.uid
  }, true);
  
  // Mettre à jour également dans la sous-collection de l'employé
  await setDocument(
    `users/${auth.currentUser.uid}/companies/${companyId}/employees/${existingPayslip.employeeId}/payslips`, 
    payslipId, 
    {
      status: 'final',
      locked: true,
      validatedAt: new Date(),
      validatedBy: auth.currentUser.uid
    }, 
    true
  );
}

/**
 * Supprimer un bulletin de paie (uniquement s'il est au statut brouillon)
 */
export async function deletePayslip(payslipId: string, companyId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Récupérer le bulletin
  const existingPayslip = await getPayslip(payslipId, companyId);
  if (!existingPayslip) {
    throw new Error("Bulletin de paie non trouvé");
  }
  
  // Vérifier que le bulletin est au statut brouillon et non verrouillé
  if (existingPayslip.status !== 'draft' || existingPayslip.locked) {
    throw new Error("Impossible de supprimer un bulletin validé ou verrouillé");
  }
  
  // Si un PDF est associé, supprimer le fichier
  if (existingPayslip.pdfUrl) {
    try {
      await deleteStorageDocument(existingPayslip.employeeId, 'payslip', payslipId);
      console.log("Fichier PDF du bulletin supprimé");
    } catch (storageError) {
      console.warn("Impossible de supprimer le fichier PDF:", storageError);
      // On continue quand même pour supprimer l'entrée Firestore
    }
  }
  
  // Supprimer le bulletin
  await deleteDocument(
    `users/${auth.currentUser.uid}/companies/${companyId}/payslips`,
    payslipId
  );
  
  // Supprimer également de la sous-collection de l'employé
  try {
    await deleteDocument(
      `users/${auth.currentUser.uid}/companies/${companyId}/employees/${existingPayslip.employeeId}/payslips`,
      payslipId
    );
  } catch (deleteError) {
    console.warn("Impossible de supprimer le bulletin de la sous-collection de l'employé:", deleteError);
    // Non critique, on continue
  }
}

/**
 * Options pour la création ou mise à jour d'un bulletin de paie
 */
export interface PayslipCreateUpdateOptions {
  /** Le fichier PDF du bulletin */
  pdfFile?: File;
  /** Chemin personnalisé pour le stockage du PDF */
  pdfCustomPath?: string;
  /** Générer une URL de téléchargement temporaire */
  generateTemporaryUrl?: boolean;
  /** Durée de validité de l'URL temporaire en secondes */
  temporaryUrlDuration?: number;
}

/**
 * Créer un nouveau bulletin de paie
 * @param companyId ID de l'entreprise
 * @param payslipData Données du bulletin
 * @param options Options supplémentaires
 * @returns ID du bulletin créé
 */
export async function createPayslip(
  companyId: string,
  payslipData: Partial<Payslip>,
  options?: PayslipCreateUpdateOptions
): Promise<string> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Valider les données avec le schéma
  validateOrThrow(payslipData, payslipValidationSchema);
  
  // Générer un ID unique pour le bulletin
  const payslipId = `payslip_${payslipData.year}_${payslipData.month}_${Date.now()}`;
  
  // Si un fichier PDF est fourni, le télécharger
  let pdfUrl: string | undefined;
  if (options?.pdfFile) {
    try {
      pdfUrl = await uploadEmployeeDocument(
        options.pdfFile,
        payslipData.employeeId as string,
        'payslip',
        payslipId,
        {
          customPath: options.pdfCustomPath,
          compress: true,
          maxSizeMB: 1,
          metadata: {
            month: payslipData.month?.toString() || '',
            year: payslipData.year?.toString() || '',
            companyId,
          }
        }
      );
      
      console.log(`Bulletin PDF téléchargé: ${formatFileSize(options.pdfFile.size)}`);
    } catch (uploadError: unknown) {
      console.error("Erreur lors du téléchargement du PDF:", uploadError);
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Erreur inconnue";
      throw new Error(`Impossible de télécharger le PDF: ${errorMessage}`);
    }
  }
  
  // Compléter les données avec l'URL du PDF
  const completeData: Partial<Payslip> = {
    ...payslipData,
    ...(pdfUrl && { pdfUrl }),
    locked: false, // Par défaut, le bulletin n'est pas verrouillé
  };
  
  // Nettoyer les données selon le schéma
  const sanitizedData = sanitizeData(completeData, payslipValidationSchema);
  
  // Créer le bulletin dans Firestore
  await setDocument(
    `users/${auth.currentUser.uid}/companies/${companyId}/payslips`,
    payslipId,
    sanitizedData,
    false
  );
  
  // Créer également dans la sous-collection de l'employé si l'ID est disponible
  if (payslipData.employeeId) {
    await setDocument(
      `users/${auth.currentUser.uid}/companies/${companyId}/employees/${payslipData.employeeId}/payslips`,
      payslipId,
      sanitizedData,
      false
    );
  }
  
  return payslipId;
}

/**
 * Mettre à jour un bulletin de paie existant
 * @param payslipId ID du bulletin
 * @param companyId ID de l'entreprise
 * @param payslipData Données à mettre à jour
 * @param options Options supplémentaires
 */
export async function updatePayslip(
  payslipId: string,
  companyId: string,
  payslipData: Partial<Payslip>,
  options?: PayslipCreateUpdateOptions
): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Récupérer le bulletin existant
  const existingPayslip = await getPayslip(payslipId, companyId);
  if (!existingPayslip) {
    throw new Error("Bulletin de paie non trouvé");
  }
  
  // Vérifier que le bulletin n'est pas verrouillé
  if (existingPayslip.locked) {
    throw new Error("Impossible de modifier un bulletin verrouillé");
  }
  
  // Valider les données avec le schéma
  validateOrThrow(payslipData, payslipValidationSchema);
  
  // Si un fichier PDF est fourni, le télécharger et mettre à jour l'URL
  let pdfUrl: string | undefined;
  if (options?.pdfFile) {
    try {
      pdfUrl = await uploadEmployeeDocument(
        options.pdfFile,
        existingPayslip.employeeId,
        'payslip',
        payslipId,
        {
          customPath: options.pdfCustomPath,
          compress: true,
          maxSizeMB: 1,
          metadata: {
            month: (payslipData.month || existingPayslip.month).toString(),
            year: (payslipData.year || existingPayslip.year).toString(),
            companyId,
          }
        }
      );
      
      console.log(`Bulletin PDF mis à jour: ${formatFileSize(options.pdfFile.size)}`);
    } catch (uploadError: unknown) {
      console.error("Erreur lors de la mise à jour du PDF:", uploadError);
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Erreur inconnue";
      throw new Error(`Impossible de mettre à jour le PDF: ${errorMessage}`);
    }
  }
  
  // Compléter les données avec l'URL du PDF si mise à jour
  const updateData: Partial<Payslip> = {
    ...payslipData,
    ...(pdfUrl && { pdfUrl }),
  };
  
  // Nettoyer les données selon le schéma
  const sanitizedData = sanitizeData(updateData, payslipValidationSchema);
  
  // Mettre à jour le bulletin dans Firestore
  await updateDocument(
    `users/${auth.currentUser.uid}/companies/${companyId}/payslips`,
    payslipId,
    sanitizedData
  );
  
  // Mettre à jour également dans la sous-collection de l'employé
  await updateDocument(
    `users/${auth.currentUser.uid}/companies/${companyId}/employees/${existingPayslip.employeeId}/payslips`,
    payslipId,
    sanitizedData
  );
}

/**
 * Obtenir l'URL de téléchargement d'un bulletin de paie
 * @param payslipId ID du bulletin
 * @param companyId ID de l'entreprise
 * @returns URL de téléchargement
 */
export async function getPayslipPdfUrl(payslipId: string, companyId: string): Promise<string> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Récupérer le bulletin
  const payslip = await getPayslip(payslipId, companyId);
  if (!payslip) {
    throw new Error("Bulletin de paie non trouvé");
  }
  
  // Si le bulletin a déjà une URL, la retourner
  if (payslip.pdfUrl) {
    return payslip.pdfUrl;
  }
  
  // Sinon, essayer de récupérer l'URL via Storage
  try {
    return await getDocumentUrl(payslip.employeeId, 'payslip', payslipId);
  } catch (downloadError) {
    console.error("Erreur lors de la récupération de l'URL du PDF:", downloadError);
    throw new Error("Aucun PDF trouvé pour ce bulletin de paie");
  }
} 