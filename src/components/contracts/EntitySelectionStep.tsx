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
import { PlusCircle, Search, Building, User } from "lucide-react";
import { ContractData } from "./ContractData";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where, serverTimestamp } from "firebase/firestore";

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
  }, []);

  // Créer une fonction fetchData accessible en dehors de l'useEffect
  const fetchData = async () => {
    setLoading(true);
    try {
      // Récupérer les entreprises
      const companiesSnapshot = await getDocs(collection(db, 'companies'));
      const fetchedCompanies: Company[] = [];
      companiesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log("Document entreprise:", doc.id, data);
        fetchedCompanies.push({
          id: doc.id,
          name: data.name || '',
          siret: data.siret || '',
          address: data.address || '',
          postalCode: data.postalCode || '',
          city: data.city || '',
          country: data.country || 'France'
        });
      });
      console.log("Entreprises chargées:", fetchedCompanies.length, fetchedCompanies);
      setCompanies(fetchedCompanies);

      // Récupérer les employés
      const employeesSnapshot = await getDocs(collection(db, 'employees'));
      const fetchedEmployees: Employee[] = [];
      employeesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log("Document employé:", doc.id, data);
        fetchedEmployees.push({
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          position: data.position || '',
          email: data.email || '',
          companyId: data.companyId || ''
        });
      });
      console.log("Employés chargés:", fetchedEmployees.length, fetchedEmployees);
      setEmployees(fetchedEmployees);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données depuis Firestore.",
        variant: "destructive",
      });
      
      // Essayer de charger depuis localStorage comme solution de secours
      try {
        const storedCompanies = localStorage.getItem("companies");
        if (storedCompanies) {
          setCompanies(JSON.parse(storedCompanies));
        }

        const storedEmployees = localStorage.getItem("employees");
        if (storedEmployees) {
          setEmployees(JSON.parse(storedEmployees));
        }
      } catch (localError) {
        console.error("Erreur lors du chargement depuis localStorage:", localError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les employés par entreprise sélectionnée
  const filteredEmployees = employees.filter(
    (emp) => emp.companyId === selectedCompanyId
  );
  
  // Debug pour voir les données
  useEffect(() => {
    console.log("Employés chargés:", employees);
    console.log("Entreprise sélectionnée:", selectedCompanyId);
    console.log("Employés filtrés:", filteredEmployees);
  }, [employees, filteredEmployees, selectedCompanyId]);

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
      // Ajout à Firestore
      const companyData = {
        name: newCompany.name,
        siret: newCompany.siret,
        address: newCompany.address || '',
        postalCode: newCompany.postalCode || '',
        city: newCompany.city || '',
        country: newCompany.country || 'France',
        createdAt: serverTimestamp()
      };
      
      // Log avant l'ajout
      console.log("Création entreprise:", companyData);
      
      const docRef = await addDoc(collection(db, 'companies'), companyData);
      
      // Créer l'objet entreprise avec ID
      const newCompanyWithId = {
        id: docRef.id,
        name: companyData.name,
        siret: companyData.siret,
        address: companyData.address,
        postalCode: companyData.postalCode,
        city: companyData.city,
        country: companyData.country
      };

      // Mise à jour de l'état local avec un nouveau tableau
      const updatedCompanies = [...companies, newCompanyWithId];
      setCompanies(updatedCompanies);
      setSelectedCompanyId(docRef.id);
      
      // Mise à jour du localStorage
      localStorage.setItem("companies", JSON.stringify(updatedCompanies));
      
      // Log après l'ajout
      console.log("Entreprise créée avec ID:", docRef.id);
      console.log("Nouvel état companies:", updatedCompanies);
      
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
      // Ajout à Firestore
      const employeeData = {
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        position: newEmployee.position || '',
        email: newEmployee.email || '',
        companyId: selectedCompanyId,
        createdAt: serverTimestamp()
      };
      
      // Log avant l'ajout
      console.log("Création employé pour l'entreprise:", selectedCompanyId);
      console.log("Données employé:", employeeData);
      
      const docRef = await addDoc(collection(db, 'employees'), employeeData);
      
      // Créer l'objet employé avec ID
      const newEmployeeWithId = {
        id: docRef.id,
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        position: employeeData.position,
        email: employeeData.email,
        companyId: selectedCompanyId
      };

      // Mise à jour de l'état local avec le spread operator pour créer un nouveau tableau
      const updatedEmployees = [...employees, newEmployeeWithId];
      setEmployees(updatedEmployees);
      setSelectedEmployeeId(docRef.id);
      
      // Mise à jour du localStorage avec le nouveau tableau
      localStorage.setItem("employees", JSON.stringify(updatedEmployees));
      
      // Log après l'ajout
      console.log("Employé créé avec ID:", docRef.id);
      console.log("Nouvel état employees:", updatedEmployees);
      
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

  // Fonction de test pour créer des données fictives
  const createTestData = async () => {
    try {
      // Créer une entreprise test
      const testCompanyData = {
        name: "Entreprise Test",
        siret: "12345678901234",
        address: "123 rue de Test",
        postalCode: "75000",
        city: "Paris",
        country: "France",
        createdAt: serverTimestamp()
      };
      
      console.log("Tentative de création d'entreprise test:", testCompanyData);
      const companyRef = await addDoc(collection(db, 'companies'), testCompanyData);
      console.log("Entreprise test créée avec ID:", companyRef.id);
      
      // Créer un employé test lié à cette entreprise
      const testEmployeeData = {
        firstName: "Prénom",
        lastName: "Nom",
        position: "Testeur",
        email: "test@example.com",
        companyId: companyRef.id,
        createdAt: serverTimestamp()
      };
      
      console.log("Tentative de création d'employé test:", testEmployeeData);
      const employeeRef = await addDoc(collection(db, 'employees'), testEmployeeData);
      console.log("Employé test créé avec ID:", employeeRef.id);
      
      // Rafraîchir les données
      fetchData();
      
      toast({
        title: "Données de test créées",
        description: "Une entreprise et un employé de test ont été créés."
      });
    } catch (error) {
      console.error("Erreur lors de la création des données de test:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer les données de test.",
        variant: "destructive"
      });
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

      {/* Bouton de test pour créer des données de test */}
      <div className="flex justify-center mt-8 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={createTestData}
        >
          Créer des données de test
        </Button>
      </div>
    </div>
  );
} 