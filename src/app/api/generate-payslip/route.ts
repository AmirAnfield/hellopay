import { NextResponse } from 'next/server';
import { PayslipPdfService } from '@/services/pdf/PayslipPdfService';
import { PayslipData } from '@/components/payslip/PayslipCalculator';

const pdfService = PayslipPdfService.getInstance();

export async function POST(request: Request) {
  try {
    const data: PayslipData = await request.json();
    const pdf = await pdfService.generatePDF(data);

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="fiche-paie-${data.employeeName}-${new Date(data.periodStart).toLocaleDateString()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
} 