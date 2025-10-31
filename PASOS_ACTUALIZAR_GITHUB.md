# 🔄 ACTUALIZAR REPOSITORIO GITHUB EXISTENTE

Ya tienes un repo en: [pokereport-launcher](https://github.com/moodlejd/pokereport-launcher)

Pero es la versión antigua con Electron. Vamos a reemplazarla con la nueva versión Python.

---

## 🎯 **MÉTODO 1: Fuerza Push (MÁS RÁPIDO)**

### **Ventaja**: Simple y directo
### **Desventaja**: Pierde historial anterior

```bash
cd C:\Users\Playanza\Desktop\pokereport-launcher

# 1. Inicializar Git
git init

# 2. Agregar archivos
git add .

# 3. Commit inicial
git commit -m "🎮 PokeReport Launcher v2.0 - Python + React

Migración completa de Electron a Python

ELIMINADO:
- ❌ Electron (bugs de audio/idioma)
- ❌ Dependencias complejas
- ❌ Problemas de CORS

AGREGADO:
- ✅ Backend Python estable
- ✅ Solo 2 dependencias
- ✅ Audio español garantizado
- ✅ Microsoft Device Code Flow
- ✅ CustomSkinLoader integrado
- ✅ Sistema de skins mejorado

MANTENIDO:
- ✅ Misma interfaz React hermosa
- ✅ Visor 3D de skins
- ✅ Panel de noticias
- ✅ Todas las funcionalidades"

# 4. Conectar al repo existente
git remote add origin https://github.com/moodlejd/pokereport-launcher.git

# 5. FUERZA push (reemplaza todo)
git push -f origin main
```

**⚠️ IMPORTANTE**: Esto eliminará TODO el historial anterior y lo reemplazará con la versión Python.

---

## 🎯 **MÉTODO 2: Crear Release + Actualizar (MÁS SEGURO)**

### **Ventaja**: Mantiene historial y versiones
### **Desventaja**: Un poco más largo

### **Paso 1: Crear Release de versión anterior**
1. Ve a [github.com/moodlejd/pokereport-launcher/releases](https://github.com/moodlejd/pokereport-launcher/releases)
2. Click **"Create a new release"**
3. **Tag**: `v1.0-electron`
4. **Title**: `PokeReport Launcher v1.0 - Electron (Deprecated)`
5. **Description**: `Versión antigua con Electron. No recomendada.`
6. **Publish release**

### **Paso 2: Actualizar README para avisar**
1. Ve a [github.com/moodlejd/pokereport-launcher](https://github.com/moodlejd/pokereport-launcher)
2. Edit `README.md`
3. Agregar al principio:
```markdown
> ⚠️ **AVISO**: Esta es la versión antigua con Electron.
> 
> 🚀 **Nueva versión Python disponible próximamente**
> 
> Se recomienda esperar a la versión 2.0 con Python que soluciona todos los problemas.
```
4. Commit: "Add deprecation notice"

### **Paso 3: Clonar y limpiar**
```bash
# Clonar repo existente
git clone https://github.com/moodlejd/pokereport-launcher.git temp-pokereport
cd temp-pokereport

# Eliminar TODO excepto .git
del /s /q * 2>nul
for /d %%p in (*) do rmdir /s /q "%%p" 2>nul

# (NO eliminar .git)
```

### **Paso 4: Copiar archivos nuevos**
```bash
# Copiar TODO de tu proyecto actual
xcopy /E /I /Y C:\Users\Playanza\Desktop\pokereport-launcher\backend backend
xcopy /E /I /Y C:\Users\Playanza\Desktop\pokereport-launcher\src src
xcopy /E /I /Y C:\Users\Playanza\Desktop\pokereport-launcher\public public
copy /Y C:\Users\Playanza\Desktop\pokereport-launcher\*.* .

# EXCEPTO: node_modules, dist, cache, venv
```

### **Paso 5: Commit y push**
```bash
git add .
git commit -m "🎮 v2.0 - Migración completa a Python + React

[Mensaje largo igual que Método 1]"

git push origin main
```

---

## 💡 **RECOMENDACIÓN**

**Usa MÉTODO 1 (Fuerza Push)** porque:
- ✅ Más rápido
- ✅ El historial antiguo no es importante
- ✅ Proyecto completamente nuevo
- ✅ Sin confusión de versiones

---

## 🚀 **COMANDOS FINALES (MÉTODO 1)**

```bash
cd C:\Users\Playanza\Desktop\pokereport-launcher
git init
git add .
git commit -m "🎮 PokeReport Launcher v2.0 - Python + React"
git remote add origin https://github.com/moodlejd/pokereport-launcher.git
git push -f origin main
```

**¿Listo para ejecutar?**
