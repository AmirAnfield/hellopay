'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { ContractService, ContractData } from '../../../services/contract/ContractService'

export default function ContractsPage() {
  const router = useRouter()
  const [contracts, setContracts] = useState<ContractData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  
  useEffect(() => {
    async function loadContracts() {
      setLoading(true)
      setError('')
      
      try {
        // Vérifier si l'utilisateur est connecté
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }
        
        // Récupérer les contrats
        const { data, error } = await ContractService.getContractsByUserId(session.user.id)
        
        if (error) {
          throw error
        }
        
        setContracts(data || [])
      } catch (err) {
        console.error('Erreur lors du chargement des contrats:', err)
        setError('Une erreur est survenue lors du chargement des contrats.')
      } finally {
        setLoading(false)
      }
    }
    
    loadContracts()
  }, [router])
  
  const handleDeleteContract = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contrat ?')) {
      return
    }
    
    setDeleteLoading(id)
    
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }
      
      // Supprimer le contrat
      const { success, error } = await ContractService.deleteContract(id, session.user.id)
      
      if (error) {
        throw error
      }
      
      if (success) {
        // Mettre à jour la liste des contrats
        setContracts(prevContracts => prevContracts.filter(contract => contract.id !== id))
      }
    } catch (err) {
      console.error('Erreur lors de la suppression du contrat:', err)
      alert('Une erreur est survenue lors de la suppression du contrat.')
    } finally {
      setDeleteLoading(null)
    }
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes contrats</h1>
        <button 
          onClick={() => router.push('/dashboard/contracts/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Nouveau contrat
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 mb-6 rounded-md">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : contracts.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Aucun contrat trouvé</h3>
          <p className="text-gray-500 mb-4">Vous n'avez pas encore créé de contrat.</p>
          <button 
            onClick={() => router.push('/dashboard/contracts/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Créer un contrat
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Employé</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Poste</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Type</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Date de début</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Salaire</th>
                <th className="py-3 px-4 text-center font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contracts.map(contract => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{contract.employeeName}</td>
                  <td className="py-3 px-4">{contract.position}</td>
                  <td className="py-3 px-4">{contract.contractType}</td>
                  <td className="py-3 px-4">{formatDate(contract.contractStartDate)}</td>
                  <td className="py-3 px-4">
                    {contract.baseSalary ? `${contract.baseSalary.toLocaleString('fr-FR')} €` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center space-x-2">
                      {contract.pdfUrl && (
                        <a
                          href={contract.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                        >
                          PDF
                        </a>
                      )}
                      <button
                        onClick={() => router.push(`/dashboard/contracts/edit/${contract.id}`)}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteContract(contract.id || '')}
                        disabled={deleteLoading === contract.id}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        {deleteLoading === contract.id ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 