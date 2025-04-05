"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

interface ContractArticlesStepProps {
  contractData: ContractData;
  onDataChange: (newData: Partial<ContractData>) => void;
  onNext: () => void;
}

export function ContractArticlesStep({
  contractData,
  onDataChange,
  onNext,
}: ContractArticlesStepProps) {
  const [articles, setArticles] = useState([...contractData.articles]);
  const [editingArticle, setEditingArticle] = useState<{
    id: string;
    title: string;
    content: string;
    isRequired: boolean;
    isEditable: boolean;
    order: number;
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Gestion des changements dans les articles
  const updateArticles = (newArticles: typeof articles) => {
    // Mettre à jour l'ordre des articles
    const updatedArticles = newArticles.map((article, index) => ({
      ...article,
      order: index,
    }));
    
    setArticles(updatedArticles);
    onDataChange({ articles: updatedArticles });
  };

  // Gestion du drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = [...articles];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    updateArticles(items);
  };

  // Ajout d'un nouvel article
  const handleAddArticle = () => {
    setEditingArticle({
      id: `art-${Date.now()}`,
      title: "",
      content: "",
      isRequired: false,
      isEditable: true,
      order: articles.length,
    });
    setDialogOpen(true);
  };

  // Modification d'un article existant
  const handleEditArticle = (article: typeof articles[0]) => {
    setEditingArticle({ ...article });
    setDialogOpen(true);
  };

  // Suppression d'un article
  const handleDeleteArticle = (articleId: string) => {
    const updatedArticles = articles.filter((a) => a.id !== articleId);
    updateArticles(updatedArticles);
  };

  // Sauvegarde des modifications d'un article
  const handleSaveArticle = () => {
    if (!editingArticle || !editingArticle.title || !editingArticle.content) {
      return;
    }

    let updatedArticles: typeof articles;
    
    const existingIndex = articles.findIndex((a) => a.id === editingArticle.id);
    if (existingIndex >= 0) {
      // Mise à jour d'un article existant
      updatedArticles = [...articles];
      updatedArticles[existingIndex] = editingArticle;
    } else {
      // Ajout d'un nouvel article
      updatedArticles = [...articles, editingArticle];
    }
    
    updateArticles(updatedArticles);
    setDialogOpen(false);
    setEditingArticle(null);
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

  // Validation pour passer à l'étape suivante
  const canProceed = () => {
    return articles.length > 0;
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Organisez les articles qui composeront votre contrat. Vous pouvez modifier le contenu, ajouter de nouveaux articles, ou réorganiser leur ordre par glisser-déposer.
      </p>

      <div className="flex justify-end mb-4">
        <Button onClick={handleAddArticle}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un article
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="articles">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {articles.map((article, index) => (
                <Draggable
                  key={article.id}
                  draggableId={article.id}
                  index={index}
                  isDragDisabled={article.isRequired && !article.isEditable}
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
                              <h4 className="font-medium">{article.title}</h4>
                              <div className="flex space-x-2">
                                {article.isEditable && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditArticle(article)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteArticle(article.id)}
                                      className="text-destructive hover:text-destructive/90"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-2 text-sm whitespace-pre-wrap">
                              {formatContent(article.content)}
                            </div>
                            
                            {article.isRequired && (
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                Article obligatoire selon la législation en vigueur
                              </p>
                            )}
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

      {articles.length === 0 && (
        <div className="text-center p-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">
            Aucun article ajouté. Commencez par ajouter votre premier article au contrat.
          </p>
          <Button className="mt-4" onClick={handleAddArticle}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un article
          </Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingArticle && editingArticle.id.startsWith("art-")
                ? "Ajouter un article"
                : "Modifier l'article"}
            </DialogTitle>
            <DialogDescription>
              Complétez les informations de l&apos;article. Utilisez des variables entre crochets comme [FONCTION] pour les informations qui seront remplacées lors de la génération du contrat.
            </DialogDescription>
          </DialogHeader>

          {editingArticle && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="article-title">Titre de l&apos;article *</Label>
                <Input
                  id="article-title"
                  value={editingArticle.title}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      title: e.target.value,
                    })
                  }
                  placeholder="Ex: Article 1: Fonction et classification"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="article-content">Contenu *</Label>
                <Textarea
                  id="article-content"
                  value={editingArticle.content}
                  onChange={(e) =>
                    setEditingArticle({
                      ...editingArticle,
                      content: e.target.value,
                    })
                  }
                  placeholder="Le salarié est engagé en qualité de [FONCTION] au coefficient [COEFFICIENT] de la convention collective [CONVENTION]."
                  rows={6}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="article-required"
                  checked={editingArticle.isRequired}
                  onCheckedChange={(checked) =>
                    setEditingArticle({
                      ...editingArticle,
                      isRequired: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="article-required">
                  Article obligatoire selon la législation
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditingArticle(null);
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveArticle} disabled={!editingArticle?.title || !editingArticle?.content}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end mt-6">
        <Button onClick={onNext} disabled={!canProceed()}>
          Suivant
        </Button>
      </div>
    </div>
  );
} 