import { NextResponse } from 'next/server';
import { PayslipService } from '@/services/database/PayslipService';
import type { PayslipData } from '@/components/payslip/PayslipCalculator';

export async function POST(request: Request) {
  try {
    const payslipData: PayslipData = await request.json();
    const payslipService = PayslipService.getInstance();
    await payslipService.savePayslip(payslipData);
    return NextResponse.json({ message: 'Fiche de paie enregistrée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la fiche de paie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de la fiche de paie' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeName = searchParams.get('employeeName');
    const id = searchParams.get('id');

    const payslipService = PayslipService.getInstance();

    if (id) {
      const payslip = await payslipService.getPayslipById(id);
      if (!payslip) {
        return NextResponse.json(
          { error: 'Fiche de paie non trouvée' },
          { status: 404 }
        );
      }
      return NextResponse.json(payslip);
    }

    if (employeeName) {
      const payslips = await payslipService.getPayslipsByEmployee(employeeName);
      return NextResponse.json(payslips);
    }

    return NextResponse.json(
      { error: 'Paramètre employeeName ou id requis' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des fiches de paie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des fiches de paie' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Paramètre id requis' },
        { status: 400 }
      );
    }

    const payslipService = PayslipService.getInstance();
    await payslipService.deletePayslip(id);

    return NextResponse.json({ message: 'Fiche de paie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la fiche de paie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la fiche de paie' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeName = searchParams.get('employeeName');

    if (!employeeName) {
      return NextResponse.json(
        { error: 'Paramètre employeeName requis' },
        { status: 400 }
      );
    }

    const payslipService = PayslipService.getInstance();
    await payslipService.resetCumulatives(employeeName);

    return NextResponse.json({ message: 'Cumuls réinitialisés avec succès' });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des cumuls:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation des cumuls' },
      { status: 500 }
    );
  }
} 