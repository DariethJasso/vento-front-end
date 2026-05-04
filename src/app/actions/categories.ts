"use server";

import { db } from "@/app/db";
import { categories } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCategories({
    businessId,
}: {
    businessId: string;
}) {
    try {
        const categoriesList = await db.query.categories.findMany({
            where: eq(categories.businessId, businessId),
        });
        
        return categoriesList;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function createCategory({
    name,
    description,
    businessId,
}: {
    name: string;
    description?: string;
    businessId: string;
}) {
    try {
        const [newCategory] = await db
            .insert(categories)
            .values({
                name,
                description: description || null,
                businessId,
            })
            .returning();

        revalidatePath("/categorias");
        revalidatePath("/items");
        
        return { success: true, category: newCategory };
    } catch (error) {
        console.error("Error creating category:", error);
        return { success: false, error: "Error al crear categoría" };
    }
}

export async function updateCategory({
    categoryId,
    name,
    description,
}: {
    categoryId: string;
    name: string;
    description?: string;
}) {
    try {
        const [updatedCategory] = await db
            .update(categories)
            .set({
                name,
                description: description || null,
            })
            .where(eq(categories.id, categoryId))
            .returning();

        revalidatePath("/categorias");
        revalidatePath("/items");
        
        return { success: true, category: updatedCategory };
    } catch (error) {
        console.error("Error updating category:", error);
        return { success: false, error: "Error al actualizar categoría" };
    }
}

export async function deleteCategory({
    categoryId,
}: {
    categoryId: string;
}) {
    try {
        await db.delete(categories).where(eq(categories.id, categoryId));
        
        revalidatePath("/categorias");
        revalidatePath("/items");
        
        return { success: true };
    } catch (error) {
        console.error("Error deleting category:", error);
        return { success: false, error: "Error al eliminar categoría" };
    }
}
