'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCompany, getCompany } from '@/services/company-service';
import { createEmployee, getEmployee } from '@/services/employee-service';
import { createCertificate, generateWorkCertificatePDF } from '@/services/certificate-service';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function WorkflowTestPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // IDs pour suivre le workflow
  const [companyId, setCompanyId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [certificateId, setCertificateId] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  
  // Données de formulaire
  const [companyData, setCompanyData] = useState({
    name: 'Entreprise Test',
    siret: '12345678901234',
    address: '1 Rue de Test',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
    email: 'contact@test.com'
  });
  
  const [employeeData, setEmployeeData] = useState({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@test.com',
    address: '2 Avenue de l\'Exemple',
    city: 'Paris',
    postalCode: '75002',
    country: 'France',
    position: 'Développeur',
    contractType: 'CDI',
    socialSecurityNumber: '123456789012345',
    startDate: new Date().toISOString().split('T')[0]
  });
  
  // Vérifier l'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Fonctions pour le workflow
  const handleCreateCompany = async () => {
    try {
      setError('');
      setSuccess('');
      
      const id = await createCompany(companyData);
      setCompanyId(id);
      setSuccess(`Entreprise créée avec succès! ID: ${id}`);
      setStep(1);
    } catch (err: any) {
      setError(`Erreur lors de la création de l'entreprise: ${err.message}`);
    }
  };
  
  const handleCreateEmployee = async () => {
    try {
      setError('');
      setSuccess('');
      
      if (!companyId) {
        setError('Veuillez d\'abord créer une entreprise');
        return;
      }
      
      const id = await createEmployee(companyId, employeeData);
      setEmployeeId(id);
      setSuccess(`Employé créé avec succès! ID: ${id}`);
      setStep(2);
    } catch (err: any) {
      setError(`Erreur lors de la création de l'employé: ${err.message}`);
    }
  };
  
  const handleCreateCertificate = async () => {
    try {
      setError('');
      setSuccess('');
      
      if (!companyId || !employeeId) {
        setError('Veuillez d\'abord créer une entreprise et un employé');
        return;
      }
      
      const id = await createCertificate({
        companyId,
        employeeId,
        type: 'attestation-travail'
      });
      
      setCertificateId(id);
      setSuccess(`Attestation créée avec succès! ID: ${id}`);
      setStep(3);
    } catch (err: any) {
      setError(`Erreur lors de la création de l'attestation: ${err.message}`);
    }
  };
  
  const handleGeneratePDF = async () => {
    try {
      setError('');
      setSuccess('');
      
      if (!certificateId) {
        setError('Veuillez d\'abord créer une attestation');
        return;
      }
      
      const url = await generateWorkCertificatePDF(certificateId);
      setPdfUrl(url);
      setSuccess('PDF généré avec succès!');
      setStep(4);
    } catch (err: any) {
      setError(`Erreur lors de la génération du PDF: ${err.message}`);
    }
  };
  
  if (loading) {
    return <div className="container flex items-center justify-center min-h-screen">Chargement...</div>;
  }
  
  if (!user) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-8">Veuillez vous connecter pour accéder à cette page</h1>
        <Button asChild>
          <a href="/auth/login">Se connecter</a>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Test du Workflow HelloPay</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="grid gap-8 mb-8">
        <Card className={step === 0 ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle>Étape 1: Créer une entreprise</CardTitle>
            <CardDescription>
              Ajoutez une nouvelle entreprise avec les informations suivantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nom de l'entreprise</Label>
                  <Input
                    id="company-name"
                    value={companyData.name}
                    onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-siret">SIRET</Label>
                  <Input
                    id="company-siret"
                    value={companyData.siret}
                    onChange={(e) => setCompanyData({...companyData, siret: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-address">Adresse</Label>
                <Input
                  id="company-address"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-city">Ville</Label>
                  <Input
                    id="company-city"
                    value={companyData.city}
                    onChange={(e) => setCompanyData({...companyData, city: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-postal">Code postal</Label>
                  <Input
                    id="company-postal"
                    value={companyData.postalCode}
                    onChange={(e) => setCompanyData({...companyData, postalCode: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-country">Pays</Label>
                  <Input
                    id="company-country"
                    value={companyData.country}
                    onChange={(e) => setCompanyData({...companyData, country: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateCompany} disabled={step > 0}>Créer l'entreprise</Button>
          </CardFooter>
        </Card>
        
        <Card className={step === 1 ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle>Étape 2: Ajouter un employé</CardTitle>
            <CardDescription>
              Ajoutez un nouvel employé à l'entreprise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee-firstname">Prénom</Label>
                  <Input
                    id="employee-firstname"
                    value={employeeData.firstName}
                    onChange={(e) => setEmployeeData({...employeeData, firstName: e.target.value})}
                    disabled={step !== 1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-lastname">Nom</Label>
                  <Input
                    id="employee-lastname"
                    value={employeeData.lastName}
                    onChange={(e) => setEmployeeData({...employeeData, lastName: e.target.value})}
                    disabled={step !== 1}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-email">Email</Label>
                <Input
                  id="employee-email"
                  value={employeeData.email}
                  onChange={(e) => setEmployeeData({...employeeData, email: e.target.value})}
                  disabled={step !== 1}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee-position">Poste</Label>
                  <Input
                    id="employee-position"
                    value={employeeData.position}
                    onChange={(e) => setEmployeeData({...employeeData, position: e.target.value})}
                    disabled={step !== 1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-contract">Type de contrat</Label>
                  <Input
                    id="employee-contract"
                    value={employeeData.contractType}
                    onChange={(e) => setEmployeeData({...employeeData, contractType: e.target.value})}
                    disabled={step !== 1}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-ssn">Numéro de sécurité sociale</Label>
                <Input
                  id="employee-ssn"
                  value={employeeData.socialSecurityNumber}
                  onChange={(e) => setEmployeeData({...employeeData, socialSecurityNumber: e.target.value})}
                  disabled={step !== 1}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateEmployee} disabled={step !== 1}>Ajouter l'employé</Button>
          </CardFooter>
        </Card>
        
        <Card className={step === 2 ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle>Étape 3: Créer une attestation de travail</CardTitle>
            <CardDescription>
              Générer une attestation pour l'employé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Cette étape va créer une attestation de travail pour l'employé sélectionné.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleCreateCertificate} disabled={step !== 2}>Créer l'attestation</Button>
          </CardFooter>
        </Card>
        
        <Card className={step === 3 ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle>Étape 4: Générer le PDF</CardTitle>
            <CardDescription>
              Générer le PDF de l'attestation de travail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Cette étape va générer le PDF de l'attestation et le stocker dans Firebase Storage.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGeneratePDF} disabled={step !== 3}>Générer le PDF</Button>
          </CardFooter>
        </Card>
        
        {pdfUrl && (
          <Card className={step === 4 ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle>Étape 5: Résultat</CardTitle>
              <CardDescription>
                Attestation générée avec succès
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Le PDF a été généré et stocké avec succès. Vous pouvez le télécharger ci-dessous :</p>
              <a 
                href={pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Télécharger l'attestation de travail
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 