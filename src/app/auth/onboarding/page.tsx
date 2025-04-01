'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { createCompany } from '@/services/company-service'
import { 
  ArrowRight, 
  Building2, 
  Users, 
  FileText, 
  CheckCircle2,
  ChevronRight,
  X,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Données de l'entreprise
  const [company, setCompany] = useState({
    name: '',
    siret: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France'
  })
  
  // Informations personnelles
  const [profile, setProfile] = useState({
    name: '',
    role: '',
    email: '',
    phone: ''
  })

  // Gestion des étapes
  const totalSteps = 3
  const stepTitles = [
    'Informations de votre entreprise',
    'Votre profil',
    'Configuration terminée'
  ]

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCompany(prev => ({ ...prev, [name]: value }))
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
  }

  const nextStep = () => {
    if (step === 1 && (!company.name || !company.siret)) {
      toast.error('Veuillez remplir les champs obligatoires')
      return
    }
    
    if (step === 2 && (!profile.name || !profile.email)) {
      toast.error('Veuillez remplir les champs obligatoires')
      return
    }
    
    setStep(prev => prev + 1)
  }

  const prevStep = () => {
    setStep(prev => prev - 1)
  }

  const completeOnboarding = async () => {
    setLoading(true)
    
    try {
      // Vérifier si l'utilisateur est connecté
      if (!auth.currentUser) {
        router.push('/auth/login')
        return
      }
      
      // Enregistrer les données de l'entreprise
      const companyData = {
        name: company.name,
        siret: company.siret,
        address: company.address,
        city: company.city,
        postalCode: company.postalCode,
        country: company.country
      };
      
      // Utiliser le service createCompany
      const companyId = await createCompany(companyData);
      
      // Rediriger vers le dashboard
      router.push('/dashboard')
      toast.success('Configuration terminée avec succès !')
    } catch (error) {
      console.error('Erreur lors de la configuration:', error)
      toast.error('Une erreur est survenue lors de la configuration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* En-tête */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="font-bold text-xl text-blue-600">HelloPay</div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/auth/login')}>
            <X className="mr-2 h-4 w-4" />
            Quitter
          </Button>
        </div>
      </header>
      
      {/* Indicateur de progression */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center">
              <div 
                className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
                  i + 1 < step 
                    ? 'bg-blue-600 text-white' 
                    : i + 1 === step 
                      ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' 
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i + 1 < step ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div 
                  className={`h-1 w-16 md:w-32 ${
                    i + 1 < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{stepTitles[step - 1]}</h1>
        <p className="text-gray-500 mb-8">
          {step < totalSteps 
            ? `Étape ${step} sur ${totalSteps}` 
            : "Vous êtes prêt à utiliser HelloPay"}
        </p>
      </div>
      
      {/* Contenu des étapes */}
      <div className="container mx-auto px-4 py-6 flex-grow">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          {/* Étape 1: Informations de l'entreprise */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mx-auto mb-6">
                <Building2 className="h-6 w-6" />
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="name">Nom de l'entreprise <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={company.name}
                    onChange={handleCompanyChange}
                    placeholder="Entrez le nom de votre entreprise"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="siret">Numéro SIRET <span className="text-red-500">*</span></Label>
                  <Input
                    id="siret"
                    name="siret"
                    value={company.siret}
                    onChange={handleCompanyChange}
                    placeholder="Entrez le numéro SIRET"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    name="address"
                    value={company.address}
                    onChange={handleCompanyChange}
                    placeholder="Adresse"
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      name="city"
                      value={company.city}
                      onChange={handleCompanyChange}
                      placeholder="Ville"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={company.postalCode}
                      onChange={handleCompanyChange}
                      placeholder="Code postal"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    name="country"
                    value={company.country}
                    onChange={handleCompanyChange}
                    placeholder="Pays"
                    className="mt-1"
                    disabled
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Étape 2: Profil utilisateur */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mx-auto mb-6">
                <Users className="h-6 w-6" />
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <Label htmlFor="name">Nom complet <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="Votre nom complet"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Fonction</Label>
                  <Input
                    id="role"
                    name="role"
                    value={profile.role}
                    onChange={handleProfileChange}
                    placeholder="Ex: Directeur, Comptable, RH..."
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="votre@email.com"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="Votre numéro de téléphone"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Étape 3: Confirmation */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900">Votre compte est prêt !</h2>
              <p className="text-gray-600">
                Toutes les informations ont été correctement configurées. Vous pouvez maintenant
                commencer à utiliser HelloPay pour gérer vos fiches de paie.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Entreprise</span>
                  <span className="font-medium">{company.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Utilisateur</span>
                  <span className="font-medium">{profile.name}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="text-gray-500 text-sm mb-2">Prochaines étapes :</div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-3 flex-shrink-0">
                      <span>1</span>
                    </div>
                    <span>Ajouter vos premiers employés</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-3 flex-shrink-0">
                      <span>2</span>
                    </div>
                    <span>Créer vos premières fiches de paie</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-3 flex-shrink-0">
                      <span>3</span>
                    </div>
                    <span>Explorer toutes les fonctionnalités</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation des étapes */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              Retour
            </Button>
          ) : (
            <div></div> // Espace vide pour l'alignement
          )}
          
          {step < totalSteps ? (
            <Button onClick={nextStep}>
              Continuer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={completeOnboarding} 
              disabled={loading}
              className="gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Accéder à mon compte
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 