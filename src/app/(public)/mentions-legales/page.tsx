import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales | HelloPay",
  description: "Mentions légales et conditions d'utilisation de HelloPay",
};

export default function MentionsLegalesPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Mentions légales</h1>
          <p className="text-gray-600">
            Informations légales concernant HelloPay et son utilisation
          </p>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Informations générales</h2>
            <p>
              Le site HelloPay est édité par la société HelloPay SAS, au capital de 10 000 €, 
              immatriculée au RCS sous le numéro XXXXXXXXX.
            </p>
            <p>
              <strong>Siège social</strong> : 123 Avenue de la République, 75011 Paris, France<br />
              <strong>Téléphone</strong> : +33 (0)1 XX XX XX XX<br />
              <strong>Email</strong> : contact@hellopay.fr
            </p>
            <p>
              <strong>Directeur de la publication</strong> : Jean Dupont
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Hébergement</h2>
            <p>
              Le site HelloPay est hébergé par la société Vercel Inc., dont le siège social 
              est situé au 340 S Lemon Ave #4133 Walnut, CA 91789, États-Unis.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu du site HelloPay (structure, textes, logos, images, vidéos, etc.) 
              est protégé par le droit d&apos;auteur et est la propriété exclusive de HelloPay SAS ou 
              de ses partenaires.
            </p>
            <p>
              Toute reproduction ou représentation, totale ou partielle, du site ou de l&apos;un de ses 
              éléments, sans l&apos;autorisation expresse de HelloPay SAS, est interdite et constituerait 
              une contrefaçon sanctionnée par les articles L.335-2 et suivants du Code de la propriété intellectuelle.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Conditions d&apos;utilisation</h2>
            <p>
              L&apos;utilisation du site HelloPay implique l&apos;acceptation pleine et entière des conditions 
              générales d&apos;utilisation décrites ci-après. Ces conditions d&apos;utilisation sont susceptibles 
              d&apos;être modifiées ou complétées à tout moment.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Responsabilité</h2>
            <p>
              HelloPay SAS s&apos;efforce d&apos;assurer au mieux de ses possibilités l&apos;exactitude et la mise à jour 
              des informations diffusées sur son site, dont elle se réserve le droit de corriger le contenu à 
              tout moment et sans préavis. Toutefois, HelloPay SAS ne peut garantir l&apos;exactitude, la précision ou 
              l&apos;exhaustivité des informations mises à disposition sur son site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Loi applicable et juridiction</h2>
            <p>
              Les présentes mentions légales sont soumises au droit français. En cas de différend concernant 
              l&apos;interprétation ou l&apos;exécution de ces mentions légales, les parties s&apos;efforceront 
              de trouver une solution amiable. À défaut, le différend sera porté devant les tribunaux français.
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