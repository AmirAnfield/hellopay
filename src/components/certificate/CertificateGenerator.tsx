'use client'

import { useState } from 'react'
import { CertificateData, CertificateType } from '../../services/document/CertificateService'

interface CertificateGeneratorProps {
  onGenerate: (certificate: CertificateData) => void
}

export function CertificateGenerator({ onGenerate }: CertificateGeneratorProps) {
  const [formData, setFormData] = useState<Partial<CertificateData>>({
    // Valeurs par défaut pour l'employeur
    employerName: '',
    employerAddress: '',
    employerSiret: '',
    employerPhone: '',
    employerEmail: '',
    
    // Valeurs par défaut pour l'employé
    employeeName: '',
    employeeAddress: '',
    employeePosition: '',
    employeeSocialSecurityNumber: '',
    
    // Valeurs par défaut pour l'attestation
    certificateType: 'Emploi',
    startDate: new Date(),
    issuedDate: new Date(),
    issuedLocation: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation des champs obligatoires
    const requiredFields: Array<keyof CertificateData> = [
      'employerName', 'employerAddress', 'employerSiret',
      'employeeName', 'employeeAddress', 'employeePosition', 'employeeSocialSecurityNumber',
      'certificateType', 'startDate', 'issuedDate', 'issuedLocation'
    ]

    const missingFields = requiredFields.filter(field => !formData[field])
    if (missingFields.length > 0) {
      alert(`Veuillez remplir tous les champs obligatoires : ${missingFields.join(', ')}`)
      return
    }

    // Si le certificat est de type Travail ou FinContrat, vérifier que la date de fin est présente
    if ((formData.certificateType === 'Travail' || formData.certificateType === 'FinContrat') && !formData.endDate) {
      alert('Veuillez spécifier une date de fin pour ce type d\'attestation')
      return
    }

    // Appel de la fonction onGenerate avec les données du formulaire
    onGenerate(formData as CertificateData)

    // Réinitialisation du formulaire (optionnel)
    // setFormData({...}) // Décommentez pour réinitialiser après génération
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    
    // Gestion des valeurs spéciales (dates)
    let processedValue: any = value
    
    if (type === 'date') {
      processedValue = new Date(value)
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
            <label htmlFor="employerPhone" className="block text-sm font-medium text-gray-700">
              Téléphone
            </label>
            <input
              type="text"
              id="employerPhone"
              name="employerPhone"
              value={formData.employerPhone || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="employerEmail" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="employerEmail"
              name="employerEmail"
              value={formData.employerEmail || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
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
      
      {/* Informations de l'attestation */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informations de l'attestation</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="certificateType" className="block text-sm font-medium text-gray-700">
              Type d'attestation
            </label>
            <select
              id="certificateType"
              name="certificateType"
              value={formData.certificateType || 'Emploi'}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            >
              <option value="Emploi">Attestation d'emploi</option>
              <option value="Travail">Certificat de travail</option>
              <option value="FinContrat">Attestation de fin de contrat</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Date de début d'emploi
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
          
          {(formData.certificateType === 'Travail' || formData.certificateType === 'FinContrat') && (
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                Date de fin d'emploi
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                required={formData.certificateType === 'Travail' || formData.certificateType === 'FinContrat'}
              />
            </div>
          )}
          
          <div>
            <label htmlFor="issuedDate" className="block text-sm font-medium text-gray-700">
              Date d'émission
            </label>
            <input
              type="date"
              id="issuedDate"
              name="issuedDate"
              value={formData.issuedDate ? new Date(formData.issuedDate).toISOString().split('T')[0] : ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="issuedLocation" className="block text-sm font-medium text-gray-700">
              Lieu d'émission
            </label>
            <input
              type="text"
              id="issuedLocation"
              name="issuedLocation"
              value={formData.issuedLocation || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="additionalInformation" className="block text-sm font-medium text-gray-700">
            Informations supplémentaires
          </label>
          <textarea
            id="additionalInformation"
            name="additionalInformation"
            value={formData.additionalInformation || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Générer l'attestation
        </button>
      </div>
    </form>
  )
} 