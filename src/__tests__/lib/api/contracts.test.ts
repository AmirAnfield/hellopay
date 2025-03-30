import { fetchContracts, fetchContractById, createContract, updateContract, deleteContract, ApiError } from '@/lib/api/contracts';

// Mock de fetch
global.fetch = jest.fn();

describe('Fonctions API de contrats', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Mock pour window.location
  Object.defineProperty(window, 'location', {
    value: {
      origin: 'http://localhost:3000',
    },
    writable: true,
  });

  // Mock pour FormData
  const mockFormData = {
    append: jest.fn(),
    get: jest.fn(),
  };
  global.FormData = jest.fn(() => mockFormData) as any;

  describe('fetchContracts', () => {
    it('devrait récupérer les contrats avec les filtres par défaut', async () => {
      // Mock de la réponse
      const mockResponse = {
        success: true,
        data: [{ id: 'contract-1', title: 'Test Contract' }],
        pagination: {
          page: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
        },
      };

      // Configuration du mock de fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      // Appel de la fonction
      const result = await fetchContracts();

      // Vérifications
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/contracts?page=1&pageSize=10&sortBy=createdAt&sortOrder=desc',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result.data).toEqual(mockResponse.data);
      expect(result.pagination).toEqual(mockResponse.pagination);
    });

    it('devrait appliquer les filtres correctement', async () => {
      // Mock de la réponse
      const mockResponse = {
        success: true,
        data: [],
        pagination: { page: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
      };

      // Configuration du mock de fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      // Appel de la fonction avec des filtres
      await fetchContracts({
        search: 'test',
        status: 'active',
        contractType: 'service',
        page: 2,
        pageSize: 20,
        sortBy: 'title',
        sortOrder: 'asc',
      });

      // Vérification de l'URL
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/contracts?search=test&status=active&contractType=service&page=2&pageSize=20&sortBy=title&sortOrder=asc',
        expect.anything()
      );
    });

    it('devrait gérer les erreurs API', async () => {
      // Configuration du mock de fetch pour une erreur
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValueOnce({
          success: false,
          message: 'Erreur serveur',
        }),
      });

      // Vérification que l'erreur est bien propagée
      await expect(fetchContracts()).rejects.toThrow(ApiError);
      await expect(fetchContracts()).rejects.toMatchObject({
        message: 'Erreur serveur',
        status: 500,
      });
    });
  });

  describe('fetchContractById', () => {
    it('devrait récupérer un contrat par son ID', async () => {
      const mockContract = { id: 'contract-id', title: 'Contract Title' };
      const mockResponse = {
        success: true,
        data: mockContract,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await fetchContractById('contract-id');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/contracts/contract-id',
        expect.anything()
      );
      expect(result).toEqual(mockContract);
    });

    it('devrait lancer une erreur si l\'ID est manquant', async () => {
      await expect(fetchContractById('')).rejects.toThrow('ID du contrat manquant');
    });

    it('devrait gérer un contrat non trouvé', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          success: false,
          message: 'Contrat non trouvé',
        }),
      });

      await expect(fetchContractById('non-existent')).rejects.toThrow('Contrat non trouvé');
    });
  });

  describe('createContract', () => {
    it('devrait créer un nouveau contrat avec succès', async () => {
      const mockResponse = {
        success: true,
        data: { id: 'new-contract', title: 'New Contract' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const formData = new FormData();
      const result = await createContract(formData);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/contracts',
        expect.objectContaining({
          method: 'POST',
          body: formData,
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait gérer les erreurs de création', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          success: false,
          message: 'Données invalides',
        }),
      });

      const formData = new FormData();
      await expect(createContract(formData)).rejects.toThrow('Données invalides');
    });
  });

  describe('updateContract', () => {
    it('devrait mettre à jour un contrat avec succès', async () => {
      const mockResponse = {
        success: true,
        data: { id: 'contract-id', title: 'Updated Contract' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const formData = new FormData();
      const result = await updateContract('contract-id', formData);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/contracts/contract-id',
        expect.objectContaining({
          method: 'PUT',
          body: formData,
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('devrait lancer une erreur si l\'ID est manquant', async () => {
      const formData = new FormData();
      await expect(updateContract('', formData)).rejects.toThrow('ID du contrat manquant');
    });
  });

  describe('deleteContract', () => {
    it('devrait supprimer un contrat avec succès', async () => {
      const mockResponse = {
        success: true,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      await deleteContract('contract-id');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/contracts/contract-id',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('devrait lancer une erreur si l\'ID est manquant', async () => {
      await expect(deleteContract('')).rejects.toThrow('ID du contrat manquant');
    });

    it('devrait gérer les erreurs de suppression', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          success: false,
          message: 'Erreur de suppression',
        }),
      });

      await expect(deleteContract('contract-id')).rejects.toThrow('Erreur de suppression');
    });
  });
}); 