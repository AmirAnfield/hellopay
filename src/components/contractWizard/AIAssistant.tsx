import React, { useState } from 'react';
import { AIContractMemory, AISuggestion } from '@/types/firebase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageCircle, LightbulbIcon, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AIAssistantProps {
  memory: AIContractMemory | null;
  isLoading?: boolean;
  suggestion?: AISuggestion | null;
  onAcceptSuggestion: (suggestion: AISuggestion) => void;
  onModifySuggestion: (suggestion: string) => void;
  onAskQuestion: (question: string) => void;
}

export function AIAssistant({
  memory,
  isLoading = false,
  suggestion = null,
  onAcceptSuggestion,
  onModifySuggestion,
  onAskQuestion
}: AIAssistantProps) {
  const [showInput, setShowInput] = useState(false);
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Gestion de l'envoi d'une question
  const handleSendQuestion = async () => {
    if (!question.trim()) return;
    
    try {
      setIsSubmitting(true);
      await onAskQuestion(question);
      setQuestion('');
      setShowInput(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!memory) {
    return null;
  }
  
  return (
    <Card className="mt-4 border border-primary/30 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <LightbulbIcon className="h-5 w-5 mr-2 text-primary" />
          Assistant IA
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-2 pb-3">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
            <span className="text-sm">Analyse en cours...</span>
          </div>
        ) : suggestion ? (
          <div className="space-y-4">
            <div className="border-l-4 border-primary/40 pl-3 py-1 text-sm">
              {suggestion.suggestion}
            </div>
            
            {suggestion.missingFieldWarning && (
              <Alert variant="warning" className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs ml-2">
                  {suggestion.missingFieldWarning}
                </AlertDescription>
              </Alert>
            )}
            
            {suggestion.suggestedFields && Object.keys(suggestion.suggestedFields).length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium mb-2">Suggestions de valeurs :</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(suggestion.suggestedFields).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {value?.toString()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {(suggestion.nextQuestion || suggestion.followUpQuestion) && (
              <div className="text-sm text-muted-foreground mt-2">
                <span className="font-medium">Conseil :</span> {suggestion.followUpQuestion || suggestion.nextQuestion}
              </div>
            )}
            
            <div className="flex items-center space-x-2 pt-2">
              <Button
                size="sm" 
                variant="default"
                className="h-8"
                onClick={() => onAcceptSuggestion(suggestion)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Accepter
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => onModifySuggestion(suggestion.suggestion)}
              >
                Modifier
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {memory.step === 1 
              ? "Je suis votre assistant IA. Commencez par sélectionner une entreprise et un employé." 
              : "Je vous aiderai à générer des clauses contractuelles adaptées à votre situation."}
          </div>
        )}
        
        {showInput && (
          <div className="mt-4 space-y-2">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Posez votre question sur ce contrat..."
              className="resize-none"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowInput(false)}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-1" />
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleSendQuestion}
                disabled={!question.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4 mr-1" />
                )}
                Envoyer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      {!showInput && (
        <CardFooter className="px-4 py-2 border-t flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {memory.history.length > 0 ? `${memory.history.length} message(s)` : 'Pas encore de conversation'}
          </span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowInput(true)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Question
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}