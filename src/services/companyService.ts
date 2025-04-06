import { Company } from "@/types/contract";
import { firestore } from "@/lib/firebase/config";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

/**
 * Récupère la liste des entreprises d'un utilisateur
 */
export async function getUserCompanies(userId: string): Promise<Company[]> {
  try {
    const companiesRef = collection(firestore, `users/${userId}/companies`);
    const snapshot = await getDocs(companiesRef);
    
    const companies: Company[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      companies.push({
        id: doc.id,
        name: data.name || '',
        siret: data.siret,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        ...data
      });
    });
    
    return companies;
  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises:", error);
    throw error;
  }
}

/**
 * Récupère les détails d'une entreprise spécifique
 */
export async function getCompanyDetails(userId: string, companyId: string): Promise<Company | null> {
  try {
    const companyRef = doc(firestore, `users/${userId}/companies/${companyId}`);
    const docSnap = await getDoc(companyRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        siret: data.siret,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        ...data
      };
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de l'entreprise:", error);
    throw error;
  }
} 