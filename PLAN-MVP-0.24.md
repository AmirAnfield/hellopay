# Plan MVP 0.24 - Uniformisation du typage Front-End / Back-End

## 📋 Objectifs

Le MVP 0.24 se concentrera sur l'amélioration de la robustesse du code par l'uniformisation des types entre le frontend et le backend, pour:

1. Réduire les erreurs à l'exécution liées à des incohérences de typage
2. Améliorer l'expérience de développement par l'autocomplétion et la validation
3. Faciliter la maintenance et l'évolution des fonctionnalités
4. Améliorer la documentation automatique du code

## 🚀 Phases d'implémentation

### Phase 1: Analyse et cartographie des types existants

1. **Recensement de tous les types partagés**
   - Modèles de données (User, Company, Employee, Payslip, etc.)
   - DTO (Data Transfer Objects) dans les requêtes/réponses API
   - Formulaires et schémas de validation

2. **Création d'une matrice de types**
   - Type | Front-End | Back-End | API Contract | Cohérence
   - Identification des incohérences et des doublons

3. **Analyse des dépendances et des cycles de vie de données**
   - Parcours complet des données de la saisie utilisateur à la persistance
   - Transformations subies par les données à chaque étape

### Phase 2: Conception de l'architecture de typage

1. **Établissement d'une stratégie de types partagés**
   - Création d'un répertoire `src/lib/types` pour les types partagés
   - Organisation par domaine (auth, employees, payslips, etc.)
   - Définition des interfaces vs. types vs. enums

2. **Définition des conventions de nommage**
   - Modèles: `EntityName`
   - DTO: `EntityNameDTO`
   - Requêtes API: `EntityNameRequestDTO`
   - Réponses API: `EntityNameResponseDTO`
   - Types pour les formulaires: `EntityNameFormData`

3. **Définition de l'approche de validation de schéma**
   - Utilisation de Zod pour dériver les types TypeScript
   - Partage des schémas Zod entre le front et le back

### Phase 3: Implémentation

1. **Création des types partagés**
   - `src/lib/types/shared/index.ts` - Export des types communs
   - Types par domaine fonctionnel

2. **Uniformisation par module**
   * **Authentication**
     - `types/auth/user.ts`
     - `types/auth/session.ts`
     - `types/auth/credentials.ts`

   * **Entreprises**
     - `types/companies/company.ts`
     - `types/companies/dtos.ts`

   * **Employés**
     - `types/employees/employee.ts`
     - `types/employees/dtos.ts`
     - `types/employees/forms.ts`

   * **Bulletins de paie**
     - `types/payslips/payslip.ts`
     - `types/payslips/calculation.ts`
     - `types/payslips/dtos.ts`
     - `types/payslips/forms.ts`

   * **API**
     - `types/api/pagination.ts`
     - `types/api/responses.ts`
     - `types/api/errors.ts`

3. **Intégration des types dans les composants et API**
   - Refactorisation progressive de chaque module

4. **Ajout de types pour les réponses API standardisées**
   - Extension du fichier `api-response.ts` pour utiliser les DTOs typés

### Phase 4: Tests et validation

1. **Tests de typage statique**
   - Ajout de tests TypeScript spécifiques (`dtslint` ou `tsd`)
   - Vérification d'absence d'erreurs `any` ou `unknown`

2. **Tests d'intégration API**
   - Validation des contrats d'API entre front et back
   - Tests de sérialisation/désérialisation

3. **Documentation générée**
   - Configuration de TypeDoc pour générer une documentation des types
   - Lien avec la documentation Swagger/OpenAPI des API

## 📊 Matrice des types partagés (template)

| Entité | Backend Model | Frontend Model | Request DTO | Response DTO | Form Data | Schéma Zod |
|--------|--------------|----------------|-------------|--------------|-----------|------------|
| User   | `User`       | `User`         | `LoginDTO`  | `UserDTO`    | `LoginFormData` | `userSchema` |
| Company| `Company`    | `Company`      | `CompanyRequestDTO` | `CompanyResponseDTO` | `CompanyFormData` | `companySchema` |
| Employee| `Employee`  | `Employee`     | `EmployeeRequestDTO`| `EmployeeResponseDTO`| `EmployeeFormData`| `employeeSchema`|
| Payslip| `Payslip`    | `Payslip`      | `PayslipRequestDTO` | `PayslipResponseDTO` | `PayslipFormData` | `payslipSchema` |

## 🛠️ Implémentation détaillée (exemple)

### Exemple pour le module Employee

```typescript
// src/lib/types/employees/employee.ts
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  position: string;
  contractType: 'CDI' | 'CDD' | 'Alternance' | 'Stage' | 'Intérim';
  startDate: string;
  endDate?: string;
  socialSecurityNumber: string;
  // ... autres champs communs
}

// Champs spécifiques au modèle backend (Prisma)
export interface EmployeeModel extends Employee {
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  // Champs spécifiques à l'implémentation backend
}

// DTO pour les requêtes de création/mise à jour
export interface EmployeeRequestDTO extends Omit<Employee, 'id'> {
  companyId: string;
  // Autres champs nécessaires à la création/update
}

// DTO pour les réponses
export interface EmployeeResponseDTO extends Employee {
  company?: {
    id: string;
    name: string;
  };
  // Champs additionnels pour les réponses API
}

// Types pour les formulaires
export interface EmployeeFormData extends Omit<EmployeeRequestDTO, 'startDate' | 'endDate'> {
  startDate: string; // Format yyyy-MM-dd pour les inputs date HTML
  endDate: string;   // Format yyyy-MM-dd pour les inputs date HTML
  // Autres champs spécifiques aux formulaires
}
```

## 📅 Planning

| Semaine | Tâches |
|---------|--------|
| Semaine 1 | Analyse et cartographie des types / Création de la matrice |
| Semaine 2 | Conception de l'architecture / Définition des conventions |
| Semaine 3 | Implémentation des types partagés et refactorisation Auth et Companies |
| Semaine 4 | Refactorisation Employees et Payslips |
| Semaine 5 | Tests et validation / Documentation |

## 🔎 Bénéfices attendus

- Réduction des bugs liés au typage entre front et back
- Meilleure expérience développeur (autocomplétion, détection d'erreurs)
- Documentation du code plus claire et maintenable
- Base solide pour le développement de nouvelles fonctionnalités
- Facilitation de l'onboarding des nouveaux développeurs 