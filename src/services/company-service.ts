import { auth } from '@/lib/firebase';
import { getDocument, getDocuments, setDocument, deleteDocument, updateDocument } from './firestore-service';
import { Company as FirebaseCompany } from '@/types/firebase';
import { companyValidationSchema } from '@/schemas/validation-schemas';
import { validateOrThrow, sanitizeData } from '@/lib/utils/firestore-validation';

// Type pour les entreprises (compatible avec l'existant)
export interface Company {
  id: string;
  name: string;
  siret: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  activityCode?: string;
  urssafNumber?: string;
  legalForm?: string;
  vatNumber?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  iban?: string;
  bic?: string;
  legalRepresentative?: string;
  legalRepresentativeRole?: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

// Type pour la création/mise à jour d'une entreprise
export interface CompanyInput {
  name: string;
  siret: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  activityCode?: string;
  urssafNumber?: string;
  legalForm?: string;
  phoneNumber?: string;
  email?: string;
  ownerId?: string;
}

/**
 * Obtenir toutes les entreprises de l'utilisateur
 */
export async function getUserCompanies(): Promise<Company[]> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  return getDocuments<Company>(`users/${auth.currentUser.uid}/companies`, {
    orderBy: [{ field: 'name' }]
  });
}

/**
 * Obtenir une entreprise par son ID
 */
export async function getCompany(companyId: string): Promise<Company | null> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  return getDocument<Company>(`users/${auth.currentUser.uid}/companies`, companyId);
}

/**
 * Créer une nouvelle entreprise
 */
export async function createCompany(companyData: CompanyInput): Promise<string> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  try {
    console.log("Début création entreprise:", companyData);
    
    // Préparer les données complètes
    const data: Partial<FirebaseCompany> = {
      ...companyData,
      ownerId: auth.currentUser.uid,
    };
    
    // Valider les données avec le schéma
    validateOrThrow(data, companyValidationSchema);
    
    // Vérifier si une entreprise avec ce SIRET existe déjà
    const existingCompanies = await getDocuments<Company>(`users/${auth.currentUser.uid}/companies`, {
      where: [{ field: 'siret', operator: '==', value: companyData.siret }]
    });
    
    if (existingCompanies.length > 0) {
      throw new Error(`Une entreprise avec le SIRET ${companyData.siret} existe déjà`);
    }
    
    // Créer un ID unique pour la nouvelle entreprise
    const companyId = `company_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Nettoyer les données selon le schéma
    const sanitizedData = sanitizeData(data, companyValidationSchema);
    
    // Créer l'entreprise dans Firestore
    console.log("Données à sauvegarder:", sanitizedData);
    await setDocument(`users/${auth.currentUser.uid}/companies`, companyId, sanitizedData, false);
    
    console.log("Entreprise créée avec succès:", companyId);
    return companyId;
  } catch (error) {
    console.error("Erreur détaillée lors de la création de l'entreprise:", error);
    
    // Améliorer le message d'erreur
    if (error instanceof Error) {
      // Vérifier si c'est une erreur Firebase
      if (error.message.includes("permission-denied")) {
        throw new Error("Vous n'avez pas les permissions nécessaires pour créer une entreprise");
      } else if (error.message.includes("unavailable")) {
        throw new Error("Service temporairement indisponible. Veuillez réessayer plus tard");
      } else if (error.message.includes("network-request-failed")) {
        throw new Error("Problème de connexion réseau. Vérifiez votre connexion internet");
      } else {
        throw error;
      }
    } else {
      throw new Error("Une erreur inconnue s'est produite");
    }
  }
}

/**
 * Mettre à jour une entreprise existante
 */
export async function updateCompany(companyId: string, companyData: Partial<CompanyInput>): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Récupérer l'entreprise existante pour vérification
  const existingCompany = await getCompany(companyId);
  if (!existingCompany) {
    throw new Error("Entreprise non trouvée");
  }
  
  // Si le SIRET est modifié, vérifier qu'il n'existe pas déjà
  if (companyData.siret && companyData.siret !== existingCompany.siret) {
    // Valider le siret
    validateOrThrow({ siret: companyData.siret }, { siret: companyValidationSchema.siret });
    
    const existingCompanies = await getDocuments<Company>(`users/${auth.currentUser.uid}/companies`, {
      where: [
        { field: 'siret', operator: '==', value: companyData.siret },
        { field: 'id', operator: '!=', value: companyId }
      ]
    });
    
    if (existingCompanies.length > 0) {
      throw new Error(`Une entreprise avec le SIRET ${companyData.siret} existe déjà`);
    }
  }
  
  // Valider les données avec le schéma
  validateOrThrow(companyData, companyValidationSchema);
  
  // Nettoyer les données selon le schéma
  const sanitizedData = sanitizeData(companyData, companyValidationSchema);
  
  // Mettre à jour l'entreprise dans Firestore
  await updateDocument(`users/${auth.currentUser.uid}/companies`, companyId, sanitizedData);
}

/**
 * Supprimer une entreprise
 */
export async function deleteCompany(companyId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error("Utilisateur non authentifié");
  }
  
  // Récupérer l'entreprise existante pour vérification
  const existingCompany = await getCompany(companyId);
  if (!existingCompany) {
    throw new Error("Entreprise non trouvée");
  }
  
  // Vérifier que l'utilisateur est bien le propriétaire
  if (existingCompany.ownerId !== auth.currentUser.uid) {
    throw new Error("Vous n'êtes pas autorisé à supprimer cette entreprise");
  }
  
  // Récupérer les employés liés à cette entreprise
  const employees = await getDocuments(`users/${auth.currentUser.uid}/companies/${companyId}/employees`, {});
  
  // Si des employés sont liés, ne pas supprimer l'entreprise
  if (employees.length > 0) {
    throw new Error(`Impossible de supprimer cette entreprise: ${employees.length} employé(s) y sont rattachés`);
  }
  
  // Récupérer les bulletins de paie liés à cette entreprise
  const payslips = await getDocuments(`users/${auth.currentUser.uid}/companies/${companyId}/payslips`, {});
  
  // Si des bulletins sont liés, ne pas supprimer l'entreprise
  if (payslips.length > 0) {
    throw new Error(`Impossible de supprimer cette entreprise: ${payslips.length} bulletin(s) de paie y sont rattachés`);
  }
  
  // Supprimer l'entreprise
  await deleteDocument(`users/${auth.currentUser.uid}/companies`, companyId);
} 