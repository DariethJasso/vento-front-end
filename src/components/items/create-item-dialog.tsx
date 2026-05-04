"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createItem, updateItem } from "@/app/actions/items";
import { createCategory } from "@/app/actions/categories";
import { Plus, Upload, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Branch {
  id: string;
  name: string;
}

interface EditingItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  categoryId: string | null;
  sku: string | null;
  isActive: boolean;
  branchItems?: any[];
}

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  categories: Category[];
  branches: Branch[];
  editingItem?: EditingItem | null;
}

export function CreateItemDialog({
  open,
  onOpenChange,
  businessId,
  categories,
  branches,
  editingItem,
}: CreateItemDialogProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  // General
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  // Configuración por sucursal (branch_items)
  const [branchConfig, setBranchConfig] = useState<Record<string, {
    isActiveInBranch: boolean;
    customPrice: string;
    isAvailable: boolean;
    trackInventory: boolean;
    stock: string;
    minStock: string;
    isCustom: boolean;
    customKinds: string[];
  }>>({});

  // Nueva categoría
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Cargar datos al editar
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setSku(editingItem.sku || "");
      setPrice(editingItem.price);
      setCategoryId(editingItem.categoryId || "");
      setDescription(editingItem.description || "");
      setIsActive(editingItem.isActive);
      
      // Cargar configuración de branch_items
      if (editingItem.branchItems && editingItem.branchItems.length > 0) {
        const config: Record<string, any> = {};
        editingItem.branchItems.forEach((bi: any) => {
          config[bi.branchId] = {
            isActiveInBranch: bi.isActiveInBranch ?? true,
            customPrice: bi.customPrice || "",
            isAvailable: bi.isAvailable ?? true,
            trackInventory: bi.trackInventory ?? false,
            stock: bi.stock || "0",
            minStock: bi.minStock || "0",
            isCustom: bi.isCustom ?? false,
            customKinds: (bi.customKinds as string[]) || [],
          };
        });
        setBranchConfig(config);
      }
    } else {
      // Resetear al crear nuevo
      setName("");
      setSku("");
      setPrice("");
      setCategoryId("");
      setDescription("");
      setIsActive(true);
      setBranchConfig({});
    }
  }, [editingItem, open]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const result = await createCategory({
      name: newCategoryName,
      businessId,
    });
    
    if (result.success && result.category) {
      setCategoryId(result.category.id);
      setNewCategoryName("");
      setShowNewCategory(false);
      window.location.reload(); // Recargar para actualizar categorías
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;

      if (editingItem) {
        // Actualizar item existente
        // Solo incluir sucursales donde isActiveInBranch = true
        const branchesData = branches
          .map(branch => {
            const config = branchConfig[branch.id] || {
              isActiveInBranch: false,
              customPrice: "",
              isAvailable: true,
              trackInventory: false,
              stock: "0",
              minStock: "0",
              isCustom: false,
              customKinds: [],
            };
            
            return {
              branchId: branch.id,
              isActiveInBranch: config.isActiveInBranch,
              customPrice: config.customPrice || undefined,
              isAvailable: config.isAvailable,
              trackInventory: config.trackInventory,
              stock: config.stock || undefined,
              minStock: config.minStock || undefined,
              isCustom: config.isCustom,
              customKinds: config.isCustom && config.customKinds.length > 0 ? config.customKinds : undefined,
            };
          })
          .filter(branch => branch.isActiveInBranch); // Solo sucursales activas

        result = await updateItem({
          itemId: editingItem.id,
          name,
          description,
          price,
          categoryId: categoryId || undefined,
          sku: sku || undefined,
          isActive,
          branchesData,
        });
      } else {
        // Crear nuevo item
        // Solo incluir sucursales donde isActiveInBranch = true
        const branchesData = branches
          .map(branch => {
            const config = branchConfig[branch.id] || {
              isActiveInBranch: false,
              customPrice: "",
              isAvailable: true,
              trackInventory: false,
              stock: "0",
              minStock: "0",
              isCustom: false,
              customKinds: [],
            };
            
            return {
              branchId: branch.id,
              isActiveInBranch: config.isActiveInBranch,
              customPrice: config.customPrice || undefined,
              isAvailable: config.isAvailable,
              trackInventory: config.trackInventory,
              stock: config.stock || undefined,
              minStock: config.minStock || undefined,
              isCustom: config.isCustom,
              customKinds: config.isCustom && config.customKinds.length > 0 ? config.customKinds : undefined,
            };
          })
          .filter(branch => branch.isActiveInBranch); // Solo sucursales activas

        result = await createItem({
          name,
          description,
          price,
          categoryId: categoryId || undefined,
          sku: sku || undefined,
          isActive,
          businessId,
          branchesData,
        });
      }

      if (result.success) {
        onOpenChange(false);
        window.location.reload();
      } else {
        alert(result.error || `Error al ${editingItem ? "actualizar" : "crear"} item`);
      }
    } catch (error) {
      console.error(`Error ${editingItem ? "updating" : "creating"} item:`, error);
      alert(`Error al ${editingItem ? "actualizar" : "crear"} item`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editingItem ? "Editar item" : "Crear item"}
          </DialogTitle>
          <DialogDescription>
            {editingItem 
              ? "Actualiza la información del item." 
              : "Define la información, dónde se vende, su inventario y sus variantes."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="sucursales">Sucursales</TabsTrigger>
            </TabsList>

            {/* TAB: GENERAL */}
            <TabsContent value="general" className="space-y-4 mt-4">
              {/* Imagen */}
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-sm font-medium">Imagen</Label>
                  <p className="text-xs text-muted-foreground">Click para subir imagen</p>
                </div>
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Ej. Café Americano"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* SKU y Precio */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="BEB-001"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Precio base <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label>Categoría</Label>
                {!showNewCategory ? (
                  <div className="flex gap-2">
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowNewCategory(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nueva categoría"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <Button type="button" onClick={handleCreateCategory}>
                      Crear
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowNewCategory(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Detalles, ingredientes, presentación..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>

              {/* Item activo */}
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="active" className="text-base font-medium">
                    Item activo
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Si está apagado, no aparece en el POS.
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={loading}
                />
              </div>
            </TabsContent>

            {/* TAB: SUCURSALES - Configuración completa por sucursal */}
            <TabsContent value="sucursales" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Configura precio, inventario y variantes para cada sucursal.
              </p>
              
              {branches.map((branch) => {
                const config = branchConfig[branch.id] || {
                  isActiveInBranch: false,
                  customPrice: "",
                  isAvailable: true,
                  trackInventory: false,
                  stock: "0",
                  minStock: "0",
                  isCustom: false,
                  customKinds: [],
                };

                return (
                  <div key={branch.id} className="space-y-4 p-4 rounded-lg border border-border bg-muted/20">
                    {/* Header con nombre y switch activo */}
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">{branch.name}</h4>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Activo en sucursal</Label>
                        <Switch
                          checked={config.isActiveInBranch}
                          onCheckedChange={(checked) =>
                            setBranchConfig({
                              ...branchConfig,
                              [branch.id]: { ...config, isActiveInBranch: checked },
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Solo mostrar configuración si está activo */}
                    {!config.isActiveInBranch && (
                      <p className="text-sm text-muted-foreground italic">
                        Este producto no está activo en esta sucursal
                      </p>
                    )}

                    {config.isActiveInBranch && (
                      <div className="space-y-4">

                    {/* Precio personalizado */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Precio personalizado</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={`Usar precio base $${price || "0"}`}
                        value={config.customPrice}
                        onChange={(e) =>
                          setBranchConfig({
                            ...branchConfig,
                            [branch.id]: { ...config, customPrice: e.target.value },
                          })
                        }
                      />
                    </div>

                    {/* Inventario */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Trackear inventario</Label>
                          <p className="text-xs text-muted-foreground">Descuenta stock con cada venta</p>
                        </div>
                        <Switch
                          checked={config.trackInventory}
                          onCheckedChange={(checked) =>
                            setBranchConfig({
                              ...branchConfig,
                              [branch.id]: { ...config, trackInventory: checked },
                            })
                          }
                        />
                      </div>

                      {config.trackInventory && (
                        <div className="grid grid-cols-2 gap-3 pl-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Stock actual</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0"
                              value={config.stock}
                              onChange={(e) =>
                                setBranchConfig({
                                  ...branchConfig,
                                  [branch.id]: { ...config, stock: e.target.value },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Stock mínimo</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0"
                              value={config.minStock}
                              onChange={(e) =>
                                setBranchConfig({
                                  ...branchConfig,
                                  [branch.id]: { ...config, minStock: e.target.value },
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Variantes */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Producto personalizable</Label>
                          <p className="text-xs text-muted-foreground">Activa para definir variantes</p>
                        </div>
                        <Switch
                          checked={config.isCustom}
                          onCheckedChange={(checked) =>
                            setBranchConfig({
                              ...branchConfig,
                              [branch.id]: { ...config, isCustom: checked },
                            })
                          }
                        />
                      </div>

                      {config.isCustom && (
                        <div className="space-y-3 pl-4">
                          <Label className="text-xs font-medium">Variantes</Label>
                          
                          {/* Input para agregar variantes */}
                          <Input
                            placeholder="Escribe y presiona Enter (ej. Cola, Manzana)"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const input = e.currentTarget;
                                const value = input.value.trim();
                                
                                if (value && !config.customKinds.includes(value)) {
                                  setBranchConfig({
                                    ...branchConfig,
                                    [branch.id]: {
                                      ...config,
                                      customKinds: [...config.customKinds, value],
                                    },
                                  });
                                  input.value = "";
                                }
                              }
                            }}
                            className="text-sm"
                          />

                          {/* Lista de badges */}
                          {config.customKinds.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {config.customKinds.map((variant, index) => (
                                <div
                                  key={index}
                                  className="group relative inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                                >
                                  <span>{variant}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newKinds = config.customKinds.filter((_, i) => i !== index);
                                      setBranchConfig({
                                        ...branchConfig,
                                        [branch.id]: { ...config, customKinds: newKinds },
                                      });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded">
                              Sin variantes. Escribe un nombre y presiona Enter.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>

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
                ? (editingItem ? "Actualizando..." : "Creando...") 
                : (editingItem ? "Actualizar item" : "Crear item")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
