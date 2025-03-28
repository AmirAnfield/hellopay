import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Composants UI
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Schéma de validation Zod
const employeeSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(1, 'Le téléphone est requis'),
  birthDate: z.string().min(1, 'La date de naissance est requise'),
  address: z.object({
    street: z.string().min(1, 'La rue est requise'),
    zipCode: z.string().min(5, 'Le code postal est requis'),
    city: z.string().min(1, 'La ville est requise'),
    country: z.string().min(1, 'Le pays est requis'),
  }),
  socialSecurityNumber: z.string().min(13, 'Le numéro de sécurité sociale doit comporter au moins 13 caractères'),
  position: z.string().min(1, 'Le poste est requis'),
  department: z.string().min(1, 'Le département est requis'),
  hireDate: z.string().min(1, 'La date d\'embauche est requise'),
  contractType: z.enum(['cdi', 'cdd', 'intern', 'apprentice', 'freelance'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un type de contrat valide' }),
  }),
  salary: z.object({
    base: z.string().min(1, 'Le salaire de base est requis'),
    frequency: z.enum(['hourly', 'monthly', 'yearly'], {
      errorMap: () => ({ message: 'Veuillez sélectionner une fréquence valide' }),
    }),
    currency: z.string().min(1, 'La devise est requise'),
  }),
  bankInfo: z.object({
    iban: z.string().min(1, 'L\'IBAN est requis'),
    bic: z.string().min(8, 'Le BIC doit contenir au moins 8 caractères'),
  }),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  initialData?: Partial<EmployeeFormValues>;
  onSubmit: (data: EmployeeFormValues) => void;
  isLoading?: boolean;
}

export function EmployeeForm({ 
  initialData, 
  onSubmit, 
  isLoading = false 
}: EmployeeFormProps) {
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: '',
      address: {
        street: '',
        zipCode: '',
        city: '',
        country: 'France',
      },
      socialSecurityNumber: '',
      position: '',
      department: '',
      hireDate: '',
      contractType: 'cdi',
      salary: {
        base: '',
        frequency: 'monthly',
        currency: 'EUR',
      },
      bankInfo: {
        iban: '',
        bic: '',
      },
    },
  });
  
  const processSubmit = (data: EmployeeFormValues) => {
    onSubmit(data);
  };
  
  const contractType = watch('contractType');
  
  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-8">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
          <TabsTrigger value="contact">Coordonnées</TabsTrigger>
          <TabsTrigger value="professional">Informations professionnelles</TabsTrigger>
          <TabsTrigger value="banking">Informations bancaires</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-700 text-lg border-b pb-2">Informations personnelles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom*
                </label>
                <input
                  id="firstName"
                  type="text"
                  className={`w-full p-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('firstName')}
                />
                {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
              </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                placeholder="Prénom"
                {...register("firstName")}
                error={errors.firstName?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                placeholder="Nom"
                {...register("lastName")}
                error={errors.lastName?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthDate">Date de naissance *</Label>
              <Input
                id="birthDate"
                type="date"
                {...register("birthDate")}
                error={errors.birthDate?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="socialSecurityNumber">Numéro de sécurité sociale *</Label>
              <Input
                id="socialSecurityNumber"
                placeholder="Numéro de sécurité sociale"
                {...register("socialSecurityNumber")}
                error={errors.socialSecurityNumber?.message}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                placeholder="Téléphone"
                {...register("phone")}
                error={errors.phone?.message}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                placeholder="Adresse"
                {...register("address")}
                error={errors.address?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal *</Label>
              <Input
                id="postalCode"
                placeholder="Code postal"
                {...register("postalCode")}
                error={errors.postalCode?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                placeholder="Ville"
                {...register("city")}
                error={errors.city?.message}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="professional" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Fonction *</Label>
              <Input
                id="position"
                placeholder="Fonction"
                {...register("position")}
                error={errors.position?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contractType">Type de contrat *</Label>
              <Select
                onValueChange={(value) => setValue('contractType', value as 'CDI' | 'CDD' | 'Intérim' | 'Stage' | 'Alternance')}
                defaultValue={initialData?.contractType}
              >
                <SelectTrigger id="contractType">
                  <SelectValue placeholder="Sélectionner un type de contrat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="Intérim">Intérim</SelectItem>
                  <SelectItem value="Stage">Stage</SelectItem>
                  <SelectItem value="Alternance">Alternance</SelectItem>
                </SelectContent>
              </Select>
              {errors.contractType?.message && (
                <p className="text-red-500 text-xs mt-1">{errors.contractType?.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Date de début de contrat *</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                error={errors.startDate?.message}
              />
            </div>
            
            {(contractType === 'CDD' || contractType === 'Intérim' || contractType === 'Stage') && (
              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin de contrat *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  error={errors.endDate?.message}
                />
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="banking" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                placeholder="IBAN"
                {...register("iban")}
                error={errors.iban?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bic">BIC/SWIFT</Label>
              <Input
                id="bic"
                placeholder="BIC/SWIFT"
                {...register("bic")}
                error={errors.bic?.message}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Enregistrement..." : initialData?.firstName ? "Mettre à jour" : "Ajouter l'employé"}
        </Button>
      </div>
    </form>
  );
} 