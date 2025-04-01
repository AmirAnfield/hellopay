'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Company } from '@/services/company-service';
import { Employee } from '@/services/employee-service';
import { createCertificate, generateWorkCertificatePDF } from '@/services/certificate-service';

interface CertificateFormProps {
  companies: Company[];
  employees?: Employee[];
  companyId?: string;
  employeeId?: string;
}

export default function CertificateForm({ companies, employees, companyId: initialCompanyId, employeeId: initialEmployeeId }: CertificateFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  // État pour les sélections de l'utilisateur
  const [companyId, setCompanyId] = useState<string>(initialCompanyId || '');
  const [employeeId, setEmployeeId] = useState<string>(initialEmployeeId || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [companyEmployees, setCompanyEmployees] = useState<Employee[]>(employees || []);
  
  // Si les employés ne sont pas fournis, les charger lors du changement d'entreprise
  const handleCompanyChange = async (value: string) => {
    setCompanyId(value);
    setEmployeeId(''); // Réinitialiser l'employé sélectionné
    
    if (!value) return;
    
    try {
      setIsLoading(true);
      // Charger les employés de l'entreprise sélectionnée
      const response = await fetch(`/api/companies/${value}/employees`);
      const data = await response.json();
      if (data.success) {
        setCompanyEmployees(data.employees);
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de charger les employés",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les employés",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gestion de la soumission du formulaire
  const handleSubmit = async () => {
    if (!companyId || !employeeId) {
      toast({
        title: "Données manquantes",
        description: "Veuillez sélectionner une entreprise et un employé",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // 1. Créer le certificat dans Firestore
      const certificateId = await createCertificate({
        employeeId,
        companyId,
        type: 'attestation-travail'
      });
      
      // 2. Générer le PDF
      await generateWorkCertificatePDF(certificateId);
      
      // 3. Afficher une notification et rediriger
      toast({
        title: "Attestation créée",
        description: "L'attestation de travail a été générée avec succès",
      });
      
      // Rediriger vers la liste des attestations
      router.push(`/dashboard/certificates`);
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer l'attestation",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Créer une attestation de travail</CardTitle>
        <CardDescription>
          Sélectionnez l'entreprise et l'employé pour générer une attestation de travail
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company">Entreprise</Label>
          <Select
            value={companyId}
            onValueChange={handleCompanyChange}
            disabled={isLoading || companies.length === 0}
          >
            <SelectTrigger id="company">
              <SelectValue placeholder="Sélectionner une entreprise" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="employee">Employé</Label>
          <Select
            value={employeeId}
            onValueChange={setEmployeeId}
            disabled={isLoading || !companyId || companyEmployees.length === 0}
          >
            <SelectTrigger id="employee">
              <SelectValue placeholder="Sélectionner un employé" />
            </SelectTrigger>
            <SelectContent>
              {companyEmployees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading || !companyId || !employeeId}>
          {isLoading ? "Génération en cours..." : "Générer l'attestation"}
        </Button>
      </CardFooter>
    </Card>
  );
} 