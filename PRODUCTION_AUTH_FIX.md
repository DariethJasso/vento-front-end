# Fix: Problema de Autenticación en Producción

## Problema
En producción, después de hacer login exitoso, la aplicación no redirige correctamente y muestra un loop de redirección:
```
https://dev.nuvly.mx/login?callbackUrl=https%3A%2F%2Fdev.nuvly.mx%2Fpanel
```

## Causa
NextAuth requiere configuración específica de variables de entorno en producción para manejar correctamente las cookies y sesiones.

## Solución

### 1. Variables de Entorno Requeridas

Asegúrate de tener estas variables configuradas en tu plataforma de deployment (Vercel, Netlify, etc.):

```bash
# URL base de tu aplicación en producción
NEXTAUTH_URL=https://dev.nuvly.mx

# Secret para firmar tokens JWT (DEBE ser diferente en producción)
# Genera uno nuevo con: openssl rand -base64 32
NEXTAUTH_SECRET=tu-secret-super-seguro-diferente-al-de-desarrollo

# Database URL
DATABASE_URL=postgresql://user:password@host:5432/database

# Node Environment
NODE_ENV=production
```

### 2. Cambios Realizados en el Código

Se actualizó `src/lib/auth.ts` para:

1. **Cookies seguras en producción**: Usa `__Secure-` prefix para cookies en HTTPS
2. **Dominio de cookies**: Configurado para `.nuvly.mx` para compartir entre subdominios
3. **URL base explícita**: Usa `NEXTAUTH_URL` cuando está disponible

### 3. Verificación

Después de configurar las variables de entorno:

1. **Redeploy** tu aplicación
2. **Limpia las cookies** del navegador para `dev.nuvly.mx`
3. **Intenta hacer login** nuevamente
4. Deberías ser redirigido correctamente a `/panel`

### 4. Debugging

Si el problema persiste, verifica:

```bash
# En tu plataforma de deployment, verifica que las variables estén configuradas:
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET
echo $NODE_ENV

# Deberían mostrar:
# https://dev.nuvly.mx
# [tu-secret]
# production
```

### 5. Cookies en Producción

Las cookies ahora se configuran como:
- **Nombre**: `__Secure-next-auth.session-token` (en producción)
- **HttpOnly**: `true` (no accesible desde JavaScript)
- **Secure**: `true` (solo HTTPS)
- **SameSite**: `lax` (protección CSRF)
- **Domain**: `.nuvly.mx` (compartido entre subdominios)

### 6. Troubleshooting Adicional

Si aún tienes problemas:

1. **Verifica HTTPS**: NextAuth requiere HTTPS en producción
2. **Revisa logs**: Busca errores de NextAuth en los logs del servidor
3. **Inspecciona cookies**: Usa DevTools → Application → Cookies para ver si la cookie se está creando
4. **Prueba en incógnito**: Para evitar problemas con cookies antiguas

### 7. Configuración de Dominio

Si usas subdominios diferentes (ej: `app.nuvly.mx`, `admin.nuvly.mx`):
- La configuración actual con `domain: ".nuvly.mx"` permite compartir la sesión
- Si solo usas un dominio, puedes remover la configuración de `domain`

## Notas Importantes

⚠️ **NUNCA** compartas tu `NEXTAUTH_SECRET` en el código o repositorio
⚠️ Usa un secret **diferente** para desarrollo y producción
⚠️ Regenera el secret si sospechas que fue comprometido
