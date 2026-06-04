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

export async function getActiveShiftsForBusiness({ businessId }: { businessId: string }) {
  try {
    const activeShifts = await db.query.shifts.findMany({
      where: eq(shifts.status, "open"),
      with: {
        branch: {
          columns: {
            id: true,
            name: true,
            businessId: true,
          },
        },
      },
      orderBy: [desc(shifts.openedAt)],
    });

    // Filtrar solo los turnos del negocio actual
    const businessShifts = activeShifts.filter((shift: any) => shift.branch?.businessId === businessId);

    return businessShifts;
  } catch (error) {
    console.error("Error fetching active shifts for business:", error);
    return [];
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

export async function incrementTicketCounter({ shiftId }: { shiftId: string }) {
  try {
    const shift = await db.query.shifts.findFirst({
      where: eq(shifts.id, shiftId),
    });

    if (!shift) {
      return { success: false, error: "Turno no encontrado" };
    }

    const newCounter = (shift.ticketCounter || 0) + 1;

    await db
      .update(shifts)
      .set({ ticketCounter: newCounter })
      .where(eq(shifts.id, shiftId));

    return { success: true, counter: newCounter };
  } catch (error) {
    console.error("Error incrementing ticket counter:", error);
    return { success: false, error: "Error al incrementar contador" };
  }
}

export async function updateShiftSales({
  shiftId,
  saleAmount,
}: {
  shiftId: string;
  saleAmount: number;
}) {
  try {
    const shift = await db.query.shifts.findFirst({
      where: eq(shifts.id, shiftId),
    });

    if (!shift) {
      return { success: false, error: "Turno no encontrado" };
    }

    const currentSales = parseFloat(shift.totalSales || "0");
    const newTotalSales = currentSales + saleAmount;
    const newExpectedCash = parseFloat(shift.expectedCash || "0") + saleAmount;

    await db
      .update(shifts)
      .set({
        totalSales: newTotalSales.toString(),
        expectedCash: newExpectedCash.toString(),
      })
      .where(eq(shifts.id, shiftId));

    return { success: true };
  } catch (error) {
    console.error("Error updating shift sales:", error);
    return { success: false, error: "Error al actualizar ventas" };
  }
}

export async function getNextTicketNumber({ shiftId }: { shiftId: string }) {
  try {
    const shift = await db.query.shifts.findFirst({
      where: eq(shifts.id, shiftId),
    });

    if (!shift) {
      return "000001";
    }

    const counter = (shift.ticketCounter || 0) + 1;
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    
    // Formato: DD-MM-NNNN (ejemplo: 04-05-0001)
    const ticketNumber = `${day}-${month}-${String(counter).padStart(4, "0")}`;

    return ticketNumber;
  } catch (error) {
    console.error("Error getting next ticket number:", error);
    return "000001";
  }
}
