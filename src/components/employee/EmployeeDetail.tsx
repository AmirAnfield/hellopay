'use client';

import { Employee } from '@/services/employee-service';
import { Company } from '@/services/company-service';
import { formatDate } from '@/lib/utils';
import { 
  User, 
  Building2,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  BadgeCheck,
  CreditCard
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EmployeeDetailProps {
  employee: Employee;
  company?: Company | null;
}

export default function EmployeeDetail({ employee, company }: EmployeeDetailProps) {
  // Fonction pour formater les montants
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      {/* Section informations professionnelles */}
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2 mb-3">
          <Briefcase className="h-5 w-5" />
          Informations professionnelles
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Entreprise</p>
                <p className="text-sm text-muted-foreground">
                  {company?.name || "Non spécifiée"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Poste</p>
                <p className="text-sm text-muted-foreground">
                  {employee.position || "Non spécifié"}
                  {employee.department && ` (${employee.department})`}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <BadgeCheck className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Type de contrat</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant="outline">
                    {employee.contractType}
                  </Badge>
                  <Badge variant={employee.isExecutive ? "default" : "secondary"}>
                    {employee.isExecutive ? "Cadre" : "Non cadre"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Date d&apos;embauche</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(employee.startDate)}
                </p>
              </div>
            </div>
            
            {employee.endDate && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Date de fin</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(employee.endDate)}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Rémunération</p>
                <p className="text-sm text-muted-foreground">
                  Salaire: {formatAmount(employee.baseSalary)}/mois
                  <br />
                  Taux horaire: {formatAmount(employee.hourlyRate)}/h
                  <br />
                  Heures mensuelles: {employee.monthlyHours}h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section informations personnelles */}
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2 mb-3">
          <User className="h-5 w-5" />
          Informations personnelles
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Adresse</p>
                <p className="text-sm text-muted-foreground">
                  {employee.address}<br />
                  {employee.postalCode} {employee.city}<br />
                  {employee.country}
                </p>
              </div>
            </div>
            
            {employee.birthDate && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Date de naissance</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(employee.birthDate)}
                    {employee.birthPlace && ` à ${employee.birthPlace}`}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {employee.email && (
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {employee.email}
                  </p>
                </div>
              </div>
            )}
            
            {employee.phoneNumber && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Téléphone</p>
                  <p className="text-sm text-muted-foreground">
                    {employee.phoneNumber}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <BadgeCheck className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">N° de sécurité sociale</p>
                <p className="text-sm text-muted-foreground">
                  {employee.socialSecurityNumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 