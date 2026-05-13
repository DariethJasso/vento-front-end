"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WeightInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  pricePerKg: number;
  onConfirm: (weight: number, totalPrice: number) => void;
}

export default function WeightInputDialog({
  open,
  onOpenChange,
  itemName,
  pricePerKg,
  onConfirm,
}: WeightInputDialogProps) {
  const [weight, setWeight] = useState("");

  const calculateTotal = () => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) return 0;
    return weightNum * pricePerKg;
  };

  const handleConfirm = () => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      alert("Por favor ingresa un peso válido");
      return;
    }

    const total = calculateTotal();
    onConfirm(weightNum, total);
    setWeight("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setWeight("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ingresar peso</DialogTitle>
          <DialogDescription>
            {itemName} - ${pricePerKg.toFixed(2)} por kg
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.001"
              min="0.001"
              placeholder="Ej: 1.500"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm();
                }
              }}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Ingresa el peso en kilogramos (ej: 0.500 para 500g)
            </p>
          </div>

          {weight && parseFloat(weight) > 0 && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Peso:</span>
                <span className="font-semibold">{parseFloat(weight).toFixed(3)} kg</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">Precio por kg:</span>
                <span className="font-semibold">${pricePerKg.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold text-orange-500">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              disabled={!weight || parseFloat(weight) <= 0}
            >
              Agregar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
