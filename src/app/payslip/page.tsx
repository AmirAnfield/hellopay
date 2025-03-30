import { redirect } from 'next/navigation';

export default function OldPayslipPage() {
  // Redirection vers la nouvelle page dans le tableau de bord
  redirect('/dashboard/payslips');
} 