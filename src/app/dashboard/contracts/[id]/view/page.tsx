"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Download, FileText, Lock, LockOpen } from 'lucide-react';
import Link from 'next/link';

export default function ContractViewPage() {
  const params = useParams();
  const contractId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [contract, setContract] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les données du contrat au chargement
  useEffect(() => {
    const fetchContract = async () => {
      try {
        setIsLoading(true);
        
        const contractRef = doc(firestore, 'contracts', contractId);
        const contractDoc = await getDoc(contractRef);
        
        if (!contractDoc.exists()) {
          setError("Ce contrat n'existe pas ou a été supprimé.");
          return;
        }
        
        setContract({ id: contractDoc.id, ...contractDoc.data() });
      } catch (error) {
        console.error("Erreur lors de la récupération du contrat:", error);
        setError("Une erreur s'est produite lors du chargement du contrat.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContract();
  }, [contractId]);

  // Télécharger le PDF du contrat
  const handleDownloadPdf = () => {
    if (!contract?.pdfUrl) {
      toast({
        title: "Erreur",
        description: "Aucun fichier PDF n'est associé à ce contrat.",
        variant: "destructive",
      });
      return;
    }
    
    // Ouvrir l'URL dans un nouvel onglet
    window.open(contract.pdfUrl, '_blank');
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="container py-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="container py-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <Card>
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-700">Erreur</CardTitle>
            <CardDescription className="text-red-500">{error}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button variant="outline" asChild>
              <Link href="/dashboard/contracts">
                Retour à la liste des contrats
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formater le type de contrat pour l'affichage
  const formatContractType = (type: string) => {
    return type?.replace('_', ' à ') || 'Type inconnu';
  };

  return (
    <div className="container py-6 space-y-6">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/dashboard/contracts">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste des contrats
        </Link>
      </Button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Contrat {formatContractType(contract?.contractType)}
          </h1>
          <p className="text-muted-foreground">
            {contract?.employee?.fullName ? `Pour ${contract.employee.fullName}` : 'Détails du contrat'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {contract?.locked ? (
            <div className="flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded text-sm">
              <Lock className="h-3 w-3 mr-1" />
              Contrat verrouillé
            </div>
          ) : (
            <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-sm">
              <LockOpen className="h-3 w-3 mr-1" />
              Contrat modifiable
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={!contract?.pdfUrl}
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger PDF
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="text-lg">Aperçu du contrat</CardTitle>
          <CardDescription>
            {contract?.locked
              ? "Ce contrat est verrouillé et ne peut plus être modifié."
              : "Ce contrat peut encore être modifié."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          {contract?.pdfUrl ? (
            <div className="w-full h-[600px]">
              <iframe 
                src={`${contract.pdfUrl}#view=FitH`} 
                className="w-full h-full"
                title="Aperçu du contrat"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucun PDF disponible</h3>
              <p className="text-muted-foreground mt-2">
                Ce contrat n'a pas encore de PDF associé. Finalisez le contrat pour générer un PDF.
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            {contract?.createdAt?.toDate
              ? `Créé le ${new Date(contract.createdAt.toDate()).toLocaleDateString('fr-FR')}`
              : 'Date de création inconnue'}
          </div>
          
          {!contract?.locked && (
            <Button variant="default" asChild>
              <Link href={`/dashboard/contracts/${contractId}/edit`}>
                Modifier le contrat
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Informations détaillées du contrat */}
      <Card>
        <CardHeader>
          <CardTitle>Détails du contrat</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Entreprise</h3>
              <p className="text-muted-foreground text-sm">
                {contract?.company?.name || 'Non spécifiée'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Employé</h3>
              <p className="text-muted-foreground text-sm">
                {contract?.employee?.fullName || 'Non spécifié'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Poste</h3>
              <p className="text-muted-foreground text-sm">
                {contract?.fields?.position || 'Non spécifié'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Salaire</h3>
              <p className="text-muted-foreground text-sm">
                {contract?.fields?.salary 
                  ? `${contract.fields.salary} €/mois` 
                  : 'Non spécifié'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Durée de travail</h3>
              <p className="text-muted-foreground text-sm">
                {contract?.fields?.workingHours 
                  ? `${contract.fields.workingHours} h/semaine` 
                  : 'Non spécifiée'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Lieu de travail</h3>
              <p className="text-muted-foreground text-sm">
                {contract?.fields?.workLocation || 'Non spécifié'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Date de début</h3>
              <p className="text-muted-foreground text-sm">
                {contract?.fields?.startDate || 'Non spécifiée'}
              </p>
            </div>
            
            {contract?.fields?.endDate && (
              <div>
                <h3 className="text-sm font-medium mb-1">Date de fin</h3>
                <p className="text-muted-foreground text-sm">
                  {contract.fields.endDate}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 