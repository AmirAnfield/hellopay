import React from 'react';
import { Company } from '@/services/company-service';
import {
  MapPin,
  User,
  Mail,
  Phone,
  Globe,
  Briefcase,
  FileText,
  Hash,
  CreditCard
} from "lucide-react";

interface CompanyDetailProps {
  company: Company;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({ company }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">SIRET</p>
            <p className="text-sm text-muted-foreground">{company.siret}</p>
          </div>
        </div>
        
        {company.legalForm && (
          <div className="flex items-start gap-3">
            <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Forme juridique</p>
              <p className="text-sm text-muted-foreground">{company.legalForm}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="font-medium">Adresse</p>
            <p className="text-sm text-muted-foreground">
              {company.address}, {company.postalCode} {company.city}, {company.country}
            </p>
          </div>
        </div>
        
        {company.legalRepresentative && (
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Représentant légal</p>
              <p className="text-sm text-muted-foreground">
                {company.legalRepresentative}
                {company.legalRepresentativeRole && ` (${company.legalRepresentativeRole})`}
              </p>
            </div>
          </div>
        )}
        
        {company.email && (
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{company.email}</p>
            </div>
          </div>
        )}
        
        {company.phoneNumber && (
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Téléphone</p>
              <p className="text-sm text-muted-foreground">{company.phoneNumber}</p>
            </div>
          </div>
        )}
        
        {company.website && (
          <div className="flex items-start gap-3">
            <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Site web</p>
              <p className="text-sm text-muted-foreground">
                <a 
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {company.website}
                </a>
              </p>
            </div>
          </div>
        )}
        
        {company.activityCode && (
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Code APE</p>
              <p className="text-sm text-muted-foreground">{company.activityCode}</p>
            </div>
          </div>
        )}
        
        {company.vatNumber && (
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Numéro TVA</p>
              <p className="text-sm text-muted-foreground">{company.vatNumber}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetail; 