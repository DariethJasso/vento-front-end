"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Receipt, ShoppingCart, User, LogOut, Plus, X, UtensilsCrossed, Home, Package, Truck, Store, MessageSquare, DollarSign, Check } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signOut } from "next-auth/react";
import CustomKindDialog from "./custom-kind-dialog";
import PaymentDialog from "./payment-dialog";
import WeightInputDialog from "./weight-input-dialog";
import { CashMovementDialog } from "@/components/cash/cash-movement-dialog";
import { createTicket, getOpenTickets, updateTicketComplete, updateTicketItemStatus } from "@/app/actions/tickets";
import { getNextTicketNumber, getActiveShift } from "@/app/actions/shifts";
import { findOrCreateCustomerByPhone } from "@/app/actions/customers";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FlyToCart from "@/components/animations/fly-to-cart";
import { useSocket } from "@/hooks/use-socket";

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
  unit?: string;
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
  isManager: boolean;
  businessLogo?: string | null;
}

interface TicketItem {
  id: string;
  itemId: string;
  name: string;
  price: string;
  quantity: number;
  notes?: string;
  selectedCustomKind?: string | Array<{name: string, price?: string}>;
  groupId?: string;
  status?: string;
}

interface DishGroup {
  id: string;
  name: string;
  items: TicketItem[];
}

