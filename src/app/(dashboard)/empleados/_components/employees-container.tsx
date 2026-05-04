"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Pencil, Users, Shield, CreditCard, ChefHat, Truck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CreateEmployeeDialog from "@/components/employees/create-employee-dialog";

interface Employee {
  id: string;
  branchId: string;
  userId: string;
  firstName: string;
  lastName: string;
  isOwner: boolean;
  isManager: boolean;
  isCashier: boolean;
  isKitchen: boolean;
  isDelivery: boolean;
  isWaiter: boolean;
  isActive: boolean;
  createdAt: Date;
  user: {
    id: string;
    email: string;
  };
}

interface Branch {
  id: string;
  name: string;
}

interface EmployeesContainerProps {
  session: any;
  employees: Employee[];
  branches: Branch[];
}

export default function EmployeesContainer({ session, employees, branches }: EmployeesContainerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingEmployee(null);
  };

  const filteredEmployees = employees.filter((employee) =>
    `${employee.firstName} ${employee.lastName} ${employee.user.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const getRoles = (employee: Employee) => {
    const roles = [];
    if (employee.isOwner) roles.push("Dueño");
    if (employee.isManager) roles.push("Gerente");
    if (employee.isCashier) roles.push("Cajero");
    if (employee.isKitchen) roles.push("Cocina");
    if (employee.isDelivery) roles.push("Repartidor");
    if (employee.isWaiter) roles.push("Mesero");
    return roles;
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Empleados</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu equipo de trabajo
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="rounded-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo empleado
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Employees List */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              {searchQuery ? "No se encontraron empleados" : "No hay empleados"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {searchQuery
                ? "Intenta con otro término de búsqueda"
                : "Comienza agregando tu primer empleado"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primer empleado
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Nombre</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Roles</th>
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Estado</th>
                  <th className="text-right p-4 text-sm font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEmployees.map((employee) => {
                  const roles = getRoles(employee);
                  return (
                    <tr
                      key={employee.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                            {employee.firstName[0]}{employee.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {employee.firstName} {employee.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground">
                          {employee.user.email}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {roles.map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                          {roles.length === 0 && (
                            <span className="text-sm text-muted-foreground">Sin roles</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={employee.isActive ? "default" : "secondary"}
                          className={employee.isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}
                        >
                          {employee.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(employee)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateEmployeeDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        branches={branches}
        editingEmployee={editingEmployee}
      />
    </div>
  );
}
