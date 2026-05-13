"use server";

import { db } from "@/app/db";
import { cashMovements } from "@/app/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCashMovement({
  shiftId,
  branchId,
  businessId,
  employeeId,
  type,
  amount,
  reason,
  notes,
}: {
  shiftId: string;
  branchId: string;
  businessId: string;
  employeeId: string;
  type: "income" | "expense";
  amount: string;
  reason: string;
  notes?: string;
}) {
  try {
    const [movement] = await db
      .insert(cashMovements)
      .values({
        shiftId,
        branchId,
        businessId,
        employeeId,
        type,
        amount,
        reason,
        notes: notes || null,
      })
      .returning();

    revalidatePath("/pos");
    return { success: true, movement };
  } catch (error) {
    console.error("Error creating cash movement:", error);
    return { success: false, error: "Error al registrar el movimiento" };
  }
}

export async function getCashMovementsByShift({ shiftId }: { shiftId: string }) {
  try {
    const movements = await db.query.cashMovements.findMany({
      where: eq(cashMovements.shiftId, shiftId),
      orderBy: [desc(cashMovements.createdAt)],
      with: {
        employee: true,
      },
    });

    return { success: true, movements };
  } catch (error) {
    console.error("Error fetching cash movements:", error);
    return { success: false, movements: [] };
  }
}

export async function getCashMovementsByBranch({
  branchId,
  startDate,
  endDate,
}: {
  branchId: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const movements = await db.query.cashMovements.findMany({
      where: eq(cashMovements.branchId, branchId),
      orderBy: [desc(cashMovements.createdAt)],
      with: {
        employee: true,
        shift: true,
      },
    });

    return { success: true, movements };
  } catch (error) {
    console.error("Error fetching cash movements:", error);
    return { success: false, movements: [] };
  }
}
