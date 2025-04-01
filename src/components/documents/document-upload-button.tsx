'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { DocumentType, uploadDocument } from '@/services/documents-service';

export function DocumentUploadButton() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('other');
  const [employeeId, setEmployeeId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Simuler la progression pour une meilleure UX
  const simulateProgress = () => {
    let value = 0;
    const interval = setInterval(() => {
      if (value >= 95) {
        clearInterval(interval);
        return;
      }
      value += Math.floor(Math.random() * 10) + 1;
      value = Math.min(value, 95);
      setProgress(value);
    }, 300);
    return interval;
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file || !employeeId || !companyId) {
      toast({
        title: 'Veuillez remplir tous les champs',
        description: 'Tous les champs sont obligatoires',
        variant: 'destructive',
      });
      return;
    }
    
    setUploading(true);
    setProgress(0);
    const progressInterval = simulateProgress();
    
    try {
      await uploadDocument(
        file,
        employeeId,
        companyId,
        documentType,
        {
          uploadedBy: 'current_user',
          uploadedAt: new Date().toISOString(),
        }
      );
      
      // Compléter la progression
      clearInterval(progressInterval);
      setProgress(100);
      
      // Notification de succès
      toast({
        title: 'Document téléchargé avec succès',
        description: `Le fichier ${file.name} a été téléchargé.`,
      });
      
      // Réinitialiser et fermer
      setTimeout(() => {
        resetForm();
        setOpen(false);
      }, 1000);
      
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      
      toast({
        variant: 'destructive',
        title: 'Erreur de téléchargement',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    } finally {
      setUploading(false);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setDocumentType('other');
    setEmployeeId('');
    setCompanyId('');
    setProgress(0);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Télécharger un document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Télécharger un document</DialogTitle>
          <DialogDescription>
            Téléchargez un document pour un employé
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {!uploading ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="file">Document</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
                {file && (
                  <p className="text-xs text-muted-foreground">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="documentType">Type de document</Label>
                <Select 
                  value={documentType} 
                  onValueChange={(value) => setDocumentType(value as DocumentType)}
                >
                  <SelectTrigger id="documentType">
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payslip">Bulletin de paie</SelectItem>
                    <SelectItem value="contract">Contrat</SelectItem>
                    <SelectItem value="certificate">Certificat</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="employeeId">ID de l&apos;employé</Label>
                <Input
                  id="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Entrez l'ID de l'employé"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="companyId">ID de l&apos;entreprise</Label>
                <Input
                  id="companyId"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  placeholder="Entrez l'ID de l'entreprise"
                />
              </div>
            </>
          ) : (
            <div className="py-8 space-y-4">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {progress < 100 
                  ? `Téléchargement en cours... ${progress}%` 
                  : 'Téléchargement terminé !'}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          {!uploading ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpload} disabled={!file}>
                Télécharger
              </Button>
            </>
          ) : progress === 100 ? (
            <Button onClick={() => setOpen(false)}>
              Fermer
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 