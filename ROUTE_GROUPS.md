# 📁 Estructura de Route Groups - Dashboard

## 🎯 ¿Qué son los Route Groups?

Los **Route Groups** en Next.js te permiten organizar rutas bajo un layout común **sin afectar la URL**.

Se crean usando paréntesis: `(nombre-del-grupo)`

## 🏗️ Nueva Estructura

```
src/app/
├── (dashboard)/              ← Route Group (NO aparece en URL)
│   ├── layout.tsx           ← Layout con Sidebar + TopBar
│   ├── panel/
│   │   └── page.tsx         → URL: /panel
│   ├── branches/
│   │   └── page.tsx         → URL: /branches
│   ├── clientes/
│   │   └── page.tsx         → URL: /clientes
│   ├── empleados/
│   │   └── page.tsx         → URL: /empleados
│   ├── items/
│   │   └── page.tsx         → URL: /items
│   ├── categorias/
│   │   └── page.tsx         → URL: /categorias
│   ├── descuentos/
│   │   └── page.tsx         → URL: /descuentos
│   └── ofertas/
│       └── page.tsx         → URL: /ofertas
├── login/
│   └── page.tsx             → URL: /login (SIN layout)
├── register/
│   └── page.tsx             → URL: /register (SIN layout)
└── page.tsx                 → URL: / (landing, SIN layout)
```

## ✨ Ventajas

### 1. URLs Limpias
```
❌ ANTES: /dashboard/panel
✅ AHORA:  /panel

❌ ANTES: /dashboard/branches
✅ AHORA:  /branches
```

### 2. Layout Compartido
Todas las rutas dentro de `(dashboard)` comparten:
- ✅ Sidebar
- ✅ TopBar
- ✅ Autenticación
- ✅ Estilos comunes

### 3. Organización Clara
```
(dashboard)/     ← Rutas autenticadas con sidebar
login/           ← Rutas públicas sin sidebar
register/        ← Rutas públicas sin sidebar
```

## 🔄 Cómo Funciona

### 1. El usuario navega a `/panel`

```
1. Next.js busca: src/app/(dashboard)/panel/page.tsx
2. Aplica layout: src/app/(dashboard)/layout.tsx
3. Renderiza: Sidebar + TopBar + Contenido de panel
4. URL mostrada: /panel (sin "(dashboard)")
```

### 2. El usuario navega a `/branches`

```
1. Next.js busca: src/app/(dashboard)/branches/page.tsx
2. Aplica layout: src/app/(dashboard)/layout.tsx (MISMO layout)
3. Renderiza: Sidebar + TopBar + Contenido de branches
4. URL mostrada: /branches
```

### 3. El usuario navega a `/login`

```
1. Next.js busca: src/app/login/page.tsx
2. NO aplica layout de (dashboard)
3. Renderiza: Solo el contenido de login
4. URL mostrada: /login
```

## 📋 Menú del Sidebar

```typescript
const menuItems = [
  {
    title: "General",
    items: [
      { icon: LayoutGrid, label: "Resumen", href: "/panel" },
    ],
  },
  {
    title: "Operación",
    items: [
      { icon: Store, label: "Sucursales", href: "/branches" },
      { icon: Users, label: "Clientes", href: "/clientes" },
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
```

## 🚀 Agregar Nueva Ruta al Dashboard

Para agregar una nueva ruta con sidebar:

```bash
# 1. Crear carpeta dentro de (dashboard)
mkdir src/app/\(dashboard\)/nueva-ruta

# 2. Crear page.tsx
touch src/app/\(dashboard\)/nueva-ruta/page.tsx
```

```typescript
// src/app/(dashboard)/nueva-ruta/page.tsx
export default async function NuevaRutaPage() {
  return (
    <div className="p-6">
      <h1>Nueva Ruta</h1>
    </div>
  );
}
```

**¡Automáticamente tendrá Sidebar + TopBar!**

## 🔒 Proteger Rutas

Puedes agregar middleware de autenticación en el layout:

```typescript
// src/app/(dashboard)/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar + TopBar + children */}
    </div>
  );
}
```

## 📝 Resumen

- ✅ `(dashboard)` NO aparece en la URL
- ✅ Todas las rutas dentro comparten el layout
- ✅ URLs limpias: `/panel`, `/branches`, etc.
- ✅ Fácil agregar nuevas rutas
- ✅ Sidebar y TopBar automáticos
- ✅ Autenticación centralizada

¡Ahora puedes crear todas las rutas que necesites dentro de `(dashboard)` y automáticamente tendrán el sidebar! 🎉
