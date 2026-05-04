import { redirect } from "next/navigation";
import { getEmployees } from "@/app/actions/employees";
import { getBranches } from "@/app/actions/branches";
import EmployeesContainer from "./_components/employees-container";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function EmployeesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.businessId) {
    redirect("/onboarding");
  }

  const branches = await getBranches({
    businessId: session.user.businessId,
  });

  // Por ahora obtenemos empleados de la primera sucursal
  // TODO: Agregar selector de sucursal
  const branchId = branches[0]?.id;
  
  const employees = branchId ? await getEmployees({ branchId }) : [];

  return (
    <EmployeesContainer
      session={session}
      employees={employees}
      branches={branches}
    />
  );
}
