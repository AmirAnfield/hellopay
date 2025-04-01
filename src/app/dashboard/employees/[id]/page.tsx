"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageContainer, LoadingState } from '@/components/shared/PageContainer';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, Trash, Edit, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  companyId: string;
  companyName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export default function EmployeeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Récupérer l'ID de l'employé depuis les paramètres d'URL
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    
    if (!id) {
      setError("ID d'employé non trouvé");
      setIsLoading(false);
      return;
    }
    
    // Fonction pour récupérer l'employé
    const getEmployeeFromStorage = () => {
      try {
        console.log("Recherche de l'employé", id, "dans localStorage");
        const employeesStr = localStorage.getItem('employees');
        
        if (!employeesStr) {
          console.log("Aucun employé trouvé dans localStorage");
          setError("Employé non trouvé");
          setIsLoading(false);
          return;
        }

        const employees = JSON.parse(employeesStr);
        console.log("Employés trouvés:", employees.length);
        
        const foundEmployee = employees.find((e: { id: string }) => e.id === id);
        
        if (foundEmployee) {
          console.log("Employé trouvé:", foundEmployee.firstName, foundEmployee.lastName);
          setEmployee(foundEmployee);
        } else {
          console.log("Employé non trouvé avec l'ID:", id);
          setError("Employé non trouvé");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'employé:", error);
        setError("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Appeler la fonction après un court délai pour s'assurer que le DOM est prêt
    setTimeout(getEmployeeFromStorage, 100);
  }, [params.id]);
  
  const handleDelete = async () => {
    if (!employee || typeof window === 'undefined') return;
    
    try {
      const employeesStr = localStorage.getItem('employees');
      if (employeesStr) {
        const employees = JSON.parse(employeesStr);
        const updatedEmployees = employees.filter((e: { id: string }) => e.id !== employee.id);
        localStorage.setItem('employees', JSON.stringify(updatedEmployees));
        
        toast({
          title: "Employé supprimé",
          description: `L'employé "${employee.firstName} ${employee.lastName}" a été supprimé avec succès.`,
        });
        
        // Rediriger vers la liste des employés après un court délai
        setTimeout(() => {
          window.location.href = `/dashboard/employees?action=deleted&name=${encodeURIComponent(employee.firstName + ' ' + employee.lastName)}`;
        }, 1500);
      }
    } catch (e) {
      console.error("Erreur lors de la suppression de l'employé:", e);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'employé.",
      });
    }
  };
  
  const handleGeneratePayslip = () => {
    router.push(`/dashboard/payslips/new?employeeId=${employee?.id}`);
  };
  
  if (isLoading) {
    return <LoadingState message="Chargement des données de l'employé..." />;
  }
  
  if (error || !employee) {
    return (
      <PageContainer>
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Impossible de charger les détails de l'employé."}</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/employees">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste des employés
              </Link>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <div className="grid gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/employees">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{employee.firstName} {employee.lastName}</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleGeneratePayslip}
            >
              <FileText className="mr-2 h-4 w-4" />
              Générer bulletin
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link href={`/dashboard/employees/${employee.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="details">Informations</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Poste</p>
                    <div className="flex items-start gap-2">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <p>{employee.position}</p>
                    </div>
                  </div>
                  
                  {employee.companyName && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Entreprise</p>
                      <p>{employee.companyName}</p>
                    </div>
                  )}
                  
                  {employee.email && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <div className="flex items-start gap-2">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <p>{employee.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {employee.phoneNumber && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                      <div className="flex items-start gap-2">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <p>{employee.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {(employee.address || employee.city) && (
                  <>
                    <div className="pt-4 pb-2">
                      <h3 className="text-lg font-medium">Adresse</h3>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        {employee.address && <p>{employee.address}</p>}
                        {employee.postalCode && employee.city && (
                          <p>{employee.postalCode} {employee.city}</p>
                        )}
                        {employee.country && employee.country !== "France" && (
                          <p>{employee.country}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  Documents associés à l&apos;employé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Cette fonctionnalité sera bientôt disponible.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
} 