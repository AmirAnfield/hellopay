import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Composants UI
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Schéma de validation avec Zod
const enterpriseSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  siret: z.string().length(14, 'Le SIRET doit contenir 14 chiffres'),
  ape: z.string().min(1, 'Le code APE est requis'),
  address: z.object({
    street: z.string().min(1, 'La rue est requise'),
    zipCode: z.string().min(5, 'Le code postal est requis'),
    city: z.string().min(1, 'La ville est requise'),
    country: z.string().min(1, 'Le pays est requis'),
  }),
  contact: z.object({
    email: z.string().email('Email invalide'),
    phone: z.string().min(1, 'Le téléphone est requis'),
  }),
  legalForm: z.string().min(1, 'La forme juridique est requise'),
  taxId: z.string().min(1, "L'identifiant fiscal est requis"),
  socialSecurityNumber: z.string().min(1, 'Le numéro de sécurité sociale est requis'),
});

type EnterpriseFormValues = z.infer<typeof enterpriseSchema>;

interface EnterpriseFormProps {
  initialData?: Partial<EnterpriseFormValues>;
  onSubmit: (data: EnterpriseFormValues) => void;
}

export function EnterpriseForm({ initialData, onSubmit }: EnterpriseFormProps) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<EnterpriseFormValues>({
    resolver: zodResolver(enterpriseSchema),
    defaultValues: initialData || {
      name: '',
      siret: '',
      ape: '',
      address: {
        street: '',
        zipCode: '',
        city: '',
        country: 'France',
      },
      contact: {
        email: '',
        phone: '',
      },
      legalForm: '',
      taxId: '',
      socialSecurityNumber: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Informations générales</TabsTrigger>
          <TabsTrigger value="address">Adresse</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="banking">Informations bancaires</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l&apos;entreprise *</Label>
              <Input
                id="name"
                placeholder="Entrez le nom de l'entreprise"
                {...register("name")}
                error={errors.name?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siret">Numéro SIRET *</Label>
              <Input
                id="siret"
                placeholder="14 chiffres"
                {...register("siret")}
                error={errors.siret?.message}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ape">Code APE *</Label>
              <Input
                id="ape"
                placeholder="Code APE"
                {...register("ape")}
                error={errors.ape?.message}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="address" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="street">Rue *</Label>
              <Input
                id="street"
                placeholder="Rue"
                {...register("address.street")}
                error={errors.address?.street?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode">Code postal *</Label>
              <Input
                id="zipCode"
                placeholder="Code postal"
                {...register("address.zipCode")}
                error={errors.address?.zipCode?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                placeholder="Ville"
                {...register("address.city")}
                error={errors.address?.city?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">Pays *</Label>
              <Input
                id="country"
                placeholder="Pays"
                {...register("address.country")}
                error={errors.address?.country?.message}
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
                placeholder="Email de contact"
                {...register("contact.email")}
                error={errors.contact?.email?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                placeholder="Téléphone"
                {...register("contact.phone")}
                error={errors.contact?.phone?.message}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="banking" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="legalForm">Forme juridique *</Label>
              <select
                id="legalForm"
                className={`w-full p-2 border rounded-md ${errors.legalForm ? 'border-red-500' : 'border-gray-300'}`}
                {...register("legalForm")}
              >
                <option value="">Sélectionner...</option>
                <option value="SARL">SARL</option>
                <option value="SAS">SAS</option>
                <option value="SASU">SASU</option>
                <option value="EURL">EURL</option>
                <option value="EI">Entreprise Individuelle</option>
                <option value="SA">SA</option>
                <option value="SCI">SCI</option>
                <option value="Association">Association</option>
              </select>
              {errors.legalForm && <p className="mt-1 text-sm text-red-600">{errors.legalForm.message}</p>}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="taxId">Identifiant fiscal *</Label>
              <Input
                id="taxId"
                placeholder="Identifiant fiscal"
                {...register("taxId")}
                error={errors.taxId?.message}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
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
      </Tabs>
      
      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer l'entreprise"}
        </Button>
      </div>
    </form>
  );
} 