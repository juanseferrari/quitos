# 🧪 Guía de Testing - Autenticación OAuth en PWA

## 📋 Pre-requisitos

Antes de probar, asegúrate de:

1. **Desinstalar la PWA anterior** (si la tenías instalada):
   - iOS Safari: Pantalla de inicio > Mantener presionada la app > "Eliminar aplicación"
   - Chrome Desktop: chrome://apps/ > Click derecho en la app > "Desinstalar"
   - Chrome Android: Configuración > Apps > Rey del Truco > Desinstalar

2. **Limpiar caché del navegador**:
   - Safari iOS: Ajustes > Safari > Borrar historial y datos
   - Chrome: DevTools > Application > Clear storage

3. **Hacer build de producción**:
   ```bash
   npm run build
   npm install -g serve
   serve -s build -l 3000
   ```

---

## 🧪 Test Suite

### Test 1: Navegador Web (Baseline)

**Objetivo**: Verificar que el flujo OAuth funciona en modo navegador normal.

1. Abre `http://localhost:3000` en el navegador
2. Click en "Iniciar sesión con Google"
3. **Verifica**: Se abre redirect a Google OAuth
4. Acepta permisos
5. **Verifica**: Redirecciona a `/auth/callback`
6. **Verifica en consola**:
   ```
   🔐 BROWSER MODE: Using standard redirect flow
   🔐 Auth state changed: SIGNED_IN user@gmail.com
   ✅ Session established
   ```
7. **Verifica**: Usuario queda logueado, aparece su email/avatar

**✅ Resultado esperado**: Login exitoso con redirect flow

---

### Test 2: PWA Instalada - Detección de Standalone Mode

**Objetivo**: Verificar que la app detecta correctamente modo standalone.

1. Con la app en el navegador, instalar como PWA:
   - iOS Safari: Compartir > "Añadir a inicio"
   - Chrome Desktop: Barra de direcciones > Icono de instalar
   - Chrome Android: Menú > "Instalar aplicación"

2. Abrir la PWA instalada desde el icono en inicio

3. Abrir DevTools (si es posible) o revisar logs

4. Click en "Iniciar sesión con Google"

5. **Verifica en consola**:
   ```
   🔐 PWA Detection: {
     isStandalone: true,
     displayMode: true,
     iosStandalone: true (iOS) / false (otros)
   }
   🔐 PWA STANDALONE MODE: Using popup flow instead of redirect
   🔐 Opening OAuth in popup window
   ```

**✅ Resultado esperado**: Detecta standalone mode y usa popup flow

---

### Test 3: PWA - Autenticación con Popup

**Objetivo**: Verificar que el login funciona en PWA usando popup.

1. En la PWA instalada, click en "Iniciar sesión con Google"

2. **Verifica**: Se abre ventana popup con Google OAuth (NO redirect que sale de la app)

3. En el popup, acepta permisos de Google

4. **Verifica**: El popup se cierra automáticamente después de login

5. **Verifica en consola de la PWA**:
   ```
   🔐 Popup closed, checking for session...
   ✅ Session established after popup!
   🔐 Auth state changed: SIGNED_IN user@gmail.com
   ```

6. **Verifica en UI**: Usuario aparece logueado en la PWA principal

**✅ Resultado esperado**: Login exitoso sin salir de contexto PWA

---

### Test 4: Service Worker - No Cachea OAuth Routes

**Objetivo**: Verificar que el SW no interfiere con OAuth.

1. En la PWA instalada, loguéate exitosamente

2. Cierra sesión

3. Vuelve a loguearte

4. **Verifica en consola**:
   ```
   🔓 SW: Bypassing cache for auth route: /auth/callback
   ```

5. **Verifica**: No hay errores de "cached response" o "stale data"

**✅ Resultado esperado**: SW no cachea rutas de OAuth

---

### Test 5: Persistencia de Sesión en PWA

**Objetivo**: Verificar que la sesión persiste entre aperturas de PWA.

1. En la PWA instalada, loguéate exitosamente

2. **Cierra completamente la PWA** (swipe up en iOS, cerrar ventana en desktop)

3. Vuelve a abrir la PWA desde el icono de inicio

4. **Verifica en consola**:
   ```
   🔍 Found Supabase session for: user@gmail.com
   🔐 Auth state changed: TOKEN_REFRESHED user@gmail.com
   ```

5. **Verifica en UI**: Usuario sigue logueado

**✅ Resultado esperado**: Sesión se mantiene en localStorage de PWA

---

### Test 6: Sesión NO compartida entre Browser y PWA

**Objetivo**: Confirmar que browser y PWA tienen contextos de almacenamiento aislados.

