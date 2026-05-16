"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  
  // Estados para cuando es venta por peso
  const [inputMode, setInputMode] = useState<"weight" | "price">("weight");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");

  // Convertir customKinds a array de objetos si es necesario
  let kindsArray: CustomKind[] = [];
  if (Array.isArray(customKinds)) {
    kindsArray = customKinds.map(kind => typeof kind === 'string' ? { name: kind } : kind as CustomKind);
  } else if (customKinds && typeof customKinds === 'object') {
    kindsArray = Object.values(customKinds).map(kind => typeof kind === 'string' ? { name: kind } : kind as CustomKind);
  }

  // Obtener el precio por kg actual (basado en el sabor más caro o el base)
  const getPricePerKg = () => {
    const selectedKindObjects = kindsArray.filter(k => selectedKinds.includes(k.name));
    const prices = selectedKindObjects.map(k => parseFloat(k.price || basePrice));
    return Math.max(...prices, parseFloat(basePrice));
  };

  // Cálculos dinámicos de peso y total
  const calculateWeight = () => {
    if (unit !== "weight") return quantity;
    if (inputMode === "weight") {
      return parseFloat(weight) || 0;
    } else {
      const priceNum = parseFloat(price);
      const pricePerKg = getPricePerKg();
      if (isNaN(priceNum) || priceNum <= 0 || pricePerKg <= 0) return 0;
      return priceNum / pricePerKg;
    }
  };

  const calculateTotal = () => {
    const pricePerKg = getPricePerKg();
    if (unit !== "weight") return pricePerKg * quantity;

    if (inputMode === "weight") {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum <= 0) return 0;
      return weightNum * pricePerKg;
    } else {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) return 0;
      return priceNum;
    }
  };

  const toggleKind = (kindName: string) => {
    setSelectedKinds(prev => 
      prev.includes(kindName) ? prev.filter(k => k !== kindName) : [...prev, kindName]
    );
  };

  const handleConfirm = () => {
    if (selectedKinds.length === 0) return;
    
    const finalWeightOrQuantity = calculateWeight();
    const finalTotal = calculateTotal();
    
    if (finalWeightOrQuantity <= 0 || finalTotal <= 0) {
      alert("Por favor ingresa un valor válido");
      return;
    }
    
    const selectedKindObjects = kindsArray.filter(k => selectedKinds.includes(k.name));
    
    // Pasamos el precio final calculado (o total) y la cantidad/peso final
    onSelect(selectedKindObjects, finalTotal.toFixed(2), finalWeightOrQuantity);
    
    // Resetear estados
    setSelectedKinds([]);
    setQuantity(1);
    setWeight("");
    setPrice("");
    setInputMode("weight");
    onClose();
  };

  const handleCancel = () => {
    setSelectedKinds([]);
    setQuantity(1);
    setWeight("");
    setPrice("");
    setInputMode("weight");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecciona los sabores de {itemName}</DialogTitle>
          <p className="text-sm text-muted-foreground">Puedes seleccionar varios sabores</p>
        </DialogHeader>
        
        {/* Listado de Sabores / Tipos */}
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
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground"
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

        {/* Sección inferior: Selector de cantidad / peso / precio */}
        <div className="space-y-4 py-3 px-4 bg-muted/50 rounded-lg border-t">
          {unit === "weight" ? (
            <>
              {/* Selector de modo para Peso */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={inputMode === "weight" ? "default" : "outline"}
                  onClick={() => setInputMode("weight")}
                  className="flex-1 h-9"
                >
                  Por peso
                </Button>
                <Button
                  type="button"
                  variant={inputMode === "price" ? "default" : "outline"}
                  onClick={() => setInputMode("price")}
                  className="flex-1 h-9"
                >
                  Por precio
                </Button>
              </div>

              {/* Inputs según modo de peso */}
              {inputMode === "weight" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.001"
                    min="0.001"
                    placeholder="Ej: 0.500 para 500g"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                    autoFocus
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="price">Precio ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Ej: 100.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                    autoFocus
                  />
                </div>
              )}

              {/* Desglose / Resumen de la conversión de peso */}
              {((inputMode === "weight" && weight && parseFloat(weight) > 0) || 
                (inputMode === "price" && price && parseFloat(price) > 0)) && (
                <div className="bg-background p-3 rounded-md border text-sm space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Peso final:</span>
                    <span className="font-medium text-foreground">{calculateWeight().toFixed(3)} kg</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Precio por kg:</span>
                    <span className="font-medium text-foreground">${getPricePerKg().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t mt-1">
                    <span className="font-semibold text-foreground">Total a cobrar:</span>
                    <span className="text-base font-bold text-primary">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Selector clásico por piezas */
            <div className="flex items-center justify-between">
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
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={
              selectedKinds.length === 0 ||
              (unit === "weight" && inputMode === "weight" && (!weight || parseFloat(weight) <= 0)) ||
              (unit === "weight" && inputMode === "price" && (!price || parseFloat(price) <= 0))
            }
            onClick={handleConfirm}
          >
            Agregar {unit !== "weight" && quantity > 1 ? `(${quantity})` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}