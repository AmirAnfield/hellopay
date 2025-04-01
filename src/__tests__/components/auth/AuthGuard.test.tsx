import { render, screen } from '@testing-library/react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';

// Mocks pour les hooks React
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => '/dashboard'),
}));

// Mock pour le composant LoadingScreen
jest.mock('@/components/ui/loading-screen', () => ({
  __esModule: true,
  default: jest.fn(({ message }) => <div data-testid="loading-screen">{message}</div>),
}));

describe('AuthGuard', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Configure les mocks par défaut
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
  });

  it('devrait afficher un écran de chargement pendant le chargement', () => {
    // Configure le hook useAuth pour simuler le chargement
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
      isEmailVerified: false,
    });

    render(
      <AuthGuard>
        <div>Contenu protégé</div>
      </AuthGuard>
    );

    // Vérifie l'affichage de l'écran de chargement
    expect(screen.getByTestId('loading-screen')).toHaveTextContent("Vérification de l'authentification...");
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('devrait rediriger vers la page de connexion si l\'utilisateur n\'est pas connecté', () => {
    // Configure le hook useAuth pour simuler un utilisateur non connecté
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
      isEmailVerified: false,
    });

    render(
      <AuthGuard>
        <div>Contenu protégé</div>
      </AuthGuard>
    );

    // Vérifie la redirection vers la page de connexion
    expect(mockPush).toHaveBeenCalledWith('/auth/login?callbackUrl=%2Fdashboard');
    expect(screen.getByTestId('loading-screen')).toHaveTextContent('Redirection...');
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('devrait rediriger vers la page de vérification si l\'email n\'est pas vérifié et que c\'est requis', () => {
    // Configure le hook useAuth pour simuler un utilisateur connecté avec email non vérifié
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: 'user-123', email: 'user@example.com' },
      loading: false,
      isEmailVerified: false,
    });

    render(
      <AuthGuard requireVerifiedEmail={true}>
        <div>Contenu protégé</div>
      </AuthGuard>
    );

    // Vérifie la redirection vers la page de vérification
    expect(mockPush).toHaveBeenCalledWith('/auth/verify');
    expect(screen.getByTestId('loading-screen')).toHaveTextContent('Vérification de l\'email requise, redirection...');
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  it('devrait afficher le contenu si l\'utilisateur est authentifié', () => {
    // Configure le hook useAuth pour simuler un utilisateur connecté avec email vérifié
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: 'user-123', email: 'user@example.com' },
      loading: false,
      isEmailVerified: true,
    });

    render(
      <AuthGuard>
        <div>Contenu protégé</div>
      </AuthGuard>
    );

    // Vérifie l'affichage du contenu protégé
    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
  });

  it('devrait afficher le contenu si la vérification d\'email est requise et que l\'email est vérifié', () => {
    // Configure le hook useAuth pour simuler un utilisateur connecté avec email vérifié
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: 'user-123', email: 'user@example.com' },
      loading: false,
      isEmailVerified: true,
    });

    render(
      <AuthGuard requireVerifiedEmail={true}>
        <div>Contenu protégé</div>
      </AuthGuard>
    );

    // Vérifie l'affichage du contenu protégé
    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
  });
}); 