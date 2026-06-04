"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { openShift, closeShift } from "@/app/actions/shifts";
import { useRouter } from "next/navigation";
import { Clock, DollarSign, Receipt, TrendingUp, Store } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  address: string | null;
}

interface ShiftManagerProps {
  branchId: string;
  userId: string;
  activeShift: any;
  activeShifts?: any[];
  isOwner?: boolean;
  branches?: Branch[];
}

export default function ShiftManager({ branchId, userId, activeShift, activeShifts = [], isOwner = false, branches = [] }: ShiftManagerProps) {
  console.log("ShiftManager Props:", { 
    activeShift, 
    activeShifts,
    isOwner, 
    branches, 
    branchesLength: branches.length,
    branchId 
  });
  const router = useRouter();
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [initialCash, setInitialCash] = useState("");
  const [finalCash, setFinalCash] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState(branchId);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenShift = async () => {
    if (!initialCash || parseFloat(initialCash) < 0) {
      alert("Ingrese un monto válido");
      return;
    }

    if (isOwner && !selectedBranchId) {
      alert("Seleccione una sucursal");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await openShift({
        branchId: selectedBranchId,
        userId,
        initialCash,
      });

      if (result.success) {
        alert("Turno abierto exitosamente");
        setIsOpenDialogOpen(false);
        setInitialCash("");
        router.refresh();
      } else {
        alert(result.error || "Error al abrir turno");
      }
    } catch (error) {
      console.error("Error opening shift:", error);
      alert("Error al abrir turno");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseShift = async () => {
    if (!finalCash || parseFloat(finalCash) < 0) {
      alert("Ingrese un monto válido");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await closeShift({
        shiftId: activeShift.id,
        userId,
        finalCash,
      });

      if (result.success) {
        const difference = parseFloat(finalCash) - parseFloat(activeShift.expectedCash || "0");
        const message = `Turno cerrado exitosamente\n\nResumen:\n` +
          `Total vendido: $${parseFloat(activeShift.totalSales || "0").toFixed(2)}\n` +
          `Tickets procesados: ${activeShift.ticketCounter || 0}\n` +
          `Efectivo esperado: $${parseFloat(activeShift.expectedCash || "0").toFixed(2)}\n` +
          `Efectivo final: $${parseFloat(finalCash).toFixed(2)}\n` +
          `Diferencia: $${difference.toFixed(2)} ${difference >= 0 ? "(Sobrante)" : "(Faltante)"}`;
        
        alert(message);
        setIsCloseDialogOpen(false);
        setFinalCash("");
        router.refresh();
      } else {
        alert(result.error || "Error al cerrar turno");
      }
    } catch (error) {
      console.error("Error closing shift:", error);
      alert("Error al cerrar turno");
    } finally {
      setIsProcessing(false);
    }
  };

  // Para owners, mostrar todos los turnos activos
  if (isOwner && activeShifts.length > 0) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Turnos Activos ({activeShifts.length})
            </CardTitle>
            <CardDescription>
              Turnos abiertos en tus sucursales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeShifts.map((shift: any) => {
              const openedAt = new Date(shift.openedAt);
              const duration = Math.floor((Date.now() - openedAt.getTime()) / 1000 / 60);
              
              return (
                <div key={shift.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{shift.branch?.name || "Sucursal"}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(duration / 60)}h {duration % 60}m
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Inicial</p>
                      <p className="font-semibold">${parseFloat(shift.initialCash || "0").toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vendido</p>
                      <p className="font-semibold text-green-600">${parseFloat(shift.totalSales || "0").toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tickets</p>
                      <p className="font-semibold">{shift.ticketCounter || 0}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <Button 
              onClick={() => setIsOpenDialogOpen(true)}
              className="w-full"
              variant="outline"
            >
              Abrir Nuevo Turno
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  // Para gerentes, mostrar el turno activo de su sucursal
  if (activeShift) {
    const openedAt = new Date(activeShift.openedAt);
    const duration = Math.floor((Date.now() - openedAt.getTime()) / 1000 / 60); // minutos

    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Turno Activo
            </CardTitle>
            <CardDescription>
              Abierto el {openedAt.toLocaleDateString()} a las {openedAt.toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Duración</p>
                <p className="text-2xl font-bold">{Math.floor(duration / 60)}h {duration % 60}m</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Efectivo inicial</p>
                <p className="text-2xl font-bold">${parseFloat(activeShift.initialCash || "0").toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Total vendido
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${parseFloat(activeShift.totalSales || "0").toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Receipt className="h-4 w-4" />
                  Tickets
                </p>
                <p className="text-2xl font-bold">{activeShift.ticketCounter || 0}</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsCloseDialogOpen(true)}
              variant="destructive"
              className="w-full"
            >
              Cerrar Turno
            </Button>
          </CardContent>
        </Card>

        {/* Dialog para cerrar turno */}
        <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cerrar Turno</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Resumen del turno</Label>
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Efectivo inicial:</span>
                    <span className="font-medium">${parseFloat(activeShift.initialCash || "0").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total vendido:</span>
                    <span className="font-medium text-green-600">
                      ${parseFloat(activeShift.totalSales || "0").toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tickets procesados:</span>
                    <span className="font-medium">{activeShift.ticketCounter || 0}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Efectivo esperado:</span>
                    <span className="font-semibold">
                      ${parseFloat(activeShift.expectedCash || "0").toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalCash">Efectivo final en caja</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="finalCash"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={finalCash}
                    onChange={(e) => setFinalCash(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
              </div>

              {finalCash && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Diferencia:</span>
                    <span className={`text-lg font-bold ${
                      parseFloat(finalCash) - parseFloat(activeShift.expectedCash || "0") >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                      ${(parseFloat(finalCash) - parseFloat(activeShift.expectedCash || "0")).toFixed(2)}
                      {parseFloat(finalCash) - parseFloat(activeShift.expectedCash || "0") >= 0 
                        ? " (Sobrante)" 
                        : " (Faltante)"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsCloseDialogOpen(false);
                  setFinalCash("");
                }}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleCloseShift}
                disabled={isProcessing || !finalCash}
              >
                {isProcessing ? "Cerrando..." : "Cerrar Turno"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Turno</CardTitle>
          <CardDescription>
            No hay un turno activo en esta sucursal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setIsOpenDialogOpen(true)}
            className="w-full"
          >
            Abrir Turno
          </Button>
        </CardContent>
      </Card>

      {/* Dialog para abrir turno */}
      <Dialog open={isOpenDialogOpen} onOpenChange={setIsOpenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Turno</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Selector de sucursal - Solo para owners */}
            {isOwner && (
              <div className="space-y-2">
                <Label htmlFor="branch">Sucursal</Label>
                {branches.length > 0 ? (
                  <>
                    <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                      <SelectTrigger id="branch">
                        <SelectValue placeholder="Selecciona una sucursal" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            <div className="flex items-center gap-2">
                              <Store className="h-4 w-4" />
                              <span>{branch.name}</span>
                              {branch.address && (
                                <span className="text-xs text-muted-foreground">
                                  - {branch.address}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Seleccione la sucursal donde abrirá el turno
                    </p>
                  </>
                ) : (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      No hay sucursales disponibles. Por favor, crea una sucursal primero.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="initialCash">Efectivo inicial en caja</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="initialCash"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={initialCash}
                  onChange={(e) => setInitialCash(e.target.value)}
                  className="pl-9"
                  autoFocus={!isOwner}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Ingrese el monto de efectivo con el que inicia el turno
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsOpenDialogOpen(false);
                setInitialCash("");
              }}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleOpenShift}
              disabled={isProcessing || !initialCash}
            >
              {isProcessing ? "Abriendo..." : "Abrir Turno"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
