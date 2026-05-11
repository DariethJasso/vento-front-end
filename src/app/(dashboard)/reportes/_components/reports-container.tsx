"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getShiftHistory } from "@/app/actions/shifts";
import ShiftReportList from "./shift-report-list";

interface Branch {
  id: string;
  name: string;
}

interface ReportsContainerProps {
  session: any;
  initialShifts: any[];
  branches: Branch[];
  initialBranchId: string;
  isOwner: boolean | undefined;
}

export default function ReportsContainer({
  session,
  initialShifts,
  branches,
  initialBranchId,
  isOwner,
}: ReportsContainerProps) {
  const [selectedBranchId, setSelectedBranchId] = useState(initialBranchId);
  const [shifts, setShifts] = useState(initialShifts);
  const [isLoading, setIsLoading] = useState(false);

  const handleBranchChange = async (branchId: string) => {
    setSelectedBranchId(branchId);
    setIsLoading(true);
    
    try {
      const newShifts = await getShiftHistory({ branchId, limit: 30 });
      setShifts(newShifts);
    } catch (error) {
      console.error("Error loading shifts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="font-display text-4xl text-foreground mb-2">
          Reportes de Ventas
        </h1>
        <p className="text-muted-foreground">
          Consulta el historial de turnos y ventas{" "}
          {isOwner ? "de tus sucursales" : "de tu sucursal"}
        </p>
      </div>

      {/* Filtro de sucursal - Solo para owners */}
      {isOwner && branches.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="max-w-xs">
            <Label htmlFor="branch-filter" className="mb-2 block">
              Filtrar por sucursal
            </Label>
            <Select 
              value={selectedBranchId} 
              onValueChange={handleBranchChange}
              disabled={isLoading}
            >
              <SelectTrigger id="branch-filter">
                <SelectValue placeholder="Selecciona una sucursal" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando reportes...</p>
          </div>
        </div>
      ) : (
        <ShiftReportList shifts={shifts} branchId={selectedBranchId} />
      )}
    </div>
  );
}
