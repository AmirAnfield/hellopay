import PayslipForm from '@/components/payroll/PayslipForm';

export const metadata = {
  title: 'HelloPay - Créer un bulletin de paie',
  description: 'Générez facilement des bulletins de paie pour vos employés',
};

export default function NewPayslipPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Créer un bulletin de paie</h1>
        <p className="text-gray-600">
          Remplissez le formulaire ci-dessous pour générer un nouveau bulletin de paie.
        </p>
      </div>
      
      <PayslipForm />
    </div>
  );
} 