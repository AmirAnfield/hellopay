'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  ChevronDown, 
  Check, 
  FileText,
  Eye,
  Pencil,
  Trash2,
  XCircle,
  ArrowUpDown,
  CheckCircle2,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Payslip {
  id: string
  employeeName: string
  period: string
  created_at: string
  grossSalary: number
  netSalary: number
  status: 'draft' | 'pending' | 'completed'
}

export default function PayslipsPage() {
  const router = useRouter()
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [period, setPeriod] = useState<string>('all')
  const [sortField, setSortField] = useState<keyof Payslip>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  // Liste des périodes pour le filtre (généré dynamiquement à partir des données)
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])
  
  useEffect(() => {
    async function fetchPayslips() {
      setLoading(true)
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth/login')
          return
        }
        
        let query = supabase
          .from('payslips')
          .select('*')
          .eq('userId', session.user.id)
        
        const { data, error } = await query
        
        if (error) {
          throw error
        }
        
        if (data) {
          // Formater les données
          const formattedPayslips: Payslip[] = data.map((p: any) => ({
            id: p.id,
            employeeName: p.employeeName || 'Employé inconnu',
            period: p.period || 'Période inconnue',
            created_at: p.created_at,
            grossSalary: p.grossSalary || 0,
            netSalary: p.netSalary || 0,
            status: p.status || 'draft'
          }))
          
          setPayslips(formattedPayslips)
          
          // Extraire les périodes uniques pour le filtre
          const uniquePeriods = [...new Set(formattedPayslips.map(p => p.period))]
          setAvailablePeriods(uniquePeriods)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des fiches de paie:', error)
        toast.error('Erreur lors du chargement des fiches de paie')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPayslips()
  }, [router])
  
  // Filtrer et trier les fiches de paie
  const filteredPayslips = payslips
    .filter(p => {
      const matchesSearch = p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.period.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter
      const matchesPeriod = period === 'all' || p.period === period
      
      return matchesSearch && matchesStatus && matchesPeriod
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })
  
  const handleSort = (field: keyof Payslip) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Terminé
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FileText className="w-3 h-3 mr-1" />
            Brouillon
          </span>
        )
    }
  }
  
  const handleDeletePayslip = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette fiche de paie ?')) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('payslips')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      setPayslips(payslips.filter(p => p.id !== id))
      toast.success('Fiche de paie supprimée avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error('Erreur lors de la suppression de la fiche de paie')
    }
  }
  
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* En-tête de la page */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fiches de paie</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez et consultez toutes vos fiches de paie
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
              onClick={() => router.push('/dashboard/payslips/new')}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Nouvelle fiche de paie
            </button>
          </div>
        </div>
      </div>
      
      {/* Filtres et recherche */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom ou période..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Filtre de statut */}
            <div className="relative inline-block w-full sm:w-auto">
              <button 
                className="w-full sm:w-auto inline-flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={() => document.getElementById('status-dropdown')?.classList.toggle('hidden')}
              >
                <Filter className="mr-2 h-4 w-4 text-gray-500" />
                <span>Statut: {statusFilter === 'all' ? 'Tous' : 
                  statusFilter === 'completed' ? 'Terminé' : 
                  statusFilter === 'pending' ? 'En attente' : 'Brouillon'}</span>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
              </button>
              
              <div id="status-dropdown" className="hidden absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1">
                {['all', 'completed', 'pending', 'draft'].map(status => (
                  <button
                    key={status}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      setStatusFilter(status)
                      document.getElementById('status-dropdown')?.classList.add('hidden')
                    }}
                  >
                    {statusFilter === status && <Check className="mr-2 h-4 w-4 text-blue-500" />}
                    <span className={statusFilter === status ? 'ml-6' : 'ml-0'}>
                      {status === 'all' ? 'Tous' : 
                       status === 'completed' ? 'Terminé' : 
                       status === 'pending' ? 'En attente' : 'Brouillon'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Filtre de période */}
            <div className="relative inline-block w-full sm:w-auto">
              <button 
                className="w-full sm:w-auto inline-flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={() => document.getElementById('period-dropdown')?.classList.toggle('hidden')}
              >
                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                <span>Période: {period === 'all' ? 'Toutes' : period}</span>
                <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
              </button>
              
              <div id="period-dropdown" className="hidden absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1 max-h-60 overflow-y-auto">
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    setPeriod('all')
                    document.getElementById('period-dropdown')?.classList.add('hidden')
                  }}
                >
                  {period === 'all' && <Check className="mr-2 h-4 w-4 text-blue-500" />}
                  <span className={period === 'all' ? 'ml-6' : 'ml-0'}>Toutes les périodes</span>
                </button>
                
                {availablePeriods.map(p => (
                  <button
                    key={p}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      setPeriod(p)
                      document.getElementById('period-dropdown')?.classList.add('hidden')
                    }}
                  >
                    {period === p && <Check className="mr-2 h-4 w-4 text-blue-500" />}
                    <span className={period === p ? 'ml-6' : 'ml-0'}>{p}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tableau des fiches de paie */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredPayslips.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucune fiche de paie</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || period !== 'all' ? 
                'Aucune fiche de paie ne correspond à vos critères de recherche.' : 
                'Vous n\'avez pas encore créé de fiche de paie.'}
            </p>
            {!searchTerm && statusFilter === 'all' && period === 'all' && (
              <button 
                onClick={() => router.push('/dashboard/payslips/new')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Créer ma première fiche
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('employeeName')}
                  >
                    <div className="flex items-center">
                      Employé
                      {sortField === 'employeeName' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('period')}
                  >
                    <div className="flex items-center">
                      Période
                      {sortField === 'period' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('grossSalary')}
                  >
                    <div className="flex items-center">
                      Salaire brut
                      {sortField === 'grossSalary' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('netSalary')}
                  >
                    <div className="flex items-center">
                      Salaire net
                      {sortField === 'netSalary' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Statut
                      {sortField === 'status' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Date de création
                      {sortField === 'created_at' && (
                        <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayslips.map((payslip) => (
                  <tr key={payslip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payslip.employeeName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{payslip.period}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payslip.grossSalary.toLocaleString('fr-FR')} €</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payslip.netSalary.toLocaleString('fr-FR')} €</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {statusBadge(payslip.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payslip.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => router.push(`/dashboard/payslips/${payslip.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => router.push(`/dashboard/payslips/${payslip.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeletePayslip(payslip.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <Link 
                          href={`/dashboard/payslips/${payslip.id}/download`}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Download className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 