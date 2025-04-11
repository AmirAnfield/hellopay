# Services

Cette documentation décrit les services disponibles dans l'application HelloPay.

## Introduction

Les services sont des modules qui encapsulent la logique d'accès aux données et les opérations métier. Ils fournissent une interface cohérente pour interagir avec le backend (Firebase).

## Organisation

Les services sont organisés par domaine fonctionnel :

- **Authentication** : Gestion des utilisateurs et de l'authentification 
- **Firestore** : Opérations CRUD sur la base de données
- **Storage** : Gestion des fichiers (upload, download, suppression)
- **Contrats** : Gestion des contrats de travail
- **Employés** : Gestion des employés
- **Entreprises** : Gestion des entreprises
- **Documents** : Génération et gestion des documents administratifs
- **Certificats** : Génération de certificats 

## Services principaux

### 1. auth-service.ts

Service pour l'authentification et la gestion des utilisateurs.

```typescript
// Connexion avec email/mot de passe
loginWithEmailPassword(email: string, password: string): Promise<User>

// Inscription d'un nouvel utilisateur
registerUser(email: string, password: string, userData: UserData): Promise<User>

// Déconnexion
logout(): Promise<void>

// Récupération du profil utilisateur
getUserProfile(userId: string): Promise<UserProfile>
```

### 2. firestore-service.ts

Service générique pour les opérations Firestore.

```typescript
// Récupère un document
getDocument<T>(path: string): Promise<T | null>

// Récupère une collection
getCollection<T>(path: string, options?: QueryOptions): Promise<T[]>

// Ajoute un document
addDocument<T>(path: string, data: T): Promise<string>

// Met à jour un document
updateDocument<T>(path: string, data: Partial<T>): Promise<void>

// Supprime un document
deleteDocument(path: string): Promise<void>
```

### 3. storage-service.ts

Service pour la gestion des fichiers dans Firebase Storage.

```typescript
// Upload d'un fichier
uploadFile(path: string, file: File): Promise<string>

// Récupération d'une URL de téléchargement
getDownloadUrl(path: string): Promise<string>

// Suppression d'un fichier
deleteFile(path: string): Promise<void>
```

### 4. contract-articles-service.ts

Service pour la génération et la gestion des articles de contrat.

```typescript
// Génère les articles d'un contrat
generateArticles(contractData: ContractData): ContractArticles

// Valide le contenu d'un contrat
validateContract(contractData: ContractData): ValidationResult
```

### 5. pdf-generation-service.ts

Service pour la génération de documents PDF.

```typescript
// Génère un PDF à partir d'un élément HTML
generateOptimizedPDF(element: HTMLElement): Promise<PDFCompatible | null>

// Ajoute un filigrane au PDF
addWatermarkToPDF(pdfBuffer: ArrayBuffer, watermarkText: string): Promise<Uint8Array>

// Compresse un PDF
compressPDF(pdfBuffer: ArrayBuffer): Promise<Uint8Array>
```

### 6. employee-service.ts

Service pour la gestion des employés.

```typescript
// Récupère tous les employés d'un utilisateur
getUserEmployees(userId?: string): Promise<Employee[]>

// Récupère les détails d'un employé
getEmployeeDetails(employeeId: string, userId?: string): Promise<Employee | null>

// Récupère les employés d'une entreprise
getCompanyEmployees(companyId: string, userId?: string): Promise<Employee[]>

// Crée un nouvel employé
createEmployee(employeeData: EmployeeInput, userId?: string): Promise<string>

// Met à jour un employé
updateEmployee(employeeId: string, employeeData: Partial<EmployeeInput>, userId?: string): Promise<void>

// Supprime un employé
deleteEmployee(employeeId: string, userId?: string): Promise<void>
```

### 7. company-service.ts

Service pour la gestion des entreprises.

```typescript
// Récupère toutes les entreprises d'un utilisateur
getUserCompanies(userId?: string): Promise<Company[]>

// Récupère les détails d'une entreprise
getCompanyDetails(companyId: string, userId?: string): Promise<Company | null>

// Crée une nouvelle entreprise
createCompany(companyData: CompanyInput, userId?: string): Promise<string>

// Met à jour une entreprise
updateCompany(companyId: string, companyData: Partial<CompanyInput>, userId?: string): Promise<void>

// Supprime une entreprise
deleteCompany(companyId: string, userId?: string): Promise<void>
```

## Bonnes pratiques

### Utilisation des services

1. **Import centralisé** : Toujours importer les services depuis `services/index.ts`
2. **Gestion des erreurs** : Utiliser try/catch pour gérer les erreurs des services
3. **Logs** : Logger les erreurs pour faciliter le débogage

### Création de nouveaux services

1. **Nommage cohérent** : Utiliser le format `domain-service.ts`
2. **Documentation** : Documenter clairement les fonctions exportées
3. **Tests** : Créer des tests pour chaque fonction importante
4. **Index** : Exporter le service depuis `services/index.ts`

## Exemples d'utilisation

### Dans un composant React

```tsx
import { useState, useEffect } from 'react';
import { EmployeeService } from '@/services';

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadEmployees() {
      try {
        const data = await EmployeeService.getUserEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Failed to load employees:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadEmployees();
  }, []);
  
  // ...
}
```

### Dans un hook personnalisé

```tsx
import { useState, useCallback } from 'react';
import { CompanyService } from '@/services';

export function useCompanies() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const loadCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await CompanyService.getUserCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { companies, isLoading, error, loadCompanies };
}
``` 