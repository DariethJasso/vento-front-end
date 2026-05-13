"use server";

import { db } from "@/app/db";
import { customers } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCustomers({
    businessId,
}: {
    businessId: string;
}) {
    try {
        const customersList = await db.query.customers.findMany({
            where: eq(customers.businessId, businessId),
            orderBy: (customers, { desc }) => [desc(customers.createdAt)],
        });
        
        return customersList;
    } catch (error) {
        console.error("Error fetching customers:", error);
        return [];
    }
}

export async function getCustomerByPhone(phone: string) {
    try {
        const customer = await db.query.customers.findFirst({
            where: eq(customers.phone, phone),
        });
        
        return customer;
    } catch (error) {
        console.error("Error fetching customer by phone:", error);
        return null;
    }
}

export async function findOrCreateCustomerByPhone({
    businessId,
    phone,
    firstName,
    lastName,
}: {
    businessId: string;
    phone: string;
    firstName?: string;
    lastName?: string;
}) {
    try {
        // Buscar cliente existente por teléfono
        const existingCustomer = await db.query.customers.findFirst({
            where: eq(customers.phone, phone),
        });

        if (existingCustomer) {
            return { success: true, customer: existingCustomer, isNew: false };
        }

        // Si no existe y no se proporcionó nombre, retornar que necesita nombre
        if (!firstName || !lastName) {
            return { success: false, needsName: true };
        }

        // Crear nuevo cliente
        const [newCustomer] = await db
            .insert(customers)
            .values({
                businessId,
                firstName,
                lastName,
                email: `${phone}@temp.com`, // Email temporal basado en teléfono
                phone,
            })
            .returning();

        revalidatePath("/pos");
        
        return { success: true, customer: newCustomer, isNew: true };
    } catch (error) {
        console.error("Error finding or creating customer:", error);
        return { success: false, error: "Error al buscar o crear cliente" };
    }
}

export async function createCustomer({
    businessId,
    firstName,
    lastName,
    email,
    phone,
    address,
    notes,
}: {
    businessId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    notes?: string;
}) {
    try {
        const [newCustomer] = await db
            .insert(customers)
            .values({
                businessId,
                firstName,
                lastName,
                email,
                phone: phone || null,
                address: address || null,
                notes: notes || null,
            })
            .returning();

        revalidatePath("/clientes");
        
        return { success: true, customer: newCustomer };
    } catch (error) {
        console.error("Error creating customer:", error);
        return { success: false, error: "Error al crear cliente" };
    }
}

export async function updateCustomer({
    customerId,
    firstName,
    lastName,
    email,
    phone,
    address,
    notes,
}: {
    customerId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    notes?: string;
}) {
    try {
        const [updatedCustomer] = await db
            .update(customers)
            .set({
                firstName,
                lastName,
                email,
                phone: phone || null,
                address: address || null,
                notes: notes || null,
            })
            .where(eq(customers.id, customerId))
            .returning();

        revalidatePath("/clientes");
        
        return { success: true, customer: updatedCustomer };
    } catch (error) {
        console.error("Error updating customer:", error);
        return { success: false, error: "Error al actualizar cliente" };
    }
}

export async function deleteCustomer({
    customerId,
}: {
    customerId: string;
}) {
    try {
        await db.delete(customers).where(eq(customers.id, customerId));

        revalidatePath("/clientes");
        
        return { success: true };
    } catch (error) {
        console.error("Error deleting customer:", error);
        return { success: false, error: "Error al eliminar cliente" };
    }
}
