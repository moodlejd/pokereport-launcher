#!/usr/bin/env python3
"""
PokeReport Launcher - Python Backend Simplificado
Sin dependencias complejas que requieran compilación
"""

import os
import json
import subprocess
import shutil
import zipfile
import hashlib
import time
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.request
import urllib.parse
import urllib.error
import threading
import webbrowser

# Configuración
USERNAME = os.environ["USERNAME"]
MINECRAFT_DIR = f"C:/Users/{USERNAME}/AppData/Roaming/.pokereport"
MODPACK_URL = "https://github.com/moodlejd/PokeReport-mods/releases/download/REPORTPACK/pokereport.mrpack"
MINECRAFT_VERSION = "1.21.1"
DEFAULT_FABRIC_VERSION = "0.17.3"

# Crear directorio
Path(MINECRAFT_DIR).mkdir(parents=True, exist_ok=True)

# Estado global
launcher_state = {
    "is_installing": False,
    "is_launching": False,
    "progress": {"percent": 0, "message": ""}
}

def generate_offline_uuid(username: str) -> str:
    """Generar UUID consistente para offline"""
    hash_obj = hashlib.md5(f"OfflinePlayer:{username}".encode())
    hex_str = hash_obj.hexdigest()
    return f"{hex_str[:8]}-{hex_str[8:12]}-{hex_str[12:16]}-{hex_str[16:20]}-{hex_str[20:32]}"

def get_legacy_minecraft_dirs():
    """Buscar instalaciones previas de Minecraft"""
    candidates = [
        Path(os.environ["USERPROFILE"]) / "AppData" / "Roaming" / ".minecraft",
        Path(os.environ["USERPROFILE"]) / "Desktop" / ".minecraft"
    ]
    
    existing = []
    for candidate in candidates:
        if candidate.exists():
            existing.append(str(candidate))
    
    return existing

def load_legacy_account_info():
    """Detectar usuario desde TLauncher/Launcher oficial"""
    legacy_dirs = get_legacy_minecraft_dirs()
    
    for dir_path in legacy_dirs:
        # TLauncher
        tlauncher_path = Path(dir_path) / "TlauncherProfiles.json"
        if tlauncher_path.exists():
            try:
                data = json.loads(tlauncher_path.read_text())
                if data.get("accounts"):
                    selected_uuid = data.get("selectedAccountUUID") or data.get("freeAccountUUID")
                    if selected_uuid and selected_uuid in data["accounts"]:
                        return data["accounts"][selected_uuid]
            except:
                continue
        
        # Launcher oficial
        launcher_profiles = Path(dir_path) / "launcher_profiles.json"
        if launcher_profiles.exists():
            try:
                data = json.loads(launcher_profiles.read_text())
                profiles = data.get("profiles", {})
                selected = data.get("selectedProfile")
                if selected and selected in profiles and profiles[selected].get("name"):
                    return {"username": profiles[selected]["name"]}
            except:
                continue
    
    return None

def resolve_username(user_data=None, meta=None):
    """Resolver username desde múltiples fuentes"""
    if user_data and user_data.get("username") and len(user_data["username"].strip()) >= 3:
        return user_data["username"].strip()
    
    if meta and meta.get("lastUsername") and len(meta["lastUsername"].strip()) >= 3:
        return meta["lastUsername"].strip()
    
    legacy_account = load_legacy_account_info()
    if legacy_account:
        if legacy_account.get("username") and len(legacy_account["username"].strip()) >= 3:
            return legacy_account["username"].strip()
        if legacy_account.get("displayName") and len(legacy_account["displayName"].strip()) >= 3:
            return legacy_account["displayName"].strip()
    
    # Fallback
    import secrets
    return f"Jugador_{secrets.token_hex(3)}"

def download_file_with_progress(url: str, destination: Path, progress_callback=None):
    """Descargar archivo con progreso"""
    print(f"Descargando {url} -> {destination}")
    
    def progress_hook(block_num, block_size, total_size):
        if total_size > 0 and progress_callback:
            downloaded = block_num * block_size
            percent = (downloaded / total_size) * 100
            mb_downloaded = downloaded / (1024 * 1024)
            mb_total = total_size / (1024 * 1024)
            progress_callback(percent, f"Descargando: {mb_downloaded:.1f}/{mb_total:.1f} MB ({percent:.1f}%)")
    
    destination.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(url, destination, progress_hook)

