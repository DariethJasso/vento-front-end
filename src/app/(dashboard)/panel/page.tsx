import { redirect } from "next/navigation";
import { Store, Users, Package, TrendingUp, ShoppingCart, ChefHat, Bike, ArrowRight, Home } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import ShiftManager from "./_components/shift-manager";
import { getActiveShift } from "@/app/actions/shifts";
import { getBranchConfig } from "@/app/actions/branches";
import { getDashboardStats } from "@/app/actions/dashboard";
import { getBranches } from "@/app/actions/branches";
import { getCustomers } from "@/app/actions/customers";
import { getItems } from "@/app/actions/items";
import { getBusiness } from "@/app/actions/business";
import { BusinessLogoEditor } from "@/components/business/business-logo-editor";

async function getStats(businessId: string) {
  try {
    // Obtener estadísticas del dashboard
    const dashboardResult = await getDashboardStats({
      businessId,
      startDate: new Date(new Date().setHours(0, 0, 0, 0)), // Hoy desde las 00:00
    });

    // Obtener conteos básicos
    const branches = await getBranches({ businessId });
    const customers = await getCustomers({ businessId });
    const items = await getItems({ businessId });

    const stats = dashboardResult.success ? dashboardResult.stats : null;

    return {
      sucursales: { 
        value: branches.length.toString(), 
        subtitle: "+0 este mes" 
      },
      clientes: { 
        value: (stats?.uniqueCustomers || customers.length).toString(), 
        subtitle: "+0 esta semana" 
      },
      items: { 
        value: items.length.toString(), 
        subtitle: "0 categorías" 
      },
      ventas: { 
        value: `$${(stats?.totalSales || 0).toFixed(2)}`, 
        subtitle: "+0% vs ayer" 
      },
      ticketsByType: stats?.ticketsByType || {},
      totalTickets: stats?.totalTickets || 0,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      sucursales: { value: "0", subtitle: "+0 este mes" },
      clientes: { value: "0", subtitle: "+0 esta semana" },
      items: { value: "0", subtitle: "0 categorías" },
      ventas: { value: "$0", subtitle: "+0% vs ayer" },
      ticketsByType: {},
      totalTickets: 0,
    };
  }
}

