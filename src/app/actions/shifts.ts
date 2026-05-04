"use server";

import { db } from "@/app/db";
import { shifts } from "@/app/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getActiveShift({ branchId }: { branchId: string }) {
  try {
    const activeShift = await db.query.shifts.findFirst({
      where: and(
        eq(shifts.branchId, branchId),
        eq(shifts.status, "open")
      ),
      orderBy: [desc(shifts.openedAt)],
    });

    return activeShift;
  } catch (error) {
    console.error("Error fetching active shift:", error);
    return null;
  }
}

export async function openShift({
  branchId,
  userId,
  initialCash,
}: {
  branchId: string;
  userId: string;
  initialCash: string;
}) {
  try {
    // Verificar que no haya un turno abierto
    const existingShift = await getActiveShift({ branchId });
    
    if (existingShift) {
      return {
        success: false,
        error: "Ya existe un turno abierto para esta sucursal",
      };
    }

    // Crear nuevo turno
    const [newShift] = await db
      .insert(shifts)
      .values({
        branchId,
        openedBy: userId,
        initialCash,
        expectedCash: initialCash,
        status: "open",
        openedAt: new Date(),
      })
      .returning();

    revalidatePath("/panel");
    revalidatePath("/pos");

    return {
      success: true,
      shift: newShift,
    };
  } catch (error) {
    console.error("Error opening shift:", error);
    return {
      success: false,
      error: "Error al abrir el turno",
    };
  }
}

export async function closeShift({
  shiftId,
  userId,
  finalCash,
}: {
  shiftId: string;
  userId: string;
  finalCash: string;
}) {
  try {
    // Actualizar turno
    const [closedShift] = await db
      .update(shifts)
      .set({
        closedBy: userId,
        finalCash,
        status: "closed",
        closedAt: new Date(),
      })
      .where(eq(shifts.id, shiftId))
      .returning();

    revalidatePath("/panel");
    revalidatePath("/pos");

    return {
      success: true,
      shift: closedShift,
    };
  } catch (error) {
    console.error("Error closing shift:", error);
    return {
      success: false,
      error: "Error al cerrar el turno",
    };
  }
}

export async function getShiftHistory({
  branchId,
  limit = 10,
}: {
  branchId: string;
  limit?: number;
}) {
  try {
    const shiftHistory = await db.query.shifts.findMany({
      where: eq(shifts.branchId, branchId),
      orderBy: [desc(shifts.openedAt)],
      limit,
    });

    return shiftHistory;
  } catch (error) {
    console.error("Error fetching shift history:", error);
    return [];
  }
}
