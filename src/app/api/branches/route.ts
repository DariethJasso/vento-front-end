import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/app/db";
import { branches, branchesConfig, businesses } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, address, phoneNumbers } = body;

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Obtener el negocio del usuario
    const business = await db.query.businesses.findFirst({
      where: eq(businesses.ownerId, session.user.id),
    });

    if (!business) {
      return NextResponse.json(
        { error: "No se encontró el negocio del usuario" },
        { status: 404 }
      );
    }

    // Crear la sucursal
    const [newBranch] = await db
      .insert(branches)
      .values({
        name,
        address: address || null,
        phoneNumbers: phoneNumbers && phoneNumbers.length > 0 ? phoneNumbers : null,
        businessId: business.id,
      })
      .returning({
        id: branches.id,
        name: branches.name,
        address: branches.address,
        phoneNumbers: branches.phoneNumbers,
        businessId: branches.businessId,
      });

      //crear configuracion inicial
      await db.insert(branchesConfig).values({
        branchId: newBranch.id,
      });

    return NextResponse.json(
      {
        message: "Sucursal creada exitosamente",
        branch: newBranch,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear sucursal:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Error al crear sucursal";
    
    return NextResponse.json(
      { 
        error: "Error al crear sucursal",
        details: errorMessage,
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener el negocio del usuario
    const business = await db.query.businesses.findFirst({
      where: eq(businesses.ownerId, session.user.id),
    });

    if (!business) {
      return NextResponse.json(
        { error: "No se encontró el negocio del usuario" },
        { status: 404 }
      );
    }

    // Obtener todas las sucursales del negocio
    const branchesList = await db.query.branches.findMany({
      where: eq(branches.businessId, business.id),
    });

    return NextResponse.json({
      branches: branchesList,
    });
  } catch (error) {
    console.error("Error al obtener sucursales:", error);
    return NextResponse.json(
      { error: "Error al obtener sucursales" },
      { status: 500 }
    );
  }
}
