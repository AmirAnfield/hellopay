import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatCard } from './StatCard';
import { SupportCard } from './SupportCard';
import { BuildingIcon, UsersIcon, FileTextIcon, SettingsIcon } from '@/components/ui/icons';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Entreprises"
          value="3"
          description="Entreprises actives"
          trend={{ value: 33, direction: 'up' }}
          icon={<BuildingIcon size={20} />}
        />
        <StatCard
          title="Employés"
          value="12"
          description="Tous employés confondus"
          trend={{ value: 25, direction: 'up' }}
          icon={<UsersIcon size={20} />}
        />
        <StatCard
          title="Fiches de paie"
          value="24"
          description="Ce mois-ci"
          trend={{ value: 5, direction: 'up' }}
          icon={<FileTextIcon size={20} />}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="enterprises">Entreprises</TabsTrigger>
          <TabsTrigger value="employees">Employés</TabsTrigger>
          <TabsTrigger value="payslips">Fiches de paie</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
              <h3 className="text-base font-medium mb-3">Activité récente</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    <FileTextIcon size={16} className="mr-2 text-blue-500" />
                    <span>Fiche de paie créée</span>
                  </div>
                  <span className="text-sm text-gray-500">Il y a 2h</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center">
                    <UsersIcon size={16} className="mr-2 text-green-500" />
                    <span>Nouvel employé ajouté</span>
                  </div>
                  <span className="text-sm text-gray-500">Il y a 1j</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BuildingIcon size={16} className="mr-2 text-purple-500" />
                    <span>Entreprise mise à jour</span>
                  </div>
                  <span className="text-sm text-gray-500">Il y a 3j</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
              <h3 className="text-base font-medium mb-3">Actions rapides</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <FileTextIcon size={24} className="mb-2 text-blue-500" />
                  <span className="text-sm">Nouvelle fiche</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <UsersIcon size={24} className="mb-2 text-green-500" />
                  <span className="text-sm">Nouvel employé</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <BuildingIcon size={24} className="mb-2 text-purple-500" />
                  <span className="text-sm">Nouvelle entreprise</span>
                </button>
                <button className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <SettingsIcon size={24} className="mb-2 text-gray-500" />
                  <span className="text-sm">Paramètres</span>
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="enterprises">
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
            <h3 className="text-base font-medium mb-3">Vos entreprises</h3>
            {/* Content for enterprises tab */}
          </div>
        </TabsContent>
        
        <TabsContent value="employees">
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
            <h3 className="text-base font-medium mb-3">Vos employés</h3>
            {/* Content for employees tab */}
          </div>
        </TabsContent>
        
        <TabsContent value="payslips">
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 shadow-sm">
            <h3 className="text-base font-medium mb-3">Vos fiches de paie</h3>
            {/* Content for payslips tab */}
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional content */}
      {children}

      {/* Support & Help Section */}
      <div className="mt-8">
        <SupportCard />
      </div>
    </div>
  );
} 