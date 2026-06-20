"use server";

import { sendTicketEmail } from "@/lib/email";
import { db } from "@/app/db";
import { tickets, ticketItems, items, businesses, branches } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function sendTicketByEmail(ticketId: string, customerEmail: string) {
  try {
    // Obtener el ticket con todos sus datos
    const ticket = await db.query.tickets.findFirst({
      where: eq(tickets.id, ticketId),
      with: {
        branch: {
          with: {
            business: true,
          },
        },
      },
    });

    if (!ticket) {
      return { success: false, error: "Ticket no encontrado" };
    }

    // Obtener los items del ticket
    const ticketItemsData = await db.query.ticketItems.findMany({
      where: eq(ticketItems.ticketId, ticketId),
      with: {
        item: true,
      },
    });

    if (!ticketItemsData || ticketItemsData.length === 0) {
      return { success: false, error: "No se encontraron items en el ticket" };
    }

    // Preparar los datos del email
    const emailData = {
      to: customerEmail,
      ticketNumber: ticket.ticketNumber.toString(),
      items: ticketItemsData.map((ti) => ({
        name: ti.item?.name || "Producto",
        quantity: ti.quantity || 0,
        price: parseFloat(ti.price),
        notes: ti.notes || undefined,
      })),
      subtotal: parseFloat(ticket.total),
      tax: parseFloat(ticket.taxTotal || "0"),
      total: parseFloat(ticket.total),
      paymentMethod: ticket.paymentMethod || "cash",
      businessName: ticket.branch?.business?.name || "Negocio",
      branchName: ticket.branch?.name || "Sucursal",
      date: new Date(ticket.createdAt || new Date()).toLocaleString("es-MX", {
        dateStyle: "long",
        timeStyle: "short",
      }),
    };

    // Enviar el email
    const result = await sendTicketEmail(emailData);

    if (result.success) {
      console.log(`✅ Ticket #${ticket.ticketNumber} enviado a ${customerEmail}`);
      return { success: true, messageId: result.messageId };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("Error al enviar ticket por email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
