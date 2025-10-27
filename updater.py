"""
Sistema de Actualizaciones Automáticas
Verifica si hay nueva versión en GitHub
"""

import requests
import json
from pathlib import Path

class Updater:
    """Verificador de actualizaciones"""
    
    def __init__(self, current_version="3.4.0"):
        self.current_version = current_version
        # URL donde alojarás el version.json
        self.version_url = "https://raw.githubusercontent.com/moodlejd/pokereport-launcher/main/version.json"
    
    def check_update(self):
        """
        Verificar si hay actualización disponible
        
        Returns:
            dict: {
                'update_available': bool,
                'latest_version': str,
                'download_url': str,
                'changelog': list
            } o None si error
        """
        try:
            # Descargar info de versión
            response = requests.get(self.version_url, timeout=10)
            response.raise_for_status()
            
            remote_info = response.json()
            remote_version = remote_info['version']
            
            # Comparar versiones
            update_available = self._compare_versions(remote_version, self.current_version)
            
            return {
                'update_available': update_available,
                'latest_version': remote_version,
                'download_url': remote_info.get('download_url', ''),
                'changelog': remote_info.get('changelog', [])
            }
            
        except Exception as e:
            print(f"⚠️ No se pudo verificar actualizaciones: {e}")
            return None
    
    def _compare_versions(self, remote, local):
        """Comparar versiones (formato: X.Y.Z)"""
        try:
            remote_parts = [int(x) for x in remote.split('.')]
            local_parts = [int(x) for x in local.split('.')]
            
            return remote_parts > local_parts
        except:
            return False

if __name__ == "__main__":
    # Test
    updater = Updater()
    result = updater.check_update()
    
    if result:
        if result['update_available']:
            print(f"✅ Nueva versión disponible: {result['latest_version']}")
            print(f"📥 Descargar: {result['download_url']}")
        else:
            print(f"✅ Ya tienes la última versión")
    else:
        print("❌ No se pudo verificar")

