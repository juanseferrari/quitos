# 🔐 TESTING DE AUTENTICACIÓN - REY DEL TRUCO

## ✅ CONFIGURACIÓN COMPLETADA

- ✅ Supabase configurado
- ✅ Base de datos creada con tablas `users`, `games`, `user_stats`
- ✅ Google OAuth configurado
- ✅ Servicio de autenticación real implementado
- ✅ Servidor de desarrollo corriendo en http://localhost:3000

## 🧪 CÓMO TESTEAR LA AUTENTICACIÓN

### **1. ABRIR LA APP**
```
http://localhost:3000
```

### **2. TESTEAR GOOGLE LOGIN**

1. **Click en "Continuar con Google"**
2. **Debería abrir popup/redirect** con Google OAuth
3. **Seleccionar tu cuenta de Google**
4. **Otorgar permisos** a Rey del Truco
5. **Deberías volver a la app** autenticado

### **3. VERIFICAR EN SUPABASE DASHBOARD**

1. Ir a: https://app.supabase.com/project/wwdrxqcamlqxlrspqrsp
2. **Authentication → Users**: Deberías ver tu usuario
3. **Table Editor → users**: Deberías ver tu perfil
4. **Table Editor → user_stats**: Deberías ver stats iniciales

## 🔍 QUÉ VERIFICAR

### **En la App:**
- ✅ Loading state durante OAuth
- ✅ Redirección exitosa después de login
- ✅ UI cambia al estado autenticado
- ✅ Puede acceder a features premium (stats, logros, social)

### **En Browser Console:**
```javascript
// Deberías ver logs como:
🔐 Starting Google OAuth with Supabase...
✅ OAuth callback successful: tu-email@gmail.com
📝 Creating user profile for: tu-email@gmail.com
```

### **En Supabase Dashboard:**
- ✅ Usuario aparece en Authentication → Users
- ✅ Perfil creado en tabla `users`
- ✅ Stats iniciales en tabla `user_stats`

## 🐛 TROUBLESHOOTING

### **Error: "Invalid redirect URI"**
- Verificar que Google OAuth tenga: `http://localhost:3000`
- Verificar que Supabase tenga el callback correcto

### **Error: "Configuration missing"**
- Verificar `.env.local` existe y tiene las credenciales
- Restart del servidor: `npm start`

### **Error: "Provider not enabled"**
- Verificar en Supabase que Google provider está habilitado
- Verificar Client ID y Secret están configurados

### **No redirecciona después de OAuth**
- Verificar callback URLs en Google Cloud Console
- Verificar que no hay errores en browser console

## 📱 TESTEAR EN IPHONE

### **Opción 1: Usando IP local**
1. Encontrar tu IP: `ifconfig | grep inet`
2. En iPhone Safari: `http://TU-IP:3000`
3. Testear OAuth flow

### **Opción 2: Deploy temporal**
1. `npm run build`
2. Deploy a Vercel/Netlify
3. Actualizar URLs en Google OAuth
4. Testear en iPhone

## ✅ CHECKLIST DE TESTING

- [ ] **Google login funciona** en desktop
- [ ] **Usuario se crea** en Supabase
- [ ] **Profile se completa** automáticamente
- [ ] **Stats se inicializan** correctamente
- [ ] **Logout funciona** correctamente
- [ ] **Re-login funciona** sin crear duplicados
- [ ] **OAuth funciona** en iPhone (si applicable)

## 🎯 SIGUIENTE FASE

Una vez que funcione la autenticación:

1. **Fase 1.2**: Implementar data persistence con Supabase
2. **Fase 1.3**: Migración de localStorage a database
3. **Fase 1.4**: Testing completo y refinamiento

## 📞 SI HAY PROBLEMAS

1. **Verificar logs** en browser console
2. **Verificar network tab** para requests fallidos
3. **Verificar Supabase logs** en dashboard
4. **Verificar Google Cloud Console** para OAuth errors

---

**¿Todo listo para testear? ¡Dale a Google login y veamos si funciona! 🚀**