1. Loguéate en el **navegador web** normal

2. **Sin cerrar sesión**, instala la PWA

3. Abre la PWA instalada

4. **Verifica**: Aparece pantalla de login (NO logueado)

5. Loguéate en la PWA

6. Vuelve al navegador

7. **Verifica**: Sesión del navegador NO cambió (sigue logueado con cuenta anterior)

**✅ Resultado esperado**: Contextos aislados, sesiones independientes

---

## 🐛 Debugging

### Ver logs de Service Worker

**Chrome Desktop**:
1. Abre DevTools en la PWA
2. Application tab > Service Workers
3. Verifica "rey-del-truco-v2-pwa-auth-fix" está activo

**iOS Safari**:
1. En Mac: Safari > Develop > [Tu iPhone] > [PWA window]
2. Verifica logs en la consola

### Borrar Service Worker manualmente

Si necesitas forzar actualización:

```javascript
// En consola del navegador/PWA
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
  console.log('All SW unregistered');
});
```

Luego refresca la página.

### Verificar localStorage de sesión

```javascript
// En consola
Object.keys(localStorage).forEach(key => {
  if (key.includes('auth') || key.includes('supabase')) {
    console.log(key, localStorage.getItem(key));
  }
});
```

---

## 🎯 Checklist Final

Después de completar todos los tests:

- [ ] Login funciona en navegador web (redirect flow)
- [ ] Login funciona en PWA instalada (popup flow)
- [ ] PWA detecta correctamente modo standalone
- [ ] Popup se abre y cierra correctamente en PWA
- [ ] Service Worker no cachea rutas de OAuth
- [ ] Sesión persiste en PWA entre aperturas
- [ ] Contextos de browser y PWA están aislados
- [ ] No hay errores en consola relacionados con OAuth
- [ ] Usuario puede hacer logout y volver a loguearse

---

## 🚨 Problemas Conocidos y Soluciones

### Problema: "Popup blocked by browser"

**Causa**: El navegador bloquea popups por defecto.

**Solución**:
1. Permite popups para `localhost:3000` (o tu dominio)
2. iOS Safari: Ajustes > Safari > Bloquear ventanas emergentes: OFF

### Problema: "No session after OAuth popup"

**Causa**: Supabase no pudo establecer sesión en el callback.

**Solución**:
1. Verifica que la URL de redirect esté correcta en Supabase Dashboard
2. Verifica que `detectSessionInUrl: true` está en [supabase.js:27](src/config/supabase.js#L27)
3. Revisa logs del popup antes de que se cierre

### Problema: "OAuth opens in new tab instead of popup"

**Causa**: Bloqueador de popups forzó apertura en nueva pestaña.

**Solución**:
1. Permite popups en configuración del navegador
2. En mobile, puede ser comportamiento normal (abre en SFSafariViewController)

---

## 📊 Resultados Esperados

| Test | Browser | PWA Desktop | PWA iOS | PWA Android |
|------|---------|-------------|---------|-------------|
| Login redirect | ✅ | ✅ | ✅ | ✅ |
| Login popup | N/A | ✅ | ✅ | ✅ |
| Detecta standalone | ❌ | ✅ | ✅ | ✅ |
| SW no cachea OAuth | ✅ | ✅ | ✅ | ✅ |
| Sesión persiste | ✅ | ✅ | ✅ | ✅ |
| Contextos aislados | ✅ | ✅ | ✅ | ✅ |

---

## 🎉 Criterio de Éxito

La implementación se considera exitosa si:

1. ✅ Usuario puede loguearse desde PWA instalada
2. ✅ La sesión se mantiene después de cerrar y reabrir PWA
3. ✅ El flujo no sale del contexto standalone (no abre Safari/Chrome)
4. ✅ No hay errores en consola relacionados con OAuth o Service Worker

---

## 📝 Notas Técnicas

### Diferencia entre Browser y PWA

**Browser (display-mode: browser)**:
- Usa redirect flow estándar
- Cookies y localStorage compartidos con otras pestañas
- Barra de navegación visible

**PWA (display-mode: standalone)**:
- Usa popup flow para OAuth
- localStorage aislado (no compartido con browser)
- Fullscreen, sin barra de navegación

### Por qué popup en lugar de redirect

El redirect flow SALE del contexto standalone de la PWA:
```
PWA → Redirect a Google → Callback → ⚠️ Abre en Safari/Chrome (nuevo contexto)
```

El popup flow MANTIENE el contexto:
```
PWA → Popup Google → Callback en popup → Cierra popup → ✅ Regresa a PWA
```
