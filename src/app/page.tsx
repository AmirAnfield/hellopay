import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  FileText, 
  PieChart, 
  Shield, 
  Clock, 
  CreditCard,
  ArrowRight,
  Download 
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section Héro */}
      <section className="py-16 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-10 text-center">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Simplifiez vos fiches de paie avec HelloPay
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Solution intuitive pour générer, gérer et suivre vos fiches de paie en quelques clics. Adaptée aux entreprises de toutes tailles.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  Essayer gratuitement
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/demo">
                  Découvrir la démo
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/workflow-test">
                  Tester le workflow
                </Link>
              </Button>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="mx-auto aspect-video overflow-hidden rounded-xl bg-slate-100 object-cover object-center dark:bg-slate-800 sm:w-full lg:order-last">
                <div className="flex h-full items-center justify-center">
                  <FileText className="h-24 w-24 text-muted-foreground/40" />
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-left">Génération de fiches de paie conforme à la législation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-left">Calcul automatique des cotisations sociales</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-left">Export en PDF prêt à distribuer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-left">Historique et suivi des fiches de paie</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm">
                Fonctionnalités
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Tout ce dont vous avez besoin pour vos fiches de paie
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                HelloPay vous offre des outils puissants et faciles à utiliser pour gérer vos fiches de paie efficacement
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Fiches de paie personnalisées</h3>
              <p className="text-muted-foreground text-center">
                Créez des fiches de paie complètes et personnalisées pour chaque employé
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <PieChart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Calculs automatisés</h3>
              <p className="text-muted-foreground text-center">
                Calculez automatiquement les salaires, cotisations et déductions
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Sécurité des données</h3>
              <p className="text-muted-foreground text-center">
                Protégez vos informations avec notre système de sécurité avancé
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Gain de temps</h3>
              <p className="text-muted-foreground text-center">
                Réduisez considérablement le temps consacré à la gestion des paies
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Export facile</h3>
              <p className="text-muted-foreground text-center">
                Exportez vos fiches de paie au format PDF en un seul clic
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Tarifs transparents</h3>
              <p className="text-muted-foreground text-center">
                Des offres adaptées à tous les budgets sans frais cachés
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Tarifs */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm">
                Tarifs
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Des tarifs simples et transparents
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Choisissez le plan qui correspond le mieux à vos besoins
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
            <div className="flex flex-col rounded-lg border shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-bold">Starter</h3>
                <div className="mt-4 flex items-baseline text-slate-900 dark:text-slate-50">
                  <span className="text-3xl font-bold tracking-tight">9,99 €</span>
                  <span className="ml-1 text-sm font-medium text-muted-foreground">/mois</span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">Jusqu&apos;à 5 employés</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">Génération de fiches de paie</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">Export PDF</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">Support par email</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col px-6 py-4 border-t">
                <Button size="lg">
                  S&apos;abonner
                </Button>
              </div>
            </div>
            <div className="flex flex-col rounded-lg border shadow-sm relative">
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Populaire
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold">Pro</h3>
                <div className="mt-4 flex items-baseline text-slate-900 dark:text-slate-50">
                  <span className="text-3xl font-bold tracking-tight">19,99 €</span>
                  <span className="ml-1 text-sm font-medium text-muted-foreground">/mois</span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">Jusqu&apos;à 20 employés</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">Toutes les fonctionnalités Starter</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">Historique des fiches de paie</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">Support prioritaire</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">Gestion multi-entreprises</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col px-6 py-4 border-t">
                <Button size="lg" className="bg-primary">
                  S&apos;abonner
                </Button>
              </div>
            </div>
            <div className="flex flex-col rounded-lg border shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-bold">Enterprise</h3>
                <div className="mt-4 flex items-baseline text-slate-900 dark:text-slate-50">
                  <span className="text-3xl font-bold tracking-tight">49,99 €</span>
                  <span className="ml-1 text-sm font-medium text-muted-foreground">/mois</span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">Employés illimités</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">Toutes les fonctionnalités Pro</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">API pour intégration</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">Support dédié 24/7</span>
                  </li>
                  <li className="flex">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                    <span className="ml-3 text-sm">Formation personnalisée</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col px-6 py-4 border-t">
                <Button size="lg">
                  Nous contacter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Prêt à simplifier votre gestion de paie ?
              </h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed">
                Rejoignez des milliers d&apos;entreprises qui font confiance à HelloPay pour leurs fiches de paie
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/register">
                  Créer un compte gratuitement
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10" asChild>
                <Link href="/contact">
                  <span className="flex items-center">
                    Parler à un expert
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
