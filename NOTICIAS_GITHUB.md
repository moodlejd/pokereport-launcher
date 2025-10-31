# 📰 CONFIGURAR NOTICIAS EN GITHUB

## 🎯 Sistema de Noticias

El launcher obtiene las noticias desde un archivo JSON en GitHub.

---

## 📋 **PASO 1: Crear Repositorio de Noticias**

### 1. **Ir a GitHub:**
[https://github.com/new](https://github.com/new)

### 2. **Configurar repositorio:**
- **Repository name**: `pokereport-news`
- **Description**: `📰 Noticias para PokeReport Launcher`
- **Public**: ✅
- **Initialize with README**: ✅
- **Create repository**

---

## 📝 **PASO 2: Crear Archivo de Noticias**

### 1. **En tu repositorio, click "Add file" → "Create new file"**

### 2. **Filename**: `news.json`

### 3. **Contenido** (copia y pega):

```json
[
  {
    "id": 1,
    "title": "¡Bienvenido a PokeReport!",
    "description": "Launcher Python con React. Audio e idioma español garantizados. CustomSkinLoader integrado para skins personalizadas.",
    "image": "./background.png",
    "date": "2025-10-31",
    "link": "https://discord.gg/njfPQMAhQV"
  },
  {
    "id": 2,
    "title": "Sistema de Skins Mejorado",
    "description": "Soporta TLauncher, CustomSkinLoader y carga de skins personalizadas. Usa el botón 📤 para subir tu propia skin.",
    "image": "./fondo2.png",
    "date": "2025-10-31",
    "link": "#"
  },
  {
    "id": 3,
    "title": "Servidor PokeReport - 120+ Mods",
    "description": "Explora el mundo de Pokémon en Minecraft. Captura, entrena y batalla. IP: 199.127.60.252:25569",
    "image": "./pokeball-icon.png",
    "date": "2025-10-30",
    "link": "https://discord.gg/njfPQMAhQV"
  }
]
```

### 4. **Commit changes** → "Add news.json"

---

## 🔗 **PASO 3: Obtener URL del Archivo**

Tu archivo estará disponible en:
```
https://raw.githubusercontent.com/TU_USUARIO/pokereport-news/main/news.json
```

**Ejemplo:**
```
https://raw.githubusercontent.com/moodlejd/pokereport-news/main/news.json
```

---

## 🔧 **PASO 4: Actualizar el Launcher**

### **Edita**: `src/components/NewsPanel.jsx`

**Busca la línea ~45:**
```javascript
const response = await fetch('/api/fetch-url/pokereport.com/api/news.json');
```

**Cámbiala por:**
```javascript
const response = await fetch('/api/fetch-url/raw.githubusercontent.com/TU_USUARIO/pokereport-news/main/news.json');
```

**Ejemplo completo:**
```javascript
const response = await fetch('/api/fetch-url/raw.githubusercontent.com/moodlejd/pokereport-news/main/news.json');
```

---

## 🔄 **PASO 5: Recompilar**

```bash
npm run build
```

**Reinicia el launcher** y las noticias se cargarán desde GitHub.

---

## ✏️ **Actualizar Noticias**

### **Método 1: Desde GitHub Web**
1. Ve a tu repositorio `pokereport-news`
2. Click en `news.json`
3. Click en ✏️ (Edit)
4. Modifica el JSON
5. **Commit changes**

### **Método 2: Git Local**
```bash
cd pokereport-news
# Edita news.json
git add news.json
git commit -m "Update news"
git push
```

**Los usuarios verán las nuevas noticias automáticamente.**

---

## 📸 **BONUS: Usar Imágenes Propias**

### **Opción 1: Imgur** (Recomendado)
1. Sube imágenes a [imgur.com](https://imgur.com)
2. Copia URL directa
3. Úsala en `"image": "https://i.imgur.com/XXXXX.jpg"`

### **Opción 2: GitHub**
1. En tu repo, crea carpeta `images/`
2. Sube imágenes
3. URL: `https://raw.githubusercontent.com/TU_USUARIO/pokereport-news/main/images/imagen.jpg`

### **Opción 3: Assets locales** (como ahora)
```json
"image": "./background.png"
```
Usa assets que ya están en el launcher.

---

## 📊 **Formato del JSON**

```json
[
  {
    "id": 1,                    // ID único (numérico)
    "title": "Título",          // Título de la noticia
    "description": "Texto",     // Descripción (max ~200 chars)
    "image": "URL o ./asset",   // URL de imagen o asset local
    "date": "2025-10-31",       // Fecha YYYY-MM-DD
    "link": "URL o #"           // Enlace externo o # para solo modal
  }
]
```

---

## ✅ **Ejemplo Completo**

```json
[
  {
    "id": 1,
    "title": "Actualización 1.21.1",
    "description": "Servidor actualizado a Minecraft 1.21.1 con nuevos mods y mejoras de rendimiento.",
    "image": "https://i.imgur.com/ejemplo.jpg",
    "date": "2025-11-01",
    "link": "https://discord.gg/tupserver"
  },
  {
    "id": 2,
    "title": "Evento de Legendarios",
    "description": "Este fin de semana spawn aumentado de Pokémon legendarios. ¡No te lo pierdas!",
    "image": "./pokeball-icon.png",
    "date": "2025-10-31",
    "link": "#"
  }
]
```

---

**¡Listo! Sistema de noticias profesional alojado en GitHub.**
