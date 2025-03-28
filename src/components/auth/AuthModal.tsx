'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, initialMode, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Réinitialiser le mode lorsque la modal est ouverte avec un mode initial spécifique
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Empêcher le défilement du corps lorsque la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Si la modal n'est pas ouverte, ne pas la rendre
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'login' ? 'Connexion' : 'Inscription'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {mode === 'login' ? (
          <LoginForm 
            onSuccess={onSuccess} 
            onRegisterClick={() => setMode('register')} 
          />
        ) : (
          <RegisterForm 
            onSuccess={onSuccess} 
            onLoginClick={() => setMode('login')} 
          />
        )}
      </div>
    </div>
  );
} 