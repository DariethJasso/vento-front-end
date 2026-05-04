"use server";

import { db } from "@/app/db";
import { employees, users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

export async function getEmployees({
    branchId,
}: {
    branchId: string;
}) {
    try {
        const employeesList = await db.query.employees.findMany({
            where: eq(employees.branchId, branchId),
            with: {
                user: true,
            },
            orderBy: (employees, { desc }) => [desc(employees.createdAt)],
        });
        
        return employeesList;
    } catch (error) {
        console.error("Error fetching employees:", error);
        return [];
    }
}

export async function createEmployee({
    branchId,
    firstName,
    lastName,
    email,
    password,
    isOwner,
    isManager,
    isCashier,
    isKitchen,
    isDelivery,
    isWaiter,
}: {
    branchId: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isOwner?: boolean;
    isManager?: boolean;
    isCashier?: boolean;
    isKitchen?: boolean;
    isDelivery?: boolean;
    isWaiter?: boolean;
}) {
    try {
        // 1. Crear usuario
        const hashedPassword = await hash(password, 10);
        const [newUser] = await db
            .insert(users)
            .values({
                email,
                password: hashedPassword,
                name: `${firstName} ${lastName}`,
            })
            .returning();

        // 2. Crear empleado
        const [newEmployee] = await db
            .insert(employees)
            .values({
                branchId,
                userId: newUser.id,
                firstName,
                lastName,
                isOwner: isOwner ?? false,
                isManager: isManager ?? false,
                isCashier: isCashier ?? false,
                isKitchen: isKitchen ?? false,
                isDelivery: isDelivery ?? false,
                isWaiter: isWaiter ?? false,
                isActive: true,
            })
            .returning();

        revalidatePath("/empleados");
        
        return { success: true, employee: newEmployee };
    } catch (error) {
        console.error("Error creating employee:", error);
        return { success: false, error: "Error al crear empleado" };
    }
}

export async function updateEmployee({
    employeeId,
    firstName,
    lastName,
    isOwner,
    isManager,
    isCashier,
    isKitchen,
    isDelivery,
    isWaiter,
    isActive,
}: {
    employeeId: string;
    firstName: string;
    lastName: string;
    isOwner?: boolean;
    isManager?: boolean;
    isCashier?: boolean;
    isKitchen?: boolean;
    isDelivery?: boolean;
    isWaiter?: boolean;
    isActive?: boolean;
}) {
    try {
        const [updatedEmployee] = await db
            .update(employees)
            .set({
                firstName,
                lastName,
                isOwner: isOwner ?? false,
                isManager: isManager ?? false,
                isCashier: isCashier ?? false,
                isKitchen: isKitchen ?? false,
                isDelivery: isDelivery ?? false,
                isWaiter: isWaiter ?? false,
                isActive: isActive ?? true,
            })
            .where(eq(employees.id, employeeId))
            .returning();

        revalidatePath("/empleados");
        
        return { success: true, employee: updatedEmployee };
    } catch (error) {
        console.error("Error updating employee:", error);
        return { success: false, error: "Error al actualizar empleado" };
    }
}

export async function deleteEmployee({
    employeeId,
}: {
    employeeId: string;
}) {
    try {
        // Al eliminar el empleado, el usuario también se eliminará por cascade
        await db.delete(employees).where(eq(employees.id, employeeId));

        revalidatePath("/empleados");
        
        return { success: true };
    } catch (error) {
        console.error("Error deleting employee:", error);
        return { success: false, error: "Error al eliminar empleado" };
    }
}
