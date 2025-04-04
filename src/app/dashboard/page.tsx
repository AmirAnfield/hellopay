"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  FileSpreadsheet, FileText, UserPlus, Users, 
  ArrowUpRight, Briefcase, Package,
  PlusCircle, FileText as FileContract
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import CompanyModal from "@/components/dashboard/CompanyModal";
import EmployeeModal from "@/components/dashboard/EmployeeModal";

// Type simplifié pour les entreprises
interface Company {
  id: string;
  name: string;
  siret: string;
  address?: string;
  postalCode?: string;
  city?: string;
  isArchived?: boolean;
}

// Type pour les données utilisateur
interface UserData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Hook personnalisé pour récupérer les entreprises de Firestore
function useFirestoreCompanies<T extends { isArchived?: boolean }>() {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.uid) {
        setLoading(false);
        return;
      }
      
      try {
        // Récupérer les entreprises de l'utilisateur depuis Firestore
        const userId = user.uid;
        const companiesRef = collection(db, `users/${userId}/companies`);
        const querySnapshot = await getDocs(companiesRef);
        
        const companiesData: T[] = [];
        querySnapshot.forEach((doc) => {
          const companyData = { id: doc.id, ...doc.data() } as unknown as T;
          // Ne récupérer que les entreprises non archivées
          if (!companyData.isArchived) {
            companiesData.push(companyData);
          }
        });
        
        setData(companiesData);
      } catch (error) {
        console.error("Erreur lors de la récupération des entreprises:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  return {
    data,
    loading
  };
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const { data: companies, loading: companiesLoading } = useFirestoreCompanies<Company>();
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [documentsCount, setDocumentsCount] = useState<number>(0);
  const [contractsCount, setContractsCount] = useState<number>(0);
  const [openCompanyModal, setOpenCompanyModal] = useState(false);
  const [openEmployeeModal, setOpenEmployeeModal] = useState(false);
  
  // Récupérer les données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserData(userSnap.data() as UserData);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
        }
      }
    };
    
    fetchUserData();
  }, [user]);
  
  // Récupérer le nombre d'employés
  useEffect(() => {
    const fetchEmployeeCount = async () => {
      if (user && user.uid) {
        try {
          // Récupérer tous les employés avec une requête globale
          const employeesRef = collection(db, "employees");
          const q = query(employeesRef, where("userId", "==", user.uid));
          const employeesSnapshot = await getDocs(q);
          let totalEmployees = 0;
          
          // Compter uniquement les employés non archivés de la collection globale
          employeesSnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.isArchived) {
              totalEmployees++;
            }
          });
          
          // Vérifier également dans la collection utilisateur
          const userEmployeesRef = collection(db, `users/${user.uid}/employees`);
          const userEmployeesSnapshot = await getDocs(userEmployeesRef);
          
          // Compter uniquement les employés non archivés de la collection utilisateur
          userEmployeesSnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.isArchived) {
              totalEmployees++;
            }
          });
          
          console.log(`Nombre total d'employés actifs trouvés: ${totalEmployees}`);
          setEmployeeCount(totalEmployees);
        } catch (error) {
          console.error("Erreur lors de la récupération des employés:", error);
        }
      }
    };
    
    fetchEmployeeCount();
  }, [user]);
  
  // Récupérer le nombre de documents
  useEffect(() => {
    const fetchDocumentsCount = async () => {
      if (user && user.uid) {
        try {
          const documentsRef = collection(db, `users/${user.uid}/documents`);
          const documentsSnapshot = await getDocs(documentsRef);
          
          // Compter uniquement les documents non archivés
          let activeDocuments = 0;
          documentsSnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.isArchived) {
              activeDocuments++;
            }
          });
          
          setDocumentsCount(activeDocuments);
        } catch (error) {
          console.error("Erreur lors de la récupération des documents:", error);
        }
      }
    };
    
    fetchDocumentsCount();
  }, [user]);
  
  // Récupérer le nombre de contrats
  useEffect(() => {
    const fetchContractsCount = async () => {
      if (user && user.uid) {
        try {
          const contractsRef = collection(db, `users/${user.uid}/contracts`);
          const contractsSnapshot = await getDocs(contractsRef);
          
          // Compter uniquement les contrats non archivés
          let activeContracts = 0;
          contractsSnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.isArchived) {
              activeContracts++;
            }
          });
          
          setContractsCount(activeContracts);
        } catch (error) {
          console.error("Erreur lors de la récupération des contrats:", error);
        }
      }
    };
    
    fetchContractsCount();
  }, [user]);
  
  // Rafraîchir les données après création
  const handleCompanyCreated = () => {
    // Recharger les données (si le hook ne gère pas déjà ça)
    window.location.reload();
  };
  
  const handleEmployeeCreated = () => {
    // Recharger les données
    window.location.reload();
  };
  
  // Afficher un état de chargement
  if (authLoading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-12 w-full mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    return null; // Le middleware gérera la redirection
  }
  
  // Obtenir le prénom de l'utilisateur
  const firstName = userData?.firstName || (user.displayName ? user.displayName.split(' ')[0] : '');
  
  const hasData = (companies?.length || 0) > 0 || employeeCount > 0 || documentsCount > 0 || contractsCount > 0;
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Hub</h1>
          <Badge variant="outline" className="ml-3 px-2">
            {user.uid.substring(0, 6)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {firstName ? `${firstName}` : ''} <span className="text-xs opacity-60">{user.email}</span>
        </p>
      </div>
      
      {/* Tableau de bord compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Entreprises actives</p>
              <p className="text-2xl font-bold">{companiesLoading ? '...' : companies?.length || 0}</p>
            </div>
            <Briefcase className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Employés actifs</p>
              <p className="text-2xl font-bold">{employeeCount}</p>
            </div>
            <Users className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Contrats actifs</p>
              <p className="text-2xl font-bold">{contractsCount}</p>
            </div>
            <FileContract className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Documents actifs</p>
              <p className="text-2xl font-bold">{documentsCount}</p>
            </div>
            <FileText className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>
      </div>
      
      {!hasData && (
        <Card className="mb-6 bg-muted/30">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <PlusCircle className="h-12 w-12 text-primary opacity-70 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Commencer avec HelloPay</h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-lg">
              Pour commencer, ajoutez vos premières entreprises et employés. Vous pourrez ensuite créer des bulletins de paie et suivre vos tâches directement depuis ce tableau de bord.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setOpenCompanyModal(true)}>
                Ajouter une entreprise
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setOpenEmployeeModal(true)}
                disabled={companies?.length === 0}
              >
                Ajouter un employé
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Actions rapides */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 flex items-center">
              <div className="mr-4 bg-primary/10 p-2 rounded-md">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">Ajouter une entreprise</h3>
                <p className="text-xs text-muted-foreground mt-1">Créer une nouvelle société</p>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="ml-2"
                onClick={() => setOpenCompanyModal(true)}
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 flex items-center">
              <div className="mr-4 bg-primary/10 p-2 rounded-md">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">Ajouter un employé</h3>
                <p className="text-xs text-muted-foreground mt-1">Créer un nouvel employé</p>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="ml-2"
                onClick={() => setOpenEmployeeModal(true)}
                disabled={companies?.length === 0}
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 flex items-center">
              <div className="mr-4 bg-primary/10 p-2 rounded-md">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">Générer un document</h3>
                <p className="text-xs text-muted-foreground mt-1">Créer un nouveau document</p>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                asChild 
                className="ml-2"
                disabled={employeeCount === 0}
              >
                <Link href="/dashboard/documents/create">
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Modales pour ajouter entreprises et employés */}
      <CompanyModal 
        open={openCompanyModal} 
        onOpenChange={setOpenCompanyModal} 
        onCompanyCreated={handleCompanyCreated} 
      />
      
      <EmployeeModal 
        open={openEmployeeModal} 
        onOpenChange={setOpenEmployeeModal} 
        onEmployeeCreated={handleEmployeeCreated}
      />
    </div>
  );
}
