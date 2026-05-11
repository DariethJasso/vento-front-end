import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getShiftHistory } from "@/app/actions/shifts";
import { getBranches } from "@/app/actions/branches";
import ReportsContainer from "./_components/reports-container";

export default async function ReportesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const isOwner = session.user?.isOwner || session.user?.isEmployeeOwner;
  const isManager = session.user?.isManager;

  if (!isOwner && !isManager) {
    redirect("/panel");
  }

  let branches: any[] = [];
  let selectedBranchId: string | undefined;
  
  if (isOwner) {
    // Owner: obtener todas las sucursales
    branches = await getBranches({
      businessId: session.user.businessId!,
    });
    
    // Usar la primera sucursal por defecto
    selectedBranchId = branches[0]?.id;
  } else if (isManager && session.user.branchId) {
    // Manager: solo su sucursal
    selectedBranchId = session.user.branchId;
  }

  if (!selectedBranchId) {
    redirect("/panel");
  }

  // Obtener historial de turnos inicial (últimos 30)
  const shifts = await getShiftHistory({ branchId: selectedBranchId, limit: 30 });

  return (
    <ReportsContainer
      session={session}
      initialShifts={shifts}
      branches={branches}
      initialBranchId={selectedBranchId}
      isOwner={isOwner}
    />
  );
}
