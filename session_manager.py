"""
Gestor de Sesión - Guarda tokens de Microsoft para no autenticar cada vez
Implementación profesional con encriptación
"""

import json
from pathlib import Path
from cryptography.fernet import Fernet
import time

class SessionManager:
    """Gestor de sesión para guardar y cargar tokens de autenticación"""
    
    def __init__(self, data_dir):
        """
        Inicializar gestor de sesión
        
        Args:
            data_dir: Directorio donde guardar datos de sesión
        """
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        self.key_file = self.data_dir / '.key'
        self.session_file = self.data_dir / '.session'
        
        # Cargar o crear clave de encriptación
        self.cipher = self._get_cipher()
    
    def _get_cipher(self):
        """Obtener cipher para encriptación"""
        if self.key_file.exists():
            # Cargar clave existente
            with open(self.key_file, 'rb') as f:
                key = f.read()
        else:
            # Crear nueva clave
            key = Fernet.generate_key()
            with open(self.key_file, 'wb') as f:
                f.write(key)
        
        return Fernet(key)
    
    def save_session(self, user_data, is_premium=False, refresh_token=None):
        """
        Guardar sesión de usuario
        
        Args:
            user_data: Dict con username, uuid, access_token
            is_premium: Si es cuenta premium
            refresh_token: Token de refresh (opcional, para Microsoft)
        
        Returns:
            bool: True si se guardó exitosamente, False si falló
        """
        try:
            # VALIDAR que los datos sean correctos antes de guardar
            if not user_data or not isinstance(user_data, dict):
                print("❌ Datos de usuario inválidos, no se guardará sesión")
                return False
            
            if 'username' not in user_data or not user_data['username']:
                print("❌ Username inválido, no se guardará sesión")
                return False
            
            if 'uuid' not in user_data or not user_data['uuid']:
                print("❌ UUID inválido, no se guardará sesión")
                return False
            
            # Para cuentas premium, verificar que tenga access_token
            if is_premium and not user_data.get('access_token'):
                print("❌ Cuenta premium sin access_token, no se guardará sesión")
                return False
            
            session_data = {
                'username': user_data['username'],
                'uuid': user_data['uuid'],
                'access_token': user_data.get('access_token', ''),
                'is_premium': is_premium,
                'refresh_token': refresh_token,
                'timestamp': time.time(),
                'expires_at': time.time() + 86400  # 24 horas por defecto
            }
            
            # Encriptar datos
            json_data = json.dumps(session_data)
            encrypted = self.cipher.encrypt(json_data.encode('utf-8'))
            
            # Guardar
            with open(self.session_file, 'wb') as f:
                f.write(encrypted)
            
            tipo = "Premium" if is_premium else "Offline"
            print(f"✅ Sesión {tipo} guardada para {user_data['username']}")
            return True
            
        except Exception as e:
            print(f"❌ Error al guardar sesión: {e}")
            return False
    
    def load_session(self):
        """
        Cargar sesión guardada
        
        Returns:
            Dict con datos de usuario o None si no hay sesión
        """
        if not self.session_file.exists():
            return None
        
        try:
            # Leer y desencriptar
            with open(self.session_file, 'rb') as f:
                encrypted = f.read()
            
            decrypted = self.cipher.decrypt(encrypted)
            session_data = json.loads(decrypted.decode('utf-8'))
            
            # Verificar si expiró
            if session_data.get('expires_at', 0) < time.time():
                print("⏰ Sesión expirada")
                return None
            
            print(f"✅ Sesión cargada: {session_data['username']}")
            return session_data
            
        except Exception as e:
            print(f"⚠️ No se pudo cargar sesión: {e}")
            return None
    
    def clear_session(self):
        """Eliminar sesión guardada (logout)"""
        try:
            if self.session_file.exists():
                self.session_file.unlink()
            print("✅ Sesión eliminada")
        except Exception as e:
            print(f"⚠️ Error al eliminar sesión: {e}")
    
    def has_session(self):
        """Verificar si hay sesión guardada válida"""
        session = self.load_session()
        return session is not None

