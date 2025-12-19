# 🚀 Rey del Truco - Deployment Guide

## 📋 Opciones de Deployment

### 1. Netlify (Recomendado)

#### Instalación
```bash
npm install -g netlify-cli
```

#### Deployment Manual
```bash
# Usar script automatizado
npm run deploy

# O manualmente
npm run build
netlify deploy --prod --dir=build
```

#### Deployment Automático (GitHub)
1. Conectar repositorio a Netlify
2. Configurar variables de entorno en GitHub:
   - `NETLIFY_AUTH_TOKEN`
   - `NETLIFY_SITE_ID`
3. Push a `main` branch activa deployment automático

### 2. Vercel

```bash
npm install -g vercel
vercel --prod
```

### 3. GitHub Pages

```bash
npm install -g gh-pages
npm run build
npx gh-pages -d build
```

## 🔧 Configuración PWA

### Service Worker
✅ Implementado en `public/sw.js`
- Cache de assets críticos
- Funcionalidad offline básica
- Actualización automática

### Manifest
✅ Configurado en `public/manifest.json`
- Iconos para todas las plataformas
- Tema oscuro (#0a0a0a)
- Instalación PWA habilitada

### Safe Area
✅ Soporte para iPhone X+ con notch
- `viewport-fit=cover` en HTML
- CSS `env(safe-area-inset-*)` 
- Responsive para todas las pantallas

## 📱 Testing Post-Deployment

### Lighthouse Audit
```bash
npm install -g lighthouse
lighthouse https://tu-dominio.com --output html
```

### PWA Testing
- [ ] Funciona offline después de primera carga
- [ ] Instalación PWA disponible en móviles
- [ ] Service Worker se registra correctamente
- [ ] Iconos aparecen en home screen

### Cross-Browser Testing
- [ ] Chrome (desktop/mobile)
- [ ] Firefox (desktop/mobile)
- [ ] Safari (desktop/mobile)
- [ ] Edge (desktop/mobile)

## 🛠️ Troubleshooting

### Service Worker no se registra
```bash
# Verificar en DevTools > Application > Service Workers
# Limpiar cache si es necesario
```

### PWA no se instala
```bash
# Verificar HTTPS
# Verificar manifest.json
# Verificar que Service Worker funciona
```

### Safe Area no funciona
```bash
# Verificar viewport-fit=cover
# Probar en simulador iPhone X+
```

## 📊 Métricas de Éxito

- **Lighthouse Performance**: >90
- **Lighthouse PWA**: >90
- **First Contentful Paint**: <2s
- **Time to Interactive**: <3s
- **Offline Functionality**: 100%

## 🔐 Configuración de Seguridad

### Headers (netlify.toml)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

### Cache Strategy
- Static assets: 1 year
- Service Worker: No cache
- Manifest: No cache

---

**¡Tu app Rey del Truco está lista para producción!** 🏆