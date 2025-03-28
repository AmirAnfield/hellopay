'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface UserProfileProps {
  userInfo: {
    name: string
    email: string
    company?: string
    role?: string
  }
}

export function UserProfile({ userInfo }: UserProfileProps) {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: userInfo.name,
    company: userInfo.company || '',
    role: userInfo.role || ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Profil mis à jour',
          description: 'Vos informations ont été mises à jour avec succès.',
          variant: 'default',
        })
        setIsEditing(false)
      } else {
        throw new Error('Erreur lors de la mise à jour du profil')
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour du profil.',
        variant: 'destructive',
      })
      console.error('Erreur:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: userInfo.name,
      company: userInfo.company || '',
      role: userInfo.role || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Consultez et modifiez vos informations personnelles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userInfo.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                L'adresse email ne peut pas être modifiée.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? 'bg-muted' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Entreprise</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? 'bg-muted' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Fonction</Label>
              <Input
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? 'bg-muted' : ''}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
              <Button type="submit" form="profile-form">
                Enregistrer
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Modifier
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>
            Gérez la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Mot de passe actuel</Label>
            <Input
              id="current-password"
              type="password"
              disabled={!isEditing}
              className={!isEditing ? 'bg-muted' : ''}
              placeholder="••••••••"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input
              id="new-password"
              type="password"
              disabled={!isEditing}
              className={!isEditing ? 'bg-muted' : ''}
              placeholder="••••••••"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
            <Input
              id="confirm-password"
              type="password"
              disabled={!isEditing}
              className={!isEditing ? 'bg-muted' : ''}
              placeholder="••••••••"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled={!isEditing} className="ml-auto">
            Changer le mot de passe
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Préférences</CardTitle>
          <CardDescription>
            Gérez vos préférences d'utilisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cette fonctionnalité sera disponible dans une prochaine mise à jour.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 