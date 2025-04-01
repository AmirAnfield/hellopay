import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { auth } from '@/lib/firebase';
import { getUserCompanies } from '@/services/company-service';
import CertificateForm from '@/components/certificates/CertificateForm';

export const metadata = {
  title: 'Nouvelle attestation de travail | HelloPay',
  description: 'Générer une nouvelle attestation de travail pour un employé',
};

async function NewCertificatePage() {
  // Vérifier l'authentification
  const user = auth.currentUser;
  if (!user) {
    redirect('/auth/login?callbackUrl=/dashboard/certificates/new');
  }
  
  // Récupérer les entreprises de l'utilisateur
  const companies = await getUserCompanies();
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Créer une attestation de travail</h1>
      <CertificateForm companies={companies} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <NewCertificatePage />
    </Suspense>
  );
} 