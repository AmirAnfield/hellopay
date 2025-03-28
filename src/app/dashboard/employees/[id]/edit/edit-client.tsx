"use client";

import EmployeeForm from "@/components/dashboard/EmployeeForm";

interface EditEmployeeClientProps {
  employeeId: string;
}

export default function EditEmployeeClient({ employeeId }: EditEmployeeClientProps) {
  return (
    <EmployeeForm employeeId={employeeId} />
  );
} 