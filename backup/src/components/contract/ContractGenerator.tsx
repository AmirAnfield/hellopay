'use client'

import { useState } from 'react'
import { ContractData, ContractType } from '@/services/document/ContractService'

interface ContractGeneratorProps {
  onGenerate: (contract: ContractData) => void
}

export function ContractGenerator({ onGenerate }: ContractGeneratorProps) {
  const [formData, setFormData] = useState<Partial<ContractData>>({
    // Valeurs par défaut pour l'employeur
    employerName: '',
    employerAddress: '',
    employerSiret: '',
    employerUrssaf: '',
    
    // Valeurs par défaut pour l'employé
    employeeName: '',
    employeeAddress: '',
    employeePosition: '',
    employeeSocialSecurityNumber: '',
    
    // Valeurs par défaut pour le contrat
    contractType: 'CDI',
    startDate: new Date(),
    salary: 0,
    jobDescription: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation des champs obligatoires
    const requiredFields: Array<keyof ContractData> = [
      'employerName', 'employerAddress', 'employerSiret', 'employerUrssaf',
      'employeeName', 'employeeAddress', 'employeePosition', 'employeeSocialSecurityNumber',
      'contractType', 'startDate', 'salary', 'jobDescription'
    ]

    const missingFields = requiredFields.filter(field => !formData[field])
    if (missingFields.length > 0) {
      alert(`Veuillez remplir tous les champs obligatoires : ${missingFields.join(', ')}`)
      return
    }

    // Si le contrat est de type CDD, vérifier que la date de fin est présente
    if (formData.contractType === 'CDD' && !formData.endDate) {
      alert('Veuillez spécifier une date de fin pour un contrat à durée déterminée')
      return
    }

    // Conversion du salaire en nombre
    const salary = typeof formData.salary === 'string' 
      ? parseFloat(formData.salary) 
      : formData.salary || 0

    // Appel de la fonction onGenerate avec les données du formulaire
    onGenerate({
      ...formData as ContractData,
      salary
    })

    // Réinitialisation du formulaire (optionnel)
    // setFormData({...}) // Décommentez pour réinitialiser après génération
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    
    // Gestion des valeurs spéciales (dates, nombres)
    let processedValue: any = value
    
    if (type === 'date') {
      processedValue = new Date(value)
    } else if (type === 'number') {
      processedValue = parseFloat(value)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations de l'employeur */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informations de l'employeur</h3>
          
          <div>
            <label htmlFor="employerName" className="block text-sm font-medium text-gray-700">
              Raison sociale
            </label>
            <input
              type="text"
              id="employerName"
              name="employerName"
              value={formData.employerName || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="employerAddress" className="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <input
              type="text"
              id="employerAddress"
              name="employerAddress"
              value={formData.employerAddress || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="employerSiret" className="block text-sm font-medium text-gray-700">
              Numéro SIRET
            </label>
            <input
              type="text"
              id="employerSiret"
              name="employerSiret"
              value={formData.employerSiret || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="employerUrssaf" className="block text-sm font-medium text-gray-700">
              Numéro URSSAF
            </label>
            <input
              type="text"
              id="employerUrssaf"
              name="employerUrssaf"
              value={formData.employerUrssaf || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
        </div>
        
        {/* Informations du salarié */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informations du salarié</h3>
          
          <div>
            <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700">
              Nom complet
            </label>
            <input
              type="text"
              id="employeeName"
              name="employeeName"
              value={formData.employeeName || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="employeeAddress" className="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <input
              type="text"
              id="employeeAddress"
              name="employeeAddress"
              value={formData.employeeAddress || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="employeePosition" className="block text-sm font-medium text-gray-700">
              Poste
            </label>
            <input
              type="text"
              id="employeePosition"
              name="employeePosition"
              value={formData.employeePosition || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="employeeSocialSecurityNumber" className="block text-sm font-medium text-gray-700">
              Numéro de sécurité sociale
            </label>
            <input
              type="text"
              id="employeeSocialSecurityNumber"
              name="employeeSocialSecurityNumber"
              value={formData.employeeSocialSecurityNumber || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
        </div>
      </div>
      
      {/* Informations du contrat */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informations du contrat</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contractType" className="block text-sm font-medium text-gray-700">
              Type de contrat
            </label>
            <select
              id="contractType"
              name="contractType"
              value={formData.contractType || 'CDI'}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            >
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="TempsPartiel">Temps partiel</option>
              <option value="TempsComplet">Temps complet</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
              Salaire brut mensuel (€)
            </label>
            <input
              type="number"
              id="salary"
              name="salary"
              value={formData.salary || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Date de début
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
          
          {formData.contractType === 'CDD' && (
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                Date de fin
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required={formData.contractType === 'CDD'}
              />
            </div>
          )}
          
          <div>
            <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700">
              Heures hebdomadaires
            </label>
            <input
              type="number"
              id="workingHours"
              name="workingHours"
              value={formData.workingHours || ''}
              onChange={handleChange}
              min="0"
              step="0.5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="trialPeriod" className="block text-sm font-medium text-gray-700">
              Période d'essai (jours)
            </label>
            <input
              type="number"
              id="trialPeriod"
              name="trialPeriod"
              value={formData.trialPeriod || ''}
              onChange={handleChange}
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
            Description du poste
          </label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            value={formData.jobDescription || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            required
          />
        </div>
        
        <div>
          <label htmlFor="collectiveAgreement" className="block text-sm font-medium text-gray-700">
            Convention collective
          </label>
          <input
            type="text"
            id="collectiveAgreement"
            name="collectiveAgreement"
            value={formData.collectiveAgreement || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Générer le contrat
        </button>
      </div>
    </form>
  )
} 