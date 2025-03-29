"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Download, Briefcase, Users, Plus, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Company {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  startDate: string;
  position: string;
  baseSalary: number;
  companyId: string;
}

interface MonthlyPayslip {
  month: Date;
  isGenerated: boolean;
  id?: string;
  pdfUrl?: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [monthlyPayslips, setMonthlyPayslips] = useState<MonthlyPayslip[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Charger les entreprises et employés
  useEffect(() => {
    Promise.all([
      fetch('/api/companies').then(res => res.json()),
      fetch('/api/employees').then(res => res.json())
    ])
      .then(([companiesData, employeesData]) => {
        setCompanies(companiesData.companies || []);
        setEmployees(employeesData.employees || []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des données:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les données. Veuillez réessayer."
        });
        setIsLoading(false);
      });
  }, [toast]);

  // Filtrer les employés lorsqu'une entreprise est sélectionnée
  useEffect(() => {
    if (selectedCompanyId) {
      const filtered = employees.filter(emp => emp.companyId === selectedCompanyId);
      setFilteredEmployees(filtered);
      setSelectedEmployeeId("");
    } else {
      setFilteredEmployees([]);
      setSelectedEmployeeId("");
    }
  }, [selectedCompanyId, employees]);

  // Générer la liste des mois pour lesquels créer des fiches de paie
  useEffect(() => {
    if (selectedEmployeeId) {
      const employee = employees.find(emp => emp.id === selectedEmployeeId);
      if (employee) {
        const startDate = new Date(employee.startDate);
        const currentDate = new Date();
        const months: MonthlyPayslip[] = [];

        const currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        
        // Générer tous les mois de la date d'embauche jusqu'à aujourd'hui
        while (currentMonth <= currentDate) {
          months.push({
            month: new Date(currentMonth),
            isGenerated: false,
          });
          currentMonth.setMonth(currentMonth.getMonth() + 1);
        }

        // Pour cette démo, on simule quelques fiches déjà générées
        if (months.length > 2) {
          months[months.length - 1].isGenerated = true;
          months[months.length - 1].id = "payslip-" + Date.now() + "-1";
          months[months.length - 1].pdfUrl = "#";
          
          months[months.length - 2].isGenerated = true;
          months[months.length - 2].id = "payslip-" + Date.now() + "-2";
          months[months.length - 2].pdfUrl = "#";
        }

        // Trier par date décroissante (plus récent en premier)
        months.sort((a, b) => b.month.getTime() - a.month.getTime());
        
        setMonthlyPayslips(months);
      }
    } else {
      setMonthlyPayslips([]);
    }
  }, [selectedEmployeeId, employees]);

  // Simuler la génération d'une fiche de paie
  const handleGeneratePayslip = async (monthPayslip: MonthlyPayslip) => {
    if (isGenerating === monthPayslip.month.toISOString() || !selectedCompanyId || !selectedEmployeeId) return;
    
    setIsGenerating(monthPayslip.month.toISOString());
    
    try {
      // Délai artificiel pour simuler le traitement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mettre à jour l'état local
      setMonthlyPayslips(prev => 
        prev.map(item => 
          item.month.toISOString() === monthPayslip.month.toISOString() 
            ? { 
                ...item, 
                isGenerated: true, 
                id: "payslip-" + Date.now(),
                pdfUrl: "#" 
              } 
            : item
        )
      );
      
      toast({
        title: "Bulletin généré",
        description: `Le bulletin de paie de ${format(monthPayslip.month, 'MMMM yyyy', { locale: fr })} a été généré avec succès.`,
      });
    } catch (error) {
      console.error("Erreur lors de la génération du bulletin:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le bulletin de paie. Veuillez réessayer."
      });
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Gérez et générez vos bulletins de paie</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Tabs defaultValue="payslips" className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payslips">Bulletins de paie</TabsTrigger>
              <TabsTrigger value="other" disabled>Autres documents</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar avec les filtres */}
        <div className="md:col-span-4 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Filtres</CardTitle>
              <CardDescription>Sélectionnez une entreprise et un employé</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Select
                  value={selectedCompanyId}
                  onValueChange={setSelectedCompanyId}
                  disabled={isLoading || companies.length === 0}
                >
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Sélectionner une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {companies.length === 0 && !isLoading && (
                  <div className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                    <span className="text-xs">⚠️</span> Aucune entreprise trouvée
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee">Employé</Label>
                <Select
                  value={selectedEmployeeId}
                  onValueChange={setSelectedEmployeeId}
                  disabled={isLoading || !selectedCompanyId || filteredEmployees.length === 0}
                >
                  <SelectTrigger id="employee">
                    <SelectValue placeholder="Sélectionner un employé" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredEmployees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filteredEmployees.length === 0 && selectedCompanyId && !isLoading && (
                  <div className="text-sm text-amber-600 flex items-center gap-1 mt-1">
                    <span className="text-xs">⚠️</span> Aucun employé trouvé pour cette entreprise
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => router.push('/dashboard/companies/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une entreprise
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start"
                  onClick={() => router.push('/dashboard/employees/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un employé
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <div className="md:col-span-8 lg:col-span-9">
          <Card>
            <CardHeader>
              <CardTitle>Bulletins de paie</CardTitle>
              <CardDescription>
                {selectedEmployeeId ? (
                  <>
                    Liste des bulletins pour {filteredEmployees.find(e => e.id === selectedEmployeeId)?.firstName} {filteredEmployees.find(e => e.id === selectedEmployeeId)?.lastName}
                  </>
                ) : (
                  <>Sélectionnez un employé pour voir ses bulletins de paie</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">Chargement des données...</p>
                  </div>
                </div>
              ) : selectedEmployeeId ? (
                monthlyPayslips.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {monthlyPayslips.map((payslip) => (
                        <div 
                          key={payslip.month.toISOString()} 
                          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-full bg-primary/10">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{format(payslip.month, 'MMMM yyyy', { locale: fr })}</h4>
                              <p className="text-sm text-muted-foreground">
                                {payslip.isGenerated ? "Bulletin généré" : "Bulletin non généré"}
                              </p>
                            </div>
                          </div>
                          <div>
                            {payslip.isGenerated ? (
                              <Button variant="outline" size="sm" asChild>
                                <a href={payslip.pdfUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-2" />
                                  Télécharger
                                </a>
                              </Button>
                            ) : (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleGeneratePayslip(payslip)}
                                disabled={isGenerating === payslip.month.toISOString()}
                              >
                                {isGenerating === payslip.month.toISOString() ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Génération...
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Générer
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">Aucune période disponible pour cet employé</p>
                  </div>
                )
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Aucun employé sélectionné</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Veuillez sélectionner une entreprise et un employé pour générer ou consulter des bulletins de paie.
                  </p>
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/dashboard/companies/new')}
                      className="flex items-center"
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Ajouter une entreprise
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/dashboard/employees/new')}
                      className="flex items-center"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Ajouter un employé
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 