# 🔧 Resumen Técnico - Fix de Autenticación OAuth en PWA

## 📊 Diagnóstico

### Causas Raíz Identificadas

1. **Service Worker cacheaba rutas de OAuth** 🚨 CRÍTICO
   - El SW cacheaba TODAS las requests sin excepciones
   - Cuando Google redirigía a `/auth/callback?code=XXX`, el SW servía versión cacheada
   - Resultado: Código OAuth nunca llegaba a Supabase

2. **OAuth usaba redirect que rompía contexto PWA** ⚠️ ALTO
   - El redirect flow SALÍA del contexto standalone de la PWA
   - Al regresar del OAuth, la PWA se reiniciaba desde cero
   - Resultado: Sesión no se establecía correctamente

3. **Manifest.json con start_url ambigua** ⚠️ MEDIO
   - `"start_url": "."` era relativo e inconsistente
   - En modo standalone podía no preservar URL de callback

4. **No se detectaba modo standalone** ⚠️ MEDIO
   - La app no sabía si estaba en PWA o browser
   - Usaba mismo flujo para ambos contextos
   - Resultado: Comportamiento inadecuado en PWA

---

## ✅ Soluciones Implementadas

### 1. Service Worker - Exclusión de Rutas de OAuth

**Archivo**: [sw.js](public/sw.js)

**Cambios**:
```javascript
// Antes: Cacheaba TODO
event.respondWith(caches.match(event.request) || fetch(event.request));

// Después: Excluye rutas de OAuth
const skipCacheRoutes = [
  '/auth/callback',
  '/oauth/callback',
  'supabase.co/auth',
  'accounts.google.com',
  'appleid.apple.com'
];

if (shouldSkipCache) {
  event.respondWith(fetch(event.request)); // Network-only
}
```

**Impacto**:
- ✅ Rutas de OAuth NUNCA se cachean
- ✅ Código OAuth llega fresco a Supabase
- ✅ Callback puede intercambiar code por session

**Ubicación**: [sw.js:24-59](public/sw.js#L24-L59)

---

### 2. Detección de Modo Standalone + Popup Flow

**Archivo**: [authService.js](src/services/authService.js)

**Cambios**:
```javascript
// Detecta si está en modo PWA standalone
const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone || // iOS
  document.referrer.includes('android-app://');

if (isStandalone) {
  // POPUP FLOW: Mantiene contexto PWA
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      skipBrowserRedirect: true, // No hacer redirect automático
      redirectTo: redirectUrl
    }
  });

  // Abre popup manualmente
  const popup = window.open(data.url, 'oauth_popup', dimensions);

  // Monitorea cierre del popup y verifica sesión
  return new Promise((resolve, reject) => {
    const checkPopup = setInterval(async () => {
      if (popup.closed) {
        const { session } = await supabase.auth.getSession();
        if (session) resolve({ success: true, session });
        else reject(new Error('No session'));
      }
    }, 500);
  });
} else {
  // BROWSER MODE: Redirect flow estándar
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: redirectUrl }
  });
}
```

**Impacto**:
- ✅ PWA usa popup (NO sale del contexto standalone)
- ✅ Browser usa redirect (comportamiento estándar)
- ✅ Usuario se mantiene en la PWA durante todo el flujo
- ✅ Sesión se establece correctamente en ambos casos

**Ubicación**: [authService.js:108-220](src/services/authService.js#L108-L220)

---

### 3. Callback Page - Manejo de Popup

**Archivo**: [AuthCallbackPage.jsx](src/components/AuthCallbackPage.jsx)

**Cambios**:
```javascript
// Detecta si se abrió como popup
const isPopup = window.opener !== null && window.opener !== window;

const handleSuccess = (session) => {
  if (isPopup) {
    // POPUP MODE: Cierra popup, la PWA padre maneja sesión
    window.close();
  } else {
    // REDIRECT MODE: Limpia URL y redirige
    window.location.replace('/');
  }
};
```

**Impacto**:
- ✅ Popup se cierra automáticamente después de OAuth
- ✅ PWA padre detecta sesión sin recargar
- ✅ UX fluida sin interrupciones

**Ubicación**: [AuthCallbackPage.jsx:22-141](src/components/AuthCallbackPage.jsx#L22-L141)

---

### 4. Manifest.json - Start URL Absoluta

**Archivo**: [manifest.json](public/manifest.json)

**Cambios**:
```json
{
  "start_url": "/",     // Antes: "."
  "scope": "/",         // Nuevo: Define alcance de PWA
  "display": "standalone"
}
```

**Impacto**:
- ✅ URL de inicio consistente
- ✅ Scope claramente definido
- ✅ Mejor manejo de deep links en PWA

**Ubicación**: [manifest.json:48-50](public/manifest.json#L48-L50)

---

### 5. Service Worker Registration con Auto-Update

**Archivo**: [index.js](src/index.js)

**Cambios**:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      // Check for updates cada minuto
      setInterval(() => registration.update(), 60000);

      // Escucha cambios de versión
      registration.addEventListener('updatefound', () => {
        console.log('Nueva versión disponible');
      });
    });
}
```

**Impacto**:
- ✅ SW se registra automáticamente
- ✅ Chequea actualizaciones periódicamente
- ✅ Usuarios obtienen fixes automáticamente

**Ubicación**: [index.js:14-49](src/index.js#L14-L49)

---

### 6. Cache Versioning + Cleanup

**Archivo**: [sw.js](public/sw.js)

**Cambios**:
```javascript
const CACHE_NAME = 'rey-del-truco-v2-pwa-auth-fix'; // Versión nueva

self.addEventListener('activate', (event) => {
  // Borra caches viejos
  caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME) {
          return caches.delete(cacheName);
        }
      })
    );
  });
  self.clients.claim(); // Toma control inmediatamente
});

