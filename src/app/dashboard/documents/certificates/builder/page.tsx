'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageContainer, PageHeader } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Building, CreditCard, UserCheck } from 'lucide-react';
import CertificateGenerator from '@/components/certificates/CertificateGenerator';

export default function CertificateBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const certificateType = searchParams.get('type') as 'attestation-travail' | 'attestation-salaire' | 'attestation-presence';
  
  // Si le type n'est pas spécifié, afficher un sélecteur de type
  if (!certificateType) {
    const certificateTypes = [
      {
        id: 'attestation-travail',
        title: 'Attestation de travail',
        description: 'Confirme le statut d\'employé et les dates d\'emploi',
        icon: <Building className="h-5 w-5 text-blue-500" />,
      },
      {
        id: 'attestation-salaire',
        title: 'Attestation de salaire',
        description: 'Certifie le montant du salaire perçu',
        icon: <CreditCard className="h-5 w-5 text-green-500" />,
      },
      {
        id: 'attestation-presence',
        title: 'Attestation de présence',
        description: 'Atteste de la présence sur une période donnée',
        icon: <UserCheck className="h-5 w-5 text-purple-500" />,
      }
    ];
    
    const handleSelectType = (typeId: string) => {
      router.push(`/dashboard/documents/certificates/builder?type=${typeId}`);
    };
    
    return (
      <PageContainer>
        <PageHeader
          title="Générateur d'attestations"
          description="Choisissez le type d'attestation que vous souhaitez créer"
          actions={
            <Button variant="outline" onClick={() => router.push('/dashboard/documents/certificates')}>
              Retour
            </Button>
          }
        />
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {certificateTypes.map((type) => (
            <div
              key={type.id}
              className="border rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors"
              onClick={() => handleSelectType(type.id)}
            >
              <div className="flex items-center gap-2 mb-2">
                {type.icon}
                <h3 className="font-medium">{type.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </div>
          ))}
        </div>
      </PageContainer>
    );
  }
  
  // Si le type est spécifié, afficher le générateur avec ce type
  const getTitle = () => {
    switch (certificateType) {
      case 'attestation-travail':
        return 'Générateur d\'attestation de travail';
      case 'attestation-salaire':
        return 'Générateur d\'attestation de salaire';
      case 'attestation-presence':
        return 'Générateur d\'attestation de présence';
      default:
        return 'Générateur d\'attestation';
    }
  };
  
  return (
    <PageContainer>
      <PageHeader
        title={getTitle()}
        description="Créez votre attestation avec prévisualisation en temps réel"
        actions={
          <Button variant="outline" onClick={() => router.push('/dashboard/documents/certificates/builder')}>
            Changer de type
          </Button>
        }
      />
      
      <CertificateGenerator type={certificateType} />
    </PageContainer>
  );
} 