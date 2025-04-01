import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

// Mock du hook useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock pour react-hook-form (utilisé par le composant)
jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
}));

describe('ResetPasswordForm', () => {
  const mockResetPassword = jest.fn();
  const mockRouterPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuration du mock useAuth
    (useAuth as jest.Mock).mockReturnValue({
      resetPassword: mockResetPassword,
    });
    
    // Configuration du mock useRouter
    require('next/navigation').useRouter.mockReturnValue({
      push: mockRouterPush,
    });
  });
  
  it('devrait afficher le formulaire de réinitialisation de mot de passe', () => {
    render(<ResetPasswordForm />);
    
    expect(screen.getByRole('heading')).toHaveTextContent('Réinitialisation du mot de passe');
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /réinitialiser/i })).toBeInTheDocument();
  });
  
  it('devrait appeler resetPassword avec l\'email saisi', async () => {
    mockResetPassword.mockResolvedValue(undefined);
    
    render(<ResetPasswordForm />);
    
    // Saisir une adresse email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /réinitialiser/i }));
    
    // Vérifier que resetPassword a été appelé avec l'email
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });
  
  it('devrait afficher un message de succès après la réinitialisation', async () => {
    mockResetPassword.mockResolvedValue(undefined);
    
    render(<ResetPasswordForm />);
    
    // Saisir une adresse email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /réinitialiser/i }));
    
    // Vérifier l'affichage du message de succès
    await waitFor(() => {
      expect(screen.getByText(/instructions.*envoyées/i)).toBeInTheDocument();
    });
  });
  
  it('devrait afficher une erreur si la réinitialisation échoue', async () => {
    // Simuler une erreur lors de la réinitialisation
    mockResetPassword.mockRejectedValue(new Error('Adresse email invalide'));
    
    render(<ResetPasswordForm />);
    
    // Saisir une adresse email
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /réinitialiser/i }));
    
    // Vérifier l'affichage du message d'erreur
    await waitFor(() => {
      expect(screen.getByText(/adresse email invalide/i)).toBeInTheDocument();
    });
  });
}); 