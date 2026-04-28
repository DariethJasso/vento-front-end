# 🔧 Fix: Error en Registro

## ❌ Problema Identificado

El campo `businesses.name` estaba marcado como `notNull()` en el schema, pero el API podía enviar `null`.

## ✅ Solución Aplicada

### 1. Schema Actualizado
- ✅ Removido `.notNull()` de `businesses.name`
- ✅ Ahora es opcional

### 2. API Mejorado
- ✅ Usa el nombre del negocio si se proporciona
- ✅ Si no, usa el nombre del usuario
- ✅ Si tampoco, usa "Mi Negocio" como default
- ✅ Mejor manejo de errores con detalles

### 3. Formulario
- ✅ Ya incluye campo "Negocio"
- ✅ Campo requerido en el frontend

## 🚀 Aplicar el Fix

### Paso 1: Generar Nueva Migración

```bash
npm run db:generate
```

Esto creará un archivo de migración que cambia `businesses.name` de `NOT NULL` a nullable.

### Paso 2: Aplicar Migración

```bash
npm run db:migrate
```

### Paso 3: Probar Registro

```bash
# 1. Ir a /register
# 2. Llenar todos los campos:
#    - Nombre: Tu nombre
#    - Negocio: Nombre del negocio
#    - Email: tu@email.com
#    - Contraseña: mínimo 8 caracteres
# 3. Click en "Crear cuenta gratis"
# 4. Debe crear: user + business + employee
# 5. Debe redirigir a /backoffice
```

## 🔍 Verificar que Funcionó

### En la Terminal del Servidor

Deberías ver logs como:
```
POST /api/auth/register 201
```

### En el Navegador

1. Debe redirigir a `/backoffice`
2. Debe mostrar:
   - Tu nombre
   - Nombre del negocio
   - Rol: "Dueño"

### En la Base de Datos

```bash
npm run db:studio
```

Verifica que se crearon:
- ✅ 1 registro en `users`
- ✅ 1 registro en `businesses`
- ✅ 1 registro en `employees`

## 🐛 Si Aún Hay Errores

### Ver Error Detallado

Abre la consola del navegador (F12) y ve a la pestaña "Network":
1. Busca la petición a `/api/auth/register`
2. Click en ella
3. Ve a "Response"
4. Verás el error detallado con `details` y `stack`

### Errores Comunes

**Error: "relation businesses does not exist"**
```bash
# Ejecutar migración
npm run db:migrate
```

**Error: "column businesses.name does not exist"**
```bash
# Regenerar y aplicar migración
npm run db:generate
npm run db:migrate
```

**Error: "duplicate key value violates unique constraint"**
```bash
# El email ya existe, usa otro email
```

## 📝 Cambios Realizados

### `src/app/db/schema.ts`
```typescript
// Antes
name: text("name").notNull(),

// Después
name: text("name"),
```

### `src/app/api/auth/register/route.ts`
```typescript
// Ahora usa fallback
const businessName = business || name || "Mi Negocio";

// Mejor manejo de errores
catch (error) {
  console.error("Error al registrar usuario:", error);
  const errorMessage = error instanceof Error ? error.message : "Error al crear usuario";
  return NextResponse.json({
    error: "Error al crear usuario",
    details: errorMessage,
    stack: process.env.NODE_ENV === "development" ? ... : undefined
  }, { status: 500 });
}
```

## ✅ Resultado Esperado

Después de aplicar el fix:

```
Usuario registra → 
  ✅ Crea user
  ✅ Crea business (con nombre del negocio o fallback)
  ✅ Crea employee (rol: dueño)
  ✅ Auto-login
  ✅ Redirección a /backoffice
  ✅ Muestra toda la información
```

¡Listo! El registro debe funcionar correctamente ahora. 🎉
