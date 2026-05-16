"use server";

import { db } from "@/app/db";
import { tickets, ticketItems } from "@/app/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { incrementTicketCounter, updateShiftSales } from "./shifts";

export async function createTicket(data: {
  branchId: string;
  shiftId: string;
  customerId?: string;
  ticketNumber: string;
  ticketType?: string;
  items: Array<{
    itemId: string;
    quantity: number;
    price: string;
    notes?: string;
    selectedCustomKind?: string | Array<{name: string, price?: string}>;
    groupId?: string;
  }>;
  total: string;
  taxTotal: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  notes?: string;
}) {
  try {
    const [ticket] = await db
      .insert(tickets)
      .values({
        branchId: data.branchId,
        shiftId: data.shiftId,
        customerId: data.customerId,
        ticketNumber: data.ticketNumber,
        ticketType: data.ticketType || "dine_in",
        total: data.total,
        taxTotal: data.taxTotal,
        status: data.status || "open",
        paymentStatus: data.paymentStatus || "pending",
        paymentMethod: data.paymentMethod || "cash",
        notes: data.notes,
      })
      .returning();

    if (data.items.length > 0) {
      await db.insert(ticketItems).values(
        data.items.map((item) => ({
          ticketId: ticket.id,
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
          selectedCustomKind: item.selectedCustomKind,
          groupId: item.groupId,
          taxRate: "16",
          taxAmount: (parseFloat(item.price) * item.quantity * 0.16).toFixed(2),
        }))
      );
    }

    // Incrementar contador de tickets del turno
    await incrementTicketCounter({ shiftId: data.shiftId });

    // Si el ticket está pagado, actualizar ventas del turno
    if (data.paymentStatus === "paid") {
      await updateShiftSales({
        shiftId: data.shiftId,
        saleAmount: parseFloat(data.total),
      });
    }

    revalidatePath("/pos");

    return { success: true, ticket };
  } catch (error) {
    console.error("Error creating ticket:", error);
    return { success: false, error: "Error al crear el ticket" };
  }
}

export async function getOpenTickets(branchId: string, shiftId?: string) {
  try {
    const conditions = [
      eq(tickets.branchId, branchId),
      eq(tickets.status, "open")
    ];

    // Si se proporciona shiftId, filtrar solo tickets de ese turno
    if (shiftId) {
      conditions.push(eq(tickets.shiftId, shiftId));
    }

    const openTickets = await db.query.tickets.findMany({
      where: and(...conditions),
      with: {
        ticketItems: {
          with: {
            item: true,
          },
        },
        customer: true,
      },
      orderBy: [desc(tickets.createdAt)],
    });

    return { success: true, tickets: openTickets };
  } catch (error) {
    console.error("Error getting open tickets:", error);
    return { success: false, error: "Error al obtener tickets abiertos" };
  }
}

export async function updateTicket(
  ticketId: string,
  data: {
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    total?: string;
    taxTotal?: string;
  }
) {
  try {
    const [updatedTicket] = await db
      .update(tickets)
      .set({
        ...data,
        updatedAt: new Date(),
        closedAt: data.status === "closed" ? new Date() : null,
      })
      .where(eq(tickets.id, ticketId))
      .returning();

    revalidatePath("/pos");
    return { success: true, ticket: updatedTicket };
  } catch (error) {
    console.error("Error updating ticket:", error);
    return { success: false, error: "Error al actualizar el ticket" };
  }
}

export async function addItemToTicket(
  ticketId: string,
  item: {
    itemId: string;
    quantity: number;
    price: string;
    notes?: string;
  }
) {
  try {
    await db.insert(ticketItems).values({
      ticketId,
      itemId: item.itemId,
      quantity: item.quantity,
      price: item.price,
      notes: item.notes,
      taxRate: "16",
      taxAmount: (parseFloat(item.price) * item.quantity * 0.16).toFixed(2),
    });

    revalidatePath("/pos");
    return { success: true };
  } catch (error) {
    console.error("Error adding item to ticket:", error);
    return { success: false, error: "Error al agregar item al ticket" };
  }
}

export async function updateTicketItem(
  itemId: string,
  data: {
    quantity?: number;
    notes?: string;
  }
) {
  try {
    await db
      .update(ticketItems)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(ticketItems.id, itemId));

    revalidatePath("/pos");
    return { success: true };
  } catch (error) {
    console.error("Error updating ticket item:", error);
    return { success: false, error: "Error al actualizar item" };
  }
}

export async function deleteTicketItem(itemId: string) {
  try {
    await db.delete(ticketItems).where(eq(ticketItems.id, itemId));

    revalidatePath("/pos");
    return { success: true };
  } catch (error) {
    console.error("Error deleting ticket item:", error);
    return { success: false, error: "Error al eliminar item" };
  }
}

export async function getTicketsByShift(shiftId: string) {
  try {
    const shiftTickets = await db.query.tickets.findMany({
      where: eq(tickets.shiftId, shiftId),
      with: {
        ticketItems: true,
      },
      orderBy: [desc(tickets.createdAt)],
    });

    return { success: true, tickets: shiftTickets };
  } catch (error) {
    console.error("Error fetching tickets by shift:", error);
    return { success: false, error: "Error al obtener tickets del turno" };
  }
}

export async function updateTicketComplete(
  ticketId: string,
  data: {
    shiftId: string;
    customerId?: string;
    ticketType?: string;
    items: Array<{
      itemId: string;
      quantity: number;
      price: string;
      notes?: string;
      selectedCustomKind?: string | Array<{name: string, price?: string}>;
      groupId?: string;
    }>;
    total: string;
    taxTotal: string;
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
  }
) {
  try {
    // 1. Actualizar el ticket
    const [updatedTicket] = await db
      .update(tickets)
      .set({
        customerId: data.customerId,
        ticketType: data.ticketType,
        total: data.total,
        taxTotal: data.taxTotal,
        status: data.status || "open",
        paymentStatus: data.paymentStatus || "pending",
        paymentMethod: data.paymentMethod || "cash",
        updatedAt: new Date(),
        closedAt: data.status === "closed" ? new Date() : null,
      })
      .where(eq(tickets.id, ticketId))
      .returning();

    // 2. Eliminar items anteriores
    await db.delete(ticketItems).where(eq(ticketItems.ticketId, ticketId));

    // 3. Insertar nuevos items
    if (data.items.length > 0) {
      await db.insert(ticketItems).values(
        data.items.map((item) => ({
          ticketId: ticketId,
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
          selectedCustomKind: item.selectedCustomKind,
          groupId: item.groupId,
          taxRate: "16",
          taxAmount: (parseFloat(item.price) * item.quantity * 0.16).toFixed(2),
        }))
      );
    }

    // 4. Si el ticket está pagado, actualizar ventas del turno
    if (data.paymentStatus === "paid") {
      await updateShiftSales({
        shiftId: data.shiftId,
        saleAmount: parseFloat(data.total),
      });
    }

    revalidatePath("/pos");

    return { success: true, ticket: updatedTicket };
  } catch (error) {
    console.error("Error updating ticket:", error);
    return { success: false, error: "Error al actualizar el ticket" };
  }
}

export async function updateTicketItemStatus(itemId: string, status: string) {
  try {
    await db
      .update(ticketItems)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(ticketItems.id, itemId));

    revalidatePath("/pos");

    return { success: true };
  } catch (error) {
    console.error("Error updating ticket item status:", error);
    return { success: false, error: "Error al actualizar el estado del item" };
  }
}
