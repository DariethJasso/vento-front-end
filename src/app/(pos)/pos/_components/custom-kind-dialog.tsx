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
  onSelect: (selectedKinds: CustomKind[], finalPrice: string) => void;
}

export default function CustomKindDialog({
  isOpen,
  onClose,
  itemName,
  customKinds,
  basePrice,
  onSelect,
}: CustomKindDialogProps) {
  const [selectedKinds, setSelectedKinds] = useState<string[]>([]);

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
    
    // Obtener los objetos completos de los sabores seleccionados
    const selectedKindObjects = kindsArray.filter(k => selectedKinds.includes(k.name));
    
    // Calcular precio: usar el precio más alto de los seleccionados, o el base
    const prices = selectedKindObjects.map(k => parseFloat(k.price || basePrice));
    const finalPrice = Math.max(...prices, parseFloat(basePrice)).toFixed(2);
    
    onSelect(selectedKindObjects, finalPrice);
    setSelectedKinds([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecciona los sabores de {itemName}</DialogTitle>
          <p className="text-sm text-muted-foreground">Puedes seleccionar varios sabores</p>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {kindsArray.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay tipos disponibles
            </p>
          ) : (
            kindsArray.map((kind) => {
              const isSelected = selectedKinds.includes(kind.name);
              return (
                <button
                  key={kind.name}
                  onClick={() => toggleKind(kind.name)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{kind.name}</span>
                  </div>
                  {kind.price && (
                    <Badge variant="secondary">
                      ${parseFloat(kind.price).toFixed(2)}
                    </Badge>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSelectedKinds([]);
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
            Agregar ({selectedKinds.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
