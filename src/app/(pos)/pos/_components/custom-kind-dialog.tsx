"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CustomKind {
  name: string;
  price?: string;
}

interface CustomKindDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  customKinds: CustomKind[];
  basePrice: string;
  unit?: string;
  onSelect: (selectedKinds: CustomKind[], finalPrice: string, quantityOrWeight: number) => void;
}

export default function CustomKindDialog({
  isOpen,
  onClose,
  itemName,
  customKinds,
  basePrice,
  unit = "pza",
  onSelect,
}: CustomKindDialogProps) {
  const [selectedKinds, setSelectedKinds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState("");

  // Convertir customKinds a array de objetos si es necesario
  let kindsArray: CustomKind[] = [];
  
  if (Array.isArray(customKinds)) {
    kindsArray = customKinds.map(kind => {
      // Si es un string, convertirlo a objeto
      if (typeof kind === 'string') {
        return { name: kind };
      }
      // Si ya es un objeto, usarlo tal cual
      return kind as CustomKind;
    });
  } else if (customKinds && typeof customKinds === 'object') {
    // Si es un objeto, intentar convertirlo a array
    kindsArray = Object.values(customKinds).map(kind => {
      if (typeof kind === 'string') {
        return { name: kind };
      }
      return kind as CustomKind;
    });
  }

  const toggleKind = (kindName: string) => {
    setSelectedKinds(prev => {
      if (prev.includes(kindName)) {
        return prev.filter(k => k !== kindName);
      } else {
        return [...prev, kindName];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedKinds.length === 0) return;
    
    // Validar peso si es producto por peso
    if (unit === "weight") {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        alert("Por favor ingresa un peso válido");
        return;
      }
    }
    
    // Obtener los objetos completos de los sabores seleccionados
    const selectedKindObjects = kindsArray.filter(k => selectedKinds.includes(k.name));
    
    // Calcular precio: usar el precio más alto de los seleccionados, o el base
    const prices = selectedKindObjects.map(k => parseFloat(k.price || basePrice));
    const finalPrice = Math.max(...prices, parseFloat(basePrice)).toFixed(2);
    
    // Enviar cantidad o peso según el tipo
    const quantityOrWeight = unit === "weight" ? parseFloat(weight) : quantity;
    
    onSelect(selectedKindObjects, finalPrice, quantityOrWeight);
    setSelectedKinds([]);
    setQuantity(1);
    setWeight("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecciona los sabores de {itemName}</DialogTitle>
          <p className="text-sm text-muted-foreground">Puedes seleccionar varios sabores</p>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 py-4 -mx-6 px-6">
          {kindsArray.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay tipos disponibles
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {kindsArray.map((kind) => {
                const isSelected = selectedKinds.includes(kind.name);
                return (
                  <button
                    key={kind.name}
                    onClick={() => toggleKind(kind.name)}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">{kind.name}</span>
                      {kind.price && (
                        <span className="text-xs text-muted-foreground">
                          ${parseFloat(kind.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selector de cantidad o peso */}
        {unit === "weight" ? (
          <div className="space-y-2 py-3 px-4 bg-muted/50 rounded-lg border-t">
            <label className="text-sm font-medium">Peso (kg)</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              placeholder="Ej: 1.500"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              autoFocus
            />
            {weight && parseFloat(weight) > 0 && (
              <div className="text-sm text-muted-foreground">
                Total: ${(parseFloat(basePrice) * parseFloat(weight)).toFixed(2)}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg border-t">
            <span className="text-sm font-medium">Cantidad</span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSelectedKinds([]);
              setQuantity(1);
              onClose();
            }}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={selectedKinds.length === 0}
            onClick={handleConfirm}
          >
            Agregar {quantity > 1 ? `(${quantity})` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
