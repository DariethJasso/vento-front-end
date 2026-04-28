# 🔐 Solución de Problemas de Sesión

## ✅ Configuración Implementada

### 1. Middleware (`src/middleware.ts`)
- ✅ Protege rutas privadas (`/backoffice`)
- ✅ Redirige a `/backoffice` si ya está autenticado
- ✅ Redirige a `/login` si no está autenticado

### 2. Configuración de Sesión (`src/lib/auth.ts`)
- ✅ JWT con duración de 30 días
- ✅ Cookies configuradas con `httpOnly` y `sameSite`
- ✅ Debug habilitado en desarrollo

### 3. Navbar Inteligente
- ✅ Detecta si hay sesión activa
- ✅ Muestra "Ir al Panel" si está logueado
- ✅ Muestra "Iniciar sesión" si no está logueado

## 🔍 Verificar que la Sesión Funciona

### 1. Verificar Variables de Entorno

Asegúrate de tener en `.env.local`:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secret-aqui"
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2. Verificar Cookies en el Navegador

1. Abre DevTools (F12)
2. Ve a "Application" → "Cookies"
3. Busca `next-auth.session-token`
4. Debe tener:
   - ✅ HttpOnly: true
   - ✅ SameSite: Lax
   - ✅ Path: /
   - ✅ Expires: 30 días desde ahora

### 3. Verificar Sesión en Consola

En cualquier página, abre la consola y ejecuta:

```javascript
// Ver sesión actual
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

Debe retornar:
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "name": "..."
  },
  "expires": "..."
}
```

## 🐛 Problemas Comunes

### ❌ La sesión no persiste al recargar

**Causa:** NEXTAUTH_SECRET no está configurado o es diferente

**Solución:**
```bash
# 1. Generar nuevo secret
openssl rand -base64 32

# 2. Agregar a .env.local
NEXTAUTH_SECRET="el-secret-generado"

# 3. Reiniciar servidor
npm run dev
```

### ❌ Redirige a login después de autenticarse

**Causa:** Middleware no detecta el token

**Solución:**
1. Verifica que `NEXTAUTH_URL` coincida con tu URL
2. Limpia cookies del navegador
3. Reinicia el servidor
4. Vuelve a hacer login

### ❌ Error "NEXTAUTH_URL is not defined"

**Solución:**
```env
# Agregar a .env.local
NEXTAUTH_URL="http://localhost:3000"
```

### ❌ Navbar no muestra "Ir al Panel"

**Causa:** El SessionProvider no está envolviendo la app

**Verificar:**
- `src/app/layout.tsx` debe tener `<NextAuthProvider>`
- Navbar debe ser client component con `"use client"`

### ❌ Error de CORS o cookies bloqueadas

**Solución:**
1. Asegúrate de estar en `http://localhost:3000` (no `127.0.0.1`)
2. No uses modo incógnito
3. Verifica configuración de cookies del navegador

## 🧪 Probar el Flujo Completo

### 1. Registro
```bash
# 1. Ir a /register
# 2. Llenar formulario
# 3. Debe redirigir a /backoffice
# 4. Debe mostrar tu información
```

### 2. Persistencia
```bash
# 1. Estando en /backoffice
# 2. Ir a / (raíz)
# 3. Navbar debe mostrar "Ir al Panel"
# 4. Click en "Ir al Panel" → debe ir a /backoffice sin pedir login
```

### 3. Protección de Rutas
```bash
# 1. Cerrar sesión
# 2. Intentar ir a /backoffice
# 3. Debe redirigir a /login
```

### 4. Redirección Inteligente
```bash
# 1. Estando logueado
# 2. Intentar ir a /login
# 3. Debe redirigir a /backoffice
```

## 🔧 Debug Avanzado

### Ver Logs de NextAuth

En desarrollo, NextAuth muestra logs en la consola del servidor:

```bash
npm run dev
# Observa la terminal al hacer login
```

### Verificar JWT

```javascript
// En la consola del navegador
document.cookie.split(';').find(c => c.includes('session-token'))
```

### Verificar Middleware

Agrega logs temporales en `src/middleware.ts`:

```typescript
console.log('Token:', !!req.nextauth.token);
console.log('Path:', req.nextUrl.pathname);
```

## 📝 Checklist de Verificación

- [ ] `.env.local` existe con todas las variables
- [ ] `NEXTAUTH_SECRET` está configurado
- [ ] `NEXTAUTH_URL` coincide con la URL actual
- [ ] Servidor reiniciado después de cambios en `.env.local`
- [ ] Cookies habilitadas en el navegador
- [ ] No estás en modo incógnito
- [ ] Usando `localhost` (no `127.0.0.1`)
- [ ] Base de datos conectada correctamente

## 🚀 Flujo Esperado

```
1. Usuario se registra en /register
   ↓
2. Se crea: user + business + employee
   ↓
3. Auto-login con signIn()
   ↓
4. Cookie de sesión se guarda (30 días)
   ↓
5. Redirección a /backoffice
   ↓
6. Middleware detecta token válido
   ↓
7. Usuario puede navegar libremente
   ↓
8. Al volver a /, navbar muestra "Ir al Panel"
   ↓
9. Sesión persiste hasta que expire o haga logout
```

## 💡 Tips

1. **Desarrollo:** Usa `http://localhost:3000` (no IP)
2. **Producción:** Asegúrate de tener HTTPS
3. **Cookies:** Se guardan automáticamente, no necesitas hacer nada
4. **Expiración:** 30 días por defecto, configurable en `auth.ts`
5. **Logout:** Usa `signOut()` de `next-auth/react`

---

Si sigues teniendo problemas, revisa los logs del servidor y las cookies del navegador.
