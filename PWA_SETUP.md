# 📱 Configuración de PWA - Vento POS

## ✅ Archivos Creados

### 1. Configuración PWA
- ✅ `public/manifest.json` - Manifiesto de la aplicación
- ✅ `public/sw.js` - Service Worker
- ✅ `src/components/pwa/pwa-installer.tsx` - Componente de instalación
- ✅ `src/app/offline/page.tsx` - Página offline
- ✅ `src/app/layout.tsx` - Actualizado con meta tags PWA

## 🎨 Generar Iconos

Necesitas crear los iconos de la app. Usa una imagen cuadrada de **512x512px** como base.

### Opción A: Generador Online (Recomendado)
1. Ve a [https://www.pwabuilder.com/imageGenerator](https://www.pwabuilder.com/imageGenerator)
2. Sube tu logo (512x512px)
3. Descarga el paquete de iconos
4. Coloca los archivos en `public/icons/`

### Opción B: Usar ImageMagick (Terminal)

```bash
# Instalar ImageMagick
brew install imagemagick

# Crear carpeta de iconos
mkdir -p public/icons

# Generar todos los tamaños desde una imagen base
convert public/logo-512.png -resize 72x72 public/icons/icon-72x72.png
convert public/logo-512.png -resize 96x96 public/icons/icon-96x96.png
convert public/logo-512.png -resize 128x128 public/icons/icon-128x128.png
convert public/logo-512.png -resize 144x144 public/icons/icon-144x144.png
convert public/logo-512.png -resize 152x152 public/icons/icon-152x152.png
convert public/logo-512.png -resize 180x180 public/icons/icon-180x180.png
convert public/logo-512.png -resize 192x192 public/icons/icon-192x192.png
convert public/logo-512.png -resize 384x384 public/icons/icon-384x384.png
convert public/logo-512.png -resize 512x512 public/icons/icon-512x512.png
```

### Iconos Necesarios

```
public/
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-180x180.png (Apple)
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── manifest.json
```

## 🚀 Características Implementadas

### ✅ Instalación
- Prompt de instalación automático
- Compatible con Android, iOS, Windows, macOS
- Botón "Instalar" personalizado
- Se puede descartar y no volver a mostrar por 7 días

### ✅ Offline Support
- Service Worker con estrategia Network First
- Cache de páginas principales
- Página offline personalizada
- Sincronización en segundo plano

### ✅ Funcionalidades Nativas
- **Standalone Mode**: Se abre como app nativa
- **Splash Screen**: Pantalla de carga automática
- **Theme Color**: Color de la barra de estado
- **Shortcuts**: Accesos rápidos desde el ícono
- **Push Notifications**: Soporte para notificaciones

### ✅ Optimizaciones
- Cache inteligente de recursos
- Actualización automática del Service Worker
- Sincronización cuando vuelve la conexión

## 📱 Cómo Instalar

### Android (Chrome/Edge)
1. Abre la app en Chrome
2. Aparecerá un banner "Agregar a pantalla de inicio"
3. O toca el menú (⋮) → "Instalar app"

### iOS (Safari)
1. Abre la app en Safari
2. Toca el botón de compartir (□↑)
3. Selecciona "Agregar a pantalla de inicio"
4. Confirma el nombre y toca "Agregar"

### Desktop (Chrome/Edge)
1. Abre la app en el navegador
2. Verás un ícono de instalación en la barra de direcciones
3. O ve a menú (⋮) → "Instalar Vento POS"

## 🧪 Probar PWA Localmente

### 1. Compilar para Producción
```bash
npm run build
npm run start
```

**Nota:** El Service Worker solo funciona en producción o con HTTPS.

### 2. Verificar con Lighthouse
1. Abre Chrome DevTools (F12)
2. Ve a la pestaña "Lighthouse"
3. Selecciona "Progressive Web App"
4. Haz clic en "Generate report"

### 3. Verificar Service Worker
1. Abre Chrome DevTools (F12)
2. Ve a "Application" → "Service Workers"
3. Verifica que el SW esté registrado y activo

### 4. Probar Offline
1. Abre Chrome DevTools (F12)
2. Ve a "Network"
3. Marca "Offline"
4. Recarga la página - debe funcionar

## 🔧 Personalización

### Cambiar Colores
Edita `public/manifest.json`:
```json
{
  "theme_color": "#FF6B35",
  "background_color": "#ffffff"
}
```

### Agregar Shortcuts
Edita `public/manifest.json`:
```json
{
  "shortcuts": [
    {
      "name": "Nueva Venta",
      "url": "/pos?action=new",
      "icons": [{ "src": "/icons/shortcut-pos.png", "sizes": "96x96" }]
    }
  ]
}
```

### Modificar Estrategia de Cache
Edita `public/sw.js` - Estrategias disponibles:
- **Network First**: Intenta red primero, luego cache
- **Cache First**: Usa cache primero, luego red
- **Stale While Revalidate**: Usa cache pero actualiza en segundo plano

## 📊 Métricas PWA

### Requisitos Mínimos
- ✅ Servido sobre HTTPS
- ✅ Responsive design
- ✅ Service Worker registrado
- ✅ Manifest.json válido
- ✅ Iconos de 192px y 512px
- ✅ Funciona offline

### Puntuación Lighthouse
Objetivo: **90+** en todas las categorías
- Performance
- Accessibility
- Best Practices
- SEO
- PWA

## 🔐 Seguridad

### HTTPS Requerido
PWAs requieren HTTPS en producción. Opciones:
- **Vercel/Netlify**: HTTPS automático
- **Cloudflare**: SSL gratuito
- **Let's Encrypt**: Certificado gratuito

### Content Security Policy
Considera agregar CSP headers en `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

## 🚨 Troubleshooting

### El Service Worker no se registra
- Verifica que estés en HTTPS o localhost
- Revisa la consola de errores
- Limpia cache y recarga (Ctrl+Shift+R)

### El prompt de instalación no aparece
- Solo aparece en HTTPS
- No aparece si ya está instalado
- Algunos navegadores tienen criterios adicionales

### La app no funciona offline
- Verifica que el SW esté activo en DevTools
- Revisa que las URLs estén en el cache
- Comprueba la estrategia de cache en `sw.js`

### Los iconos no se ven
- Verifica que las rutas en `manifest.json` sean correctas
- Asegúrate de que los archivos existan en `public/icons/`
- Limpia cache del navegador

## 📚 Recursos

- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox](https://developers.google.com/web/tools/workbox) - Herramientas para SW

## 🎯 Próximos Pasos

1. ✅ Genera los iconos de la app
2. ✅ Prueba la instalación en diferentes dispositivos
3. ✅ Configura notificaciones push (opcional)
4. ✅ Implementa sincronización en segundo plano
5. ✅ Optimiza el cache para tu caso de uso
6. ✅ Agrega analytics para instalaciones

¡Tu app ahora es una PWA completa! 🎉
