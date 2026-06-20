"use client";
import { 
  LayoutGrid, 
  Store, 
  Users, 
  UserCog, 
  Package, 
  Grid3x3, 
  Tag, 
  Percent,
  LogOut,
  Wind,
  ShoppingCart,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";

interface BranchConfig {
  hasPos?: boolean;
  hasKitchen?: boolean;
  hasDelivery?: boolean;
  hasCustomers?: boolean;
}

interface AppSidebarProps {
  session: Session;
  onClose?: () => void;
  branchConfig?: BranchConfig;
}

const getMenuItems = (session: Session, branchConfig?: BranchConfig) => {
  const isOwner = session.user.isOwner || session.user.isEmployeeOwner;
  const isManager = session.user.isManager;

  return [
    {
      title: "General",
      items: [
        { icon: LayoutGrid, label: "Resumen", href: "/panel" },
        ...(branchConfig?.hasPos !== false ? [{ icon: ShoppingCart, label: "Punto de venta", href: "/pos" }] : []),
        { icon: BarChart3, label: "Reportes", href: "/reportes" },
      ],
    },
    {
      title: "Operación",
      items: [
        // Solo dueños ven Sucursales
        ...(isOwner ? [{ icon: Store, label: "Sucursales", href: "/branches" }] : []),
        ...(branchConfig?.hasCustomers !== false ? [{ icon: Users, label: "Clientes", href: "/clientes" }] : []),
        { icon: UserCog, label: "Empleados", href: "/empleados" },
      ],
    },
    {
      title: "Catálogo",
      items: [
        { icon: Package, label: "Items", href: "/items" },
        { icon: Grid3x3, label: "Categorías", href: "/categorias" },
        { icon: Tag, label: "Descuentos", href: "/descuentos" },
        { icon: Percent, label: "Ofertas", href: "/ofertas" },
      ],
    },
  ];
};

export function AppSidebar({ session, onClose, branchConfig }: AppSidebarProps) {
  const pathname = usePathname();
  const menuItems = getMenuItems(session, branchConfig);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <aside className="w-[280px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/panel" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-warm text-primary-foreground">
            {/* <Wind className="h-5 w-5" /> */}
            <img src="/assets/logo-white.png" alt="Nuvly" className="h-7 w-7" />
          </div>
          <span className="font-display text-xl text-sidebar-foreground">Nuvly</span>
          {/* <img src="/assets/logocompleto-black.png" alt="Nuvly" className="h-16 w-auto" /> */}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {menuItems.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onClose?.()}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all w-full"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
