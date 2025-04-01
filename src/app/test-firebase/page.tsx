'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export default function TestFirebasePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Surveiller l'état de l'authentification
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Fonction de connexion
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setSuccess(`Connexion réussie! Utilisateur: ${userCredential.user.email}`);
    } catch (err: any) {
      setError(`Erreur de connexion: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const handleSignup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(`Inscription réussie! Utilisateur: ${userCredential.user.email}`);
    } catch (err: any) {
      setError(`Erreur d'inscription: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await signOut(auth);
      setSuccess('Déconnexion réussie!');
    } catch (err: any) {
      setError(`Erreur de déconnexion: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Test de Firebase Authentication</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>État actuel</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div>
                <p><strong>Connecté en tant que:</strong></p>
                <p>Email: {user.email}</p>
                <p>UID: {user.uid}</p>
              </div>
            ) : (
              <p>Non connecté</p>
            )}
          </CardContent>
          <CardFooter>
            {user && (
              <Button onClick={handleLogout} disabled={loading}>
                Se déconnecter
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={handleLogin} disabled={loading || !email || !password}>
              Se connecter
            </Button>
            <Button 
              onClick={handleSignup} 
              variant="outline" 
              disabled={loading || !email || !password}
            >
              S'inscrire
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 