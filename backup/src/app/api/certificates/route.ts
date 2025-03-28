import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { CertificateService } from '@/services/document/CertificateService'
import puppeteer from 'puppeteer'

const prisma = new PrismaClient()

// GET - Récupérer toutes les attestations de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    // Récupérer l'ID de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }
    
    // Récupérer les attestations de l'utilisateur
    const certificates = await prisma.certificate.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ certificates })
  } catch (error) {
    console.error('Erreur lors de la récupération des attestations:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle attestation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    // Récupérer l'ID de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }
    
    // Récupérer les données de l'attestation depuis la requête
    const { certificate } = await req.json()
    
    if (!certificate) {
      return NextResponse.json(
        { error: 'Données de l\'attestation manquantes' },
        { status: 400 }
      )
    }
    
    // Générer le HTML de l'attestation
    const certificateHtml = CertificateService.generateCertificateHTML(certificate)
    
    // Convertir le HTML en PDF
    const browser = await puppeteer.launch({ 
      headless: true // Utiliser true au lieu de 'new' pour compatibilité
    })
    const page = await browser.newPage()
    await page.setContent(certificateHtml, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })
    
    await browser.close()
    
    // Créer un client Supabase
    const supabase = createClient()
    
    // Enregistrer le PDF dans Supabase Storage
    const timestamp = Date.now()
    const fileName = `certificate_${user.id}_${timestamp}.pdf`
    const bucketName = 'certificates'
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from(bucketName)
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })
    
    if (uploadError) {
      throw new Error(`Erreur lors de l'upload du PDF: ${uploadError.message}`)
    }
    
    // Obtenir l'URL du PDF
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)
    
    if (!urlData || !urlData.publicUrl) {
      throw new Error('Impossible d\'obtenir l\'URL du PDF')
    }
    
    // Créer l'entrée de l'attestation dans la base de données
    const newCertificate = await prisma.certificate.create({
      data: {
        userId: user.id,
        employerName: certificate.employerName,
        employerAddress: certificate.employerAddress,
        employerSiret: certificate.employerSiret,
        employeeName: certificate.employeeName,
        employeeAddress: certificate.employeeAddress,
        employeePosition: certificate.employeePosition,
        certificateType: certificate.certificateType,
        startDate: new Date(certificate.startDate),
        endDate: certificate.endDate ? new Date(certificate.endDate) : null,
        additionalInformation: certificate.additionalInformation || null,
        issuedDate: new Date(certificate.issuedDate),
        issuedLocation: certificate.issuedLocation,
        pdfUrl: urlData.publicUrl
      }
    })
    
    return NextResponse.json({ certificate: newCertificate })
  } catch (error) {
    console.error('Erreur lors de la création de l\'attestation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 