import prisma from '@/lib/prisma';
import { 
  ListEmployeesParams, 
  ListPayslipsParams, 
  ListCompaniesParams, 
  ListContractsParams,
  getPaginationOptions,
  PaginatedResponse,
  createPaginatedResponse
} from '@/lib/validators/pagination';
import { Prisma } from '@prisma/client';

// Types pour les résultats des requêtes
type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  select: {
    id: true;
    firstName: true;
    lastName: true;
    email: true;
    phoneNumber: true;
    position: true;
    department: true;
    contractType: true;
    isExecutive: true;
    startDate: true;
    endDate: true;
    baseSalary: true;
    companyId: true;
    company: {
      select: {
        id: true;
        name: true;
      }
    };
    _count: {
      select: {
        payslips: true;
      }
    }
  }
}>;

type PayslipWithRelations = Prisma.PayslipGetPayload<{
  select: {
    id: true;
    employeeName: true;
    employerName: true;
    periodStart: true;
    periodEnd: true;
    paymentDate: true;
    grossSalary: true;
    netSalary: true;
    status: true;
    locked: true;
    validatedAt: true;
    pdfUrl: true;
    fiscalYear: true;
    companyId: true;
    employeeId: true;
    company: {
      select: {
        id: true;
        name: true;
      }
    };
    employee: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
      }
    }
  }
}>;

type CompanyWithCounts = Prisma.CompanyGetPayload<{
  select: {
    id: true;
    name: true;
    siret: true;
    address: true;
    city: true;
    postalCode: true;
    country: true;
    activityCode: true;
    legalForm: true;
    email: true;
    phoneNumber: true;
    createdAt: true;
    _count: {
      select: {
        employees: true;
        payslips: true;
      }
    }
  }
}>;

/**
 * Fonction pour récupérer la liste paginée des employés
 */
export async function getEmployees(params: ListEmployeesParams): Promise<PaginatedResponse<EmployeeWithRelations>> {
  const { 
    companyId, 
    contractType, 
    isActive, 
    department, 
    startDateFrom, 
    startDateTo,
    search
  } = params;
  
  // Construire les filtres
  const where: Prisma.EmployeeWhereInput = {};
  
  // Filtre par entreprise
  if (companyId) {
    where.companyId = companyId;
  }
  
  // Filtre par type de contrat
  if (contractType) {
    where.contractType = contractType;
  }
  
  // Filtre par département
  if (department) {
    where.department = department;
  }
  
  // Filtre par date de début
  if (startDateFrom || startDateTo) {
    where.startDate = {};
    
    if (startDateFrom) {
      where.startDate.gte = startDateFrom;
    }
    
    if (startDateTo) {
      where.startDate.lte = startDateTo;
    }
  }
  
  // Filtre par statut actif/inactif
  if (isActive !== undefined) {
    if (isActive) {
      // Si actif, soit pas de date de fin, soit date de fin > aujourd'hui
      where.OR = [
        { endDate: null },
        { endDate: { gt: new Date() } }
      ];
    } else {
      // Si inactif, date de fin définie et <= aujourd'hui
      where.endDate = {
        not: null,
        lte: new Date()
      };
    }
  }
  
  // Recherche textuelle
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { position: { contains: search } },
      { email: { contains: search } }
    ];
  }
  
  // Options de pagination
  const { skip, take, orderBy } = getPaginationOptions(params);
  
  // Compter le nombre total d'employés correspondant aux critères
  const total = await prisma.employee.count({ where });
  
  // Récupérer les employés avec pagination
  const employees = await prisma.employee.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      position: true,
      department: true,
      contractType: true,
      isExecutive: true,
      startDate: true,
      endDate: true,
      baseSalary: true,
      companyId: true,
      company: {
        select: {
          id: true,
          name: true
        }
      },
      // Ne pas inclure tous les bulletins de paie, mais juste leur nombre
      _count: {
        select: {
          payslips: true
        }
      }
    },
    skip,
    take,
    orderBy: orderBy || { lastName: 'asc' }
  });
  
  // Créer la réponse paginée
  return createPaginatedResponse(employees, total, params);
}

/**
 * Fonction pour récupérer la liste paginée des bulletins de paie
 */
