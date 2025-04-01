'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { 
  ArrowLeft, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  CreditCard,
  BadgeCheck,
  Briefcase,
  Save, 
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { createEmployee } from '@/services/employee-service'

export default function CreateEmployee() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Données de l'employé
  const [employee, setEmployee] = useState({
    // Informations personnelles
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    dateOfBirth: '',
    socialSecurityNumber: '',
    
    // Informations professionnelles
    jobTitle: '',
    department: '',
    startDate: '',
    contractType: 'CDI',
    executiveStatus: false,
    
    // Informations salariales
    baseSalary: '',
    hoursPerMonth: '151.67',
    bonusAmount: '',
    benefitsDescription: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEmployee(prev => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setEmployee(prev => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Validation basique
      if (!employee.firstName || !employee.lastName || !employee.jobTitle) {
        toast.error('Veuillez remplir tous les champs obligatoires')
        setLoading(false)
        return
      }
      
      // Vérifier si l'utilisateur est connecté
      if (!auth.currentUser) {
        router.push('/auth/login')
        setLoading(false)
        return
      }
      
      // Préparer les données pour Firebase
      const employeeData = {
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        city: employee.city,
        postalCode: employee.postalCode,
        birthDate: employee.dateOfBirth ? new Date(employee.dateOfBirth) : undefined,
        socialSecurityNumber: employee.socialSecurityNumber,
        position: employee.jobTitle,
        department: employee.department,
        startDate: employee.startDate ? new Date(employee.startDate) : new Date(),
        contractType: employee.contractType,
        status: 'active'
      }
      
      // Pour l'instant, on utilise une companyId fixe pour le test
      // À remplacer par une sélection d'entreprise dans l'interface
      const companyId = "default-company-id"; // À remplacer par la vraie valeur
      
      const employeeId = await createEmployee(companyId, employeeData);
      
      // Afficher le message de succès
      setSuccess(true)
      toast.success('Employé ajouté avec succès !')
      
      // Rediriger après un court délai
      setTimeout(() => {
        router.push('/dashboard/employees')
      }, 2000)
      
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'employé:", error)
      toast.error("Une erreur est survenue lors de l'ajout de l'employé")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Employé ajouté avec succès !</h1>
          <p className="text-gray-600 mb-8 text-center">
            Les informations de l'employé ont été correctement enregistrées dans le système.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => router.push('/dashboard/employees')}>
              Voir tous les employés
            </Button>
            <Button variant="outline" onClick={() => {
              setSuccess(false)
              setEmployee({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                postalCode: '',
                dateOfBirth: '',
                socialSecurityNumber: '',
                
                jobTitle: '',
                department: '',
                startDate: '',
                contractType: 'CDI',
                executiveStatus: false,
                
                baseSalary: '',
                hoursPerMonth: '151.67',
                bonusAmount: '',
                benefitsDescription: ''
              })
            }}>
              Ajouter un autre employé
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-4"
          onClick={() => router.push('/dashboard/employees')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajouter un nouvel employé</h1>
          <p className="text-gray-500">Remplissez les informations pour créer un nouvel employé</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="personal" className="w-full">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations personnelles
              </TabsTrigger>
              <TabsTrigger value="professional" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Informations professionnelles
              </TabsTrigger>
              <TabsTrigger value="salary" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Rémunération
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <TabsContent value="personal" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">Prénom <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={employee.firstName}
                    onChange={handleChange}
                    placeholder="Prénom"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Nom <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={employee.lastName}
                    onChange={handleChange}
                    placeholder="Nom"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={employee.email}
                    onChange={handleChange}
                    placeholder="email@exemple.com"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={employee.phone}
                    onChange={handleChange}
                    placeholder="Téléphone"
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    name="address"
                    value={employee.address}
                    onChange={handleChange}
                    placeholder="Adresse"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    name="city"
                    value={employee.city}
                    onChange={handleChange}
                    placeholder="Ville"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={employee.postalCode}
                    onChange={handleChange}
                    placeholder="Code postal"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={employee.dateOfBirth}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="socialSecurityNumber">Numéro de sécurité sociale</Label>
                  <Input
                    id="socialSecurityNumber"
                    name="socialSecurityNumber"
                    value={employee.socialSecurityNumber}
                    onChange={handleChange}
                    placeholder="N° de sécurité sociale"
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="professional" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="jobTitle">Intitulé du poste <span className="text-red-500">*</span></Label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    value={employee.jobTitle}
                    onChange={handleChange}
                    placeholder="Ex: Développeur, Comptable..."
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="department">Service / Département</Label>
                  <Input
                    id="department"
                    name="department"
                    value={employee.department}
                    onChange={handleChange}
                    placeholder="Ex: IT, Finance, RH..."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="startDate">Date d'embauche</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={employee.startDate}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contractType">Type de contrat</Label>
                  <select
                    id="contractType"
                    name="contractType"
                    value={employee.contractType}
                    onChange={(e) => handleChange(e as any)}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Interim">Intérim</option>
                    <option value="Apprentissage">Apprentissage</option>
                    <option value="Stage">Stage</option>
                  </select>
                </div>
                
                <div className="md:col-span-2 flex items-center space-x-2">
                  <Switch
                    id="executiveStatus"
                    checked={employee.executiveStatus}
                    onCheckedChange={(checked) => handleSwitchChange('executiveStatus', checked)}
                  />
                  <Label htmlFor="executiveStatus">Statut cadre</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="salary" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="baseSalary">Salaire brut mensuel</Label>
                  <div className="mt-1 relative">
                    <Input
                      id="baseSalary"
                      name="baseSalary"
                      type="number"
                      step="0.01"
                      min="0"
                      value={employee.baseSalary}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="pr-8"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500">€</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="hoursPerMonth">Heures travaillées / mois</Label>
                  <div className="mt-1 relative">
                    <Input
                      id="hoursPerMonth"
                      name="hoursPerMonth"
                      type="number"
                      step="0.01"
                      min="0"
                      value={employee.hoursPerMonth}
                      onChange={handleChange}
                      placeholder="151.67"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500">h</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bonusAmount">Prime mensuelle</Label>
                  <div className="mt-1 relative">
                    <Input
                      id="bonusAmount"
                      name="bonusAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={employee.bonusAmount}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500">€</span>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="benefitsDescription">Avantages et notes</Label>
                  <Textarea
                    id="benefitsDescription"
                    name="benefitsDescription"
                    value={employee.benefitsDescription}
                    onChange={handleChange}
                    placeholder="Titres restaurant, mutuelle, remboursement transport, etc."
                    className="mt-1 h-24"
                  />
                </div>
              </div>
            </TabsContent>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => router.push('/dashboard/employees')}
            >
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer l'employé
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
} 