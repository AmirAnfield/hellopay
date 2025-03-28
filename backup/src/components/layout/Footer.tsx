export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              &copy; {currentYear} HelloPay. Tous droits réservés.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/tarifs" className="text-gray-600 hover:text-primary text-sm">Tarifs</a>
            <a href="/faq" className="text-gray-600 hover:text-primary text-sm">FAQ</a>
            <a href="/contact" className="text-gray-600 hover:text-primary text-sm">Contact</a>
            <a href="/mentions-legales" className="text-gray-600 hover:text-primary text-sm">Mentions légales</a>
            <a href="/confidentialite" className="text-gray-600 hover:text-primary text-sm">Politique de confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 