# Architecture de typage | MVP 0.24

## 📋 Vue d'ensemble

L'architecture de typage du MVP 0.24 implémente une approche centralisée pour définir, partager et maintenir les types entre le frontend et le backend. Cette architecture assure la cohérence des données à travers toute l'application, renforce le typage statique et améliore l'expérience de développement.

## 🏛️ Structure des types

```
src/
  lib/
    types/                       # Répertoire central pour tous les types
      index.ts                   # Export centralisé de tous les types
      
      shared/                    # Types partagés génériques
        api.ts                   # Types pour les réponses API standardisées
        
      auth/                      # Types liés à l'authentification
        user.ts                  # Types d'utilisateur et authentification
        
      companies/                 # Types liés aux entreprises
        company.ts               # Types d'entreprise
        
      employees/                 # Types liés aux employés
        employee.ts              # Types d'employé
        
      payslips/                  # Types liés aux bulletins de paie
        payslip.ts               # Types de bulletin de paie
        
    validators/                  # Schémas de validation (Zod)
      employee-v2.ts             # Schémas Zod basés sur les types partagés
      
    api/                         # Services API typés
      employees.ts               # Service API pour les employés
      
  hooks/                         # Hooks React typés
    useEmployees.ts              # Hook pour la gestion des employés
    
  components/                    # Composants typés
    employee/                    # Composants liés aux employés
      EmployeeDetails.tsx        # Composant d'affichage des détails d'un employé
      EmployeeList.tsx           # Composant de liste des employés
```

## 🔄 Flux de données typé

L'architecture assure un flux de données cohérent à travers toute l'application :

1. **Modèles de données de base**
   - Types partagés qui définissent la structure des entités (User, Company, Employee, Payslip)
   - Ces types sont utilisés par le frontend et le backend

2. **Validation avec Zod**
   - Les schémas Zod sont définis en utilisant les types partagés
   - Génération de types TypeScript à partir des schémas Zod
   - Validation cohérente côté client et serveur

3. **API et transfert de données**
   - DTO (Data Transfer Objects) typés pour les requêtes et réponses
   - Réponses API standardisées (succès, erreur, pagination)
   - Services API fortement typés

4. **Composants et hooks React**
   - Hooks personnalisés utilisant les types partagés
   - Props des composants typées avec les interfaces partagées
   - Inférence de type automatique

## 🧩 Exemples d'utilisation

### Type de base et ses dérivés

```typescript
// Type de base pour les employés
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  // ...autres propriétés
}

// Type étendu pour le modèle de base de données
export interface EmployeeModel extends Employee {
  createdAt: Date;
  updatedAt: Date;
  // ...propriétés supplémentaires
}

// DTO pour les requêtes de création
export type EmployeeCreateRequestDTO = Omit<EmployeeModel, 'id' | 'createdAt' | 'updatedAt'>;

// DTO pour les réponses API
export interface EmployeeResponseDTO extends Employee {
  // ...données additionnelles pour les réponses
}
```

### Schéma de validation Zod

```typescript
import { z } from 'zod';
import type { EmployeeCreateRequestDTO } from '../types/employees/employee';

// Le schéma Zod avec indication du type attendu
export const employeeCreateSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit comporter au moins 2 caractères"),
  // ...autres validations
}) satisfies z.ZodType<Omit<EmployeeCreateRequestDTO, 'id'>>;

// Type inféré du schéma Zod
export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
```

### Service API typé

```typescript
import { EmployeeResponseDTO, EmployeeCreateRequestDTO } from '../types/employees/employee';
import { ApiSuccessResponse } from '../types/shared/api';

// Fonction API typée
export async function createEmployee(
  employee: EmployeeCreateRequestDTO
): Promise<ApiSuccessResponse<EmployeeResponseDTO>> {
  // Implémentation...
}
```

### Hook React typé

```typescript
import { useState } from 'react';
import type { EmployeeResponseDTO } from '@/lib/types/employees/employee';

export function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeResponseDTO[]>([]);
  // ...implémentation
  
  return {
    employees,
    // ...autres valeurs et fonctions
  };
}
```

### Composant React typé

```typescript
import type { EmployeeResponseDTO } from '@/lib/types/employees/employee';

interface EmployeeDetailsProps {
  employee: EmployeeResponseDTO;
  onEdit?: () => void;
}

export function EmployeeDetails({ employee, onEdit }: EmployeeDetailsProps) {
  // Implémentation...
}
```

## 📊 Avantages

1. **Cohérence** : Types uniformes entre le frontend et le backend
2. **Maintenabilité** : Changement centralisé des types
3. **Inférence** : Autocomplétion et vérification de type dans l'IDE
4. **Documentation implicite** : Les types servent de documentation
5. **Refactoring sécurisé** : Détection des erreurs à la compilation
6. **Évolution progressive** : Possibilité d'ajouter des types au fur et à mesure

## 🔜 Prochaines étapes

1. **Génération de documentation** : Configuration de TypeDoc
2. **Tests de type** : Ajouter des tests spécifiques aux types
3. **Migration complète** : Convertir tous les composants et API
4. **Génération d'API** : Explorer les outils comme tRPC pour une génération automatique d'API typées 