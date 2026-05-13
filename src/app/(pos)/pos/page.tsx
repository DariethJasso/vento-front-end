import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getItems } from "@/app/actions/items";
import { getCategories } from "@/app/actions/categories";
import { getActiveShift } from "@/app/actions/shifts";
import { getBusiness } from "@/app/actions/business";
import { db } from "@/app/db";
import { branches } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import POSContainer from "./_components/pos-container";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LogoutButton from "./_components/logout-button";

export default async function POSPage({
  searchParams,
}: {
  searchParams: { branchId?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const isOwner = session.user.isOwner || session.user.isEmployeeOwner;
  const isManager = session.user.isManager;

  // Determinar qué sucursal usar
  let selectedBranchId: string | undefined;

  // Obtener todas las sucursales si es dueño
  let allBranches: any[] = [];
  
  if (isOwner) {
    allBranches = await db.query.branches.findMany({
      where: eq(branches.businessId, session.user.businessId!),
    });
    
    // Usar sucursal del query param o la primera por defecto
    selectedBranchId = searchParams.branchId || allBranches[0]?.id;
  } else if (isManager || session.user.isCashier || session.user.isWaiter) {
    // Empleados usan su sucursal asignada
    selectedBranchId = session.user.branchId;
  }

  if (!selectedBranchId) {
    redirect("/panel");
  }

  // Obtener información de la sucursal
  const branch = await db.query.branches.findFirst({
    where: eq(branches.id, selectedBranchId),
  });

  if (!branch) {
    redirect("/panel");
  }

  // Verificar que haya un turno activo
  const activeShift = await getActiveShift({ branchId: selectedBranchId });

  if (!activeShift) {
    const canManageShift = isOwner || isManager;
    
    return (
      <div className="flex items-center justify-center h-screen bg-background relative">
        {/* Botón de logout en esquina superior izquierda */}
        <div className="absolute top-4 left-4">
          <LogoutButton />
        </div>

        {/* Mensaje central */}
        <div className="text-center space-y-4 p-8 border rounded-lg max-w-md">
          <h1 className="text-2xl font-bold">No hay turno activo</h1>
          {canManageShift ? (
            <>
              <p className="text-muted-foreground">
                Debe iniciar un turno antes de usar el punto de venta.
              </p>
              <Link href="/panel">
                <Button>Ir al Panel</Button>
              </Link>
            </>
          ) : (
            <p className="text-muted-foreground">
              El gerente debe iniciar el turno del día para acceder al punto de venta.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Obtener items del negocio (todos, sin filtrar)
  const allItems = await getItems({
    businessId: session.user.businessId!,
  });

  // Obtener categorías
  const categories = await getCategories({
    businessId: session.user.businessId!,
  });

  // Obtener logo del negocio
  const businessResult = await getBusiness({ businessId: session.user.businessId! });
  const businessLogo = businessResult.success ? businessResult.business?.logoUrl : null;

  return (
    <POSContainer
      session={session}
      branch={branch}
      allItems={allItems}
      categories={categories}
      allBranches={allBranches}
      isOwner={!!isOwner}
      isManager={!!isManager}
      initialBranchId={selectedBranchId}
      activeShift={activeShift}
      businessLogo={businessLogo}
    />
  );
}
