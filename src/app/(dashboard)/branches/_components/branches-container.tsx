"use client";

import { CreateBranchDialog } from "@/components/branches/create-branch-dialog";
import { BranchCard } from "@/components/branches/branch-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { Session } from "next-auth";
import { deleteBranch } from "@/app/actions/branches";

interface Branch {
  id: string;
  name: string;
  address: string | null;
  phoneNumbers: string[] | null;
}

interface BranchesContainerProps {
  session: Session;
  branches: Branch[];
}

export default function BranchesContainer({ session, branches }: BranchesContainerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleEdit = (branchId: string) => {
    // TODO: Implementar edición
    console.log("Editar sucursal:", branchId);
  };

  const handleDelete = async (branchId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta sucursal?")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBranch({ branchId });
      
      if (result.success) {
        // La página se recargará automáticamente por revalidatePath
      } else {
        alert(result.error || "Error al eliminar sucursal");
      }
    });
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-foreground mb-2">
            Sucursales
          </h1>
          <p className="text-muted-foreground">
            Administra los puntos de venta de tu negocio.
          </p>
        </div>
        <div>
          <Button
            size="lg"
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Sucursal
          </Button>
        </div>
      </div>

      {/* Grid de sucursales */}
      {branches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No tienes sucursales registradas
          </p>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear primera sucursal
          </Button>
        </div>
      )}

      <CreateBranchDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
}