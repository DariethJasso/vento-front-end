"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, DollarSign, CreditCard, Banknote, ArrowLeftRight, Clock } from "lucide-react";
import { getTicketsByShift } from "@/app/actions/tickets";

interface ShiftDetailDialogProps {
  shift: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShiftDetailDialog({ shift, isOpen, onClose }: ShiftDetailDialogProps) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && shift) {
      loadTickets();
    }
  }, [isOpen, shift]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const result = await getTicketsByShift(shift.id);
      if (result.success && result.tickets) {
        setTickets(result.tickets);
      }
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'transfer':
        return <ArrowLeftRight className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Efectivo';
      case 'card':
        return 'Tarjeta';
      case 'transfer':
        return 'Transferencia';
      default:
        return method;
    }
  };

  const ticketsByPaymentMethod = tickets.reduce((acc, ticket) => {
    if (ticket.paymentStatus === 'paid') {
      const method = ticket.paymentMethod || 'cash';
      acc[method] = (acc[method] || 0) + parseFloat(ticket.total);
    }
    return acc;
  }, {} as Record<string, number>);

  const paidTickets = tickets.filter(t => t.paymentStatus === 'paid');
  const pendingTickets = tickets.filter(t => t.paymentStatus === 'pending');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Detalle del Turno - {formatDate(shift.openedAt)}
          </DialogTitle>
        </DialogHeader>

        {/* Resumen del turno */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Total Vendido</p>
              <p className="text-2xl font-bold text-green-600">
                ${parseFloat(shift.totalSales || "0").toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Tickets Totales</p>
              <p className="text-2xl font-bold">{shift.ticketCounter || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Tickets Pagados</p>
              <p className="text-2xl font-bold text-green-600">{paidTickets.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Tickets Pendientes</p>
              <p className="text-2xl font-bold text-orange-600">{pendingTickets.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Ventas por método de pago */}
        {Object.keys(ticketsByPaymentMethod).length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Ventas por Método de Pago</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.entries(ticketsByPaymentMethod) as [string, number][]).map(([method, total]) => (
                <Card key={method}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(method)}
                        <span className="text-sm font-medium">
                          {getPaymentMethodLabel(method)}
                        </span>
                      </div>
                      <span className="text-lg font-bold">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Lista de tickets */}
        <div>
          <h3 className="font-semibold mb-3">Tickets del Turno</h3>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Cargando tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay tickets en este turno</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{ticket.ticketNumber}</span>
                            <Badge variant={ticket.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                              {ticket.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(ticket.createdAt)}
                            </span>
                            {ticket.paymentStatus === 'paid' && (
                              <span className="flex items-center gap-1">
                                {getPaymentMethodIcon(ticket.paymentMethod)}
                                {getPaymentMethodLabel(ticket.paymentMethod)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          ${parseFloat(ticket.total).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.ticketItems?.length || 0} items
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
