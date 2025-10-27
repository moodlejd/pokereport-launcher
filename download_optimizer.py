"""
Optimizador de descargas - Multi-threaded, rápido y robusto
Versión profesional con manejo de errores y reintentos
"""

import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import os

class DownloadError(Exception):
    """Error personalizado para descargas"""
    pass

class FastDownloader:
    """Descargador optimizado con multi-threading, reintentos y validación"""
    
    def __init__(self, num_threads=8, max_retries=3, timeout=30):
        self.num_threads = num_threads
        self.max_retries = max_retries
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
        })
    
    def download_file(self, url, output_path, progress_callback=None):
        """
        Descargar archivo con chunks grandes, reintentos y validación
        
        Args:
            url: URL del archivo
            output_path: Ruta de salida
            progress_callback: Función callback(downloaded, total, speed_mbps)
            
        Returns:
            bool: True si descarga exitosa, False si falla
            
        Raises:
            DownloadError: Si la descarga falla después de todos los reintentos
        """
        output_path = Path(output_path)
        
        # Intentar obtener tamaño con HEAD (puede fallar en GitHub)
        total_size = 0
        supports_range = False
        
        try:
            head = self.session.head(url, allow_redirects=True, timeout=self.timeout)
            if head.status_code == 200:
                total_size = int(head.headers.get('content-length', 0))
                supports_range = head.headers.get('accept-ranges', '').lower() == 'bytes'
        except Exception as e:
            print(f"⚠️ HEAD request falló (normal para GitHub): {e}")
            # No es crítico, continuamos con GET
        
        # Intentar descarga con reintentos
        for attempt in range(1, self.max_retries + 1):
            try:
                print(f"📥 Intento {attempt}/{self.max_retries} de descarga...")
                
                # Usar multi-parte solo si el servidor soporta ranges y archivo es grande
                if supports_range and total_size > 100 * 1024 * 1024:
                    print(f"⚡ Usando descarga multi-parte ({self.num_threads} threads)")
                    success = self._download_multipart(url, output_path, progress_callback, total_size)
                else:
                    print(f"⚡ Usando descarga directa optimizada")
                    success = self._download_simple(url, output_path, progress_callback, total_size)
                
                # Validar descarga
                if success and self._validate_download(output_path, total_size):
                    print(f"✅ Descarga exitosa y validada")
                    return True
                else:
                    raise DownloadError("Archivo descargado incompleto o corrupto")
                    
            except Exception as e:
                print(f"❌ Intento {attempt} falló: {e}")
                
                # Limpiar archivo parcial
                if output_path.exists():
                    try:
                        output_path.unlink()
                    except:
                        pass
                
                # Si no es el último intento, esperar antes de reintentar
                if attempt < self.max_retries:
                    wait_time = attempt * 2  # Espera progresiva: 2s, 4s, 6s
                    print(f"⏳ Esperando {wait_time}s antes de reintentar...")
                    time.sleep(wait_time)
                else:
                    # Último intento falló
                    error_msg = f"❌ Descarga falló después de {self.max_retries} intentos: {str(e)}"
                    raise DownloadError(error_msg)
        
        return False
    
    def _validate_download(self, file_path, expected_size=0):
        """
        Validar que el archivo se descargó correctamente
        
        Args:
            file_path: Path al archivo descargado
            expected_size: Tamaño esperado en bytes (0 = no validar tamaño)
            
        Returns:
            bool: True si archivo es válido
        """
        if not file_path.exists():
            print(f"❌ Archivo no existe: {file_path}")
            return False
        
        actual_size = file_path.stat().st_size
        
        if actual_size == 0:
            print(f"❌ Archivo vacío")
            return False
        
        if expected_size > 0:
            # Validar que el tamaño sea correcto (con margen de 1% por headers)
            size_diff = abs(actual_size - expected_size)
            tolerance = max(1024, expected_size * 0.01)  # 1% o 1KB mínimo
            
            if size_diff > tolerance:
                print(f"⚠️ Tamaño incorrecto: esperado {expected_size/1024/1024:.1f}MB, "
                      f"obtenido {actual_size/1024/1024:.1f}MB")
                return False
        
        print(f"✅ Archivo válido: {actual_size/1024/1024:.1f} MB")
        return True
    
    def _download_simple(self, url, output_path, progress_callback, total_size):
        """
        Descarga optimizada con chunks grandes y manejo robusto de errores
        
        Returns:
            bool: True si descarga exitosa
            
        Raises:
            Exception: Si hay error en la descarga
        """
        downloaded = 0
        chunk_size = 1024 * 1024  # 1 MB chunks (óptimo para velocidad)
        
        try:
            # Realizar GET request con stream
            response = self.session.get(url, stream=True, timeout=self.timeout, allow_redirects=True)
            response.raise_for_status()  # Lanza excepción si status != 200
            
            # Si no teníamos el tamaño, obtenerlo del response
            if total_size == 0:
                total_size = int(response.headers.get('content-length', 0))
            
            start_time = time.time()
            last_update = start_time
            
            # Escribir archivo
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=chunk_size):
                    if chunk:  # Filtrar keep-alive chunks
                        f.write(chunk)
                        downloaded += len(chunk)
                        
                        # Actualizar progreso (cada 0.5s para no saturar UI)
                        current_time = time.time()
                        if progress_callback and (current_time - last_update) > 0.5:
                            elapsed = current_time - start_time
                            speed_mbps = (downloaded / (1024 * 1024)) / elapsed if elapsed > 0 else 0
                            progress_callback(downloaded, total_size, speed_mbps)
                            last_update = current_time
            
            # Última actualización de progreso
            if progress_callback and total_size > 0:
                elapsed = time.time() - start_time
                speed_mbps = (downloaded / (1024 * 1024)) / elapsed if elapsed > 0 else 0
                progress_callback(downloaded, total_size, speed_mbps)
            
            return True
            
        except requests.exceptions.Timeout:
            raise DownloadError(f"Timeout: La descarga tardó más de {self.timeout}s")
        except requests.exceptions.ConnectionError:
            raise DownloadError("Error de conexión: Verifica tu internet")
        except requests.exceptions.HTTPError as e:
            raise DownloadError(f"Error HTTP {e.response.status_code}: {e}")
        except IOError as e:
            raise DownloadError(f"Error escribiendo archivo: {e}")
        except Exception as e:
            raise DownloadError(f"Error inesperado: {e}")
    
    def _download_multipart(self, url, output_path, progress_callback, total_size):
        """
        Descarga multi-threaded por partes (MÁS RÁPIDO)
        Solo se usa si el servidor soporta Range requests
        
        Returns:
            bool: True si descarga exitosa
            
        Raises:
            Exception: Si hay error en la descarga
        """
        try:
            # Dividir en partes
            part_size = total_size // self.num_threads
            parts = []
            
            for i in range(self.num_threads):
                start = i * part_size
                end = start + part_size - 1 if i < self.num_threads - 1 else total_size - 1
                parts.append((start, end))
            
            # Descargar partes en paralelo
            downloaded_parts = [None] * self.num_threads
            total_downloaded = [0]
            start_time = time.time()
            last_update = [start_time]
            download_errors = []
            
            def download_part(part_index, start, end):
                """Descargar una parte del archivo"""
                try:
                    headers = {'Range': f'bytes={start}-{end}'}
                    response = self.session.get(url, headers=headers, stream=True, 
                                               timeout=self.timeout, allow_redirects=True)
                    response.raise_for_status()
                    
                    data = bytearray()
                    for chunk in response.iter_content(chunk_size=1024*1024):
                        if chunk:
                            data.extend(chunk)
                            total_downloaded[0] += len(chunk)
                            
                            # Actualizar progreso (cada 0.5s)
                            current_time = time.time()
                            if progress_callback and (current_time - last_update[0]) > 0.5:
                                elapsed = current_time - start_time
                                speed_mbps = (total_downloaded[0] / (1024 * 1024)) / elapsed if elapsed > 0 else 0
                                progress_callback(total_downloaded[0], total_size, speed_mbps)
                                last_update[0] = current_time
                    
                    downloaded_parts[part_index] = bytes(data)
                    
                except Exception as e:
                    error_msg = f"Error en parte {part_index}: {e}"
                    download_errors.append(error_msg)
                    raise
            
            # Ejecutar descargas en paralelo
            with ThreadPoolExecutor(max_workers=self.num_threads) as executor:
                futures = []
                for i, (start, end) in enumerate(parts):
                    future = executor.submit(download_part, i, start, end)
                    futures.append(future)
                
                # Esperar a que terminen todas
                for future in as_completed(futures):
                    future.result()  # Lanza excepción si alguna parte falló
            
            # Verificar que todas las partes se descargaron
            if any(part is None for part in downloaded_parts):
                raise DownloadError("Algunas partes no se descargaron correctamente")
            
            if download_errors:
                raise DownloadError(f"Errores en descarga: {'; '.join(download_errors)}")
            
            # Combinar partes
            print(f"🔄 Combinando {len(parts)} partes...")
            with open(output_path, 'wb') as f:
                for i, part_data in enumerate(downloaded_parts):
                    if part_data:
                        f.write(part_data)
            
            # Última actualización de progreso
            if progress_callback:
                elapsed = time.time() - start_time
                speed_mbps = (total_downloaded[0] / (1024 * 1024)) / elapsed if elapsed > 0 else 0
                progress_callback(total_downloaded[0], total_size, speed_mbps)
            
            return True
            
        except Exception as e:
            raise DownloadError(f"Error en descarga multi-parte: {e}")

