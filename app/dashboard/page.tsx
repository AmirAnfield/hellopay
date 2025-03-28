'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Calendar, Clock, DollarSign, FileText, Users, Activity, TrendingUp, ArrowUpRight, ArrowDownRight, PlusCircle, AlertCircle } from 'lucide-react';

// Composant de Carte de Statistique
function StatCard({ title, value, description, icon, trend, trendValue }: { 
  title: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-1">
          {trend && (
            <div className={`flex items-center mr-2 ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="h-4 w-4 mr-1" /> : 
               trend === 'down' ? <ArrowDownRight className="h-4 w-4 mr-1" /> : null}
              {trendValue}
            </div>
          )}
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant Activité récente
function ActivityItem({ title, time, description, type }: {
  title: string;
  time: string;
  description: string;
  type: 'payslip' | 'employee' | 'alert';
}) {
  const getIcon = () => {
    switch (type) {
      case 'payslip':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'employee':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <div className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="mt-1 p-2 bg-gray-50 rounded-full">
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [tabValue, setTabValue] = useState('general');
  
  // Données pour les graphiques (simulées - à remplacer par des données réelles)
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  
  // Activités récentes simulées
  const recentActivities = [
    {
      title: "Fiche de paie générée",
      time: "Il y a 10 minutes",
      description: "Fiche de paie de Juillet 2023 pour Marie Dupont",
      type: "payslip" as const
    },
    {
      title: "Nouvel employé ajouté",
      time: "Il y a 2 heures",
      description: "Jean Martin a été ajouté à la liste des employés",
      type: "employee" as const
    },
    {
      title: "Fiche de paie modifiée",
      time: "Il y a 3 heures",
      description: "Modification de la fiche de paie de Juin 2023 pour Pierre Durand",
      type: "payslip" as const
    },
    {
      title: "Rappel cotisations",
      time: "Il y a 1 jour",
      description: "Date limite pour la déclaration des cotisations sociales",
      type: "alert" as const
    }
  ];
  
  // Tâches à faire simulées
  const todoItems = [
    {
      title: "Valider les fiches de paie",
      description: "5 fiches en attente de validation pour le mois de Juillet",
      dueDate: "31/07/2023",
      priority: "high"
    },
    {
      title: "Mettre à jour les informations URSSAF",
      description: "Nouveaux taux de cotisation à appliquer",
      dueDate: "15/08/2023",
      priority: "medium"
    },
    {
      title: "Vérifier les congés payés",
      description: "Validation des soldes de congés pour la période estivale",
      dueDate: "10/08/2023",
      priority: "medium"
    }
  ];
  
  // Calendrier des échéances simulé
  const upcomingDeadlines = [
    {
      title: "Déclaration DSN",
      date: "05/08/2023",
      description: "Déclaration Sociale Nominative pour Juillet"
    },
    {
      title: "Paiement cotisations URSSAF",
      date: "15/08/2023",
      description: "Échéance mensuelle"
    },
    {
      title: "Versement salaires",
      date: "28/07/2023",
      description: "Virement des salaires de Juillet"
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-gray-500">Bienvenue, Thomas. Voici votre aperçu du jour.</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Juillet 2023
          </Button>
          <Button size="sm" className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle fiche
          </Button>
        </div>
      </div>
      
      <Tabs value={tabValue} onValueChange={setTabValue} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="employees">Employés</TabsTrigger>
          <TabsTrigger value="finance">Finances</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Fiches de paie" 
              value="24" 
              description="ce mois-ci" 
              icon={<FileText className="h-5 w-5 text-primary" />}
              trend="up"
              trendValue="+8%"
            />
            <StatCard 
              title="Employés actifs" 
              value="28" 
              description="sur 30 inscrits" 
              icon={<Users className="h-5 w-5 text-primary" />}
            />
            <StatCard 
              title="Masse salariale" 
              value="64 250 €" 
              description="vs 62 100 € le mois dernier" 
              icon={<DollarSign className="h-5 w-5 text-primary" />}
              trend="up"
              trendValue="+3.4%"
            />
            <StatCard 
              title="Congés en cours" 
              value="5" 
              description="3 validés, 2 en attente" 
              icon={<Calendar className="h-5 w-5 text-primary" />}
            />
          </div>
          
          {/* Graphique et Activités récentes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Évolution de la masse salariale</CardTitle>
                <CardDescription>Vue d&apos;ensemble des 12 derniers mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  <div className="flex flex-col items-center text-gray-400">
                    <BarChart className="h-10 w-10 mb-2 opacity-50" />
                    <span>Graphique d&apos;évolution de la masse salariale</span>
                    <span className="text-xs mt-1">(données simulées)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Activité récente</CardTitle>
                <CardDescription>Dernières actions effectuées</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <ActivityItem 
                    key={index}
                    title={activity.title}
                    time={activity.time}
                    description={activity.description}
                    type={activity.type}
                  />
                ))}
                <div className="pt-2">
                  <Button variant="ghost" size="sm" className="w-full text-center justify-center text-primary">
                    Voir tout l&apos;historique
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tâches et Échéances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Tâches à faire</CardTitle>
                <CardDescription>Vos actions en attente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todoItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className={`w-2 h-2 mt-2 rounded-full ${
                        item.priority === 'high' ? 'bg-red-500' : 
                        item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.title}</h3>
                          <span className="text-xs text-gray-500">Échéance: {item.dueDate}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une tâche
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Calendrier des échéances</CardTitle>
                <CardDescription>Prochaines dates importantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="bg-primary/10 text-primary text-xs font-semibold p-2 rounded">
                        {deadline.date.split('/')[0]}
                        <br />
                        {months[parseInt(deadline.date.split('/')[1]) - 1]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{deadline.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{deadline.description}</p>
                      </div>
                    </div>
                  ))}
                  <Link href="/calendar">
                    <Button variant="ghost" size="sm" className="w-full text-center justify-center text-primary">
                      Voir le calendrier complet
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="employees" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Gestion des employés</h2>
              <Button className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter un employé
              </Button>
            </div>
            
            <p className="text-gray-500 mb-4">
              Accédez à la liste des employés pour gérer leurs informations, suivre leurs fiches de paie et 
              effectuer les opérations administratives les concernant.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total employés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28</div>
                  <div className="text-xs text-gray-500">24 CDI, 3 CDD, 1 Alternant</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Absences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-xs text-gray-500">3 congés payés, 2 maladies</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Anniversaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <div className="text-xs text-gray-500">Ce mois-ci</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-center">
              <Link href="/employees">
                <Button variant="outline" className="flex items-center">
                  Consulter la liste des employés
                </Button>
              </Link>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="finance" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Résumé financier</h2>
              <Button variant="outline" className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Exporter le rapport
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Masse salariale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">64 250 €</div>
                  <div className="flex items-center">
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs text-green-600 mr-1">+3.4%</span>
                    <span className="text-xs text-gray-500">vs mois précédent</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Cotisations sociales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">26 180 €</div>
                  <div className="flex items-center">
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs text-green-600 mr-1">+2.9%</span>
                    <span className="text-xs text-gray-500">vs mois précédent</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Net à payer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">38 070 €</div>
                  <div className="flex items-center">
                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs text-green-600 mr-1">+3.8%</span>
                    <span className="text-xs text-gray-500">vs mois précédent</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Heures supplémentaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">86 h</div>
                  <div className="flex items-center">
                    <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                    <span className="text-xs text-red-600 mr-1">-12%</span>
                    <span className="text-xs text-gray-500">vs mois précédent</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="h-[300px] mb-6 flex items-center justify-center bg-gray-50 rounded-md">
              <div className="flex flex-col items-center text-gray-400">
                <BarChart className="h-10 w-10 mb-2 opacity-50" />
                <span>Graphique de répartition des coûts salariaux</span>
                <span className="text-xs mt-1">(données simulées)</span>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Link href="/finance/expenses">
                <Button variant="outline">Détail des dépenses</Button>
              </Link>
              <Link href="/finance/budget">
                <Button>Gestion du budget</Button>
              </Link>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 