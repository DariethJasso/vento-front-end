import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { users,businesses,employees } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, businessName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name: name || null,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      });

    // Crear negocio
    const finalBusinessName = businessName || name || "Mi Negocio";
    const [newBusiness] = await db
      .insert(businesses)
      .values({
        name: finalBusinessName,
        isPro: false,
        plan: "free",
        ownerId: newUser.id,
      })
      .returning({
        id: businesses.id,
        name: businesses.name,
        isPro: businesses.isPro,
        plan: businesses.plan,
      });

    // Crear empleado (dueño)
    const [newEmployee] = await db
      .insert(employees)
      .values({
        userId: newUser.id,
        firstName: name || "",
        lastName: "",
        isOwner: true,
        isActive: true,
        branchId: null, // Sin sucursal por ahora
        businessId: newBusiness.id,
      })
      .returning({
        id: employees.id,
        userId: employees.userId,
        isOwner: employees.isOwner,
        isActive: employees.isActive,
      });

    return NextResponse.json(
      {
        message: "Usuario y negocio creados exitosamente",
        user: newUser,
        business: newBusiness,
        employee: newEmployee,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    
    // Mostrar error más específico
    const errorMessage = error instanceof Error ? error.message : "Error al crear usuario";
    
    return NextResponse.json(
      { 
        error: "Error al crear usuario",
        details: errorMessage,
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
