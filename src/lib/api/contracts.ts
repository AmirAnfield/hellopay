// Interfaces et types
export interface ContractFilter {
  search?: string;
  status?: 'draft' | 'active' | 'terminated' | 'expired';
  contractType?: 'employment' | 'service' | 'nda' | 'partnership' | 'other';
  companyId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface Contract {
  id: string;
  title: string;
  description?: string;
  reference?: string;
  status: string;
  contractType: string;
  startDate?: string | Date;
  endDate?: string | Date;
  companyId: string;
  company: {
    id: string;
    name: string;
  };
  counterpartyName?: string;
  counterpartyEmail?: string;
  tags?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  fileKey: string;
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Erreur personnalisée pour les appels à l'API
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Fonction utilitaire pour gérer les erreurs de requête
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    // Tenter d'obtenir les détails de l'erreur depuis le JSON
    try {
      const errorData = await response.json();
      throw new ApiError(errorData.message || 'Une erreur est survenue', response.status);
    } catch {
      // Si la réponse n'est pas du JSON, utiliser le statusText
      throw new ApiError(response.statusText || 'Une erreur est survenue', response.status);
    }
  }
  
  return await response.json();
}

/**
 * Récupère la liste des contrats avec filtrage et pagination
 */
export async function fetchContracts(filters: ContractFilter = {}): Promise<PaginatedResponse<Contract>> {
  // Valeurs par défaut
  const {
    search = '',
    status,
    contractType,
    companyId,
    page = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filters;

  // Construire l'URL avec les paramètres de requête
  const url = new URL('/api/contracts', window.location.origin);
  
  // Ajouter les paramètres non vides à l'URL
  if (search) url.searchParams.append('search', search);
  if (status) url.searchParams.append('status', status);
  if (contractType) url.searchParams.append('contractType', contractType);
  if (companyId) url.searchParams.append('companyId', companyId);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('pageSize', pageSize.toString());
  url.searchParams.append('sortBy', sortBy);
  url.searchParams.append('sortOrder', sortOrder);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<Contract[]>(response);
    
    if (!result.success) {
      throw new ApiError(result.message || 'Échec de récupération des contrats', 400);
    }

    return {
      data: result.data || [],
      pagination: result.pagination || {
        page,
        pageSize,
        totalCount: 0,
        totalPages: 0,
      },
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Impossible de se connecter au serveur', 500);
  }
}

/**
 * Récupère un contrat par son ID
 */
export async function fetchContractById(id: string): Promise<Contract> {
  if (!id) {
    throw new ApiError('ID du contrat manquant', 400);
  }

  try {
    const response = await fetch(`/api/contracts/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<Contract>(response);

    if (!result.success || !result.data) {
      throw new ApiError(result.message || 'Contrat non trouvé', 404);
    }

    return result.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du contrat ${id}:`, error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Impossible de se connecter au serveur', 500);
  }
}

/**
 * Crée un nouveau contrat
 */
export async function createContract(formData: FormData): Promise<Contract> {
  try {
    const response = await fetch('/api/contracts', {
      method: 'POST',
      body: formData,
      // Ne pas définir Content-Type pour FormData, le navigateur le fait automatiquement
    });

    const result = await handleResponse<Contract>(response);

    if (!result.success || !result.data) {
      throw new ApiError(result.message || 'Échec de création du contrat', 400);
    }

    return result.data;
  } catch (error) {
    console.error('Erreur lors de la création du contrat:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Impossible de se connecter au serveur', 500);
  }
}

/**
 * Met à jour un contrat existant
 */
export async function updateContract(id: string, formData: FormData): Promise<Contract> {
  if (!id) {
    throw new ApiError('ID du contrat manquant', 400);
  }

  try {
    const response = await fetch(`/api/contracts/${id}`, {
      method: 'PUT',
      body: formData,
      // Ne pas définir Content-Type pour FormData, le navigateur le fait automatiquement
    });

    const result = await handleResponse<Contract>(response);

    if (!result.success || !result.data) {
      throw new ApiError(result.message || 'Échec de mise à jour du contrat', 400);
    }

    return result.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du contrat ${id}:`, error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Impossible de se connecter au serveur', 500);
  }
}

/**
 * Supprime un contrat par son ID
 */
export async function deleteContract(id: string): Promise<void> {
  if (!id) {
    throw new ApiError('ID du contrat manquant', 400);
  }

  try {
    const response = await fetch(`/api/contracts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<null>(response);

    if (!result.success) {
      throw new ApiError(result.message || 'Échec de suppression du contrat', 400);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression du contrat ${id}:`, error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Impossible de se connecter au serveur', 500);
  }
} 