def prepare_modpack(install_dir: Path, progress_callback=None):
    """Preparar modpack - IGUAL que main.js"""
    print("🚀 INICIANDO INSTALACIÓN DE MODPACK")
    
    # Crear directorio temporal
    temp_dir = Path(os.environ["TEMP"]) / "pokereport-launcher"
    temp_dir.mkdir(exist_ok=True)
    
    mrpack_path = temp_dir / "pokereport.mrpack"
    
    # Descargar modpack
    if progress_callback:
        progress_callback(5, "Descargando modpack...")
    
    download_file_with_progress(MODPACK_URL, mrpack_path, progress_callback)
    
    if progress_callback:
        progress_callback(45, "Extrayendo paquete...")
    
    # Extraer modpack
    extract_dir = temp_dir / "mrpack-extract"
    if extract_dir.exists():
        shutil.rmtree(extract_dir)
    extract_dir.mkdir()
    
    with zipfile.ZipFile(mrpack_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)
    
    # Buscar contenido principal
    content_dirs = ["overrides", ".minecraft", "minecraft"]
    content_source = None
    
    for content_dir in content_dirs:
        candidate = extract_dir / content_dir
        if candidate.exists():
            content_source = candidate
            break
    
    if not content_source:
        content_source = extract_dir
    
    if progress_callback:
        progress_callback(65, "Copiando archivos del modpack...")
    
    # Copiar todo el contenido
    install_dir.mkdir(exist_ok=True)
    for item in content_source.iterdir():
        dest = install_dir / item.name
        if item.is_dir():
            if dest.exists():
                shutil.copytree(item, dest, dirs_exist_ok=True)
            else:
                shutil.copytree(item, dest)
        else:
            shutil.copy2(item, dest)
    
    if progress_callback:
        progress_callback(75, "Configurando opciones del juego...")
    
    # Crear options.txt con audio e idioma
    options_path = install_dir / "options.txt"
    options_content = """version:3955
ao:true
biomeBlendRadius:2
enableVsync:true
entityDistanceScaling:1.0
entityShadows:true
forceUnicodeFont:false
japaneseGlyphVariants:false
fov:0.0
fovEffectScale:1.0
darknessEffectScale:1.0
glintSpeed:0.5
glintStrength:0.75
prioritizeChunkUpdates:0
fullscreen:false
gamma:0.5
graphicsMode:1
guiScale:0
maxFps:120
mipmapLevels:4
narrator:0
particles:0
reducedDebugInfo:false
renderClouds:"true"
renderDistance:12
simulationDistance:12
screenEffectScale:1.0
soundDevice:""
autoJump:false
operatorItemsTab:false
autoSuggestions:true
chatColors:true
chatLinks:true
chatLinksPrompt:true
discrete_mouse_scroll:false
invertYMouse:false
realmsNotifications:true
showSubtitles:false
directionalAudio:false
touchscreen:false
bobView:true
toggleCrouch:false
toggleSprint:false
darkMojangStudiosBackground:false
hideLightningFlashes:false
hideSplashTexts:false
mouseSensitivity:0.5
damageTiltStrength:1.0
highContrast:false
narratorHotkey:true
resourcePacks:[]
incompatibleResourcePacks:[]
lastServer:
lang:es_es
chatVisibility:0
chatOpacity:1.0
chatLineSpacing:0.0
textBackgroundOpacity:0.5
backgroundForChatOnly:true
hideServerAddress:false
advancedItemTooltips:false
pauseOnLostFocus:true
overrideWidth:0
overrideHeight:0
chatHeightFocused:1.0
chatDelay:0.0
chatHeightUnfocused:0.4375
chatScale:1.0
chatWidth:1.0
notificationDisplayTime:1.0
useNativeTransport:true
mainHand:"right"
attackIndicator:1
tutorialStep:movement
mouseWheelSensitivity:1.0
rawMouseInput:true
glDebugVerbosity:1
skipMultiplayerWarning:false
hideMatchedNames:true
joinedFirstServer:false
hideBundleTutorial:false
syncChunkWrites:true
showAutosaveIndicator:true
allowServerListing:true
onlyShowSecureChat:false
panoramaScrollSpeed:1.0
telemetryOptInExtra:false
onboardAccessibility:false
menuBackgroundBlurriness:5
soundCategory_master:1.0
soundCategory_music:1.0
soundCategory_record:1.0
soundCategory_weather:1.0
soundCategory_block:1.0
soundCategory_hostile:1.0
soundCategory_neutral:1.0
soundCategory_player:1.0
soundCategory_ambient:1.0
soundCategory_voice:1.0
modelPart_cape:true
modelPart_jacket:true
modelPart_left_sleeve:true
modelPart_right_sleeve:true
modelPart_left_pants_leg:true
modelPart_right_pants_leg:true
modelPart_hat:true"""
    
    with open(options_path, 'w', encoding='utf-8') as f:
        f.write(options_content)
    
    # Limpiar temporales
    shutil.rmtree(temp_dir, ignore_errors=True)
    
    if progress_callback:
        progress_callback(95, "Modpack listo")
    
    # Detectar versión instalada
    versions_dir = install_dir / "versions"
    detected_version = None
    
    if versions_dir.exists():
        for version_dir in versions_dir.iterdir():
            if version_dir.is_dir() and "fabric" in version_dir.name.lower():
                detected_version = version_dir.name
                break
    
    return {
        "minecraftVersion": MINECRAFT_VERSION,
        "fabricVersion": DEFAULT_FABRIC_VERSION,
        "versionId": detected_version
    }

