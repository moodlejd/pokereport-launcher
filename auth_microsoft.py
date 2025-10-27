"""
Módulo de Autenticación Microsoft OAuth 2.0
Implementación profesional para cuentas premium
"""

import webbrowser
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from threading import Thread
import requests

try:
    import msal
    MSAL_AVAILABLE = True
except ImportError:
    MSAL_AVAILABLE = False

# Configuración de Microsoft OAuth
# IMPORTANTE: Registra tu app en https://portal.azure.com/
MICROSOFT_CLIENT_ID = "15d53ab4-cfad-4757-88a2-904139d4ca9d"  # Client ID configurado
REDIRECT_URI = "http://localhost:8080/callback"
AUTHORITY = "https://login.microsoftonline.com/consumers"
SCOPES = ["XboxLive.signin"]

class MicrosoftAuth:
    """Autenticación Microsoft para cuentas premium"""
    
    def __init__(self):
        if not MSAL_AVAILABLE:
            raise ImportError("MSAL no instalado. Ejecuta: pip install msal")
        
        self.app = msal.PublicClientApplication(
            MICROSOFT_CLIENT_ID,
            authority=AUTHORITY
        )
        self.auth_code = None
        self.auth_error = None
    
    def authenticate(self, use_device_flow=True):
        """
        Autenticar con Microsoft
        
        Args:
            use_device_flow: True para device code (más fácil), False para navegador
            
        Returns:
            dict con username, uuid, access_token o None si falla
        """
        if use_device_flow:
            return self._device_flow_auth()
        else:
            return self._browser_auth()
    
    def _device_flow_auth(self):
        """Autenticación con código de dispositivo (más simple)"""
        try:
            # Iniciar device flow
            flow = self.app.initiate_device_flow(SCOPES)
            
            if 'user_code' not in flow:
                error_msg = flow.get('error_description', 'No se pudo iniciar device flow')
                raise Exception(f"Error en device flow: {error_msg}")
            
            # ABRIR NAVEGADOR AUTOMÁTICAMENTE
            verification_url = flow['verification_uri']
            user_code = flow['user_code']
            
            print("\n" + "="*60)
            print("🔐 AUTENTICACIÓN MICROSOFT")
            print("="*60)
            print(f"\n✅ Abriendo navegador automáticamente...")
            print(f"\n📋 Tu código: {user_code}")
            print(f"🌐 URL: {verification_url}")
            print(f"\n⏰ Expira en: {flow.get('expires_in', 900)} segundos")
            print(f"\nEspera a que se autorice...\n")
            
            # ABRIR NAVEGADOR AUTOMÁTICAMENTE
            try:
                webbrowser.open(verification_url)
                print("✅ Navegador abierto automáticamente")
                print(f"📋 Copia este código: {user_code}")
                print()
            except:
                print(f"⚠️ No se pudo abrir navegador automáticamente")
                print(f"Ve manualmente a: {verification_url}")
            
            # Esperar autenticación
            result = self.app.acquire_token_by_device_flow(flow)
            
            if 'access_token' not in result:
                error = result.get('error_description', result.get('error', 'Error desconocido'))
                print(f"Detalles del error: {result}")
                raise Exception(f"Error de autenticación: {error}")
            
            # Autenticar con Minecraft
            return self._authenticate_minecraft(result)
            
        except Exception as e:
            print(f"❌ Error en autenticación: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _browser_auth(self):
        """Autenticación con navegador (más visual)"""
        try:
            # Iniciar servidor local
            server = AuthCallbackServer(('localhost', 8080), AuthCallbackHandler)
            server.auth_service = self
            
            server_thread = Thread(target=server.serve_forever)
            server_thread.daemon = True
            server_thread.start()
            
            # Construir URL
            auth_url = self.app.get_authorization_request_url(
                SCOPES,
                redirect_uri=REDIRECT_URI
            )
            
            print("\n🔐 Abriendo navegador para autenticación...")
            webbrowser.open(auth_url)
            
            # Esperar código
            timeout = 120
            while timeout > 0 and not self.auth_code and not self.auth_error:
                time.sleep(0.5)
                timeout -= 0.5
            
            server.shutdown()
            
            if self.auth_error:
                raise Exception(f"Error: {self.auth_error}")
            
            if not self.auth_code:
                raise Exception("Timeout esperando autenticación")
            
            # Intercambiar código por token
            result = self.app.acquire_token_by_authorization_code(
                self.auth_code,
                SCOPES,
                redirect_uri=REDIRECT_URI
            )
            
            if 'access_token' not in result:
                raise Exception("No se pudo obtener token")
            
            return self._authenticate_minecraft(result)
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    def _authenticate_minecraft(self, ms_token):
        """Autenticar con Minecraft usando token de Microsoft"""
        try:
            # 1. Xbox Live Auth
            xbl_response = requests.post(
                "https://user.auth.xboxlive.com/user/authenticate",
                json={
                    "Properties": {
                        "AuthMethod": "RPS",
                        "SiteName": "user.auth.xboxlive.com",
                        "RpsTicket": f"d={ms_token['access_token']}"
                    },
                    "RelyingParty": "http://auth.xboxlive.com",
                    "TokenType": "JWT"
                },
                headers={"Content-Type": "application/json"}
            )
            xbl_response.raise_for_status()
            xbl_data = xbl_response.json()
            
            xbl_token = xbl_data['Token']
            user_hash = xbl_data['DisplayClaims']['xui'][0]['uhs']
            
            # 2. XSTS Auth
            xsts_response = requests.post(
                "https://xsts.auth.xboxlive.com/xsts/authorize",
                json={
                    "Properties": {
                        "SandboxId": "RETAIL",
                        "UserTokens": [xbl_token]
                    },
                    "RelyingParty": "rp://api.minecraftservices.com/",
                    "TokenType": "JWT"
                },
                headers={"Content-Type": "application/json"}
            )
            xsts_response.raise_for_status()
            xsts_data = xsts_response.json()
            
            # 3. Minecraft Auth
            mc_response = requests.post(
                "https://api.minecraftservices.com/authentication/login_with_xbox",
                json={"identityToken": f"XBL3.0 x={user_hash};{xsts_data['Token']}"},
                headers={"Content-Type": "application/json"}
            )
            mc_response.raise_for_status()
            mc_data = mc_response.json()
            
            # 4. Obtener perfil
            profile_response = requests.get(
                "https://api.minecraftservices.com/minecraft/profile",
                headers={"Authorization": f"Bearer {mc_data['access_token']}"}
            )
            profile_response.raise_for_status()
            profile_data = profile_response.json()
            
            return {
                'username': profile_data['name'],
                'uuid': profile_data['id'],
                'access_token': mc_data['access_token']
            }
            
        except Exception as e:
            print(f"❌ Error en autenticación Minecraft: {e}")
            return None

class AuthCallbackHandler(BaseHTTPRequestHandler):
    """Handler para callback OAuth"""
    
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        
        if 'code' in params:
            self.server.auth_service.auth_code = params['code'][0]
            response = "<html><body><h1>✅ Autenticación exitosa!</h1><p>Puedes cerrar esta ventana.</p></body></html>"
        elif 'error' in params:
            self.server.auth_service.auth_error = params['error'][0]
            response = f"<html><body><h1>❌ Error</h1><p>{params.get('error_description', [''])[0]}</p></body></html>"
        else:
            response = "<html><body><h1>Respuesta inválida</h1></body></html>"
        
        self.send_response(200)
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(response.encode('utf-8'))
    
    def log_message(self, format, *args):
        pass  # Silenciar logs del servidor

class AuthCallbackServer(HTTPServer):
    pass

