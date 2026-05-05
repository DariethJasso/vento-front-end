import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getShiftHistory } from "@/app/actions/shifts";
import ShiftReportList from "./_components/shift-report-list";

export default async function ReportesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const isManager = session.user?.isManager || session.user?.isEmployeeOwner || session.user?.isOwner;
  const branchId = session.user?.branchId;

  if (!isManager || !branchId) {
    redirect("/panel");
  }

  // Obtener historial de turnos (últimos 30)
  const shifts = await getShiftHistory({ branchId, limit: 30 });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-foreground mb-2">
          Reportes de Ventas
        </h1>
        <p className="text-muted-foreground">
          Consulta el historial de turnos y ventas de tu sucursal
        </p>
      </div>

      <ShiftReportList shifts={shifts} branchId={branchId} />
    </div>
  );
}
