import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Connexion</h1>
        <p className="text-gray-600 mt-2">Connectez-vous à votre compte HelloPay</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <LoginForm />
      </div>
    </div>
  );
} 