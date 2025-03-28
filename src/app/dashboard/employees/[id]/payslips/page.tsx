import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, User } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PayslipTable } from "@/components/dashboard/PayslipTable";

export const metadata: Metadata = {
  title: "Bulletins de paie de l'employé | HelloPay",
  description: "Consultez tous les bulletins de paie de cet employé",
};

interface EmployeePayslipsPageProps {
  params: {
    id: string;
  };
}

async function getEmployee(id: string) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return employee;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'employé:", error);
    return null;
  }
}

export default async function EmployeePayslipsPage({ params }: EmployeePayslipsPageProps) {
  const employee = await getEmployee(params.id);
  
  return (
    <div className="container py-10 max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/employees`}>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour aux employés
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-2xl font-bold">
                {employee ? `${employee.firstName} ${employee.lastName}` : "Employé"}
              </h1>
            </div>
            
            {employee?.company && (
              <p className="text-muted-foreground">
                Entreprise: {employee.company.name}
              </p>
            )}
          </div>
          
          <Link href={`/payslip/new?employeeId=${params.id}`}>
            <Button className="w-full md:w-auto flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Nouveau bulletin
            </Button>
          </Link>
        </div>
        
        <div>
          <PayslipTable employeeId={params.id} />
        </div>
      </div>
    </div>
  );
} 