import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modifier l'employé | HelloPay",
  description: "Modifier les informations d'un employé",
};

export default function EditEmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 