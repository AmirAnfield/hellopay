"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Ban 
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Type pour les bulletins de paie
interface Payslip {
  id: string;
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  grossSalary: number;
  netSalary: number;
  employeeName: string;
  employerName: string;
  pdfUrl?: string;
}

interface PayslipTableProps {
  employeeId?: string;
  companyId?: string;
}

export function PayslipTable({ employeeId, companyId }: PayslipTableProps) {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchPayslips();
  }, [employeeId, companyId]);

  // Fonction pour récupérer les bulletins de paie
  async function fetchPayslips() {
    setIsLoading(true);
    try {
      // Construire l'URL en fonction des props
      let url = "/api/payslips";
      const params = new URLSearchParams();
      
      if (employeeId) {
        params.append("employeeId", employeeId);
      }
      
      if (companyId) {
        params.append("companyId", companyId);
      }
      
      if (params.toString()) {
        url = `${url}?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des bulletins de paie");
      }
      
      const data = await response.json();
      setPayslips(data.payslips || []);
      setError(null);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les bulletins de paie. Veuillez réessayer.");
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les bulletins de paie. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Fonction pour télécharger un bulletin
  async function downloadPayslip(id: string) {
    try {
      window.open(`/api/download-payslip?id=${id}`, "_blank");
    } catch (err) {
      console.error("Erreur:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de télécharger le bulletin. Veuillez réessayer."
      });
    }
  }

  // Fonction pour supprimer un bulletin
  async function deletePayslip(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce bulletin ? Cette action est irréversible.")) {
      return;
    }

    try {
      const response = await fetch(`/api/delete-payslip?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du bulletin");
      }

      // Mise à jour de la liste locale
      setPayslips(payslips.filter(payslip => payslip.id !== id));
      toast({
        title: "Bulletin supprimé",
        description: "Le bulletin a été supprimé avec succès."
      });
    } catch (err) {
      console.error("Erreur:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le bulletin. Veuillez réessayer."
      });
    }
  }

  // Formatage de date
  function formatDate(dateString: string) {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  }

  // Formatage de montant
  function formatAmount(amount: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }

  // Affichage du chargement
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-2" />
        <p className="text-muted-foreground mb-2">{error}</p>
        <Button onClick={fetchPayslips} variant="outline" size="sm">
          Réessayer
        </Button>
      </div>
    );
  }

  // Affichage sans bulletins
  if (payslips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
        <Ban className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-muted-foreground mb-2">Aucun bulletin de paie trouvé.</p>
        {employeeId && (
          <Button 
            onClick={() => router.push(`/payslip/new?employeeId=${employeeId}`)}
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            Créer un bulletin
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Période</TableHead>
            <TableHead>Employé</TableHead>
            <TableHead>Entreprise</TableHead>
            <TableHead className="text-right">Salaire brut</TableHead>
            <TableHead className="text-right">Salaire net</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payslips.map((payslip) => (
            <TableRow key={payslip.id}>
              <TableCell>
                {formatDate(payslip.periodStart)} - {formatDate(payslip.periodEnd)}
              </TableCell>
              <TableCell>{payslip.employeeName}</TableCell>
              <TableCell>{payslip.employerName}</TableCell>
              <TableCell className="text-right">{formatAmount(payslip.grossSalary)}</TableCell>
              <TableCell className="text-right">{formatAmount(payslip.netSalary)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {payslip.pdfUrl && (
                    <Button 
                      onClick={() => downloadPayslip(payslip.id)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    onClick={() => deletePayslip(payslip.id)} 
                    variant="outline" 
                    size="sm"
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 