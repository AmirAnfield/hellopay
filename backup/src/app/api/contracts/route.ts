import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { ContractService } from '@/services/document/ContractService'
import { PDFDocument } from 'pdf-lib'
import puppeteer from 'puppeteer'

const prisma = new PrismaClient()

// GET - Récupérer tous les contrats de l'utilisateur
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
    
    // Récupérer les contrats de l'utilisateur
    const contracts = await prisma.contract.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ contracts })
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau contrat
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
    
    // Récupérer les données du contrat depuis la requête
    const { contract } = await req.json()
    
    if (!contract) {
      return NextResponse.json(
        { error: 'Données du contrat manquantes' },
        { status: 400 }
      )
    }
    
    // Générer le HTML du contrat
    const contractHtml = ContractService.generateContractHTML(contract)
    
    // Convertir le HTML en PDF
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()
    await page.setContent(contractHtml, { waitUntil: 'networkidle0' })
    
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
    const fileName = `contract_${user.id}_${timestamp}.pdf`
    const bucketName = 'contracts'
    
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
    
    // Créer l'entrée du contrat dans la base de données
    const newContract = await prisma.contract.create({
      data: {
        userId: user.id,
        employerName: contract.employerName,
        employerAddress: contract.employerAddress,
        employerSiret: contract.employerSiret,
        employeeName: contract.employeeName,
        employeeAddress: contract.employeeAddress,
        employeePosition: contract.employeePosition,
        contractType: contract.contractType,
        startDate: new Date(contract.startDate),
        endDate: contract.endDate ? new Date(contract.endDate) : null,
        salary: contract.salary,
        pdfUrl: urlData.publicUrl
      }
    })
    
    return NextResponse.json({ contract: newContract })
  } catch (error) {
    console.error('Erreur lors de la création du contrat:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
} 