export async function getPayslips(params: ListPayslipsParams): Promise<PaginatedResponse<PayslipWithRelations>> {
  const { 
    companyId, 
    employeeId, 
    status, 
    periodFrom, 
    periodTo,
    fiscalYear,
    search
  } = params;
  
  // Construire les filtres
  const where: Prisma.PayslipWhereInput = {};
  
  // Filtre par entreprise
  if (companyId) {
    where.companyId = companyId;
  }
  
  // Filtre par employé
  if (employeeId) {
    where.employeeId = employeeId;
  }
  
  // Filtre par statut
  if (status) {
    where.status = status;
  }
  
  // Filtre par période
  if (periodFrom || periodTo) {
    where.OR = [
      {
        // Chevauchement: début de période dans l'intervalle
        periodStart: {
          ...(periodFrom && { gte: periodFrom }),
          ...(periodTo && { lte: periodTo })
        }
      },
      {
        // Chevauchement: fin de période dans l'intervalle
        periodEnd: {
          ...(periodFrom && { gte: periodFrom }),
          ...(periodTo && { lte: periodTo })
        }
      }
    ];
  }
  
  // Filtre par année fiscale
  if (fiscalYear) {
    where.fiscalYear = fiscalYear;
  }
  
  // Recherche textuelle
  if (search) {
    where.OR = [
      { employeeName: { contains: search } },
      { employerName: { contains: search } }
    ];
  }
  
  // Options de pagination
  const { skip, take, orderBy } = getPaginationOptions(params);
  
  // Compter le nombre total de bulletins correspondant aux critères
  const total = await prisma.payslip.count({ where });
  
  // Récupérer les bulletins avec pagination
  const payslips = await prisma.payslip.findMany({
    where,
    select: {
      id: true,
      employeeName: true,
      employerName: true,
      periodStart: true,
      periodEnd: true,
      paymentDate: true,
      grossSalary: true,
      netSalary: true,
      status: true,
      locked: true,
      validatedAt: true,
      pdfUrl: true,
      fiscalYear: true,
      companyId: true,
      employeeId: true,
      company: {
        select: {
          id: true,
          name: true
        }
      },
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    },
    skip,
    take,
    orderBy: orderBy || { periodStart: 'desc' }
  });
  
  // Créer la réponse paginée
  return createPaginatedResponse(payslips, total, params);
}

/**
 * Fonction pour récupérer la liste paginée des entreprises
 */
export async function getCompanies(params: ListCompaniesParams, userId: string): Promise<PaginatedResponse<CompanyWithCounts>> {
  const { 
    country, 
    legalForm, 
    createdFrom, 
    createdTo,
    search
  } = params;
  
  // Construire les filtres
  const where: Prisma.CompanyWhereInput = {
    // N'afficher que les entreprises de l'utilisateur courant
    userId
  };
  
  // Filtre par pays
  if (country) {
    where.country = country;
  }
  
  // Filtre par forme juridique
  if (legalForm) {
    where.legalForm = legalForm;
  }
  
  // Filtre par date de création
  if (createdFrom || createdTo) {
    where.createdAt = {};
    
    if (createdFrom) {
      where.createdAt.gte = createdFrom;
    }
    
    if (createdTo) {
      where.createdAt.lte = createdTo;
    }
  }
  
  // Recherche textuelle
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { siret: { contains: search } },
      { city: { contains: search } },
      { postalCode: { contains: search } }
    ];
  }
  
  // Options de pagination
  const { skip, take, orderBy } = getPaginationOptions(params);
  
  // Compter le nombre total d'entreprises correspondant aux critères
  const total = await prisma.company.count({ where });
  
  // Récupérer les entreprises avec pagination
  const companies = await prisma.company.findMany({
    where,
    select: {
      id: true,
      name: true,
      siret: true,
      address: true,
      city: true,
      postalCode: true,
      country: true,
      activityCode: true,
      legalForm: true,
      email: true,
      phoneNumber: true,
      createdAt: true,
      // Ne pas inclure tous les employés, mais juste leur nombre
      _count: {
        select: {
          employees: true,
          payslips: true
        }
      }
    },
    skip,
    take,
    orderBy: orderBy || { name: 'asc' }
  });
  
  // Créer la réponse paginée
  return createPaginatedResponse(companies, total, params);
}

/**
 * Fonction pour récupérer la liste paginée des contrats
 */
export async function getContracts(params: ListContractsParams, userId: string): Promise<PaginatedResponse<any>> {
  const { 
    companyId, 
    status, 
    contractType, 
    startDateFrom, 
    startDateTo,
    endDateFrom,
    endDateTo,
    search
  } = params;
  
  // Construire les filtres avec any pour éviter les problèmes de typage
  const where: any = {
    // N'afficher que les contrats de l'utilisateur courant
    userId
  };
  
  // Filtre par entreprise
  if (companyId) {
    where.companyId = companyId;
  }
  
  // Filtre par statut
  if (status) {
    where.status = status;
  }
  
  // Filtre par type de contrat
  if (contractType) {
    where.contractType = contractType;
  }
  
  // Filtre par date de début
  if (startDateFrom || startDateTo) {
    where.startDate = {};
    
    if (startDateFrom) {
      where.startDate.gte = startDateFrom;
    }
    
    if (startDateTo) {
      where.startDate.lte = startDateTo;
    }
  }
  
  // Filtre par date de fin
  if (endDateFrom || endDateTo) {
    where.endDate = {};
    
    if (endDateFrom) {
      where.endDate.gte = endDateFrom;
    }
    
    if (endDateTo) {
      where.endDate.lte = endDateTo;
    }
  }
  
  // Recherche textuelle
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { contractType: { contains: search } },
      { reference: { contains: search } },
      { tags: { contains: search } }
    ];
  }
  
  // Options de pagination
  const { skip, take, orderBy } = getPaginationOptions(params);
  
  // Compter le nombre total de contrats correspondant aux critères
  const total = await prisma.contract.count({ where });
  
  // Récupérer les contrats avec pagination
  const contracts = await prisma.contract.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          name: true
        }
      }
    },
    skip,
    take,
    orderBy: orderBy || { startDate: 'desc' }
  });
  
  // Créer la réponse paginée
  return createPaginatedResponse(contracts, total, params);
} 