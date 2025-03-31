/**
 * Composant d'affichage des détails d'un employé
 * Utilisant les types partagés
 */
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { UserRound, Briefcase, CreditCard, Building2, Mail } from 'lucide-react';
import type { EmployeeResponseDTO } from '@/lib/types/employees/employee';

// Couleurs des badges pour chaque type de contrat
const contractTypeColors: Record<string, string> = {
  'CDI': 'bg-green-500/20 text-green-700 hover:bg-green-500/30',
  'CDD': 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30',
  'Alternance': 'bg-purple-500/20 text-purple-700 hover:bg-purple-500/30',
  'Stage': 'bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30',
  'Intérim': 'bg-orange-500/20 text-orange-700 hover:bg-orange-500/30',
  'Autre': 'bg-gray-500/20 text-gray-700 hover:bg-gray-500/30',
};

interface EmployeeDetailsProps {
  employee: EmployeeResponseDTO;
  onEdit?: () => void;
  onDelete?: () => void;
  onGeneratePayslip?: () => void;
}

export function EmployeeDetails({ 
  employee, 
  onEdit, 
  onDelete,
  onGeneratePayslip
}: EmployeeDetailsProps) {
  // Formater les dates pour l'affichage
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'PPP', { locale: fr });
    } catch (_) {
      return dateString;
    }
  };

  // Formater les montants pour l'affichage
  const formatAmount = (amount?: number | null) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec informations principales */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold">
                {employee.firstName} {employee.lastName}
              </CardTitle>
              <div className="flex items-center mt-1 text-muted-foreground">
                <Briefcase className="w-4 h-4 mr-1" />
                <span>{employee.position}</span>
                {employee.department && (
                  <>
                    <span className="mx-1">•</span>
                    <span>{employee.department}</span>
                  </>
                )}
              </div>
            </div>
            <Badge 
              className={`${contractTypeColors[employee.contractType] || contractTypeColors.Autre}`}
            >
              {employee.contractType}
              {employee.isExecutive && ' • Cadre'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informations personnelles */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <UserRound className="w-5 h-5 mr-2" />
              Informations personnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">N° Sécurité sociale</p>
                <p>{employee.socialSecurityNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nationalité</p>
                <p>{employee.nationality || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date de naissance</p>
                <p>{formatDate(employee.birthDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lieu de naissance</p>
                <p>{employee.birthPlace || '-'}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Informations de contact */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{employee.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p>{employee.phoneNumber || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p>{`${employee.address}, ${employee.postalCode} ${employee.city}, ${employee.country}`}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Informations professionnelles */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Informations professionnelles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Entreprise</p>
                <p>{employee.company?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date d'embauche</p>
                <p>{formatDate(employee.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date de fin (si applicable)</p>
                <p>{formatDate(employee.endDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fin période d'essai</p>
                <p>{formatDate(employee.trialPeriodEndDate)}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Informations de rémunération */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Rémunération
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Salaire de base</p>
                <p className="font-semibold">{formatAmount(employee.baseSalary)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux horaire</p>
                <p>{formatAmount(employee.hourlyRate)}/h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Heures mensuelles</p>
                <p>{employee.monthlyHours}h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prime</p>
                <p>{formatAmount(employee.bonusAmount)}</p>
              </div>
              {employee.bonusDescription && (
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Description de la prime</p>
                  <p>{employee.bonusDescription}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Informations bancaires si disponibles */}
          {(employee.iban || employee.bic) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Coordonnées bancaires
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">IBAN</p>
                    <p className="font-mono">{employee.iban}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">BIC</p>
                    <p className="font-mono">{employee.bic}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
        
        {/* Actions */}
        {(onEdit || onDelete || onGeneratePayslip) && (
          <CardFooter className="flex justify-end gap-3 pt-2 border-t">
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                Modifier
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                Supprimer
              </Button>
            )}
            {onGeneratePayslip && (
              <Button onClick={onGeneratePayslip}>
                Générer un bulletin
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
      
      {/* Bulletins de paie (si disponibles) */}
      {employee.payslips && employee.payslips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Bulletins de paie récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employee.payslips.map(payslip => (
                <div key={payslip.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-medium">
                      {formatDate(payslip.periodStart)} - {formatDate(payslip.periodEnd)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Net: {formatAmount(payslip.netSalary)} • Brut: {formatAmount(payslip.grossSalary)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={payslip.status === 'final' ? 'bg-green-500/20 text-green-700' : 'bg-amber-500/20 text-amber-700'}>
                      {payslip.status === 'final' ? 'Final' : 'Brouillon'}
                    </Badge>
                    {payslip.pdfUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={payslip.pdfUrl} target="_blank" rel="noopener noreferrer">Télécharger</a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 