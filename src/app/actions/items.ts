"use server";

import { db } from "@/app/db";
import { items, branch_items } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getItems({
    businessId,
}: {
    businessId: string;
}) {
    try {
        const itemsList = await db.query.items.findMany({
            where: eq(items.businessId, businessId),
            with: {
                category: true,
            },
        });
        
        // Obtener datos de branch_items para cada item
        const itemsWithBranchData = await Promise.all(
            itemsList.map(async (item) => {
                const branchItemsList = await db.query.branch_items.findMany({
                    where: eq(branch_items.itemId, item.id),
                });
                
                return {
                    ...item,
                    branchItems: branchItemsList,
                };
            })
        );
        
        return itemsWithBranchData;
    } catch (error) {
        console.error("Error fetching items:", error);
        return [];
    }
}

export async function createItem({
    name,
    description,
    price,
    categoryId,
    sku,
    image,
    unit,
    isActive,
    businessId,
    branchesData,
}: {
    name: string;
    description?: string;
    price: string;
    categoryId?: string;
    sku?: string;
    image?: string;
    unit?: string;
    isActive: boolean;
    businessId: string;
    branchesData?: Array<{
        branchId: string;
        isActiveInBranch: boolean;
        customPrice?: string;
        isAvailable: boolean;
        trackInventory: boolean;
        stock?: string;
        minStock?: string;
        isCustom: boolean;
        customKinds?: any;
    }>;
}) {
    try {
        // 1. Crear el item base
        const [newItem] = await db
            .insert(items)
            .values({
                name,
                description: description || null,
                price,
                categoryId: categoryId || null,
                sku: sku || null,
                image: image || null,
                unit: unit || "pza",
                isActive,
                businessId,
            })
            .returning();

        // 2. Si hay datos de sucursales, crear las relaciones
        if (branchesData && branchesData.length > 0) {
            const branchItemsData = branchesData.map(branch => ({
                itemId: newItem.id,
                branchId: branch.branchId,
                customPrice: branch.customPrice || null,
                isAvailable: branch.isAvailable,
                trackInventory: branch.trackInventory,
                stock: branch.stock || "0",
                minStock: branch.minStock || "0",
                isCustom: branch.isCustom,
                customKinds: branch.customKinds || null,
                isActiveInBranch: branch.isActiveInBranch,
            }));

            await db.insert(branch_items).values(branchItemsData);
        }

        revalidatePath("/items");
        
        return { success: true, item: newItem };
    } catch (error) {
        console.error("Error creating item:", error);
        return { success: false, error: "Error al crear item" };
    }
}

export async function updateItem({
    itemId,
    name,
    description,
    price,
    categoryId,
    sku,
    image,
    unit,
    isActive,
    branchesData,
}: {
    itemId: string;
    name: string;
    description?: string;
    price: string;
    categoryId?: string;
    sku?: string;
    image?: string;
    unit?: string;
    isActive: boolean;
    branchesData?: Array<{
        branchId: string;
        isActiveInBranch: boolean;
        customPrice?: string;
        isAvailable: boolean;
        trackInventory: boolean;
        stock?: string;
        minStock?: string;
        isCustom: boolean;
        customKinds?: any;
    }>;
}) {
    try {
        // 1. Actualizar el item base
        const [updatedItem] = await db
            .update(items)
            .set({
                name,
                description: description || null,
                price,
                categoryId: categoryId || null,
                sku: sku || null,
                image: image || null,
                unit: unit || "pza",
                isActive,
            })
            .where(eq(items.id, itemId))
            .returning();

        // 2. Si hay datos de sucursales, actualizar branch_items
        if (branchesData && branchesData.length > 0) {
            // Eliminar branch_items existentes
            await db.delete(branch_items).where(eq(branch_items.itemId, itemId));
            
            // Insertar nuevos branch_items
            const branchItemsData = branchesData.map(branch => ({
                itemId: updatedItem.id,
                branchId: branch.branchId,
                customPrice: branch.customPrice || null,
                isAvailable: branch.isAvailable,
                trackInventory: branch.trackInventory,
                stock: branch.stock || "0",
                minStock: branch.minStock || "0",
                isCustom: branch.isCustom,
                customKinds: branch.customKinds || null,
                isActiveInBranch: branch.isActiveInBranch,
            }));

            await db.insert(branch_items).values(branchItemsData);
        }

        revalidatePath("/items");
        
        return { success: true, item: updatedItem };
    } catch (error) {
        console.error("Error updating item:", error);
        return { success: false, error: "Error al actualizar item" };
    }
}

export async function deleteItem({
    itemId,
}: {
    itemId: string;
}) {
    try {
        await db.delete(items).where(eq(items.id, itemId));
        
        revalidatePath("/items");
        
        return { success: true };
    } catch (error) {
        console.error("Error deleting item:", error);
        return { success: false, error: "Error al eliminar item" };
    }
}

export async function getBranchItems({
    branchId,
}: {
    branchId: string;
}) {
    try {
        const branchItemsList = await db.query.branch_items.findMany({
            where: eq(branch_items.branchId, branchId),
            with: {
                item: {
                    with: {
                        category: true,
                    },
                },
            },
        });
        
        return branchItemsList;
    } catch (error) {
        console.error("Error fetching branch items:", error);
        return [];
    }
}
