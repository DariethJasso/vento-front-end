import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "@/components/panel/dashboard-layout-client";
import { getBranchConfig } from "@/app/actions/branches";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Obtener configuración de la sucursal
  let branchConfig = undefined;
  const branchId = session.user?.branchId;

  if (branchId) {
    const configResult = await getBranchConfig(branchId);
    if (configResult.success && configResult.config) {
      branchConfig = {
        hasPos: configResult.config.hasPos ?? true,
        hasKitchen: configResult.config.hasKitchen ?? false,
        hasDelivery: configResult.config.hasDelivery ?? false,
      };
    }
  }

  return <DashboardLayoutClient session={session} branchConfig={branchConfig}>{children}</DashboardLayoutClient>;
}
