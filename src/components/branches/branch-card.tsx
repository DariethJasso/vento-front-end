"use client";

import { Store, MapPin, Phone, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BranchCardProps {
  branch: {
    id: string;
    name: string;
    address: string | null;
    phoneNumbers: string[] | null;
  };
  onEdit: (branchId: string) => void;
  onDelete: (branchId: string) => void;
}

export function BranchCard({ branch, onEdit, onDelete }: BranchCardProps) {
  const phones = Array.isArray(branch.phoneNumbers) 
    ? branch.phoneNumbers 
    : branch.phoneNumbers 
      ? [branch.phoneNumbers] 
      : [];

  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-soft transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          <Store className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl text-foreground mb-1">
            {branch.name}
          </h3>
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
            Activa
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-3 mb-6">
        {/* Dirección */}
        {branch.address && (
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-foreground">{branch.address}</span>
          </div>
        )}

        {/* Teléfonos */}
        {phones.length > 0 && (
          <div className="flex items-start gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex flex-col gap-1">
              {phones.map((phone, index) => (
                <span key={index} className="text-foreground">
                  {phone}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(branch.id)}
          className="flex-1"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(branch.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
