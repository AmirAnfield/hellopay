import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Crée le dossier de stockage s'il n'existe pas
const UPLOAD_DIR = path.join(process.cwd(), 'payslips');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour effectuer cette action' },
        { status: 401 }
      );
    }

    // Récupérer les données de la requête
    const formData = await req.formData();
    const pdfFile = formData.get('file') as File;
    
    if (!pdfFile) {
      return NextResponse.json(
        { error: 'Aucun fichier PDF trouvé dans la requête' },
        { status: 400 }
      );
    }

    // Récupérer les métadonnées
    const employerName = formData.get('employerName') as string;
    const employerSiret = formData.get('employerSiret') as string;
    const employeeFirstName = formData.get('employeeFirstName') as string;
    const employeeLastName = formData.get('employeeLastName') as string;
    const employeePosition = formData.get('employeePosition') as string;
    const period = formData.get('period') as string;
    const grossSalary = parseFloat(formData.get('grossSalary') as string);
    const netToPay = parseFloat(formData.get('netToPay') as string);
    const paymentDate = formData.get('paymentDate') as string;

    // Générer un nom de fichier unique
    const uniqueId = uuidv4();
    const fileExtension = 'pdf';
    const fileName = `payslip_${employeeLastName}_${period.replace(/\s/g, '_')}_${uniqueId}.${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Enregistrer le fichier
    const fileBuffer = await pdfFile.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(fileBuffer));
    
    // Enregistrer les informations dans la base de données
    const user = await db.user.findUnique({
      where: { email: session.user.email || '' },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Créer l'entrée dans la base de données
    const payslip = await db.payslip.create({
      data: {
        userId: user.id,
        fileName,
        filePath: `payslips/${fileName}`,
        employerName,
        employerSiret,
        employeeFirstName,
        employeeLastName,
        employeePosition,
        period,
        grossSalary,
        netToPay,
        paymentDate,
      },
    });

    return NextResponse.json({
      success: true,
      payslipId: payslip.id,
      message: 'Fiche de paie enregistrée avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la fiche de paie:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement de la fiche de paie' },
      { status: 500 }
    );
  }
} 