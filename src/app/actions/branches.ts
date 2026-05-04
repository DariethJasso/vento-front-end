"use server";

import { db } from "@/app/db";
import { branches } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getBranches({
    businessId,
}: {
    businessId: string;
}) {
    try {
        const branchesList = await db.query.branches.findMany({
            where: eq(branches.businessId, businessId),
        });
        
        return branchesList;
    } catch (error) {
        console.error("Error fetching branches:", error);
        return [];
    }
}

export async function deleteBranch({
    branchId,
}: {
    branchId: string;
}) {
    try {
        await db.delete(branches).where(eq(branches.id, branchId));
        
        // Revalidar la página para mostrar los cambios
        revalidatePath("/branches");
        
        return { success: true };
    } catch (error) {
        console.error("Error deleting branch:", error);
        return { success: false, error: "Error al eliminar sucursal" };
    }
}