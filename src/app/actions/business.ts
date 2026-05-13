"use server";

import { db } from "@/app/db";
import { businesses } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateBusinessLogo({
  businessId,
  logoUrl,
}: {
  businessId: string;
  logoUrl: string | null;
}) {
  try {
    await db
      .update(businesses)
      .set({ logoUrl })
      .where(eq(businesses.id, businessId));

    revalidatePath("/panel");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating business logo:", error);
    return {
      success: false,
      error: "Error al actualizar el logo",
    };
  }
}

export async function getBusiness({ businessId }: { businessId: string }) {
  try {
    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, businessId),
    });

    if (!business) {
      return {
        success: false,
        error: "Negocio no encontrado",
      };
    }

    return {
      success: true,
      business,
    };
  } catch (error) {
    console.error("Error fetching business:", error);
    return {
      success: false,
      error: "Error al obtener el negocio",
    };
  }
}
