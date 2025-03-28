'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  CalendarRange, 
  Download, 
  Mail, 
  MoreVertical, 
  FileText, 
  PlusCircle, 
  Filter, 
  ArrowUpDown, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

// Composant pour un badge de statut de fiche de paie
function StatusBadge({ status }: { status: 'draft' | 'pending' | 'validated' | 'sent' }) {
  const statusConfig = {
    draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-800' },
    pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
    validated: { label: 'Validée', className: 'bg-green-100 text-green-800' },
    sent: { label: 'Envoyée', className: 'bg-blue-100 text-blue-800' }
  };

  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={`${config.className} rounded-full font-medium`}>
      {status === 'draft' && <Clock className="mr-1 h-3 w-3" />}
      {status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
      {status === 'validated' && <CheckCircle className="mr-1 h-3 w-3" />}
      {status === 'sent' && <Mail className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

// Type pour les fiches de paie
type Payslip = {
  id: string;
  employeeName: string;
  period: string;
  amount: number;
  status: 'draft' | 'pending' | 'validated' | 'sent';
  createdAt: string;
  dueDate?: string;
};

export default function PayslipsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('period');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPayslips, setSelectedPayslips] = useState<string[]>([]);
  
  // Données fictives de fiches de paie
  const payslips: Payslip[] = [
    {
      id: 'FP-2023-07-001',
      employeeName: 'Marie Dupont',
      period: 'Juillet 2023',
      amount: 2450.75,
      status: 'sent',
      createdAt: '2023-07-28'
    },
    {
      id: 'FP-2023-07-002',
      employeeName: 'Pierre Durand',
      period: 'Juillet 2023',
      amount: 3120.50,
      status: 'sent',
      createdAt: '2023-07-28'
    },
    {
      id: 'FP-2023-07-003',
      employeeName: 'Sophie Martin',
      period: 'Juillet 2023',
      amount: 2890.25,
      status: 'validated',
      createdAt: '2023-07-27',
      dueDate: '2023-07-30'
    },
    {
      id: 'FP-2023-07-004',
      employeeName: 'Jean Leroy',
      period: 'Juillet 2023',
      amount: 2100.00,
      status: 'pending',
      createdAt: '2023-07-26'
    },
    {
      id: 'FP-2023-07-005',
      employeeName: 'Emma Bernard',
      period: 'Juillet 2023',
      amount: 1950.80,
      status: 'draft',
      createdAt: '2023-07-25'
    },
    {
      id: 'FP-2023-06-001',
      employeeName: 'Marie Dupont',
      period: 'Juin 2023',
      amount: 2450.75,
      status: 'sent',
      createdAt: '2023-06-28'
    },
    {
      id: 'FP-2023-06-002',
      employeeName: 'Pierre Durand',
      period: 'Juin 2023',
      amount: 3080.20,
      status: 'sent',
      createdAt: '2023-06-28'
    }
  ];
  
  // Liste des périodes uniques pour le filtre
  const periods = [...new Set(payslips.map(payslip => payslip.period))];
  
  // Fonction pour filtrer les fiches de paie
  const getFilteredPayslips = () => {
    return payslips
      .filter(payslip => {
        // Filtre par statut (si tab n'est pas 'all')
        if (activeTab !== 'all' && payslip.status !== activeTab) {
          return false;
        }
        
        // Filtre de recherche
        if (searchTerm && !payslip.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !payslip.id.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Filtre par période
        if (selectedPeriod && payslip.period !== selectedPeriod) {
          return false;
        }
        
        // Filtre par statut (filtre explicite)
        if (selectedStatus && payslip.status !== selectedStatus) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Tri par champ sélectionné
        if (sortField === 'employeeName') {
          return sortDirection === 'asc'
            ? a.employeeName.localeCompare(b.employeeName)
            : b.employeeName.localeCompare(a.employeeName);
        } else if (sortField === 'amount') {
          return sortDirection === 'asc'
            ? a.amount - b.amount
            : b.amount - a.amount;
        } else if (sortField === 'createdAt') {
          return sortDirection === 'asc'
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          // Par défaut, tri par période
          return sortDirection === 'asc'
            ? a.period.localeCompare(b.period)
            : b.period.localeCompare(a.period);
        }
      });
  };
  
  const filteredPayslips = getFilteredPayslips();
  
  // Fonction pour gérer le tri
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Fonction pour gérer la sélection d'une fiche de paie
  const toggleSelectPayslip = (id: string) => {
    setSelectedPayslips(prevSelected => 
      prevSelected.includes(id)
        ? prevSelected.filter(item => item !== id)
        : [...prevSelected, id]
    );
  };
  
  // Fonction pour sélectionner/désélectionner toutes les fiches
  const toggleSelectAll = () => {
    if (selectedPayslips.length === filteredPayslips.length) {
      setSelectedPayslips([]);
    } else {
      setSelectedPayslips(filteredPayslips.map(p => p.id));
    }
  };
  
  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedPeriod('');
    setSelectedStatus('');
    setSortField('period');
    setSortDirection('desc');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Fiches de paie</h1>
          <p className="text-gray-500">Gérez et consultez l&apos;ensemble des fiches de paie</p>
        </div>
        <Link href="/payslips/create">
          <Button className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouvelle fiche de paie
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Rechercher par nom ou numéro..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[160px]">
                    <CalendarRange className="mr-2 h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les périodes</SelectItem>
                    {periods.map(period => (
                      <SelectItem key={period} value={period}>{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="mr-2 h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les statuts</SelectItem>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="validated">Validée</SelectItem>
                    <SelectItem value="sent">Envoyée</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon" onClick={resetFilters} className="px-2">
                  Réinitialiser
                </Button>
              </div>
            </div>
            
            <TabsList className="grid grid-cols-5 gap-2">
              <TabsTrigger value="all" className="flex justify-center">
                Toutes
                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1 rounded-full">
                  {payslips.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="draft" className="flex justify-center">
                Brouillons
                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1 rounded-full">
                  {payslips.filter(p => p.status === 'draft').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex justify-center">
                En attente
                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1 rounded-full">
                  {payslips.filter(p => p.status === 'pending').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="validated" className="flex justify-center">
                Validées
                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1 rounded-full">
                  {payslips.filter(p => p.status === 'validated').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex justify-center">
                Envoyées
                <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1 rounded-full">
                  {payslips.filter(p => p.status === 'sent').length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="m-0">
            {filteredPayslips.length > 0 ? (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-500 font-medium border-y border-gray-200">
                        <th className="px-4 py-3 text-left w-12">
                          <Checkbox
                            checked={selectedPayslips.length === filteredPayslips.length && filteredPayslips.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </th>
                        <th className="px-4 py-3 text-left">Référence</th>
                        <th 
                          className="px-4 py-3 text-left cursor-pointer"
                          onClick={() => toggleSort('employeeName')}
                        >
                          <div className="flex items-center">
                            Employé
                            {sortField === 'employeeName' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left cursor-pointer"
                          onClick={() => toggleSort('period')}
                        >
                          <div className="flex items-center">
                            Période
                            {sortField === 'period' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-right cursor-pointer"
                          onClick={() => toggleSort('amount')}
                        >
                          <div className="flex items-center justify-end">
                            Montant Net
                            {sortField === 'amount' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left">Statut</th>
                        <th 
                          className="px-4 py-3 text-left cursor-pointer"
                          onClick={() => toggleSort('createdAt')}
                        >
                          <div className="flex items-center">
                            Date de création
                            {sortField === 'createdAt' && (
                              sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayslips.map(payslip => (
                        <tr key={payslip.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <Checkbox
                              checked={selectedPayslips.includes(payslip.id)}
                              onCheckedChange={() => toggleSelectPayslip(payslip.id)}
                            />
                          </td>
                          <td className="px-4 py-4 font-medium">
                            <Link href={`/payslips/${payslip.id}`} className="text-primary hover:underline">
                              {payslip.id}
                            </Link>
                          </td>
                          <td className="px-4 py-4">{payslip.employeeName}</td>
                          <td className="px-4 py-4">{payslip.period}</td>
                          <td className="px-4 py-4 text-right font-medium">{payslip.amount.toFixed(2)} €</td>
                          <td className="px-4 py-4">
                            <StatusBadge status={payslip.status} />
                          </td>
                          <td className="px-4 py-4 text-gray-500 text-sm">{payslip.createdAt}</td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/payslips/${payslip.id}`}>
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">Voir</span>
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Télécharger</span>
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Mail className="h-4 w-4" />
                                <span className="sr-only">Envoyer</span>
                              </Button>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Plus</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {selectedPayslips.length > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {selectedPayslips.length} élément{selectedPayslips.length > 1 ? 's' : ''} sélectionné{selectedPayslips.length > 1 ? 's' : ''}
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" />
                        Envoyer par email
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-1">Aucune fiche de paie trouvée</h3>
                <p className="text-gray-500 mb-4">Aucune fiche de paie ne correspond à vos critères de recherche.</p>
                <Button variant="outline" onClick={resetFilters}>Réinitialiser les filtres</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 