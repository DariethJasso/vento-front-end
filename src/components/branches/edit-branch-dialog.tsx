"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  ShoppingCart, 
  Utensils, 
  Truck, 
  Briefcase, 
  Smartphone, 
  Users 
} from "lucide-react";
import { updateBranch, getBranchConfig } from "@/app/actions/branches";
import { useRouter } from "next/navigation";

interface EditBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: {
    id: string;
    name: string;
    address: string | null;
    phoneNumbers: string[] | null;
    addressCoordinates?: { lat: number; lng: number } | null;
    config?: {
      hasPos: boolean | null;
      hasKitchen: boolean | null;
      hasDelivery: boolean | null;
      hasMobileApp: boolean | null;
    } | null;
  };
}

interface BranchConfig {
  hasPos: boolean;
  hasKitchen: boolean;
  hasDelivery: boolean;
  hasMobileApp: boolean;
}

export function EditBranchDialog({ open, onOpenChange, branch }: EditBranchDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: branch.name,
    address: branch.address || "",
    phone: branch.phoneNumbers?.[0] || "",
  });

  const [config, setConfig] = useState<BranchConfig>({
    hasPos: false,
    hasKitchen: false,
    hasDelivery: false,
    hasMobileApp: false,
  });

  // Actualizar formData cuando cambia la sucursal
  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name,
        address: branch.address || "",
        phone: branch.phoneNumbers?.[0] || "",
      });
    }
  }, [branch]);

  useEffect(() => {
    if (open && branch.id) {
      loadBranchConfig();
    }
  }, [open, branch.id]);

  const loadBranchConfig = async () => {
    const result = await getBranchConfig(branch.id);
    if (result.success && result.config) {
      setConfig({
        hasPos: result.config.hasPos ?? false,
        hasKitchen: result.config.hasKitchen ?? false,
        hasDelivery: result.config.hasDelivery ?? false,
        hasMobileApp: result.config.hasMobileApp ?? false,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateBranch({
        branchId: branch.id,
        name: formData.name,
        address: formData.address,
        phoneNumbers: formData.phone ? [formData.phone] : [],
        config: config,
      });

      if (result.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        alert(result.error || "Error al actualizar sucursal");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar sucursal");
    } finally {
      setIsLoading(false);
    }
  };

  const modules = [
    {
      key: "hasPos" as keyof BranchConfig,
      icon: ShoppingCart,
      label: "Punto de venta",
      description: "Cobra y emite tickets desde caja o tablet.",
    },
    {
      key: "hasKitchen" as keyof BranchConfig,
      icon: Utensils,
      label: "Pantalla de cocina",
      description: "Comandas en tiempo real para preparación.",
    },
    {
      key: "hasDelivery" as keyof BranchConfig,
      icon: Truck,
      label: "Pantalla de envíos",
      description: "Pedidos para llevar y reparto a domicilio.",
    },
    {
      key: "hasMobileApp" as keyof BranchConfig,
      icon: Smartphone,
      label: "App móvil",
      description: "Acceso desde celular para el equipo.",
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar sucursal</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Datos básicos y módulos que operarán en este punto de venta.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos básicos */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre de la sucursal *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Av. Reforma 123, CDMX"
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="55 1234 5678"
              />
            </div>
          </div>

          {/* Toggle de sucursal activa */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Sucursal activa</Label>
                <p className="text-sm text-muted-foreground">
                  Operará desde el POS al guardar.
                </p>
              </div>
              <Switch checked={true} />
            </div>
          </div>

          {/* Módulos de la sucursal */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Módulos de la sucursal</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Activa solo los que esta sucursal usará. Puedes cambiarlos en cualquier momento.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <div
                    key={module.key}
                    className={`border rounded-lg p-4 transition-colors ${
                      config[module.key]
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${
                          config[module.key] ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-sm">{module.label}</span>
                      </div>
                      <Switch
                        checked={config[module.key]}
                        onCheckedChange={(checked) =>
                          setConfig({ ...config, [module.key]: checked })
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground pl-10">
                      {module.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