def fix_fabric_json_if_needed(install_dir):
    """Arreglar JSON de Fabric si tiene problemas"""
    versions_dir = install_dir / "versions"
    
    for version_dir in versions_dir.iterdir():
        if version_dir.is_dir() and "fabric" in version_dir.name.lower():
            json_path = version_dir / f"{version_dir.name}.json"
            
            try:
                with open(json_path, 'r') as f:
                    data = json.load(f)
                
                # Verificar si necesita arreglo
                if "arguments" in data:
                    needs_fix = False
                    
                    # Verificar argumentos JVM
                    if "jvm" in data["arguments"]:
                        for arg in data["arguments"]["jvm"]:
                            if isinstance(arg, dict) and "value" not in arg:
                                needs_fix = True
                                break
                    
                    if needs_fix:
                        print("Arreglando JSON de Fabric...")
                        
                        # Argumentos seguros
                        data["arguments"]["jvm"] = [
                            "-Djava.library.path=${natives_directory}",
                            "-Dminecraft.launcher.brand=${launcher_name}",
                            "-Dminecraft.launcher.version=${launcher_version}",
                            "-cp",
                            "${classpath}"
                        ]
                        
                        data["arguments"]["game"] = [
                            "--username", "${auth_player_name}",
                            "--version", "${version_name}",
                            "--gameDir", "${game_directory}",
                            "--assetsDir", "${assets_root}",
                            "--assetIndex", "${assets_index_name}",
                            "--uuid", "${auth_uuid}",
                            "--accessToken", "${auth_access_token}",
                            "--userType", "${user_type}",
                            "--versionType", "${version_type}"
                        ]
                        
                        # Guardar arreglado
                        with open(json_path, 'w') as f:
                            json.dump(data, f, indent=2)
                        
                        print("JSON de Fabric arreglado")
                
            except Exception as e:
                print(f"Error arreglando JSON: {e}")

