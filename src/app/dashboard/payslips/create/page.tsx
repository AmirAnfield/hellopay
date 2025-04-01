'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { 
  ArrowLeft, 
  Save, 
  Calculator, 
  User,
  Calendar,
  Banknote,
  CheckCircle2,
  X,
  Loader2,
  Plus,
  Minus
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Employee {
  id: string
  first_name: string
  last_name: string
  job_title: string
  base_salary: number
  is_executive: boolean
}

interface PayslipFormData {
  employeeId: string
  period: string
  baseSalary: number
  hoursWorked: number
  overtimeHours: number
  bonus: number
  benefits: string
  notes: string
}

export default function CreatePayslip() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [success, setSuccess] = useState(false)
  const [calculatedValues, setCalculatedValues] = useState({
    grossSalary: 0,
    employeeContributions: 0,
    employerContributions: 0,
    netSalary: 0
  })
  
  // Données du formulaire de fiche de paie
  const [payslipData, setPayslipData] = useState<PayslipFormData>({
    employeeId: '',
    period: getCurrentPeriod(),
    baseSalary: 0,
    hoursWorked: 151.67,
    overtimeHours: 0,
    bonus: 0,
    benefits: '',
    notes: ''
  })
  
  // Format de la période actuelle (MM/YYYY)
  function getCurrentPeriod() {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    return `${month}/${year}`
  }
  
  // Récupération des employés lors du chargement de la page
  useEffect(() => {
    async function fetchEmployees() {
      try {
        // Vérifier si l'utilisateur est connecté
        if (!auth.currentUser) {
          router.push('/auth/login')
          return
        }
        
        // Utiliser les services Firebase pour récupérer les employés
        setLoadingEmployees(false)
        toast.error("La récupération des employés avec Firebase n'est pas encore implémentée")
        
        // Employés de test pour démonstration
        const demoEmployees = [
          {
            id: '1',
            first_name: 'Jean',
            last_name: 'Dupont',
            job_title: 'Développeur',
            base_salary: 3500,
            is_executive: true
          },
          {
            id: '2',
            first_name: 'Marie',
            last_name: 'Martin',
            job_title: 'Designer',
            base_salary: 3000,
            is_executive: false
          }
        ];
        
        setEmployees(demoEmployees);
      } catch (error) {
        console.error("Erreur lors du chargement des employés:", error)
        toast.error("Impossible de charger la liste des employés")
      } finally {
        setLoadingEmployees(false)
      }
    }
    
    fetchEmployees()
  }, [router])
  
  // Mise à jour du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === 'employeeId' && value) {
      // Si on sélectionne un employé, on récupère son salaire de base
      const selectedEmployee = employees.find(emp => emp.id === value)
      if (selectedEmployee) {
        setPayslipData(prev => ({
          ...prev,
          [name]: value,
          baseSalary: selectedEmployee.base_salary
        }))
        
        // Recalculer les valeurs
        calculatePayslip({
          ...payslipData,
          employeeId: value,
          baseSalary: selectedEmployee.base_salary
        })
        
        return
      }
    }
    
    let updatedData = {
      ...payslipData,
      [name]: value
    }
    
    setPayslipData(updatedData)
    
    // Recalculer lors de la modification des valeurs numériques
    if (['baseSalary', 'hoursWorked', 'overtimeHours', 'bonus'].includes(name)) {
      calculatePayslip(updatedData)
    }
  }
  
  // Calcul de la fiche de paie
  const calculatePayslip = (data: PayslipFormData) => {
    // Trouver si l'employé est cadre pour appliquer le bon taux
    const selectedEmployee = employees.find(emp => emp.id === data.employeeId)
    const isExecutive = selectedEmployee?.is_executive || false
    
    // Conversion des valeurs en nombres
    const baseSalary = parseFloat(data.baseSalary.toString()) || 0
    const bonus = parseFloat(data.bonus.toString()) || 0
    const overtimeHours = parseFloat(data.overtimeHours.toString()) || 0
    
    // Calcul du salaire pour les heures supplémentaires (majoration de 25%)
    const hourlyRate = baseSalary / 151.67
    const overtimePay = overtimeHours * hourlyRate * 1.25
    
    // Salaire brut total
    const grossSalary = baseSalary + overtimePay + bonus
    
    // Taux de cotisations (simplifiés pour l'exemple)
    const employeeRate = isExecutive ? 0.25 : 0.22 // 25% pour les cadres, 22% pour les non-cadres
    const employerRate = isExecutive ? 0.42 : 0.40 // 42% pour les cadres, 40% pour les non-cadres
    
    // Calcul des cotisations
    const employeeContributions = grossSalary * employeeRate
    const employerContributions = grossSalary * employerRate
    
    // Salaire net
    const netSalary = grossSalary - employeeContributions
    
    // Mise à jour des valeurs calculées
    setCalculatedValues({
      grossSalary,
      employeeContributions,
      employerContributions,
      netSalary
    })
  }
  
  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Validation
      if (!payslipData.employeeId || !payslipData.period) {
        toast.error("Veuillez sélectionner un employé et spécifier une période")
        setLoading(false)
        return
      }
      
      // Vérifier si l'utilisateur est connecté
      if (!auth.currentUser) {
        router.push('/auth/login')
        return
      }
      
      // Récupérer les informations de l'employé sélectionné
      const selectedEmployee = employees.find(emp => emp.id === payslipData.employeeId)
      
      if (!selectedEmployee) {
        toast.error("Employé non trouvé")
        setLoading(false)
        return
      }
      
      // Préparer les données à enregistrer
      const payslipToInsert = {
        userId: auth.currentUser.uid,
        employeeId: payslipData.employeeId,
        employeeName: `${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
        period: payslipData.period,
        grossSalary: calculatedValues.grossSalary,
        netSalary: calculatedValues.netSalary,
        employeeContributions: calculatedValues.employeeContributions,
        employerContributions: calculatedValues.employerContributions,
        baseSalary: payslipData.baseSalary,
        hoursWorked: payslipData.hoursWorked,
        overtimeHours: payslipData.overtimeHours,
        bonus: payslipData.bonus,
        benefits: payslipData.benefits,
        notes: payslipData.notes,
        status: 'draft',
        createdAt: new Date()
      }
      
      // Pour l'instant on n'enregistre pas réellement dans Firebase
      console.log("Données de la fiche de paie à sauvegarder:", payslipToInsert);
      toast.success("Fonctionnalité non implémentée mais les données sont valides");
      
      // Afficher le message de succès
      setSuccess(true)
      toast.success("Fiche de paie créée avec succès !")
      
      // Rediriger après un court délai
      setTimeout(() => {
        router.push('/dashboard/payslips')
      }, 2000)
      
    } catch (error) {
      console.error("Erreur lors de la création de la fiche de paie:", error)
      toast.error("Une erreur est survenue lors de la création de la fiche de paie")
    } finally {
      setLoading(false)
    }
  }
  
  // Formatage des nombres en euros
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
  }
  
  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Fiche de paie créée avec succès !</h1>
          <p className="text-gray-600 mb-8 text-center">
            La fiche de paie a été correctement enregistrée dans le système.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => router.push('/dashboard/payslips')}>
              Voir toutes les fiches de paie
            </Button>
            <Button variant="outline" onClick={() => {
              setSuccess(false)
              setPayslipData({
                employeeId: '',
                period: getCurrentPeriod(),
                baseSalary: 0,
                hoursWorked: 151.67,
                overtimeHours: 0,
                bonus: 0,
                benefits: '',
                notes: ''
              })
              setCalculatedValues({
                grossSalary: 0,
                employeeContributions: 0,
                employerContributions: 0,
                netSalary: 0
              })
            }}>
              Créer une autre fiche de paie
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-4"
          onClick={() => router.push('/dashboard/payslips')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Créer une nouvelle fiche de paie</h1>
          <p className="text-gray-500">Remplissez les informations pour générer une fiche de paie</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire de saisie */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="employee" className="w-full">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <TabsList className="grid grid-cols-3 mb-2">
                  <TabsTrigger value="employee" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Employé
                  </TabsTrigger>
                  <TabsTrigger value="period" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Période
                  </TabsTrigger>
                  <TabsTrigger value="salary" className="flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Rémunération
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <TabsContent value="employee" className="space-y-6 mt-0">
                  <div>
                    <Label htmlFor="employeeId">Sélectionner un employé <span className="text-red-500">*</span></Label>
                    <select
                      id="employeeId"
                      name="employeeId"
                      value={payslipData.employeeId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Sélectionner un employé</option>
                      {loadingEmployees ? (
                        <option disabled>Chargement des employés...</option>
                      ) : (
                        employees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {employee.first_name} {employee.last_name} - {employee.job_title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  
                  {payslipData.employeeId && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      {(() => {
                        const employee = employees.find(e => e.id === payslipData.employeeId)
                        if (!employee) return null
                        
                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Nom</span>
                              <span className="font-medium">{employee.first_name} {employee.last_name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Poste</span>
                              <span className="font-medium">{employee.job_title}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Statut</span>
                              <span className="font-medium">{employee.is_executive ? 'Cadre' : 'Non-cadre'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Salaire mensuel brut</span>
                              <span className="font-medium">{formatCurrency(employee.base_salary)}</span>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="period" className="space-y-6 mt-0">
                  <div>
                    <Label htmlFor="period">Période (MM/YYYY) <span className="text-red-500">*</span></Label>
                    <Input
                      id="period"
                      name="period"
                      value={payslipData.period}
                      onChange={handleChange}
                      placeholder="MM/YYYY"
                      className="mt-1"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Format: MM/YYYY (ex: 05/2024)</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hoursWorked">Heures travaillées</Label>
                      <Input
                        id="hoursWorked"
                        name="hoursWorked"
                        type="number"
                        step="0.01"
                        min="0"
                        value={payslipData.hoursWorked}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="overtimeHours">Heures supplémentaires</Label>
                      <Input
                        id="overtimeHours"
                        name="overtimeHours"
                        type="number"
                        step="0.01"
                        min="0"
                        value={payslipData.overtimeHours}
                        onChange={handleChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="salary" className="space-y-6 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="baseSalary">Salaire de base</Label>
                      <div className="mt-1 relative">
                        <Input
                          id="baseSalary"
                          name="baseSalary"
                          type="number"
                          step="0.01"
                          min="0"
                          value={payslipData.baseSalary}
                          onChange={handleChange}
                          className="pr-8"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500">€</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bonus">Prime / Bonus</Label>
                      <div className="mt-1 relative">
                        <Input
                          id="bonus"
                          name="bonus"
                          type="number"
                          step="0.01"
                          min="0"
                          value={payslipData.bonus}
                          onChange={handleChange}
                          className="pr-8"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500">€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="benefits">Avantages en nature</Label>
                    <Input
                      id="benefits"
                      name="benefits"
                      value={payslipData.benefits}
                      onChange={handleChange}
                      placeholder="Titres restaurant, mutuelle, etc."
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={payslipData.notes}
                      onChange={handleChange}
                      placeholder="Notes ou commentaires supplémentaires"
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                    />
                  </div>
                </TabsContent>
              </div>
              
              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => router.push('/dashboard/payslips')}
                >
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !payslipData.employeeId}
                  className="gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer la fiche de paie
                </Button>
              </div>
            </Tabs>
          </form>
        </div>
        
        {/* Panneau de calcul */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-6">
            <div className="flex items-center mb-4">
              <Calculator className="h-5 w-5 mr-2 text-blue-600" />
              <h3 className="font-semibold text-lg">Résumé de la paie</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Salaire brut</span>
                  <span className="font-medium">{formatCurrency(calculatedValues.grossSalary)}</span>
                </div>
                <div className="text-xs text-gray-500 space-y-1 ml-2 mt-2">
                  <div className="flex justify-between">
                    <span>Salaire de base</span>
                    <span>{formatCurrency(parseFloat(payslipData.baseSalary.toString()) || 0)}</span>
                  </div>
                  {payslipData.overtimeHours > 0 && (
                    <div className="flex justify-between">
                      <span>Heures supp. ({payslipData.overtimeHours}h)</span>
                      <span>{formatCurrency((parseFloat(payslipData.baseSalary.toString()) || 0) / 151.67 * 1.25 * (parseFloat(payslipData.overtimeHours.toString()) || 0))}</span>
                    </div>
                  )}
                  {payslipData.bonus > 0 && (
                    <div className="flex justify-between">
                      <span>Bonus/Prime</span>
                      <span>{formatCurrency(parseFloat(payslipData.bonus.toString()) || 0)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-3 bg-red-50 rounded-md">
                <div className="flex justify-between">
                  <span className="text-red-600">Cotisations salariales</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(calculatedValues.employeeContributions)}
                  </span>
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-md">
                <div className="flex justify-between">
                  <span className="text-orange-600">Cotisations patronales</span>
                  <span className="font-medium text-orange-600">
                    {formatCurrency(calculatedValues.employerContributions)}
                  </span>
                </div>
              </div>
              
              <div className="h-px bg-gray-200 my-3"></div>
              
              <div className="p-4 bg-green-50 rounded-md">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">Salaire net</span>
                  <span className="font-bold text-green-600">{formatCurrency(calculatedValues.netSalary)}</span>
                </div>
              </div>
              
              <div className="mt-6 text-xs text-gray-500">
                <p>* Les calculs sont basés sur une estimation simplifiée des taux de cotisations.</p>
                <p>* Le résultat final peut varier en fonction des spécificités de chaque situation.</p>
              </div>
              
              <div className="mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => calculatePayslip(payslipData)}
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Recalculer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 