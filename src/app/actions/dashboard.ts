"use server";

import { db } from "@/app/db";
import { tickets, shifts, customers, cashMovements } from "@/app/db/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";

export async function getDashboardStats({
  businessId,
  startDate,
  endDate,
}: {
  businessId: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    // Construir condiciones de fecha
    const dateConditions = [];
    if (startDate) {
      dateConditions.push(gte(tickets.createdAt, startDate));
    }
    if (endDate) {
      dateConditions.push(lte(tickets.createdAt, endDate));
    }

    // Obtener todos los tickets del negocio a través de branches
    const allTickets = await db.query.tickets.findMany({
      where: and(
        eq(tickets.status, "closed"),
        ...dateConditions
      ),
      with: {
        branch: true,
        customer: true,
      },
    });

    // Filtrar por businessId a través de la relación
    const businessTickets = allTickets.filter(
      (ticket) => ticket.branch?.businessId === businessId
    );

    // Calcular estadísticas
    const totalSales = businessTickets.reduce(
      (sum, ticket) => sum + parseFloat(ticket.total),
      0
    );

    const totalTickets = businessTickets.length;

    const paidTickets = businessTickets.filter(
      (t) => t.paymentStatus === "paid"
    ).length;

    const pendingTickets = businessTickets.filter(
      (t) => t.paymentStatus === "pending"
    ).length;

    // Ventas por método de pago
    const salesByPaymentMethod = businessTickets.reduce((acc, ticket) => {
      const method = ticket.paymentMethod || "cash";
      if (!acc[method]) {
        acc[method] = 0;
      }
      acc[method] += parseFloat(ticket.total);
      return acc;
    }, {} as Record<string, number>);

    // Tickets por tipo (dine_in, pick_up, delivery)
    const ticketsByType = businessTickets.reduce((acc, ticket) => {
      const type = ticket.ticketType || "dine_in";
      if (!acc[type]) {
        acc[type] = { count: 0, total: 0 };
      }
      acc[type].count += 1;
      acc[type].total += parseFloat(ticket.total);
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Clientes únicos
    const uniqueCustomers = new Set(
      businessTickets
        .filter((t) => t.customerId)
        .map((t) => t.customerId)
    ).size;

    return {
      success: true,
      stats: {
        totalSales,
        totalTickets,
        paidTickets,
        pendingTickets,
        salesByPaymentMethod,
        ticketsByType,
        uniqueCustomers,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      error: "Error al obtener estadísticas",
    };
  }
}

export async function getShiftStats({ shiftId }: { shiftId: string }) {
  try {
    const shiftTickets = await db.query.tickets.findMany({
      where: and(
        eq(tickets.shiftId, shiftId),
        eq(tickets.status, "closed")
      ),
      with: {
        customer: true,
        ticketItems: {
          with: {
            item: true,
          },
        },
      },
    });

    // Obtener movimientos de efectivo del turno
    const movements = await db.query.cashMovements.findMany({
      where: eq(cashMovements.shiftId, shiftId),
      with: {
        employee: true,
      },
    });

    const totalSales = shiftTickets.reduce(
      (sum, ticket) => sum + parseFloat(ticket.total),
      0
    );

    const totalTickets = shiftTickets.length;

    const paidTickets = shiftTickets.filter(
      (t) => t.paymentStatus === "paid"
    ).length;

    const pendingTickets = shiftTickets.filter(
      (t) => t.paymentStatus === "pending"
    ).length;

    // Ventas por método de pago
    const salesByPaymentMethod = shiftTickets.reduce((acc, ticket) => {
      const method = ticket.paymentMethod || "cash";
      if (!acc[method]) {
        acc[method] = 0;
      }
      acc[method] += parseFloat(ticket.total);
      return acc;
    }, {} as Record<string, number>);

    // Tickets por tipo
    const ticketsByType = shiftTickets.reduce((acc, ticket) => {
      const type = ticket.ticketType || "dine_in";
      if (!acc[type]) {
        acc[type] = { count: 0, total: 0 };
      }
      acc[type].count += 1;
      acc[type].total += parseFloat(ticket.total);
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    // Total de items vendidos
    const totalItems = shiftTickets.reduce(
      (sum, ticket) =>
        sum +
        ticket.ticketItems.reduce(
          (itemSum, item) => itemSum + (item.quantity || 0),
          0
        ),
      0
    );

    // Calcular totales de movimientos
    const totalExpenses = movements
      .filter(m => m.type === "expense")
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    const totalIncome = movements
      .filter(m => m.type === "income")
      .reduce((sum, m) => sum + parseFloat(m.amount), 0);

    return {
      success: true,
      stats: {
        totalSales,
        totalTickets,
        paidTickets,
        pendingTickets,
        salesByPaymentMethod,
        ticketsByType,
        totalItems,
        tickets: shiftTickets,
        cashMovements: movements,
        totalExpenses,
        totalIncome,
      },
    };
  } catch (error) {
    console.error("Error fetching shift stats:", error);
    return {
      success: false,
      error: "Error al obtener estadísticas del turno",
    };
  }
}