def launch_minecraft_process(user_data, config_data):
    """Lanzar Minecraft usando minecraft-launcher-lib"""
    try:
        print(f"Intentando lanzar Minecraft...")
        print(f"user_data: {user_data}")
        print(f"config_data: {config_data}")
        
        # Verificar que tenemos minecraft-launcher-lib
        try:
            import minecraft_launcher_lib
            print("minecraft-launcher-lib importado correctamente")
        except ImportError as e:
            return {"success": False, "error": f"minecraft-launcher-lib no instalado: {e}"}
        
        install_dir = Path(MINECRAFT_DIR)
        print(f"Directorio: {install_dir}")
        
        # Arreglar JSON de Fabric si es necesario
        fix_fabric_json_if_needed(install_dir)
        
        # Detectar versión instalada
        versions_dir = install_dir / "versions"
        version_id = None
        
        if versions_dir.exists():
            print(f"📂 Buscando versiones en: {versions_dir}")
            version_dirs = list(versions_dir.iterdir())
            print(f"📋 Directorios encontrados: {[d.name for d in version_dirs if d.is_dir()]}")
            
            for version_dir in version_dirs:
                if version_dir.is_dir() and "fabric" in version_dir.name.lower():
                    version_id = version_dir.name
                    print(f"✅ Versión detectada: {version_id}")
                    break
        
        if not version_id:
            # Fallback: usar versión por defecto
            version_id = f"fabric-loader-{DEFAULT_FABRIC_VERSION}-{MINECRAFT_VERSION}"
            print(f"⚠️ No se encontró versión instalada, usando: {version_id}")
        
        # Resolver username
        username = resolve_username(user_data)
        ram = config_data.get("ram", 6)
        
        print(f"🎮 Configuración final:")
        print(f"  Usuario: {username}")
        print(f"  RAM: {ram}G")
        print(f"  Versión: {version_id}")
        print(f"  Directorio: {install_dir}")
        
        # Verificar que la versión existe y es válida
        version_json = install_dir / "versions" / version_id / f"{version_id}.json"
        if not version_json.exists():
            return {"success": False, "error": f"Versión {version_id} no encontrada en {version_json}"}
        
        # Verificar y arreglar el JSON de versión si es necesario
        try:
            with open(version_json, 'r') as f:
                version_data = json.load(f)
            print(f"JSON de version valido: {version_data.get('id', 'unknown')}")
            
            # Verificar y arreglar argumentos JVM malformados
            if "arguments" in version_data and "jvm" in version_data["arguments"]:
                jvm_args = version_data["arguments"]["jvm"]
                fixed_args = []
                
                for arg in jvm_args:
                    if isinstance(arg, dict):
                        # Argumentos condicionales - verificar formato
                        if "value" not in arg:
                            # Arreglar argumento malformado
                            if "rules" in arg:
                                # Agregar value por defecto
                                arg["value"] = ""
                        fixed_args.append(arg)
                    else:
                        # Argumento simple (string)
                        fixed_args.append(arg)
                
                # Guardar JSON arreglado si hubo cambios
                if len(fixed_args) != len(jvm_args):
                    print("Arreglando argumentos JVM malformados...")
                    version_data["arguments"]["jvm"] = fixed_args
                    
                    # Backup del original
                    backup_path = version_json.with_suffix('.json.backup')
                    if not backup_path.exists():
                        with open(backup_path, 'w') as f:
                            json.dump(version_data, f, indent=2)
                    
                    # Guardar versión arreglada
                    with open(version_json, 'w') as f:
                        json.dump(version_data, f, indent=2)
                    
                    print("JSON de version arreglado")
                
        except Exception as e:
            return {"success": False, "error": f"Error procesando JSON: {e}"}
        
        # Verificar Java
        java_path = shutil.which("java")
        if not java_path:
            return {"success": False, "error": "Java no encontrado en PATH. Instala Java 17+ desde https://adoptium.net"}
        
        print(f"☕ Java encontrado: {java_path}")
        
        # Verificar librerías básicas
        libraries_dir = install_dir / "libraries"
        if not libraries_dir.exists():
            print("⚠️ Directorio libraries no existe, minecraft-launcher-lib lo creará")
        else:
            lib_count = len(list(libraries_dir.rglob("*.jar")))
            print(f"📚 Librerías encontradas: {lib_count}")
        
        # Verificar assets básicos
        assets_dir = install_dir / "assets"
        if not assets_dir.exists():
            print("⚠️ Directorio assets no existe, minecraft-launcher-lib lo creará")
        else:
            print(f"🎨 Directorio assets: ✅")
        
        # Configurar opciones en el formato correcto para minecraft-launcher-lib 6.2
        offline_uuid = generate_offline_uuid(username)
        
        if user_data.get("isPremium") and user_data.get("accessToken"):
            print("🔐 Modo: Premium")
            options = {
                "username": username,
                "uuid": user_data.get("uuid", offline_uuid),
                "token": user_data.get("accessToken", ""),
                "jvmArguments": [
                    f"-Xmx{ram}G",
                    f"-Xms{ram}G",
                    "-XX:+UseG1GC",
                    "-XX:+ParallelRefProcEnabled",
                    "-XX:MaxGCPauseMillis=200",
                    "-XX:+UnlockExperimentalVMOptions",
                    "-XX:+DisableExplicitGC"
                ]
            }
        else:
            print("🎮 Modo: Offline")
            options = {
                "username": username,
                "uuid": offline_uuid,
                "token": "",
                "jvmArguments": [
                    f"-Xmx{ram}G",
                    f"-Xms{ram}G",
                    "-XX:+UseG1GC",
                    "-XX:+ParallelRefProcEnabled",
                    "-XX:MaxGCPauseMillis=200",
                    "-XX:+UnlockExperimentalVMOptions",
                    "-XX:+DisableExplicitGC"
                ]
            }
        
        print(f"🔧 Opciones de lanzamiento:")
        for key, value in options.items():
            if key == 'jvmArguments':
                print(f"  {key}: {value[:3]}... ({len(value)} args)")
            else:
                print(f"  {key}: {value}")
        
        # Generar comando con manejo de errores detallado
        try:
            print(f"🔄 Generando comando para versión: {version_id}")
            print(f"🔄 Directorio: {install_dir}")
            
            command = minecraft_launcher_lib.command.get_minecraft_command(
                version_id,
                str(install_dir),
                options
            )
            print(f"📋 Comando generado exitosamente ({len(command)} argumentos)")
            print(f"📋 Primeros argumentos: {' '.join(command[:5])}...")
            
        except ValueError as e:
            print(f"❌ ValueError en comando: {e}")
            return {"success": False, "error": f"Error de configuración: {e}. Verifica que la versión {version_id} esté correctamente instalada."}
        except KeyError as e:
            print(f"❌ KeyError en comando: {e}")
            return {"success": False, "error": f"Clave faltante en configuración: {e}"}
        except Exception as e:
            print(f"❌ Error general en comando: {e}")
            import traceback
            traceback.print_exc()
            return {"success": False, "error": f"Error generando comando: {e}"}
        
        # Lanzar proceso
        try:
            process = subprocess.Popen(
                command,
                cwd=str(install_dir),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            print(f"✅ Minecraft lanzado con PID {process.pid}")
            
            return {
                "success": True,
                "pid": process.pid,
                "username": username,
                "version": version_id
            }
        except Exception as e:
            return {"success": False, "error": f"Error ejecutando proceso: {e}"}
    
    except Exception as e:
        print(f"❌ Error general: {e}")
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}

