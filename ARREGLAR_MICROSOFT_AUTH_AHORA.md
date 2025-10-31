# 🔧 ARREGLAR MICROSOFT AUTH - 5 MINUTOS

## 📍 **Tu Client ID:**
```
15d53ab4-cfad-4757-88a2-904139d4ca9d
```

## ✅ **PASOS EXACTOS:**

### 1️⃣ **Ir a Azure Portal**
[https://portal.azure.com](https://portal.azure.com)

### 2️⃣ **Buscar tu App**
1. Busca "App registrations" arriba
2. Busca tu app (debería llamarse "PokeReport Launcher" o similar)
3. Click en ella

### 3️⃣ **Ir a Authentication**
1. Click en **"Authentication"** en el menú izquierdo
2. Busca la sección **"Single-page application"**

### 4️⃣ **Actualizar Redirect URIs**

**❌ QUITAR** (si existe):
```
http://localhost
http://localhost:8000
```

**✅ AGREGAR** (exactamente así):
```
http://localhost:8000/auth-callback.html
```

### 5️⃣ **Guardar**
Click en **"Save"** arriba

### 6️⃣ **Verificar Permisos**
1. Ve a **"API permissions"**
2. Deberías ver:
   - ✅ `User.Read` (Microsoft Graph)
3. Click en **"Grant admin consent for Default Directory"** (botón azul)
4. Confirmar

## 🎯 **Después de guardar:**

### 1. **Recompilar el launcher:**
```bash
cd C:\Users\Playanza\Desktop\pokereport-launcher
npm run build
```

### 2. **Ejecutar:**
```bash
iniciar_simple.bat
```

### 3. **Probar Microsoft Auth:**
1. Ve a `http://localhost:8000`
2. Click en **"👑 Login con Microsoft"**
3. Debería abrirse popup de Microsoft
4. Inicia sesión
5. Autoriza la app
6. **¡Debería funcionar!**

## ✅ **Qué esperar:**

1. **Popup de Microsoft** se abre
2. **Inicias sesión** con tu cuenta
3. **Autorizas** PokeReport Launcher
4. **Redirect** a `auth-callback.html`
5. **Procesa autenticación** (Xbox Live → Minecraft)
6. **Te lleva a Home** con tu cuenta Premium

## ⚠️ **Posibles errores:**

### ❌ "No tienes Minecraft"
**Causa**: Esa cuenta Microsoft no tiene Minecraft comprado
**Solución**: Usa otra cuenta o modo Offline

### ❌ "Xbox Live no disponible"
**Causa**: La cuenta no tiene perfil de Xbox
**Solución**: Crea perfil en xbox.com o usa Offline

### ❌ "Menor de edad"
**Causa**: Cuenta con restricciones parentales
**Solución**: Configura permisos o usa Offline

## 💡 **IMPORTANTE:**

**DEBES TENER MINECRAFT COMPRADO** en la cuenta Microsoft para que funcione.

Si no tienes Minecraft Premium, **usa modo Offline** - funciona igual de bien.

---

**¿Ya agregaste `http://localhost:8000/auth-callback.html` en Azure?**
