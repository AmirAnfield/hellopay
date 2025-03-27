import SalaryCalculator from "@/components/payroll/SalaryCalculator";

export const metadata = {
  title: "HelloPay - Calculateur de paie",
  description: "Calculez facilement les salaires bruts et nets",
};

export default function PayrollCalculatorPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Calculateur de paie</h1>
        <p className="text-gray-600">
          Utilisez cet outil pour calculer rapidement les salaires bruts et nets en fonction des paramètres saisis.
        </p>
      </div>
      
      <SalaryCalculator />
    </div>
  );
}
