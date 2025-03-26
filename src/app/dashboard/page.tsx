'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  payslips: number;
  contracts: number;
  certificates: number;
  employees: number;
}

export default function Dashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')
  const [stats, setStats] = useState<DashboardStats>({
    payslips: 0,
    contracts: 0,
    certificates: 0,
    employees: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUserInfo() {
      setLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Récupérer les infos utilisateur
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', session.user.id)
          .single()
        
        if (userData?.name) {
          setUserName(userData.name)
        }
        
        // Récupérer les statistiques
        const { data: payslipsData } = await supabase
          .from('payslips')
          .select('id')
          .eq('userId', session.user.id)
        
        const { data: contractsData } = await supabase
          .from('contracts')
          .select('id')
          .eq('userId', session.user.id)
        
        const { data: certificatesData } = await supabase
          .from('certificates')
          .select('id')
          .eq('userId', session.user.id)
        
        // Récupérer les employés uniques (basé sur les fiches de paie)
        const { data: employeesData } = await supabase
          .from('payslips')
          .select('employeeName')
          .eq('userId', session.user.id)
          .limit(1000)
        
        const uniqueEmployees = employeesData ? 
          [...new Set(employeesData.map((p: { employeeName: string }) => p.employeeName))] : []
        
        setStats({
          payslips: payslipsData?.length || 0,
          contracts: contractsData?.length || 0,
          certificates: certificatesData?.length || 0,
          employees: uniqueEmployees.length || 0
        })
      }
      
      setLoading(false)
    }
    
    getUserInfo()
  }, [])
  
  // Fonctions pour naviguer vers les différentes pages
  const goToPayslips = () => router.push('/dashboard/payslips')
  const goToContracts = () => router.push('/dashboard/contracts')
  const goToCertificates = () => router.push('/dashboard/certificates')
  const goToEmployees = () => router.push('/dashboard/employees')
  
  // Format pour les cartes
  const dashboardCards = [
    {
      title: "Fiches de paie",
      description: "Générez et gérez les fiches de paie",
      count: stats.payslips,
      onClick: goToPayslips,
      color: "bg-blue-50 border-blue-200",
      textColor: "text-blue-800"
    },
    {
      title: "Contrats",
      description: "Créez des contrats de travail",
      count: stats.contracts,
      onClick: goToContracts,
      color: "bg-green-50 border-green-200",
      textColor: "text-green-800"
    },
    {
      title: "Certificats",
      description: "Générez des attestations et certificats",
      count: stats.certificates,
      onClick: goToCertificates,
      color: "bg-purple-50 border-purple-200",
      textColor: "text-purple-800"
    },
    {
      title: "Employés",
      description: "Gérez vos employés",
      count: stats.employees,
      onClick: goToEmployees,
      color: "bg-amber-50 border-amber-200",
      textColor: "text-amber-800"
    }
  ]

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          {!loading && userName && (
            <p className="text-gray-500">Bienvenue, {userName}</p>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardCards.map((card, index) => (
              <div 
                key={index}
                onClick={card.onClick}
                className={`${card.color} border rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow`}
              >
                <h2 className="text-2xl font-bold">{card.count}</h2>
                <h3 className={`text-lg font-semibold mt-2 ${card.textColor}`}>{card.title}</h3>
                <p className="text-gray-600 mt-1 text-sm">{card.description}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/dashboard/payslips/new')}
              className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left hover:bg-blue-100 transition-colors"
            >
              <h3 className="font-semibold text-blue-800">Créer une nouvelle fiche de paie</h3>
              <p className="mt-1 text-sm text-gray-600">Générez une fiche de paie pour un employé</p>
            </button>
            
            <button
              onClick={() => router.push('/dashboard/contracts/new')}
              className="p-4 bg-green-50 border border-green-200 rounded-lg text-left hover:bg-green-100 transition-colors"
            >
              <h3 className="font-semibold text-green-800">Créer un nouveau contrat</h3>
              <p className="mt-1 text-sm text-gray-600">Générez un contrat de travail</p>
            </button>
            
            <button
              onClick={() => router.push('/dashboard/certificates/new')}
              className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-left hover:bg-purple-100 transition-colors"
            >
              <h3 className="font-semibold text-purple-800">Créer un certificat</h3>
              <p className="mt-1 text-sm text-gray-600">Générez une attestation ou un certificat de travail</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 