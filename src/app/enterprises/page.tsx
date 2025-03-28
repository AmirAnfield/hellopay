'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Edit, Plus, Trash2 } from 'lucide-react';

// Type pour une entreprise
type Enterprise = {
  id: string;
  name: string;
  siret: string;
  address: string;
  postalCode: string;
  city: string;
  createdAt: string;
  employeeCount: number;
};

// Données fictives pour la démonstration
const mockEnterprises: Enterprise[] = [
  {
    id: '1',
    name: 'Tech Solutions',
    siret: '123 456 789 00012',
    address: '15 rue de l\'Innovation',
    postalCode: '75001',
    city: 'Paris',
    createdAt: '12/01/2023',
    employeeCount: 8
  },
  {
    id: '2',
    name: 'Design Studio',
    siret: '987 654 321 00011',
    address: '42 avenue de la Créativité',
    postalCode: '69002',
    city: 'Lyon',
    createdAt: '15/03/2023',
    employeeCount: 3
  }
];

export default function EnterprisesPage() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>(mockEnterprises);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEnterprise, setCurrentEnterprise] = useState<Enterprise | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    siret: '',
    address: '',
    postalCode: '',
    city: ''
  });
  
  // Gestion des formulaires
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Ouvrir la boîte de dialogue pour l'ajout
  const handleAdd = () => {
    setCurrentEnterprise(null);
    setFormData({
      name: '',
      siret: '',
      address: '',
      postalCode: '',
      city: ''
    });
    setIsDialogOpen(true);
  };
  
  // Ouvrir la boîte de dialogue pour la modification
  const handleEdit = (enterprise: Enterprise) => {
    setCurrentEnterprise(enterprise);
    setFormData({
      name: enterprise.name,
      siret: enterprise.siret,
      address: enterprise.address,
      postalCode: enterprise.postalCode,
      city: enterprise.city
    });
    setIsDialogOpen(true);
  };
  
  // Enregistrer une entreprise (ajout ou modification)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (currentEnterprise) {
        // Mode modification
        setEnterprises(enterprises.map(e => 
          e.id === currentEnterprise.id ? { 
            ...e, 
            name: formData.name,
            siret: formData.siret,
            address: formData.address,
            postalCode: formData.postalCode,
            city: formData.city
          } : e
        ));
      } else {
        // Mode ajout
        const newEnterprise: Enterprise = {
          id: Date.now().toString(),
          name: formData.name,
          siret: formData.siret,
          address: formData.address,
          postalCode: formData.postalCode,
          city: formData.city,
          createdAt: new Date().toLocaleDateString('fr-FR'),
          employeeCount: 0
        };
        setEnterprises([...enterprises, newEnterprise]);
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Supprimer une entreprise
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      setEnterprises(enterprises.filter(e => e.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des entreprises</h1>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une entreprise
        </Button>
      </div>
      
      <Card className="p-6">
        {enterprises.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">Aucune entreprise enregistrée</p>
            <Button onClick={handleAdd}>
              Ajouter votre première entreprise
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>SIRET</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Employés</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enterprises.map((enterprise) => (
                <TableRow key={enterprise.id}>
                  <TableCell className="font-medium">{enterprise.name}</TableCell>
                  <TableCell>{enterprise.siret}</TableCell>
                  <TableCell>{`${enterprise.address}, ${enterprise.postalCode} ${enterprise.city}`}</TableCell>
                  <TableCell>{enterprise.employeeCount}</TableCell>
                  <TableCell>{enterprise.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(enterprise)}
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(enterprise.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      
      {/* Boîte de dialogue pour ajouter/modifier une entreprise */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentEnterprise ? 'Modifier une entreprise' : 'Ajouter une entreprise'}</DialogTitle>
            <DialogDescription>
              Remplissez les informations de l&apos;entreprise ci-dessous
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l&apos;entreprise</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siret">Numéro SIRET</Label>
              <Input 
                id="siret" 
                name="siret" 
                value={formData.siret} 
                onChange={handleInputChange} 
                required 
                placeholder="123 456 789 00012" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input 
                id="address" 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input 
                  id="postalCode" 
                  name="postalCode" 
                  value={formData.postalCode} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input 
                  id="city" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 