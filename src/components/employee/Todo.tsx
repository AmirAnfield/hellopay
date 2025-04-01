"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Save, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

// Type pour représenter une tâche
export interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

// Props du composant
interface TodoProps {
  employeeId: string;
}

const Todo: React.FC<TodoProps> = ({ employeeId }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Charger les tâches depuis localStorage au chargement du composant
  useEffect(() => {
    const loadTodos = () => {
      setIsLoading(true);
      if (typeof window !== 'undefined') {
        try {
          // Récupérer les tâches pour cet employé spécifique
          const todosKey = `todos_${employeeId}`;
          const todosFromStorage = localStorage.getItem(todosKey);
          
          if (todosFromStorage) {
            const parsedTodos = JSON.parse(todosFromStorage);
            setTodos(parsedTodos);
          } else {
            setTodos([]);
          }
        } catch (e) {
          console.error("Erreur lors de la récupération des tâches:", e);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de charger les tâches."
          });
        }
      }
      setIsLoading(false);
    };
    
    loadTodos();
  }, [employeeId, toast]);

  // Sauvegarder les tâches dans localStorage
  const saveTodos = async (updatedTodos: TodoItem[]) => {
    setIsSaving(true);
    try {
      if (typeof window !== 'undefined') {
        const todosKey = `todos_${employeeId}`;
        localStorage.setItem(todosKey, JSON.stringify(updatedTodos));
        
        // Simuler un délai pour montrer le chargement
        await new Promise(resolve => setTimeout(resolve, 300));
        
        toast({
          title: "Tâches sauvegardées",
          description: "Les tâches ont été mises à jour avec succès.",
        });
      }
    } catch (e) {
      console.error("Erreur lors de la sauvegarde des tâches:", e);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder les tâches."
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Ajouter une nouvelle tâche
  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    
    const newTodoItem: TodoItem = {
      id: `todo-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      content: newTodo.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    const updatedTodos = [...todos, newTodoItem];
    setTodos(updatedTodos);
    setNewTodo("");
    saveTodos(updatedTodos);
  };

  // Mettre à jour le statut d'une tâche (complétée ou non)
  const handleToggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        return {
          ...todo,
          completed: !todo.completed,
          completedAt: !todo.completed ? new Date().toISOString() : undefined,
        };
      }
      return todo;
    });
    
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  // Supprimer une tâche
  const handleDeleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  // Formater la date au format français
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Liste des tâches</CardTitle>
        <CardDescription>
          Gérez les tâches à accomplir pour cet employé
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulaire d'ajout */}
        <div className="flex gap-2">
          <Input
            placeholder="Ajouter une nouvelle tâche..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddTodo();
              }
            }}
            className="flex-1"
          />
          <Button 
            onClick={handleAddTodo}
            disabled={!newTodo.trim() || isSaving}
          >
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>

        {/* Liste des tâches */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Aucune tâche pour le moment
            </div>
          ) : (
            todos.map((todo) => (
              <div 
                key={todo.id} 
                className="flex items-start gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
              >
                <Checkbox 
                  className="mt-1"
                  checked={todo.completed} 
                  onCheckedChange={() => handleToggleTodo(todo.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    todo.completed && "line-through text-muted-foreground"
                  )}>
                    {todo.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Créée le {formatDate(todo.createdAt)}
                    {todo.completed && todo.completedAt && (
                      <> • Terminée le {formatDate(todo.completedAt)}</>
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="h-8 w-8 text-destructive hover:text-destructive/80"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Todo; 