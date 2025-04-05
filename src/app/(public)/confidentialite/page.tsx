import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité | HelloPay",
  description: "Politique de confidentialité et traitement des données personnelles de HelloPay",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Politique de confidentialité</h1>
          <p className="text-gray-600">
            Comment nous protégeons vos données personnelles
          </p>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p>
              La protection de vos données personnelles est une priorité pour HelloPay. Cette politique de confidentialité vous informe sur la façon dont nous collectons, utilisons et protégeons vos données personnelles lorsque vous utilisez notre service.
            </p>
            <p>
              En utilisant HelloPay, vous acceptez les pratiques décrites dans la présente politique de confidentialité.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Données collectées</h2>
            <p>
              Nous collectons différents types de données personnelles, notamment :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Informations d&apos;identification (nom, prénom, adresse email)</li>
              <li>Informations professionnelles (entreprise, poste, adresse professionnelle)</li>
              <li>Informations financières (coordonnées bancaires pour la facturation)</li>
              <li>Informations relatives aux fiches de paie (salaire, cotisations, etc.)</li>
              <li>Données de connexion et d&apos;utilisation du service</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Utilisation des données</h2>
            <p>Nous utilisons vos données personnelles aux fins suivantes :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fournir, exploiter et maintenir notre service</li>
              <li>Créer et gérer les fiches de paie</li>
              <li>Vous contacter concernant votre compte et vous informer des mises à jour</li>
              <li>Assurer la sécurité et prévenir la fraude</li>
              <li>Se conformer aux obligations légales</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Partage des données</h2>
            <p>
              Nous ne vendons pas vos données personnelles à des tiers. Nous pouvons partager vos informations avec :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nos fournisseurs de services (hébergement, traitement des paiements)</li>
              <li>Les autorités compétentes lorsque la loi l&apos;exige</li>
            </ul>
            <p>
              Tous nos partenaires et sous-traitants sont soumis à des obligations strictes de confidentialité.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Conservation des données</h2>
            <p>
              Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services ou pour respecter nos obligations légales, notamment en matière de conservation des documents fiscaux et sociaux.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Vos droits</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Droit d&apos;accès à vos données personnelles</li>
              <li>Droit de rectification des données inexactes</li>
              <li>Droit à l&apos;effacement (droit à l&apos;oubli)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d&apos;opposition au traitement</li>
            </ul>
            <p>
              Pour exercer ces droits, veuillez nous contacter à privacy@hellopay.fr.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données personnelles contre tout accès non autorisé, divulgation, altération ou destruction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Modifications de la politique</h2>
            <p>
              Nous pouvons modifier cette politique de confidentialité à tout moment. La version la plus récente sera toujours disponible sur notre site web.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou nos pratiques en matière de protection des données, veuillez nous contacter à privacy@hellopay.fr ou par courrier à : HelloPay SAS - Délégué à la Protection des Données, 123 Avenue de la République, 75011 Paris, France.
            </p>
          </section>

          <div className="text-sm text-gray-500 italic text-center pt-6">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})}
          </div>
        </div>
      </div>
    </div>
  );
} 