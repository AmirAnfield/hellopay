"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { collection, getDocs, doc, updateDoc, Timestamp, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Todo {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: Timestamp;
  relatedTo?: {
    type: "company" | "employee" | "document";
    id: string;
    name: string;
  };
  createdAt: Timestamp;
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchTodos();
  }, [user]);

  const fetchTodos = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      // Récupérer les tâches en attente de l'utilisateur
      const todosRef = collection(db, `users/${user.uid}/tasks`);
      const q = query(todosRef, where("status", "==", "pending"));
      const snapshot = await getDocs(q);
      
      const todosList: Todo[] = [];
      snapshot.forEach(doc => {
        todosList.push({ id: doc.id, ...doc.data() } as Todo);
      });
      
      // Trier par priorité et date
      todosList.sort((a, b) => {
        // D'abord par priorité
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // Ensuite par date d'échéance (si présente)
        if (a.dueDate && b.dueDate) {
          return a.dueDate.toMillis() - b.dueDate.toMillis();
        } else if (a.dueDate) {
          return -1;
        } else if (b.dueDate) {
          return 1;
        }
        
        // Enfin par date de création
        return a.createdAt.toMillis() - b.createdAt.toMillis();
      });
      
      setTodos(todosList);
    } catch (error) {
      console.error("Erreur lors de la récupération des tâches:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeTodo = async (todoId: string) => {
    if (!user?.uid) return;
    
    try {
      const todoRef = doc(db, `users/${user.uid}/tasks`, todoId);
      await updateDoc(todoRef, {
        status: "completed",
        completedAt: Timestamp.now()
      });
      
      // Mettre à jour l'UI
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-center items-center h-24">
            <p className="text-sm text-muted-foreground">Chargement des tâches...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (todos.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-6">
            <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground opacity-40 mb-2" />
            <p className="text-sm text-muted-foreground">Aucune tâche en attente</p>
            <p className="text-xs text-muted-foreground mt-1">Les tâches à effectuer s&apos;afficheront ici</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <ul className="divide-y">
          {todos.map((todo) => (
            <li key={todo.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3 p-1.5 rounded-full bg-primary/10">
                  <ClipboardList className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{todo.title}</p>
                  {todo.relatedTo && (
                    <p className="text-xs text-muted-foreground">
                      {todo.relatedTo.name}
                    </p>
                  )}
                </div>
                {todo.priority === "high" && (
                  <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-200">
                    Prioritaire
                  </Badge>
                )}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8" 
                onClick={() => completeTodo(todo.id)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Terminer
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 