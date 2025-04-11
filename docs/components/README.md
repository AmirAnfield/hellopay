# Composants

Cette documentation décrit les principaux composants de l'application HelloPay.

## Introduction

Les composants React sont les blocs de construction de l'interface utilisateur. Ils sont organisés en différentes catégories selon leur fonction et leur niveau de réutilisabilité.

## Organisation des composants

Les composants sont organisés comme suit :

```
/components
├── ui/               # Composants UI de base réutilisables
├── contract-template/ # Composants liés aux contrats
├── employee/        # Composants liés aux employés
├── enterprise/      # Composants liés aux entreprises
├── payslip/         # Composants liés aux bulletins de paie
├── documents/       # Composants liés aux documents administratifs
├── auth/            # Composants liés à l'authentification
├── shared/          # Composants partagés réutilisables
└── dashboard/       # Composants spécifiques au tableau de bord
```

## Composants UI

Les composants UI sont des composants de base hautement réutilisables qui servent de fondation pour construire l'interface utilisateur.

### Button

Bouton personnalisable avec différentes variantes et tailles.

```tsx
<Button 
  variant="default" // default, outline, ghost, link
  size="default"    // default, sm, lg
  onClick={handleClick}
  disabled={isLoading}
>
  Texte du bouton
</Button>
```

### Input

Champ de saisie de texte.

```tsx
<Input 
  type="text"
  placeholder="Saisir une valeur"
  value={value}
  onChange={handleChange}
  disabled={isDisabled}
/>
```

### Card

Conteneur pour organiser des informations associées.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Titre de la carte</CardTitle>
    <CardDescription>Description de la carte</CardDescription>
  </CardHeader>
  <CardContent>
    Contenu principal
  </CardContent>
  <CardFooter>
    Actions ou informations supplémentaires
  </CardFooter>
</Card>
```

### Form

Ensemble de composants pour construire des formulaires.

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nom d'utilisateur</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Soumettre</Button>
  </form>
</Form>
```

## Composants de contrat

### ContractFormPage

Composant principal pour la création et l'édition de contrats de travail.

```tsx
<ContractFormPage
  initialData={contractData}
  onSave={handleSave}
/>
```

### ContractTemplate

Composant d'affichage du contrat au format A4.

```tsx
<ContractTemplate
  data={contractData}
  showWatermark={isDraft}
/>
```

## Composants d'employé

### EmployeeForm

Formulaire de création et d'édition d'employé.

```tsx
<EmployeeForm
  employee={existingEmployee}
  onSubmit={handleSubmit}
  isLoading={isSubmitting}
/>
```

### EmployeeList

Liste des employés avec fonctionnalités de filtrage et de pagination.

```tsx
<EmployeeList
  companyId={companyId}
  onEmployeeSelect={handleEmployeeSelect}
/>
```

## Composants d'entreprise

### CompanyForm

Formulaire de création et d'édition d'entreprise.

```tsx
<CompanyForm
  company={existingCompany}
  onSubmit={handleSubmit}
  isLoading={isSubmitting}
/>
```

### CompanySelector

Sélecteur d'entreprise avec mise en cache.

```tsx
<CompanySelector
  value={selectedCompanyId}
  onChange={handleCompanyChange}
/>
```

## Composants de bulletin de paie

### PayslipForm

Formulaire de création de bulletin de paie.

```tsx
<PayslipForm
  employeeId={employeeId}
  initialData={payslipData}
  onSubmit={handleSubmit}
/>
```

### PayslipPreview

Aperçu du bulletin de paie au format PDF.

```tsx
<PayslipPreview
  data={payslipData}
  watermark={isDraft}
/>
```

## Composants d'authentification

### AuthGuard

Protège les routes qui nécessitent une authentification.

```tsx
<AuthGuard>
  <ProtectedComponent />
</AuthGuard>
```

### LoginForm

Formulaire de connexion.

```tsx
<LoginForm
  onSuccess={handleLoginSuccess}
  redirectTo="/dashboard"
/>
```

### RegisterForm

Formulaire d'inscription.

```tsx
<RegisterForm
  onSuccess={handleRegisterSuccess}
  redirectTo="/dashboard"
/>
```

## Bonnes pratiques

### Création de composants

1. **Responsabilité unique** : Chaque composant doit avoir une responsabilité unique et bien définie
2. **Props clairement définies** : Utiliser TypeScript pour définir les props attendues
3. **Composants contrôlés** : Externaliser l'état lorsque c'est possible
4. **Nommage cohérent** : Utiliser PascalCase pour les noms de composants
5. **Tests** : Créer des tests pour les comportements critiques

### Exemple de structure de composant

```tsx
import React from 'react';
import { Button } from '@/components/ui/button';

// Définition des props avec TypeScript
interface MyComponentProps {
  title: string;
  description?: string;
  onAction: () => void;
  isLoading?: boolean;
}

/**
 * MyComponent - Description du composant
 * 
 * @example
 * <MyComponent
 *   title="Mon titre"
 *   onAction={() => console.log('Action')}
 * />
 */
export function MyComponent({
  title,
  description,
  onAction,
  isLoading = false
}: MyComponentProps) {
  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="mt-2 text-gray-600">{description}</p>}
      <Button
        onClick={onAction}
        disabled={isLoading}
        className="mt-4"
      >
        {isLoading ? 'Chargement...' : 'Action'}
      </Button>
    </div>
  );
}
```

### Composition de composants

Privilégier la composition plutôt que l'héritage pour réutiliser le code :

```tsx
function ProfileCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <Avatar src={user.avatarUrl} />
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <UserDetails user={user} />
      </CardContent>
      <CardFooter>
        <UserActions user={user} />
      </CardFooter>
    </Card>
  );
}
```

## Optimisation des performances

### Memoïsation

Utiliser `React.memo`, `useMemo` et `useCallback` pour éviter les rendus inutiles :

```tsx
// Composant memoïsé
const MemoizedComponent = React.memo(function MyComponent({ value, onChange }) {
  // ...
});

// Dans un composant parent
function Parent() {
  // Fonction callback memoïsée
  const handleChange = useCallback((newValue) => {
    // ...
  }, [/* dépendances */]);
  
  // Valeur memoïsée
  const processedValue = useMemo(() => {
    return expensiveComputation(value);
  }, [value]);
  
  return <MemoizedComponent value={processedValue} onChange={handleChange} />;
}
```

### Code Splitting

Utiliser le chargement paresseux pour les composants volumineux :

```tsx
import { lazy, Suspense } from 'react';

// Chargement paresseux du composant
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
``` 