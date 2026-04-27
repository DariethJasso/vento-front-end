# Configuración de Base de Datos y Autenticación

## 📋 Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL instalado y corriendo
- Una base de datos PostgreSQL creada

## 🚀 Pasos de Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/vento_pos"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-un-secret-seguro-aqui"
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Generar y Aplicar Migraciones

```bash
# Generar migraciones basadas en el esquema
npm run db:generate

# Aplicar migraciones a la base de datos (RECOMENDADO)
npm run db:migrate

# O usar push directo (para desarrollo rápido)
npm run db:push
```

### 4. Verificar la Base de Datos

Puedes usar Drizzle Studio para ver tus tablas:

```bash
npm run db:studio
```

Esto abrirá una interfaz web en `https://local.drizzle.studio`

## 📊 Estructura de Tablas Creadas

### Autenticación
- `users` - Usuarios del sistema
- `sessions` - Sesiones activas
- `verification_tokens` - Tokens de verificación

### Negocio
- `businesses` - Negocios/empresas
- `branches` - Sucursales
- `branches_config` - Configuración de sucursales
- `employees` - Empleados

### Inventario
- `items` - Productos/items
- `branch_items` - Inventario por sucursal
- `categories` - Categorías de productos
- `inventory_logs` - Historial de inventario

### Ventas
- `tickets` - Tickets/órdenes
- `ticket_items` - Items en tickets
- `shifts` - Turnos de caja

### Cocina
- `kitchen` - Estaciones de cocina
- `kitchen_products` - Productos en cocina

### Clientes y Promociones
- `customers` - Clientes
- `discounts` - Descuentos
- `offers` - Ofertas/paquetes

### Estadísticas
- `branch_stats_daily` - Estadísticas diarias por sucursal
- `product_stats_daily` - Estadísticas diarias por producto

### Planes
- `plans_info` - Información de planes
- `plans_payments` - Pagos de planes
- `taxes` - Impuestos

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Generar migraciones
npm run db:generate

# Aplicar migraciones
npm run db:migrate

# Push directo (sin migraciones)
npm run db:push

# Abrir Drizzle Studio
npm run db:studio
```

## ⚠️ Solución de Problemas

### Error: "relation does not exist"
- Asegúrate de haber ejecutado las migraciones: `npm run db:migrate`

### Error: ".replace is not a function" en db:push
- Esto ocurre por incompatibilidad de versiones
- Usa `npm run db:migrate` en lugar de `db:push`
- O actualiza drizzle-kit: `npm install drizzle-kit@latest`

### Error: "DATABASE_URL is not defined"
- Verifica que el archivo `.env.local` existe
- Verifica que DATABASE_URL está correctamente configurado
- Reinicia el servidor de desarrollo

### Error de conexión a PostgreSQL
- Verifica que PostgreSQL está corriendo
- Verifica las credenciales en DATABASE_URL
- Verifica que la base de datos existe

## 🔐 Uso de Autenticación

### Registro de Usuario

```typescript
// POST /api/auth/register
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@ejemplo.com',
    password: 'contraseña123',
    name: 'Nombre Usuario'
  })
});
```

### Login

```typescript
import { signIn } from 'next-auth/react';

await signIn('credentials', {
  email: 'usuario@ejemplo.com',
  password: 'contraseña123',
  redirect: true,
  callbackUrl: '/dashboard'
});
```

### Obtener Sesión

```typescript
import { useSession } from 'next-auth/react';

function Component() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') return <div>Cargando...</div>;
  if (status === 'unauthenticated') return <div>No autenticado</div>;
  
  return <div>Hola {session?.user?.name}</div>;
}
```

### Logout

```typescript
import { signOut } from 'next-auth/react';

await signOut({ callbackUrl: '/' });
```

## 📝 Notas Importantes

1. **Nunca** commitees el archivo `.env.local`
2. Usa `db:migrate` para producción, `db:push` solo para desarrollo
3. Las contraseñas se hashean automáticamente con bcrypt
4. Las sesiones usan JWT por defecto (sin base de datos)
5. El adapter de Drizzle está configurado pero las sesiones son JWT

## 🔄 Flujo de Migración Recomendado

1. Modifica `src/app/db/schema.ts`
2. Ejecuta `npm run db:generate` para crear la migración
3. Revisa el archivo de migración en `drizzle/`
4. Ejecuta `npm run db:migrate` para aplicar
5. Verifica con `npm run db:studio`