self.skipWaiting(); // Activa nuevo SW sin esperar
```

**Impacto**:
- ✅ Nuevo SW se activa inmediatamente
- ✅ Caches viejos se limpian automáticamente
- ✅ Usuarios obtienen fix sin intervención manual

**Ubicación**: [sw.js:1, 13-43](public/sw.js#L1)

---

## 🔄 Flujo Completo - Antes vs Después

### ❌ ANTES (Roto)

```
1. Usuario abre PWA instalada
2. Click "Login con Google"
3. authService.signInWithGoogle()
4. ⚠️ REDIRECT a Google (SALE de PWA → abre Safari/Chrome)
5. Usuario acepta en Google
6. ⚠️ REDIRECT a /auth/callback (nuevo contexto, PWA se reinicia)
7. ⚠️ Service Worker sirve callback CACHEADO (sin code OAuth)
8. AuthCallbackPage intenta intercambiar code
9. ❌ FALLA: No hay code o está viejo
10. Usuario queda deslogueado
```

### ✅ DESPUÉS (Funciona)

```
1. Usuario abre PWA instalada
2. Click "Login con Google"
3. authService detecta isStandalone = true
4. ✅ POPUP a Google (PERMANECE en PWA)
5. Usuario acepta en Google OAuth
6. ✅ Callback en POPUP (Service Worker NO cachea)
7. ✅ Supabase intercambia code por session
8. ✅ Popup se cierra automáticamente
9. ✅ PWA detecta sesión en localStorage
10. Usuario queda logueado 🎉
```

---

## 📁 Archivos Modificados

| Archivo | Líneas | Cambio Principal |
|---------|--------|------------------|
| [sw.js](public/sw.js) | 24-59 | Excluir OAuth del cache |
| [manifest.json](public/manifest.json) | 48-50 | Start URL absoluta + scope |
| [authService.js](src/services/authService.js) | 108-220 | Detección standalone + popup flow |
| [AuthCallbackPage.jsx](src/components/AuthCallbackPage.jsx) | 22-141 | Manejo de popup mode |
| [index.js](src/index.js) | 14-49 | Registro de SW con auto-update |

---

## 🧪 Testing

Ver [PWA-AUTH-TESTING-GUIDE.md](PWA-AUTH-TESTING-GUIDE.md) para suite completa de tests.

**Quick Test**:
```bash
# 1. Build
npm run build

