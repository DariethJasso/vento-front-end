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

  const isOwner = session.user.isOwner || session.user.isEmployeeOwner;
  const isManager = session.user.isManager;

  // Owner: obtener todos los empleados del negocio
  // Manager: obtener solo empleados de su sucursal
  let employees: any[] = [];
  
  if (isOwner) {
    employees = await getEmployees({ businessId: session.user.businessId });
  } else if (isManager && session.user.branchId) {
    employees = await getEmployees({ branchId: session.user.branchId });
  }
  
  // Obtener branches solo si es dueño
  const branches = isOwner ? await getBranches({
    businessId: session.user.businessId,
  }) : [];

  return (
    <EmployeesContainer
      session={session}
      employees={employees}
      branches={branches}
    />
  );
}