export default function POSContainer({ session, branch, allItems, categories, allBranches, isOwner, initialBranchId, activeShift, isManager, businessLogo }: POSContainerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isTicketsDialogOpen, setIsTicketsDialogOpen] = useState(false);
  const [isCashMovementDialogOpen, setIsCashMovementDialogOpen] = useState(false);
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
  const [groupByDish, setGroupByDish] = useState(false);
  const [dishGroups, setDishGroups] = useState<DishGroup[]>([]);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [ticketType, setTicketType] = useState<"dine_in" | "pick_up" | "delivery">("dine_in");
  const [weightDialog, setWeightDialog] = useState<{
    isOpen: boolean;
    item: Item | null;
  }>({ isOpen: false, item: null });
  const [ticketNotes, setTicketNotes] = useState("");
  const [itemNoteDialog, setItemNoteDialog] = useState<{
    isOpen: boolean;
    itemId: string | null;
    currentNote: string;
  }>({ isOpen: false, itemId: null, currentNote: "" });
  
  // Socket.io para sincronización en tiempo real
  const { 
    isConnected, 
    lastUpdate, 
    emitTicketCreated,
    emitTicketUpdated,
    emitTicketPaid,
    emitTicketDeleted 
  } = useSocket(activeShift?.id);
  
  // Estado para animaciones fly-to-cart
  const [flyingItems, setFlyingItems] = useState<Array<{
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    itemName: string;
  }>>([]);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const cartPanelRef = useRef<HTMLDivElement>(null);
  const [isCartPulsing, setIsCartPulsing] = useState(false);

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

  // Escuchar actualizaciones de Socket.io y recargar datos en tiempo real
  useEffect(() => {
    if (!lastUpdate || !activeShift) return;

    console.log("🔄 Socket update received, reloading data...", lastUpdate);

    const reloadData = async () => {
      // SIEMPRE recargar número de ticket siguiente en cualquier actualización
      const nextNumber = await getNextTicketNumber({ shiftId: activeShift.id });
      setCurrentTicketNumber(nextNumber);
      console.log("🔢 Next ticket number updated:", nextNumber);

      // Recargar tickets abiertos
      const result = await getOpenTickets(selectedBranchId, activeShift.id);
      if (result.success && result.tickets) {
        setOpenTickets(result.tickets);
        console.log("📋 Open tickets reloaded:", result.tickets.length);
      }

      // Si el ticket actual fue actualizado por otro usuario
      if (lastUpdate.type === "updated" && lastUpdate.ticketId) {
        console.log("⚠️ Ticket was updated by another user");
        toast.info("Un ticket fue actualizado por otro usuario");
      }

      // Si el ticket actual fue cobrado por otro usuario
      if (lastUpdate.type === "paid" && lastUpdate.ticketId) {
        console.log("⚠️ Ticket was paid by another user");
        toast.success("Un ticket fue cobrado");
      }
    };

    reloadData();
  }, [lastUpdate, activeShift, selectedBranchId]);

  // Filtrar items por sucursal seleccionada
  useEffect(() => {
    console.log('All items raw:', allItems.slice(0, 2)); // Ver primeros 2 items
    
    const branchItems = allItems
      .map(item => {
        const branchItem = item.branchItems?.find(
          (bi: any) => bi.branchId === selectedBranchId && bi.isActiveInBranch
        );
        
        if (!branchItem) return null;
        
        const mappedItem: Item = {
          id: item.id,
          name: item.name,
          description: item.description,
          displayPrice: branchItem.customPrice || item.price,
          categoryId: item.categoryId,
          image: item.image,
          unit: item.unit, // Agregar campo unit para productos por peso
          category: item.category,
          isCustom: branchItem.isCustom, // Viene de branchItem, no de item
          customKinds: branchItem.customKinds, // Viene de branchItem, no de item
        };
        
        if (branchItem.isCustom) {
          console.log('Custom item found:', mappedItem);
        }
        
        return mappedItem;
      })
      .filter((item): item is Item => item !== null);
    
    console.log('Filtered branch items:', branchItems.length);
    setItems(branchItems);
  }, [selectedBranchId, allItems]);

  const handleBranchChange = async (branchId: string) => {
    // Verificar si la sucursal tiene turno activo
    const shift = await getActiveShift({ branchId });
    
    if (!shift) {
      toast.error("Esta sucursal no tiene un turno activo. Por favor, inicia un turno primero.");
      return;
    }
    
    // Cambiar sucursal
    setSelectedBranchId(branchId);
    const newBranch = allBranches.find(b => b.id === branchId);
    if (newBranch) {
      setCurrentBranch(newBranch);
    }
    
    // Actualizar número de ticket según el turno de la nueva sucursal
    const nextNumber = await getNextTicketNumber({ shiftId: shift.id });
    setCurrentTicketNumber(nextNumber);
    
    // Cargar tickets abiertos de la nueva sucursal
    const result = await getOpenTickets(branchId, shift.id);
    if (result.success && result.tickets) {
      setOpenTickets(result.tickets);
    }
    
    // Limpiar ticket actual al cambiar de sucursal
    clearTicket();
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const createNewDish = () => {
    const newDish: DishGroup = {
      id: `dish-${Date.now()}`,
      name: `Plato ${dishGroups.length + 1}`,
      items: [],
    };
    setDishGroups([...dishGroups, newDish]);
    setSelectedDishId(newDish.id);
  };

  const removeDish = (dishId: string) => {
    // Mover items del plato eliminado al ticket principal
    const dish = dishGroups.find(d => d.id === dishId);
    if (dish) {
      const itemsWithoutGroup = dish.items.map(item => ({ ...item, groupId: undefined }));
      setTicketItems([...ticketItems, ...itemsWithoutGroup]);
    }
    setDishGroups(dishGroups.filter(d => d.id !== dishId));
    if (selectedDishId === dishId) {
      setSelectedDishId(dishGroups[0]?.id || null);
    }
  };

  const updateDishItemQuantity = (dishId: string, itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromDish(dishId, itemId);
      return;
    }
    setDishGroups(dishGroups.map(dish =>
      dish.id === dishId
        ? {
            ...dish,
            items: dish.items.map(item =>
              item.id === itemId ? { ...item, quantity } : item
            ),
          }
        : dish
    ));
  };

  const removeItemFromDish = (dishId: string, itemId: string) => {
    setDishGroups(dishGroups.map(dish =>
      dish.id === dishId
        ? { ...dish, items: dish.items.filter(item => item.id !== itemId) }
        : dish
    ));
  };

  const triggerFlyToCartAnimation = (event: React.MouseEvent, itemName: string) => {
    // Usar cartButtonRef (móvil) o cartPanelRef (desktop)
    const cartElement = cartButtonRef.current || cartPanelRef.current;
    if (!cartElement) return;

    const clickRect = (event.target as HTMLElement).getBoundingClientRect();
    const cartRect = cartElement.getBoundingClientRect();

    const startX = clickRect.left + clickRect.width / 2;
    const startY = clickRect.top + clickRect.height / 2;
    const endX = cartRect.left + cartRect.width / 2;
    const endY = cartRect.top + cartRect.height / 2;

    const newFlyingItem = {
      id: Math.random().toString(),
      startX,
      startY,
      endX,
      endY,
      itemName,
    };

    setFlyingItems(prev => [...prev, newFlyingItem]);
    
    // Activar animación de pulso en el panel (desktop)
    if (cartPanelRef.current) {
      setIsCartPulsing(true);
      setTimeout(() => setIsCartPulsing(false), 600);
    }
  };

  const removeFlyingItem = (id: string) => {
    setFlyingItems(prev => prev.filter(item => item.id !== id));
  };

  const addItemToTicket = (item: Item, selectedKind?: string | Array<{name: string, price?: string}>, customPrice?: string, weight?: number, initialQuantity: number = 1, event?: React.MouseEvent) => {
    console.log('Item clicked:', { 
      name: item.name, 
      isCustom: item.isCustom, 
      customKinds: item.customKinds,
      hasKinds: item.customKinds && item.customKinds.length > 0,
      unit: item.unit
    });
    
    // PRIMERO: Si el item tiene variantes y no se ha seleccionado, abrir dialog de variantes
    // (este dialog mostrará input de peso si unit === "weight")
    if (item.isCustom && !selectedKind && item.customKinds && item.customKinds.length > 0) {
      console.log('Opening custom kind dialog for:', item.name);
      setCustomKindDialog({ isOpen: true, item });
      return;
    }
    
    // SEGUNDO: Si el item es por peso (sin variantes) y no se ha especificado el peso, abrir dialog de peso
    if (item.unit === "weight" && !weight) {
      console.log('Opening weight dialog for:', item.name);
      setWeightDialog({ isOpen: true, item });
      return;
    }

    let finalPrice = customPrice || item.displayPrice;
    
    // Construir nombre del item con sabores y peso
    let itemName = item.name;
    if (weight && item.unit === "weight") {
      itemName = `${item.name} (${weight.toFixed(3)} kg)`;
      // Calcular precio basado en peso
      finalPrice = (parseFloat(item.displayPrice) * weight).toFixed(2);
    } else if (selectedKind) {
      if (Array.isArray(selectedKind)) {
        const kindNames = selectedKind.map(k => k.name).join(' con ');
        itemName = `${item.name} (${kindNames})`;
      } else if (typeof selectedKind === 'string') {
        itemName = `${item.name} (${selectedKind})`;
      }
    }
    
    // Buscar si ya existe el mismo item con los mismos sabores
    const selectedKindString = Array.isArray(selectedKind) 
      ? JSON.stringify(selectedKind.map(k => k.name).sort())
      : selectedKind;
    
    // Buscar en ticketItems o en el plato seleccionado según el modo
    let existingItem: TicketItem | undefined;
    let isInDish = false;
    
    if (groupByDish && selectedDishId) {
      // Buscar en el plato seleccionado
      const selectedDish = dishGroups.find(d => d.id === selectedDishId);
      if (selectedDish) {
        existingItem = selectedDish.items.find(ti => {
          const tiKindString = Array.isArray(ti.selectedCustomKind)
            ? JSON.stringify(ti.selectedCustomKind.map((k: any) => k.name).sort())
            : ti.selectedCustomKind;
          return ti.itemId === item.id && tiKindString === selectedKindString;
        });
        isInDish = true;
      }
    } else {
      // Buscar en ticketItems
      existingItem = ticketItems.find(ti => {
        const tiKindString = Array.isArray(ti.selectedCustomKind)
          ? JSON.stringify(ti.selectedCustomKind.map((k: any) => k.name).sort())
          : ti.selectedCustomKind;
        return ti.itemId === item.id && tiKindString === selectedKindString;
      });
    }
    
    if (existingItem) {
      if (isInDish && selectedDishId) {
        // Actualizar cantidad en el plato
        setDishGroups(dishGroups.map(dish =>
          dish.id === selectedDishId
            ? {
                ...dish,
                items: dish.items.map(ti =>
                  ti.id === existingItem!.id
                    ? { ...ti, quantity: ti.quantity + initialQuantity }
                    : ti
                )
              }
            : dish
        ));
      } else {
        // Actualizar cantidad en ticketItems
        setTicketItems(ticketItems.map(ti => 
          ti.id === existingItem!.id
            ? { ...ti, quantity: ti.quantity + initialQuantity }
            : ti
        ));
      }
    } else {
      const newItem: TicketItem = {
        id: Math.random().toString(),
        itemId: item.id,
        name: itemName,
        price: finalPrice,
        quantity: initialQuantity,
        selectedCustomKind: selectedKind,
        groupId: groupByDish ? selectedDishId || undefined : undefined,
      };
      
      if (groupByDish && selectedDishId) {
        // Agregar al plato seleccionado
        setDishGroups(dishGroups.map(dish => 
          dish.id === selectedDishId
            ? { ...dish, items: [...dish.items, newItem] }
            : dish
        ));
      } else {
        // Agregar al ticket principal
        setTicketItems([...ticketItems, newItem]);
      }
    }
    
    // Disparar animación si se proporcionó el evento
    if (event) {
      triggerFlyToCartAnimation(event, item.name);
    }
  };

  const handleCustomKindSelect = (selectedKinds: Array<{name: string, price?: string}>, finalPrice: string, quantityOrWeight: number) => {
    if (customKindDialog.item) {
      const isWeight = customKindDialog.item.unit === "weight";
      
      if (isWeight) {
        // Para productos por peso, agregar una sola vez con el peso especificado
        addItemToTicket(customKindDialog.item, selectedKinds, finalPrice, quantityOrWeight);
      } else {
        // Para productos por pieza, agregar una sola vez con la cantidad especificada
        addItemToTicket(customKindDialog.item, selectedKinds, finalPrice, undefined, quantityOrWeight);
      }
    }
  };

  const handleWeightConfirm = (weight: number, totalPrice: number) => {
    if (weightDialog.item) {
      addItemToTicket(weightDialog.item, undefined, totalPrice.toFixed(2), weight);
    }
  };

  const toggleItemStatus = async (itemId: string, currentStatus?: string) => {
    const newStatus = currentStatus === "delivered" ? "pending" : "delivered";
    
    const result = await updateTicketItemStatus(itemId, newStatus);
    
    if (result.success) {
      // Actualizar el estado local
      setTicketItems(ticketItems.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      ));
      
      // También actualizar en los platos si existe
      setDishGroups(dishGroups.map(dish => ({
        ...dish,
        items: dish.items.map(item =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      })));
      
      toast.success(newStatus === "delivered" ? "Item marcado como entregado" : "Item marcado como pendiente");
    } else {
      toast.error("Error al actualizar el estado del item");
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

  const updateDishItemNotes = (dishId: string, itemId: string, notes: string) => {
    setDishGroups(dishGroups.map(dish =>
      dish.id === dishId
        ? { ...dish, items: dish.items.map(item => item.id === itemId ? { ...item, notes } : item) }
        : dish
    ));
  };

  const openItemNoteDialog = (itemId: string, currentNote: string = "") => {
    setItemNoteDialog({ isOpen: true, itemId, currentNote });
  };

  const saveItemNote = () => {
    if (itemNoteDialog.itemId) {
      // Buscar si el item está en un plato
      const dish = dishGroups.find(d => d.items.some(i => i.id === itemNoteDialog.itemId));
      
      if (dish) {
        updateDishItemNotes(dish.id, itemNoteDialog.itemId, itemNoteDialog.currentNote);
      } else {
        updateItemNotes(itemNoteDialog.itemId, itemNoteDialog.currentNote);
      }
    }
    setItemNoteDialog({ isOpen: false, itemId: null, currentNote: "" });
  };

  const calculateSubtotal = () => {
    const allItems = getAllTicketItems();
    return allItems.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.16;
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const clearTicket = async () => {
    setTicketItems([]);
    setCustomerId(undefined);
    setCurrentTicketId(null);
    setDishGroups([]);
    setSelectedDishId(null);
    setGroupByDish(false);
    setCustomerPhone("");
    setCustomerName("");
    setCustomerLastName("");
    setTicketType("dine_in");
    setTicketNotes("");
    
    // Recargar el número de ticket siguiente
    if (activeShift) {
      const nextNumber = await getNextTicketNumber({ shiftId: activeShift.id });
      setCurrentTicketNumber(nextNumber);
    }
  };

  const handleCustomerPhoneSearch = async () => {
    if (!customerPhone || customerPhone.length < 10) {
      toast.error("Ingresa un número de teléfono válido (10 dígitos)");
      return;
    }

    setIsSearchingCustomer(true);
    try {
      const result = await findOrCreateCustomerByPhone({
        businessId: session.user.businessId,
        phone: customerPhone,
      });

      if (result.success && result.customer) {
        // Cliente encontrado
        setCustomerId(result.customer.id);
        setCustomerName(`${result.customer.firstName} ${result.customer.lastName}`);
        if (result.isNew) {
          toast.success("Cliente registrado exitosamente");
        } else {
          toast.success(`Cliente encontrado: ${result.customer.firstName} ${result.customer.lastName}`);
        }
      } else if (result.needsName) {
        // Cliente no existe, pedir nombre
        setIsCustomerDialogOpen(true);
      } else {
        toast.error(result.error || "Error al buscar cliente");
      }
    } catch (error) {
      console.error("Error searching customer:", error);
      toast.error("Error al buscar cliente");
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const handleCreateNewCustomer = async () => {
    if (!customerName.trim() || !customerLastName.trim()) {
      toast.error("Ingresa el nombre y apellido del cliente");
      return;
    }

    setIsSearchingCustomer(true);
    try {
      const result = await findOrCreateCustomerByPhone({
        businessId: session.user.businessId,
        phone: customerPhone,
        firstName: customerName.trim(),
        lastName: customerLastName.trim(),
      });

      if (result.success && result.customer) {
        setCustomerId(result.customer.id);
        setCustomerName(`${result.customer.firstName} ${result.customer.lastName}`);
        setIsCustomerDialogOpen(false);
        toast.success("Cliente registrado exitosamente");
      } else {
        toast.error(result.error || "Error al crear cliente");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Error al crear cliente");
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const getAllTicketItems = (): TicketItem[] => {
    // Siempre combinar items del ticket principal con items de platos
    const dishItems = dishGroups.flatMap(dish => dish.items);
    return [...ticketItems, ...dishItems];
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
      groupId: ti.groupId,
      status: ti.status || "pending",
    }));

    // Verificar si hay items con groupId
    const hasGroupedItems = loadedItems.some(item => item.groupId);
    
    if (hasGroupedItems) {
      // Activar modo de agrupación
      setGroupByDish(true);
      
      // Separar items agrupados de los no agrupados
      const itemsWithoutGroup = loadedItems.filter(item => !item.groupId);
      const itemsWithGroup = loadedItems.filter(item => item.groupId);
      
      // Crear grupos únicos basados en groupId
      const uniqueGroupIds = Array.from(new Set(itemsWithGroup.map(item => item.groupId)));
      const reconstructedDishes: DishGroup[] = uniqueGroupIds.map((groupId, index) => ({
        id: groupId!,
        name: `Plato ${index + 1}`,
        items: itemsWithGroup.filter(item => item.groupId === groupId),
      }));
      
      setDishGroups(reconstructedDishes);
      setSelectedDishId(reconstructedDishes[0]?.id || null);
      setTicketItems(itemsWithoutGroup);
    } else {
      // No hay agrupación, cargar normalmente
      setGroupByDish(false);
      setDishGroups([]);
      setSelectedDishId(null);
      setTicketItems(loadedItems);
    }

    setCurrentTicketNumber(ticket.ticketNumber);
    setCustomerId(ticket.customerId);
    setCurrentTicketId(ticket.id);
    
    // Cargar tipo de ticket
    if (ticket.ticketType) {
      setTicketType(ticket.ticketType as "dine_in" | "pick_up" | "delivery");
    }
    
    // Cargar notas generales del ticket
    if (ticket.notes) {
      setTicketNotes(ticket.notes);
    }
    
    // Cargar información del cliente
    if (ticket.customer) {
      setCustomerPhone(ticket.customer.phone || "");
      setCustomerName(`${ticket.customer.firstName} ${ticket.customer.lastName}`);
    }
    
    // Cerrar el dialog
    setIsTicketsDialogOpen(false);
  };

  const handleSaveTicket = async () => {
    const allItems = getAllTicketItems();
    if (allItems.length === 0) return;
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
          ticketType: ticketType,
          total: total.toString(),
          taxTotal: tax.toString(),
          status: "open",
          paymentStatus: "pending",
          notes: ticketNotes || undefined,
          items: allItems.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
            selectedCustomKind: item.selectedCustomKind,
            groupId: item.groupId,
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
          ticketType: ticketType,
          total: total.toString(),
          taxTotal: tax.toString(),
          status: "open",
          paymentStatus: "pending",
          notes: ticketNotes || undefined,
          items: allItems.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
            selectedCustomKind: item.selectedCustomKind,
            groupId: item.groupId,
          })),
        });
      }

      if (result.success) {
        // Emitir evento de Socket.io
        if (currentTicketId) {
          // Ticket actualizado
          console.log("📤 Emitting ticket-updated for:", currentTicketId);
          emitTicketUpdated(currentTicketId);
        } else if (result.ticket?.id) {
          // Ticket creado - usar el número que acabamos de crear
          const createdTicketNumber = parseInt(currentTicketNumber);
          console.log("📤 Emitting ticket-created:", result.ticket.id, createdTicketNumber);
          emitTicketCreated(result.ticket.id, createdTicketNumber);
        }
        
        clearTicket();
        await reloadTicketData();
        toast.success("Ticket guardado exitosamente");
        router.refresh();
      } else {
        toast.error("Error al guardar ticket");
      }
    } catch (error) {
      console.error("Error saving ticket:", error);
      toast.error("Error al guardar ticket");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmPayment = async (paymentMethod: string, amountPaid?: number) => {
    const allItems = getAllTicketItems();
    if (allItems.length === 0) return;
    if (!activeShift) {
      toast.error("No hay un turno activo");
      return;
    }
    
    try {
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = subtotal

      let result;

      if (currentTicketId) {
        // Actualizar ticket existente
        result = await updateTicketComplete(currentTicketId, {
          shiftId: activeShift.id,
          customerId: customerId,
          ticketType: ticketType,
          total: total.toString(),
          taxTotal: tax.toString(),
          status: "closed",
          paymentMethod: paymentMethod,
          paymentStatus: "paid",
          notes: ticketNotes || undefined,
          items: allItems.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
            selectedCustomKind: item.selectedCustomKind,
            groupId: item.groupId,
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
          ticketType: ticketType,
          total: total.toString(),
          taxTotal: tax.toString(),
          status: "closed",
          paymentMethod: paymentMethod,
          paymentStatus: "paid",
          notes: ticketNotes || undefined,
          items: allItems.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
            selectedCustomKind: item.selectedCustomKind,
            groupId: item.groupId,
          })),
        });
      }

      if (result.success) {
        // Emitir evento de Socket.io
        if (currentTicketId) {
          console.log("📤 Emitting ticket-paid for:", currentTicketId);
          emitTicketPaid(currentTicketId);
        } else if (result.ticket?.id) {
          const createdTicketNumber = parseInt(currentTicketNumber);
          console.log("📤 Emitting ticket-created and paid:", result.ticket.id, createdTicketNumber);
          emitTicketCreated(result.ticket.id, createdTicketNumber);
          emitTicketPaid(result.ticket.id);
        }
        
        if (paymentMethod === "cash" && amountPaid) {
          const change = amountPaid - total;
          if (change > 0) {
            toast.success(`Pago exitoso. Cambio: $${change.toFixed(2)}`);
          }
        }
        clearTicket();
        await reloadTicketData();
        toast.success("Ticket cobrado exitosamente");
        router.refresh();
      } else {
        toast.error("Error al procesar pago");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Error al procesar pago");
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
            {
              isOwner || isManager ? (
                  <Link href="/panel">
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 lg:h-10 lg:w-10">
                    <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
                  </Link>
              ) : null
            }
            <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
              <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-primary/10 overflow-hidden shrink-0">
                {businessLogo ? (
                  <Image
                    src={businessLogo}
                    alt="Logo"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Store className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                )}
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
              {/* Indicador de conexión Socket.io */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'En línea' : 'Desconectado'}
                </span>
              </div>
              
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

              <Button
                variant="outline"
                onClick={() => setIsCashMovementDialogOpen(true)}
                className="gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Movimiento
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
                variant="ghost"
                size="icon"
                onClick={() => setIsCashMovementDialogOpen(true)}
                className="h-9 w-9"
              >
                <DollarSign className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9"
              >
                <LogOut className="h-5 w-5" />
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
                  onClick={(e) => addItemToTicket(item, undefined, undefined, undefined, 1, e)}
                  className="group relative flex flex-col rounded-lg border border-border bg-card p-4 hover:border-primary hover:shadow-md transition-all text-left"
                >
                  {/* Imagen del producto */}
                  <div className="relative h-32 w-full rounded-lg mb-3 overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground/40" />
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
      <div 
        ref={cartPanelRef} 
        className={`hidden lg:flex w-96 border-l border-border bg-card flex-col relative transition-all duration-300 ${
          isCartPulsing ? 'animate-cart-pulse' : ''
        }`}
      >
        {isCartPulsing && (
          <div className="absolute inset-0 bg-primary/5 pointer-events-none animate-pulse rounded-r-lg z-10" />
        )}
        {/* Header del ticket */}
        <div className="border-b border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Ticket: #{currentTicketNumber}
            </h2>
            <div className="flex gap-2">
              {(getAllTicketItems().length > 0 || currentTicketId) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={clearTicket}
                >
                  <X className="h-4 w-4" />
                  Cerrar
                </Button>
              )}
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
          </div>
          
          {/* Input de teléfono del cliente */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Teléfono del cliente (10 dígitos)"
                className="text-sm"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCustomerPhoneSearch();
                  }
                }}
                disabled={isSearchingCustomer}
              />
              <Button
                size="sm"
                onClick={handleCustomerPhoneSearch}
                disabled={isSearchingCustomer || customerPhone.length < 10}
              >
                {isSearchingCustomer ? "..." : "Buscar"}
              </Button>
            </div>
            {customerName && (
              <p className="text-xs text-muted-foreground px-1">
                Cliente: <span className="font-medium text-foreground">{customerName}</span>
              </p>
            )}
          </div>

          {/* Selector de tipo de ticket */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Tipo de Orden</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTicketType("dine_in")}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                  ticketType === "dine_in"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs font-medium">Comer Aquí</span>
              </button>
              <button
                onClick={() => setTicketType("pick_up")}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                  ticketType === "pick_up"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Package className="h-5 w-5" />
                <span className="text-xs font-medium">Para Llevar</span>
              </button>
              <button
                onClick={() => setTicketType("delivery")}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                  ticketType === "delivery"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Truck className="h-5 w-5" />
                <span className="text-xs font-medium">Delivery</span>
              </button>
            </div>
          </div>
          
          {/* Switch para agrupar por plato */}
          <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              <Label htmlFor="group-by-dish" className="text-sm font-medium cursor-pointer">
                Agrupar por plato
              </Label>
            </div>
            <Switch
              id="group-by-dish"
              checked={groupByDish}
              onCheckedChange={(checked) => {
                setGroupByDish(checked);
                if (checked && dishGroups.length === 0) {
                  // Solo crear un plato si no hay ninguno
                  createNewDish();
                }
                // No mover items existentes, solo cambiar el modo para nuevos items
              }}
            />
          </div>

          {/* Tabs de platos - Mostrar siempre que haya platos */}
          {dishGroups.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {dishGroups.map((dish) => (
                <button
                  key={dish.id}
                  onClick={() => setSelectedDishId(dish.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    selectedDishId === dish.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                  {dish.name}
                  <span className="text-xs opacity-75">{dish.items.length} items</span>
                  {dishGroups.length > 1 && (
                    <X
                      className="h-3.5 w-3.5 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDish(dish.id);
                      }}
                    />
                  )}
                </button>
              ))}
              {groupByDish && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createNewDish}
                  className="rounded-full h-7 px-3"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Plato
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Productos del ticket */}
        <div className="flex-1 overflow-y-auto p-4">
          {ticketItems.length === 0 && dishGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Selecciona productos para empezar
              </p>
            </div>
          ) : dishGroups.length > 0 ? (
            <div className="space-y-4">
              {/* Items sin agrupar */}
              {ticketItems.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase">Sin agrupar</h3>
                  {ticketItems.map((item) => (
                    <div key={item.id} className={`border rounded-lg p-3 space-y-2 transition-all ${item.status === 'delivered' ? 'bg-green-50 border-green-200' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`font-medium text-sm ${item.status === 'delivered' ? 'line-through text-muted-foreground' : ''}`}>{item.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            ${parseFloat(item.price).toFixed(2)} c/u
                          </p>
                          {item.notes && (
                            <p className="text-xs text-primary mt-1 flex items-start gap-1">
                              <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                              <span>{item.notes}</span>
                            </p>
                          )}
                        </div>
                        <span className="font-semibold text-sm">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <div className="flex-1" />
                        <Button
                          variant={item.status === 'delivered' ? 'default' : 'outline'}
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleItemStatus(item.id, item.status)}
                          title={item.status === 'delivered' ? 'Marcar como pendiente' : 'Marcar como entregado'}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openItemNoteDialog(item.id, item.notes)}
                          title="Agregar nota"
                        >
                          <MessageSquare className={`h-4 w-4 ${item.notes ? 'text-primary' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeItemFromTicket(item.id)}
                        >
                          🗑
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Platos agrupados */}
              {dishGroups.map((dish) => {
                const dishTotal = dish.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
                return (
                  <div key={dish.id} className="border-2 border-primary/20 rounded-lg p-3 space-y-2 bg-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-sm">{dish.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {dish.items.length} items
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeDish(dish.id)}
                        >
                          🗑
                        </Button>
                      </div>
                      <span className="font-bold text-primary">${dishTotal.toFixed(2)}</span>
                    </div>
                    
                    {dish.items.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        Selecciona productos para este plato
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {dish.items.map((item) => (
                          <div key={item.id} className="bg-background border rounded-lg p-2 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{item.name}</h4>
                                {item.selectedCustomKind && Array.isArray(item.selectedCustomKind) && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.selectedCustomKind.map((kind: any, idx: number) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {kind.name}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  ${parseFloat(item.price).toFixed(2)} c/u
                                </p>
                                {item.notes && (
                                  <p className="text-xs text-primary mt-1 flex items-start gap-1">
                                    <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                                    <span>{item.notes}</span>
                                  </p>
                                )}
                              </div>
                              <span className="font-semibold text-sm">
                                ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  const newQuantity = item.quantity - 1;
                                  if (newQuantity <= 0) {
                                    setDishGroups(dishGroups.map(d =>
                                      d.id === dish.id
                                        ? { ...d, items: d.items.filter(i => i.id !== item.id) }
                                        : d
                                    ));
                                  } else {
                                    setDishGroups(dishGroups.map(d =>
                                      d.id === dish.id
                                        ? { ...d, items: d.items.map(i => i.id === item.id ? { ...i, quantity: newQuantity } : i) }
                                        : d
                                    ));
                                  }
                                }}
                              >
                                -
                              </Button>
                              <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  setDishGroups(dishGroups.map(d =>
                                    d.id === dish.id
                                      ? { ...d, items: d.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) }
                                      : d
                                  ));
                                }}
                              >
                                +
                              </Button>
                              <div className="flex-1" />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => openItemNoteDialog(item.id, item.notes)}
                                title="Agregar nota"
                              >
                                <MessageSquare className={`h-4 w-4 ${item.notes ? 'text-primary' : ''}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => {
                                  setDishGroups(dishGroups.map(d =>
                                    d.id === dish.id
                                      ? { ...d, items: d.items.filter(i => i.id !== item.id) }
                                      : d
                                  ));
                                }}
                              >
                                🗑
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {ticketItems.map((item) => (
                <div key={item.id} className={`border rounded-lg p-3 space-y-2 transition-all ${item.status === 'delivered' ? 'bg-green-50 border-green-200' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${item.status === 'delivered' ? 'line-through text-muted-foreground' : ''}`}>{item.name}</h4>
                      {item.selectedCustomKind && Array.isArray(item.selectedCustomKind) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedCustomKind.map((kind: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {kind.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        ${parseFloat(item.price).toFixed(2)} c/u
                      </p>
                      {item.notes && (
                        <p className="text-xs text-primary mt-1 flex items-start gap-1">
                          <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                          <span>{item.notes}</span>
                        </p>
                      )}
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
                      variant={item.status === 'delivered' ? 'default' : 'outline'}
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleItemStatus(item.id, item.status)}
                      title={item.status === 'delivered' ? 'Marcar como pendiente' : 'Marcar como entregado'}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openItemNoteDialog(item.id, item.notes)}
                      title="Agregar nota"
                    >
                      <MessageSquare className={`h-4 w-4 ${item.notes ? 'text-primary' : ''}`} />
                    </Button>
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
          {/* Nota general del ticket */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Nota general (opcional)</Label>
            <Input
              placeholder="Ej: Sin cebolla, extra picante..."
              value={ticketNotes}
              onChange={(e) => setTicketNotes(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
          </div>
          {/* <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IVA (16%)</span>
            <span className="font-medium">${calculateTax().toFixed(2)}</span>
          </div> */}
          <div className="flex justify-between text-lg font-semibold pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">${calculateTotal().toFixed(2)}</span>
          </div>

          {/* Botones de acción */}
          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                disabled={getAllTicketItems().length === 0 || isSaving}
                onClick={handleSaveTicket}
              >
                <Receipt className="h-4 w-4 mr-2" />
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={getAllTicketItems().length === 0}
                onClick={() => setIsPaymentDialogOpen(true)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cobrar
              </Button>
            </div>
            {(getAllTicketItems().length > 0 || currentTicketId) && (
              <Button 
                variant="outline" 
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50"
                onClick={() => {
                  clearTicket();
                  setIsCartOpen(false);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cerrar sin guardar
              </Button>
            )}
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
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCartOpen(false)}
                  className="h-8 w-8"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  #Ticket {currentTicketNumber}
                </h2>
              </div>
              <div className="flex gap-2">
                {(getAllTicketItems().length > 0 || currentTicketId) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      clearTicket();
                      setIsCartOpen(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                    Cerrar
                  </Button>
                )}
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
            </div>
            
            {/* Input de teléfono del cliente */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Teléfono del cliente (10 dígitos)"
                  className="text-sm"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCustomerPhoneSearch();
                    }
                  }}
                  disabled={isSearchingCustomer}
                />
                <Button
                  size="sm"
                  onClick={handleCustomerPhoneSearch}
                  disabled={isSearchingCustomer || customerPhone.length < 10}
                >
                  {isSearchingCustomer ? "..." : "Buscar"}
                </Button>
              </div>
              {customerName && (
                <p className="text-xs text-muted-foreground px-1">
                  Cliente: <span className="font-medium text-foreground">{customerName}</span>
                </p>
              )}
            </div>

            {/* Selector de tipo de ticket */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Tipo de Orden</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTicketType("dine_in")}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                    ticketType === "dine_in"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span className="text-[10px] font-medium">Comer Aquí</span>
                </button>
                <button
                  onClick={() => setTicketType("pick_up")}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                    ticketType === "pick_up"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Package className="h-4 w-4" />
                  <span className="text-[10px] font-medium">Para Llevar</span>
                </button>
                <button
                  onClick={() => setTicketType("delivery")}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                    ticketType === "delivery"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Truck className="h-4 w-4" />
                  <span className="text-[10px] font-medium">Delivery</span>
                </button>
              </div>
            </div>
          </div>

          {/* Productos del ticket */}
          <div className="flex-1 overflow-y-auto p-4">
            {getAllTicketItems().length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Selecciona productos para empezar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mostrar platos agrupados */}
                {dishGroups.map((dish) => (
                  <div key={dish.id} className="space-y-2">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">{dish.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-destructive"
                        onClick={() => removeDish(dish.id)}
                      >
                        Eliminar plato
                      </Button>
                    </div>
                    {dish.items.map((item) => (
                      <div key={item.id} className="border rounded-lg p-3 space-y-2 bg-primary/5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            {item.selectedCustomKind && Array.isArray(item.selectedCustomKind) && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.selectedCustomKind.map((kind: any, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {kind.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              ${parseFloat(item.price).toFixed(2)} c/u
                            </p>
                            {item.notes && (
                              <p className="text-xs text-primary mt-1 flex items-start gap-1">
                                <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                                <span>{item.notes}</span>
                              </p>
                            )}
                          </div>
                          <span className="font-semibold text-sm">
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateDishItemQuantity(dish.id, item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateDishItemQuantity(dish.id, item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <div className="flex-1" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openItemNoteDialog(item.id, item.notes)}
                            title="Agregar nota"
                          >
                            <MessageSquare className={`h-4 w-4 ${item.notes ? 'text-primary' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeItemFromDish(dish.id, item.id)}
                          >
                            🗑
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Mostrar items sin agrupar */}
                {ticketItems.length > 0 && (
                  <div className="space-y-2">
                    {dishGroups.length > 0 && (
                      <div className="px-2">
                        <span className="font-semibold text-sm text-muted-foreground">Sin agrupar</span>
                      </div>
                    )}
                    {ticketItems.map((item) => (
                      <div key={item.id} className={`border rounded-lg p-3 space-y-2 transition-all ${item.status === 'delivered' ? 'bg-green-50 border-green-200' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium text-sm ${item.status === 'delivered' ? 'line-through text-muted-foreground' : ''}`}>{item.name}</h4>
                            {item.selectedCustomKind && Array.isArray(item.selectedCustomKind) && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.selectedCustomKind.map((kind: any, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {kind.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              ${parseFloat(item.price).toFixed(2)} c/u
                            </p>
                            {item.notes && (
                              <p className="text-xs text-primary mt-1 flex items-start gap-1">
                                <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                                <span>{item.notes}</span>
                              </p>
                            )}
                          </div>
                          <span className="font-semibold text-sm">
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                          <div className="flex-1" />
                          <Button
                            variant={item.status === 'delivered' ? 'default' : 'outline'}
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleItemStatus(item.id, item.status)}
                            title={item.status === 'delivered' ? 'Marcar como pendiente' : 'Marcar como entregado'}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => openItemNoteDialog(item.id, item.notes)}
                            title="Agregar nota"
                          >
                            <MessageSquare className={`h-4 w-4 ${item.notes ? 'text-primary' : ''}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
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
            )}
          </div>

          {/* Footer - Totales */}
          <div className="border-t border-border p-4 space-y-3">
            {/* Nota general del ticket */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Nota general (opcional)</Label>
              <Input
                placeholder="Ej: Sin cebolla, extra picante..."
                value={ticketNotes}
                onChange={(e) => setTicketNotes(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              {/* <span className="text-muted-foreground">IVA (16%)</span> */}
              {/* <span className="font-medium">${calculateTax().toFixed(2)}</span> */}
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span>Total</span>
              <span className="text-orange-500">${calculateTotal().toFixed(2)}</span>
            </div>

            {/* Botones de acción */}
            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  disabled={getAllTicketItems().length === 0 || isSaving}
                  onClick={handleSaveTicket}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  {isSaving ? "Guardando..." : "Guardar"}
                </Button>
                <Button 
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  disabled={getAllTicketItems().length === 0}
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsPaymentDialogOpen(true);
                  }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cobrar
                </Button>
              </div>
              {(getAllTicketItems().length > 0 || currentTicketId) && (
                <Button 
                  variant="outline" 
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50"
                  onClick={() => {
                    clearTicket();
                    setIsCartOpen(false);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cerrar sin guardar
                </Button>
              )}
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
              {openTickets.map((ticket) => {
                const ticketTypeLabels = {
                  dine_in: { label: "Comer Aquí", icon: Home },
                  pick_up: { label: "Para Llevar", icon: Package },
                  delivery: { label: "Delivery", icon: Truck },
                };
                const typeInfo = ticketTypeLabels[ticket.ticketType as keyof typeof ticketTypeLabels] || ticketTypeLabels.dine_in;
                const TypeIcon = typeInfo.icon;
                
                return (
                  <div
                    key={ticket.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => loadSavedTicket(ticket)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-primary" />
                        <span className="font-semibold">Ticket #{ticket.ticketNumber}</span>
                      </div>
                      <Badge variant="secondary">
                        ${parseFloat(ticket.total).toFixed(2)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Tipo de orden */}
                      <div className="flex items-center gap-2 text-sm">
                        <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">{typeInfo.label}</span>
                      </div>
                      
                      {/* Cliente */}
                      {ticket.customer && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {ticket.customer.firstName} {ticket.customer.lastName}
                          </span>
                        </div>
                      )}
                      
                      {/* Dirección (solo para delivery) */}
                      {ticket.ticketType === "delivery" && ticket.customer?.address && (
                        <div className="flex items-start gap-2 text-sm">
                          <Truck className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                          <span className="text-muted-foreground text-xs">
                            {ticket.customer.address}
                          </span>
                        </div>
                      )}
                      
                      {/* Nota general */}
                      {ticket.notes && (
                        <div className="flex items-start gap-2 text-sm bg-primary/5 p-2 rounded-md">
                          <MessageSquare className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <span className="text-primary text-xs font-medium">
                            {ticket.notes}
                          </span>
                        </div>
                      )}
                      
                      {/* Fecha */}
                      <div className="text-xs text-muted-foreground pt-1 border-t">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para registrar nuevo cliente */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              El teléfono <span className="font-medium text-foreground">{customerPhone}</span> no está registrado.
              Ingresa los datos del cliente:
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="customer-name">Nombre</Label>
                <Input
                  id="customer-name"
                  placeholder="Nombre del cliente"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={isSearchingCustomer}
                />
              </div>
              <div>
                <Label htmlFor="customer-lastname">Apellido</Label>
                <Input
                  id="customer-lastname"
                  placeholder="Apellido del cliente"
                  value={customerLastName}
                  onChange={(e) => setCustomerLastName(e.target.value)}
                  disabled={isSearchingCustomer}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCustomerDialogOpen(false);
                  setCustomerName("");
                  setCustomerLastName("");
                }}
                disabled={isSearchingCustomer}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateNewCustomer}
                disabled={isSearchingCustomer || !customerName.trim() || !customerLastName.trim()}
              >
                {isSearchingCustomer ? "Guardando..." : "Registrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de selección de tipo custom */}
      <CustomKindDialog
        isOpen={customKindDialog.isOpen}
        onClose={() => setCustomKindDialog({ isOpen: false, item: null })}
        itemName={customKindDialog.item?.name || ""}
        customKinds={customKindDialog.item?.customKinds || []}
        basePrice={customKindDialog.item?.displayPrice || "0"}
        unit={customKindDialog.item?.unit}
        onSelect={handleCustomKindSelect}
      />

      {/* Dialog de peso */}
      <WeightInputDialog
        open={weightDialog.isOpen}
        onOpenChange={(open) => setWeightDialog({ isOpen: open, item: null })}
        itemName={weightDialog.item?.name || ""}
        pricePerKg={parseFloat(weightDialog.item?.displayPrice || "0")}
        onConfirm={handleWeightConfirm}
      />

      {/* Dialog de nota de item */}
      <Dialog open={itemNoteDialog.isOpen} onOpenChange={(open) => !open && setItemNoteDialog({ isOpen: false, itemId: null, currentNote: "" })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar nota al producto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item-note">Nota</Label>
              <textarea
                id="item-note"
                placeholder="Ej: Sin cebolla, extra picante, término medio..."
                value={itemNoteDialog.currentNote}
                onChange={(e) => setItemNoteDialog({ ...itemNoteDialog, currentNote: e.target.value })}
                className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setItemNoteDialog({ isOpen: false, itemId: null, currentNote: "" })}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={saveItemNote}
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de pago */}
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        total={calculateTotal()}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* Dialog de movimiento de efectivo */}
      {activeShift && (
        <CashMovementDialog
          isOpen={isCashMovementDialogOpen}
          onClose={() => setIsCashMovementDialogOpen(false)}
          shiftId={activeShift.id}
          branchId={selectedBranchId}
          businessId={session.user.businessId!}
          employeeId={session.user.employeeId!}
        />
      )}

      {/* Botones flotantes - Solo móvil */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {/* Botón para toggle de agrupación */}
        <Button
          size="lg"
          className={`h-12 w-12 rounded-full shadow-lg ${
            groupByDish ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/90"
          }`}
          onClick={() => {
            setGroupByDish(!groupByDish);
            if (!groupByDish && dishGroups.length === 0) {
              createNewDish();
            }
          }}
        >
          <UtensilsCrossed className="h-5 w-5" />
        </Button>

        {/* Botón para agregar nuevo plato (solo visible si agrupación está activa) */}
        {groupByDish && (
          <Button
            size="lg"
            className="h-12 w-12 rounded-full shadow-lg bg-green-500 hover:bg-green-600"
            onClick={createNewDish}
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}

        {/* Botón para seleccionar plato (solo visible si hay platos) */}
        {groupByDish && dishGroups.length > 0 && (
          <Button
            size="lg"
            className="h-12 w-12 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600"
            onClick={() => {
              const currentIndex = dishGroups.findIndex(d => d.id === selectedDishId);
              const nextIndex = (currentIndex + 1) % dishGroups.length;
              setSelectedDishId(dishGroups[nextIndex].id);
            }}
          >
            <div className="flex flex-col items-center">
              <UtensilsCrossed className="h-4 w-4" />
              <span className="text-[10px] font-bold">
                {dishGroups.findIndex(d => d.id === selectedDishId) + 1}/{dishGroups.length}
              </span>
            </div>
          </Button>
        )}

        {/* Botón del carrito */}
        <Button
          ref={cartButtonRef}
          onClick={() => setIsCartOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg relative"
        >
          <ShoppingCart className="h-6 w-6" />
          {getAllTicketItems().length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 rounded-full"
            >
              {getAllTicketItems().length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Animaciones fly-to-cart */}
      {flyingItems.map((flyingItem) => (
        <FlyToCart
          key={flyingItem.id}
          startX={flyingItem.startX}
          startY={flyingItem.startY}
          endX={flyingItem.endX}
          endY={flyingItem.endY}
          itemName={flyingItem.itemName}
          onComplete={() => removeFlyingItem(flyingItem.id)}
        />
      ))}
    </div>
  );
}
