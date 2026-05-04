"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react";
import { useState, useTransition } from "react";
import { Session } from "next-auth";
import { deleteItem } from "@/app/actions/items";
import { CreateItemDialog } from "@/components/items/create-item-dialog";

interface Item {
  id: string;
  name: string;
  description: string | null;
  price: string;
  categoryId: string | null;
  sku: string | null;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Branch {
  id: string;
  name: string;
}

interface ItemsContainerProps {
  session: Session;
  items: any[];
  categories: Category[];
  branches: Branch[];
}

export default function ItemsContainer({ session, items, categories, branches }: ItemsContainerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleEdit = (item: any) => {
    setEditingItem(item);
    console.log("Editing item:", item);
    setIsCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("¿Estás seguro de eliminar este item?")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteItem({ itemId });
      
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error || "Error al eliminar item");
      }
    });
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">
            Items
          </h1>
          <p className="text-muted-foreground">
            Tu catálogo de productos: precios, sucursales, inventario y variantes.
          </p>
        </div>
        <div>
          <Button
            size="lg"
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo item
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, SKU o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {filteredItems.length} resultado{filteredItems.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      {filteredItems.length > 0 ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Producto</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">SKU</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Categoría</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Precio</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Inventario</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Variantes</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Estado</th>
                  <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {item.sku || "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-foreground">
                        {item.category?.name || "Sin categoría"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-foreground">
                        ${parseFloat(item.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4">
                      {(() => {
                        const hasTracking = item.branchItems?.some((bi: any) => bi.trackInventory);
                        const totalStock = item.branchItems?.reduce((sum: number, bi: any) => {
                          return sum + (bi.trackInventory ? parseFloat(bi.stock || "0") : 0);
                        }, 0) || 0;
                        const minStock = item.branchItems?.find((bi: any) => bi.trackInventory)?.minStock;
                        
                        return hasTracking ? (
                          <span className="text-sm text-foreground">
                            {totalStock} {minStock && `(mín. ${minStock})`}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Sin tracking
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-4">
                      {(() => {
                        const customBranch = item.branchItems?.find((bi: any) => bi.isCustom);
                        const variants = customBranch?.customKinds as string[] | null;
                        const variantCount = variants?.length || 0;
                        
                        return variantCount > 0 ? (
                          <span className="text-sm text-foreground">
                            {variantCount}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-4">
                      <Badge 
                        variant={item.isActive ? "default" : "secondary"}
                        className={item.isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}
                      >
                        {item.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-card border border-border rounded-2xl">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "No se encontraron items" : "No tienes items registrados"}
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear primer item
          </Button>
        </div>
      )}

      <CreateItemDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        businessId={session.user.businessId!}
        categories={categories}
        branches={branches}
        editingItem={editingItem}
      />
    </>
  );
}
