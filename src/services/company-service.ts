import { auth } from '@/lib/firebase';
import { getDocument, getDocuments, deleteDocument, updateDocument } from './firestore-service';
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
  employeeCount?: number;
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
export async function createCompany(companyData: Partial<Company>): Promise<string> {
  try {
    console.log("Données reçues pour création d'entreprise:", companyData);

    // Vérifier l'authentification, mais continuer même en cas d'erreur
    const userId = auth.currentUser?.uid || "demo-user-id";
    
    // Générer un ID unique pour cette entreprise (en situation réelle, cela viendrait de Firestore)
    const companyId = `company-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Simuler un délai d'appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Préparation des données
    const data = {
      ...companyData,
      id: companyId,
      ownerId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // En environnement de développement, on peut stocker en localStorage pour simuler
    if (typeof window !== 'undefined') {
      try {
        // Récupérer les entreprises existantes ou créer un tableau vide
        let existingCompanies = [];
        try {
          const companiesStr = localStorage.getItem('companies');
          existingCompanies = companiesStr ? JSON.parse(companiesStr) : [];
          console.log("Entreprises existantes récupérées:", existingCompanies.length);
        } catch (e) {
          console.warn("Erreur lors de la récupération des entreprises existantes:", e);
          existingCompanies = [];
        }
        
        // Ajouter la nouvelle entreprise
        existingCompanies.push(data);
        console.log("Nouvelle entreprise ajoutée, total:", existingCompanies.length);
        
        // Sauvegarder dans localStorage
        localStorage.setItem('companies', JSON.stringify(existingCompanies));
        
        // Vérifier que la sauvegarde a fonctionné
        const verificationStr = localStorage.getItem('companies');
        const verification = verificationStr ? JSON.parse(verificationStr) : [];
        console.log("Vérification après sauvegarde:", verification.length, "entreprises");
      } catch (e) {
        console.error("Impossible de stocker l'entreprise dans localStorage:", e);
      }
    }
    
    console.log("Entreprise créée avec succès (mode simulation):", companyId);
    return companyId;
  } catch (error) {
    console.error("Erreur lors de la création de l'entreprise:", error);
    throw new Error("Impossible de créer l'entreprise. Veuillez vérifier les informations et réessayer.");
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
    throw new Error(`Impossible de supprimer cette entreprise: ${employees.length} employé(s) y sont rattachés. Veuillez d'abord supprimer tous les employés.`);
  }
  
  // Supprimer l'entreprise
  await deleteDocument(`users/${auth.currentUser.uid}/companies`, companyId);
} 