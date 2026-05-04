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

  // Si es gerente, solo ve empleados de su sucursal
  // Si es dueño, ve empleados de todas las sucursales (por ahora primera)
  let branchId: string | undefined;
  
  if (isManager && session.user.branchId) {
    branchId = session.user.branchId;
  } else if (isOwner) {
    const branches = await getBranches({
      businessId: session.user.businessId,
    });
    branchId = branches[0]?.id;
  }
  
  const employees = branchId ? await getEmployees({ branchId }) : [];
  
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
