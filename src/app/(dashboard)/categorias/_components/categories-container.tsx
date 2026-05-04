"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { Session } from "next-auth";
import { deleteCategory } from "@/app/actions/categories";
import { CreateCategoryDialog } from "@/components/categories/create-category-dialog";
import { CategoryCard } from "@/components/categories/category-card";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface CategoriesContainerProps {
  session: Session;
  categories: Category[];
}

export default function CategoriesContainer({ session, categories }: CategoriesContainerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCategory({ categoryId });
      
      if (result.success) {
        // La página se recargará automáticamente por revalidatePath
      } else {
        alert(result.error || "Error al eliminar categoría");
      }
    });
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingCategory(null);
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">
            Categorías
          </h1>
          <p className="text-muted-foreground">
            Organiza tu catálogo de productos.
          </p>
        </div>
        <div>
          <Button
            size="lg"
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>
      </div>

      {/* Grid de categorías */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No tienes categorías registradas
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear primera categoría
          </Button>
        </div>
      )}

      <CreateCategoryDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        businessId={session.user.businessId!}
        editingCategory={editingCategory}
      />
    </>
  );
}
