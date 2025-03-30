/**
 * Script de test de performances pour l'API Contracts
 * 
 * Ce script permet de mesurer les performances des endpoints de l'API contracts
 * avec un grand volume de données (> 500 contrats) pour valider que :
 * - La pagination fonctionne correctement
 * - Les recherches sont rapides
 * - Les filtres sont efficaces
 * 
 * Exécuter avec : npm run ts-node scripts/test-contract-performance.ts
 */

import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();
const API_BASE_URL = 'http://localhost:3000/api';

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Mesure le temps d'exécution d'une fonction
 */
async function timeExecution(name: string, fn: () => Promise<any>): Promise<any> {
  console.log(`${colors.blue}[TEST] ${name}${colors.reset}`);
  const start = performance.now();
  
  try {
    const result = await fn();
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    
    // Afficher le résultat avec couleur selon la durée
    let durationColor = colors.green;
    if (parseFloat(duration) > 500) durationColor = colors.yellow;
    if (parseFloat(duration) > 1000) durationColor = colors.red;
    
    console.log(`${colors.blue}[RESULT] ${name}:${colors.reset} ${durationColor}${duration}ms${colors.reset}`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`${colors.red}[ERROR] ${name}: ${error}${colors.reset}`);
    console.error(`Durée avant erreur: ${(end - start).toFixed(2)}ms`);
    throw error;
  }
}

/**
 * Compte le nombre total de contrats dans la base de données
 */
async function countContracts(): Promise<number> {
  return await prisma.contract.count();
}

/**
 * Teste la pagination avec différentes tailles de page
 */
async function testPagination() {
  const pageSizes = [10, 20, 50, 100];
  
  for (const pageSize of pageSizes) {
    await timeExecution(`Pagination avec pageSize=${pageSize} (page 1)`, async () => {
      const response = await fetch(`${API_BASE_URL}/contracts?page=1&pageSize=${pageSize}`);
      const data = await response.json();
      console.log(`  → ${data.data.length} contrats retournés sur ${data.pagination.totalCount} au total`);
      return data;
    });
  }
  
  // Tester plusieurs pages pour un pageSize donné
  const pageSize = 20;
  const pages = [1, 2, 5, 10, 25];
  
  for (const page of pages) {
    // Ne tester que si la page existe
    const totalContracts = await countContracts();
    const totalPages = Math.ceil(totalContracts / pageSize);
    
    if (page <= totalPages) {
      await timeExecution(`Pagination avec page=${page} (pageSize=${pageSize})`, async () => {
        const response = await fetch(`${API_BASE_URL}/contracts?page=${page}&pageSize=${pageSize}`);
        const data = await response.json();
        console.log(`  → Page ${page}/${data.pagination.totalPages}`);
        return data;
      });
    }
  }
}

/**
 * Teste les performances de recherche
 */
async function testSearch() {
  const searchTerms = [
    'Contrat',
    'Service',
    'Confidentiel',
    'ABCXYZ123', // Terme qui ne devrait pas exister
    'Partenariat',
  ];
  
  for (const term of searchTerms) {
    await timeExecution(`Recherche avec term="${term}"`, async () => {
      const response = await fetch(`${API_BASE_URL}/contracts?search=${encodeURIComponent(term)}`);
      const data = await response.json();
      console.log(`  → ${data.data.length} résultats trouvés`);
      return data;
    });
  }
}

/**
 * Teste les performances des filtres
 */
