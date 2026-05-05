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
  onSelect: (selectedKind: string, finalPrice: string) => void;
}

export default function CustomKindDialog({
  isOpen,
  onClose,
  itemName,
  customKinds,
  basePrice,
  onSelect,
}: CustomKindDialogProps) {
  const [selectedKind, setSelectedKind] = useState<string | null>(null);

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

  const handleConfirm = () => {
    if (!selectedKind) return;
    
    const kind = kindsArray.find(k => k.name === selectedKind);
    const finalPrice = kind?.price || basePrice;
    
    onSelect(selectedKind, finalPrice);
    setSelectedKind(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecciona el tipo de {itemName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {kindsArray.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No hay tipos disponibles
            </p>
          ) : (
            kindsArray.map((kind) => (
              <button
                key={kind.name}
                onClick={() => setSelectedKind(kind.name)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  selectedKind === kind.name
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedKind === kind.name
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}>
                    {selectedKind === kind.name && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
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
            ))
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSelectedKind(null);
              onClose();
            }}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            disabled={!selectedKind}
            onClick={handleConfirm}
          >
            Agregar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
