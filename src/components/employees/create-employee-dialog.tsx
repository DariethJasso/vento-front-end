"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createEmployee, updateEmployee } from "@/app/actions/employees";

interface EditingEmployee {
  id: string;
  branchId: string;
  firstName: string;
  lastName: string;
  isOwner: boolean;
  isManager: boolean;
  isCashier: boolean;
  isKitchen: boolean;
  isDelivery: boolean;
  isWaiter: boolean;
  isActive: boolean;
  user: {
    email: string;
  };
}

interface Branch {
  id: string;
  name: string;
}

interface CreateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[];
  businessId: string;
  editingEmployee?: EditingEmployee | null;
}

export default function CreateEmployeeDialog({
  open,
  onOpenChange,
  branches,
  businessId,
  editingEmployee,
}: CreateEmployeeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [branchId, setBranchId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isCashier, setIsCashier] = useState(false);
  const [isKitchen, setIsKitchen] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);
  const [isWaiter, setIsWaiter] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editingEmployee) {
      setBranchId(editingEmployee.branchId);
      setFirstName(editingEmployee.firstName);
      setLastName(editingEmployee.lastName);
      setEmail(editingEmployee.user.email);
      setIsOwner(editingEmployee.isOwner);
      setIsManager(editingEmployee.isManager);
      setIsCashier(editingEmployee.isCashier);
      setIsKitchen(editingEmployee.isKitchen);
      setIsDelivery(editingEmployee.isDelivery);
      setIsWaiter(editingEmployee.isWaiter);
      setIsActive(editingEmployee.isActive);
    } else {
      setBranchId(branches[0]?.id || "");
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setIsOwner(false);
      setIsManager(false);
      setIsCashier(false);
      setIsKitchen(false);
      setIsDelivery(false);
      setIsWaiter(false);
      setIsActive(true);
    }
  }, [editingEmployee, open, branches]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;

      if (editingEmployee) {
        result = await updateEmployee({
          employeeId: editingEmployee.id,
          firstName,
          lastName,
          isOwner,
          isManager,
          isCashier,
          isKitchen,
          isDelivery,
          isWaiter,
          isActive,
        });
      } else {
        if (!password) {
          alert("La contraseña es requerida");
          setLoading(false);
          return;
        }

        result = await createEmployee({
          branchId,
          businessId,
          firstName,
          lastName,
          email,
          password,
          isOwner,
          isManager,
          isCashier,
          isKitchen,
          isDelivery,
          isWaiter,
        });
      }

      if (result.success) {
        onOpenChange(false);
        window.location.reload();
      } else {
        alert(result.error || `Error al ${editingEmployee ? "actualizar" : "crear"} empleado`);
      }
    } catch (error) {
      console.error(`Error ${editingEmployee ? "updating" : "creating"} employee:`, error);
      alert(`Error al ${editingEmployee ? "actualizar" : "crear"} empleado`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editingEmployee ? "Editar empleado" : "Nuevo empleado"}
          </DialogTitle>
          <DialogDescription>
            {editingEmployee 
              ? "Actualiza la información del empleado." 
              : "Agrega un nuevo empleado a tu equipo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mt-4">
            {/* Sucursal */}
            {!editingEmployee && (
              <div className="space-y-2">
                <Label htmlFor="branch">Sucursal *</Label>
                <Select value={branchId} onValueChange={setBranchId} disabled={loading}>
                  <SelectTrigger>
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
            )}

            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  placeholder="Pérez"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email y Contraseña */}
            {!editingEmployee && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Roles */}
            <div className="space-y-3 pt-4 border-t">
              <Label className="text-base font-semibold">Roles y Permisos</Label>
              
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="font-medium">Dueño</Label>
                  <p className="text-xs text-muted-foreground">Acceso total al sistema</p>
                </div>
                <Switch checked={isOwner} onCheckedChange={setIsOwner} disabled={loading} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="font-medium">Gerente</Label>
                  <p className="text-xs text-muted-foreground">Gestión de sucursal</p>
                </div>
                <Switch checked={isManager} onCheckedChange={setIsManager} disabled={loading} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="font-medium">Cajero</Label>
                  <p className="text-xs text-muted-foreground">Punto de venta y cobros</p>
                </div>
                <Switch checked={isCashier} onCheckedChange={setIsCashier} disabled={loading} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="font-medium">Cocina</Label>
                  <p className="text-xs text-muted-foreground">Gestión de pedidos en cocina</p>
                </div>
                <Switch checked={isKitchen} onCheckedChange={setIsKitchen} disabled={loading} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="font-medium">Repartidor</Label>
                  <p className="text-xs text-muted-foreground">Entregas a domicilio</p>
                </div>
                <Switch checked={isDelivery} onCheckedChange={setIsDelivery} disabled={loading} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="font-medium">Mesero</Label>
                  <p className="text-xs text-muted-foreground">Atención de mesas</p>
                </div>
                <Switch checked={isWaiter} onCheckedChange={setIsWaiter} disabled={loading} />
              </div>
            </div>

            {/* Estado (solo en edición) */}
            {editingEmployee && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="font-medium">Empleado activo</Label>
                  <p className="text-xs text-muted-foreground">Puede acceder al sistema</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} disabled={loading} />
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
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
              {loading 
                ? (editingEmployee ? "Actualizando..." : "Creando...") 
                : (editingEmployee ? "Actualizar empleado" : "Crear empleado")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
