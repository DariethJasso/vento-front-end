"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface UserData {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  business: {
    id: string;
    name: string;
    plan: string;
    isPro: boolean;
  } | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    isOwner: boolean;
    isManager: boolean;
    isCashier: boolean;
    isKitchen: boolean;
    isDelivery: boolean;
    isWaiter: boolean;
  } | null;
}

export default function BackOfficePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoles = () => {
    if (!userData?.employee) return [];
    const roles = [];
    if (userData.employee.isOwner) roles.push("Dueño");
    if (userData.employee.isManager) roles.push("Gerente");
    if (userData.employee.isCashier) roles.push("Cajero");
    if (userData.employee.isKitchen) roles.push("Cocina");
    if (userData.employee.isDelivery) roles.push("Repartidor");
    if (userData.employee.isWaiter) roles.push("Mesero");
    return roles;
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const roles = getRoles();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl text-foreground">
              Vento POS - Back Office
            </h1>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="default"
              className="rounded-full"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl text-foreground mb-8">
            Bienvenido al Panel de Administración
          </h2>

          <div className="grid gap-6">
            {/* Información del Usuario */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground mb-1">
                    Información del Usuario
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Nombre:</span>
                      <span className="font-medium text-foreground">
                        {userData?.user?.name || session.user.name || "Sin nombre"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium text-foreground">
                        {userData?.user?.email || session.user.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {userData?.user?.id || session.user.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Negocio */}
            {userData?.business && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 shrink-0">
                    <Building2 className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      Información del Negocio
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Nombre:</span>
                        <span className="font-medium text-foreground">
                          {userData.business.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {userData.business.plan.toUpperCase()}
                          {userData.business.isPro && " PRO"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {userData.business.id}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Roles del Usuario */}
            {userData?.employee && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 shrink-0">
                    <Shield className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      Roles y Permisos
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Empleado:</span>
                        <span className="font-medium text-foreground">
                          {userData.employee.firstName} {userData.employee.lastName}
                        </span>
                      </div>
                      {roles.length > 0 && (
                        <div>
                          <span className="text-muted-foreground mb-2 block">Roles:</span>
                          <div className="flex flex-wrap gap-2">
                            {roles.map((role) => (
                              <span
                                key={role}
                                className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-warm text-primary-foreground text-xs font-medium"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Estado de Carga */}
            {!userData?.business && !loading && (
              <div className="bg-muted/50 border border-border rounded-2xl p-6 text-center">
                <p className="text-muted-foreground">
                  No se encontró información del negocio. Por favor, contacta al administrador.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
