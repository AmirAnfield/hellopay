import RegisterForm from "./register-form";

export default function RegisterPage() {
  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Créer un compte</h1>
        <p className="text-gray-600 mt-2">Rejoignez HelloPay pour gérer vos fiches de paie</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <RegisterForm />
      </div>
    </div>
  );
} 