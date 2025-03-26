'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { PayslipTemplate } from '../../../../components/payslip/PayslipTemplate'
import { ContributionsService } from '../../../../services/payroll/ContributionsService'

// Interface pour les données de la fiche de paie
interface PayslipData {
  // Informations employeur
  employerName: string
  employerAddress: string
  employerSiret: string
  employerUrssaf: string
  
  // Informations salarié
  employeeName: string
  employeeAddress: string
  employeePosition: string
  employeeSocialSecurityNumber: string
  isExecutive: boolean
  
  // Période
  periodStart: Date
  periodEnd: Date
  paymentDate: Date
  fiscalYear: number
  
  // Rémunération
  hourlyRate: number
  hoursWorked: number
  grossSalary: number
  netSalary: number
  employerCost: number
  
  // Cotisations
  employeeContributions: number
  employerContributions: number
  contributionsDetails: string
  
  // Congés payés
  paidLeaveAcquired: number
  paidLeaveTaken: number
  paidLeaveRemaining: number
  
  // Cumuls
  cumulativeGrossSalary: number
  cumulativeNetSalary: number
  cumulativePeriodStart: Date
  cumulativePeriodEnd: Date
}

export default function NewPayslip() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [pdfReady, setPdfReady] = useState(false)
  const [formData, setFormData] = useState({
    // Informations employeur
    employerName: '',
    employerAddress: '',
    employerSiret: '',
    employerUrssaf: '',
    
    // Informations salarié
    employeeName: '',
    employeeAddress: '',
    employeePosition: '',
    employeeSocialSecurityNumber: '',
    isExecutive: false,
    
    // Période
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    paymentDate: new Date().toISOString().split('T')[0],
    
    // Rémunération
    hourlyRate: 0,
    hoursWorked: 151.67, // Par défaut, équivalent temps plein
    
    // Congés payés
    paidLeaveAcquired: 2.5,
    paidLeaveTaken: 0,
    paidLeaveRemaining: 0,
    
    // Cumuls (seront calculés)
    cumulativeGrossSalary: 0,
    cumulativeNetSalary: 0
  })
  
  const [payslipData, setPayslipData] = useState<PayslipData | null>(null)
  
  // Gérer les changements dans le formulaire
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) : 
              value
    }))
  }
  
  // Calculer les dates de période
  const getPeriodDates = () => {
    const year = formData.periodYear
    const month = formData.periodMonth - 1 // Mois JavaScript commence à 0
    
    const periodStart = new Date(year, month, 1)
    
    // Dernier jour du mois
    const periodEnd = new Date(year, month + 1, 0)
    
    return { periodStart, periodEnd }
  }
  
  // Calculer les cumuls
  const calculateCumulatives = () => {
    // Dans une vraie application, cela récupérerait les fiches de paie précédentes
    // Pour l'instant, nous utilisons des valeurs factices
    const fiscalYear = formData.periodYear
    const cumulativePeriodStart = new Date(fiscalYear, 0, 1) // 1er janvier
    const { periodEnd } = getPeriodDates()
    
    // Simuler les cumuls (dans une vraie app, calculer à partir des fiches précédentes)
    const grossSalary = formData.hourlyRate * formData.hoursWorked
    const { employee: employeeContributions } = ContributionsService.calculateContributions(
      grossSalary, 
      fiscalYear, 
      formData.isExecutive
    )
    const netSalary = grossSalary - employeeContributions
    
    // Supposons que c'est le premier mois de l'année
    const cumulativeGrossSalary = grossSalary
    const cumulativeNetSalary = netSalary
    
    return {
      cumulativeGrossSalary,
      cumulativeNetSalary,
      cumulativePeriodStart,
      cumulativePeriodEnd: periodEnd
    }
  }
  
  // Générer la fiche de paie
  const generatePayslip = () => {
    setLoading(true)
    
    try {
      const { periodStart, periodEnd } = getPeriodDates()
      const fiscalYear = formData.periodYear
      
      // Calculer le salaire
      const grossSalary = formData.hourlyRate * formData.hoursWorked
      
      // Calculer les cotisations
      const { 
        employee: employeeContributions, 
        employer: employerContributions,
        details: detailedContributions 
      } = ContributionsService.calculateContributions(
        grossSalary, 
        fiscalYear, 
        formData.isExecutive
      )
      
      // Calculer le salaire net et le coût employeur
      const netSalary = grossSalary - employeeContributions
      const totalEmployerCost = grossSalary + employerContributions
      
      // Calculer les cumuls
      const {
        cumulativeGrossSalary,
        cumulativeNetSalary,
        cumulativePeriodStart,
        cumulativePeriodEnd
      } = calculateCumulatives()
      
      // Créer les données de la fiche de paie
      const payslipData: PayslipData = {
        // Employer info
        employerName: formData.employerName,
        employerAddress: formData.employerAddress,
        employerSiret: formData.employerSiret,
        employerUrssaf: formData.employerUrssaf,
        
        // Employee info
        employeeName: formData.employeeName,
        employeeAddress: formData.employeeAddress,
        employeePosition: formData.employeePosition,
        employeeSocialSecurityNumber: formData.employeeSocialSecurityNumber,
        isExecutive: formData.isExecutive,
        
        // Period
        periodStart,
        periodEnd,
        paymentDate: new Date(formData.paymentDate),
        fiscalYear,
        
        // Remuneration
        hourlyRate: formData.hourlyRate,
        hoursWorked: formData.hoursWorked,
        grossSalary,
        netSalary,
        employerCost: totalEmployerCost,
        
        // Contributions
        employeeContributions,
        employerContributions,
        contributionsDetails: JSON.stringify(detailedContributions),
        
        // Paid leave
        paidLeaveAcquired: formData.paidLeaveAcquired,
        paidLeaveTaken: formData.paidLeaveTaken,
        paidLeaveRemaining: formData.paidLeaveRemaining,
        
        // Cumulative
        cumulativeGrossSalary,
        cumulativeNetSalary,
        cumulativePeriodStart,
        cumulativePeriodEnd
      }
      
      setPayslipData(payslipData)
      setPdfReady(true)
    } catch (error) {
      console.error('Erreur lors de la génération de la fiche de paie:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Créer une nouvelle fiche de paie</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Informations de l'employeur</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'employeur
            </label>
            <input
              type="text"
              name="employerName"
              value={formData.employerName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              name="employerAddress"
              value={formData.employerAddress}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SIRET
            </label>
            <input
              type="text"
              name="employerSiret"
              value={formData.employerSiret}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro URSSAF
            </label>
            <input
              type="text"
              name="employerUrssaf"
              value={formData.employerUrssaf}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Informations du salarié</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du salarié
            </label>
            <input
              type="text"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              name="employeeAddress"
              value={formData.employeeAddress}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poste
            </label>
            <input
              type="text"
              name="employeePosition"
              value={formData.employeePosition}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de sécurité sociale
            </label>
            <input
              type="text"
              name="employeeSocialSecurityNumber"
              value={formData.employeeSocialSecurityNumber}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isExecutive"
              checked={formData.isExecutive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Statut cadre
            </label>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Période et paiement</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mois
            </label>
            <select
              name="periodMonth"
              value={formData.periodMonth}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="1">Janvier</option>
              <option value="2">Février</option>
              <option value="3">Mars</option>
              <option value="4">Avril</option>
              <option value="5">Mai</option>
              <option value="6">Juin</option>
              <option value="7">Juillet</option>
              <option value="8">Août</option>
              <option value="9">Septembre</option>
              <option value="10">Octobre</option>
              <option value="11">Novembre</option>
              <option value="12">Décembre</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Année
            </label>
            <select
              name="periodYear"
              value={formData.periodYear}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de paiement
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Rémunération</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taux horaire (€)
            </label>
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heures travaillées
            </label>
            <input
              type="number"
              name="hoursWorked"
              value={formData.hoursWorked}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Congés payés</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acquis sur la période
            </label>
            <input
              type="number"
              name="paidLeaveAcquired"
              value={formData.paidLeaveAcquired}
              onChange={handleChange}
              min="0"
              step="0.5"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pris sur la période
            </label>
            <input
              type="number"
              name="paidLeaveTaken"
              value={formData.paidLeaveTaken}
              onChange={handleChange}
              min="0"
              step="0.5"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solde restant
            </label>
            <input
              type="number"
              name="paidLeaveRemaining"
              value={formData.paidLeaveRemaining}
              onChange={handleChange}
              min="0"
              step="0.5"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            Annuler
          </button>
          
          <button
            type="button"
            onClick={generatePayslip}
            disabled={loading || pdfReady}
            className={`px-4 py-2 text-white rounded ${
              loading || pdfReady
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Génération...' : pdfReady ? 'PDF prêt' : 'Générer la fiche de paie'}
          </button>
        </div>
      </div>
      
      {pdfReady && payslipData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            Fiche de paie générée avec succès !
          </h2>
          
          <div className="mb-4">
            <p className="text-green-700 mb-2">
              Récapitulatif de la fiche de paie :
            </p>
            <ul className="list-disc pl-5 text-green-700">
              <li>Employé : {payslipData.employeeName}</li>
              <li>Période : {payslipData.periodStart.toLocaleDateString('fr-FR')} au {payslipData.periodEnd.toLocaleDateString('fr-FR')}</li>
              <li>Salaire brut : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(payslipData.grossSalary)}</li>
              <li>Salaire net : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(payslipData.netSalary)}</li>
            </ul>
          </div>
          
          <div className="flex justify-center">
            <PDFDownloadLink
              document={<PayslipTemplate data={payslipData} />}
              fileName={`fiche-de-paie-${payslipData.employeeName.replace(/\s+/g, '-')}-${payslipData.periodStart.toISOString().substr(0, 7)}.pdf`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center"
            >
              {({ blob, url, loading, error }) =>
                loading ? 'Préparation du PDF...' : 'Télécharger la fiche de paie'
              }
            </PDFDownloadLink>
          </div>
        </div>
      )}
    </div>
  )
} 