async function testFilters() {
  // Tester différents statuts
  const statuses = ['draft', 'active', 'terminated', 'expired'];
  
  for (const status of statuses) {
    await timeExecution(`Filtre par status="${status}"`, async () => {
      const response = await fetch(`${API_BASE_URL}/contracts?status=${status}`);
      const data = await response.json();
      console.log(`  → ${data.data.length} contrats avec status=${status}`);
      return data;
    });
  }
  
  // Tester différents types de contrat
  const contractTypes = ['employment', 'service', 'nda', 'partnership', 'other'];
  
  for (const type of contractTypes) {
    await timeExecution(`Filtre par contractType="${type}"`, async () => {
      const response = await fetch(`${API_BASE_URL}/contracts?contractType=${type}`);
      const data = await response.json();
      console.log(`  → ${data.data.length} contrats de type ${type}`);
      return data;
    });
  }
  
  // Combiner différents filtres
  await timeExecution(`Combinaison de filtres: status=active, contractType=service`, async () => {
    const response = await fetch(`${API_BASE_URL}/contracts?status=active&contractType=service`);
    const data = await response.json();
    console.log(`  → ${data.data.length} contrats correspondants`);
    return data;
  });
  
  await timeExecution(`Combinaison de filtres avec recherche: status=active, search=partenariat`, async () => {
    const response = await fetch(`${API_BASE_URL}/contracts?status=active&search=${encodeURIComponent('partenariat')}`);
    const data = await response.json();
    console.log(`  → ${data.data.length} contrats correspondants`);
    return data;
  });
}

/**
 * Teste les performances de tri
 */
async function testSorting() {
  const sortFields = ['createdAt', 'title', 'status', 'startDate'];
  const sortOrders = ['asc', 'desc'];
  
  for (const field of sortFields) {
    for (const order of sortOrders) {
      await timeExecution(`Tri par ${field} (${order})`, async () => {
        const response = await fetch(`${API_BASE_URL}/contracts?sortBy=${field}&sortOrder=${order}`);
        const data = await response.json();
        console.log(`  → ${data.data.length} contrats triés`);
        return data;
      });
    }
  }
}

/**
 * Teste les performances de récupération d'un contrat unique
 */
async function testGetSingleContract() {
  // Récupérer un ID de contrat aléatoire
  const contracts = await prisma.contract.findMany({
    select: { id: true },
    take: 1,
    skip: Math.floor(Math.random() * await countContracts()),
  });
  
  if (contracts.length > 0) {
    const contractId = contracts[0].id;
    
    await timeExecution(`Récupération d'un contrat unique (id=${contractId})`, async () => {
      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`);
      const data = await response.json();
      console.log(`  → Contrat "${data.data.title}" récupéré`);
      return data;
    });
  }
}

/**
 * Fonction principale qui exécute tous les tests
 */
async function runPerformanceTests() {
  try {
    console.log(`${colors.cyan}==========================================${colors.reset}`);
    console.log(`${colors.cyan}= TESTS DE PERFORMANCE - API CONTRACTS =${colors.reset}`);
    console.log(`${colors.cyan}==========================================${colors.reset}`);
    
    // Vérifier qu'il y a suffisamment de contrats pour tester
    const contractCount = await countContracts();
    console.log(`${colors.blue}[INFO] Nombre total de contrats: ${contractCount}${colors.reset}`);
    
    if (contractCount < 500) {
      console.warn(`${colors.yellow}[WARN] Moins de 500 contrats trouvés. Les résultats peuvent ne pas être représentatifs d'un environnement en production.${colors.reset}`);
    }
    
    // Exécuter les tests
    console.log(`\n${colors.cyan}== Test de pagination ==${colors.reset}`);
    await testPagination();
    
    console.log(`\n${colors.cyan}== Test de recherche ==${colors.reset}`);
    await testSearch();
    
    console.log(`\n${colors.cyan}== Test de filtrage ==${colors.reset}`);
    await testFilters();
    
    console.log(`\n${colors.cyan}== Test de tri ==${colors.reset}`);
    await testSorting();
    
    console.log(`\n${colors.cyan}== Test de récupération d'un contrat unique ==${colors.reset}`);
    await testGetSingleContract();
    
    console.log(`\n${colors.green}✅ Tous les tests sont terminés.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Erreur lors de l'exécution des tests: ${error}${colors.reset}`);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter les tests
runPerformanceTests(); 