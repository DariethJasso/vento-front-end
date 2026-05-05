"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Receipt, ShoppingCart, User, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signOut } from "next-auth/react";
import CustomKindDialog from "./custom-kind-dialog";
import PaymentDialog from "./payment-dialog";
import { createTicket, getOpenTickets, updateTicketComplete } from "@/app/actions/tickets";
import { getNextTicketNumber } from "@/app/actions/shifts";
import { useRouter } from "next/navigation";

interface Branch {
  id: string;
  name: string;
  address: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  description: string | null;
  displayPrice: string;
  categoryId: string | null;
  image: string | null;
  isCustom?: boolean;
  customKinds?: Array<{ name: string; price?: string }>;
  category?: {
    name: string;
  } | null;
}

interface POSContainerProps {
  session: any;
  branch: Branch;
  allItems: any[];
  categories: Category[];
  allBranches: Branch[];
  isOwner: boolean;
  initialBranchId: string;
  activeShift: any;
}

interface TicketItem {
  id: string;
  itemId: string;
  name: string;
  price: string;
  quantity: number;
  notes?: string;
  selectedCustomKind?: string;
}

export default function POSContainer({ session, branch, allItems, categories, allBranches, isOwner, initialBranchId, activeShift }: POSContainerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isTicketsDialogOpen, setIsTicketsDialogOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(initialBranchId);
  const [items, setItems] = useState<Item[]>([]);
  const [currentBranch, setCurrentBranch] = useState(branch);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [ticketItems, setTicketItems] = useState<TicketItem[]>([]);
  const [currentTicketNumber, setCurrentTicketNumber] = useState("...");
  const [customerId, setCustomerId] = useState<string | undefined>();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [customKindDialog, setCustomKindDialog] = useState<{
    isOpen: boolean;
    item: Item | null;
  }>({ isOpen: false, item: null });
  const [isSaving, setIsSaving] = useState(false);
  const [openTickets, setOpenTickets] = useState<any[]>([]);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);

  // Cargar número de ticket siguiente y tickets abiertos
  useEffect(() => {
    const loadTicketData = async () => {
      if (activeShift) {
        const nextNumber = await getNextTicketNumber({ shiftId: activeShift.id });
        setCurrentTicketNumber(nextNumber);

        const result = await getOpenTickets(selectedBranchId, activeShift.id);
        if (result.success && result.tickets) {
          setOpenTickets(result.tickets);
        } else {
          setOpenTickets([]);
        }
      }
    };
    loadTicketData();
  }, [activeShift, selectedBranchId]);

  // Filtrar items por sucursal seleccionada
  useEffect(() => {
    console.log('All items raw:', allItems.slice(0, 2)); // Ver primeros 2 items
    
    const branchItems = allItems
      .map(item => {
        const branchItem = item.branchItems?.find(
          (bi: any) => bi.branchId === selectedBranchId && bi.isActiveInBranch
        );
        
        if (!branchItem) return null;
        
        const mappedItem = {
          id: item.id,
          name: item.name,
          description: item.description,
          displayPrice: branchItem.customPrice || item.price,
          categoryId: item.categoryId,
          image: item.image,
          category: item.category,
          isCustom: branchItem.isCustom, // Viene de branchItem, no de item
          customKinds: branchItem.customKinds, // Viene de branchItem, no de item
        };
        
        if (branchItem.isCustom) {
          console.log('Custom item found:', mappedItem);
        }
        
        return mappedItem;
      })
      .filter((item: any) => item !== null);
    
    console.log('Filtered branch items:', branchItems.length);
    setItems(branchItems);
  }, [selectedBranchId, allItems]);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    const newBranch = allBranches.find(b => b.id === branchId);
    if (newBranch) {
      setCurrentBranch(newBranch);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const addItemToTicket = (item: Item, selectedKind?: string, customPrice?: string) => {
    console.log('Item clicked:', { 
      name: item.name, 
      isCustom: item.isCustom, 
      customKinds: item.customKinds,
      hasKinds: item.customKinds && item.customKinds.length > 0
    });
    
    // Si el item es custom y no se ha seleccionado un tipo, abrir dialog
    if (item.isCustom && !selectedKind && item.customKinds && item.customKinds.length > 0) {
      console.log('Opening custom kind dialog for:', item.name);
      setCustomKindDialog({ isOpen: true, item });
      return;
    }

    const finalPrice = customPrice || item.displayPrice;
    const itemName = selectedKind ? `${item.name} (${selectedKind})` : item.name;
    
    // Buscar si ya existe el mismo item con el mismo tipo custom
    const existingItem = ticketItems.find(ti => 
      ti.itemId === item.id && ti.selectedCustomKind === selectedKind
    );
    
    if (existingItem) {
      setTicketItems(ticketItems.map(ti => 
        ti.id === existingItem.id
          ? { ...ti, quantity: ti.quantity + 1 }
          : ti
      ));
    } else {
      setTicketItems([...ticketItems, {
        id: Math.random().toString(),
        itemId: item.id,
        name: itemName,
        price: finalPrice,
        quantity: 1,
        selectedCustomKind: selectedKind,
      }]);
    }
  };

  const handleCustomKindSelect = (selectedKind: string, finalPrice: string) => {
    if (customKindDialog.item) {
      addItemToTicket(customKindDialog.item, selectedKind, finalPrice);
    }
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromTicket(itemId);
      return;
    }
    setTicketItems(ticketItems.map(ti => 
      ti.id === itemId ? { ...ti, quantity } : ti
    ));
  };

  const removeItemFromTicket = (itemId: string) => {
    setTicketItems(ticketItems.filter(ti => ti.id !== itemId));
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    setTicketItems(ticketItems.map(ti => 
      ti.id === itemId ? { ...ti, notes } : ti
    ));
  };

  const calculateSubtotal = () => {
    return ticketItems.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.16;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const clearTicket = () => {
    setTicketItems([]);
    setCustomerId(undefined);
    setCurrentTicketId(null);
  };

  const reloadTicketData = async () => {
    if (activeShift) {
      const nextNumber = await getNextTicketNumber({ shiftId: activeShift.id });
      setCurrentTicketNumber(nextNumber);

      const result = await getOpenTickets(selectedBranchId, activeShift.id);
      if (result.success && result.tickets) {
        setOpenTickets(result.tickets);
      } else {
        setOpenTickets([]);
      }
    }
  };

  const loadSavedTicket = (ticket: any) => {
    // Convertir los items del ticket guardado al formato del estado
    const loadedItems: TicketItem[] = ticket.ticketItems.map((ti: any) => ({
      id: ti.id,
      itemId: ti.itemId,
      name: ti.item?.name || "Item",
      price: ti.price,
      quantity: ti.quantity,
      notes: ti.notes,
      selectedCustomKind: ti.selectedCustomKind,
    }));

    // Reemplazar el ticket actual con el guardado
    setTicketItems(loadedItems);
    setCurrentTicketNumber(ticket.ticketNumber);
    setCustomerId(ticket.customerId);
    setCurrentTicketId(ticket.id); // Guardar el ID del ticket cargado
    
    // Cerrar el dialog
    setIsTicketsDialogOpen(false);
  };

  const handleSaveTicket = async () => {
    if (ticketItems.length === 0) return;
    if (!activeShift) {
      alert("No hay un turno activo");
      return;
    }
    
    setIsSaving(true);
    try {
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = calculateTotal();

      let result;

      if (currentTicketId) {
        // Actualizar ticket existente
        result = await updateTicketComplete(currentTicketId, {
          shiftId: activeShift.id,
          customerId: customerId,
          total: total.toString(),
          taxTotal: tax.toString(),
          status: "open",
          paymentStatus: "pending",
          items: ticketItems.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
            selectedCustomKind: item.selectedCustomKind,
          })),
        });
      } else {
        // Crear nuevo ticket
        const ticketNumber = await getNextTicketNumber({ shiftId: activeShift.id });
        result = await createTicket({
          branchId: selectedBranchId,
          shiftId: activeShift.id,
          customerId: customerId,
          ticketNumber: ticketNumber,
          total: total.toString(),
          taxTotal: tax.toString(),
          status: "open",
          paymentStatus: "pending",
          items: ticketItems.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
            selectedCustomKind: item.selectedCustomKind,
          })),
        });
      }

      if (result.success) {
        clearTicket();
        await reloadTicketData();
        alert("Ticket guardado exitosamente");
        router.refresh();
      } else {
        alert("Error al guardar ticket");
      }
    } catch (error) {
      console.error("Error saving ticket:", error);
      alert("Error al guardar ticket");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmPayment = async (paymentMethod: string, amountPaid?: number) => {
    if (ticketItems.length === 0) return;
    if (!activeShift) {
      alert("No hay un turno activo");
      return;
    }
    
    try {
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = calculateTotal();

      let result;

      if (currentTicketId) {
        // Actualizar ticket existente
        result = await updateTicketComplete(currentTicketId, {
          shiftId: activeShift.id,
          customerId: customerId,
          total: total.toString(),
          taxTotal: tax.toString(),
          status: "closed",
          paymentMethod: paymentMethod,
          paymentStatus: "paid",
          items: ticketItems.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
            selectedCustomKind: item.selectedCustomKind,
          })),
        });
      } else {
        // Crear nuevo ticket
        const ticketNumber = await getNextTicketNumber({ shiftId: activeShift.id });
        result = await createTicket({
          branchId: selectedBranchId,
          shiftId: activeShift.id,
          customerId: customerId,
          ticketNumber: ticketNumber,
          total: total.toString(),
          taxTotal: tax.toString(),
          status: "closed",
          paymentMethod: paymentMethod,
          paymentStatus: "paid",
          items: ticketItems.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
            selectedCustomKind: item.selectedCustomKind,
          })),
        });
      }

      if (result.success) {
        if (paymentMethod === "cash" && amountPaid) {
          const change = amountPaid - total;
          if (change > 0) {
            alert(`Pago exitoso. Cambio: $${change.toFixed(2)}`);
          }
        }
        clearTicket();
        await reloadTicketData();
        alert("Ticket cobrado exitosamente");
        router.refresh();
      } else {
        alert("Error al procesar pago");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error al procesar pago");
    }
  };

  // Filtrar items por categoría y búsqueda
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background relative">
      {/* Panel izquierdo - Productos */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card p-3 lg:p-4">
          <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 lg:h-10 lg:w-10">
              <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
            <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
              <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm lg:text-base">
                {currentBranch.name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-semibold text-base lg:text-lg truncate">Punto de venta</h1>
                {isOwner && allBranches.length > 1 ? (
                  <Select value={selectedBranchId} onValueChange={handleBranchChange}>
                    <SelectTrigger className="h-7 w-auto border-0 bg-transparent p-0 text-xs lg:text-sm text-muted-foreground hover:text-foreground focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {allBranches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name} - Caja {session.user.employeeId?.slice(-1) || "1"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs lg:text-sm text-muted-foreground truncate">
                    {currentBranch.name} - Caja {session.user.employeeId?.slice(-1) || "1"}
                  </p>
                )}
              </div>
            </div>
            {/* Botones de acción - Desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsTicketsDialogOpen(true)}
                className="gap-2"
              >
                <Receipt className="h-4 w-4" />
                Tickets abiertos
                {openTickets.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {openTickets.length}
                  </Badge>
                )}
              </Button>

              <div className="flex items-center gap-2 pl-2 border-l">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{session.user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Botones flotantes - Mobile */}
            <div className="flex lg:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsTicketsDialogOpen(true)}
                className="h-9 w-9 relative"
              >
                <Receipt className="h-5 w-5" />
                {openTickets.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {openTickets.length}
                  </Badge>
                )}
              </Button>
              <Button
                onClick={() => setIsCartOpen(true)}
                className="h-9 w-9 bg-orange-500 hover:bg-orange-600"
                size="icon"
              >
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto o SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categorías */}
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="rounded-full whitespace-nowrap"
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid de productos */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No hay productos</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No se encontraron productos con ese término"
                  : "No hay productos disponibles en esta sucursal"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addItemToTicket(item)}
                  className="group relative flex flex-col rounded-lg border border-border bg-card p-4 hover:border-primary hover:shadow-md transition-all text-left"
                >
                  {/* Imagen del producto */}
                  <div className="flex h-24 items-center justify-center rounded-lg bg-muted/50 mb-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 object-contain"
                      />
                    ) : (
                      <div className="text-4xl">
                        {item.name.includes("Taco") ? "🌮" :
                         item.name.includes("Refresco") || item.name.includes("Agua") ? "🥤" :
                         item.name.includes("Café") ? "☕" :
                         item.name.includes("Limonada") ? "🍋" :
                         item.name.includes("Quesadilla") ? "🫓" :
                         item.name.includes("Flan") || item.name.includes("Pastel") ? "🍰" :
                         item.name.includes("Helado") ? "🍨" :
                         item.name.includes("Papas") ? "🍟" :
                         item.name.includes("Nachos") ? "🧀" :
                         item.name.includes("Combo") ? "🍱" :
                         "🍽️"}
                      </div>
                    )}
                  </div>

                  {/* Nombre del producto */}
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">
                    {item.name}
                  </h3>

                  {/* Precio y categoría */}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="font-semibold text-primary">
                      ${parseFloat(item.displayPrice).toFixed(2)}
                    </span>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs">
                        {item.category.name}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panel derecho - Ticket (Desktop) */}
      <div className="hidden lg:flex w-96 border-l border-border bg-card flex-col">
        {/* Header del ticket */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Ticket {currentTicketNumber}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={clearTicket}
            >
              <User className="h-4 w-4" />
              Nuevo
            </Button>
          </div>
          <Input
            placeholder="Cliente (opcional)"
            className="text-sm"
          />
        </div>

        {/* Productos del ticket */}
        <div className="flex-1 overflow-y-auto p-4">
          {ticketItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Selecciona productos para empezar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ticketItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${parseFloat(item.price).toFixed(2)} c/u
                      </p>
                    </div>
                    <span className="font-semibold">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeItemFromTicket(item.id)}
                    >
                      🗑
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Totales */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IVA (16%)</span>
            <span className="font-medium">${calculateTax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">${calculateTotal().toFixed(2)}</span>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              disabled={ticketItems.length === 0 || isSaving}
              onClick={handleSaveTicket}
            >
              <Receipt className="h-4 w-4 mr-2" />
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={ticketItems.length === 0}
              onClick={() => setIsPaymentDialogOpen(true)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cobrar
            </Button>
          </div>
        </div>
      </div>

      {/* Panel derecho - Ticket (Mobile - Drawer) */}
      <div className={`lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsCartOpen(false)}>
        <div 
          className={`absolute right-0 top-0 h-full w-full bg-background flex flex-col transition-transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del ticket */}
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Ticket {currentTicketNumber}
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={clearTicket}
              >
                <User className="h-4 w-4" />
                Nuevo
              </Button>
            </div>
            <Input
              placeholder="Cliente (opcional)"
              className="text-sm"
            />
          </div>

          {/* Productos del ticket */}
          <div className="flex-1 overflow-y-auto p-4">
            {ticketItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Selecciona productos para empezar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {ticketItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${parseFloat(item.price).toFixed(2)} c/u
                        </p>
                      </div>
                      <span className="font-semibold">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                      <div className="flex-1" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeItemFromTicket(item.id)}
                      >
                        🗑
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Totales */}
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA (16%)</span>
              <span className="font-medium">${calculateTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span>Total</span>
              <span className="text-orange-500">${calculateTotal().toFixed(2)}</span>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                className="flex-1"
                disabled={ticketItems.length === 0 || isSaving}
                onClick={handleSaveTicket}
              >
                <Receipt className="h-4 w-4 mr-2" />
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
              <Button 
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                disabled={ticketItems.length === 0}
                onClick={() => {
                  setIsCartOpen(false);
                  setIsPaymentDialogOpen(true);
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cobrar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de tickets abiertos */}
      <Dialog open={isTicketsDialogOpen} onOpenChange={setIsTicketsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Tickets abiertos
            </DialogTitle>
          </DialogHeader>
          {openTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No hay tickets abiertos</h3>
              <p className="text-muted-foreground mb-6">
                Crea un nuevo ticket para empezar
              </p>
              <Button onClick={() => setIsTicketsDialogOpen(false)}>
                Crear ticket nuevo
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto py-4">
              {openTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => loadSavedTicket(ticket)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-primary" />
                      <span className="font-semibold">Ticket {ticket.ticketNumber}</span>
                    </div>
                    <Badge variant="secondary">
                      ${parseFloat(ticket.total).toFixed(2)}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de selección de tipo custom */}
      <CustomKindDialog
        isOpen={customKindDialog.isOpen}
        onClose={() => setCustomKindDialog({ isOpen: false, item: null })}
        itemName={customKindDialog.item?.name || ""}
        customKinds={customKindDialog.item?.customKinds || []}
        basePrice={customKindDialog.item?.displayPrice || "0"}
        onSelect={handleCustomKindSelect}
      />

      {/* Dialog de pago */}
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        total={calculateTotal()}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
}
