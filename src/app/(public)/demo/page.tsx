'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon } from 'lucide-react';

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(false);

  // Effet pour l'autoplay
  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % getCurrentSlides().length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [autoplay, activeTab, currentSlide]);

  const slides = {
    dashboard: [
      {
        title: "Tableau de bord principal",
        description: "Vue d'ensemble des données clés de l'entreprise avec statistiques et graphiques. Accès rapide aux fonctionnalités principales et aux activités récentes.",
        image: "/images/demo/dashboard-main.png"
      },
      {
        title: "Activité récente",
        description: "Suivi des dernières actions et fiches de paie générées. Visualisez rapidement l'historique des opérations et les modifications importantes.",
        image: "/images/demo/dashboard-activity.png"
      }
    ],
    employees: [
      {
        title: "Liste des employés",
        description: "Interface moderne de gestion des employés avec filtres avancés et tri intelligent. Recherchez facilement par nom, département ou type de contrat.",
        image: "/images/demo/employees-list.png"
      },
      {
        title: "Création d'employé - Informations personnelles",
        description: "Formulaire ergonomique d'ajout d'employé avec onglets organisés. Cette première section permet de renseigner les informations d'identité et de contact.",
        image: "/images/demo/employee-create-1.png"
      },
      {
        title: "Création d'employé - Informations professionnelles",
        description: "Second onglet pour les informations professionnelles, avec gestion du poste, du département et du type de contrat. Interface intuitive pour une saisie rapide.",
        image: "/images/demo/employee-create-2.png"
      },
      {
        title: "Création d'employé - Rémunération",
        description: "Configuration détaillée du salaire et des avantages, avec calcul automatique des différentes composantes de la rémunération.",
        image: "/images/demo/employee-create-3.png"
      }
    ],
    payslips: [
      {
        title: "Liste des fiches de paie",
        description: "Vue d'ensemble organisée des fiches de paie avec filtres par période et statut. Retrouvez facilement l'historique complet des bulletins émis.",
        image: "/images/demo/payslips-list.png"
      },
      {
        title: "Création de fiche de paie - Sélection de l'employé",
        description: "Première étape simplifiée avec sélection du salarié et de la période. Interface optimisée pour éviter les erreurs de saisie.",
        image: "/images/demo/payslip-create-1.png"
      },
      {
        title: "Création de fiche de paie - Configuration",
        description: "Définition intuitive des paramètres avec calcul en temps réel des cotisations et du net à payer. Visualisez instantanément l'impact de vos modifications.",
        image: "/images/demo/payslip-create-2.png"
      },
      {
        title: "Prévisualisation de fiche de paie",
        description: "Aperçu fidèle du document final avant validation, avec possibilité de vérifier tous les détails et d'effectuer les derniers ajustements.",
        image: "/images/demo/payslip-preview.png"
      }
    ],
    onboarding: [
      {
        title: "Bienvenue sur HelloPay",
        description: "Première étape de l'onboarding avec présentation claire des avantages et fonctionnalités de l'application. Un parcours guidé pour démarrer facilement.",
        image: "/images/demo/onboarding-1.png"
      },
      {
        title: "Configuration de l'entreprise",
        description: "Interface simplifiée pour renseigner les informations essentielles de votre entreprise et vos coordonnées. Toutes ces données pourront être modifiées ultérieurement.",
        image: "/images/demo/onboarding-2.png"
      },
      {
        title: "Préférences de paie",
        description: "Configuration personnalisée des paramètres par défaut pour les fiches de paie, avec options adaptées à votre convention collective.",
        image: "/images/demo/onboarding-3.png"
      },
      {
        title: "Confirmation et guide de démarrage",
        description: "Récapitulatif clair et étapes suivantes recommandées pour démarrer rapidement avec l'application. Un guide pas à pas pour vous accompagner.",
        image: "/images/demo/onboarding-4.png"
      }
    ]
  };

  const getCurrentSlides = () => {
    return slides[activeTab as keyof typeof slides] || [];
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % getCurrentSlides().length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + getCurrentSlides().length) % getCurrentSlides().length);
  };

  const toggleAutoplay = () => {
    setAutoplay(prev => !prev);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Découvrez HelloPay</h1>
        <p className="text-lg text-gray-600 mb-4">
          Explorez l&apos;interface moderne et intuitive de notre solution de gestion de paie. 
          Une expérience utilisateur optimisée pour simplifier vos tâches administratives.
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button variant="outline" onClick={toggleAutoplay} className="flex items-center gap-2">
            <Play className={`h-4 w-4 ${autoplay ? 'text-green-600' : ''}`} />
            {autoplay ? 'Arrêter' : 'Démarrer'} le diaporama
          </Button>
          <Link href="/auth/register">
            <Button>Essayer gratuitement</Button>
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setCurrentSlide(0); }} className="w-full">
          <TabsList className="flex w-full p-0 bg-gray-50 border-b border-gray-200">
            <TabsTrigger 
              value="dashboard" 
              className="flex-1 rounded-none border-r border-gray-200 py-3 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger 
              value="employees" 
              className="flex-1 rounded-none border-r border-gray-200 py-3 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              Gestion des employés
            </TabsTrigger>
            <TabsTrigger 
              value="payslips" 
              className="flex-1 rounded-none border-r border-gray-200 py-3 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              Fiches de paie
            </TabsTrigger>
            <TabsTrigger 
              value="onboarding" 
              className="flex-1 rounded-none py-3 data-[state=active]:bg-white data-[state=active]:shadow-none"
            >
              Onboarding
            </TabsTrigger>
          </TabsList>
          
          {Object.keys(slides).map((tab) => (
            <TabsContent key={tab} value={tab} className="m-0 p-0">
              <div className="relative">
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
                      <span>Aperçu de l&apos;interface {tab}</span>
                    </div>
                  </div>
                  
                  {/* Navigation */}
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100 bg-white/80 hover:bg-white"
                    onClick={prevSlide}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full opacity-80 hover:opacity-100 bg-white/80 hover:bg-white"
                    onClick={nextSlide}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Progression */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
                    style={{ width: `${((currentSlide + 1) / getCurrentSlides().length) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {getCurrentSlides()[currentSlide]?.title}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{currentSlide + 1}</span>
                    <span className="mx-1">/</span>
                    <span>{getCurrentSlides().length}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-lg">
                  {getCurrentSlides()[currentSlide]?.description}
                </p>
                
                {/* Miniatures de navigation */}
                <div className="mt-6 flex gap-2 overflow-x-auto py-2 scrollbar-hide">
                  {getCurrentSlides().map((slide, index) => (
                    <div 
                      key={index} 
                      className={`
                        flex-shrink-0 w-16 h-8 rounded cursor-pointer 
                        ${currentSlide === index ? 'ring-2 ring-blue-600 ring-offset-2' : 'opacity-60 hover:opacity-100'}
                      `}
                      style={{ backgroundColor: currentSlide === index ? '#E1EFFE' : '#F3F4F6' }}
                      onClick={() => setCurrentSlide(index)}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      <div className="mt-12 text-center border-t border-gray-200 pt-8">
        <h3 className="text-xl font-semibold mb-4">Prêt à simplifier votre gestion de paie ?</h3>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          HelloPay offre une solution complète et intuitive pour la gestion de vos fiches de paie.
          Essayez gratuitement et découvrez comment nous pouvons vous faire gagner du temps.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/pricing">
            <Button variant="outline">Voir les tarifs</Button>
          </Link>
          <Link href="/auth/register">
            <Button>Essayer gratuitement</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 