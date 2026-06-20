"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Banknote, ArrowLeftRight, Mail } from "lucide-react";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onConfirmPayment: (paymentMethod: string, amountPaid?: number, sendEmail?: boolean, customerEmail?: string) => void;
}

export default function PaymentDialog({
  isOpen,
  onClose,
  total,
  onConfirmPayment,
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [cashAmount, setCashAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");

  const calculateChange = () => {
    const amount = parseFloat(cashAmount);
    if (isNaN(amount) || amount < total) return 0;
    return amount - total;
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    
    // Validar email si se seleccionó enviar por correo
    if (sendEmail && !customerEmail) {
      alert("Por favor ingresa un correo electrónico válido");
      setIsProcessing(false);
      return;
    }

    if (sendEmail && !customerEmail.includes("@")) {
      alert("Por favor ingresa un correo electrónico válido");
      setIsProcessing(false);
      return;
    }
    
    if (paymentMethod === "cash") {
      const amount = parseFloat(cashAmount);
      if (isNaN(amount) || amount < total) {
        alert("El monto ingresado es insuficiente");
        setIsProcessing(false);
        return;
      }
      await onConfirmPayment(paymentMethod, amount, sendEmail, customerEmail);
    } else {
      await onConfirmPayment(paymentMethod, undefined, sendEmail, customerEmail);
    }
    
    setIsProcessing(false);
    setCashAmount("");
    setSendEmail(false);
    setCustomerEmail("");
    onClose();
  };

  const handleClose = () => {
    setCashAmount("");
    setPaymentMethod("cash");
    setSendEmail(false);
    setCustomerEmail("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Procesar Pago</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Total a pagar */}
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total a pagar</p>
            <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
          </div>

          {/* Métodos de pago */}
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === "cash"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Banknote className={`h-6 w-6 ${paymentMethod === "cash" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">Efectivo</span>
              </button>

              <button
                onClick={() => setPaymentMethod("card")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === "card"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <CreditCard className={`h-6 w-6 ${paymentMethod === "card" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">Tarjeta</span>
              </button>

              <button
                onClick={() => setPaymentMethod("transfer")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === "transfer"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <ArrowLeftRight className={`h-6 w-6 ${paymentMethod === "transfer" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium">Transfer.</span>
              </button>
            </div>
          </div>

          {/* Input de efectivo */}
          {paymentMethod === "cash" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="cashAmount">Monto recibido</Label>
                <Input
                  id="cashAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="text-lg"
                  autoFocus
                />
              </div>

              {/* Cambio */}
              {cashAmount && parseFloat(cashAmount) >= total && (
                <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300 mb-1">Cambio</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${calculateChange().toFixed(2)}
                  </p>
                </div>
              )}

              {/* Advertencia de monto insuficiente */}
              {cashAmount && parseFloat(cashAmount) < total && (
                <div className="bg-red-50 dark:bg-red-950 rounded-lg p-3 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Monto insuficiente. Faltan ${(total - parseFloat(cashAmount)).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Opción de enviar ticket por correo */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked as boolean)}
              />
              <label
                htmlFor="sendEmail"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Enviar ticket por correo
              </label>
            </div>

            {sendEmail && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="customerEmail">Correo electrónico del cliente</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={handleConfirm}
            disabled={
              isProcessing ||
              (paymentMethod === "cash" && (!cashAmount || parseFloat(cashAmount) < total))
            }
          >
            {isProcessing ? "Procesando..." : "Confirmar Pago"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
