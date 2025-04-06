import { Employee } from "@/types/contract";
import { firestore } from "@/lib/firebase/config";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

/**
 * Récupère la liste des employés d'un utilisateur
 */
export async function getUserEmployees(userId: string): Promise<Employee[]> {
  try {
    const employeesRef = collection(firestore, `users/${userId}/employees`);
    const snapshot = await getDocs(employeesRef);
    
    const employees: Employee[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const firstName = data.firstName || '';
      const lastName = data.lastName || '';
      
      employees.push({
        id: doc.id,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        birthDate: data.birthDate,
        birthPlace: data.birthPlace,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        socialSecurityNumber: data.socialSecurityNumber,
        ...data
      });
    });
    
    return employees;
  } catch (error) {
    console.error("Erreur lors de la récupération des employés:", error);
    throw error;
  }
}

/**
 * Récupère les détails d'un employé spécifique
 */
export async function getEmployeeDetails(userId: string, employeeId: string): Promise<Employee | null> {
  try {
    const employeeRef = doc(firestore, `users/${userId}/employees/${employeeId}`);
    const docSnap = await getDoc(employeeRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      const firstName = data.firstName || '';
      const lastName = data.lastName || '';
      
      return {
        id: docSnap.id,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        birthDate: data.birthDate,
        birthPlace: data.birthPlace,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        socialSecurityNumber: data.socialSecurityNumber,
        ...data
      };
    }
    
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de l'employé:", error);
    throw error;
  }
} 