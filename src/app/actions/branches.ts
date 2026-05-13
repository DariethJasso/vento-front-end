"use server";

import { db } from "@/app/db";
import { branches, branchesConfig } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getBranches({
    businessId,
}: {
    businessId: string;
}) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/getBranches?businessId=${businessId}`);
        const data = await response.json();
        console.log("Branches data:", data);
        return data;
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

export async function getBranchConfig(branchId: string) {
    try {
        const config = await db.query.branchesConfig.findFirst({
            where: eq(branchesConfig.branchId, branchId),
        });
        
        return { success: true, config };
    } catch (error) {
        console.error("Error fetching branch config:", error);
        return { success: false, error: "Error al obtener configuración" };
    }
}

export async function updateBranch({
    branchId,
    name,
    address,
    phoneNumbers,
    config,
}: {
    branchId: string;
    name: string;
    address?: string;
    phoneNumbers?: string[];
    config?: {
        hasPos?: boolean;
        hasKitchen?: boolean;
        hasDelivery?: boolean;
        hasMobileApp?: boolean;
    };
}) {
    try {
        // Actualizar datos básicos de la sucursal
        await db.update(branches)
            .set({
                name,
                address,
                phoneNumbers,
            })
            .where(eq(branches.id, branchId));

        // Actualizar o crear configuración si se proporciona
        if (config) {
            const existingConfig = await db.query.branchesConfig.findFirst({
                where: eq(branchesConfig.branchId, branchId),
            });

            if (existingConfig) {
                await db.update(branchesConfig)
                    .set(config)
                    .where(eq(branchesConfig.branchId, branchId));
            } else {
                await db.insert(branchesConfig).values({
                    branchId,
                    ...config,
                });
            }
        }

        revalidatePath("/branches");
        
        return { success: true };
    } catch (error) {
        console.error("Error updating branch:", error);
        return { success: false, error: "Error al actualizar sucursal" };
    }
}