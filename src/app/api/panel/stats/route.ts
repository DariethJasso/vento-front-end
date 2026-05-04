import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/app/db";
import { businesses, branches, employees } from "@/app/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener el negocio del usuario
    const business = await db.query.businesses.findFirst({
      where: eq(businesses.ownerId, session.user.id),
    });

    if (!business) {
      return NextResponse.json(
        { error: "Negocio no encontrado" },
        { status: 404 }
      );
    }

    // Contar sucursales
    const [branchesCount] = await db
      .select({ count: count() })
      .from(branches)
      .where(eq(branches.businessId, business.id));

    // Contar empleados
    const [employeesCount] = await db
      .select({ count: count() })
      .from(employees);

    // TODO: Agregar conteo de clientes cuando exista la tabla
    // TODO: Agregar conteo de items cuando exista la tabla
    // TODO: Agregar ventas del día cuando exista la tabla

    return NextResponse.json({
      sucursales: {
        value: branchesCount.count.toString(),
        subtitle: "+1 este mes",
      },
      clientes: {
        value: "0", // TODO: Implementar cuando exista la tabla
        subtitle: "+0 esta semana",
      },
      items: {
        value: "0", // TODO: Implementar cuando exista la tabla
        subtitle: "0 categorías",
      },
      ventas: {
        value: "$0", // TODO: Implementar cuando exista la tabla
        subtitle: "+0% vs ayer",
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    );
  }
}
