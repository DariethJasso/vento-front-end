"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, DollarSign, Receipt, TrendingUp, ChevronRight } from "lucide-react";
import ShiftDetailDialog from "./shift-detail-dialog";

interface ShiftReportListProps {
  shifts: any[];
  branchId: string;
}

export default function ShiftReportList({ shifts, branchId }: ShiftReportListProps) {
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewDetail = (shift: any) => {
    setSelectedShift(shift);
    setIsDetailOpen(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (openedAt: Date, closedAt: Date | null) => {
    if (!closedAt) return "En progreso";
    const duration = new Date(closedAt).getTime() - new Date(openedAt).getTime();
    const hours = Math.floor(duration / 1000 / 60 / 60);
    const minutes = Math.floor((duration / 1000 / 60) % 60);
    return `${hours}h ${minutes}m`;
  };

  if (shifts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No hay turnos registrados</h3>
          <p className="text-muted-foreground text-center">
            Los turnos aparecerán aquí una vez que se abran desde el panel
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {shifts.map((shift) => {
          const isOpen = shift.status === "open";
          const difference = shift.finalCash 
            ? parseFloat(shift.finalCash) - parseFloat(shift.expectedCash || "0")
            : 0;

          return (
            <Card key={shift.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {formatDate(shift.openedAt)}
                      {isOpen && (
                        <Badge variant="default" className="ml-2">
                          Activo
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(shift.openedAt)} - {shift.closedAt ? formatTime(shift.closedAt) : "Abierto"}
                      </span>
                      <span>
                        Duración: {calculateDuration(shift.openedAt, shift.closedAt)}
                      </span>
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetail(shift)}
                    className="gap-2"
                  >
                    Ver detalle
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Total Vendido
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      ${parseFloat(shift.totalSales || "0").toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Receipt className="h-4 w-4" />
                      Tickets
                    </p>
                    <p className="text-2xl font-bold">
                      {shift.ticketCounter || 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Efectivo Esperado
                    </p>
                    <p className="text-2xl font-bold">
                      ${parseFloat(shift.expectedCash || "0").toFixed(2)}
                    </p>
                  </div>
                  {!isOpen && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Diferencia</p>
                      <p className={`text-2xl font-bold ${
                        difference >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {difference >= 0 ? "+" : ""}${difference.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedShift && (
        <ShiftDetailDialog
          shift={selectedShift}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedShift(null);
          }}
        />
      )}
    </>
  );
}
