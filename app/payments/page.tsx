import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-2 mb-8">
        <CreditCard className="text-primary" size={28} />
        <h1 className="text-3xl font-bold">Vos paiements</h1>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-3">Aucun paiement pour le moment</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Vous n'avez pas encore effectué de paiement. Commencez par configurer votre compte pour recevoir des paiements.
          </p>
          <button className="bg-primary text-white px-5 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
            Configurer mon compte
          </button>
        </div>
      </div>
    </div>
  );
} 