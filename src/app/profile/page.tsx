'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { User, Building, Bell, Shield, CreditCard, Save, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personnel');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Données fictives du profil
  const [profileData, setProfileData] = useState({
    // Informations personnelles
    firstName: 'Thomas',
    lastName: 'Dubois',
    email: 'thomas.dubois@exemple.fr',
    phoneNumber: '06 12 34 56 78',
    
    // Informations entreprise
    companyName: 'Dubois Consulting',
    siret: '12345678901234',
    companyAddress: '42 Rue des Entrepreneurs',
    companyCity: 'Paris',
    companyPostcode: '75001',
    
    // Notifications
    emailNotifications: true,
    newPayslipNotifications: true,
    marketingNotifications: false,
    
    // Sécurité et confidentialité
    twoFactorAuth: false,
    dataRetention: 'one_year',
    anonymousStats: true,
    
    // Facturation
    billingAddress: '42 Rue des Entrepreneurs, 75001 Paris',
    billingEmail: 'facturation@dubois-consulting.fr',
    vatNumber: 'FR12345678901',
    
    // Notes et préférences
    notes: 'Préfère les communications par email.'
  });
  
  // Gestionnaire de modification des champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gestionnaire de modification des switchs
  const handleSwitchChange = (name: string, checked: boolean) => {
    setProfileData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Simulation de sauvegarde
  const handleSave = () => {
    setSaving(true);
    setSuccess(false);
    
    // Simulation d'une requête API
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1500);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="flex w-full p-0 bg-gray-50 border-b border-gray-200">
            <TabsTrigger 
              value="personnel" 
              className="flex items-center gap-2 flex-1 rounded-none border-r border-gray-200 py-3 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              <User className="h-4 w-4" />
              Personnel
            </TabsTrigger>
            <TabsTrigger 
              value="entreprise" 
              className="flex items-center gap-2 flex-1 rounded-none border-r border-gray-200 py-3 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              <Building className="h-4 w-4" />
              Entreprise
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-2 flex-1 rounded-none border-r border-gray-200 py-3 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="securite" 
              className="flex items-center gap-2 flex-1 rounded-none border-r border-gray-200 py-3 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger 
              value="facturation" 
              className="flex items-center gap-2 flex-1 rounded-none py-3 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              <CreditCard className="h-4 w-4" />
              Facturation
            </TabsTrigger>
          </TabsList>
          
          <div className="p-6">
            {success && (
              <div className="bg-green-50 text-green-700 p-4 rounded-md flex items-center mb-6">
                <CheckCircle className="h-5 w-5 mr-2" />
                Modifications enregistrées avec succès
              </div>
            )}
            
            <TabsContent value="personnel" className="mt-0 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    value={profileData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    value={profileData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    value={profileData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Téléphone</Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber" 
                    value={profileData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-2">Mot de passe</h3>
                <Button variant="outline">Modifier le mot de passe</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="entreprise" className="mt-0 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
                <Input 
                  id="companyName" 
                  name="companyName" 
                  value={profileData.companyName}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siret">Numéro SIRET</Label>
                <Input 
                  id="siret" 
                  name="siret" 
                  value={profileData.siret}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Adresse</Label>
                <Input 
                  id="companyAddress" 
                  name="companyAddress" 
                  value={profileData.companyAddress}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyCity">Ville</Label>
                  <Input 
                    id="companyCity" 
                    name="companyCity" 
                    value={profileData.companyCity}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPostcode">Code postal</Label>
                  <Input 
                    id="companyPostcode" 
                    name="companyPostcode" 
                    value={profileData.companyPostcode}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium">Notifications par email</h3>
                    <p className="text-sm text-gray-500">Recevoir les notifications importantes par email</p>
                  </div>
                  <Switch
                    checked={profileData.emailNotifications}
                    onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium">Nouvelles fiches de paie</h3>
                    <p className="text-sm text-gray-500">Être notifié lorsqu&apos;une nouvelle fiche de paie est générée</p>
                  </div>
                  <Switch
                    checked={profileData.newPayslipNotifications}
                    onCheckedChange={(checked) => handleSwitchChange('newPayslipNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium">Communications marketing</h3>
                    <p className="text-sm text-gray-500">Recevoir des informations sur les nouvelles fonctionnalités et offres</p>
                  </div>
                  <Switch
                    checked={profileData.marketingNotifications}
                    onCheckedChange={(checked) => handleSwitchChange('marketingNotifications', checked)}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="securite" className="mt-0 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium">Authentification à deux facteurs</h3>
                    <p className="text-sm text-gray-500">Sécurisez davantage votre compte avec l&apos;authentification 2FA</p>
                  </div>
                  <Switch
                    checked={profileData.twoFactorAuth}
                    onCheckedChange={(checked) => handleSwitchChange('twoFactorAuth', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Conservation des données</Label>
                  <select 
                    id="dataRetention"
                    name="dataRetention"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={profileData.dataRetention}
                    onChange={handleChange}
                  >
                    <option value="six_months">6 mois</option>
                    <option value="one_year">1 an (recommandé)</option>
                    <option value="two_years">2 ans</option>
                    <option value="five_years">5 ans</option>
                  </select>
                  <p className="text-xs text-gray-500">Durée de conservation des données après résiliation</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-medium">Statistiques anonymes</h3>
                    <p className="text-sm text-gray-500">Partager des statistiques d&apos;utilisation anonymes pour améliorer le service</p>
                  </div>
                  <Switch
                    checked={profileData.anonymousStats}
                    onCheckedChange={(checked) => handleSwitchChange('anonymousStats', checked)}
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-2">Sessions actives</h3>
                <Button variant="outline" className="mr-2">Voir les appareils connectés</Button>
                <Button variant="destructive">Déconnecter tous les appareils</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="facturation" className="mt-0 space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <h3 className="font-medium mb-2">Abonnement actuel</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-lg">Plan Pro</span>
                    <p className="text-sm text-gray-500">Facturé mensuellement</p>
                  </div>
                  <Button variant="outline" size="sm">Changer d&apos;offre</Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Adresse de facturation</Label>
                  <Textarea
                    id="billingAddress"
                    name="billingAddress"
                    value={profileData.billingAddress}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="billingEmail">Email de facturation</Label>
                  <Input
                    id="billingEmail"
                    name="billingEmail"
                    value={profileData.billingEmail}
                    onChange={handleChange}
                    type="email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">Numéro de TVA (optionnel)</Label>
                  <Input
                    id="vatNumber"
                    name="vatNumber"
                    value={profileData.vatNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-2">Historique de facturation</h3>
                <Button variant="outline">Voir les factures</Button>
              </div>
            </TabsContent>
          </div>
          
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes et préférences</Label>
              <Textarea
                id="notes"
                name="notes"
                value={profileData.notes}
                onChange={handleChange}
                rows={2}
                className="max-w-md"
                placeholder="Informations complémentaires, préférences..."
              />
            </div>
            
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="ml-4"
            >
              {saving ? (
                <>Enregistrement...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 