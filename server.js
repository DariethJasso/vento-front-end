const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0'; // En producción, escuchar en todas las interfaces
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Inicializar Socket.io
  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['polling'], // Solo polling para Next.js
    allowEIO3: true,
  });

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Unirse a una sala por turno
    socket.on('join-shift', (shiftId) => {
      socket.join(`shift-${shiftId}`);
      console.log(`👤 Socket ${socket.id} joined shift-${shiftId}`);
      
      io.to(`shift-${shiftId}`).emit('user-connected', {
        socketId: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    // Nuevo ticket creado
    socket.on('ticket-created', (data) => {
      console.log('📝 Ticket created:', data);
      socket.to(`shift-${data.shiftId}`).emit('ticket-update', {
        type: 'created',
        ticketNumber: data.ticketNumber,
        ticketId: data.ticketId,
        shiftId: data.shiftId,
        timestamp: new Date().toISOString(),
      });
    });

    // Ticket actualizado
    socket.on('ticket-updated', (data) => {
      console.log('✏️ Ticket updated:', data);
      socket.to(`shift-${data.shiftId}`).emit('ticket-update', {
        type: 'updated',
        ticketId: data.ticketId,
        shiftId: data.shiftId,
        timestamp: new Date().toISOString(),
      });
    });

    // Ticket cobrado/cerrado
    socket.on('ticket-paid', (data) => {
      console.log('💰 Ticket paid:', data);
      socket.to(`shift-${data.shiftId}`).emit('ticket-update', {
        type: 'paid',
        ticketId: data.ticketId,
        shiftId: data.shiftId,
        timestamp: new Date().toISOString(),
      });
    });

    // Ticket eliminado
    socket.on('ticket-deleted', (data) => {
      console.log('🗑️ Ticket deleted:', data);
      socket.to(`shift-${data.shiftId}`).emit('ticket-update', {
        type: 'deleted',
        ticketId: data.ticketId,
        shiftId: data.shiftId,
        timestamp: new Date().toISOString(),
      });
    });

    // Número de ticket actualizado
    socket.on('ticket-number-updated', (data) => {
      console.log('🔢 Ticket number updated:', data);
      socket.to(`shift-${data.shiftId}`).emit('ticket-number-change', {
        nextNumber: data.nextNumber,
        shiftId: data.shiftId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Server ready on http://${hostname}:${port}`);
      console.log(`🔌 Socket.io ready on path: /api/socket`);
    });
});
