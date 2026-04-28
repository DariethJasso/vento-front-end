#!/bin/bash

# Script para generar iconos PWA desde una imagen base
# Uso: ./scripts/generate-icons.sh path/to/logo.png

if [ -z "$1" ]; then
  echo "❌ Error: Debes proporcionar la ruta a la imagen base"
  echo "Uso: ./scripts/generate-icons.sh path/to/logo.png"
  echo "La imagen debe ser cuadrada y de al menos 512x512px"
  exit 1
fi

INPUT_IMAGE="$1"

if [ ! -f "$INPUT_IMAGE" ]; then
  echo "❌ Error: El archivo $INPUT_IMAGE no existe"
  exit 1
fi

# Verificar si ImageMagick está instalado
if ! command -v convert &> /dev/null; then
  echo "❌ ImageMagick no está instalado"
  echo "Instálalo con: brew install imagemagick"
  exit 1
fi

echo "🎨 Generando iconos PWA..."

# Crear directorio de iconos
mkdir -p public/icons

# Tamaños de iconos necesarios
SIZES=(72 96 128 144 152 180 192 384 512)

for SIZE in "${SIZES[@]}"; do
  OUTPUT="public/icons/icon-${SIZE}x${SIZE}.png"
  echo "  → Generando ${SIZE}x${SIZE}..."
  convert "$INPUT_IMAGE" -resize ${SIZE}x${SIZE} "$OUTPUT"
done

# Generar iconos adicionales para shortcuts
echo "  → Generando iconos de shortcuts..."
convert "$INPUT_IMAGE" -resize 96x96 "public/icons/shortcut-pos.png"
convert "$INPUT_IMAGE" -resize 96x96 "public/icons/shortcut-inventory.png"

# Generar badge
echo "  → Generando badge..."
convert "$INPUT_IMAGE" -resize 72x72 "public/icons/badge-72x72.png"

echo "✅ ¡Iconos generados exitosamente!"
echo ""
echo "📁 Archivos creados en public/icons/:"
ls -lh public/icons/

echo ""
echo "🚀 Próximos pasos:"
echo "1. Verifica los iconos en public/icons/"
echo "2. Ejecuta: npm run build && npm run start"
echo "3. Prueba la instalación en tu dispositivo"
