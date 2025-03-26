import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Plus, Users } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-gray-600">Bienvenue sur votre espace HelloPay</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Fiches de paie récentes</h2>
            <Button size="sm" asChild>
              <Link href="/dashboard/payslips/create">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle fiche
              </Link>
            </Button>
          </div>
          
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-md">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">Aucune fiche de paie pour le moment</p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/dashboard/payslips/create">Créer votre première fiche</Link>
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Employés</h2>
            <Button size="sm" asChild>
              <Link href="/dashboard/employees/create">
                <Plus className="mr-2 h-4 w-4" />
                Nouvel employé
              </Link>
            </Button>
          </div>
          
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-md">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">Aucun employé pour le moment</p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/dashboard/employees/create">Ajouter un employé</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Guide de démarrage rapide</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Commencez par ajouter les informations de votre entreprise dans les paramètres</li>
          <li>Ajoutez vos employés avec leurs informations personnelles et contractuelles</li>
          <li>Créez votre première fiche de paie en sélectionnant un employé et en renseignant les données</li>
          <li>Téléchargez ou envoyez directement le bulletin de paie au format PDF</li>
        </ol>
      </div>
    </div>
  );
} 