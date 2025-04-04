"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";
import { Edit, Plus, Trash, GripVertical } from "lucide-react";
import { ContractData } from "./ContractData";

interface ContractClausesStepProps {
  contractData: ContractData;
  onDataChange: (newData: Partial<ContractData>) => void;
  onNext: () => void;
}

export function ContractClausesStep({
  contractData,
  onDataChange,
  onNext,
}: ContractClausesStepProps) {
  const [clauses, setClauses] = useState([...contractData.additionalClauses]);
  const [editingClause, setEditingClause] = useState<{
    id: string;
    title: string;
    content: string;
    order: number;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Gestion des changements dans les clauses
  const updateClauses = (newClauses: typeof clauses) => {
    // Mettre à jour l'ordre des clauses
    const updatedClauses = newClauses.map((clause, index) => ({
      ...clause,
      order: index,
    }));
    
    setClauses(updatedClauses);
    onDataChange({ additionalClauses: updatedClauses });
  };

  // Gestion du drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = [...clauses];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    updateClauses(items);
  };

  // Ajout d'une nouvelle clause
  const handleAddClause = () => {
    setEditingClause({
      id: `clause-${Date.now()}`,
      title: "",
      content: "",
      order: clauses.length,
    });
    setDialogOpen(true);
  };

  // Modification d'une clause existante
  const handleEditClause = (clause: typeof clauses[0]) => {
    setEditingClause({ ...clause });
    setDialogOpen(true);
  };

  // Suppression d'une clause
  const handleDeleteClause = (clauseId: string) => {
    const updatedClauses = clauses.filter((c) => c.id !== clauseId);
    updateClauses(updatedClauses);
  };

  // Sauvegarde des modifications d'une clause
  const handleSaveClause = () => {
    if (!editingClause || !editingClause.title || !editingClause.content) {
      return;
    }

    let updatedClauses: typeof clauses;
    
    const existingIndex = clauses.findIndex((c) => c.id === editingClause.id);
    if (existingIndex >= 0) {
      // Mise à jour d'une clause existante
      updatedClauses = [...clauses];
      updatedClauses[existingIndex] = editingClause;
    } else {
      // Ajout d'une nouvelle clause
      updatedClauses = [...clauses, editingClause];
    }
    
    updateClauses(updatedClauses);
    setDialogOpen(false);
    setEditingClause(null);
  };

  // Prévisualisation du contenu avec formatage
  const formatContent = (content: string) => {
    // Remplacer les variables par des valeurs de prévisualisation
    return content
      .replace(/\[FONCTION\]/g, "Développeur Web")
      .replace(/\[COEFFICIENT\]/g, "300")
      .replace(/\[CONVENTION\]/g, "Syntec")
      .replace(/\[DATE_DEBUT\]/g, "01/01/2023")
      .replace(/\[DUREE_ESSAI\]/g, String(contractData.probationPeriod.durationMonths))
      .replace(/\[SALAIRE_BASE\]/g, String(contractData.compensation.baseSalary))
      .replace(/\[HEURES_MENSUEL\]/g, String(contractData.workSchedule.hoursPerWeek * 4.33))
      .replace(/\[HEURES_HEBDO\]/g, String(contractData.workSchedule.hoursPerWeek))
      .replace(/\[JOURS_SEMAINE\]/g, String(contractData.workSchedule.daysPerWeek))
      .replace(/\[MOTIF_CDD\]/g, "Accroissement temporaire d'activité")
      .replace(/\[DUREE_CDD\]/g, "6 mois")
      .replace(/\[DATE_FIN\]/g, contractData.endDate || "30/06/2023");
  };

  // Marquer l'étape comme complétée
  const completeStep = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Ajoutez des clauses additionnelles à votre contrat selon vos besoins spécifiques (confidentialité, non-concurrence, télétravail, etc.).
      </p>

      <div className="flex justify-end mb-4">
        <Button onClick={handleAddClause}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une clause
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="clauses">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {clauses.map((clause, index) => (
                <Draggable
                  key={clause.id}
                  draggableId={clause.id}
                  index={index}
                >
                  {(provided) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="border"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <div
                            {...provided.dragHandleProps}
                            className="mr-2 p-2 cursor-grab"
                          >
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{clause.title}</h4>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClause(clause)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClause(clause.id)}
                                  className="text-destructive hover:text-destructive/90"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-sm whitespace-pre-wrap">
                              {formatContent(clause.content)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {clauses.length === 0 && (
        <div className="text-center p-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">
            Aucune clause additionnelle ajoutée. Vous pouvez ajouter des clauses spécifiques à votre contrat ou continuer sans clauses supplémentaires.
          </p>
          <Button className="mt-4" onClick={handleAddClause}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une clause
          </Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingClause && editingClause.id.startsWith("clause-")
                ? "Ajouter une clause"
                : "Modifier la clause"}
            </DialogTitle>
            <DialogDescription>
              Complétez les informations de la clause. Vous pouvez utiliser des variables entre crochets comme [FONCTION] pour les informations qui seront remplacées lors de la génération du contrat.
            </DialogDescription>
          </DialogHeader>

          {editingClause && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clause-title">Titre de la clause *</Label>
                <Input
                  id="clause-title"
                  value={editingClause.title}
                  onChange={(e) =>
                    setEditingClause({
                      ...editingClause,
                      title: e.target.value,
                    })
                  }
                  placeholder="Ex: Clause de confidentialité"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clause-content">Contenu *</Label>
                <Textarea
                  id="clause-content"
                  value={editingClause.content}
                  onChange={(e) =>
                    setEditingClause({
                      ...editingClause,
                      content: e.target.value,
                    })
                  }
                  placeholder="Le salarié s'engage à respecter la confidentialité des informations auxquelles il aura accès dans le cadre de ses fonctions..."
                  rows={6}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditingClause(null);
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveClause} disabled={!editingClause?.title || !editingClause?.content}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end mt-6">
        <Button onClick={completeStep}>
          Suivant
        </Button>
      </div>
    </div>
  );
} 