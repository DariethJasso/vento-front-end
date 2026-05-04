"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCustomer, updateCustomer } from "@/app/actions/customers";

interface EditingCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  editingCustomer?: EditingCustomer | null;
}

export default function CreateCustomerDialog({
  open,
  onOpenChange,
  businessId,
  editingCustomer,
}: CreateCustomerDialogProps) {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingCustomer) {
      setFirstName(editingCustomer.firstName);
      setLastName(editingCustomer.lastName);
      setEmail(editingCustomer.email);
      setPhone(editingCustomer.phone || "");
      setAddress(editingCustomer.address || "");
      setNotes(editingCustomer.notes || "");
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setNotes("");
    }
  }, [editingCustomer, open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;

      if (editingCustomer) {
        result = await updateCustomer({
          customerId: editingCustomer.id,
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          address: address || undefined,
          notes: notes || undefined,
        });
      } else {
        result = await createCustomer({
          businessId,
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          address: address || undefined,
          notes: notes || undefined,
        });
      }

      if (result.success) {
        onOpenChange(false);
        window.location.reload();
      } else {
        alert(result.error || `Error al ${editingCustomer ? "actualizar" : "crear"} cliente`);
      }
    } catch (error) {
      console.error(`Error ${editingCustomer ? "updating" : "creating"} customer:`, error);
      alert(`Error al ${editingCustomer ? "actualizar" : "crear"} cliente`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editingCustomer ? "Editar cliente" : "Nuevo cliente"}
          </DialogTitle>
          <DialogDescription>
            {editingCustomer 
              ? "Actualiza la información del cliente." 
              : "Agrega un nuevo cliente a tu base de datos."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mt-4">
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

            {/* Email */}
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

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+52 123 456 7890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                placeholder="Calle Principal #123"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                placeholder="Información adicional sobre el cliente..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>
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
                ? (editingCustomer ? "Actualizando..." : "Creando...") 
                : (editingCustomer ? "Actualizar cliente" : "Crear cliente")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
