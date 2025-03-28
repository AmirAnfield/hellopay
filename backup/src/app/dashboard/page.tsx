'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  FileText, 
  Users, 
  BarChart, 
  Clock, 
  Calendar, 
  Banknote,
  ArrowRight, 
  ArrowUp, 
  ArrowDown,
  Plus,
  Settings,
  Building,
  CheckCircle,
  LayoutDashboard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface DashboardStats {
  totalEmployees: number
  totalPayslips: number
  recentPayslips: any[]
  employeeStats: {
    name: string
    role: string
    salary: number
  }[]
  monthlyTotals: {
    month: string
    gross: number
    net: number
    previous?: number
    change?: number
  }[]
}

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalPayslips: 0,
    recentPayslips: [],
    employeeStats: [],
    monthlyTotals: []
  })
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/auth/login')
          return
        }
        
        // Récupérer les informations de l'utilisateur
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', session.user.id)
          .single()
        
        if (userData?.name) {
          setUserName(userData.name)
        }
        
        // Récupérer le nombre total d'employés
        const { count: employeeCount } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
        
        // Récupérer le nombre total de fiches de paie
        const { count: payslipCount } = await supabase
          .from('payslips')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
        
        // Récupérer les fiches de paie récentes
        const { data: recentPayslips } = await supabase
          .from('payslips')
          .select('id, employeeName, period, netSalary, status, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        
        // Récupérer les employés les mieux payés
        const { data: topEmployees } = await supabase
          .from('employees')
          .select('first_name, last_name, job_title, base_salary')
          .eq('user_id', session.user.id)
          .order('base_salary', { ascending: false })
          .limit(3)
        
        // Créer les données formatées des employés
        const formattedEmployees = topEmployees 
          ? topEmployees.map(emp => ({
              name: `${emp.first_name} ${emp.last_name}`,
              role: emp.job_title || 'Non spécifié',
              salary: emp.base_salary
            }))
          : []
        
        // Générer des données mensuelles de salaire (normalement viendrait de la base de données)
        const currentDate = new Date()
        const months = []
        for (let i = 5; i >= 0; i--) {
          const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
          const monthName = month.toLocaleDateString('fr-FR', { month: 'short' })
          
          // Simuler des valeurs de salaire (dans un cas réel, elles viendraient de la BDD)
          const gross = 35000 + Math.floor(Math.random() * 5000)
          const net = gross * 0.75
          
          months.push({
            month: `${monthName} ${month.getFullYear()}`,
            gross,
            net,
            // Calculer le changement par rapport au mois précédent (à partir du deuxième mois)
            previous: i < 5 ? months[months.length - 1].net : undefined,
            change: i < 5 ? ((net - months[months.length - 1].net) / months[months.length - 1].net) * 100 : undefined
          })
        }
        
        setStats({
          totalEmployees: employeeCount || 0,
          totalPayslips: payslipCount || 0,
          recentPayslips: recentPayslips || [],
          employeeStats: formattedEmployees,
          monthlyTotals: months
        })
        
      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [router])
  
  // Formater une date en format français
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }
  
  // Formater un montant en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount)
  }
  
  // Style du badge selon le statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Terminé
          </span>
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full flex items-center">
            <FileText className="w-3 h-3 mr-1" />
            Brouillon
          </span>
    }
  }
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête personnalisée */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Bonjour, {userName || 'Utilisateur'}</h1>
            <p className="text-gray-600 mt-1">Voici un aperçu de votre activité HelloPay</p>
          </div>
          <div className="flex mt-4 md:mt-0 space-x-3">
            <Button 
              variant="outline" 
              className="h-9"
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings className="mr-1.5 h-4 w-4" />
              Paramètres
            </Button>
            <Button 
              className="h-9"
              onClick={() => router.push('/dashboard/payslips/create')}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Nouvelle fiche
            </Button>
          </div>
        </div>
      </div>
      
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Employés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="link" 
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
              onClick={() => router.push('/dashboard/employees')}
            >
              Gérer les employés
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Fiches de paie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">{stats.totalPayslips}</div>
              <div className="p-2 bg-green-50 text-green-600 rounded-full">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="link" 
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
              onClick={() => router.push('/dashboard/payslips')}
            >
              Voir toutes les fiches
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Paie mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">
                {stats.monthlyTotals.length > 0 ? formatCurrency(stats.monthlyTotals[stats.monthlyTotals.length - 1].gross) : '0 €'}
              </div>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-full">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="link" 
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
              onClick={() => router.push('/dashboard/payroll-calculator')}
            >
              Calculer un salaire
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Entreprise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">1</div>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-full">
                <Building className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button 
              variant="link" 
              className="p-0 h-auto text-blue-600 hover:text-blue-800"
              onClick={() => router.push('/dashboard/company')}
            >
              Gérer l'entreprise
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Activité récente et statistiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne 1: Activité récente */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Fiches de paie récentes</CardTitle>
              <CardDescription>Les 5 dernières fiches de paie générées</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentPayslips.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-md bg-gray-50">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">Aucune fiche de paie pour le moment</p>
                  <Button variant="link" className="mt-2" onClick={() => router.push('/dashboard/payslips/create')}>
                    Créer votre première fiche
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b border-gray-200">
                        <th className="pb-2 font-medium text-left">Employé</th>
                        <th className="pb-2 font-medium text-left">Période</th>
                        <th className="pb-2 font-medium text-left">Montant</th>
                        <th className="pb-2 font-medium text-left">Statut</th>
                        <th className="pb-2 font-medium text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentPayslips.map((payslip) => (
                        <tr key={payslip.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 text-sm">{payslip.employeeName}</td>
                          <td className="py-3 text-sm">{payslip.period}</td>
                          <td className="py-3 text-sm">{formatCurrency(payslip.netSalary)}</td>
                          <td className="py-3 text-sm">{getStatusBadge(payslip.status)}</td>
                          <td className="py-3 text-sm">{formatDate(payslip.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            {stats.recentPayslips.length > 0 && (
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/dashboard/payslips')}
                >
                  Voir toutes les fiches de paie
                </Button>
              </CardFooter>
            )}
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Evolution des salaires</CardTitle>
              <CardDescription>Total des salaires sur les 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px] relative">
                {/* Graphique simplifié avec des barres */}
                <div className="flex items-end justify-between h-[180px] gap-2">
                  {stats.monthlyTotals.map((month, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ 
                          height: `${(month.gross / 40000) * 100}%`,
                          maxHeight: '100%'
                        }}
                      ></div>
                      <div className="mt-2 text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                        {month.month}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Colonne 2: Statistiques et quick actions */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Raccourcis vers les fonctionnalités principales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/payslips/create')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Créer une fiche de paie
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/employees/create')}
              >
                <Users className="mr-2 h-4 w-4" />
                Ajouter un employé
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/payroll-calculator')}
              >
                <BarChart className="mr-2 h-4 w-4" />
                Calculateur de salaire
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/calendar')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Calendrier de paie
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Top employés</CardTitle>
              <CardDescription>Employés avec le salaire le plus élevé</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.employeeStats.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-md bg-gray-50">
                  <Users className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Aucun employé pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.employeeStats.map((employee, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium mr-3">
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-xs text-gray-500">{employee.role}</div>
                        </div>
                      </div>
                      <div className="font-medium">{formatCurrency(employee.salary)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-800">Guide de démarrage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-3">
                    1
                  </div>
                  <div className="text-sm text-blue-800">
                    Ajoutez vos employés dans la section Employés
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-3">
                    2
                  </div>
                  <div className="text-sm text-blue-800">
                    Créez des fiches de paie pour chaque période
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-3">
                    3
                  </div>
                  <div className="text-sm text-blue-800">
                    Téléchargez et partagez les bulletins en PDF
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 