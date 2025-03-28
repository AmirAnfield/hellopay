import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

// Les types et interfaces utilisés dans la page
interface PayslipData {
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

export const metadata: Metadata = {
  title: "Tableau de bord | HelloPay",
  description: "Gérez vos entreprises, vos employés et vos bulletins de paie",
};

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
      <DashboardLayout />
    </div>
  );
} 