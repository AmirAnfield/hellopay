import React, { useState } from 'react';
import { AIContractMemory, AISuggestion } from '@/types/firebase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, 
  MessageCircle, 
  Sparkles, 
  CheckCircle, 
  X, 
  AlertTriangle,
  ArrowRight,
  Check
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  // Déterminer le style en fonction du type de contrat
  const getContractTypeStyle = () => {
    if (!memory.contractType) return "from-blue-500/20 to-blue-500/5";
    
    if (memory.contractType.startsWith('CDI')) {
      return "from-green-500/20 to-green-500/5";
    } else if (memory.contractType.startsWith('CDD')) {
      return "from-amber-500/20 to-amber-500/5";
    } else {
      return "from-blue-500/20 to-blue-500/5";
    }
  };

  // Format pour afficher le nom convivial du type de contrat
  const getContractTypeName = () => {
    if (!memory.contractType) return "";
    
    switch(memory.contractType) {
      case 'CDI_temps_plein': return "CDI à temps plein";
      case 'CDI_temps_partiel': return "CDI à temps partiel";
      case 'CDD_temps_plein': return "CDD à temps plein";
      case 'CDD_temps_partiel': return "CDD à temps partiel";
      default: return memory.contractType;
    }
  };
  
  return (
    <Card className={`mt-6 border-0 shadow-md overflow-hidden bg-gradient-to-b ${getContractTypeStyle()}`}>
      <CardHeader className="pb-2 bg-white/50 backdrop-blur-sm">
        <CardTitle className="text-base flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary animate-pulse" />
          <span>Assistant IA</span>
          {memory.contractType && (
            <Badge variant="outline" className="ml-auto">
              {getContractTypeName()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4 pb-3">
        {isLoading ? (
          <div className="flex items-center justify-center p-6 bg-white/60 rounded-lg">
            <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
            <span className="text-sm font-medium">Génération en cours...</span>
          </div>
        ) : suggestion ? (
          <div className="space-y-4">
            <div className="bg-white/80 border-l-4 border-primary rounded-r-lg pl-3 py-3 text-sm shadow-sm">
              {suggestion.suggestion}
            </div>
            
            {suggestion.missingFieldWarning && (
              <Alert variant="destructive" className="bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-xs ml-2 text-amber-700">
                  {suggestion.missingFieldWarning}
                </AlertDescription>
              </Alert>
            )}
            
            {suggestion.suggestedFields && Object.keys(suggestion.suggestedFields).length > 0 && (
              <div className="bg-white/80 rounded-lg p-3 shadow-sm">
                <p className="text-xs font-medium mb-2 text-primary/80">Suggestions pour votre contrat :</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(suggestion.suggestedFields).map(([key, value]) => (
                    <TooltipProvider key={key}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge key={key} variant="secondary" className="text-xs cursor-pointer hover:bg-primary/10">
                            {key}: {value?.toString()}
                            <Check className="h-3 w-3 ml-1" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Cliquez pour utiliser cette suggestion</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            )}
            
            {(suggestion.nextQuestion || suggestion.followUpQuestion) && (
              <div className="bg-primary/5 text-sm border border-primary/10 rounded-lg p-3 text-primary-foreground">
                <span className="font-medium">💡 Conseil :</span> {suggestion.followUpQuestion || suggestion.nextQuestion}
              </div>
            )}
            
            <div className="flex items-center space-x-2 pt-2">
              <Button
                size="sm" 
                variant="default"
                className="h-8 bg-primary/90 hover:bg-primary"
                onClick={() => onAcceptSuggestion(suggestion)}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Utiliser cette proposition
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => onModifySuggestion(suggestion.suggestion)}
              >
                Personnaliser
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white/60 rounded-lg p-4 text-sm flex items-center space-x-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="flex-1">
              {memory.step === 1 
                ? "Bonjour ! Je suis votre assistant IA juridique. Je vais vous guider pas à pas dans la création de votre contrat. Commençons par sélectionner une entreprise et un employé." 
                : "Je vais vous aider à générer les clauses adaptées à votre situation. Sélectionnez les options dans le formulaire et je vous proposerai des suggestions personnalisées."}
            </div>
          </div>
        )}
        
        {showInput && (
          <div className="mt-4 bg-white/80 rounded-lg p-3 space-y-2">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Posez une question sur votre contrat..."
              className="resize-none border-primary/20 focus-visible:ring-primary/30"
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
                disabled={!question.trim() || isSubmitting}
                onClick={handleSendQuestion}
                className="bg-primary/90 hover:bg-primary"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-1" />
                )}
                Envoyer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      {!showInput && (
        <CardFooter className="px-4 py-2 border-t border-primary/10 bg-white/30 backdrop-blur-sm flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {memory.history.length > 0 ? 
              `${memory.history.length} échange${memory.history.length > 1 ? 's' : ''} avec l'assistant` : 
              'Assistant activé'}
          </span>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-primary hover:text-primary hover:bg-primary/10"
            onClick={() => setShowInput(true)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Poser une question
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}