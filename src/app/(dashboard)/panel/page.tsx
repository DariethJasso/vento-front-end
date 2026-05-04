import { redirect } from "next/navigation";
import { Store, Users, Package, TrendingUp } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
