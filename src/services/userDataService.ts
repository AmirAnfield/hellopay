import { firestore } from "@/lib/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { Company, Employee } from "@/types/contract";
import { auth } from "@/lib/firebase";

/**
 * Charge la liste des entreprises de l'utilisateur
 */
export async function loadUserCompanies(userId: string): Promise<Company[]> {
  try {
    // Utiliser l'ID utilisateur actuel si non fourni
    if (!userId && auth.currentUser) {
      userId = auth.currentUser.uid;
    }
    
    if (!userId) {
      console.error("Erreur: Aucun ID utilisateur fourni et utilisateur non connecté");
      return [];
    }
    
    console.log("Chargement des entreprises pour l'utilisateur:", userId);
    
    const companiesRef = collection(firestore, `users/${userId}/companies`);
    const snapshot = await getDocs(companiesRef);
    
    const companies: Company[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      companies.push({
        id: doc.id,
        name: data.name || '',
        siret: data.siret || '',
        address: data.address || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        country: data.country || 'France',
        ...data
      } as Company);
    });
    
    console.log("Entreprises chargées:", companies.length);
    return companies;
  } catch (error) {
    console.error("Erreur lors du chargement des entreprises:", error);
    return [];
  }
}

/**
 * Charge la liste des employés de l'utilisateur
 */
export async function loadUserEmployees(userId: string): Promise<Employee[]> {
  try {
    // Utiliser l'ID utilisateur actuel si non fourni
    if (!userId && auth.currentUser) {
      userId = auth.currentUser.uid;
    }
    
    if (!userId) {
      console.error("Erreur: Aucun ID utilisateur fourni et utilisateur non connecté");
      return [];
    }
    
    console.log("Chargement des employés pour l'utilisateur:", userId);
    
    const employeesRef = collection(firestore, `users/${userId}/employees`);
    const snapshot = await getDocs(employeesRef);
    
    const employees: Employee[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      employees.push({
        id: doc.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        address: data.address || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        birthDate: data.birthDate || '',
        birthPlace: data.birthPlace || '',
        socialSecurityNumber: data.socialSecurityNumber || '',
        ...data
      } as Employee);
    });
    
    console.log("Employés chargés:", employees.length);
    return employees;
  } catch (error) {
    console.error("Erreur lors du chargement des employés:", error);
    return [];
  }
} 