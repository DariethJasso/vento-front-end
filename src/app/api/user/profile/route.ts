import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/app/db";
import { users, businesses, employees } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener información del usuario
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Obtener información del empleado
    const employee = await db.query.employees.findFirst({
      where: eq(employees.userId, user.id),
      columns: {
        id: true,
        firstName: true,
        lastName: true,
        isOwner: true,
        isManager: true,
        isCashier: true,
        isKitchen: true,
        isDelivery: true,
        isWaiter: true,
        branchId: true,
      },
    });

    // Obtener información del negocio (si el usuario es dueño)
    let business = null;
    if (employee?.isOwner) {
      business = await db.query.businesses.findFirst({
        where: eq(businesses.ownerId, user.id),
        columns: {
          id: true,
          name: true,
          plan: true,
          isPro: true,
          logoUrl: true,
        },
      });
    }

    return NextResponse.json({
      user,
      employee,
      business,
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json(
      { error: "Error al obtener perfil" },
      { status: 500 }
    );
  }
}
