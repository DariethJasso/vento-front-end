"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Receipt, ShoppingCart, User, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signOut } from "next-auth/react";

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
}

export default function POSContainer({ session, branch, allItems, categories, allBranches, isOwner, initialBranchId }: POSContainerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isTicketsDialogOpen, setIsTicketsDialogOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(initialBranchId);
  const [items, setItems] = useState<Item[]>([]);
  const [currentBranch, setCurrentBranch] = useState(branch);

  // Filtrar items por sucursal seleccionada
  useEffect(() => {
    const branchItems = allItems
      .map(item => {
        const branchItem = item.branchItems?.find(
          (bi: any) => bi.branchId === selectedBranchId && bi.isActiveInBranch
        );
        
        if (!branchItem) return null;
        
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          displayPrice: branchItem.customPrice || item.price,
          categoryId: item.categoryId,
          image: item.image,
          category: item.category,
        };
      })
      .filter((item: any) => item !== null);
    
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

  // Filtrar items por categoría y búsqueda
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background">
      {/* Panel izquierdo - Productos */}
      <div className="flex-1 flex flex-col overflow-hidden order-2 lg:order-1">
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
            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              {/* Tickets abiertos - Desktop */}
              <Button
                variant="outline"
                onClick={() => setIsTicketsDialogOpen(true)}
                className="gap-2 hidden lg:flex"
              >
                <Receipt className="h-4 w-4" />
                Tickets abiertos
              </Button>
              
              {/* Tickets abiertos - Mobile */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsTicketsDialogOpen(true)}
                className="lg:hidden"
              >
                <Receipt className="h-4 w-4" />
              </Button>

              {/* Usuario y Logout - Desktop */}
              <div className="hidden lg:flex items-center gap-2 pl-2 border-l">
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

              {/* Logout - Mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="lg:hidden h-8 w-8"
              >
                <LogOut className="h-4 w-4" />
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

      {/* Panel derecho - Ticket */}
      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col order-1 lg:order-2 max-h-[40vh] lg:max-h-none">
        {/* Header del ticket */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Nuevo ticket
            </h2>
            <Button variant="ghost" size="sm" className="gap-2">
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
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Selecciona productos para empezar
            </p>
          </div>
        </div>

        {/* Footer - Totales */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">$0.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IVA (16%)</span>
            <span className="font-medium">$0.00</span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t">
            <span>Total</span>
            <span className="text-primary">$0.00</span>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1">
              <Receipt className="h-4 w-4 mr-2" />
              Guardar
            </Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cobrar
            </Button>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
