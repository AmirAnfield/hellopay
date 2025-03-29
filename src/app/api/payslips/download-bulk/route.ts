import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import JSZip from 'jszip';

interface CompanyAdmin {
  id: string;
}

export async function POST(req: NextRequest) {
  // Vérifier l'authentification
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { payslipIds } = await req.json();

    if (!payslipIds || !Array.isArray(payslipIds) || payslipIds.length === 0) {
      return NextResponse.json(
        { error: 'Liste d\'IDs de bulletins de paie invalide' },
        { status: 400 }
      );
    }

    // Récupérer les bulletins de l'utilisateur
    const payslips = await prisma.payslip.findMany({
      where: {
        id: { in: payslipIds },
        OR: [
          { userId: session.user.id },
          // Si l'utilisateur est administrateur, il peut accéder à tous les bulletins
          { 
            companyId: { 
              in: (session.user as { companiesAdministered?: CompanyAdmin[] }).companiesAdministered?.map((c: CompanyAdmin) => c.id) || [] 
            } 
          }
        ]
      },
      include: {
        employee: true,
        company: true
      }
    });

    if (payslips.length === 0) {
      return NextResponse.json(
        { error: 'Aucun bulletin trouvé ou accès non autorisé' },
        { status: 404 }
      );
    }

    // Créer un fichier ZIP
    const zip = new JSZip();

    // Pour chaque bulletin, générer un "fichier" PDF (simulé pour le moment)
    for (const payslip of payslips) {
      const employeeName = `${payslip.employee?.firstName || ''}_${payslip.employee?.lastName || ''}`.trim();
      const periodValue = payslip.period || 'sans-date';
      const fileName = `bulletin_${employeeName}_${periodValue}.pdf`;
      
      // Dans une version réelle, ici on génèrerait un vrai PDF avec le contenu du bulletin
      // Pour cette démonstration, nous ajoutons juste un fichier texte avec des données basiques
      const fileContent = `
        Bulletin de paie
        -----------------
        Employé: ${payslip.employee?.firstName} ${payslip.employee?.lastName}
        Entreprise: ${payslip.company?.name}
        Période: ${periodValue}
        Salaire brut: ${payslip.grossSalary}€
        Salaire net: ${payslip.netSalary}€
        Cotisations salariales: ${
          typeof payslip.employeeContributions === 'object' ? 
          JSON.stringify(payslip.employeeContributions) : 
          'Non spécifiées'
        }
        Date de génération: ${new Date().toLocaleDateString('fr-FR')}
      `;
      
      zip.file(fileName, fileContent);
    }

    // Générer le ZIP
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

    // Créer la réponse avec le fichier ZIP
    const response = new NextResponse(zipContent);
    
    // Définir les entêtes pour un téléchargement de fichier
    response.headers.set('Content-Type', 'application/zip');
    response.headers.set('Content-Disposition', 'attachment; filename="bulletins_de_paie.zip"');

    return response;
  } catch (error) {
    console.error('Erreur lors de la génération du ZIP:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du fichier ZIP' },
      { status: 500 }
    );
  }
} 