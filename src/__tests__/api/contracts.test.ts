import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/contracts/route';
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/contracts/[id]/route';
import prisma from '@/lib/prisma';

// Mock Next.js NextRequest et NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  contract: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Contracts API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Mocks pour l'authentification
  const mockGetCurrentUser = jest.fn();
  jest.mock('@/lib/session', () => ({
    getCurrentUser: () => mockGetCurrentUser(),
  }));

  beforeEach(() => {
    // Par défaut, simuler un utilisateur authentifié
    mockGetCurrentUser.mockResolvedValue({
      id: 'user-id-123',
      name: 'Test User',
      email: 'test@example.com',
    });
  });

  describe('GET /api/contracts', () => {
    it('devrait retourner une liste paginée de contrats', async () => {
      // Données simulées
      const mockContracts = [
        {
          id: 'contract-1',
          title: 'Contrat de test 1',
          status: 'active',
          createdAt: new Date(),
        },
        {
          id: 'contract-2',
          title: 'Contrat de test 2',
          status: 'draft',
          createdAt: new Date(),
        },
      ];
      
      // Configuration des mocks
      (prisma.contract.findMany as jest.Mock).mockResolvedValue(mockContracts);
      (prisma.contract.count as jest.Mock).mockResolvedValue(2);
      
      // Création de la requête
      const request = new NextRequest('http://localhost:3000/api/contracts?page=1&pageSize=10', {
        method: 'GET',
      });
      
      // Appel de la route
      const response = await GET(request);
      const responseData = response.data;
      
      // Vérifications
      expect(prisma.contract.findMany).toHaveBeenCalled();
      expect(prisma.contract.count).toHaveBeenCalled();
      expect(responseData.success).toBe(true);
      expect(responseData.data).toEqual(mockContracts);
      expect(responseData.pagination).toEqual(expect.objectContaining({
        page: 1,
        pageSize: 10,
        totalCount: 2,
        totalPages: 1,
      }));
    });

    it('devrait gérer les filtres de recherche', async () => {
      // Configuration des mocks
      (prisma.contract.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.contract.count as jest.Mock).mockResolvedValue(0);
      
      // Création de la requête avec filtres
      const request = new NextRequest('http://localhost:3000/api/contracts?search=test&status=active&contractType=service', {
        method: 'GET',
      });
      
      // Appel de la route
      await GET(request);
      
      // Vérification que les filtres sont bien passés à Prisma
      expect(prisma.contract.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
            status: 'active',
            contractType: 'service',
          }),
        })
      );
    });

    it('devrait retourner 401 si l\'utilisateur n\'est pas authentifié', async () => {
      // Simuler un utilisateur non authentifié
      mockGetCurrentUser.mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost:3000/api/contracts', {
        method: 'GET',
      });
      
      const response = await GET(request);
      
      expect(response.options.status).toBe(401);
      expect(response.data.success).toBe(false);
      expect(response.data.message).toBe('Non autorisé');
    });
  });

  describe('GET /api/contracts/[id]', () => {
    it('devrait retourner un contrat par son ID', async () => {
      const mockContract = {
        id: 'contract-id-123',
        title: 'Test Contract',
        status: 'active',
      };
      
      (prisma.contract.findUnique as jest.Mock).mockResolvedValue(mockContract);
      
      const request = new NextRequest('http://localhost:3000/api/contracts/contract-id-123', {
        method: 'GET',
      });
      
      const params = { id: 'contract-id-123' };
      const response = await GET_BY_ID(request, { params });
      
      expect(prisma.contract.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'contract-id-123' },
        })
      );
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockContract);
    });

    it('devrait retourner 404 si le contrat n\'existe pas', async () => {
      (prisma.contract.findUnique as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost:3000/api/contracts/non-existent', {
        method: 'GET',
      });
      
      const params = { id: 'non-existent' };
      const response = await GET_BY_ID(request, { params });
      
      expect(response.options.status).toBe(404);
      expect(response.data.success).toBe(false);
    });
  });

  describe('POST /api/contracts', () => {
    it('devrait créer un nouveau contrat', async () => {
      const mockCreatedContract = {
        id: 'new-contract-id',
        title: 'Nouveau contrat',
        status: 'draft',
        createdAt: new Date(),
      };
      
      (prisma.contract.create as jest.Mock).mockResolvedValue(mockCreatedContract);
      
      // Simuler FormData
      const formData = new FormData();
      formData.append('title', 'Nouveau contrat');
      formData.append('status', 'draft');
      formData.append('contractType', 'service');
      formData.append('companyId', 'company-id');
      
      // Simuler un fichier
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      formData.append('file', file);
      
      const request = new NextRequest('http://localhost:3000/api/contracts', {
        method: 'POST',
        body: formData,
      });
      
      // Patch la méthode formData.get pour simuler les retours des données
      const mockGet = jest.fn((key) => {
        const map = {
          title: 'Nouveau contrat',
          status: 'draft',
          contractType: 'service',
          companyId: 'company-id',
          file: file,
        };
        return map[key] || null;
      });
      
      request.formData = jest.fn().mockResolvedValue({
        get: mockGet,
      });
      
      const response = await POST(request);
      
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockCreatedContract);
    });

    it('devrait retourner 400 si des données sont manquantes', async () => {
      const formData = new FormData();
      // Pas de titre, ce qui devrait provoquer une erreur
      formData.append('status', 'draft');
      
      const request = new NextRequest('http://localhost:3000/api/contracts', {
        method: 'POST',
        body: formData,
      });
      
      request.formData = jest.fn().mockResolvedValue({
        get: (key) => key === 'status' ? 'draft' : null,
      });
      
      const response = await POST(request);
      
      expect(response.options.status).toBe(400);
      expect(response.data.success).toBe(false);
    });
  });

  describe('PUT /api/contracts/[id]', () => {
    it('devrait mettre à jour un contrat existant', async () => {
      const mockUpdatedContract = {
        id: 'contract-id-123',
        title: 'Contrat mis à jour',
        status: 'active',
      };
      
      (prisma.contract.findUnique as jest.Mock).mockResolvedValue({ id: 'contract-id-123' });
      (prisma.contract.update as jest.Mock).mockResolvedValue(mockUpdatedContract);
      
      const formData = new FormData();
      formData.append('title', 'Contrat mis à jour');
      formData.append('status', 'active');
      
      const request = new NextRequest('http://localhost:3000/api/contracts/contract-id-123', {
        method: 'PUT',
        body: formData,
      });
      
      request.formData = jest.fn().mockResolvedValue({
        get: (key) => {
          const map = {
            title: 'Contrat mis à jour',
            status: 'active',
            contractType: 'service',
            companyId: 'company-id',
          };
          return map[key] || null;
        },
      });
      
      const params = { id: 'contract-id-123' };
      const response = await PUT(request, { params });
      
      expect(prisma.contract.update).toHaveBeenCalled();
      expect(response.data.success).toBe(true);
      expect(response.data.data).toEqual(mockUpdatedContract);
    });
  });

  describe('DELETE /api/contracts/[id]', () => {
    it('devrait supprimer un contrat', async () => {
      (prisma.contract.findUnique as jest.Mock).mockResolvedValue({ id: 'contract-id-123' });
      (prisma.contract.delete as jest.Mock).mockResolvedValue({ id: 'contract-id-123' });
      
      const request = new NextRequest('http://localhost:3000/api/contracts/contract-id-123', {
        method: 'DELETE',
      });
      
      const params = { id: 'contract-id-123' };
      const response = await DELETE(request, { params });
      
      expect(prisma.contract.delete).toHaveBeenCalledWith({
        where: { id: 'contract-id-123' },
      });
      expect(response.data.success).toBe(true);
    });

    it('devrait retourner 404 si le contrat à supprimer n\'existe pas', async () => {
      (prisma.contract.findUnique as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost:3000/api/contracts/non-existent', {
        method: 'DELETE',
      });
      
      const params = { id: 'non-existent' };
      const response = await DELETE(request, { params });
      
      expect(response.options.status).toBe(404);
      expect(response.data.success).toBe(false);
    });
  });
}); 