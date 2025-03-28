'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  PlusCircle, 
  Search, 
  Filter, 
  User,
  Users,
  CheckCircle2,
  Clock,
  FileText,
  Eye,
  Pencil,
  Trash2,
  Download,
  ChevronDown,
  Check,
  ArrowUpDown,
  Building,
  ArrowRight,
  X,
  Phone
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Employee {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  job_title: string
  department: string
  created_at: string
  start_date: string | null
  base_salary: number
  is_executive: boolean
  contract_type: string
}

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [contractFilter, setContractFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<keyof Employee>('last_name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Liste des départements pour le filtre (générée dynamiquement à partir des données)
  const [departments, setDepartments] = useState<string[]>([])
  // Liste des types de contrats
  const [contractTypes, setContractTypes] = useState<string[]>([])
  
  useEffect(() => {
    async function fetchEmployees() {
      setLoading(true)
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth/login')
          return
        }
        
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('user_id', session.user.id)
        
        if (error) throw error
        
        if (data) {
          setEmployees(data as Employee[])
          
          // Extraire les départements uniques
          const uniqueDepartments = [...new Set(data.map(e => e.department).filter(Boolean))]
          setDepartments(uniqueDepartments)
          
          // Extraire les types de contrats uniques
          const uniqueContractTypes = [...new Set(data.map(e => e.contract_type).filter(Boolean))]
          setContractTypes(uniqueContractTypes)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des employés:', error)
        toast.error('Erreur lors du chargement des employés')
      } finally {
        setLoading(false)
      }
    }
    
    fetchEmployees()
  }, [router])
  
  // Filtrer et trier les employés
  const filteredEmployees = employees
    .filter(employee => {
      const matchesSearch = 
        `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.job_title && employee.job_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (employee.email && employee.email.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter
      const matchesContract = contractFilter === 'all' || employee.contract_type === contractFilter
      
      return matchesSearch && matchesDepartment && matchesContract
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (aValue === null && bValue === null) return 0
      if (aValue === null) return sortDirection === 'asc' ? 1 : -1
      if (bValue === null) return sortDirection === 'asc' ? -1 : 1
      
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
  
  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'employé ${name} ?`)) {
      return
    }
    
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setEmployees(employees.filter(e => e.id !== id))
      toast.success('Employé supprimé avec succès')
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error("Erreur lors de la suppression de l'employé")
    }
  }
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR')
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
  }
  
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* En-tête de la page */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employés</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez vos employés et consultez leurs informations
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button 
              onClick={() => router.push('/dashboard/employees/create')}
              className="inline-flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Nouvel employé
            </Button>
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
            <Input
              type="text"
              placeholder="Rechercher un employé..."
              className="pl-10 pr-4 py-2 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Filtre de département */}
            {departments.length > 0 && (
              <div className="relative inline-block w-full sm:w-auto">
                <button 
                  className="w-full sm:w-auto inline-flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onClick={() => document.getElementById('department-dropdown')?.classList.toggle('hidden')}
                >
                  <Building className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Département: {departmentFilter === 'all' ? 'Tous' : departmentFilter}</span>
                  <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                </button>
                
                <div id="department-dropdown" className="hidden absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      setDepartmentFilter('all')
                      document.getElementById('department-dropdown')?.classList.add('hidden')
                    }}
                  >
                    {departmentFilter === 'all' && <Check className="mr-2 h-4 w-4 text-blue-500" />}
                    <span className={departmentFilter === 'all' ? 'ml-6' : 'ml-0'}>
                      Tous les départements
                    </span>
                  </button>
                  
                  {departments.map(dept => (
                    <button
                      key={dept}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                      onClick={() => {
                        setDepartmentFilter(dept)
                        document.getElementById('department-dropdown')?.classList.add('hidden')
                      }}
                    >
                      {departmentFilter === dept && <Check className="mr-2 h-4 w-4 text-blue-500" />}
                      <span className={departmentFilter === dept ? 'ml-6' : 'ml-0'}>
                        {dept}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Filtre de type de contrat */}
            {contractTypes.length > 0 && (
              <div className="relative inline-block w-full sm:w-auto">
                <button 
                  className="w-full sm:w-auto inline-flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onClick={() => document.getElementById('contract-dropdown')?.classList.toggle('hidden')}
                >
                  <FileText className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Contrat: {contractFilter === 'all' ? 'Tous' : contractFilter}</span>
                  <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                </button>
                
                <div id="contract-dropdown" className="hidden absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      setContractFilter('all')
                      document.getElementById('contract-dropdown')?.classList.add('hidden')
                    }}
                  >
                    {contractFilter === 'all' && <Check className="mr-2 h-4 w-4 text-blue-500" />}
                    <span className={contractFilter === 'all' ? 'ml-6' : 'ml-0'}>
                      Tous les contrats
                    </span>
                  </button>
                  
                  {contractTypes.map(type => (
                    <button
                      key={type}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                      onClick={() => {
                        setContractFilter(type)
                        document.getElementById('contract-dropdown')?.classList.add('hidden')
                      }}
                    >
                      {contractFilter === type && <Check className="mr-2 h-4 w-4 text-blue-500" />}
                      <span className={contractFilter === type ? 'ml-6' : 'ml-0'}>
                        {type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Liste des employés */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucun employé trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || departmentFilter !== 'all' || contractFilter !== 'all' ? 
                'Aucun employé ne correspond à vos critères de recherche.' : 
                "Vous n'avez pas encore ajouté d'employé."}
            </p>
            {!searchTerm && departmentFilter === 'all' && contractFilter === 'all' && (
              <Button 
                onClick={() => router.push('/dashboard/employees/create')}
                className="mt-4 inline-flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Ajouter mon premier employé
              </Button>
            )}
          </div>
        ) : (
          <div>
            {/* Vue en cartes pour mobile */}
            <div className="md:hidden">
              {filteredEmployees.map(employee => (
                <div key={employee.id} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium flex-shrink-0">
                      {employee.first_name[0]}{employee.last_name[0]}
                    </div>
                    <div className="ml-3 flex-grow">
                      <h3 className="font-medium text-gray-900">{employee.first_name} {employee.last_name}</h3>
                      {employee.job_title && (
                        <p className="text-sm text-gray-500">{employee.job_title}</p>
                      )}
                      {employee.department && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {employee.department}
                          </span>
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Détails
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => router.push(`/dashboard/employees/${employee.id}/edit`)}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteEmployee(employee.id, `${employee.first_name} ${employee.last_name}`)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Vue en tableau pour desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('last_name')}
                    >
                      <div className="flex items-center">
                        Employé
                        {sortField === 'last_name' && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('job_title')}
                    >
                      <div className="flex items-center">
                        Poste
                        {sortField === 'job_title' && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('department')}
                    >
                      <div className="flex items-center">
                        Département
                        {sortField === 'department' && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('contract_type')}
                    >
                      <div className="flex items-center">
                        Contrat
                        {sortField === 'contract_type' && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('start_date')}
                    >
                      <div className="flex items-center">
                        Date d'embauche
                        {sortField === 'start_date' && (
                          <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('base_salary')}
                    >
                      <div className="flex items-center">
                        Salaire
                        {sortField === 'base_salary' && (
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
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            {employee.first_name[0]}{employee.last_name[0]}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.first_name} {employee.last_name}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.job_title || '—'}</div>
                        <div className="text-xs text-gray-500">{employee.is_executive ? 'Cadre' : 'Non-cadre'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.department || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {employee.contract_type || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(employee.start_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(employee.base_salary)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-gray-600 hover:text-gray-900"
                            onClick={() => router.push(`/dashboard/employees/${employee.id}/edit`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteEmployee(employee.id, `${employee.first_name} ${employee.last_name}`)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 