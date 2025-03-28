import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Définition des questions-réponses par catégorie
const faqCategories = [
  {
    title: "Utilisation de l'application",
    questions: [
      {
        question: "Comment générer ma première fiche de paie ?",
        answer:
          "Après vous être connecté à votre espace HelloPay, rendez-vous dans la section 'Fiches de paie' de votre tableau de bord. Cliquez sur le bouton 'Nouvelle fiche', sélectionnez l'employé concerné, puis remplissez les informations de salaire, heures travaillées et autres éléments variables. Une fois validé, le PDF est généré instantanément et peut être téléchargé ou envoyé par email."
      },
      {
        question: "Comment ajouter un nouvel employé ?",
        answer:
          "Dans votre tableau de bord, accédez à la section 'Employés' et cliquez sur 'Ajouter un employé'. Remplissez le formulaire avec les informations personnelles et contractuelles (nom, prénom, adresse, numéro de sécurité sociale, type de contrat, salaire de base, etc.). L'employé sera immédiatement disponible pour la génération de fiches de paie."
      },
      {
        question: "Comment se déroule la génération d'une fiche de paie ?",
        answer:
          "Le processus est simple : après avoir complété les informations du salarié et les éléments de salaire du mois (salaire brut, heures, primes, etc.) via notre formulaire, vous validez et HelloPay génère instantanément le bulletin au format PDF. Vous pouvez alors le télécharger, l'imprimer ou l'envoyer directement au salarié depuis l'application. Chaque bulletin reste archivé dans votre espace personnel pour consultation ultérieure."
      },
      {
        question: "Puis-je modifier une fiche de paie après sa génération ?",
        answer:
          "Oui, tant que la fiche de paie n'a pas été verrouillée (envoyée à l'employé ou marquée comme finale), vous pouvez la modifier. Rendez-vous dans la section 'Fiches de paie', trouvez le bulletin concerné et cliquez sur 'Modifier'. Une fois les changements effectués, un nouveau PDF sera généré. Attention, les modifications sont tracées dans l'historique."
      }
    ]
  },
  {
    title: "Conformité et légalité",
    questions: [
      {
        question: "La fiche de paie générée par HelloPay est-elle conforme aux exigences légales ?",
        answer:
          "Oui. HelloPay est mis à jour en permanence selon la législation française du travail. Les fiches de paie comprennent toutes les mentions obligatoires (identité employeur/salarié, détails du salaire, cotisations, net à payer, net social, etc.) et les taux de cotisation sont actualisés. Nous nous alignons sur le modèle officiel de bulletin de paie afin de garantir la conformité."
      },
      {
        question: "Les fiches de paie sont-elles mises à jour en cas de changement législatif ?",
        answer:
          "Absolument. Notre équipe juridique surveille constamment les évolutions légales affectant les bulletins de salaire. Dès qu'une nouvelle réglementation ou un changement de taux entre en vigueur, nos modèles et calculs sont automatiquement mis à jour. Vous n'avez rien à faire et vos fiches sont toujours conformes à la législation en vigueur."
      },
      {
        question: "Peut-on utiliser HelloPay pour tous les types de contrats ?",
        answer:
          "Oui, HelloPay prend en charge tous les types de contrats : CDI, CDD, intérim, temps partiel, alternance, etc. Les spécificités de chaque contrat (calcul des congés, primes, indemnités particulières) sont intégrées automatiquement dans les fiches de paie générées."
      }
    ]
  },
  {
    title: "Sécurité",
    questions: [
      {
        question: "Mes données (informations de salaire, d'entreprise…) sont-elles sécurisées ?",
        answer:
          "Absolument. Toutes les données que vous renseignez sur HelloPay sont stockées de manière chiffrée dans nos bases de données sécurisées. Les échanges entre votre navigateur et nos serveurs sont protégés par un chiffrement HTTPS. De plus, nous ne partageons jamais vos données avec des tiers sans votre consentement. Vous restez propriétaire de vos données et pouvez demander leur suppression à tout moment."
      },
      {
        question: "HelloPay est-il conforme au RGPD ?",
        answer:
          "Oui, HelloPay est entièrement conforme au Règlement Général sur la Protection des Données (RGPD). Nous collectons uniquement les données nécessaires au fonctionnement du service, nous les protégeons via des mesures de sécurité appropriées, et nous vous offrons un contrôle total sur vos informations avec possibilité de les exporter ou les supprimer. Notre politique de confidentialité détaille précisément notre traitement des données."
      },
      {
        question: "Que deviennent mes données si je résilie mon abonnement ?",
        answer:
          "Si vous résiliez votre abonnement, vos données restent accessibles en lecture seule pendant 3 mois, vous permettant de les exporter si nécessaire. Après cette période, sauf demande explicite de conservation, vos données sont anonymisées puis supprimées définitivement de nos serveurs, conformément à nos engagements RGPD."
      }
    ]
  },
  {
    title: "Facturation et abonnements",
    questions: [
      {
        question: "Quelles sont les limites de l'offre gratuite ?",
        answer:
          "L'offre gratuite permet de créer jusqu'à 5 fiches de paie par mois et d'avoir un seul utilisateur administrateur sur le compte. Elle est idéale pour découvrir l'application ou pour les très petites structures. Pour un usage plus intensif, nos offres payantes (Pro et Entreprise) permettent de lever ces limites et d'obtenir plus de support."
      },
      {
        question: "Comment fonctionnent les décomptes de fiches de paie ?",
        answer:
          "Le décompte de fiches de paie est mensuel et se réinitialise au premier jour de chaque mois. Par exemple, avec un forfait de 50 fiches/mois, vous pourriez générer ces 50 fiches à n'importe quel moment du mois. Les fiches non utilisées ne sont pas reportées au mois suivant."
      },
      {
        question: "Puis-je annuler mon abonnement à tout moment ?",
        answer:
          "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace client, section 'Abonnement'. L'annulation prend effet à la fin de la période de facturation en cours. Vous conservez l'accès à toutes les fonctionnalités jusqu'à cette date. Aucuns frais d'annulation ne sont appliqués."
      }
    ]
  },
  {
    title: "Support et assistance",
    questions: [
      {
        question: "Comment contacter le support client ?",
        answer:
          "Le support client est accessible par email à support@hellopay.fr pour tous les utilisateurs. Les clients des forfaits Pro et Entreprise bénéficient également d'un support par chat en direct disponible du lundi au vendredi, de 9h à 18h. Les clients Entreprise disposent en plus d'un numéro de téléphone dédié et d'un gestionnaire de compte attitré."
      },
      {
        question: "Proposez-vous des formations pour utiliser HelloPay ?",
        answer:
          "Oui, nous proposons des webinaires gratuits d'initiation tous les mardis à 14h. Pour les clients Entreprise, nous organisons des sessions de formation personnalisées, en présentiel ou à distance. De plus, notre centre d'aide contient de nombreux tutoriels vidéo et guides pas à pas accessibles à tous les utilisateurs."
      },
      {
        question: "Comment suggérer de nouvelles fonctionnalités ?",
        answer:
          "Nous encourageons activement les retours d'utilisateurs ! Vous pouvez nous suggérer des améliorations via le formulaire 'Suggestions' accessible depuis votre tableau de bord, ou directement par email à suggestions@hellopay.fr. Nous étudions toutes les propositions et intégrons régulièrement les plus demandées dans nos mises à jour."
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Foire Aux Questions</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Trouvez rapidement des réponses à vos questions sur HelloPay
        </p>
        
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Rechercher une question..." 
            className="pl-10"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {faqCategories.map((category, index) => (
          <div key={index} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-200">
              {category.title}
            </h2>
            
            <div className="space-y-6">
              {category.questions.map((item, qIndex) => (
                <div key={qIndex} className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">{item.question}</h3>
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-primary/5 p-8 rounded-lg max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-bold mb-4">Vous n'avez pas trouvé de réponse à votre question ?</h2>
        <p className="text-gray-600 mb-6">
          Notre équipe de support est disponible pour vous aider avec toutes vos questions spécifiques.
        </p>
        <Link 
          href="/contact" 
          className="inline-block bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Contactez-nous
        </Link>
      </div>
    </div>
  );
} 