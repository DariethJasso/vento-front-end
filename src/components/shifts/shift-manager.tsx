"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { openShift, closeShift } from "@/app/actions/shifts";
import { Clock, DollarSign, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ShiftManagerProps {
  branchId: string;
  branchName: string;
  userId: string;
  activeShift: any | null;
}

export function ShiftManager({ branchId, branchName, userId, activeShift }: ShiftManagerProps) {
  const router = useRouter();
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [initialCash, setInitialCash] = useState("");
  const [finalCash, setFinalCash] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenShift = async () => {
    if (!initialCash || parseFloat(initialCash) < 0) {
      alert("Por favor ingresa un monto inicial válido");
      return;
    }

    setIsLoading(true);
    const result = await openShift({
      branchId,
      userId,
      initialCash,
    });

    if (result.success) {
      setIsOpenDialogOpen(false);
      setInitialCash("");
      router.refresh();
    } else {
      alert(result.error || "Error al abrir el turno");
    }
    setIsLoading(false);
  };

  const handleCloseShift = async () => {
    if (!finalCash || parseFloat(finalCash) < 0) {
      alert("Por favor ingresa un monto final válido");
      return;
    }

    if (!activeShift) return;

    setIsLoading(true);
    const result = await closeShift({
      shiftId: activeShift.id,
      userId,
      finalCash,
    });

    if (result.success) {
      setIsCloseDialogOpen(false);
      setFinalCash("");
      router.refresh();
    } else {
      alert(result.error || "Error al cerrar el turno");
    }
    setIsLoading(false);
  };

  const calculateDifference = () => {
    if (!activeShift || !finalCash) return null;
    const expected = parseFloat(activeShift.expectedCash || "0");
    const final = parseFloat(finalCash);
    return final - expected;
  };

  return (
    <div className="space-y-4">
      {/* Estado del turno */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${activeShift ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{branchName}</h3>
            <p className="text-sm text-muted-foreground">
              {activeShift ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Turno abierto desde {new Date(activeShift.openedAt).toLocaleTimeString()}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Sin turno activo
                </span>
              )}
            </p>
          </div>
        </div>

        {activeShift ? (
          <Button
            variant="destructive"
            onClick={() => setIsCloseDialogOpen(true)}
          >
            Cerrar turno
          </Button>
        ) : (
          <Button
            onClick={() => setIsOpenDialogOpen(true)}
          >
            Abrir turno
          </Button>
        )}
      </div>

      {/* Dialog para abrir turno */}
      <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir turno - {branchName}</DialogTitle>
            <DialogDescription>
              Ingresa el monto inicial en caja para comenzar el turno
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="initialCash">Monto inicial en caja</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="initialCash"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={initialCash}
                  onChange={(e) => setInitialCash(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpenDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleOpenShift}
              disabled={isLoading}
            >
              {isLoading ? "Abriendo..." : "Abrir turno"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para cerrar turno */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar turno - {branchName}</DialogTitle>
            <DialogDescription>
              Ingresa el monto final en caja para cerrar el turno
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {activeShift && (
              <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monto inicial:</span>
                  <span className="font-medium">${parseFloat(activeShift.initialCash || "0").toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Esperado en caja:</span>
                  <span className="font-medium">${parseFloat(activeShift.expectedCash || "0").toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="finalCash">Monto final en caja</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="finalCash"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={finalCash}
                  onChange={(e) => setFinalCash(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {finalCash && activeShift && (
              <div className={`p-3 rounded-lg ${
                calculateDifference()! >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {calculateDifference()! >= 0 ? 'Sobrante:' : 'Faltante:'}
                  </span>
                  <span className={`font-bold ${
                    calculateDifference()! >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${Math.abs(calculateDifference()!).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCloseDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCloseShift}
              disabled={isLoading}
            >
              {isLoading ? "Cerrando..." : "Cerrar turno"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
