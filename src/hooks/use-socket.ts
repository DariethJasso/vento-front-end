"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

// Socket singleton - solo una instancia para toda la aplicación
let socket: Socket | null = null;
let isInitializing = false;

function getSocket(): Socket {
  if (!socket && !isInitializing) {
    isInitializing = true;
    console.log("🔌 Creating Socket.io connection...");
    
    socket = io({
      path: "/api/socket",
      addTrailingSlash: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      transports: ['polling'], // Solo polling para Next.js
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
      isInitializing = false;
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      isInitializing = false;
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
    });
  }
  
  return socket!;
}

export function useSocket(shiftId: string | undefined) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{
    type: string;
    ticketId?: string;
    ticketNumber?: number;
    nextNumber?: number;
    timestamp: string;
  } | null>(null);
  const shiftIdRef = useRef(shiftId);
  const hasJoinedShift = useRef(false);

  useEffect(() => {
    shiftIdRef.current = shiftId;
  }, [shiftId]);

  // Inicializar socket una sola vez
  useEffect(() => {
    const socketInstance = getSocket();

    const handleConnect = () => {
      console.log("✅ Socket connected in hook:", socketInstance.id);
      setIsConnected(true);
      
      // Unirse al turno si existe
      if (shiftIdRef.current && !hasJoinedShift.current) {
        console.log("👤 Auto-joining shift on connect:", shiftIdRef.current);
        socketInstance.emit("join-shift", shiftIdRef.current);
        hasJoinedShift.current = true;
      }
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected in hook");
      setIsConnected(false);
      hasJoinedShift.current = false;
    };

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);

    // Si ya está conectado, actualizar estado
    if (socketInstance.connected) {
      setIsConnected(true);
    }

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);
    };
  }, []);

  // Unirse al turno y escuchar eventos
  useEffect(() => {
    const socketInstance = getSocket();
    if (!shiftId || !socketInstance) return;

    // Unirse al turno actual solo si está conectado
    if (socketInstance.connected) {
      socketInstance.emit("join-shift", shiftId);
      console.log(`👤 Manually joining shift: ${shiftId}`);
    }

    // Escuchar actualizaciones de tickets
    const handleTicketUpdate = (data: any) => {
      console.log("🔄 Ticket update received:", data);
      setLastUpdate({
        type: data.type,
        ticketId: data.ticketId,
        ticketNumber: data.ticketNumber,
        timestamp: data.timestamp,
      });
    };

    // Escuchar cambios en número de ticket
    const handleTicketNumberChange = (data: any) => {
      console.log("🔢 Ticket number changed:", data);
      setLastUpdate({
        type: "number-changed",
        nextNumber: data.nextNumber,
        timestamp: data.timestamp,
      });
    };

    // Escuchar nuevos usuarios conectados
    const handleUserConnected = (data: any) => {
      console.log("👋 New user connected:", data);
    };

    socketInstance.on("ticket-update", handleTicketUpdate);
    socketInstance.on("ticket-number-change", handleTicketNumberChange);
    socketInstance.on("user-connected", handleUserConnected);

    return () => {
      socketInstance.off("ticket-update", handleTicketUpdate);
      socketInstance.off("ticket-number-change", handleTicketNumberChange);
      socketInstance.off("user-connected", handleUserConnected);
    };
  }, [shiftId]);

  // Funciones para emitir eventos
  const emitTicketCreated = (ticketId: string, ticketNumber: number) => {
    if (socket && shiftId) {
      console.log("📤 Emitting ticket-created:", { ticketId, ticketNumber });
      socket.emit("ticket-created", { shiftId, ticketId, ticketNumber });
      socket.emit("ticket-number-updated", { shiftId, nextNumber: ticketNumber + 1 });
    }
  };

  const emitTicketUpdated = (ticketId: string) => {
    if (socket && shiftId) {
      console.log("📤 Emitting ticket-updated:", ticketId);
      socket.emit("ticket-updated", { shiftId, ticketId });
    }
  };

  const emitTicketPaid = (ticketId: string) => {
    if (socket && shiftId) {
      console.log("📤 Emitting ticket-paid:", ticketId);
      socket.emit("ticket-paid", { shiftId, ticketId });
    }
  };

  const emitTicketDeleted = (ticketId: string) => {
    if (socket && shiftId) {
      console.log("📤 Emitting ticket-deleted:", ticketId);
      socket.emit("ticket-deleted", { shiftId, ticketId });
    }
  };

  return {
    isConnected,
    lastUpdate,
    emitTicketCreated,
    emitTicketUpdated,
    emitTicketPaid,
    emitTicketDeleted,
  };
}
