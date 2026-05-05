import { redirect } from "next/navigation";
import { Store, Users, Package, TrendingUp, ShoppingCart, ChefHat, Bike, ArrowRight } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import ShiftManager from "./_components/shift-manager";
import { getActiveShift } from "@/app/actions/shifts";

async function getStats() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/panel/stats`, {
      cache: "no-store", // Siempre obtener datos frescos
    });

    if (!response.ok) {
      throw new Error("Error al obtener estadísticas");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Retornar datos por defecto en caso de error
    return {
      sucursales: { value: "0", subtitle: "+0 este mes" },
      clientes: { value: "0", subtitle: "+0 esta semana" },
      items: { value: "0", subtitle: "0 categorías" },
      ventas: { value: "$0", subtitle: "+0% vs ayer" },
    };
  }
}

export default async function Page() {
  
  const session = await getServerSession(authOptions);

  console.log(session);

  if (!session) {
    redirect("/login");
  }

  const statsData = await getStats();

  // Obtener shift activo si el usuario es gerente
  const isManager = session.user?.isManager || session.user?.isEmployeeOwner || session.user?.isOwner;
  const branchId = session.user?.branchId;
  let activeShift = null;
  
  if (isManager && branchId) {
    activeShift = await getActiveShift({ branchId });
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
              Este es el resumen de tu negocio en Vento.
            </p>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              href="/pos"
              className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:shadow-lg transition-all"
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

            <Link
              href="/cocina"
              className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:shadow-lg transition-all"
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

            <Link
              href="/delivery"
              className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white hover:shadow-lg transition-all"
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

          {/* Next Steps Card */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <h2 className="font-display text-2xl text-foreground mb-3">
              Próximos pasos
            </h2>
            <p className="text-muted-foreground">
              Configura tus sucursales, sube tu catálogo de items y agrega a tu equipo para
              comenzar a operar con Vento.
            </p>
          </div>
    </div>
  );
}
