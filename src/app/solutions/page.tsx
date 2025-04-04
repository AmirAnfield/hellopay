import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Calculator
} from 'lucide-react';

export const metadata = {
  title: 'Solutions HelloPay - Simplifiez vos documents RH',
  description: 'Découvrez comment HelloPay peut vous aider à gérer vos fiches de paie, contrats et documents RH efficacement.',
};

export default function SolutionsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* En-tête de la page */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-secondary/30 to-background">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col items-center space-y-3 text-center">
            <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
              Nos Solutions
            </h1>
            <p className="mx-auto max-w-[650px] text-muted-foreground text-base md:text-lg">
              Des outils adaptés à vos besoins pour simplifier la gestion de vos ressources humaines.
            </p>
          </div>
        </div>
      </section>
      
      {/* Section fiches de paie */}
      <section className="py-10 bg-background">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="p-1.5 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Fiches de paie simplifiées</h2>
              <p className="text-muted-foreground text-sm">
                Générez des bulletins de paie conformes à la législation française en quelques clics.
                Notre solution prend en charge tous les calculs complexes automatiquement.
              </p>
              <ul className="space-y-1.5 mt-3 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Calcul automatique des cotisations sociales</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Gestion des congés payés intégrée</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Export PDF sécurisé</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Historique complet des documents</span>
                </li>
              </ul>
              <div className="pt-3">
                <Button asChild size="sm">
                  <Link href="/demo" className="flex items-center text-sm">
                    Essayer maintenant
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-elevation-2 bg-card p-4">
              <div className="border border-border rounded-md p-3 space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-semibold text-sm">Bulletin de paie</h3>
                  <span className="text-xs text-muted-foreground">Janvier 2023</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">Salaire brut</p>
                    <p className="font-medium">2 500,00 €</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">Net à payer</p>
                    <p className="font-medium text-primary">1 950,75 €</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">Cotisations salariales</p>
                    <p className="font-medium">549,25 €</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground">Cotisations patronales</p>
                    <p className="font-medium">1 025,50 €</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section contrats */}
      <section className="py-10 bg-card">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="order-2 md:order-1 rounded-xl overflow-hidden shadow-elevation-2 bg-background p-4">
              <div className="border border-border rounded-md p-3 space-y-3">
                <div className="border-b pb-2">
                  <h3 className="font-semibold text-sm">Contrat de travail à durée indéterminée</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <p className="italic text-muted-foreground">Article 1 - Objet du contrat</p>
                  <p>Le présent contrat a pour objet de définir les conditions d&apos;emploi du Salarié au sein de la Société.</p>
                  <p className="italic text-muted-foreground">Article 2 - Nature de l&apos;engagement</p>
                  <p>Le Salarié est engagé pour une durée indéterminée à compter du ...</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs">Modifier</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-3">
              <div className="p-1.5 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Contrats et documents juridiques</h2>
              <p className="text-muted-foreground text-sm">
                Générez des contrats de travail et autres documents juridiques adaptés à vos besoins.
                Tous nos modèles sont conformes à la législation en vigueur.
              </p>
              <ul className="space-y-1.5 mt-3 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Modèles de contrats personnalisables</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Clauses juridiques à jour</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Avenants et notifications automatisés</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Gestion des signatures électroniques</span>
                </li>
              </ul>
              <div className="pt-3">
                <Button asChild size="sm">
                  <Link href="/demo" className="flex items-center text-sm">
                    Découvrir
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section gestion des employés */}
      <section className="py-10 bg-background">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
              <div className="p-1.5 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Gestion des employés</h2>
              <p className="text-muted-foreground text-sm">
                Centralisez les informations de vos employés dans un espace sécurisé et facile d&apos;accès.
                Suivez l&apos;évolution de votre équipe en temps réel.
              </p>
              <ul className="space-y-1.5 mt-3 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Fiches employés complètes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Suivi des documents par employé</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Historique des modifications</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Import/export des données</span>
                </li>
              </ul>
              <div className="pt-3">
                <Button asChild size="sm">
                  <Link href="/demo" className="flex items-center text-sm">
                    En savoir plus
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-elevation-2 bg-card p-4">
              <div className="border border-border rounded-md divide-y">
                <div className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Martin Dupont</p>
                      <p className="text-xs text-muted-foreground">Développeur</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">Détails</Button>
                </div>
                <div className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Sophie Martin</p>
                      <p className="text-xs text-muted-foreground">Cheffe de projet</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">Détails</Button>
                </div>
                <div className="p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Julien Petit</p>
                      <p className="text-xs text-muted-foreground">Designer UX</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">Détails</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section calculateur */}
      <section className="py-10 bg-card">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="order-2 md:order-1 rounded-xl overflow-hidden shadow-elevation-2 bg-background p-4">
              <div className="border border-border rounded-md p-3 space-y-3">
                <div className="border-b pb-2">
                  <h3 className="font-semibold text-sm">Simulateur de coût employeur</h3>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Salaire brut mensuel</p>
                      <p className="font-medium text-sm">2 500,00 €</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Coût employeur</p>
                      <p className="font-medium text-sm text-primary">3 525,50 €</p>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '71%' }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Cotisations = 41% du salaire brut
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-3">
              <div className="p-1.5 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Simulateurs et calculs</h2>
              <p className="text-muted-foreground text-sm">
                Utilisez nos outils de simulation pour anticiper vos coûts salariaux et optimiser
                votre masse salariale en toute simplicité.
              </p>
              <ul className="space-y-1.5 mt-3 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Calcul du coût employeur</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Simulation d&apos;embauche</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Prévision de la masse salariale</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0 mr-2" />
                  <span>Comparaison des scénarios</span>
                </li>
              </ul>
              <div className="pt-3">
                <Button asChild size="sm">
                  <Link href="/demo" className="flex items-center text-sm">
                    Essayer le simulateur
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-10 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <h2 className="text-2xl font-bold tracking-tighter md:text-3xl/tight">
              Prêt à simplifier votre gestion RH ?
            </h2>
            <p className="mx-auto max-w-[650px] text-primary-foreground/90 text-sm md:text-base">
              Commencez dès aujourd&apos;hui avec HelloPay et concentrez-vous sur ce qui compte vraiment : votre entreprise.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button size="sm" variant="secondary">
                <Link href="/auth/register" className="text-sm">
                  Créer un compte gratuit
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20">
                <Link href="/demo" className="text-sm">
                  Essayer la démo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-background/80 border-t border-border/30">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
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