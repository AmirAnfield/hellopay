"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ContractData, CONTRACT_TEMPLATES } from "./ContractData";
import { cn } from "@/lib/utils";

interface ContractParametersStepProps {
  contractData: ContractData;
  onDataChange: (newData: Partial<ContractData>) => void;
  onNext: () => void;
}

export function ContractParametersStep({
  contractData,
  onDataChange,
  onNext,
}: ContractParametersStepProps) {
  const [probationEnabled, setProbationEnabled] = useState<boolean>(
    contractData.probationPeriod?.enabled || true
  );
  const [renewalEnabled, setRenewalEnabled] = useState<boolean>(
    contractData.probationPeriod?.renewalEnabled || false
  );

  // Gestion des changements des paramètres de base du contrat
  const handleChange = (field: string, value: string | number | boolean) => {
    onDataChange({ [field]: value });
  };

  // Gestion des changements dans les horaires de travail
  const handleWorkScheduleChange = (
    field: keyof ContractData["workSchedule"],
    value: string | number | boolean
  ) => {
    onDataChange({
      workSchedule: {
        ...contractData.workSchedule,
        [field]: value,
      },
    });
  };

  // Gestion des changements dans la rémunération
  const handleCompensationChange = (
    field: keyof ContractData["compensation"],
    value: string | number
  ) => {
    onDataChange({
      compensation: {
        ...contractData.compensation,
        [field]: value,
      },
    });
  };

  // Gestion des changements dans la période d'essai
  const handleProbationChange = (
    field: keyof ContractData["probationPeriod"],
    value: boolean | number
  ) => {
    onDataChange({
      probationPeriod: {
        ...contractData.probationPeriod,
        [field]: value,
      },
    });
  };

  // Chargement des articles par défaut selon le type de contrat
  const loadDefaultArticles = (contractType: string) => {
    let templateArticles: Array<{
      id: string;
      title: string;
      content: string;
      isRequired: boolean;
      isEditable: boolean;
      order: number;
    }> = [];
    
    // Récupérer les articles du modèle selon le type de contrat
    if (contractType === "CDI" && CONTRACT_TEMPLATES.CDI) {
      templateArticles = [...CONTRACT_TEMPLATES.CDI];
    } else if (contractType === "CDD" && CONTRACT_TEMPLATES.CDD) {
      templateArticles = [...CONTRACT_TEMPLATES.CDD];
    }
    
    // Mettre à jour les articles du contrat
    onDataChange({
      contractType: contractType as "CDI" | "CDD" | "CTT" | "Stage" | "Alternance" | "Autre",
      articles: templateArticles,
    });
  };

  // Formater une date pour l'affichage
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PP", { locale: fr });
    } catch {
      return "";
    }
  };

  // Validation pour passer à l'étape suivante
  const canProceed = () => {
    return (
      contractData.title &&
      contractData.contractType &&
      contractData.startDate &&
      (contractData.contractType !== "CDD" || contractData.endDate) &&
      contractData.compensation.baseSalary > 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract-title">Titre du contrat *</Label>
            <Input
              id="contract-title"
              value={contractData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Contrat à durée indéterminée"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-description">Description</Label>
            <Input
              id="contract-description"
              value={contractData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Description du contrat"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-reference">Référence</Label>
            <Input
              id="contract-reference"
              value={contractData.reference || ""}
              onChange={(e) => handleChange("reference", e.target.value)}
              placeholder="Référence interne"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract-type">Type de contrat *</Label>
            <Select
              value={contractData.contractType}
              onValueChange={(value) => {
                loadDefaultArticles(value);
              }}
            >
              <SelectTrigger id="contract-type">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CDI">CDI - Contrat à durée indéterminée</SelectItem>
                <SelectItem value="CDD">CDD - Contrat à durée déterminée</SelectItem>
                <SelectItem value="CTT">CTT - Contrat de travail temporaire</SelectItem>
                <SelectItem value="Stage">Stage</SelectItem>
                <SelectItem value="Alternance">Alternance</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">Date de début *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !contractData.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {contractData.startDate ? (
                    formatDate(contractData.startDate)
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={contractData.startDate ? new Date(contractData.startDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      handleChange("startDate", date.toISOString().split("T")[0]);
                    }
                  }}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {(contractData.contractType === "CDD" || contractData.contractType === "CTT" || contractData.contractType === "Stage") && (
            <div className="space-y-2">
              <Label htmlFor="end-date">Date de fin *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !contractData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {contractData.endDate ? (
                      formatDate(contractData.endDate)
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={contractData.endDate ? new Date(contractData.endDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleChange("endDate", date.toISOString().split("T")[0]);
                      }
                    }}
                    disabled={(date) => {
                      // Désactiver les dates antérieures à la date de début
                      return contractData.startDate
                        ? date < new Date(contractData.startDate)
                        : false;
                    }}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 mt-6 pt-6 border-t">
        <h3 className="text-lg font-medium">Période d&apos;essai</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="probation-enabled"
              checked={probationEnabled}
              onCheckedChange={(checked) => {
                setProbationEnabled(checked);
                handleProbationChange("enabled", checked);
              }}
            />
            <Label htmlFor="probation-enabled">Inclure une période d&apos;essai</Label>
          </div>

          {probationEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="probation-duration">Durée (en mois)</Label>
                <Select
                  value={String(contractData.probationPeriod.durationMonths)}
                  onValueChange={(value) =>
                    handleProbationChange("durationMonths", Number(value))
                  }
                >
                  <SelectTrigger id="probation-duration">
                    <SelectValue placeholder="Durée de la période d'essai" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 6, 8].map((months) => (
                      <SelectItem key={months} value={String(months)}>
                        {months} {months > 1 ? "mois" : "mois"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="renewal-enabled"
                  checked={renewalEnabled}
                  onCheckedChange={(checked) => {
                    setRenewalEnabled(checked);
                    handleProbationChange("renewalEnabled", checked);
                  }}
                />
                <Label htmlFor="renewal-enabled">
                  Prévoir un renouvellement possible
                </Label>
              </div>

              {renewalEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="renewal-duration">
                    Durée du renouvellement (en mois)
                  </Label>
                  <Select
                    value={String(
                      contractData.probationPeriod.renewalDurationMonths || 1
                    )}
                    onValueChange={(value) =>
                      handleProbationChange(
                        "renewalDurationMonths",
                        Number(value)
                      )
                    }
                  >
                    <SelectTrigger id="renewal-duration">
                      <SelectValue placeholder="Durée du renouvellement" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((months) => (
                        <SelectItem key={months} value={String(months)}>
                          {months} {months > 1 ? "mois" : "mois"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="space-y-4 mt-6 pt-6 border-t">
        <h3 className="text-lg font-medium">Horaires de travail</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hours-per-week">Heures hebdomadaires</Label>
            <Input
              id="hours-per-week"
              type="number"
              min="1"
              max="50"
              value={contractData.workSchedule.hoursPerWeek}
              onChange={(e) =>
                handleWorkScheduleChange(
                  "hoursPerWeek",
                  Number(e.target.value)
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="days-per-week">Jours par semaine</Label>
            <Select
              value={String(contractData.workSchedule.daysPerWeek)}
              onValueChange={(value) =>
                handleWorkScheduleChange("daysPerWeek", Number(value))
              }
            >
              <SelectTrigger id="days-per-week">
                <SelectValue placeholder="Nombre de jours travaillés" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                  <SelectItem key={days} value={String(days)}>
                    {days} {days > 1 ? "jours" : "jour"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-type">Type d&apos;horaires</Label>
            <Select
              value={contractData.workSchedule.scheduleType}
              onValueChange={(value) =>
                handleWorkScheduleChange("scheduleType", value)
              }
            >
              <SelectTrigger id="schedule-type">
                <SelectValue placeholder="Type d'horaires" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixes</SelectItem>
                <SelectItem value="variable">Variables</SelectItem>
                <SelectItem value="shifts">Par équipes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-6 pt-6 border-t">
        <h3 className="text-lg font-medium">Rémunération</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="base-salary">Salaire de base *</Label>
            <div className="flex">
              <Input
                id="base-salary"
                type="number"
                min="0"
                step="0.01"
                value={contractData.compensation.baseSalary}
                onChange={(e) =>
                  handleCompensationChange(
                    "baseSalary",
                    Number(e.target.value)
                  )
                }
                className="rounded-r-none"
              />
              <div className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground">
                €
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-frequency">Fréquence de paiement</Label>
            <Select
              value={contractData.compensation.paymentFrequency}
              onValueChange={(value) =>
                handleCompensationChange(
                  "paymentFrequency",
                  value as "monthly" | "hourly" | "daily"
                )
              }
            >
              <SelectTrigger id="payment-frequency">
                <SelectValue placeholder="Fréquence de paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensuel</SelectItem>
                <SelectItem value="hourly">Horaire</SelectItem>
                <SelectItem value="daily">Journalier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={onNext} disabled={!canProceed()}>
          Suivant
        </Button>
      </div>
    </div>
  );
} 