'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Plus, Download, Edit, Trash2, Search } from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import { collection, getDocs, query, orderBy, where, doc, deleteDoc } from 'firebase/firestore';
import { firestore, auth, storage } from '@/lib/firebase/config';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ref, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Type pour les contrats
interface Contract {
  id: string;
  title: string;
  employeeName: string;
  companyName: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  type: string;
  pdfUrl?: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();
  const { toast } = useToast();
  
  // Récupérer tous les contrats de l'utilisateur courant
  const loadContracts = async () => {
    if (!auth.currentUser) return;
    
    setIsLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const contractsRef = collection(firestore, `users/${userId}/contracts`);
      const q = query(contractsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const loadedContracts: Contract[] = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // Charger les informations de l'employé et de l'entreprise
        let employeeName = 'Employé inconnu';
        let companyName = 'Entreprise inconnue';
        
        if (data.employeeId) {
          const employeeDoc = await getDocs(
            query(collection(firestore, `users/${userId}/employees`), where('id', '==', data.employeeId))
          );
          if (!employeeDoc.empty) {
            const employeeData = employeeDoc.docs[0].data();
            employeeName = `${employeeData.firstName} ${employeeData.lastName}`;
          }
        }
        
        if (data.companyId) {
          const companyDoc = await getDocs(
            query(collection(firestore, `users/${userId}/companies`), where('id', '==', data.companyId))
          );
          if (!companyDoc.empty) {
            companyName = companyDoc.docs[0].data().name;
          }
        }
        
        // Ajouter le contrat à la liste
        loadedContracts.push({
          id: doc.id,
          title: data.title || 'Contrat sans titre',
          employeeName,
          companyName,
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
          status: data.status || 'draft',
          type: data.type || 'CDI',
          pdfUrl: data.pdfUrl,
        });
      }
      
      setContracts(loadedContracts);
    } catch (error) {
      console.error('Erreur lors du chargement des contrats:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les contrats. Veuillez réessayer.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadContracts();
  }, []);
  
  // Filtrer les contrats en fonction de l'onglet actif et du terme de recherche
  const filteredContracts = contracts.filter(contract => {
    // Filtrer par statut si l'onglet n'est pas 'all'
    if (activeTab !== 'all' && contract.status !== activeTab) {
      return false;
    }
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        contract.title.toLowerCase().includes(searchLower) ||
        contract.employeeName.toLowerCase().includes(searchLower) ||
        contract.companyName.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Télécharger un PDF
  const downloadPdf = async (contract: Contract) => {
    if (!contract.pdfUrl) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Ce contrat ne possède pas de PDF associé.',
      });
      return;
    }
    
    try {
      const url = await getDownloadURL(ref(storage, contract.pdfUrl));
      
      // Créer un lien temporaire et cliquer dessus pour télécharger
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrat-${contract.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de télécharger le PDF. Veuillez réessayer.',
      });
    }
  };
  
  // Supprimer un contrat
  const deleteContract = async (contractId: string) => {
    if (!auth.currentUser) return;
    
    try {
      const userId = auth.currentUser.uid;
      await deleteDoc(doc(firestore, `users/${userId}/contracts/${contractId}`));
      
      // Mettre à jour la liste des contrats
      setContracts(contracts.filter(c => c.id !== contractId));
      
      toast({
        title: 'Contrat supprimé',
        description: 'Le contrat a été supprimé avec succès.',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du contrat:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer le contrat. Veuillez réessayer.',
      });
    }
  };
  
  return (
    <AuthGuard>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Contrats de travail</h1>
            <p className="text-muted-foreground">Gérez tous vos contrats de travail.</p>
          </div>
          <Button onClick={() => router.push('/dashboard/contracts/create')}>
            <Plus className="mr-2 h-4 w-4" /> Nouveau contrat
          </Button>
        </div>
        
        <div className="flex items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par titre, employé ou entreprise..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="draft">Brouillons</TabsTrigger>
            <TabsTrigger value="active">Actifs</TabsTrigger>
            <TabsTrigger value="expired">Expirés</TabsTrigger>
            <TabsTrigger value="terminated">Résiliés</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucun contrat trouvé</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  {searchTerm
                    ? 'Aucun contrat ne correspond à votre recherche.'
                    : 'Vous n\'avez pas encore créé de contrat dans cette catégorie.'}
                </p>
                <Button onClick={() => router.push('/dashboard/contracts/create')}>
                  <Plus className="mr-2 h-4 w-4" /> Créer un contrat
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredContracts.map((contract) => (
                  <Card key={contract.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-start">
                        <span className="truncate">{contract.title}</span>
                        <Badge variant={
                          contract.status === 'active' ? 'default' :
                          contract.status === 'draft' ? 'outline' :
                          contract.status === 'expired' ? 'secondary' :
                          'destructive'
                        }>
                          {contract.status === 'active' ? 'Actif' :
                           contract.status === 'draft' ? 'Brouillon' :
                           contract.status === 'expired' ? 'Expiré' :
                           'Résilié'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Type: {contract.type === 'CDI' ? 'CDI' : 'CDD'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Employé:</span>
                          <span className="font-medium truncate max-w-[180px]">{contract.employeeName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entreprise:</span>
                          <span className="font-medium truncate max-w-[180px]">{contract.companyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Créé le:</span>
                          <span className="font-medium">{new Date(contract.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button variant="ghost" size="sm" onClick={() => downloadPdf(contract)} disabled={!contract.pdfUrl}>
                        <Download className="h-4 w-4 mr-1" /> PDF
                      </Button>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/contracts/edit/${contract.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer le contrat</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteContract(contract.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
} 