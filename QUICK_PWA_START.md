# 🚀 Inicio Rápido - PWA

## ✅ Ya está configurado

Tu app ya es una PWA completa. Solo necesitas generar los iconos.

## 📱 Generar Iconos (Elige una opción)

### Opción 1: Online (Más Fácil) ⭐

1. Ve a **https://www.pwabuilder.com/imageGenerator**
2. Sube tu logo (512x512px, formato PNG)
3. Descarga el ZIP
4. Extrae los archivos en `public/icons/`

### Opción 2: Con Script (Requiere ImageMagick)

```bash
# 1. Instalar ImageMagick
brew install imagemagick

# 2. Dar permisos al script
chmod +x scripts/generate-icons.sh

# 3. Generar iconos desde tu logo
./scripts/generate-icons.sh path/to/tu-logo.png
```

### Opción 3: Usar Ícono Temporal

Ya incluí un ícono SVG temporal. Para usarlo:

```bash
# Convertir el SVG a PNG (requiere ImageMagick)
brew install imagemagick
./scripts/generate-icons.sh public/icon.svg
```

## 🧪 Probar la PWA

```bash
# 1. Compilar para producción
npm run build

# 2. Iniciar servidor
npm run start

# 3. Abrir en navegador
open http://localhost:3000
```

## 📱 Instalar en Dispositivo

### Android
1. Abre la app en Chrome
2. Toca "Agregar a pantalla de inicio"

### iOS
1. Abre en Safari
2. Toca compartir (□↑)
3. "Agregar a pantalla de inicio"

### Desktop
1. Busca el ícono ⊕ en la barra de direcciones
2. O menú → "Instalar Vento POS"

## ✨ Características Incluidas

- ✅ Instalable en todos los dispositivos
- ✅ Funciona offline
- ✅ Prompt de instalación automático
- ✅ Service Worker con cache inteligente
- ✅ Página offline personalizada
- ✅ Shortcuts en el ícono
- ✅ Splash screen automático
- ✅ Soporte para notificaciones push

## 📚 Documentación Completa

Lee `PWA_SETUP.md` para más detalles y personalización.

---

**¿Problemas?** Asegúrate de:
1. Estar en HTTPS o localhost
2. Haber generado los iconos
3. Compilar con `npm run build`
