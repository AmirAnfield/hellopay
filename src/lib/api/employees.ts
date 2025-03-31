/**
 * Service API pour les employés
 * Utilisant les types partagés
 */
import { 
  EmployeeResponseDTO, 
  EmployeeCreateRequestDTO, 
  EmployeeUpdateRequestDTO
} from '../types/employees/employee';
import { ApiSuccessResponse, PaginatedResponse } from '../types/shared/api';

// Type pour les paramètres de filtrage des employés
export interface EmployeeFilterParams {
  companyId?: string;
  search?: string;
  department?: string;
  contractType?: string;
  isExecutive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Récupérer tous les employés avec filtrage et pagination
 */
export async function getEmployees(params: EmployeeFilterParams = {}): Promise<PaginatedResponse<EmployeeResponseDTO>> {
  // Construire l'URL avec les paramètres
  const queryParams = new URLSearchParams();
  
  if (params.companyId) queryParams.append('companyId', params.companyId);
  if (params.search) queryParams.append('search', params.search);
  if (params.department) queryParams.append('department', params.department);
  if (params.contractType) queryParams.append('contractType', params.contractType);
  if (params.isExecutive !== undefined) queryParams.append('isExecutive', params.isExecutive.toString());
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  const url = `/api/employees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  // Faire la requête
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des employés: ${response.status}`);
  }
  
  const data = await response.json() as PaginatedResponse<EmployeeResponseDTO>;
  return data;
}

/**
 * Récupérer un employé par son ID
 */
export async function getEmployee(id: string): Promise<ApiSuccessResponse<EmployeeResponseDTO>> {
  const response = await fetch(`/api/employees/${id}`);
  
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération de l'employé: ${response.status}`);
  }
  
  const data = await response.json() as ApiSuccessResponse<EmployeeResponseDTO>;
  return data;
}

/**
 * Créer un nouvel employé
 */
export async function createEmployee(employee: EmployeeCreateRequestDTO): Promise<ApiSuccessResponse<EmployeeResponseDTO>> {
  const response = await fetch('/api/employees', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employee),
  });
  
  if (!response.ok) {
    throw new Error(`Erreur lors de la création de l'employé: ${response.status}`);
  }
  
  const data = await response.json() as ApiSuccessResponse<EmployeeResponseDTO>;
  return data;
}

/**
 * Mettre à jour un employé existant
 */
export async function updateEmployee(id: string, employee: EmployeeUpdateRequestDTO): Promise<ApiSuccessResponse<EmployeeResponseDTO>> {
  const response = await fetch(`/api/employees/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(employee),
  });
  
  if (!response.ok) {
    throw new Error(`Erreur lors de la mise à jour de l'employé: ${response.status}`);
  }
  
  const data = await response.json() as ApiSuccessResponse<EmployeeResponseDTO>;
  return data;
}

/**
 * Supprimer un employé
 */
export async function deleteEmployee(id: string): Promise<ApiSuccessResponse<{ success: boolean }>> {
  const response = await fetch(`/api/employees/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Erreur lors de la suppression de l'employé: ${response.status}`);
  }
  
  const data = await response.json() as ApiSuccessResponse<{ success: boolean }>;
  return data;
} 