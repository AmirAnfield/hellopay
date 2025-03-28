"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Download, ArrowLeft, Loader2, Printer, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type PayslipDetails = {
  id: string;
  employerName: string;
  employerAddress: string;
  employerSiret: string;
  employerUrssaf: string;
  employeeName: string;
  employeeAddress: string;
  employeePosition: string;
  employeeSocialSecurityNumber: string;
  isExecutive: boolean;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  hourlyRate: number;
  hoursWorked: number;
  grossSalary: number;
  netSalary: number;
  employeeContributions: number;
  employerContributions: number;
  employerCost: number;
  paidLeaveAcquired: number;
  paidLeaveTaken: number;
  paidLeaveRemaining: number;
  pdfUrl?: string;
};

export default function PayslipViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [payslip, setPayslip] = useState<PayslipDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchPayslipDetails();
    }
  }, [status, params.id]);

  const fetchPayslipDetails = async () => {
    try {
      const response = await fetch(`/api/payslips/${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setPayslip(data.payslip);
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer les détails du bulletin de paie",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la récupération des détails",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/download-payslip?id=${params.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bulletin-de-paie-${params.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de télécharger le bulletin de paie",
        });
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement",
      });
    }
  };

  const handleDelete = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce bulletin de paie ?")) {
      setIsDeleting(true);
      
      try {
        const response = await fetch(`/api/delete-payslip?id=${params.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast({
            title: "Suppression réussie",
            description: "Le bulletin de paie a été supprimé avec succès",
          });
          router.push("/dashboard");
        } else {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de supprimer le bulletin de paie",
          });
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la suppression",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Bulletin non trouvé</CardTitle>
            <CardDescription>
              Le bulletin de paie demandé n&apos;existe pas ou vous n&apos;avez pas les permissions nécessaires.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard")}>
              Retour au tableau de bord
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Formater les dates
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  // Formater le mois
  const formatMonth = (dateString: string) => {
    return format(new Date(dateString), 'MMMM yyyy', { locale: fr });
  };

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between print:hidden">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Bulletin de paie</h1>
            <p className="text-muted-foreground">
              {payslip.employeeName} - {formatMonth(payslip.periodStart)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
            <Button variant="outline" className="gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" /> Imprimer
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" /> Télécharger
            </Button>
            <Button variant="destructive" className="gap-2" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Supprimer
            </Button>
          </div>
        </div>

        {/* Prévisualisation du bulletin */}
        <div className="max-w-4xl mx-auto bg-white p-8 shadow-md print:shadow-none rounded-lg print:rounded-none">
          <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b">
            <div>
              <h2 className="text-xl font-bold">Employeur</h2>
              <p className="font-semibold mt-2">{payslip.employerName}</p>
              <p>{payslip.employerAddress}</p>
              <p>SIRET: {payslip.employerSiret}</p>
              <p>N° URSSAF: {payslip.employerUrssaf}</p>
            </div>
            <div>
              <h2 className="text-xl font-bold">Salarié</h2>
              <p className="font-semibold mt-2">{payslip.employeeName}</p>
              <p>{payslip.employeeAddress}</p>
              <p>Poste: {payslip.employeePosition}</p>
              <p>N° SS: {payslip.employeeSocialSecurityNumber}</p>
              <p>Statut: {payslip.isExecutive ? "Cadre" : "Non cadre"}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">Bulletin de paie</h2>
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <p>Période: du {formatDate(payslip.periodStart)} au {formatDate(payslip.periodEnd)}</p>
                <p>Date de paiement: {formatDate(payslip.paymentDate)}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Rubriques</th>
                  <th className="border p-2 text-right">Base</th>
                  <th className="border p-2 text-right">Taux</th>
                  <th className="border p-2 text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">Salaire de base</td>
                  <td className="border p-2 text-right">{payslip.hoursWorked.toFixed(2)} h</td>
                  <td className="border p-2 text-right">{payslip.hourlyRate.toFixed(2)} €</td>
                  <td className="border p-2 text-right font-semibold">{payslip.grossSalary.toFixed(2)} €</td>
                </tr>
                <tr>
                  <td className="border p-2">Cotisations salariales</td>
                  <td className="border p-2 text-right">{payslip.grossSalary.toFixed(2)} €</td>
                  <td className="border p-2 text-right">~22%</td>
                  <td className="border p-2 text-right text-red-600">-{payslip.employeeContributions.toFixed(2)} €</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border p-2 font-semibold">NET À PAYER</td>
                  <td className="border p-2"></td>
                  <td className="border p-2"></td>
                  <td className="border p-2 text-right font-bold">{payslip.netSalary.toFixed(2)} €</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Congés payés</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <p className="font-semibold">Acquis</p>
                <p className="font-semibold">Pris</p>
                <p className="font-semibold">Solde</p>
                <p>{payslip.paidLeaveAcquired} jours</p>
                <p>{payslip.paidLeaveTaken} jours</p>
                <p>{payslip.paidLeaveRemaining} jours</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Cotisations et contributions</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>Part salariale:</p>
                <p className="text-right">{payslip.employeeContributions.toFixed(2)} €</p>
                <p>Part patronale:</p>
                <p className="text-right">{payslip.employerContributions.toFixed(2)} €</p>
                <p className="font-semibold">Coût total employeur:</p>
                <p className="text-right font-semibold">{payslip.employerCost.toFixed(2)} €</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-8 pt-4 border-t">
            <p>En application de l'article L. 3243-4 du Code du travail, il est conseillé de conserver ce bulletin de paie sans limitation de durée.</p>
            <p className="text-center mt-4 font-semibold">Document généré par HelloPay - Bulletin à valeur légale</p>
          </div>
        </div>
      </div>
    </div>
  );
} 