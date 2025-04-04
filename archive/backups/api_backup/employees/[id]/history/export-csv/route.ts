import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Interface pour les données mensuelles
interface MonthlyData {
  id: string | null;
  month: string;
  monthIndex: number;
  periodStart: string | null;
  periodEnd: string | null;
  grossSalary: number;
  netSalary: number;
  employeeContributions: number;
  employerContributions: number;
  employerCost: number;
  paidLeaveAcquired: number;
  paidLeaveTaken: number;
  paidLeaveBalance: number;
  hoursWorked: number;
  contributionsByCategory: Record<string, { employee: number; employer: number }>;
  taxAmount: number;
}

// Interface pour les montants de contribution
interface ContributionAmounts {
  employee: number;
  employer: number;
}

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Vérifier si l'ID de l'employé est fourni
    if (!params.id) {
      return NextResponse.json({ error: 'Identifiant employé manquant' }, { status: 400 });
    }

    // Récupérer la session pour vérifier l'authentification
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer l'année depuis les paramètres de requête (par défaut: année courante)
    const searchParams = request.nextUrl.searchParams;
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    if (isNaN(year)) {
      return NextResponse.json({ error: 'Année invalide' }, { status: 400 });
    }

    // Récupérer les données du récapitulatif annuel
    const response = await fetch(`${request.nextUrl.origin}/api/employees/${params.id}/history?year=${year}`, {
      headers: {
        Cookie: request.headers.get('cookie') || '',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error }, { status: response.status });
    }

    const historyData = await response.json();

    // Formater les nombres pour le CSV
    const formatNumber = (num: number): string => {
      return num.toFixed(2).replace('.', ',');
    };

    // Générer l'en-tête du CSV
    let csvContent = '\uFEFF'; // BOM pour l'encodage UTF-8
    
    // Informations de l'employé et de l'entreprise
    csvContent += `RÉCAPITULATIF ANNUEL DE PAIE - ${historyData.year}\r\n\r\n`;
    csvContent += `Employé;${historyData.employee.name}\r\n`;
    csvContent += `Poste;${historyData.employee.position}\r\n`;
    csvContent += `N° SS;${historyData.employee.socialSecurityNumber}\r\n`;
    csvContent += `Entreprise;${historyData.company.name}\r\n`;
    csvContent += `SIRET;${historyData.company.siret}\r\n\r\n`;

    // Cumuls annuels
    csvContent += `CUMULS ANNUELS\r\n`;
    csvContent += `Salaire brut annuel;${formatNumber(historyData.annual.grossSalary)} €\r\n`;
    csvContent += `Salaire net annuel;${formatNumber(historyData.annual.netSalary)} €\r\n`;
    csvContent += `Cotisations salariales;${formatNumber(historyData.annual.employeeContributions)} €\r\n`;
    csvContent += `Cotisations patronales;${formatNumber(historyData.annual.employerContributions)} €\r\n`;
    csvContent += `Coût employeur;${formatNumber(historyData.annual.employerCost)} €\r\n\r\n`;

    // Congés payés
    csvContent += `CONGÉS PAYÉS\r\n`;
    csvContent += `Congés acquis;${formatNumber(historyData.annual.paidLeaveAcquired)} jours\r\n`;
    csvContent += `Congés pris;${formatNumber(historyData.annual.paidLeaveTaken)} jours\r\n`;
    csvContent += `Solde actuel;${formatNumber(historyData.annual.paidLeaveBalance)} jours\r\n\r\n`;

    // Détail des cotisations
    csvContent += `RÉPARTITION DES COTISATIONS\r\n`;
    csvContent += `Catégorie;Part salariale;Part patronale;Total\r\n`;

    // Parcourir les catégories de cotisations avec le bon typage
    const contributions = historyData.annualContributionsByCategory as Record<string, ContributionAmounts>;
    
    Object.entries(contributions).forEach(([category, amounts]) => {
      const total = amounts.employee + amounts.employer;
      
      // Première lettre en majuscule
      const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
      
      csvContent += `${formattedCategory};${formatNumber(amounts.employee)} €;${formatNumber(amounts.employer)} €;${formatNumber(total)} €\r\n`;
    });

    // Ajouter le total des cotisations
    csvContent += `TOTAL;${formatNumber(historyData.annual.employeeContributions)} €;${formatNumber(historyData.annual.employerContributions)} €;${formatNumber(historyData.annual.employeeContributions + historyData.annual.employerContributions)} €\r\n\r\n`;

    // Détail mensuel
    csvContent += `DÉTAIL MENSUEL\r\n`;
    csvContent += `Mois;Salaire brut;Salaire net;Cotisations salariales;Cotisations patronales;Congés acquis;Congés pris;Solde congés;Statut\r\n`;

    // Parcourir les données mensuelles avec le bon typage
    const monthlyData = historyData.monthlyData as MonthlyData[];
    
    monthlyData.forEach(month => {
      // Préparation des valeurs à afficher
      const grossSalary = month.id ? formatNumber(month.grossSalary) + ' €' : '-';
      const netSalary = month.id ? formatNumber(month.netSalary) + ' €' : '-';
      const employeeContributions = month.id ? formatNumber(month.employeeContributions) + ' €' : '-';
      const employerContributions = month.id ? formatNumber(month.employerContributions) + ' €' : '-';
      const paidLeaveAcquired = month.id ? formatNumber(month.paidLeaveAcquired) : '-';
      const paidLeaveTaken = month.id ? formatNumber(month.paidLeaveTaken) : '-';
      const paidLeaveBalance = month.id ? formatNumber(month.paidLeaveBalance) : '-';
      const status = month.id ? 'Émis' : 'Non émis';
      
      csvContent += `${month.month};${grossSalary};${netSalary};${employeeContributions};${employerContributions};${paidLeaveAcquired};${paidLeaveTaken};${paidLeaveBalance};${status}\r\n`;
    });

    // Créer la réponse avec le fichier CSV
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv;charset=UTF-8',
        'Content-Disposition': `attachment; filename="recap_annuel_${historyData.employee.name.replace(' ', '_')}_${historyData.year}.csv"`,
      },
    });

  } catch (error) {
    console.error('Erreur lors de la génération du CSV:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la génération du CSV' },
      { status: 500 }
    );
  }
} 