"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simuler un envoi d'email (à remplacer par votre propre API)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contactez-nous</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Une question ? Une demande spécifique ? Notre équipe est là pour vous aider.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
            
            {isSubmitted ? (
              <div className="bg-green-50 text-green-600 p-6 rounded-md flex flex-col items-center text-center">
                <CheckCircle size={48} className="mb-4" />
                <h3 className="text-xl font-semibold mb-2">Message envoyé avec succès !</h3>
                <p>Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.</p>
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="mt-4"
                >
                  Envoyer un autre message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-medium">
                    Sujet <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Envoi en cours...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer le message
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  En soumettant ce formulaire, vous acceptez notre politique de confidentialité 
                  et le traitement de vos données conformément au RGPD.
                </p>
              </form>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h2 className="text-xl font-bold mb-6">Coordonnées</h2>
            
            <ul className="space-y-6">
              <li className="flex items-start">
                <Mail className="text-primary mt-1 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-gray-600">contact@hellopay.fr</p>
                </div>
              </li>
              
              <li className="flex items-start">
                <Phone className="text-primary mt-1 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-medium">Téléphone</h3>
                  <p className="text-gray-600">01 23 45 67 89</p>
                  <p className="text-sm text-gray-500">(Du lundi au vendredi, 9h-18h)</p>
                </div>
              </li>
              
              <li className="flex items-start">
                <MapPin className="text-primary mt-1 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-medium">Adresse</h3>
                  <p className="text-gray-600">
                    42 Rue de l'Innovation<br />
                    75008 Paris, France
                  </p>
                </div>
              </li>
              
              <li className="flex items-start">
                <Clock className="text-primary mt-1 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-medium">Horaires d'ouverture</h3>
                  <p className="text-gray-600">
                    Lundi - Vendredi : 9h00 - 18h00<br />
                    Fermé les weekends et jours fériés
                  </p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-primary/5 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">Délai de réponse</h3>
            <p className="text-gray-600 text-sm">
              Nous nous efforçons de répondre à toutes les demandes sous 24 heures ouvrées.
              Pour les clients avec un forfait Pro ou Entreprise, notre équipe de support
              prioritaire traite les demandes en moins de 4 heures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 