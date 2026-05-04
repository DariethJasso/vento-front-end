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
import { PhoneInputList } from "./phone-input-list";

interface CreateBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBranchDialog({
  open,
  onOpenChange,
}: CreateBranchDialogProps) {
  const [loading, setLoading] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      phoneNumbers: phoneNumbers,
    };

    try {
      const response = await fetch("/api/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al crear sucursal");
      }

      console.log("Sucursal creada:", result.branch);
      
      // Cerrar modal y resetear form
      onOpenChange(false);
      setPhoneNumbers([]);
      
      // Recargar la página para mostrar la nueva sucursal
      window.location.reload();
    } catch (error) {
      console.error("Error creating branch:", error);
      alert(error instanceof Error ? error.message : "Error al crear sucursal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Crear sucursal
          </DialogTitle>
          <DialogDescription>
            Llena los datos básicos. Podrás editarlos después.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre de la sucursal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Ej. Matriz Centro"
              required
              disabled={loading}
              className="border-primary/30 focus-visible:ring-primary"
            />
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Dirección
            </Label>
            <Input
              id="address"
              name="address"
              placeholder="Calle, número, colonia, ciudad"
              disabled={loading}
            />
          </div>

          {/* Teléfonos */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Teléfonos
            </Label>
            <PhoneInputList
              phones={phoneNumbers}
              onChange={setPhoneNumbers}
              disabled={loading}
            />
          </div>

          

          {/* Sucursal activa */}
          {/* <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="active" className="text-base font-medium">
                Sucursal activa
              </Label>
              <p className="text-sm text-muted-foreground">
                Operará desde el POS al guardar.
              </p>
            </div>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={loading}
            />
          </div> */}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
            >
              {loading ? "Creando..." : "Crear sucursal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
