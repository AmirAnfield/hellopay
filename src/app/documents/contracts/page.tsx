'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { getFirestore, collection, getDocs, doc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth } from '@/lib/firebase';
import { Loader2, FileText, Download, Trash2, Plus, Search } from 'lucide-react';

type Contract = {
  id: string;
  createdAt: string;
  updatedAt: string;
  employee: {
    firstName: string;
    lastName: string;
  };
  company: {
    name: string;
  };
  contractDetails: {
    type: string;
    position: string;
    startDate: string;
  };
  pdfUrl?: string;
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContracts, setSelectedContracts] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Référence Firestore
  const firestore = getFirestore();
  const storage = getStorage();

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Non connecté",
          description: "Vous devez être connecté pour voir vos contrats"
        });
        setIsLoading(false);
        return;
      }
      
      // Chemin de récupération: users/{userId}/contracts
      const contractsRef = collection(firestore, `users/${userId}/contracts`);
      const contractsQuery = query(
        contractsRef,
        orderBy('updatedAt', 'desc')
      );
      
      const snapshot = await getDocs(contractsQuery);
      
      const contractsList: Contract[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data() as Contract;
        contractsList.push({
          ...data,
          id: doc.id
        });
      });
      
      setContracts(contractsList);
      
      toast({
        title: "Contrats chargés",
        description: `${contractsList.length} contrats trouvés`
      });
    } catch (error) {
      console.error("Erreur lors du chargement des contrats:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les contrats. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les contrats au montage du composant
  useEffect(() => {
    loadContracts();
  }, []);

  // Filtrer les contrats
  const filteredContracts = contracts.filter(contract => {
    // Filtre de recherche
    const searchMatch = 
      contract.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractDetails.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par type
    const typeMatch = 
      selectedFilter === 'all' || 
      (selectedFilter === 'cdi' && contract.contractDetails.type === 'CDI') ||
      (selectedFilter === 'cdd' && contract.contractDetails.type === 'CDD');
    
    return searchMatch && typeMatch;
  });

  // Télécharger un PDF
  const downloadPDF = async (pdfUrl: string, employeeName: string) => {
    try {
      const storageRef = ref(storage, pdfUrl);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Créer un lien temporaire pour télécharger le fichier
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = `contrat-${employeeName.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Téléchargement réussi",
        description: "Le contrat a été téléchargé avec succès"
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le contrat. Veuillez réessayer."
      });
    }
  };

  // Supprimer un contrat
  const deleteContract = async (contractId: string, pdfUrl?: string) => {
    setIsDeleting(true);
    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Non connecté",
          description: "Vous devez être connecté pour supprimer un contrat"
        });
        setIsDeleting(false);
        return;
      }
      
      // Supprimer le document Firestore
      const contractDocRef = doc(firestore, `users/${userId}/contracts/${contractId}`);
      await deleteDoc(contractDocRef);
      
      // Supprimer le PDF si disponible
      if (pdfUrl) {
        const pdfRef = ref(storage, pdfUrl);
        await deleteObject(pdfRef);
      }
      
      // Mettre à jour la liste des contrats
      setContracts(contracts.filter(contract => contract.id !== contractId));
      setSelectedContracts(selectedContracts.filter(id => id !== contractId));
      
      toast({
        title: "Contrat supprimé",
        description: "Le contrat a été supprimé avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le contrat. Veuillez réessayer."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Supprimer plusieurs contrats
  const deleteSelectedContracts = async () => {
    if (selectedContracts.length === 0) return;
    
    setIsDeleting(true);
    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        toast({
          variant: "destructive",
          title: "Non connecté",
          description: "Vous devez être connecté pour supprimer des contrats"
        });
        setIsDeleting(false);
        return;
      }
      
      // Supprimer chaque contrat sélectionné
      for (const contractId of selectedContracts) {
        const contract = contracts.find(c => c.id === contractId);
        
        // Supprimer le document Firestore
        const contractDocRef = doc(firestore, `users/${userId}/contracts/${contractId}`);
        await deleteDoc(contractDocRef);
        
        // Supprimer le PDF si disponible
        if (contract?.pdfUrl) {
          const pdfRef = ref(storage, contract.pdfUrl);
          await deleteObject(pdfRef);
        }
      }
      
      // Mettre à jour la liste des contrats
      setContracts(contracts.filter(contract => !selectedContracts.includes(contract.id)));
      setSelectedContracts([]);
      
      toast({
        title: "Contrats supprimés",
        description: `${selectedContracts.length} contrats ont été supprimés avec succès`
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer les contrats. Veuillez réessayer."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Gérer la sélection d'un contrat
  const toggleContractSelection = (contractId: string) => {
    setSelectedContracts(prev => 
      prev.includes(contractId)
        ? prev.filter(id => id !== contractId)
        : [...prev, contractId]
    );
  };

  // Sélectionner/désélectionner tous les contrats
  const toggleSelectAll = () => {
    if (selectedContracts.length === filteredContracts.length) {
      setSelectedContracts([]);
    } else {
      setSelectedContracts(filteredContracts.map(contract => contract.id));
    }
  };

  // Formatter la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contrats de travail</h1>
        <Link href="/documents/contracts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau contrat
          </Button>
        </Link>
      </div>
      
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un contrat..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('all')}
          >
            Tous
          </Button>
          <Button
            variant={selectedFilter === 'cdi' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('cdi')}
          >
            CDI
          </Button>
          <Button
            variant={selectedFilter === 'cdd' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('cdd')}
          >
            CDD
          </Button>
        </div>
      </div>
      
      {/* Actions groupées */}
      {selectedContracts.length > 0 && (
        <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded-md">
          <div>
            <span>{selectedContracts.length} contrat(s) sélectionné(s)</span>
          </div>
          <Button
            variant="destructive"
            onClick={deleteSelectedContracts}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Supprimer
          </Button>
        </div>
      )}
      
      {/* Tableau des contrats */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="w-10 p-4">
                <Checkbox
                  checked={selectedContracts.length === filteredContracts.length && filteredContracts.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="p-4 text-left font-medium text-gray-500">Nom</th>
              <th className="p-4 text-left font-medium text-gray-500">Entreprise</th>
              <th className="p-4 text-left font-medium text-gray-500">Poste</th>
              <th className="p-4 text-left font-medium text-gray-500">Type</th>
              <th className="p-4 text-left font-medium text-gray-500">Date de début</th>
              <th className="p-4 text-left font-medium text-gray-500">Mis à jour</th>
              <th className="p-4 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                  <p className="mt-2 text-gray-500">Chargement des contrats...</p>
                </td>
              </tr>
            ) : filteredContracts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center">
                  <FileText className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">Aucun contrat trouvé</p>
                  <p className="text-sm text-gray-400">
                    {searchTerm 
                      ? "Essayez avec d'autres termes de recherche"
                      : "Créez votre premier contrat en cliquant sur 'Nouveau contrat'"}
                  </p>
                </td>
              </tr>
            ) : (
              filteredContracts.map((contract) => (
                <tr key={contract.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedContracts.includes(contract.id)}
                      onCheckedChange={() => toggleContractSelection(contract.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium">
                      {contract.employee.firstName} {contract.employee.lastName}
                    </div>
                  </td>
                  <td className="p-4">{contract.company.name}</td>
                  <td className="p-4">{contract.contractDetails.position}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      contract.contractDetails.type === 'CDI' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {contract.contractDetails.type}
                    </span>
                  </td>
                  <td className="p-4">{formatDate(contract.contractDetails.startDate)}</td>
                  <td className="p-4">{formatDate(contract.updatedAt)}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Link href={`/documents/contracts/edit/${contract.id}`}>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </Link>
                      {contract.pdfUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadPDF(
                            contract.pdfUrl!, 
                            `${contract.employee.firstName}-${contract.employee.lastName}`
                          )}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteContract(contract.id, contract.pdfUrl)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 