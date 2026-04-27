# 🚀 Guía de Instalación - Vento POS

## 📦 Paso 1: Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias incluyendo:
- `next-auth` - Autenticación
- `bcryptjs` - Hash de contraseñas
- `@auth/drizzle-adapter` - Adapter de Drizzle para NextAuth
- `drizzle-orm` - ORM para PostgreSQL
- `postgres` - Cliente de PostgreSQL

## 🗄️ Paso 2: Configurar Base de Datos

### 2.1 Crear Base de Datos PostgreSQL

```sql
CREATE DATABASE vento_pos;
```

### 2.2 Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/vento_pos"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-super-seguro-aqui"
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

## 🔄 Paso 3: Ejecutar Migraciones

### Opción A: Usar Migraciones (RECOMENDADO para producción)

```bash
# 1. Generar archivos de migración
npm run db:generate

# 2. Aplicar migraciones
npm run db:migrate
```

### Opción B: Push Directo (solo para desarrollo)

```bash
npm run db:push
```

**Nota:** Si obtienes el error `.replace is not a function`, usa la Opción A en su lugar.

## ✅ Paso 4: Verificar Instalación

```bash
# Abrir Drizzle Studio para ver las tablas
npm run db:studio
```

Esto abrirá `https://local.drizzle.studio` donde podrás ver todas las tablas creadas.

## 🏃 Paso 5: Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📋 Estructura de Archivos Creados

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.ts          # Rutas de NextAuth
│   │       └── register/
│   │           └── route.ts          # API de registro
│   ├── db/
│   │   ├── schema.ts                 # Esquema de base de datos
│   │   └── index.ts                  # Cliente de Drizzle
│   ├── login/
│   │   └── page.tsx                  # Página de login
│   ├── register/
│   │   └── page.tsx                  # Página de registro
│   └── layout.tsx                    # Layout principal
├── components/
│   ├── auth/
│   │   └── auth-layout.tsx           # Layout de autenticación
│   └── providers/
│       └── session-provider.tsx      # Proveedor de sesión
├── lib/
│   └── auth.ts                       # Configuración de NextAuth
└── types/
    └── next-auth.d.ts                # Tipos de NextAuth

drizzle.config.ts                     # Configuración de Drizzle
```

## 🧪 Probar la Autenticación

### 1. Crear una cuenta

Navega a `http://localhost:3000/register` y crea una cuenta de prueba.

### 2. Iniciar sesión

Navega a `http://localhost:3000/login` e inicia sesión con las credenciales creadas.

### 3. Verificar sesión

La sesión se guardará automáticamente y el usuario será redirigido a `/dashboard`.

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev                  # Iniciar servidor de desarrollo

# Base de datos
npm run db:generate          # Generar migraciones
npm run db:migrate           # Aplicar migraciones
npm run db:push              # Push directo (sin migraciones)
npm run db:studio            # Abrir Drizzle Studio

# Producción
npm run build                # Construir para producción
npm run start                # Iniciar servidor de producción
```

## ⚠️ Solución de Problemas Comunes

### Error: "Cannot find module 'next-auth'"

Los módulos se instalarán cuando ejecutes `npm install`. Los errores de TypeScript desaparecerán después de la instalación.

### Error: "DATABASE_URL is not defined"

Asegúrate de que el archivo `.env.local` existe y tiene la variable `DATABASE_URL` configurada correctamente.

### Error: ".replace is not a function" en db:push

Este error ocurre por incompatibilidad de versiones. Usa `npm run db:migrate` en su lugar.

### Error: "relation does not exist"

Las tablas no se han creado. Ejecuta:
```bash
npm run db:migrate
```

### Error de conexión a PostgreSQL

1. Verifica que PostgreSQL está corriendo
2. Verifica las credenciales en `DATABASE_URL`
3. Verifica que la base de datos `vento_pos` existe

## 📚 Recursos Adicionales

- [Documentación de NextAuth](https://next-auth.js.org/)
- [Documentación de Drizzle ORM](https://orm.drizzle.team/)
- [Documentación de Next.js](https://nextjs.org/docs)

## 🔐 Seguridad

- ✅ Las contraseñas se hashean con bcrypt (10 rounds)
- ✅ Las sesiones usan JWT firmados
- ✅ CSRF protection habilitado por defecto
- ✅ Variables de entorno nunca se commitean

## 📝 Próximos Pasos

1. Personaliza las páginas de login y registro
2. Crea middleware para proteger rutas
3. Implementa la página de dashboard
4. Configura roles y permisos
5. Agrega recuperación de contraseña

¡Listo! Tu sistema de autenticación está configurado y funcionando. 🎉
