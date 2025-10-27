#!/usr/bin/env python3
"""
PokeReport Launcher - Versión Automatizada con Microsoft Login
Auto-instala Fabric 1.21.1 y descarga modpack automáticamente
Soporta Cuenta Microsoft (premium) y Cuenta No-Premium (sin licencia)
"""

import minecraft_launcher_lib
import os
import sys
import subprocess
import customtkinter as ctk
from tkinter import messagebox
from pathlib import Path
import requests
import zipfile
import json
import uuid as uuid_lib
import threading
import time
from session_manager import SessionManager
from download_optimizer import FastDownloader, DownloadError
from PIL import Image, ImageTk, ImageFilter, ImageEnhance
import tkinter as tk

# Configuración
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# CONFIGURACIÓN PERSONALIZADA
user_window = os.environ["USERNAME"]
# Directorio personalizado en AppData\Roaming (con Python normal, no Store)
MINECRAFT_DIR = f"C:/Users/{user_window}/AppData/Roaming/.pokereport"  # Directorio estándar

# URLs de descarga
MINECRAFT_BASE_URL = "https://github.com/moodlejd/PokeReport-mods/releases/download/REPORTPACK/minecraft.zip"
MODPACK_URL = "https://github.com/moodlejd/PokeReport-mods/releases/download/modpack/pokereport-modpack.mrpack"

MINECRAFT_VERSION = "1.21.1"

# La carpeta se creará dentro del __init__ de la clase para garantizar que exista

# Noticias y actualizaciones (simuladas - puedes conectar a una API real)
NOTICIAS = [
    {
        "titulo": "🎉 ¡Bienvenido a PokeReport!",
        "descripcion": "Versión 3.2.0 ya disponible con nueva UI profesional",
        "fecha": "27 Oct 2025"
    },
    {
        "titulo": "✨ Nueva Interfaz Gráfica",
        "descripcion": "Launcher completamente renovado con diseño moderno",
        "fecha": "27 Oct 2025"
    },
    {
        "titulo": "🔥 Fabric 1.21.1 Optimizado",
        "descripcion": "Mejor rendimiento y compatibilidad con todos los mods",
        "fecha": "26 Oct 2025"
    },
    {
        "titulo": "📦 60+ Mods Incluidos",
        "descripcion": "Pokémon, decoración, optimización y mucho más",
        "fecha": "25 Oct 2025"
    }
]