export default async function Page() {
  
  const session = await getServerSession(authOptions);

  console.log(session);

  if (!session || !session.user.businessId) {
    redirect("/login");
  }

  const statsData = await getStats(session.user.businessId);

  // Obtener información del negocio
  const businessResult = await getBusiness({ businessId: session.user.businessId });
  const business = businessResult.success ? businessResult.business : null;

  // Obtener shift activo si el usuario es gerente
  const isManager = session.user?.isManager || session.user?.isEmployeeOwner || session.user?.isOwner;
  const isOwner = session.user?.isOwner || session.user?.isEmployeeOwner;
  const branchId = session.user?.branchId;
  let activeShift = null;
  
  if (isManager && branchId) {
    activeShift = await getActiveShift({ branchId });
  }

  // Obtener configuración de la sucursal
  let branchConfig = {
    hasPos: true,
    hasKitchen: false,
    hasDelivery: false,
  };

  if (branchId) {
    const configResult = await getBranchConfig(branchId);
    if (configResult.success && configResult.config) {
      branchConfig = {
        hasPos: configResult.config.hasPos ?? true,
        hasKitchen: configResult.config.hasKitchen ?? false,
        hasDelivery: configResult.config.hasDelivery ?? false,
      };
    }
  }

  const stats = [
    {
      title: "SUCURSALES",
      value: statsData.sucursales.value,
      subtitle: statsData.sucursales.subtitle,
      icon: Store,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "CLIENTES",
      value: statsData.clientes.value,
      subtitle: statsData.clientes.subtitle,
      icon: Users,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "ITEMS ACTIVOS",
      value: statsData.items.value,
      subtitle: statsData.items.subtitle,
      icon: Package,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "VENTAS HOY",
      value: statsData.ventas.value,
      subtitle: statsData.ventas.subtitle,
      icon: TrendingUp,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-display text-4xl text-foreground mb-2">
              Hola de nuevo {session.user?.name} 👋
            </h1>
            <p className="text-muted-foreground">
              Este es el resumen de tu negocio en Nuvly.
            </p>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {branchConfig.hasPos ? (
              <Link
                href="/pos"
                className="group relative overflow-hidden bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                    <ShoppingCart className="h-7 w-7" />
                  </div>
                  <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Punto de venta</h3>
                <p className="text-sm text-white/80">Crear y cobrar tickets</p>
              </Link>
            ) : (
              <div className="relative overflow-hidden bg-muted rounded-2xl p-6 opacity-50 cursor-not-allowed">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted-foreground/20">
                    <ShoppingCart className="h-7 w-7 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-1 text-muted-foreground">Punto de venta</h3>
                <p className="text-sm text-muted-foreground">Módulo deshabilitado</p>
              </div>
            )}

            {branchConfig.hasKitchen ? (
              <Link
                href="/cocina"
                className="group relative overflow-hidden bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                    <ChefHat className="h-7 w-7" />
                  </div>
                  <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Panel de cocina</h3>
                <p className="text-sm text-white/80">Ver órdenes en preparación</p>
              </Link>
            ) : (
              <div className="relative overflow-hidden bg-muted rounded-2xl p-6 opacity-50 cursor-not-allowed">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted-foreground/20">
                    <ChefHat className="h-7 w-7 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-1 text-muted-foreground">Panel de cocina</h3>
                <p className="text-sm text-muted-foreground">Módulo deshabilitado</p>
              </div>
            )}

            {branchConfig.hasDelivery ? (
              <Link
                href="/delivery"
                className="group relative overflow-hidden bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                    <Bike className="h-7 w-7" />
                  </div>
                  <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Panel de delivery</h3>
                <p className="text-sm text-white/80">Pedidos a domicilio en mapa</p>
              </Link>
            ) : (
              <div className="relative overflow-hidden bg-muted rounded-2xl p-6 opacity-50 cursor-not-allowed">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted-foreground/20">
                    <Bike className="h-7 w-7 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-1 text-muted-foreground">Panel de delivery</h3>
                <p className="text-sm text-muted-foreground">Módulo deshabilitado</p>
              </div>
            )}
          </div>

          {/* Shift Manager - Solo para gerentes */}
          {isManager && branchId && (
            <div className="mb-8">
              <ShiftManager 
                branchId={branchId}
                userId={session.user?.id || ""}
                activeShift={activeShift}
              />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-soft transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {stat.title}
                      </p>
                      <h3 className="font-display text-3xl text-foreground">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stat.subtitle}
                      </p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tickets por Tipo */}
          {statsData.totalTickets > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 mb-8">
              <h2 className="font-display text-xl text-foreground mb-4">
                Tickets por Tipo de Orden (Hoy)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Comer Aquí</p>
                    <p className="text-2xl font-semibold">
                      {statsData.ticketsByType?.dine_in?.count || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${(statsData.ticketsByType?.dine_in?.total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Para Llevar</p>
                    <p className="text-2xl font-semibold">
                      {statsData.ticketsByType?.pick_up?.count || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${(statsData.ticketsByType?.pick_up?.total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                    <Bike className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery</p>
                    <p className="text-2xl font-semibold">
                      {statsData.ticketsByType?.delivery?.count || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${(statsData.ticketsByType?.delivery?.total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Logo Editor - Solo para owners */}
          {isOwner && business && (
            <div className="mb-8">
              <BusinessLogoEditor
                businessId={session.user.businessId}
                currentLogo={business.logoUrl}
              />
            </div>
          )}

          {/* Next Steps Card */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <h2 className="font-display text-2xl text-foreground mb-3">
              Próximos pasos
            </h2>
            <p className="text-muted-foreground">
              Configura tus sucursales, sube tu catálogo de items y agrega a tu equipo para
              comenzar a operar con Nuvly.
            </p>
          </div>
    </div>
  );
}
