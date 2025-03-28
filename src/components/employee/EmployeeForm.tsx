"use client";

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
  address: z.string().min(1, 'L\'adresse est requise'),
  postalCode: z.string().min(5, 'Le code postal est requis'),
  city: z.string().min(1, 'La ville est requise'),
  country: z.string().default('France'),
  socialSecurityNumber: z.string().min(13, 'Le numéro de sécurité sociale doit comporter au moins 13 caractères'),
  position: z.string().min(1, 'Le poste est requis'),
  department: z.string().min(1, 'Le département est requis'),
  hireDate: z.string().min(1, 'La date d\'embauche est requise'),
  contractType: z.string().min(1, 'Le type de contrat est requis'),
  baseSalary: z.string().min(1, 'Le salaire de base est requis'),
  iban: z.string().min(1, 'L\'IBAN est requis'),
  bic: z.string().min(8, 'Le BIC doit contenir au moins 8 caractères'),
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
    formState: { errors },
    watch,
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birthDate: '',
      address: '',
      postalCode: '',
      city: '',
      country: 'France',
      socialSecurityNumber: '',
      position: '',
      department: '',
      hireDate: '',
      contractType: 'CDI',
      baseSalary: '',
      iban: '',
      bic: '',
    },
  });
  
  const processSubmit = (data: EmployeeFormValues) => {
    onSubmit(data);
  };
  
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                placeholder="Prénom"
                {...register("firstName")}
              />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                placeholder="Nom"
                {...register("lastName")}
              />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthDate">Date de naissance *</Label>
              <Input
                id="birthDate"
                type="date"
                {...register("birthDate")}
              />
              {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="socialSecurityNumber">Numéro de sécurité sociale *</Label>
              <Input
                id="socialSecurityNumber"
                placeholder="Numéro de sécurité sociale"
                {...register("socialSecurityNumber")}
              />
              {errors.socialSecurityNumber && <p className="text-sm text-red-500">{errors.socialSecurityNumber.message}</p>}
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
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                placeholder="Téléphone"
                {...register("phone")}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                placeholder="Adresse"
                {...register("address")}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal *</Label>
              <Input
                id="postalCode"
                placeholder="Code postal"
                {...register("postalCode")}
              />
              {errors.postalCode && <p className="text-sm text-red-500">{errors.postalCode.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                placeholder="Ville"
                {...register("city")}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
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
              />
              {errors.position && <p className="text-sm text-red-500">{errors.position.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Département *</Label>
              <Input
                id="department"
                placeholder="Département"
                {...register("department")}
              />
              {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hireDate">Date d&apos;embauche *</Label>
              <Input
                id="hireDate"
                type="date"
                {...register("hireDate")}
              />
              {errors.hireDate && <p className="text-sm text-red-500">{errors.hireDate.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contractType">Type de contrat *</Label>
              <Select
                onValueChange={(value) => setValue('contractType', value)}
                defaultValue={watch('contractType')}
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
              {errors.contractType && <p className="text-sm text-red-500">{errors.contractType.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="baseSalary">Salaire de base *</Label>
              <Input
                id="baseSalary"
                placeholder="Salaire de base"
                {...register("baseSalary")}
              />
              {errors.baseSalary && <p className="text-sm text-red-500">{errors.baseSalary.message}</p>}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="banking" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="iban">IBAN *</Label>
              <Input
                id="iban"
                placeholder="IBAN"
                {...register("iban")}
              />
              {errors.iban && <p className="text-sm text-red-500">{errors.iban.message}</p>}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bic">BIC *</Label>
              <Input
                id="bic"
                placeholder="BIC"
                {...register("bic")}
              />
              {errors.bic && <p className="text-sm text-red-500">{errors.bic.message}</p>}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">Annuler</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
} 