import { redirect } from 'next/navigation';

export default function OldPayslipPage() {
  // Redirection vers la nouvelle page
  redirect('/payslips');
} 