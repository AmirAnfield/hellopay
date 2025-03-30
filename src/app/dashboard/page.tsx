"use client";

import { useState } from "react";
import { 
  Building, 
  Users, 
  FileText, 
  ArrowRight,
  Plus,
  FileBarChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageContainer, PageHeader } from "@/components/shared/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

// Interface pour les statistiques
interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

// Composant pour les cartes de statistiques
function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5 text-primary">{icon}</div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function ActionCard({ title, description, icon, href }: ActionCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 sm:px-6 pb-2">
        <div className="flex flex-row items-center space-x-2">
          <div className="rounded-full bg-primary/10 p-1.5 text-primary">{icon}</div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-0">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter className="px-4 sm:px-6 pt-4">
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href={href}>
            <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>Commencer</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function DashboardPage() {
  const [tab, setTab] = useState("overview");

  // Simuler des données pour la démo
  const revenueData = [
    { month: "Jan", value: 2200 },
    { month: "Feb", value: 2800 },
    { month: "Mar", value: 3200 },
    { month: "Apr", value: 4000 },
    { month: "May", value: 3800 },
    { month: "Jun", value: 4200 },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Tableau de bord"
        description="Bienvenue sur votre tableau de bord HelloPay"
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full space-y-6">
        <TabsList className="flex w-full flex-wrap overflow-x-auto md:flex-nowrap">
          <TabsTrigger value="overview" className="flex-1 min-w-[120px]">
            <span className="truncate">Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex-1 min-w-[120px]">
            <span className="truncate">Statistiques</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex-1 min-w-[120px]">
            <span className="truncate">Actions rapides</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatsCard
              title="Entreprises"
              value="3"
              description="Entreprises actives sur votre compte"
              icon={<Building className="h-5 w-5 flex-shrink-0" />}
            />
            <StatsCard
              title="Employés"
              value="12"
              description="Nombre total d'employés gérés"
              icon={<Users className="h-5 w-5 flex-shrink-0" />}
            />
            <StatsCard
              title="Bulletins"
              value="26"
              description="Bulletins de paie générés"
              icon={<FileText className="h-5 w-5 flex-shrink-0" />}
            />
            <StatsCard
              title="Contrats"
              value="15"
              description="Contrats de travail actifs"
              icon={<FileText className="h-5 w-5 flex-shrink-0" />}
            />
          </div>

          {/* Activité récente et actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Dernière activité */}
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>Dernières actions effectuées sur votre compte</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border">
                      <div className="rounded-full bg-primary/10 p-1.5 text-primary flex-shrink-0">
                        <FileBarChart className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">Bulletin de paie généré</p>
                        <p className="text-sm text-muted-foreground">
                          {i === 0 
                            ? "Il y a 2 heures" 
                            : i === 1 
                              ? "Hier" 
                              : "Il y a 3 jours"}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 sm:mt-0 w-full sm:w-auto" asChild>
                        <Link href="/dashboard/payslips">
                          <span>Voir</span>
                          <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>Effectuez rapidement des opérations courantes</CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-4">
                  <Button className="w-full flex justify-between items-center" asChild>
                    <Link href="/dashboard/payslips/generate">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-5 w-5 flex-shrink-0" />
                        <span>Générer un bulletin de paie</span>
                      </div>
                      <ArrowRight className="h-5 w-5 flex-shrink-0" />
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full flex justify-between items-center" asChild>
                    <Link href="/dashboard/employees/new">
                      <div className="flex items-center">
                        <Users className="mr-2 h-5 w-5 flex-shrink-0" />
                        <span>Ajouter un employé</span>
                      </div>
                      <ArrowRight className="h-5 w-5 flex-shrink-0" />
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="w-full flex justify-between items-center" asChild>
                    <Link href="/dashboard/companies/new">
                      <div className="flex items-center">
                        <Building className="mr-2 h-5 w-5 flex-shrink-0" />
                        <span>Ajouter une entreprise</span>
                      </div>
                      <ArrowRight className="h-5 w-5 flex-shrink-0" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Statistiques détaillées</CardTitle>
              <CardDescription>
                Vue d'ensemble de l'activité sur votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="aspect-video bg-muted flex items-center justify-center rounded-md">
                <p className="text-muted-foreground">Graphiques et données statistiques (démo)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <ActionCard
              title="Ajouter une entreprise"
              description="Créez une nouvelle entreprise pour générer des bulletins de paie"
              icon={<Building className="h-5 w-5 flex-shrink-0" />}
              href="/dashboard/companies/new"
            />
            <ActionCard
              title="Ajouter un employé"
              description="Ajoutez un nouvel employé et associez-le à une entreprise"
              icon={<Users className="h-5 w-5 flex-shrink-0" />}
              href="/dashboard/employees/new"
            />
            <ActionCard
              title="Créer un contrat"
              description="Établissez un nouveau contrat de travail pour un employé"
              icon={<FileText className="h-5 w-5 flex-shrink-0" />}
              href="/dashboard/contracts/new"
            />
            <ActionCard
              title="Générer un bulletin"
              description="Générez un bulletin de paie pour un employé et une période"
              icon={<FileText className="h-5 w-5 flex-shrink-0" />}
              href="/dashboard/payslips/generate"
            />
            <ActionCard
              title="Gérer les documents"
              description="Accédez à tous vos documents et exportez-les"
              icon={<FileBarChart className="h-5 w-5 flex-shrink-0" />}
              href="/dashboard/documents"
            />
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
} 