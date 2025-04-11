# Hooks personnalisés

Cette documentation décrit les hooks personnalisés disponibles dans l'application HelloPay.

## Introduction

Les hooks personnalisés permettent d'extraire et de réutiliser la logique d'état et d'effets à travers les composants. Ils améliorent la réutilisabilité du code et la séparation des préoccupations.

## Hooks principaux

### useAuth

Hook pour gérer l'authentification et l'état de l'utilisateur.

```tsx
const { 
  user,                // Utilisateur connecté ou null
  isLoading,           // État de chargement
  error,               // Erreur d'authentification
  login,               // Fonction de connexion
  logout,              // Fonction de déconnexion
  register,            // Fonction d'inscription
  resetPassword        // Fonction de réinitialisation du mot de passe
} = useAuth();
```

Exemple d'utilisation :
```tsx
import { useAuth } from '@/hooks';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  );
}
```

### useFirestoreDocument

Hook pour récupérer et observer un document Firestore.

```tsx
const {
  data,                // Données du document
  isLoading,           // État de chargement
  error                // Erreur éventuelle
} = useFirestoreDocument<T>(documentPath);
```

Exemple d'utilisation :
```tsx
import { useFirestoreDocument } from '@/hooks';

function EmployeeDetails({ employeeId }) {
  const { data: employee, isLoading, error } = useFirestoreDocument(
    `users/${userId}/employees/${employeeId}`
  );
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!employee) return <NotFound />;
  
  return (
    <div>
      <h1>{employee.firstName} {employee.lastName}</h1>
      {/* ... */}
    </div>
  );
}
```

### useFirestoreCollection

Hook pour récupérer et observer une collection Firestore.

```tsx
const {
  data,                // Tableau des documents
  isLoading,           // État de chargement
  error                // Erreur éventuelle
} = useFirestoreCollection<T>(collectionPath, options);
```

Exemple d'utilisation :
```tsx
import { useFirestoreCollection } from '@/hooks';

function EmployeeList() {
  const { data: employees, isLoading } = useFirestoreCollection(
    `users/${userId}/employees`
  );
  
  if (isLoading) return <Spinner />;
  
  return (
    <ul>
      {employees.map(employee => (
        <li key={employee.id}>{employee.firstName} {employee.lastName}</li>
      ))}
    </ul>
  );
}
```

### useFirestorePagination

Hook pour récupérer des données paginées depuis Firestore.

```tsx
const {
  data,                // Données paginées
  isLoading,           // État de chargement
  error,               // Erreur éventuelle
  hasMore,             // Si plus de données sont disponibles
  loadMore             // Fonction pour charger davantage de données
} = useFirestorePagination<T>(collectionPath, options);
```

Exemple d'utilisation :
```tsx
import { useFirestorePagination } from '@/hooks';

function PaginatedEmployeeList() {
  const { 
    data: employees, 
    isLoading, 
    hasMore, 
    loadMore 
  } = useFirestorePagination(
    `users/${userId}/employees`,
    { limit: 10, orderBy: 'lastName' }
  );
  
  return (
    <div>
      <ul>
        {employees.map(employee => (
          <li key={employee.id}>{employee.firstName} {employee.lastName}</li>
        ))}
      </ul>
      
      {hasMore && (
        <button 
          onClick={loadMore} 
          disabled={isLoading}
        >
          {isLoading ? 'Chargement...' : 'Charger plus'}
        </button>
      )}
    </div>
  );
}
```

### useCompanyEmployees

Hook pour récupérer les employés d'une entreprise.

```tsx
const {
  employees,           // Liste des employés
  isLoading,           // État de chargement
  error,               // Erreur éventuelle
  refresh              // Fonction pour rafraîchir les données
} = useCompanyEmployees(companyId);
```

Exemple d'utilisation :
```tsx
import { useCompanyEmployees } from '@/hooks';

function CompanyEmployeeList({ companyId }) {
  const { employees, isLoading, refresh } = useCompanyEmployees(companyId);
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <h2>Employés</h2>
        <button onClick={refresh}>Rafraîchir</button>
      </div>
      
      {isLoading ? (
        <Spinner />
      ) : (
        <ul>
          {employees.map(employee => (
            <li key={employee.id}>{employee.firstName} {employee.lastName}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### useCompanyCache

Hook pour mettre en cache et récupérer rapidement les entreprises de l'utilisateur.

```tsx
const {
  companies,           // Liste des entreprises en cache
  isLoading,           // État de chargement
  getCompany,          // Fonction pour récupérer une entreprise spécifique
  refreshCache         // Fonction pour rafraîchir le cache
} = useCompanyCache();
```

Exemple d'utilisation :
```tsx
import { useCompanyCache } from '@/hooks';

function CompanySelector({ onChange }) {
  const { companies, isLoading } = useCompanyCache();
  
  return (
    <select 
      disabled={isLoading}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">Sélectionner une entreprise</option>
      {companies.map(company => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </select>
  );
}
```

### useContractState

Hook pour gérer l'état d'un contrat en cours d'édition.

```tsx
const {
  contract,            // Données du contrat
  isLoading,           // État de chargement
  error,               // Erreur éventuelle
  updateContract,      // Mettre à jour les données du contrat
  saveContract,        // Sauvegarder le contrat
  generatePdf          // Générer un PDF du contrat
} = useContractState(contractId);
```

Exemple d'utilisation :
```tsx
import { useContractState } from '@/hooks';

function ContractEditor({ contractId }) {
  const { 
    contract, 
    isLoading, 
    updateContract, 
    saveContract 
  } = useContractState(contractId);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveContract();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      <input
        value={contract.title}
        onChange={e => updateContract({ title: e.target.value })}
      />
      
      <button type="submit" disabled={isLoading}>
        Sauvegarder
      </button>
    </form>
  );
}
```

## Création de hooks personnalisés

### Bonnes pratiques

1. **Nommage** : Utiliser le préfixe `use` (ex: `useCounter`, `useFormInput`)
2. **Responsabilité unique** : Chaque hook doit avoir une responsabilité unique et bien définie
3. **Abstraction** : Masquer la complexité tout en exposant une API simple et intuitive
4. **Gestion des erreurs** : Gérer les erreurs de manière cohérente
5. **Réutilisabilité** : Concevoir des hooks suffisamment génériques pour être réutilisés
6. **Performance** : Utiliser `useCallback` et `useMemo` pour éviter les rendus inutiles

### Modèle de base

```tsx
import { useState, useEffect, useCallback } from 'react';

export function useMyCustomHook(param) {
  // État local
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fonctions mémorisées
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Logique de récupération des données
      const result = await someAsyncOperation(param);
      setData(result);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, [param]);
  
  // Effets
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Valeur retournée
  return {
    data,
    isLoading,
    error,
    refresh: fetchData
  };
}
```

## Composition de hooks

Les hooks personnalisés peuvent être composés pour créer des hooks plus complexes :

```tsx
function useUserData(userId) {
  // Utilise un hook plus basique
  const { data, isLoading, error } = useFirestoreDocument(`users/${userId}`);
  
  // Ajoute de la logique supplémentaire
  const isAdmin = data?.role === 'admin';
  
  return {
    user: data,
    isLoading,
    error,
    isAdmin
  };
}
``` 