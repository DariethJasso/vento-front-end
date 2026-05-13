"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { createCashMovement } from "@/app/actions/cash-movements";
import { toast } from "sonner";

interface CashMovementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shiftId: string;
  branchId: string;
  businessId: string;
  employeeId: string;
}

export function CashMovementDialog({
  isOpen,
  onClose,
  shiftId,
  branchId,
  businessId,
  employeeId,
}: CashMovementDialogProps) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }

    if (!reason.trim()) {
      toast.error("Ingresa el motivo del movimiento");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createCashMovement({
        shiftId,
        branchId,
        businessId,
        employeeId,
        type,
        amount,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        toast.success(
          type === "income"
            ? "Ingreso registrado exitosamente"
            : "Gasto registrado exitosamente"
        );
        handleClose();
      } else {
        toast.error(result.error || "Error al registrar el movimiento");
      }
    } catch (error) {
      console.error("Error creating cash movement:", error);
      toast.error("Error al registrar el movimiento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setType("expense");
    setAmount("");
    setReason("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento de Efectivo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selector de tipo */}
          <div className="space-y-2">
            <Label>Tipo de Movimiento</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType("expense")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  type === "expense"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-border hover:border-red-300"
                }`}
              >
                <ArrowDownCircle className="h-6 w-6" />
                <span className="text-sm font-medium">Gasto</span>
              </button>
              <button
                onClick={() => setType("income")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  type === "income"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-border hover:border-green-300"
                }`}
              >
                <ArrowUpCircle className="h-6 w-6" />
                <span className="text-sm font-medium">Ingreso</span>
              </button>
            </div>
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo *</Label>
            <Input
              id="reason"
              placeholder={
                type === "expense"
                  ? "Ej: Compra de insumos, pago de servicios..."
                  : "Ej: Préstamo, fondo adicional..."
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Notas opcionales */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <textarea
              id="notes"
              placeholder="Detalles adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[80px] px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={200}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              className={`flex-1 ${
                type === "expense"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Registrar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