class SimpleAPIHandler(SimpleHTTPRequestHandler):
    """Manejador HTTP simple que reemplaza FastAPI"""
    
    def do_GET(self):
        if self.path == "/api/status":
            self.handle_status()
        elif self.path == "/api/legacy-accounts":
            self.handle_legacy_accounts()
        elif self.path.startswith("/api/custom-skin/"):
            # Servir skin personalizada
            username = self.path[17:]  # Remover /api/custom-skin/
            self.handle_custom_skin(username)
        elif self.path.startswith("/api/fetch-url/"):
            url = self.path[15:]  # Remover /api/fetch-url/
            self.handle_fetch_url(url)
        elif self.path.startswith("/tlauncher-api/"):
            # Proxy directo a TLauncher para skins
            tlauncher_path = self.path[15:]  # Remover /tlauncher-api/
            self.handle_tlauncher_proxy(tlauncher_path)
        elif self.path == "/favicon.ico":
            # Servir favicon desde public
            try:
                self.path = "/public/pokeball-icon.png"
                super().do_GET()
            except:
                self.send_error(404)
        else:
            # Servir archivos estáticos de React
            if self.path == "/" or self.path == "/index.html":
                self.path = "/index.html"
            
            # Servir desde dist/
            try:
                self.path = "/dist" + self.path
                super().do_GET()
            except:
                # Fallback a index.html para React Router
                self.path = "/dist/index.html"
                super().do_GET()
    
    def do_POST(self):
        if self.path == "/api/launch-minecraft":
            self.handle_launch_minecraft()
        elif self.path == "/api/start-minecraft-game":
            self.handle_start_minecraft_game()
        elif self.path == "/api/save-config":
            self.handle_save_config()
        elif self.path == "/api/microsoft-device-code":
            self.handle_microsoft_device_code()
        elif self.path == "/api/microsoft-poll-token":
            self.handle_microsoft_poll_token()
        elif self.path == "/api/upload-custom-skin":
            self.handle_upload_custom_skin()
        else:
            self.send_error(404)
    
    def handle_status(self):
        """Estado del launcher"""
        install_dir = Path(MINECRAFT_DIR)
        versions_dir = install_dir / "versions"
        mods_dir = install_dir / "mods"
        
        fabric_version = None
        if versions_dir.exists():
            for version_dir in versions_dir.iterdir():
                if version_dir.is_dir() and "fabric" in version_dir.name.lower():
                    fabric_version = version_dir.name
                    break
        
        mod_count = 0
        if mods_dir.exists():
            mod_count = len([f for f in mods_dir.iterdir() if f.suffix == '.jar'])
        
        response = {
            "minecraft_dir": str(install_dir),
            "fabric_version": fabric_version,
            "mod_count": mod_count,
            "is_installed": fabric_version is not None and mod_count > 0,
            "is_installing": launcher_state["is_installing"],
            "is_launching": launcher_state["is_launching"],
            "progress": launcher_state["progress"]
        }
        
        self.send_json_response(response)
    
    def handle_legacy_accounts(self):
        """Cuentas legacy detectadas"""
        legacy_dirs = get_legacy_minecraft_dirs()
        accounts = []
        
        for legacy_dir in legacy_dirs:
            legacy_path = Path(legacy_dir)
            
            # TLauncher
            tlauncher_path = legacy_path / "TlauncherProfiles.json"
            if tlauncher_path.exists():
                try:
                    data = json.loads(tlauncher_path.read_text())
                    if data.get("accounts"):
                        selected_uuid = data.get("selectedAccountUUID") or data.get("freeAccountUUID")
                        if selected_uuid and selected_uuid in data["accounts"]:
                            account = data["accounts"][selected_uuid]
                            accounts.append({
                                "username": account.get("username") or account.get("displayName"),
                                "source": "TLauncher",
                                "path": str(legacy_dir)
                            })
                except:
                    pass
        
        self.send_json_response({"accounts": accounts})
    
    def handle_launch_minecraft(self):
        """Instalar modpack"""
        if launcher_state["is_installing"]:
            self.send_json_response({"success": False, "error": "Ya hay una instalación en progreso"})
            return
        
        launcher_state["is_installing"] = True
        
        try:
            # Leer datos del POST
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            install_dir = Path(MINECRAFT_DIR)
            
            def progress_callback(percent, message):
                launcher_state["progress"] = {"percent": percent, "message": message}
                print(f"[{percent:.1f}%] {message}")
            
            # Preparar modpack
            result = prepare_modpack(install_dir, progress_callback)
            
            self.send_json_response({
                "success": True,
                **result
            })
        
        except Exception as e:
            print(f"❌ Error: {e}")
            self.send_json_response({"success": False, "error": str(e)})
        
        finally:
            launcher_state["is_installing"] = False
    
    def handle_start_minecraft_game(self):
        """Lanzar Minecraft"""
        try:
            # Leer datos del POST
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_json_response({"success": False, "error": "No data received"})
                return
                
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            print(f"📨 Datos recibidos: {json.dumps(request_data, indent=2)}")
            
            user_data = request_data.get("user", {})
            config_data = request_data.get("config", {})
            
            # Validar datos mínimos
            if not user_data.get("username"):
                self.send_json_response({"success": False, "error": "Username requerido"})
                return
            
            result = launch_minecraft_process(user_data, config_data)
            self.send_json_response(result)
        
        except json.JSONDecodeError as e:
            print(f"❌ Error JSON: {e}")
            self.send_json_response({"success": False, "error": f"JSON inválido: {str(e)}"})
        except Exception as e:
            print(f"❌ Error general: {e}")
            import traceback
            traceback.print_exc()
            self.send_json_response({"success": False, "error": str(e)})
    
    def handle_save_config(self):
        """Guardar configuración"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            config_data = json.loads(post_data.decode('utf-8'))
            
            config_path = Path(os.environ["USERPROFILE"]) / "AppData" / "Local" / "pokereport-launcher" / "config.json"
            config_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(config_path, 'w') as f:
                json.dump(config_data, f, indent=2)
            
            self.send_json_response({"success": True})
        
        except Exception as e:
            self.send_json_response({"success": False, "error": str(e)})
    
    def handle_fetch_url(self, url):
        """Proxy para URLs externas"""
        try:
            # Manejar rutas específicas
            if url.startswith("tlauncher.org/catalog/"):
                # Proxy a TLauncher
                full_url = f"https://{url}"
                response = urllib.request.urlopen(full_url)
                
                # Si es imagen, enviar directamente
                if url.endswith(('.png', '.jpg', '.jpeg')):
                    self.send_response(200)
                    self.send_header('Content-Type', 'image/png')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(response.read())
                    return
                
                data = response.read().decode('utf-8')
            else:
                response = urllib.request.urlopen(f"https://{url}")
                data = response.read().decode('utf-8')
            
            try:
                json_data = json.loads(data)
                self.send_json_response({"success": True, "data": json_data, "raw": data})
            except:
                self.send_json_response({"success": True, "data": None, "raw": data})
        
        except Exception as e:
            print(f"Error en proxy: {e}")
            self.send_json_response({"success": False, "error": str(e)})
    
    def handle_tlauncher_proxy(self, tlauncher_path):
        """Proxy específico para TLauncher skins - MEJORADO"""
        try:
            # Construir URL completa
            full_url = f"https://tlauncher.org/{tlauncher_path}"
            print(f"🔍 Proxy TLauncher: {full_url}")
            
            # Crear request con headers apropiados
            req = urllib.request.Request(
                full_url,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/png,image/*,*/*',
                    'Referer': 'https://tlauncher.org/'
                }
            )
            
            response = urllib.request.urlopen(req, timeout=10)
            content = response.read()
            
            print(f"✅ TLauncher respuesta: {len(content)} bytes")
            
            # Si es imagen, enviar directamente
            if tlauncher_path.endswith(('.png', '.jpg', '.jpeg')):
                # Verificar que realmente es una imagen válida (no Steve por defecto)
                if len(content) > 500:  # Steve tiene ~400 bytes, skins reales son más grandes
                    self.send_response(200)
                    self.send_header('Content-Type', 'image/png')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Cache-Control', 'no-cache')
                    self.end_headers()
                    self.wfile.write(content)
                    print(f"✅ Skin de TLauncher enviada ({len(content)} bytes)")
                else:
                    print(f"⚠️ Skin muy pequeña ({len(content)} bytes), probablemente Steve por defecto")
                    raise Exception("Skin por defecto, intentar siguiente servicio")
            else:
                # JSON u otros datos
                data = content.decode('utf-8')
                self.send_json_response({"success": True, "data": data})
        
        except Exception as e:
            print(f"❌ Error en TLauncher proxy: {e}")
            print(f"   Intentando fallback a Auth API...")
            
            # SIEMPRE intentar TLauncher Auth API (como CustomSkinLoader)
            if tlauncher_path.endswith('.png'):
                username = tlauncher_path.split('_')[-1].replace('.png', '')
                
                try:
                    # TLauncher Auth API - IGUAL que CustomSkinLoader
                    auth_url = f"https://auth.tlauncher.org/skin/profile/texture/login/{username}"
                    print(f"🔄 TLauncher Auth API: {auth_url}")
                    
                    auth_req = urllib.request.Request(
                        auth_url,
                        headers={
                            'User-Agent': 'CustomSkinLoader/14.26',
                            'Accept': 'application/json'
                        }
                    )
                    
                    auth_response = urllib.request.urlopen(auth_req, timeout=10)
                    auth_data = json.loads(auth_response.read().decode('utf-8'))
                    
                    print(f"📦 Respuesta Auth API: {auth_data}")
                    
                    if 'SKIN' in auth_data and 'url' in auth_data['SKIN']:
                        skin_url = auth_data['SKIN']['url']
                        print(f"✅ Skin URL: {skin_url}")
                        
                        # Descargar skin desde fileservice
                        skin_req = urllib.request.Request(
                            skin_url,
                            headers={
                                'User-Agent': 'CustomSkinLoader/14.26',
                                'Referer': 'https://auth.tlauncher.org/'
                            }
                        )
                        skin_response = urllib.request.urlopen(skin_req, timeout=10)
                        skin_content = skin_response.read()
                        
                        print(f"✅ Skin descargada: {len(skin_content)} bytes")
                        
                        # Verificar que no es Steve por defecto
                        if len(skin_content) > 1000:  # Skins reales son > 1KB
                            self.send_response(200)
                            self.send_header('Content-Type', 'image/png')
                            self.send_header('Access-Control-Allow-Origin', '*')
                            self.send_header('Cache-Control', 'no-cache')
                            self.end_headers()
                            self.wfile.write(skin_content)
                            print(f"✅ Skin de TLauncher enviada correctamente")
                            return
                        else:
                            print(f"⚠️ Skin muy pequeña, probablemente Steve")
                        
                except Exception as auth_error:
                    print(f"❌ TLauncher Auth API falló: {auth_error}")
                    import traceback
                    traceback.print_exc()
            
            self.send_error(404)
    
    def handle_microsoft_device_code(self):
        """Solicitar device code a Microsoft (sin CORS)"""
        try:
            # Obtener client_id del request
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
                client_id = request_data.get('client_id', '15d53ab4-cfad-4757-88a2-904139d4ca9d')
                scope = request_data.get('scope', 'XboxLive.signin offline_access')
            else:
                client_id = '15d53ab4-cfad-4757-88a2-904139d4ca9d'
                scope = 'XboxLive.signin offline_access'
            
            # Solicitar device code a Microsoft
            params = urllib.parse.urlencode({
                'client_id': client_id,
                'scope': scope
            })
            
            request = urllib.request.Request(
                'https://login.microsoftonline.com/consumers/oauth2/v2.0/devicecode',
                data=params.encode('utf-8'),
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            response = urllib.request.urlopen(request)
            data = json.loads(response.read().decode('utf-8'))
            
            print(f"Device code obtenido: {data.get('user_code')}")
            
            self.send_json_response({"success": True, **data})
            
        except Exception as e:
            print(f"Error obteniendo device code: {e}")
            self.send_json_response({"success": False, "error": str(e)})
    
    def handle_microsoft_poll_token(self):
        """Poll para obtener token (sin CORS)"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            client_id = request_data.get('client_id', '15d53ab4-cfad-4757-88a2-904139d4ca9d')
            device_code = request_data.get('device_code')
            
            if not device_code:
                self.send_json_response({"success": False, "error": "device_code requerido"})
                return
            
            # Solicitar token
            params = urllib.parse.urlencode({
                'client_id': client_id,
                'grant_type': 'urn:ietf:params:oauth:grant-type:device_code',
                'device_code': device_code
            })
            
            request = urllib.request.Request(
                'https://login.microsoftonline.com/consumers/oauth2/v2.0/token',
                data=params.encode('utf-8'),
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            response = urllib.request.urlopen(request)
            data = json.loads(response.read().decode('utf-8'))
            
            if 'error' in data:
                # Errores esperados durante polling
                self.send_json_response({"success": False, **data})
            else:
                print(f"Token obtenido exitosamente")
                self.send_json_response({"success": True, **data})
            
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            try:
                error_data = json.loads(error_body)
                self.send_json_response({"success": False, **error_data})
            except:
                self.send_json_response({"success": False, "error": error_body})
        except Exception as e:
            print(f"Error polling token: {e}")
            self.send_json_response({"success": False, "error": str(e)})
    
    def handle_custom_skin(self, username):
        """Servir skin personalizada del usuario - BUSCA EN MULTIPLES UBICACIONES"""
        try:
            # Buscar skin en múltiples ubicaciones de CustomSkinLoader
            skin_locations = [
                # PokeReport launcher
                Path(MINECRAFT_DIR) / "CustomSkinLoader" / "LocalSkin" / "skins" / f"{username}.png",
                Path(MINECRAFT_DIR) / "CustomSkinLoader" / "skins" / f"{username}.png",
                # Launcher anterior (.minecraftLauncher)
                Path(os.environ["USERPROFILE"]) / "AppData" / "Roaming" / ".minecraftLauncher" / "CustomSkinLoader" / "LocalSkin" / "skins" / f"{username}.png",
                Path(os.environ["USERPROFILE"]) / "AppData" / "Roaming" / ".minecraftLauncher" / "CustomSkinLoader" / "skins" / f"{username}.png",
                # TLauncher
                Path(os.environ["USERPROFILE"]) / "AppData" / "Roaming" / ".minecraft" / "CustomSkinLoader" / "LocalSkin" / "skins" / f"{username}.png",
            ]
            
            for skin_path in skin_locations:
                if skin_path.exists():
                    print(f"✅ Skin personalizada encontrada: {skin_path}")
                    self.send_response(200)
                    self.send_header('Content-Type', 'image/png')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Cache-Control', 'no-cache')
                    self.end_headers()
                    
                    with open(skin_path, 'rb') as f:
                        content = f.read()
                        self.wfile.write(content)
                        print(f"📤 Skin enviada: {len(content)} bytes")
                    return
            
            print(f"❌ No se encontró skin personalizada para {username} en ninguna ubicación")
            self.send_error(404)
                
        except Exception as e:
            print(f"Error sirviendo skin personalizada: {e}")
            import traceback
            traceback.print_exc()
            self.send_error(404)
    
    def handle_upload_custom_skin(self):
        """Subir skin personalizada"""
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            username = request_data.get('username')
            skin_base64 = request_data.get('skin')  # Imagen en base64
            
            if not username or not skin_base64:
                self.send_json_response({"success": False, "error": "username y skin requeridos"})
                return
            
            # Crear directorio para CustomSkinLoader
            custom_skins_dir = Path(MINECRAFT_DIR) / "CustomSkinLoader" / "skins"
            custom_skins_dir.mkdir(parents=True, exist_ok=True)
            
            # Decodificar y guardar skin
            import base64
            skin_data = base64.b64decode(skin_base64.split(',')[1] if ',' in skin_base64 else skin_base64)
            
            skin_path = custom_skins_dir / f"{username}.png"
            with open(skin_path, 'wb') as f:
                f.write(skin_data)
            
            print(f"Skin personalizada guardada para: {username}")
            
            # Crear configuración de CustomSkinLoader si no existe
            csl_config_path = Path(MINECRAFT_DIR) / "CustomSkinLoader" / "CustomSkinLoader.json"
            if not csl_config_path.exists():
                csl_config = {
                    "enable": True,
                    "loadlist": [
                        {
                            "name": "Local Skins",
                            "type": "Legacy",
                            "root": "CustomSkinLoader/skins/"
                        },
                        {
                            "name": "TLauncher",
                            "type": "UniSkinAPI",
                            "root": "https://auth.tlauncher.org/skin/profile/"
                        }
                    ]
                }
                
                with open(csl_config_path, 'w') as f:
                    json.dump(csl_config, f, indent=2)
                
                print("CustomSkinLoader.json creado")
            
            self.send_json_response({
                "success": True,
                "message": f"Skin guardada para {username}",
                "path": str(skin_path)
            })
            
        except Exception as e:
            print(f"Error subiendo skin: {e}")
            import traceback
            traceback.print_exc()
            self.send_json_response({"success": False, "error": str(e)})
    
    def send_json_response(self, data):
        """Enviar respuesta JSON"""
        response = json.dumps(data).encode('utf-8')
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(response))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        self.wfile.write(response)
    
    def do_OPTIONS(self):
        """Manejar preflight CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def start_server():
    """Iniciar servidor HTTP simple"""
    # Cambiar al directorio del proyecto para servir archivos estáticos
    project_dir = Path(__file__).parent.parent
    os.chdir(project_dir)
    
    server = HTTPServer(('localhost', 8000), SimpleAPIHandler)
    
    print("="*70)
    print("🎮 PokeReport Launcher - Python Backend Simple")
    print("="*70)
    print(f"📁 Minecraft: {MINECRAFT_DIR}")
    print(f"🌐 Launcher: http://localhost:8000")
    print(f"🔧 Sin dependencias complejas")
    print("="*70)
    
    # Abrir navegador automáticamente
    def open_browser():
        time.sleep(2)
        webbrowser.open('http://localhost:8000')
    
    threading.Thread(target=open_browser, daemon=True).start()
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido")

if __name__ == "__main__":
    start_server()
