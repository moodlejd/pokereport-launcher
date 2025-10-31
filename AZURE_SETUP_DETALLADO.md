# 🔐 CONFIGURAR AZURE PARA MICROSOFT AUTH - PASO A PASO

## 🎯 ¿Por qué necesito esto?

Microsoft requiere que TODAS las aplicaciones estén registradas en Azure Portal para usar OAuth2. Es obligatorio, no opcional.

## 📋 PASO A PASO DETALLADO

### 1️⃣ **Ir a Azure Portal**

1. Abre: [https://portal.azure.com](https://portal.azure.com)
2. Inicia sesión con **TU CUENTA MICROSOFT** (la que usas para todo)
3. Si no tienes cuenta, crea una (es gratis)

### 2️⃣ **Buscar App Registrations**

1. En el buscador de arriba, escribe: `App registrations`
2. Click en **"App registrations"** en los resultados
3. Deberías ver una página con una lista (probablemente vacía)

### 3️⃣ **Crear Nueva App**

1. Click en **"+ New registration"** (botón azul arriba)
2. **Name**: `PokeReport Launcher`
3. **Supported account types**: 
   - ✅ **Selecciona**: "Accounts in any organizational directory and personal Microsoft accounts"
4. **Redirect URI**:
   - **Platform**: Selecciona "Single-page application (SPA)"
   - **URI**: `http://localhost:8000`
5. Click **"Register"**

### 4️⃣ **Copiar Client ID**

1. Después de crear, verás la página "Overview"
2. **Busca**: "Application (client) ID"
3. **Copia** ese ID (ejemplo: `12345678-abcd-1234-efgh-123456789012`)
4. **Guárdalo** - lo necesitarás después

### 5️⃣ **Configurar Redirect URIs Adicionales**

1. Ve a **"Authentication"** (menú izquierdo)
2. En **"Single-page application"**, click **"+ Add URI"**
3. Agrega estas URLs una por una:
   ```
   http://localhost:8000/auth-callback.html
   http://localhost:3000
   http://localhost:5173
   ```
4. Click **"Save"**

### 6️⃣ **Configurar Permisos API**

1. Ve a **"API permissions"** (menú izquierdo)
2. Deberías ver "Microsoft Graph" ya agregado con `User.Read`
3. **NO AGREGUES NADA MÁS** - Xbox Live ya no está disponible
4. Solo click **"Grant admin consent for Default Directory"** (botón azul)
5. ✅ Listo - con `User.Read` es suficiente

### 7️⃣ **Actualizar el Código**

Edita: `src/utils/microsoftAuthSimple.js`

```javascript
constructor() {
  this.clientId = 'PEGA_TU_CLIENT_ID_AQUI'; // ← Tu Client ID de Azure
  this.redirectUri = 'http://localhost:8000';  // ← Debe coincidir con Azure
  this.scopes = ['XboxLive.signin', 'offline_access'];
}
```

## 🔄 **Recompilar y Probar**

```bash
npm run build
# Reinicia el servidor Python
```

## ❌ **Si Sigue Sin Funcionar**

### Problema Común 1: No tienes Minecraft en esa cuenta
**Solución**: Usa modo Offline

### Problema Común 2: Azure mal configurado
**Solución**: Verifica que:
- ✅ Client ID correcto
- ✅ Redirect URI exacto: `http://localhost:8000`
- ✅ Permisos concedidos

### Problema Común 3: Cuenta empresarial
**Solución**: Usa cuenta personal Microsoft

## 💡 **ALTERNATIVA RECOMENDADA**

**Usa modo Offline** - funciona igual de bien:
- ✅ Todos los mods
- ✅ Servidor PokeReport
- ✅ Skin personalizada
- ✅ Sin configuración Azure

## 🎮 **Para Solo Jugar (Sin Microsoft)**

Si solo quieres jugar y no configurar Azure:

1. **Elimina el botón Premium** del Login
2. **Usa solo modo Offline**
3. **Funciona perfectamente**

¿Quieres que elimine el botón Premium y solo deje Offline?