class PokeReportLauncher:
    def __init__(self):
        # PRIMERO: Crear y verificar directorio .pokereport
        try:
            minecraft_path = Path(MINECRAFT_DIR)
            minecraft_path.mkdir(parents=True, exist_ok=True)
            print(f"✅ Directorio creado/verificado: {MINECRAFT_DIR}")
            
            # Verificar permisos de escritura
            test_file = minecraft_path / ".test_launcher"
            test_file.write_text("test")
            test_file.unlink()
            print(f"✅ Permisos de escritura OK")
            
        except Exception as e:
            print(f"❌ ERROR CRÍTICO: No se puede crear directorio")
            print(f"   {e}")
            print(f"   Ejecuta como administrador o verifica permisos")
            messagebox.showerror(
                "Error Crítico",
                f"No se puede crear el directorio:\n{MINECRAFT_DIR}\n\n"
                f"Error: {e}\n\n"
                f"Solución: Ejecuta como administrador"
            )
            sys.exit(1)
        
        self.ventana = ctk.CTk()
        self.ventana.geometry('1100x700')
        self.ventana.title('PokeReport Launcher - Premium Edition')
        self.ventana.resizable(False, False)
        
        self.setup_completo = False
        self.fabric_version = None
        self.usuario_actual = None
        self.es_premium = False
        
        # Cargar fondo
        self.background_image = None
        self.background_label = None
        self._cargar_fondo()
        
        # Gestor de sesión
        self.session_manager = SessionManager(MINECRAFT_DIR)
        
        # Verificar si hay sesión guardada
        saved_session = self.session_manager.load_session()
        
        if saved_session:
            # AUTO-LOGIN con sesión guardada
            self.usuario_actual = {
                'username': saved_session['username'],
                'uuid': saved_session['uuid'],
                'access_token': saved_session.get('access_token', '')
            }
            self.es_premium = saved_session.get('is_premium', False)
            
            # Mostrar mensaje de bienvenida
            tipo = "👑 Premium" if self.es_premium else "🎮 No-Premium"
            self.ventana.after(100, lambda: messagebox.showinfo(
                "Sesión Guardada",
                f"✅ ¡Bienvenido de nuevo!\n\n"
                f"👤 {saved_session['username']}\n"
                f"🔐 {tipo}\n\n"
                f"Tu sesión está guardada.\n"
                f"No necesitas autenticar de nuevo."
            ))
            
            # Ir directo al setup/juego
            self.ventana.after(200, self.iniciar_setup)
        else:
            # No hay sesión, mostrar pantalla de login
            self.crear_pantalla_login()
    
    def _cargar_fondo(self):
        """Cargar imágenes de fondo y recursos"""
        try:
            # FONDO 1: background.jpg para pantalla de login
            bg1_path = Path(__file__).parent / "background.jpg"
            if bg1_path.exists():
                img = Image.open(bg1_path)
                img = img.resize((1100, 700), Image.Resampling.LANCZOS)
                self.background_login = ImageTk.PhotoImage(img)
                print(f"✅ Fondo login cargado: background.jpg")
            else:
                self.background_login = None
            
            # FONDO 2: fondo2.png para pantalla principal
            bg2_path = Path(__file__).parent / "fondo2.png"
            if bg2_path.exists():
                img = Image.open(bg2_path)
                img = img.resize((1100, 700), Image.Resampling.LANCZOS)
                self.background_main = ImageTk.PhotoImage(img)
                print(f"✅ Fondo principal cargado: fondo2.png")
            else:
                self.background_main = None
            
            # Logo ya no se usa (integrado en backgrounds)
            self.logo_grande = None
            self.logo_mediano = None
                
        except Exception as e:
            print(f"⚠️ Error cargando recursos: {e}")
            self.background_login = None
            self.background_main = None
            self.logo_image = None
    
    def _crear_fondo(self, parent, tipo="login"):
        """Crear label de fondo en un frame"""
        bg_image = self.background_login if tipo == "login" else self.background_main
        
        if bg_image:
            bg_label = tk.Label(parent, image=bg_image)
            bg_label.place(x=0, y=0, relwidth=1, relheight=1)
            # Mantener referencia para evitar garbage collection
            bg_label.image = bg_image
            return bg_label
        return None
    
    def crear_pantalla_login(self):
        """Pantalla de selección de tipo de cuenta - PROFESIONAL"""
        # Limpiar ventana
        for widget in self.ventana.winfo_children():
            widget.destroy()
        
        # Crear fondo (ya tiene el logo integrado)
        self._crear_fondo(self.ventana)
        
        # CARD PREMIUM - Solo borde dorado, SIN fondo
        premium_frame = ctk.CTkFrame(
            self.ventana, 
            corner_radius=12,
            fg_color="transparent",
            border_width=4,
            border_color=("#FFD700", "#FFD700"),
            width=320,
            height=280
        )
        premium_frame.place(relx=0.28, rely=0.62, anchor="center")
        premium_frame.pack_propagate(False)
        
        ctk.CTkLabel(
            premium_frame,
            text="👑",
            font=("Arial", 56)
        ).pack(pady=(25, 10))
        
        ctk.CTkLabel(
            premium_frame,
            text="CUENTA PREMIUM",
            font=("Arial Black", 18, "bold"),
            text_color="#FFD700"  # Dorado
        ).pack(pady=10)
        
        # Solo info esencial
        ctk.CTkLabel(
            premium_frame,
            text="Skin oficial • Servidores oficiales",
            font=("Arial", 11),
            text_color="#cccccc"
        ).pack(pady=5)
        
        # BOTÓN ARREGLADO - Texto más corto y botón más ancho
        btn_premium = ctk.CTkButton(
            premium_frame,
            text="MICROSOFT LOGIN",
            command=self.login_microsoft,
            fg_color="#8B4513",  # Marrón tipo Minecraft
            hover_color="#A0522D",
            width=260,
            height=55,
            font=("Arial", 14, "bold"),
            corner_radius=8,
            cursor="hand2",
            border_width=2,
            border_color="#FFD700"
        )
        btn_premium.pack(pady=(15, 25), padx=15)
        
        # CARD NO-PREMIUM - Solo borde verde, SIN fondo  
        offline_frame = ctk.CTkFrame(
            self.ventana, 
            corner_radius=12,
            fg_color="transparent",
            border_width=4,
            border_color=("#7ED321", "#7ED321"),
            width=320,
            height=280
        )
        offline_frame.place(relx=0.72, rely=0.62, anchor="center")
        offline_frame.pack_propagate(False)
        
        ctk.CTkLabel(
            offline_frame,
            text="🎮",
            font=("Arial", 56)
        ).pack(pady=(25, 10))
        
        ctk.CTkLabel(
            offline_frame,
            text="CUENTA NO-PREMIUM",
            font=("Arial Black", 18, "bold"),
            text_color="#7ED321"  # Verde Minecraft
        ).pack(pady=10)
        
        # Info esencial
        ctk.CTkLabel(
            offline_frame,
            text="Acceso inmediato • Juego completo",
            font=("Arial", 11),
            text_color="#cccccc"
        ).pack(pady=5)
        
        # BOTÓN ARREGLADO - Texto corto
        btn_offline = ctk.CTkButton(
            offline_frame,
            text="JUGAR SIN PREMIUM",
            command=self.login_offline_dialog,
            fg_color="#228B22",  # Verde bosque tipo Minecraft
            hover_color="#32CD32",  # Verde lime brillante
            width=260,
            height=55,
            font=("Arial", 14, "bold"),
            corner_radius=8,
            cursor="hand2",
            border_width=2,
            border_color="#7ED321"
        )
        btn_offline.pack(pady=(15, 25), padx=15)
    
    def login_microsoft(self):
        """Login con Microsoft"""
        # Verificar que MSAL esté instalado
        try:
            import msal
        except ImportError:
            result = messagebox.askyesno(
                "MSAL no instalado",
                "Para usar login Microsoft necesitas instalar MSAL:\n\n"
                "pip install msal\n\n"
                "¿Quieres continuar con modo Offline en su lugar?"
            )
            if result:
                self.login_offline_dialog()
            return
        
        # Verificar configuración
        from auth_microsoft import MICROSOFT_CLIENT_ID
        if MICROSOFT_CLIENT_ID == "00000000-0000-0000-0000-000000000000":
            result = messagebox.askyesno(
                "Configuración necesaria",
                "Para usar login Microsoft necesitas:\n\n"
                "1. Registrar app en Azure Portal\n"
                "2. Configurar Client ID en auth_microsoft.py\n\n"
                "Lee README.md para instrucciones.\n\n"
                "¿Quieres continuar con modo Offline?"
            )
            if result:
                self.login_offline_dialog()
            return
        
        # Proceder con autenticación Microsoft
        try:
            from auth_microsoft import MicrosoftAuth
            
            # Mostrar ventana de autenticación
            loading = ctk.CTkToplevel(self.ventana)
            loading.geometry('550x400')
            loading.title('Autenticación Microsoft')
            loading.grab_set()
            
            ctk.CTkLabel(
                loading,
                text="🔐 Autenticación Microsoft",
                font=("Arial", 22, "bold")
            ).pack(pady=20)
            
            info_text = ctk.CTkTextbox(loading, width=500, height=250, font=("Arial", 11))
            info_text.pack(pady=10)
            info_text.insert("1.0", "Iniciando autenticación con Microsoft...\n\n")
            
            # Thread para autenticar
            def auth_thread():
                try:
                    import msal
                    
                    # Crear app MSAL
                    from auth_microsoft import MICROSOFT_CLIENT_ID, AUTHORITY, SCOPES
                    app = msal.PublicClientApplication(MICROSOFT_CLIENT_ID, authority=AUTHORITY)
                    
                    def update_info(text):
                        self.ventana.after(0, lambda: info_text.insert("end", text))
                    
                    update_info("📱 Iniciando Device Code Flow...\n\n")
                    
                    # Iniciar device flow
                    flow = app.initiate_device_flow(SCOPES)
                    
                    if 'user_code' not in flow:
                        error_msg = flow.get('error_description', 'Error al iniciar')
                        update_info(f"❌ Error: {error_msg}\n")
                        return
                    
                    # MOSTRAR CÓDIGO EN LA VENTANA
                    code = flow['user_code']
                    url = flow['verification_uri']
                    
                    update_info("="*50 + "\n\n")
                    update_info(f"🌐 ABRIENDO NAVEGADOR AUTOMÁTICAMENTE...\n\n")
                    update_info(f"📋 TU CÓDIGO:\n")
                    update_info(f"    {code}\n\n")
                    update_info(f"🔗 URL: {url}\n\n")
                    update_info("="*50 + "\n\n")
                    update_info("INSTRUCCIONES:\n")
                    update_info("1. Se abrirá tu navegador automáticamente\n")
                    update_info("2. Copia el código de arriba\n")
                    update_info("3. Pégalo en la página que se abre\n")
                    update_info("4. Inicia sesión con tu cuenta Microsoft\n")
                    update_info("5. Autoriza la aplicación\n\n")
                    update_info("⏳ Esperando tu autorización...\n")
                    
                    # Abrir navegador automáticamente
                    try:
                        import webbrowser
                        webbrowser.open(url)
                        update_info("✅ Navegador abierto\n\n")
                    except:
                        update_info("⚠️ Abre manualmente el navegador\n\n")
                    
                    # Esperar autenticación
                    result = app.acquire_token_by_device_flow(flow)
                    
                    if 'access_token' not in result:
                        error = result.get('error_description', 'Error desconocido')
                        update_info(f"\n❌ Error: {error}\n")
                        self.ventana.after(2000, loading.destroy)
                        return
                    
                    # Autenticar con Minecraft usando el token de Microsoft
                    from auth_microsoft import MicrosoftAuth
                    auth = MicrosoftAuth()
                    minecraft_auth = auth._authenticate_minecraft(result)
                    
                    if minecraft_auth and isinstance(minecraft_auth, dict):
                        # VALIDAR que la autenticación sea completa y válida
                        if 'username' in minecraft_auth and 'uuid' in minecraft_auth:
                            update_info("\n✅ ¡Autenticación exitosa!\n")
                            update_info(f"👤 Usuario: {minecraft_auth['username']}\n")
                            update_info("🔑 Cuenta premium verificada\n")
                            
                            self.usuario_actual = minecraft_auth
                            self.es_premium = True
                            
                            # GUARDAR SESIÓN SOLO si autenticación es EXITOSA
                            try:
                                refresh_token = result.get('refresh_token')
                                save_success = self.session_manager.save_session(
                                    minecraft_auth,
                                    is_premium=True,
                                    refresh_token=refresh_token
                                )
                                
                                if save_success:
                                    update_info("💾 Sesión guardada correctamente\n")
                                else:
                                    update_info("⚠️ Sesión no pudo guardarse\n")
                            except Exception as e:
                                update_info(f"⚠️ Error al guardar sesión: {e}\n")
                            
                            self.ventana.after(0, loading.destroy)
                            self.ventana.after(0, lambda: messagebox.showinfo(
                                "¡Bienvenido!",
                                f"✅ Autenticación exitosa\n\n"
                                f"👤 Usuario: {minecraft_auth['username']}\n"
                                f"🔑 Cuenta premium verificada\n"
                                f"🎨 Tu skin se sincronizará automáticamente\n"
                                f"💾 Sesión guardada\n\n"
                                f"La próxima vez no necesitas autenticar"
                            ))
                            self.ventana.after(0, self.iniciar_setup)
                        else:
                            # Datos incompletos
                            update_info("\n❌ Datos de autenticación incompletos\n")
                            self.ventana.after(2000, loading.destroy)
                            self.ventana.after(2000, lambda: messagebox.showerror(
                                "Error",
                                "La autenticación no devolvió datos válidos.\n\n"
                                "Esto puede significar que no tienes\n"
                                "Minecraft premium en esta cuenta."
                            ))
                    else:
                        # AUTENTICACIÓN FALLÓ - NO GUARDAR SESIÓN
                        update_info("\n❌ No se pudo completar autenticación\n")
                        update_info("⚠️ Sesión NO guardada (autenticación inválida)\n")
                        
                        # Verificar si es por no tener premium
                        if 'error' in result:
                            error_code = result.get('error', '')
                            if 'NOT_FOUND' in error_code or 'profile' in error_code.lower():
                                self.ventana.after(2000, loading.destroy)
                                self.ventana.after(2000, lambda: messagebox.showerror(
                                    "Sin Minecraft Premium",
                                    "❌ Esta cuenta Microsoft no tiene Minecraft.\n\n"
                                    "Para usar login Microsoft necesitas:\n"
                                    "• Comprar Minecraft en Minecraft.net\n"
                                    "• O usar modo Offline (funciona perfecto)\n\n"
                                    "💡 Usa modo Offline para jugar gratis"
                                ))
                            else:
                                self.ventana.after(2000, loading.destroy)
                                self.ventana.after(2000, lambda: messagebox.showerror(
                                    "Error de Autenticación",
                                    f"No se pudo autenticar.\n\n"
                                    f"Error: {result.get('error_description', 'Desconocido')}\n\n"
                                    f"Lee ARREGLAR_AZURE.md para más ayuda."
                                ))
                        else:
                            self.ventana.after(2000, loading.destroy)
                            self.ventana.after(2000, lambda: messagebox.showerror(
                                "Error de Autenticación",
                                "No se pudo autenticar con Microsoft.\n\n"
                                "Posibles causas:\n"
                                "• No tienes Minecraft en esta cuenta\n"
                                "• No autorizaste la aplicación\n"
                                "• Timeout (expiró el código)\n"
                                "• Configuración de Azure incompleta\n\n"
                                "💡 Usa modo Offline si no tienes premium"
                            ))
                except Exception as e:
                    # ERROR EN PROCESO - NO GUARDAR SESIÓN
                    update_info(f"\n❌ Error: {str(e)}\n")
                    update_info("⚠️ Sesión NO guardada (error en proceso)\n")
                    self.ventana.after(2000, loading.destroy)
                    self.ventana.after(2000, lambda: messagebox.showerror(
                        "Error", 
                        f"Error durante autenticación:\n\n{str(e)}\n\n"
                        f"La sesión NO se guardó.\n\n"
                        f"Usa modo Offline si no tienes premium."
                    ))
            
            thread = threading.Thread(target=auth_thread)
            thread.daemon = True
            thread.start()
            
        except Exception as e:
            messagebox.showerror("Error", f"Error al iniciar autenticación:\n{str(e)}")
    
    def login_offline_dialog(self):
        """Diálogo para login offline"""
        dialog = ctk.CTkToplevel(self.ventana)
        dialog.geometry('400x250')
        dialog.title('Login Offline')
        dialog.grab_set()
        
        ctk.CTkLabel(
            dialog,
            text="🎮 Modo Offline",
            font=("Arial", 20, "bold")
        ).pack(pady=20)
        
        ctk.CTkLabel(
            dialog,
            text="Ingresa tu nombre de usuario:",
            font=("Arial", 12)
        ).pack(pady=5)
        
        entry = ctk.CTkEntry(dialog, placeholder_text="Tu nombre", width=300)
        entry.pack(pady=10)
        entry.focus()
        
        def confirmar():
            nombre = entry.get().strip()
            if nombre and len(nombre) >= 3:
                self.login_offline(nombre)
                dialog.destroy()
            else:
                messagebox.showerror("Error", "Nombre debe tener al menos 3 caracteres")
        
        ctk.CTkButton(
            dialog,
            text="✅ Continuar",
            command=confirmar,
            fg_color="#10b981",
            width=300,
            height=40,
            font=("Arial", 14, "bold")
        ).pack(pady=20)
        
        # Enter para confirmar
        entry.bind('<Return>', lambda e: confirmar())
    
    def login_offline(self, nombre):
        """Login modo offline"""
        try:
            # VALIDAR nombre antes de continuar
            if not nombre or len(nombre) < 3:
                messagebox.showerror("Error", "El nombre debe tener al menos 3 caracteres")
                return
            
            # Generar UUID
            user_uuid = str(uuid_lib.uuid3(uuid_lib.NAMESPACE_DNS, f"OfflinePlayer:{nombre}"))
            
            self.usuario_actual = {
                'username': nombre,
                'uuid': user_uuid,
                'access_token': ''
            }
            self.es_premium = False
            
            # GUARDAR SESIÓN para no pedir login cada vez
            # SOLO si los datos son válidos
            save_success = self.session_manager.save_session(
                self.usuario_actual,
                is_premium=False
            )
            
            if save_success:
                session_msg = "💾 Sesión guardada\n\nLa próxima vez no necesitas autenticar"
            else:
                session_msg = "⚠️ Sesión no pudo guardarse\n(Tendrás que ingresar nombre cada vez)"
            
            messagebox.showinfo(
                "¡Bienvenido!",
                f"✅ Login exitoso\n\n"
                f"👤 Usuario: {nombre}\n"
                f"🎮 Modo: Cuenta No-Premium\n"
                f"🌐 Acceso completo al juego\n"
                f"{session_msg}"
            )
            
            self.iniciar_setup()
            
        except Exception as e:
            messagebox.showerror("Error", f"Error en login offline:\n{str(e)}")
    
    def iniciar_setup(self):
        """Iniciar setup automático - PROFESIONAL"""
        # Crear pantalla de setup
        for widget in self.ventana.winfo_children():
            widget.destroy()
        
        # Crear fondo de login
        self._crear_fondo(self.ventana, tipo="login")
        
        # Container central
        center_container = ctk.CTkFrame(self.ventana, fg_color="transparent")
        center_container.place(relx=0.5, rely=0.5, anchor="center")
        
        # Header con perfil
        header_frame = ctk.CTkFrame(center_container, fg_color=("gray10", "gray10"), 
                                    corner_radius=20, border_width=2, 
                                    border_color=("#3b82f6", "#3b82f6"))
        header_frame.pack(pady=(0, 30))
        
        # Saludo personalizado
        ctk.CTkLabel(
            header_frame,
            text=f"¡Bienvenido, {self.usuario_actual['username']}!",
            font=("Arial Black", 28, "bold"),
            text_color="white"
        ).pack(padx=40, pady=(20, 10))
        
        tipo_cuenta = "👑 Cuenta Premium" if self.es_premium else "🎮 Cuenta No-Premium"
        tipo_color = "#fbbf24" if self.es_premium else "#10b981"
        
        tipo_label = ctk.CTkLabel(
            header_frame,
            text=tipo_cuenta,
            font=("Arial", 16, "bold"),
            text_color=tipo_color,
            fg_color=("gray20", "gray20"),
            corner_radius=10,
            padx=20,
            pady=8
        )
        tipo_label.pack(pady=(0, 20))
        
        # Frame de progreso elegante
        self.status_frame = ctk.CTkFrame(center_container, width=800, height=350,
                                         fg_color=("gray15", "gray15"), 
                                         corner_radius=20, border_width=2,
                                         border_color=("#10b981", "#10b981"))
        self.status_frame.pack(pady=10)
        self.status_frame.pack_propagate(False)
        
        # Título del proceso
        ctk.CTkLabel(
            self.status_frame,
            text="⚙️ INSTALACIÓN AUTOMÁTICA",
            font=("Arial Black", 18, "bold"),
            text_color="#3b82f6"
        ).pack(pady=(25, 15))
        
        # Estado actual
        self.status_label = ctk.CTkLabel(
            self.status_frame,
            text="🔄 Verificando instalación...",
            font=("Arial", 16, "bold"),
            text_color="white"
        )
        self.status_label.pack(pady=15)
        
        # Barra de progreso moderna
        progress_container = ctk.CTkFrame(self.status_frame, fg_color="transparent")
        progress_container.pack(pady=20)
        
        self.progress = ctk.CTkProgressBar(progress_container, width=700, height=25,
                                          corner_radius=12, border_width=2,
                                          border_color=("#3b82f6", "#3b82f6"))
        self.progress.pack()
        self.progress.set(0)
        
        # Detalles técnicos
        detail_frame = ctk.CTkFrame(self.status_frame, fg_color=("gray20", "gray20"),
                                   corner_radius=12, width=700, height=100)
        detail_frame.pack(pady=15)
        detail_frame.pack_propagate(False)
        
        self.detail_label = ctk.CTkLabel(
            detail_frame,
            text="Iniciando...",
            font=("Consolas", 11),
            text_color="#94a3b8",
            wraplength=680
        )
        self.detail_label.pack(expand=True)
        
        # Info adicional
        info_label = ctk.CTkLabel(
            self.status_frame,
            text="💡 Primera instalación: ~2 GB de descarga | Tiempo: 10-15 minutos",
            font=("Arial", 10),
            text_color="#64748b"
        )
        info_label.pack(pady=(10, 20))
        
        # Iniciar setup en thread
        thread = threading.Thread(target=self._setup_thread)
        thread.daemon = True
        thread.start()
    
    def _setup_thread(self):
        """Thread de setup automático - FLUJO SIMPLE Y CORRECTO"""
        try:
            # PASO 1: Verificar si Minecraft 1.21.1 está REALMENTE instalado
            print("\n🔍 Verificando instalación de Minecraft...")
            
            # Verificar que exista la versión EXACTA de Minecraft 1.21.1
            version_121 = Path(MINECRAFT_DIR) / "versions" / "1.21.1"
            version_json = version_121 / "1.21.1.json"
            
            minecraft_completo = version_121.exists() and version_json.exists()
            
            print(f"   ¿Existe versions/1.21.1/? {version_121.exists()}")
            print(f"   ¿Existe 1.21.1.json? {version_json.exists()}")
            print(f"   ¿Minecraft completo? {minecraft_completo}\n")
            
            if not minecraft_completo:
                # Descargar e instalar minecraft.zip
                print("📥 Minecraft base no encontrado → Descargando...")
                minecraft_base_zip = Path(MINECRAFT_DIR) / "minecraft_base.zip"
                
                self.actualizar_status("📥 Descargando Minecraft base...", 0.1)
                self.actualizar_detalle("⚡ Preparando descarga optimizada...")
                
                try:
                    # Usar descargador optimizado con reintentos
                    downloader = FastDownloader(num_threads=8, max_retries=3, timeout=30)
                    
                    def progress_callback(downloaded, total, speed_mbps):
                        progress = 0.1 + (downloaded / total) * 0.3 if total > 0 else 0.1
                        self.progress.set(progress)
                        mb_downloaded = downloaded / (1024**2)
                        mb_total = total / (1024**2)
                        percent = (downloaded / total * 100) if total > 0 else 0
                        self.actualizar_detalle(
                            f"⚡ {mb_downloaded:.1f}/{mb_total:.1f} MB | "
                            f"{percent:.1f}% | {speed_mbps:.1f} MB/s"
                        )
                    
                    # Descargar con validación automática
                    print(f"📥 Descargando desde: {MINECRAFT_BASE_URL}")
                    success = downloader.download_file(
                        MINECRAFT_BASE_URL,
                        minecraft_base_zip,
                        progress_callback
                    )
                    
                    if not success:
                        raise DownloadError("La descarga de minecraft.zip falló")
                    
                    # Verificar que el archivo existe y no está vacío
                    if not minecraft_base_zip.exists():
                        raise DownloadError("El archivo minecraft.zip no se descargó")
                    
                    if minecraft_base_zip.stat().st_size == 0:
                        raise DownloadError("El archivo minecraft.zip está vacío")
                    
                    print(f"✅ Descarga exitosa: {minecraft_base_zip.stat().st_size / (1024**2):.1f} MB")
                    
                except DownloadError as e:
                    error_msg = f"❌ Error descargando minecraft.zip:\n\n{str(e)}\n\n" \
                               f"Verifica:\n" \
                               f"• Tu conexión a internet\n" \
                               f"• Que el archivo existe en GitHub\n" \
                               f"• Firewall no bloquea Python\n\n" \
                               f"URL: {MINECRAFT_BASE_URL}"
                    self.actualizar_status("❌ Error en descarga", 0)
                    self.actualizar_detalle(str(e))
                    raise Exception(error_msg)
                
                # Extraer
                try:
                    self.actualizar_status("📦 Extrayendo Minecraft base...", 0.4)
                    self.actualizar_detalle("Descomprimiendo archivos...")
                    
                    with zipfile.ZipFile(minecraft_base_zip, 'r') as zip_ref:
                        # Extraer con feedback
                        total_files = len(zip_ref.namelist())
                        for i, member in enumerate(zip_ref.namelist()):
                            zip_ref.extract(member, MINECRAFT_DIR)
                            if i % 50 == 0:  # Actualizar cada 50 archivos
                                progress = 0.4 + (i / total_files) * 0.1
                                self.progress.set(progress)
                                self.actualizar_detalle(f"Extrayendo: {i}/{total_files} archivos...")
                    
                    print(f"✅ Extraído exitosamente")
                    
                except zipfile.BadZipFile:
                    error_msg = "❌ El archivo minecraft.zip está corrupto.\n\n" \
                               "Descárgalo manualmente y extráelo en:\n" \
                               f"{MINECRAFT_DIR}"
                    self.actualizar_status("❌ Archivo corrupto", 0)
                    raise Exception(error_msg)
                except Exception as e:
                    error_msg = f"❌ Error extrayendo minecraft.zip: {e}"
                    self.actualizar_status("❌ Error en extracción", 0)
                    raise Exception(error_msg)
                finally:
                    # Eliminar zip temporal (aunque falle)
                    if minecraft_base_zip.exists():
                        try:
                            minecraft_base_zip.unlink()
                            print("🗑️ ZIP temporal eliminado")
                        except:
                            pass
                
                self.actualizar_status("✅ Minecraft base instalado", 0.5)
            else:
                # Ya existe
                print("✅ Minecraft base ya instalado")
                self.actualizar_status("✅ Minecraft base detectado", 0.5)
            
            # PASO 2: Detectar/Instalar Fabric
            self.actualizar_status("🧩 Detectando Fabric...", 0.55)
            
            try:
                installed = minecraft_launcher_lib.utils.get_installed_versions(MINECRAFT_DIR)
                fabric_versions = [v['id'] for v in installed if 'fabric-loader' in v['id'].lower()]
                
                if fabric_versions:
                    self.fabric_version = fabric_versions[0]
                    print(f"✅ Fabric ya instalado: {self.fabric_version}")
                    self.actualizar_status(f"✅ Fabric detectado: {self.fabric_version}", 0.6)
                else:
                    print("📥 Fabric no encontrado, instalando...")
                    self.actualizar_status("📥 Instalando Fabric...", 0.6)
                    minecraft_launcher_lib.fabric.install_fabric(MINECRAFT_VERSION, MINECRAFT_DIR)
                    
                    # Redetectar
                    installed = minecraft_launcher_lib.utils.get_installed_versions(MINECRAFT_DIR)
                    fabric_versions = [v['id'] for v in installed if 'fabric-loader' in v['id'].lower()]
                    if fabric_versions:
                        self.fabric_version = fabric_versions[0]
                        print(f"✅ Fabric instalado: {self.fabric_version}")
                        self.actualizar_status(f"✅ Fabric instalado", 0.65)
                    else:
                        raise Exception("No se pudo instalar Fabric")
            except Exception as e:
                print(f"⚠️ Error con Fabric: {e}")
                # Usar versión por defecto
                self.fabric_version = f"fabric-loader-0.17.3-{MINECRAFT_VERSION}"
                self.actualizar_status(f"✅ Usando Fabric predeterminado", 0.65)
            
            # PASO 3: Verificar si mods ya están instalados
            mods_dir = Path(MINECRAFT_DIR) / "mods"
            necesita_mods = not (mods_dir.exists() and list(mods_dir.glob('*.jar')))
            
            if necesita_mods:
                # Descargar e instalar modpack
                print("📦 Mods no encontrados → Descargando modpack...")
                modpack_path = Path(MINECRAFT_DIR) / "pokereport-modpack.mrpack"
                self.actualizar_status("📦 Descargando modpack...", 0.7)
                self.actualizar_detalle("⚡ Preparando descarga...")
                
                try:
                    # Usar descargador optimizado con reintentos
                    downloader = FastDownloader(num_threads=8, max_retries=3, timeout=30)
                    
                    def modpack_progress(downloaded, total, speed_mbps):
                        progress = 0.7 + (downloaded / total) * 0.1 if total > 0 else 0.7
                        self.progress.set(progress)
                        mb_downloaded = downloaded / (1024**2)
                        mb_total = total / (1024**2)
                        percent = (downloaded / total * 100) if total > 0 else 0
                        self.actualizar_detalle(
                            f"⚡ {mb_downloaded:.1f}/{mb_total:.1f} MB | "
                            f"{percent:.1f}% | {speed_mbps:.1f} MB/s"
                        )
                    
                    # Descargar con validación automática
                    print(f"📦 Descargando modpack desde: {MODPACK_URL}")
                    success = downloader.download_file(
                        MODPACK_URL,
                        modpack_path,
                        modpack_progress
                    )
                    
                    if not success:
                        raise DownloadError("La descarga del modpack falló")
                    
                    # Verificar archivo
                    if not modpack_path.exists() or modpack_path.stat().st_size == 0:
                        raise DownloadError("El archivo modpack no se descargó correctamente")
                    
                    print(f"✅ Modpack descargado: {modpack_path.stat().st_size / (1024**2):.1f} MB")
                    
                except DownloadError as e:
                    error_msg = f"❌ Error descargando modpack:\n\n{str(e)}\n\n" \
                               f"Verifica tu conexión a internet.\n\n" \
                               f"URL: {MODPACK_URL}"
                    self.actualizar_status("❌ Error descargando modpack", 0)
                    self.actualizar_detalle(str(e))
                    raise Exception(error_msg)
                
                self.actualizar_status("✅ Modpack descargado", 0.8)
                
                # 4. Instalar modpack
                try:
                    self.actualizar_status("🧩 Instalando modpack...", 0.85)
                    self.instalar_modpack(modpack_path)
                    self.actualizar_status("✅ Modpack instalado", 0.95)
                except Exception as e:
                    error_msg = f"❌ Error instalando modpack: {e}"
                    self.actualizar_status("❌ Error en instalación", 0)
                    raise Exception(error_msg)
            else:
                # Mods ya instalados
                print("✅ Mods ya instalados")
                self.actualizar_status("✅ Modpack ya instalado", 0.95)
            
            # PASO 4: Completado
            self.actualizar_status("✅ ¡Todo listo para jugar!", 1.0)
            self.actualizar_detalle(f"✨ {self.fabric_version} con PokeReport completo")
            
            self.setup_completo = True
            time.sleep(1)
            
            # Mostrar pantalla de juego
            self.ventana.after(0, self.mostrar_pantalla_juego)
            
        except Exception as e:
            error_str = str(e)
            self.actualizar_status("❌ Error en instalación", 0)
            self.actualizar_detalle("Error: " + error_str[:100])
            
            # Imprimir traceback completo en consola para debug
            import traceback
            print("\n" + "="*70)
            print("❌ ERROR COMPLETO:")
            print("="*70)
            traceback.print_exc()
            print("="*70 + "\n")
            
            # Mostrar diálogo con error al usuario
            self.ventana.after(0, lambda: messagebox.showerror(
                "Error de Instalación",
                error_str if len(error_str) < 500 else error_str[:497] + "..."
            ))
    
    def instalar_modpack(self, modpack_path):
        """Instalar modpack .mrpack"""
        try:
            mods_dir = Path(MINECRAFT_DIR) / "mods"
            mods_dir.mkdir(exist_ok=True)
            
            with zipfile.ZipFile(modpack_path, 'r') as zip_ref:
                index_data = json.loads(zip_ref.read('modrinth.index.json'))
                files = index_data.get('files', [])
                total = len(files)
                
                for i, file_info in enumerate(files):
                    url = file_info['downloads'][0]
                    filename = file_info['path'].split('/')[-1]
                    mod_path = mods_dir / filename
                    
                    if not mod_path.exists():
                        response = requests.get(url)
                        with open(mod_path, 'wb') as f:
                            f.write(response.content)
                    
                    progress = 0.75 + ((i + 1) / total) * 0.2
                    self.progress.set(progress)
                    self.actualizar_detalle(f"Mod {i+1}/{total}: {filename[:40]}...")
                
                # Copiar overrides
                for item in zip_ref.namelist():
                    if item.startswith('overrides/'):
                        zip_ref.extract(item, MINECRAFT_DIR)
                        src = Path(MINECRAFT_DIR) / item
                        if src.is_file():
                            dest = Path(MINECRAFT_DIR) / item.replace('overrides/', '')
                            dest.parent.mkdir(parents=True, exist_ok=True)
                            import shutil
                            shutil.move(str(src), str(dest))
                
                overrides_dir = Path(MINECRAFT_DIR) / "overrides"
                if overrides_dir.exists():
                    import shutil
                    shutil.rmtree(overrides_dir)
            
        except Exception as e:
            print(f"Error instalando modpack: {e}")
            raise
    
    def mostrar_pantalla_juego(self):
        """Pantalla principal - LIMPIA CON FONDO PROTAGONISTA"""
        for widget in self.ventana.winfo_children():
            widget.destroy()
        
        # Crear fondo principal (fondo2.png)
        self._crear_fondo(self.ventana, tipo="main")
        
        # HEADER DELGADO
        header = ctk.CTkFrame(self.ventana, height=50, fg_color=("gray10", "gray10"))
        header.pack(fill="x")
        
        ctk.CTkLabel(
            header,
            text=f"👤 {self.usuario_actual['username']}",
            font=("Arial", 13, "bold"),
            text_color="white"
        ).pack(side="left", padx=20, pady=12)
        
        ctk.CTkButton(
            header,
            text="Cerrar Sesión",
            command=self.logout,
            fg_color="#8B4513",
            hover_color="#A0522D",
            width=110,
            height=32,
            corner_radius=6,
            font=("Arial", 10, "bold")
        ).pack(side="right", padx=20, pady=9)
        
        # TÍTULO NOTICIAS - Arriba derecha
        ctk.CTkLabel(
            self.ventana,
            text="📰 NOTICIAS",
            font=("Arial Black", 18, "bold"),
            text_color="#FFD700",
            fg_color="transparent"
        ).place(relx=0.85, rely=0.10, anchor="center")
        
        # NOTICIAS - Directo sobre fondo, con más separación
        y_start = 0.22
        for i, noticia in enumerate(NOTICIAS):
            y_pos = y_start + (i * 0.19)
            
            card = ctk.CTkFrame(self.ventana, fg_color="transparent",
                               corner_radius=10, border_width=3,
                               border_color=("#7ED321", "#7ED321"),
                               width=280, height=100)
            card.place(relx=0.85, rely=y_pos, anchor="center")
            card.pack_propagate(False)
            
            ctk.CTkLabel(card, text=noticia['titulo'],
                        font=("Arial", 11, "bold"),
                        text_color="white",
                        wraplength=260).pack(padx=10, pady=(8, 3))
            
            ctk.CTkLabel(card, text=noticia['descripcion'],
                        font=("Arial", 9),
                        text_color="#cccccc",
                        wraplength=260).pack(padx=10, pady=(0, 3))
            
            ctk.CTkLabel(card, text=noticia['fecha'],
                        font=("Arial", 8),
                        text_color="#7ED321").pack(padx=10, pady=(0, 5))
        
        # BOTÓN JUGAR - MÁS ABAJO
        btn_jugar = ctk.CTkButton(
            self.ventana,
            text="▶  JUGAR POKEREPORT",
            command=self.lanzar_juego,
            font=("Arial Black", 26, "bold"),
            fg_color="#228B22",
            hover_color="#32CD32",
            height=85,
            width=500,
            corner_radius=10,
            border_width=4,
            border_color="#7ED321"
        )
        btn_jugar.place(relx=0.35, rely=0.8, anchor="center")
        
        # RAM - MÁS ABAJO del botón
        ram_frame = ctk.CTkFrame(self.ventana, fg_color="transparent")
        ram_frame.place(relx=0.35, rely=0.92, anchor="center")
        
        ctk.CTkLabel(ram_frame, text="💾 RAM:", font=("Arial", 12, "bold"),
                    text_color="white").pack(side="left", padx=5)
        
        self.entry_ram = ctk.CTkEntry(ram_frame, width=70, height=35,
                                      font=("Arial", 14, "bold"),
                                      justify="center",
                                      border_width=2,
                                      border_color="#7ED321")
        self.entry_ram.insert(0, "6")
        self.entry_ram.pack(side="left", padx=5)
        
        ctk.CTkLabel(ram_frame, text="GB", font=("Arial", 12, "bold"),
                    text_color="white").pack(side="left")
    
    def lanzar_juego(self):
        """Lanzar Minecraft"""
        ram = self.entry_ram.get().strip()
        
        if not ram or not ram.isdigit():
            messagebox.showerror("Error", "Ingresa RAM válida (número, ej: 6)")
            return
        
        try:
            # Opciones de lanzamiento
            options = {
                'username': self.usuario_actual['username'],
                'uuid': self.usuario_actual['uuid'],
                'token': self.usuario_actual.get('access_token', ''),
                'jvmArguments': [f"-Xmx{ram}G", f"-Xms{ram}G"],
                'launcherVersion': "1.0.0"
            }
            
            comando = minecraft_launcher_lib.command.get_minecraft_command(
                self.fabric_version,
                MINECRAFT_DIR,
                options
            )
            
            messagebox.showinfo(
                "🚀 Lanzando",
                f"🎮 Iniciando PokeReport con Fabric\n\n"
                f"⏰ Primera vez: 5-10 minutos\n"
                f"📊 Minecraft abrirá en ventana separada\n"
                f"🖥️ Si ves 'No responde': Es normal, espera\n\n"
                f"¡Disfruta jugando!"
            )
            
            subprocess.Popen(comando, cwd=MINECRAFT_DIR)
            
        except Exception as e:
            messagebox.showerror("Error", f"Error al lanzar:\n{str(e)}")
    
    def actualizar_status(self, texto, progreso):
        """Actualizar estado"""
        import time
        self.ventana.after(0, lambda: self.status_label.configure(text=texto))
        self.ventana.after(0, lambda: self.progress.set(progreso))
        time.sleep(0.1)
    
    def actualizar_detalle(self, texto):
        """Actualizar detalle"""
        self.ventana.after(0, lambda: self.detail_label.configure(text=texto))
    
    def logout(self):
        """Cerrar sesión"""
        result = messagebox.askyesno(
            "Cerrar Sesión",
            "¿Estás seguro de que quieres cerrar sesión?\n\n"
            "Tendrás que autenticar de nuevo la próxima vez."
        )
        
        if result:
            self.session_manager.clear_session()
            messagebox.showinfo("Sesión Cerrada", "✅ Sesión cerrada correctamente")
            self.crear_pantalla_login()
    
    def run(self):
        """Ejecutar launcher"""
        print("="*70)
        print("🎮 PokeReport Launcher - Premium & No-Premium")
        print("="*70)
        print(f"📁 Directorio: {MINECRAFT_DIR}")
        print(f"🎮 Versión: Fabric {MINECRAFT_VERSION}")
        print(f"📦 Modpack: Auto-instalación")
        print(f"🔐 Soporte: Cuenta Microsoft (Premium) + Cuenta No-Premium")
        print(f"💾 Sesión: Guardado automático")
        print(f"🌐 Acceso: Juego completo en ambos modos")
        print("="*70)
        self.ventana.mainloop()

if __name__ == "__main__":
    app = PokeReportLauncher()
    app.run()
