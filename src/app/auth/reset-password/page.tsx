import { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Réinitialisation du mot de passe | HelloPay",
  description: "Réinitialiser votre mot de passe pour accéder à HelloPay",
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <ResetPasswordForm />
      </div>
    </AuthLayout>
  );
} 