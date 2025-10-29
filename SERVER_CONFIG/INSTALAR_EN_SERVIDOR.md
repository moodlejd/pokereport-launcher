# 🎮 INSTALAR CUSTOMSKINLOADER EN TU SERVIDOR

## ✅ **ARCHIVOS LISTOS PARA USAR**

Este archivo `CustomSkinLoader.json` ya está **100% configurado** para PokeReport.

---

## 📋 **PASOS DE INSTALACIÓN:**

### **1️⃣ Descargar CustomSkinLoader**

Ve a una de estas páginas y descarga el .jar para **Fabric 1.21.1**:

**Modrinth (Recomendado):**
```
https://modrinth.com/mod/customskinloader/versions
```
Busca: `Fabric 1.21.1` o `1.21+fabric`

**CurseForge:**
```
https://www.curseforge.com/minecraft/mc-mods/customskinloader/files
```

**GitHub:**
```
https://github.com/xfl03/MCCustomSkinLoader/releases
```

**Descarga:**
```
CustomSkinLoader_Fabric-1.21.1-17.9.jar
```

---

### **2️⃣ Instalar en tu servidor**

#### **En tu servidor (199.127.60.252):**

**Sube el .jar a:**
```
/mods/CustomSkinLoader_Fabric-1.21.1-17.9.jar
```

**Crea la carpeta:**
```
/CustomSkinLoader/
```

**Sube el CustomSkinLoader.json:**
```
/CustomSkinLoader/CustomSkinLoader.json
```

---

### **3️⃣ Reiniciar servidor**

```bash
stop
start
```

O en tu panel de hosting:
```
Reiniciar servidor
```

---

### **4️⃣ Verificar que funciona**

En la consola del servidor deberías ver:
```
[CustomSkinLoader] Loaded 4 skin sites
[CustomSkinLoader] TLauncher Official - Enabled
[CustomSkinLoader] Mojang Official - Enabled
[CustomSkinLoader] LittleSkin - Enabled
[CustomSkinLoader] ElyBy - Enabled
```

---

## 🎯 **CÓMO FUNCIONA:**

### **Cuando un jugador se conecta:**

```
1. Jugador "jeicordero" entra al servidor
2. CustomSkinLoader se activa
3. Consulta APIs en orden:
   → TLauncher: Busca skin de "jeicordero"
   → Si no encuentra, prueba Mojang
   → Si no encuentra, prueba LittleSkin
   → Si no encuentra, usa Steve
4. Descarga la skin
5. La aplica al jugador
6. Otros jugadores la ven
```

---

## 📊 **TIPOS DE JUGADORES:**

| Tipo | API que usa | Resultado |
|------|-------------|-----------|
| **Offline (TLauncher)** | TLauncher Official | ✅ Ve su skin custom |
| **Premium (Microsoft)** | Mojang Official | ✅ Ve su skin oficial |
| **Sin skin** | Ninguna | Steve por defecto |

---

## 🔧 **CONFIGURACIÓN INCLUIDA:**

El `CustomSkinLoader.json` que creé tiene:
- ✅ **TLauncher** como prioridad #1
- ✅ **Mojang** oficial para premium
- ✅ **LittleSkin** y **ElyBy** como fallbacks
- ✅ Caché de 30 días
- ✅ Capes habilitadas
- ✅ Transparent skins habilitadas

---

## 💡 **SI NO TIENES ACCESO AL SERVIDOR:**

Si el servidor es de hosting (no tienes FTP):
1. Contacta al admin del servidor
2. Envíale el .jar y el .json
3. Que los instale él

---

## 🎮 **DESPUÉS DE INSTALAR:**

**Todos los jugadores verán:**
- ✅ Skins de TLauncher (usuarios offline)
- ✅ Skins premium (usuarios Microsoft)
- ✅ Sin configuración adicional en el launcher
- ✅ Automático y sincronizado

---

## 📝 **RESUMEN:**

```
Launcher (jeicordero):
  → Descarga skin de TLauncher
  → Muestra en 3D (solo visual)
  → Se conecta al servidor

Servidor (con CustomSkinLoader):
  → Detecta "jeicordero" 
  → Consulta TLauncher API
  → Descarga la misma skin
  → La aplica en el servidor
  → Otros jugadores la ven

✅ Sincronizado automáticamente
```

---

**Descarga el .jar de CustomSkinLoader para Fabric 1.21.1 e instálalo en `mods/` del servidor con el JSON que creé en `SERVER_CONFIG/`! 🎮**

**¿Tienes acceso al servidor para instalar el mod? 🚀**
