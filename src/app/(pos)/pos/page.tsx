import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getItems } from "@/app/actions/items";
import { getCategories } from "@/app/actions/categories";
import { db } from "@/app/db";
import { branches } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import POSContainer from "./_components/pos-container";
import { getServerSession } from "next-auth";

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

  // Obtener items del negocio (todos, sin filtrar)
  const allItems = await getItems({
    businessId: session.user.businessId!,
  });

  // Obtener categorías
  const categories = await getCategories({
    businessId: session.user.businessId!,
  });

  return (
    <POSContainer
      session={session}
      branch={branch}
      allItems={allItems}
      categories={categories}
      allBranches={allBranches}
      isOwner={isOwner}
      initialBranchId={selectedBranchId}
    />
  );
}
