#!/bin/bash

# Rey del Truco - Script de deployment para Netlify
# Uso: ./deploy.sh

echo "🏆 Rey del Truco - Deployment Script"
echo "======================================"

# Verificar si netlify-cli está instalado
if ! command -v netlify &> /dev/null; then
    echo "⚠️  Netlify CLI no está instalado. Instalando..."
    npm install -g netlify-cli
fi

# Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf build

# Crear build de producción
echo "📦 Creando build de producción..."
npm run build

# Verificar que el build fue exitoso
if [ ! -d "build" ]; then
    echo "❌ Error: Build falló"
    exit 1
fi

echo "✅ Build completado exitosamente"

# Mostrar opciones de deployment
echo ""
echo "🚀 Opciones de deployment:"
echo "1. Deploy de prueba (draft)"
echo "2. Deploy de producción"
echo "3. Solo mostrar información"

read -p "Selecciona una opción (1-3): " option

case $option in
    1)
        echo "🧪 Desplegando versión de prueba..."
        netlify deploy --dir=build
        ;;
    2)
        echo "🔥 Desplegando a producción..."
        netlify deploy --prod --dir=build
        ;;
    3)
        echo "📋 Información del sitio:"
        netlify status
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment completado!"
echo "🌐 Tu app Rey del Truco está lista en HTTPS"
echo "📱 PWA funcional para iOS y Android"