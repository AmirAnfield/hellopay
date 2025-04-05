'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { 
  CheckCircle, 
  ArrowRight,
  Calculator,
  Euro
} from 'lucide-react';

export default function HomePageClient() {
  const [salary, setSalary] = useState(3000);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Calcul des cotisations (simplifié pour la démonstration)
  const employeeContributions = Math.round(salary * 0.22); // 22% de cotisations salariales
  const employerContributions = Math.round(salary * 0.42); // 42% de cotisations patronales
  const netSalary = salary - employeeContributions;
  const totalCost = salary + employerContributions;
  
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setSalary(value);
    
    // Animation de calcul
    setIsCalculating(true);
    setTimeout(() => setIsCalculating(false), 300);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Section Héro */}
      <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
        {/* Image d'arrière-plan */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero/image001.png" 
            alt="Fond" 
            className="w-full h-full object-cover" 
          />
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto py-20">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Générez vos bulletins de paie sans effort.
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-200">
              HelloPay vous simplifie la paie, gratuitement et sans engagement.
            </p>
            <p className="mt-2 text-sm text-gray-300">
              ⭐ Noté 4.8/5 par plus de 5 000 utilisateurs
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-primary text-white text-base font-medium hover:bg-primary/90 transition"
              >
                Essayer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section Simulateur de Salaire */}
      <section className="py-16 bg-card">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2 max-w-[800px]">
              <Badge variant="outline" className="mb-2 border-primary/20 bg-primary/10 text-primary px-4 py-1 rounded-full">
                Simulateur
              </Badge>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Calculez le salaire net en 2 secondes
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Découvrez combien votre équipe coûte réellement et ce qu&apos;elle perçoit vraiment
              </p>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto mt-12 rounded-2xl bg-background p-8 shadow-elevation-2">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium">Hugo</h3>
                    <p className="text-muted-foreground">Développeur Back-end • CDI 35h</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="flex flex-col text-left">
                    <span className="text-sm font-medium mb-2">Salaire brut mensuel</span>
                    <div className="relative">
                      <input
                        type="number"
                        value={salary}
                        onChange={handleSalaryChange}
                        className="w-full rounded-lg border border-input bg-transparent px-5 py-3 text-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        min="0"
                        step="100"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Euro className="h-5 w-5" />
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-5 bg-muted p-6 rounded-xl relative overflow-hidden">
                <div className={`absolute inset-0 bg-primary/5 transition-opacity duration-300 ${isCalculating ? 'opacity-100' : 'opacity-0'}`}></div>
                
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Coût employeur total</p>
                  <p className="text-2xl font-bold text-primary/90">{totalCost.toLocaleString('fr-FR')} €</p>
                </div>
                
                <div className="h-1 w-full bg-background/50 rounded-full">
                  <div className={`bg-gradient-to-r from-primary/70 to-primary h-full rounded-full transition-all duration-500 ease-out ${isCalculating ? 'w-0' : ''}`} style={{ width: '100%' }}></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Cotisations patronales</p>
                    <p className="text-xl font-semibold">{employerContributions.toLocaleString('fr-FR')} €</p>
                  </div>
                  
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Cotisations salariales</p>
                    <p className="text-xl font-semibold">{employeeContributions.toLocaleString('fr-FR')} €</p>
                  </div>
                </div>
                
                <div className="text-left pt-2 border-t border-background/30">
                  <p className="text-sm text-muted-foreground">Salaire net avant impôt</p>
                  <p className="text-2xl font-bold text-primary">{netSalary.toLocaleString('fr-FR')} €</p>
                  <p className="text-xs text-muted-foreground mt-1">*Simulation pour un statut non-cadre en France métropolitaine</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 flex justify-center">
              <Link
                href="/demo"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition"
              >
                Explorer toutes nos fonctionnalités
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section Tarifs */}
      <section className="py-12 bg-background">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <div className="space-y-1 max-w-[700px]">
              <Badge variant="outline" className="mb-1 border-primary/20 bg-primary/10 text-primary px-3 py-0.5 rounded-full text-xs">
                Tarifs
              </Badge>
              <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">
                Des offres adaptées à vos besoins
              </h2>
              <p className="mx-auto max-w-[650px] text-muted-foreground md:text-lg/relaxed lg:text-sm/relaxed xl:text-base/relaxed mb-2">
                Choisissez le forfait qui correspond le mieux à votre entreprise
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-10 px-4 md:px-12">
            {/* Offre À l'unité */}
            <div className="rounded-xl bg-card p-5 border border-border shadow-soft hover:shadow-elevation-2 transition-all flex flex-col h-full">
              <div className="mb-3">
                <h3 className="text-lg font-bold">À l&apos;unité</h3>
                <p className="text-muted-foreground text-sm">Pour des besoins ponctuels</p>
              </div>
              
              <div className="mb-3">
                <p className="text-2xl font-bold">14,90 €<span className="text-base font-normal text-muted-foreground">/document</span></p>
                <p className="text-xs text-muted-foreground">Paiement à l&apos;utilisation</p>
              </div>
              
              <ul className="space-y-2 mb-5 flex-grow text-sm">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-1.5 mt-0.5" />
                  <span>Fiches de paie à l&apos;unité</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-1.5 mt-0.5" />
                  <span>Attestations à l&apos;unité</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-1.5 mt-0.5" />
                  <span>Contrats à l&apos;unité</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-1.5 mt-0.5" />
                  <span>Support par email</span>
                </li>
              </ul>
              
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition mt-auto w-full"
              >
                Commencer
              </Link>
            </div>

            {/* Pack Start */}
            <div className="rounded-xl bg-card p-5 border-2 border-primary shadow-elevation-2 flex flex-col h-full relative">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground py-0.5 px-2 text-xs font-medium rounded-bl-lg rounded-tr-lg">
                Populaire
              </div>
              
              <div className="mb-3">
                <h3 className="text-lg font-bold">Pack Start</h3>
                <p className="text-muted-foreground text-sm">Pour les petites entreprises</p>
              </div>
              
              <div className="mb-3">
                <p className="text-2xl font-bold">49,90 €<span className="text-base font-normal text-muted-foreground">/employé</span></p>
                <p className="text-xs text-muted-foreground">Facturation annuelle</p>
              </div>
              
              <ul className="space-y-2 mb-5 flex-grow text-sm">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-1.5 mt-0.5" />
                  <span>4 fiches de paie</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-1.5 mt-0.5" />
                  <span>1 attestation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-1.5 mt-0.5" />
                  <span>1 contrat</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-1.5 mt-0.5" />
                  <span>Support prioritaire</span>
                </li>
              </ul>
              
              <Link
                href="/auth/register?plan=start"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition mt-auto w-full"
              >
                Choisir ce pack
              </Link>
            </div>

            {/* Pack Premium */}
            <div className="rounded-xl bg-card p-5 border border-border shadow-soft hover:shadow-elevation-2 transition-all flex flex-col h-full">
              <div className="mb-3">
                <h3 className="text-lg font-bold">Pack Premium</h3>
                <p className="text-muted-foreground text-sm">Pour une gestion complète</p>
              </div>
              
              <div className="mb-3">
                <p className="text-2xl font-bold">79,90 €<span className="text-base font-normal text-muted-foreground">/employé</span></p>
                <p className="text-xs text-muted-foreground">Facturation annuelle</p>
              </div>
              
              <ul className="space-y-2 mb-5 flex-grow text-sm">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-1.5 mt-0.5" />
                  <span>12 fiches de paie</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-1.5 mt-0.5" />
                  <span>1 attestation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-1.5 mt-0.5" />
                  <span>1 contrat</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-1.5 mt-0.5" />
                  <span>Support dédié</span>
                </li>
              </ul>
              
              <Link
                href="/auth/register?plan=premium"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition mt-auto w-full"
              >
                Choisir ce pack
              </Link>
            </div>
          </div>
          
          <div className="mt-10 text-center">
            <Link
              href="/tarifs"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition"
            >
              Voir tous les détails des tarifs
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
            <p className="text-xs text-muted-foreground mt-4">
              Version bêta - Nos offres sont en cours de développement et d&apos;amélioration
            </p>
          </div>
        </div>
      </section>
      
      {/* Section Avis Clients */}
      <section className="py-8 bg-muted/60">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-2 text-center mb-6">
            <h2 className="text-xl font-semibold">Ce que nos clients disent</h2>
            <p className="text-sm text-muted-foreground max-w-[550px]">
              Découvrez les témoignages de nos utilisateurs qui utilisent HelloPay au quotidien
            </p>
          </div>
          
          <div className="relative overflow-hidden">
            <div className="flex animate-testimonials">
              {/* Premier groupe de témoignages */}
              <div className="flex gap-4 px-4 min-w-full">
                <div className="bg-card rounded-lg p-4 shadow-soft border border-border flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="flex text-primary">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-0.5">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm italic">
                      &ldquo;HelloPay a simplifié notre gestion des fiches de paie. Nous économisons un temps précieux chaque mois et nos employés sont ravis de la clarté des documents.&rdquo;
                    </p>
                    <div className="pt-2">
                      <p className="font-medium text-sm">Marie L.</p>
                      <p className="text-xs text-muted-foreground">Directrice RH, PME de 45 employés</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg p-4 shadow-soft border border-border flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="flex text-primary">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-0.5">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm italic">
                      &ldquo;Interface intuitive et service client réactif. La génération des contrats automatisée nous a fait gagner beaucoup de temps lors de nos recrutements.&rdquo;
                    </p>
                    <div className="pt-2">
                      <p className="font-medium text-sm">Thomas D.</p>
                      <p className="text-xs text-muted-foreground">Fondateur, Startup Tech</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Deuxième groupe de témoignages (dupliqué pour l'animation) */}
              <div className="flex gap-4 px-4 min-w-full">
                <div className="bg-card rounded-lg p-4 shadow-soft border border-border flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="flex text-primary">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-0.5">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm italic">
                      &ldquo;Excellent rapport qualité-prix. Le pack Premium nous permet de gérer facilement les fiches de paie pour toute notre équipe.&rdquo;
                    </p>
                    <div className="pt-2">
                      <p className="font-medium text-sm">Alexandre M.</p>
                      <p className="text-xs text-muted-foreground">Gérant, Cabinet d&apos;architectes</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-lg p-4 shadow-soft border border-border flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="flex text-primary">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="mr-0.5">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm italic">
                      &ldquo;Le simulateur de salaire est un outil précieux pour notre planification budgétaire. Merci HelloPay pour cette solution complète et abordable !&rdquo;
                    </p>
                    <div className="pt-2">
                      <p className="font-medium text-sm">Sophie R.</p>
                      <p className="text-xs text-muted-foreground">CFO, Agence marketing</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <div className="w-2 h-2 rounded-full bg-primary/30"></div>
              <div className="w-2 h-2 rounded-full bg-primary/30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section End Page et Footer combinés */}
      <footer className="py-8 bg-background/80 border-t border-border/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-3 text-center">
            <div className="mb-3 flex flex-wrap justify-center gap-3">
              <Link 
                href="/mentions-legales" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Mentions légales
              </Link>
              <span className="text-xs text-muted-foreground">•</span>
              <Link 
                href="/confidentialite" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Politique de confidentialité
              </Link>
              <span className="text-xs text-muted-foreground">•</span>
              <Link 
                href="/cgu" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                CGU
              </Link>
              <span className="text-xs text-muted-foreground">•</span>
              <Link 
                href="/contact" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </div>
            <p className="text-xs text-muted-foreground/70 mb-3">
              HelloPay – Simplifiez votre gestion des ressources humaines
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} HelloPay. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 