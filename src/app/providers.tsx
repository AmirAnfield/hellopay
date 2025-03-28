"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthState = {
  isAuthenticated: boolean;
  user: {
    id?: string;
    email?: string;
    name?: string;
  } | null;
};

type AuthContextType = {
  auth: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const AuthContext = createContext<AuthContextType>({
  auth: defaultAuthState,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function Providers({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(defaultAuthState);

  // Vérifier si l'utilisateur est déjà authentifié au chargement
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        setAuth(parsedAuth);
      } catch (error) {
        console.error('Erreur lors de la récupération des données d\'authentification', error);
        localStorage.removeItem('auth');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulation d'une API d'authentification
    try {
      // Dans une vraie application, ce serait un appel API
      const user = { id: '1', email, name: 'Utilisateur Test' };
      
      const newAuthState: AuthState = {
        isAuthenticated: true,
        user,
      };
      
      setAuth(newAuthState);
      localStorage.setItem('auth', JSON.stringify(newAuthState));
    } catch (error) {
      console.error('Erreur de connexion', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    // Simulation d'une API d'enregistrement
    try {
      // Dans une vraie application, ce serait un appel API
      const user = { id: '1', email, name };
      
      const newAuthState: AuthState = {
        isAuthenticated: true,
        user,
      };
      
      setAuth(newAuthState);
      localStorage.setItem('auth', JSON.stringify(newAuthState));
    } catch (error) {
      console.error('Erreur d\'enregistrement', error);
      throw error;
    }
  };

  const logout = () => {
    setAuth(defaultAuthState);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ auth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
} 