"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface PhoneInputListProps {
  phones: string[];
  onChange: (phones: string[]) => void;
  disabled?: boolean;
}

export function PhoneInputList({ phones, onChange, disabled }: PhoneInputListProps) {
  const [currentPhone, setCurrentPhone] = useState("");

  const addPhone = () => {
    if (currentPhone.trim()) {
      onChange([...phones, currentPhone.trim()]);
      setCurrentPhone("");
    }
  };

  const removePhone = (index: number) => {
    onChange(phones.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPhone();
    }
  };

  return (
    <div className="space-y-3">
      {/* Input para agregar nuevo teléfono */}
      <div className="flex gap-2">
        <Input
          type="tel"
          placeholder="55 1234 5678"
          value={currentPhone}
          onChange={(e) => setCurrentPhone(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addPhone}
          disabled={disabled || !currentPhone.trim()}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Lista de teléfonos agregados */}
      {phones.length > 0 && (
        <div className="space-y-2">
          {phones.map((phone, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2"
            >
              <span className="flex-1 text-sm">{phone}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePhone(index)}
                disabled={disabled}
                className="h-6 w-6 shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {phones.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Agrega al menos un número de teléfono
        </p>
      )}
    </div>
  );
}
