'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { supabase } from '../../../../lib/supabase'
import { ContractService, ContractData } from '../../../../services/contract/ContractService'
import ContractTemplate from '../../../../components/contract/ContractTemplate'

export default function NewContract() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    // Infos de l'employeur
    employerName: '',
    employerAddress: '',
    employerSiren: '',
    
    // Infos de l'employé
    employeeName: '',
    employeeAddress: '',
    employeeSSN: '',
    employeeBirthDate: '',
    employeeNationality: '',
    
    // Infos du contrat
    position: '',
    contractType: 'CDI',
    contractStartDate: '',
    baseSalary: '',
    weeklyHours: '35',
    workplace: '',
    
    // Détails supplémentaires
    probationPeriod: '2',
    noticePeriod: '1',
    vacationDays: '25',
    specificClauses: ''
  })
  
  const [pdfReady, setPdfReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [contractData, setContractData] = useState<ContractData | null>(null)
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null)
  const pdfLinkRef = useRef<HTMLAnchorElement | null>(null)
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }
      
      // Préparer les données du contrat
      const contract: ContractData = {
        userId: session.user.id,
        employeeName: formData.employeeName,
        position: formData.position,
        contractType: formData.contractType,
        contractStartDate: formData.contractStartDate,
        baseSalary: parseFloat(formData.baseSalary),
        weeklyHours: parseFloat(formData.weeklyHours)
      }
      
      // Stocker les données pour la génération du PDF
      setContractData(contract)
      setPdfReady(true)
      
    } catch (err) {
      console.error('Erreur lors de la préparation du contrat:', err)
      setError('Une erreur est survenue lors de la préparation du contrat.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleSaveContract = async () => {
    if (!contractData || !generatedPdfBlob) {
      setError('Données du contrat ou PDF non disponibles.')
      return
    }
    
    setLoading(true)
    
    try {
      // Convertir le Blob en File pour l'upload
      const pdfFile = new File(
        [generatedPdfBlob], 
        `contrat_${contractData.employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`, 
        { type: 'application/pdf' }
      )
      
      // Enregistrer le contrat et uploader le PDF
      const { data, error } = await ContractService.createContract(contractData, pdfFile)
      
      if (error) {
        throw error
      }
      
      // Rediriger vers la liste des contrats
      router.push('/dashboard/contracts')
      
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du contrat:', err)
      setError('Une erreur est survenue lors de l\'enregistrement du contrat.')
    } finally {
      setLoading(false)
    }
  }
  
  // Fonction pour capturer le PDF généré
  const handlePdfGenerated = (blob: Blob) => {
    setGeneratedPdfBlob(blob)
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Créer un nouveau contrat</h1>
        <button 
          onClick={() => router.push('/dashboard/contracts')}
          className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Retour
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 mb-6 rounded-md">
          {error}
        </div>
      )}
      
      {pdfReady && contractData ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Contrat généré</h2>
          
          <div className="flex flex-col gap-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="font-medium">Le contrat a été généré avec succès pour {formData.employeeName}.</p>
              <p className="text-sm text-gray-600 mt-1">Vous pouvez télécharger le PDF et l'enregistrer dans votre espace.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <PDFDownloadLink
                document={
                  <ContractTemplate 
                    contractData={formData} 
                    onPdfGenerated={handlePdfGenerated}
                  />
                }
                fileName={`contrat_${formData.employeeName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
              >
                {({ blob, url, loading, error }) => 
                  loading ? 'Génération du PDF...' : 'Télécharger le PDF'
                }
              </PDFDownloadLink>
              
              <button
                onClick={handleSaveContract}
                disabled={loading || !generatedPdfBlob}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer le contrat'}
              </button>
              
              <button
                onClick={() => setPdfReady(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Modifier les informations
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section employeur */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-3 pb-2 border-b">Informations de l'employeur</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="employerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'employeur
                </label>
                <input
                  type="text"
                  id="employerName"
                  name="employerName"
                  value={formData.employerName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="employerSiren" className="block text-sm font-medium text-gray-700 mb-1">
                  SIREN
                </label>
                <input
                  type="text"
                  id="employerSiren"
                  name="employerSiren"
                  value={formData.employerSiren}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="employerAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse de l'employeur
              </label>
              <textarea
                id="employerAddress"
                name="employerAddress"
                value={formData.employerAddress}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Section employé */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-xl font-semibold mb-3 pb-2 border-b">Informations de l'employé</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'employé
                </label>
                <input
                  type="text"
                  id="employeeName"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="employeeSSN" className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de sécurité sociale
                </label>
                <input
                  type="text"
                  id="employeeSSN"
                  name="employeeSSN"
                  value={formData.employeeSSN}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="employeeBirthDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  id="employeeBirthDate"
                  name="employeeBirthDate"
                  value={formData.employeeBirthDate}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="employeeNationality" className="block text-sm font-medium text-gray-700 mb-1">
                  Nationalité
                </label>
                <input
                  type="text"
                  id="employeeNationality"
                  name="employeeNationality"
                  value={formData.employeeNationality}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="employeeAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse de l'employé
              </label>
              <textarea
                id="employeeAddress"
                name="employeeAddress"
                value={formData.employeeAddress}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Section contrat */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-xl font-semibold mb-3 pb-2 border-b">Détails du contrat</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                  Poste
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-1">
                  Type de contrat
                </label>
                <select
                  id="contractType"
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Alternance">Alternance</option>
                  <option value="Stage">Stage</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="contractStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  id="contractStartDate"
                  name="contractStartDate"
                  value={formData.contractStartDate}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="baseSalary" className="block text-sm font-medium text-gray-700 mb-1">
                  Salaire brut mensuel (€)
                </label>
                <input
                  type="number"
                  id="baseSalary"
                  name="baseSalary"
                  value={formData.baseSalary}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="weeklyHours" className="block text-sm font-medium text-gray-700 mb-1">
                  Heures hebdomadaires
                </label>
                <input
                  type="number"
                  id="weeklyHours"
                  name="weeklyHours"
                  value={formData.weeklyHours}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="48"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="workplace" className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu de travail
                </label>
                <input
                  type="text"
                  id="workplace"
                  name="workplace"
                  value={formData.workplace}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="probationPeriod" className="block text-sm font-medium text-gray-700 mb-1">
                  Période d'essai (mois)
                </label>
                <input
                  type="number"
                  id="probationPeriod"
                  name="probationPeriod"
                  value={formData.probationPeriod}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="12"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="vacationDays" className="block text-sm font-medium text-gray-700 mb-1">
                  Jours de congés annuels
                </label>
                <input
                  type="number"
                  id="vacationDays"
                  name="vacationDays"
                  value={formData.vacationDays}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="specificClauses" className="block text-sm font-medium text-gray-700 mb-1">
                Clauses spécifiques (optionnel)
              </label>
              <textarea
                id="specificClauses"
                name="specificClauses"
                value={formData.specificClauses}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Génération en cours...' : 'Générer le contrat'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
} 