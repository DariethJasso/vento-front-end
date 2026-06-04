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

// Versión para server-side (consulta directa a DB)
export async function getBranchesForShift({
    businessId,
}: {
    businessId: string;
}) {
    try {
        const branchesList = await db.query.branches.findMany({
            where: eq(branches.businessId, businessId),
            columns: {
                id: true,
                name: true,
                address: true,
            },
        });

        console.log("Server Branches data:", branchesList);
        return { success: true, branches: branchesList };
    } catch (error) {
        console.error("Error fetching branches from DB:", error);
        return { success: false, branches: [] };
    }
}

export async function deleteBranch({
    branchId,
}: {
    branchId: string;
}) {
    try {
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/deleteBranch?branchId=${branchId}`);
        const data = await response.json();
        console.log("Delete branch data:", data);
        
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/getBranchConfig?branchId=${branchId}`);
        const data = await response.json();
        console.log("Get branch config data:", data);
        
        return { success: true, config: data };
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
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/updateBranch`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                branchId,
                name,
                address,
                phoneNumbers,
                config,
            }),
        });
        const data = await response.json();
        console.log("Update branch data:", data);
        
        revalidatePath("/branches");
        
        return { success: true };
    } catch (error) {
        console.error("Error updating branch:", error);
        return { success: false, error: "Error al actualizar sucursal" };
    }
}