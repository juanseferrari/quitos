# 🔧 DEV HELPERS - Guía de Desarrollo

## Funciones Disponibles en Localhost

Estas funciones están disponibles en la consola del navegador cuando ejecutas la app en `localhost`:

---

## 📋 **1. Listar Usuarios Reales**

```javascript
await window.devListUsers()
```

**Qué hace:**
- Lista todos los usuarios reales de tu base de datos Supabase
- Muestra email, display_name, y nombre
- Útil para ver qué usuarios puedes impersonar

**Ejemplo de output:**
```
📋 Available users:
   1. juansegundoferrari@gmail.com (@juanseferrari) - Juan Segundo Ferrari
   2. test@example.com (@test) - Test User
   3. test2@example.com (@test2) - Test User 2

💡 Uso: window.devImpersonate("email@example.com")
```

---

## 👤 **2. Impersonar Usuario Real** (CON RLS DISABLED)

```javascript
await window.devImpersonate("juansegundoferrari@gmail.com")
```

**Qué hace:**
- Carga el perfil real del usuario desde Supabase
- Crea una sesión mock en el frontend
- Setea authService.currentUser y authService.userProfile
- Carga amigos y solicitudes pendientes

**IMPORTANTE:** Esta función funciona correctamente cuando **RLS está DISABLED** en Supabase (como en tu screenshot).

**Ejemplo de uso:**
```javascript
// 1. Ver usuarios disponibles
await window.devListUsers()

// 2. Impersonar tu usuario
await window.devImpersonate("juansegundoferrari@gmail.com")

// 3. Verificar que funcionó
window.devAuthState()
```

**Output esperado:**
```javascript
{
  isAuthenticated: true,
  isAnonymous: false,
  user: {
    id: "f869d968-f828-4772-8acf-140c3bd38f06",
    email: "juansegundoferrari@gmail.com",
    name: "Juan Segundo Ferrari",
    username: "juanseferrari",
    avatar: "https://..."
  }
}
```

---

## 🔐 **3. Login Mock** (Sin Supabase)

```javascript
window.devLogin("test@example.com", "Test User")
```

**Qué hace:**
- Crea un usuario completamente mock (no existe en la BD)
- Útil para testing de UI sin tocar la base de datos
- NO funciona con queries reales de Supabase

**Cuándo usar:**
- Testing de componentes de UI
- Testing de flujos de navegación
- Cuando no necesitas datos reales

**Cuándo NO usar:**
- Si necesitas probar friends, search, o cualquier funcionalidad de BD
- Si necesitas probar con RLS enabled

---

## 🚪 **4. Logout**

```javascript
window.devLogout()
```

**Qué hace:**
- Cierra sesión
- Limpia tokens de localStorage
- Vuelve al estado ANONYMOUS

---

## 📊 **5. Ver Estado Actual**

```javascript
window.devAuthState()
```

**Qué hace:**
- Muestra el estado completo de autenticación
- Útil para debugging

**Output:**
```javascript
{
  isAuthenticated: true/false,
  isAnonymous: true/false,
  user: { ... },
  appState: 'AUTHENTICATED' | 'ANONYMOUS' | ...
}
```

---

## 🎯 FLUJO RECOMENDADO PARA TESTING

### **Opción A: Con RLS Disabled (Actual - MÁS FÁCIL)**

```javascript
// 1. Asegúrate que RLS esté disabled en Supabase
// (Ya lo tienes así según tu screenshot)

// 2. Lista usuarios
await window.devListUsers()

// 3. Impersona tu usuario
await window.devImpersonate("juansegundoferrari@gmail.com")

// 4. Verifica estado
window.devAuthState()

// 5. Ve a la app y prueba:
// - Profile screen → Debería mostrar tu @username
// - Search → Debería encontrar usuarios "test"
// - Friends → Debería mostrar amigos
```

### **Opción B: Con OAuth Real (Producción)**

```javascript
// 1. Click en el botón "Sign in with Google" en la app
// 2. Completa el flujo de OAuth
// 3. Vuelve a la app con sesión real
```

---

## ⚠️ TROUBLESHOOTING

### Error: "Auth session missing"

**Causa:** Estás usando `devLogin()` (usuario mock) pero intentando hacer queries que requieren RLS.

**Solución:**
- Si RLS está **DISABLED**: Usa `devImpersonate()` en lugar de `devLogin()`
- Si RLS está **ENABLED**: Usa OAuth real (Sign in with Google)

### Error: "User not found"

**Causa:** El email que pasaste a `devImpersonate()` no existe en la base de datos.

**Solución:**
```javascript
// Primero ver qué usuarios existen
await window.devListUsers()

// Luego usar un email de la lista
await window.devImpersonate("email@que-exista.com")
```

### No veo amigos ni usuarios en search

**Causa:**
1. No corriste la migración 004_create_friendships_FINAL.sql
2. RLS está enabled y no tienes sesión real

**Solución:**
1. Verifica que la tabla `friendships` existe en Supabase
2. Verifica que RLS esté disabled para development
3. Usa `devImpersonate()` con RLS disabled

---

## 💡 TIPS

1. **Siempre usa `devListUsers()` primero** para ver qué usuarios puedes impersonar
2. **`devImpersonate()` es mejor que `devLogin()`** para testing con datos reales
3. **Desactiva RLS durante desarrollo** para evitar problemas de sesión
4. **Reactiva RLS antes de ir a producción** y usa OAuth real

---

## 🔑 DIFERENCIAS CLAVE

| Función | Crea Sesión Real | Funciona con BD | Funciona con RLS Enabled |
|---------|-----------------|----------------|-------------------------|
| `devLogin()` | ❌ No | ❌ No | ❌ No |
| `devImpersonate()` | ❌ No | ✅ Sí (si RLS disabled) | ❌ No |
| OAuth Real | ✅ Sí | ✅ Sí | ✅ Sí |

---

## 📞 NEXT STEPS

Una vez que hayas probado con `devImpersonate()` y RLS disabled:

1. ✅ Verifica que tu `display_name` aparece
2. ✅ Verifica que search encuentra usuarios "test"
3. ✅ Verifica que puedes enviar friend requests
4. ✅ Verifica que puedes aceptar friend requests
5. ✅ Verifica que aparecen tus amigos

Si todo funciona:
1. Habilita RLS en producción
2. Usa OAuth real para testing final
3. Deploy a Heroku

---

Generated by Claude Code 🤖
