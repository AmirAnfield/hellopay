"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Building, User } from "lucide-react";
import { ContractData } from "./ContractData";
import { getCollection, setDocument } from "@/lib/firebase/firestore";

interface Company {
  id: string;
  name: string;
  siret?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position?: string;
  email?: string;
  companyId: string;
}

interface EntitySelectionStepProps {
  contractData: ContractData;
  onDataChange: (newData: Partial<ContractData>) => void;
  onNext: () => void;
}

export function EntitySelectionStep({
  contractData,
  onDataChange,
  onNext,
}: EntitySelectionStepProps) {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    contractData.company?.id || ""
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    contractData.employee?.id || ""
  );
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [newCompany, setNewCompany] = useState<Partial<Company>>({
    name: "",
    siret: "",
    address: "",
    postalCode: "",
    city: "",
    country: "France",
  });
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    firstName: "",
    lastName: "",
    position: "",
    email: "",
    companyId: selectedCompanyId,
  });
  const [entityType, setEntityType] = useState<"company" | "individual">("company");
  const [isCounterparty, setIsCounterparty] = useState<boolean>(false);
  const [counterparty, setCounterparty] = useState<{
    name: string;
    email?: string;
    address?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  }>({
    name: contractData.counterparty?.name || "",
    email: contractData.counterparty?.email || "",
    address: contractData.counterparty?.address || "",
    postalCode: contractData.counterparty?.postalCode || "",
    city: contractData.counterparty?.city || "",
    country: contractData.counterparty?.country || "France",
  });

  // Chargement des entreprises depuis Firestore
  useEffect(() => {
    fetchData();
    // Afficher un message dans la console pour indiquer que le composant est chargé
    console.log("EntitySelectionStep monté - données initiales:", { 
      selectedCompanyId, 
      selectedEmployeeId, 
      contractData 
    });
  }, []);

  // Créer une fonction fetchData accessible en dehors de l'useEffect
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Début du chargement des données depuis Firestore...");
      
      // Récupérer les entreprises en utilisant la fonction getCollection
      console.log("Tentative de récupération des entreprises avec getCollection");
      const fetchedCompanies = await getCollection('companies');
      console.log("Entreprises chargées avec getCollection:", fetchedCompanies.length, fetchedCompanies);
      setCompanies(fetchedCompanies);

      // Récupérer les employés en utilisant la fonction getCollection
      console.log("Tentative de récupération des employés avec getCollection");
      const fetchedEmployees = await getCollection('employees');
      console.log("Employés chargés avec getCollection:", fetchedEmployees.length, fetchedEmployees);
      setEmployees(fetchedEmployees);
      
      // Si aucune donnée n'est trouvée dans Firestore, essayer de charger depuis localStorage
      if (fetchedCompanies.length === 0 && fetchedEmployees.length === 0) {
        console.log("Aucune donnée dans Firestore, tentative de récupération depuis le localStorage");
        const storedCompanies = localStorage.getItem("companies");
        if (storedCompanies) {
          const parsedCompanies = JSON.parse(storedCompanies);
          console.log("Companies from localStorage:", parsedCompanies);
          setCompanies(parsedCompanies);
        }

        const storedEmployees = localStorage.getItem("employees");
        if (storedEmployees) {
          const parsedEmployees = JSON.parse(storedEmployees);
          console.log("Employees from localStorage:", parsedEmployees);
          setEmployees(parsedEmployees);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données depuis Firestore.",
        variant: "destructive",
      });
      
      // Essayer de charger depuis localStorage comme solution de secours
      try {
        console.log("Tentative de récupération depuis le localStorage après erreur");
        const storedCompanies = localStorage.getItem("companies");
        if (storedCompanies) {
          const parsedCompanies = JSON.parse(storedCompanies);
          console.log("Companies from localStorage (after error):", parsedCompanies);
          setCompanies(parsedCompanies);
        }

        const storedEmployees = localStorage.getItem("employees");
        if (storedEmployees) {
          const parsedEmployees = JSON.parse(storedEmployees);
          console.log("Employees from localStorage (after error):", parsedEmployees);
          setEmployees(parsedEmployees);
        }
      } catch (localError) {
        console.error("Erreur lors du chargement depuis localStorage:", localError);
      }
    } finally {
      setLoading(false);
      console.log("Chargement des données terminé");
    }
  };

  // Filtrer les employés par entreprise sélectionnée
  const filteredEmployees = employees.filter(
    (emp) => emp.companyId === selectedCompanyId
  );
  
  // Mise à jour des données de contrat lorsque l'entreprise change
  useEffect(() => {
    if (selectedCompanyId) {
      const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
      if (selectedCompany) {
        onDataChange({
          company: {
            id: selectedCompany.id,
            name: selectedCompany.name,
            siret: selectedCompany.siret,
            address: selectedCompany.address,
            postalCode: selectedCompany.postalCode,
            city: selectedCompany.city,
            country: selectedCompany.country || "France",
          },
        });

        // Mettre à jour la companyId du nouvel employé
        setNewEmployee((prev) => ({
          ...prev,
          companyId: selectedCompanyId,
        }));
      }
    }
  }, [selectedCompanyId, companies, onDataChange]);

  // Mise à jour des données de contrat lorsque l'employé change
  useEffect(() => {
    if (selectedEmployeeId) {
      const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
      if (selectedEmployee) {
        onDataChange({
          employee: {
            id: selectedEmployee.id,
            firstName: selectedEmployee.firstName,
            lastName: selectedEmployee.lastName,
            position: selectedEmployee.position,
            email: selectedEmployee.email,
          },
        });
      }
    }
  }, [selectedEmployeeId, employees, onDataChange]);

  // Mise à jour des données de contrat lorsque le tiers contractant change
  useEffect(() => {
    if (isCounterparty) {
      onDataChange({
        counterparty: counterparty,
      });
    } else {
      onDataChange({
        counterparty: undefined,
      });
    }
  }, [isCounterparty, counterparty, onDataChange]);

  // Mise à jour de la création d'une nouvelle entreprise pour Firestore
  const handleCreateCompany = async () => {
    if (!newCompany.name || !newCompany.siret) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir au moins le nom et le SIRET de l'entreprise.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Ajout à Firestore avec setDocument
      const companyData = {
        name: newCompany.name,
        siret: newCompany.siret,
        address: newCompany.address || '',
        postalCode: newCompany.postalCode || '',
        city: newCompany.city || '',
        country: newCompany.country || 'France',
        createdAt: new Date()
      };
      
      console.log("Tentative de création d'entreprise avec setDocument:", companyData);
      
      // Utiliser setDocument au lieu de addDoc
      const newCompanyWithId = await setDocument('companies', companyData);
      console.log("Entreprise créée avec setDocument:", newCompanyWithId);

      // Mise à jour de l'état local
      const updatedCompanies = [...companies, newCompanyWithId];
      console.log("Nouveau tableau d'entreprises:", updatedCompanies);
      setCompanies(updatedCompanies);
      setSelectedCompanyId(newCompanyWithId.id);
      
      // Mise à jour du localStorage
      localStorage.setItem("companies", JSON.stringify(updatedCompanies));
      
      // Réinitialiser le formulaire et fermer
      setNewCompany({
        name: "",
        siret: "",
        address: "",
        postalCode: "",
        city: "",
        country: "France",
      });
      setIsCreatingCompany(false);

      toast({
        title: "Entreprise créée",
        description: `L'entreprise ${newCompanyWithId.name} a été créée avec succès.`,
      });
      
      // Rafraîchir manuellement la liste des entreprises
      fetchData();
    } catch (error) {
      console.error("Erreur lors de la création de l'entreprise:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'entreprise. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Mise à jour de la création d'un nouvel employé pour Firestore
  const handleCreateEmployee = async () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !selectedCompanyId) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir au moins le prénom, le nom et sélectionner une entreprise.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Ajout à Firestore avec setDocument
      const employeeData = {
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        position: newEmployee.position || '',
        email: newEmployee.email || '',
        companyId: selectedCompanyId,
        createdAt: new Date()
      };
      
      console.log("Tentative de création d'employé avec setDocument:", employeeData);
      
      // Utiliser setDocument au lieu de addDoc
      const newEmployeeWithId = await setDocument('employees', employeeData);
      console.log("Employé créé avec setDocument:", newEmployeeWithId);

      // Mise à jour de l'état local
      const updatedEmployees = [...employees, newEmployeeWithId];
      console.log("Nouveau tableau d'employés:", updatedEmployees);
      setEmployees(updatedEmployees);
      setSelectedEmployeeId(newEmployeeWithId.id);
      
      // Mise à jour du localStorage
      localStorage.setItem("employees", JSON.stringify(updatedEmployees));
      
      // Réinitialiser le formulaire et fermer
      setNewEmployee({
        firstName: "",
        lastName: "",
        position: "",
        email: "",
        companyId: selectedCompanyId,
      });
      setIsCreatingEmployee(false);

      toast({
        title: "Employé créé",
        description: `L'employé ${newEmployeeWithId.firstName} ${newEmployeeWithId.lastName} a été créé avec succès.`,
      });
      
      // Rafraîchir manuellement la liste des employés
      fetchData();
    } catch (error) {
      console.error("Erreur lors de la création de l'employé:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'employé. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Gestion des changements pour le tiers contractant
  const handleCounterpartyChange = (
    field: keyof typeof counterparty,
    value: string
  ) => {
    setCounterparty((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validation pour passer à l'étape suivante
  const canProceed = () => {
    if (entityType === "company") {
      return !!selectedCompanyId && (!!selectedEmployeeId || isCounterparty);
    } else {
      return isCounterparty && !!counterparty.name;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={entityType} onValueChange={(v) => setEntityType(v as "company" | "individual")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="company">
            <Building className="mr-2 h-4 w-4" />
            Entreprise
          </TabsTrigger>
          <TabsTrigger value="individual">
            <User className="mr-2 h-4 w-4" />
            Individuel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-select">Sélectionner une entreprise</Label>
              <div className="flex gap-2 mt-1">
                <Select
                  value={selectedCompanyId}
                  onValueChange={setSelectedCompanyId}
                >
                  <SelectTrigger id="company-select" className="flex-1">
                    <SelectValue placeholder="Sélectionner une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.length > 0 ? (
                      companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name} {company.siret ? `(${company.siret})` : ""}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-company" disabled>
                        Aucune entreprise disponible
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsCreatingCompany(!isCreatingCompany)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nouvelle
                </Button>
              </div>
            </div>

            {isCreatingCompany && (
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-company-name">Nom de l'entreprise *</Label>
                      <Input
                        id="new-company-name"
                        value={newCompany.name}
                        onChange={(e) =>
                          setNewCompany({ ...newCompany, name: e.target.value })
                        }
                        placeholder="Nom de l'entreprise"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-company-siret">SIRET *</Label>
                      <Input
                        id="new-company-siret"
                        value={newCompany.siret}
                        onChange={(e) =>
                          setNewCompany({ ...newCompany, siret: e.target.value })
                        }
                        placeholder="SIRET de l'entreprise"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-company-address">Adresse</Label>
                      <Input
                        id="new-company-address"
                        value={newCompany.address}
                        onChange={(e) =>
                          setNewCompany({ ...newCompany, address: e.target.value })
                        }
                        placeholder="Adresse"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="new-company-postal">Code postal</Label>
                        <Input
                          id="new-company-postal"
                          value={newCompany.postalCode}
                          onChange={(e) =>
                            setNewCompany({ ...newCompany, postalCode: e.target.value })
                          }
                          placeholder="Code postal"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-company-city">Ville</Label>
                        <Input
                          id="new-company-city"
                          value={newCompany.city}
                          onChange={(e) =>
                            setNewCompany({ ...newCompany, city: e.target.value })
                          }
                          placeholder="Ville"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setIsCreatingCompany(false)}
                    >
                      Annuler
                    </Button>
                    <Button type="button" onClick={handleCreateCompany}>
                      Créer l'entreprise
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedCompanyId && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is-counterparty" 
                    checked={isCounterparty}
                    onCheckedChange={(checked) => {
                      setIsCounterparty(checked as boolean);
                      if (checked) {
                        setSelectedEmployeeId("");
                      }
                    }}
                  />
                  <Label htmlFor="is-counterparty">Contrat avec un tiers (non-employé)</Label>
                </div>

                {isCounterparty ? (
                  <Card>
                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="counterparty-name">Nom du tiers *</Label>
                          <Input
                            id="counterparty-name"
                            value={counterparty.name}
                            onChange={(e) => handleCounterpartyChange("name", e.target.value)}
                            placeholder="Nom du tiers"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="counterparty-email">Email</Label>
                          <Input
                            id="counterparty-email"
                            type="email"
                            value={counterparty.email || ""}
                            onChange={(e) => handleCounterpartyChange("email", e.target.value)}
                            placeholder="Email du tiers"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="counterparty-address">Adresse</Label>
                          <Input
                            id="counterparty-address"
                            value={counterparty.address || ""}
                            onChange={(e) => handleCounterpartyChange("address", e.target.value)}
                            placeholder="Adresse"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="counterparty-postal">Code postal</Label>
                            <Input
                              id="counterparty-postal"
                              value={counterparty.postalCode || ""}
                              onChange={(e) => handleCounterpartyChange("postalCode", e.target.value)}
                              placeholder="Code postal"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="counterparty-city">Ville</Label>
                            <Input
                              id="counterparty-city"
                              value={counterparty.city || ""}
                              onChange={(e) => handleCounterpartyChange("city", e.target.value)}
                              placeholder="Ville"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div>
                    <Label htmlFor="employee-select">Sélectionner un employé</Label>
                    <div className="flex gap-2 mt-1">
                      <Select
                        value={selectedEmployeeId}
                        onValueChange={setSelectedEmployeeId}
                      >
                        <SelectTrigger id="employee-select" className="flex-1">
                          <SelectValue placeholder="Sélectionner un employé" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.firstName} {employee.lastName}
                                {employee.position ? ` (${employee.position})` : ""}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-employee" disabled>
                              Aucun employé disponible pour cette entreprise
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setIsCreatingEmployee(!isCreatingEmployee)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Nouveau
                      </Button>
                    </div>

                    {isCreatingEmployee && (
                      <Card className="mt-4">
                        <CardContent className="pt-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="new-employee-firstname">Prénom *</Label>
                              <Input
                                id="new-employee-firstname"
                                value={newEmployee.firstName}
                                onChange={(e) =>
                                  setNewEmployee({
                                    ...newEmployee,
                                    firstName: e.target.value,
                                  })
                                }
                                placeholder="Prénom"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-employee-lastname">Nom *</Label>
                              <Input
                                id="new-employee-lastname"
                                value={newEmployee.lastName}
                                onChange={(e) =>
                                  setNewEmployee({
                                    ...newEmployee,
                                    lastName: e.target.value,
                                  })
                                }
                                placeholder="Nom"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-employee-position">Fonction</Label>
                              <Input
                                id="new-employee-position"
                                value={newEmployee.position || ""}
                                onChange={(e) =>
                                  setNewEmployee({
                                    ...newEmployee,
                                    position: e.target.value,
                                  })
                                }
                                placeholder="Fonction"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="new-employee-email">Email</Label>
                              <Input
                                id="new-employee-email"
                                type="email"
                                value={newEmployee.email || ""}
                                onChange={(e) =>
                                  setNewEmployee({
                                    ...newEmployee,
                                    email: e.target.value,
                                  })
                                }
                                placeholder="Email"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2 pt-2">
                            <Button
                              variant="outline"
                              type="button"
                              onClick={() => setIsCreatingEmployee(false)}
                            >
                              Annuler
                            </Button>
                            <Button type="button" onClick={handleCreateEmployee}>
                              Créer l'employé
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4 pt-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="counterparty-name-ind">Nom du tiers *</Label>
                  <Input
                    id="counterparty-name-ind"
                    value={counterparty.name}
                    onChange={(e) => handleCounterpartyChange("name", e.target.value)}
                    placeholder="Nom du tiers"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="counterparty-email-ind">Email</Label>
                  <Input
                    id="counterparty-email-ind"
                    type="email"
                    value={counterparty.email || ""}
                    onChange={(e) => handleCounterpartyChange("email", e.target.value)}
                    placeholder="Email du tiers"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="counterparty-address-ind">Adresse</Label>
                  <Input
                    id="counterparty-address-ind"
                    value={counterparty.address || ""}
                    onChange={(e) => handleCounterpartyChange("address", e.target.value)}
                    placeholder="Adresse"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="counterparty-postal-ind">Code postal</Label>
                    <Input
                      id="counterparty-postal-ind"
                      value={counterparty.postalCode || ""}
                      onChange={(e) => handleCounterpartyChange("postalCode", e.target.value)}
                      placeholder="Code postal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="counterparty-city-ind">Ville</Label>
                    <Input
                      id="counterparty-city-ind"
                      value={counterparty.city || ""}
                      onChange={(e) => handleCounterpartyChange("city", e.target.value)}
                      placeholder="Ville"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!canProceed()}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
} 