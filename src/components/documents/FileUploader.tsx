'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { UploadCloud, X, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { uploadEmployeeDocument, DocumentType } from '@/services/storage-service';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  employeeId: string;
  documentType: DocumentType;
  documentId?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
  maxFileSizeMB?: number;
  allowedTypes?: string[];
  className?: string;
}

export function FileUploader({
  employeeId,
  documentType,
  documentId,
  onSuccess,
  onError,
  maxFileSizeMB = 10,
  allowedTypes = ['application/pdf'],
  className
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fonction simulant la progression pour une meilleure UX
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

  const validateFile = (file: File): boolean => {
    // Vérifier le type de fichier
    if (!allowedTypes.includes(file.type)) {
      setError(`Type de fichier non supporté. Types acceptés: ${allowedTypes.join(', ')}`);
      return false;
    }
    
    // Vérifier la taille du fichier
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setError(`Le fichier est trop volumineux. Taille maximale: ${maxFileSizeMB}MB`);
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    setSuccess(false);
    setError(null);
    
    const progressInterval = simulateProgress();
    
    try {
      const url = await uploadEmployeeDocument(
        file, 
        employeeId, 
        documentType, 
        documentId
      );
      
      // Compléter la progression
      clearInterval(progressInterval);
      setProgress(100);
      setSuccess(true);
      
      // Notification de succès
      toast({
        title: 'Document téléchargé avec succès',
        description: `Le fichier ${file.name} a été téléchargé.`,
      });
      
      // Callback de succès
      if (onSuccess) onSuccess(url);
      
      // Réinitialiser après un certain délai
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setFile(null);
      }, 3000);
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      
      const errorMessage = err instanceof Error ? err.message : 'Erreur de téléchargement';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Erreur de téléchargement',
        description: errorMessage,
      });
      
      if (onError && err instanceof Error) onError(err);
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        {!file ? (
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 p-4 bg-primary-50 rounded-full">
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Télécharger un document</h3>
            <p className="text-sm text-gray-500 text-center mb-4">
              Glissez-déposez un fichier ou cliquez pour parcourir
            </p>
            <Input
              type="file"
              accept={allowedTypes.join(',')}
              onChange={handleFileChange}
              ref={fileInputRef}
              className="max-w-xs"
            />
            <p className="text-xs text-gray-400 mt-2">
              Formats acceptés: {allowedTypes.join(', ')} (max {maxFileSizeMB}MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-50 p-2 rounded">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={cancelUpload}
                disabled={uploading}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 text-right">{progress}%</p>
              </div>
            )}
            
            {error && (
              <div className="flex items-center space-x-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="flex items-center space-x-2 text-green-500 text-sm">
                <CheckCircle className="h-4 w-4" />
                <p>Document téléchargé avec succès</p>
              </div>
            )}
            
            {!uploading && !success && (
              <div className="flex justify-end">
                <Button onClick={handleUpload}>Télécharger</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 