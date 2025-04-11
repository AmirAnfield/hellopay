import { Metadata } from 'next';
import { ContractFormPage } from '@/components/contract-template';

export const metadata: Metadata = {
  title: 'Constructeur de contrat | HelloPay',
  description: 'Créez et personnalisez facilement vos contrats de travail en temps réel'
};

export default function ContractBuilderPage() {
  return <ContractFormPage />;
} 