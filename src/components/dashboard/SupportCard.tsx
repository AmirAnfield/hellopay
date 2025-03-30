import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LifeBuoy, Mail, MessageSquare, BookOpen } from 'lucide-react';

export function SupportCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <LifeBuoy className="h-5 w-5 text-primary" />
          Aide et support
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 mb-3">
          Besoin d&apos;assistance ? Nous sommes là pour vous aider !
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="flex items-center justify-start gap-2 h-auto py-3"
            onClick={() => window.open('mailto:support@hellopay.fr')}
          >
            <Mail className="h-4 w-4 text-blue-500" />
            <div className="text-left">
              <div className="font-medium">Email</div>
              <div className="text-xs text-gray-500">support@hellopay.fr</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-start gap-2 h-auto py-3"
            onClick={() => window.open('/faq')}
          >
            <BookOpen className="h-4 w-4 text-amber-500" />
            <div className="text-left">
              <div className="font-medium">FAQ</div>
              <div className="text-xs text-gray-500">Questions fréquentes</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-start gap-2 h-auto py-3 md:col-span-2"
            onClick={() => window.open('https://chat.hellopay.fr')}
          >
            <MessageSquare className="h-4 w-4 text-green-500" />
            <div className="text-left">
              <div className="font-medium">Chat en direct</div>
              <div className="text-xs text-gray-500">Disponible de 9h à 18h en semaine</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 