# 🔐 CONFIGURAR MICROSOFT AUTHENTICATION

## ❌ Problema Actual

El error `invalid_request: redirect_uri` significa que la URL `http://localhost:8000/auth-callback.html` NO está registrada en Azure Portal.

## ✅ Solución: Configurar Azure App Registration

### PASO 1: Ir a Azure Portal

1. Ve a [https://portal.azure.com](https://portal.azure.com)
2. Inicia sesión con tu cuenta Microsoft
3. Busca "App registrations" o "Registros de aplicaciones"

### PASO 2: Crear Nueva Aplicación

1. Click en **"+ New registration"**
2. **Name**: `PokeReport Launcher`
3. **Supported account types**: 
   - ✅ Selecciona "Personal Microsoft accounts only"
4. **Redirect URI**:
   - Platform: **"Single-page application (SPA)"**
   - URI: `http://localhost:8000/auth-callback.html`
5. Click **"Register"**

### PASO 3: Configurar Permisos

1. Ve a **"API permissions"**
2. Click **"+ Add a permission"**
3. Selecciona **"Microsoft Graph"**
4. **Delegated permissions**:
   - ✅ `XboxLive.signin`
   - ✅ `offline_access`
   - ✅ `User.Read` (básico)
5. Click **"Add permissions"**
6. Click **"Grant admin consent"** (botón azul)

### PASO 4: Obtener Client ID

1. Ve a **"Overview"**
2. Copia el **"Application (client) ID"**
3. Ejemplo: `12345678-1234-1234-1234-123456789012`

### PASO 5: Actualizar el Código

Edita `src/utils/microsoftAuthSimple.js`:

```javascript
constructor() {
  this.clientId = 'TU_CLIENT_ID_AQUI'; // ← Pega tu Client ID aquí
  this.redirectUri = 'http://localhost:8000/auth-callback.html';
  this.scopes = ['XboxLive.signin', 'offline_access'];
}
```

### PASO 6: Configurar URLs Adicionales (Opcional)

Si quieres que funcione en producción, agrega también:

- `http://localhost:3000/auth-callback.html` (desarrollo React)
- `https://tudominio.com/auth-callback.html` (producción)

## 🎯 URLs que DEBES registrar en Azure:

```
http://localhost:8000/auth-callback.html
http://localhost:3000/auth-callback.html
http://localhost:5173/auth-callback.html
```

## ⚠️ IMPORTANTE

**Microsoft Auth solo funciona con:**
- ✅ Cuentas que TENGAN Minecraft comprado
- ✅ URLs registradas en Azure Portal
- ✅ Client ID correcto

**Si no tienes Minecraft Premium**, usa **modo Offline** que funciona igual de bien.

## 🔧 Alternativa Simple: Deshabilitar Microsoft Auth

Si no quieres configurar Azure, puedes deshabilitar Microsoft Auth:

1. Edita `src/pages/Login.jsx`
2. Oculta el botón Premium:

```javascript
// Comentar o eliminar el botón Premium
{/* <motion.div className="glass rounded-2xl p-8 border-2 border-pokemon-yellow/30">
  ... botón Premium ...
</motion.div> */}
```

## 🎮 Modo Offline vs Premium

| Característica | Offline | Premium |
|----------------|---------|---------|
| **Funcionalidad** | ✅ 100% | ✅ 100% |
| **Mods** | ✅ Todos | ✅ Todos |
| **Servidor PokeReport** | ✅ Funciona | ✅ Funciona |
| **Skin personalizada** | ✅ Sí | ✅ Sí |
| **Configuración** | ✅ Ninguna | ❌ Requiere Azure |

**💡 Recomendación: Usa modo Offline - es igual de funcional.**