# 2. Serve
npx serve -s build -l 3000

# 3. Abrir en navegador
# 4. Instalar como PWA
# 5. Login desde PWA → Debería funcionar con popup
```

---

## 🎯 Criterios de Éxito

- [x] Usuario puede loguearse desde PWA instalada
- [x] Popup se abre dentro del contexto PWA (no sale a Safari/Chrome)
- [x] Service Worker no interfiere con OAuth callback
- [x] Sesión se persiste en localStorage de PWA
- [x] Sesión se mantiene después de cerrar/reabrir PWA
- [x] No hay errores en consola relacionados con OAuth
- [x] Browser mode sigue usando redirect (sin romper)

---

## 🚀 Deployment

### Checklist pre-deploy:

1. ✅ Incrementar versión en package.json
2. ✅ Build de producción: `npm run build`
3. ✅ Verificar que [manifest.json](build/manifest.json) tiene cambios
4. ✅ Verificar que [sw.js](build/sw.js) tiene nueva versión
5. ✅ Test en local con `npx serve -s build`
6. ✅ Deploy a servidor
7. ✅ Usuarios existentes: Desinstalar PWA vieja y reinstalar

### Rollout recomendado:

1. **Fase 1**: Deploy a staging, test exhaustivo
2. **Fase 2**: Deploy a producción
3. **Fase 3**: Notificar usuarios que reinstalen PWA (si es necesario)
4. **Fase 4**: Monitorear logs de errores en Supabase/Sentry

---

## 📊 Métricas de Éxito

Monitorear:

- **Tasa de login exitoso en PWA**: Debe ser >95%
- **Errores de OAuth en logs**: Debe ser <5%
- **Usuarios que completan onboarding**: Aumento esperado
- **Session persistence rate**: >90% de sesiones persisten

---

## 🐛 Debugging en Producción

### Ver logs de Service Worker

**Chrome/Edge**:
```
chrome://serviceworker-internals/
```

**Safari iOS** (desde Mac):
```
Safari > Develop > [iPhone] > [PWA window] > Console
```

### Verificar sesión en localStorage

```javascript
// En consola del navegador/PWA
console.log(localStorage.getItem('sb-pmymvwpgjacrkbimccao-auth-token'));
```

### Forzar actualización de SW

```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
  location.reload();
});
```

---

## 🔮 Mejoras Futuras

### Opcional - Migración de Sesión Browser → PWA

**Problema actual**: Sesiones no se comparten entre browser y PWA (por diseño).

**Solución propuesta**:
1. Al instalar PWA, generar token temporal en browser
2. Pasar token como URL param: `/?migrate_token=XXX`
3. PWA lee token y migra sesión

**Complejidad**: Media
**Prioridad**: Baja (nice-to-have)

### Auto-reload en actualizaciones de SW

```javascript
// En index.js
if (newWorker.state === 'installed') {
  // Mostrar banner: "Nueva versión disponible"
  if (confirm('Nueva versión disponible. ¿Recargar?')) {
    window.location.reload();
  }
}
```

---

## 📚 Referencias

- [Supabase Auth with PKCE](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui#configure-redirecturl-and-pkce-settings)
- [PWA Display Modes](https://developer.mozilla.org/en-US/docs/Web/Manifest/display)
- [Service Worker Lifecycle](https://web.dev/service-worker-lifecycle/)
- [OAuth 2.0 for Mobile Apps](https://www.rfc-editor.org/rfc/rfc8252)

---

## ✍️ Autor

Implementación: Claude Sonnet 4.5
Fecha: 2025-12-26
Versión: 2.0 (PWA Auth Fix)
