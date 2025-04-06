'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContractsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestion des contrats</h1>
        
        <Link href="/dashboard/contracts/create">
          <Button className="flex items-center space-x-2">
            <Plus size={18} />
            <span>Nouveau contrat</span>
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Contrats en cours</CardTitle>
            <CardDescription>Contrats actuellement actifs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">0</div>
            <p className="text-sm text-gray-500 mt-2">Aucun contrat actif pour le moment</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Contrats en attente</CardTitle>
            <CardDescription>Contrats en cours de création</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">0</div>
            <p className="text-sm text-gray-500 mt-2">Aucun contrat en attente</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Contrats terminés</CardTitle>
            <CardDescription>Contrats archivés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-400">0</div>
            <p className="text-sm text-gray-500 mt-2">Aucun contrat archivé</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Mes contrats</h2>
        
        <div className="bg-white border rounded-lg p-8 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Aucun contrat trouvé</h3>
          <p className="text-gray-500 mb-6">
            Vous n&apos;avez pas encore créé de contrat. Commencez par créer votre premier contrat.
          </p>
          
          <Link href="/dashboard/contracts/create">
            <Button className="mx-auto">
              Créer un contrat
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 