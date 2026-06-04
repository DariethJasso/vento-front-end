import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { NextApiResponse } from "next";

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
};

export function initSocketServer(res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log("🔌 Initializing Socket.io server...");

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("✅ Client connected:", socket.id);

      // Unirse a una sala por turno
      socket.on("join-shift", (shiftId: string) => {
        socket.join(`shift-${shiftId}`);
        console.log(`👤 Socket ${socket.id} joined shift-${shiftId}`);
        
        // Notificar a todos que hay un nuevo usuario conectado
        io.to(`shift-${shiftId}`).emit("user-connected", {
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });
      });

      // Nuevo ticket creado
      socket.on("ticket-created", (data) => {
        console.log("📝 Ticket created:", data);
        socket.to(`shift-${data.shiftId}`).emit("ticket-update", {
          type: "created",
          ticketNumber: data.ticketNumber,
          ticketId: data.ticketId,
          shiftId: data.shiftId,
          timestamp: new Date().toISOString(),
        });
      });

      // Ticket actualizado
      socket.on("ticket-updated", (data) => {
        console.log("✏️ Ticket updated:", data);
        socket.to(`shift-${data.shiftId}`).emit("ticket-update", {
          type: "updated",
          ticketId: data.ticketId,
          shiftId: data.shiftId,
          timestamp: new Date().toISOString(),
        });
      });

      // Ticket cobrado/cerrado
      socket.on("ticket-paid", (data) => {
        console.log("💰 Ticket paid:", data);
        socket.to(`shift-${data.shiftId}`).emit("ticket-update", {
          type: "paid",
          ticketId: data.ticketId,
          shiftId: data.shiftId,
          timestamp: new Date().toISOString(),
        });
      });

      // Ticket eliminado
      socket.on("ticket-deleted", (data) => {
        console.log("🗑️ Ticket deleted:", data);
        socket.to(`shift-${data.shiftId}`).emit("ticket-update", {
          type: "deleted",
          ticketId: data.ticketId,
          shiftId: data.shiftId,
          timestamp: new Date().toISOString(),
        });
      });

      // Número de ticket actualizado
      socket.on("ticket-number-updated", (data) => {
        console.log("🔢 Ticket number updated:", data);
        socket.to(`shift-${data.shiftId}`).emit("ticket-number-change", {
          nextNumber: data.nextNumber,
          shiftId: data.shiftId,
          timestamp: new Date().toISOString(),
        });
      });

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    res.socket.server.io = io;
  }

  return res.socket.server.io;
}
