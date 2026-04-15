#!/usr/bin/env python3
"""
Servidor de notificaciones push con Firebase Cloud Messaging
Alternativa en Python al servidor Node.js
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import sqlite3
import os
from urllib.parse import parse_qs
import firebase_admin
from firebase_admin import credentials, messaging
from datetime import datetime
import threading

# Configuración
PORT = 3000
DB_PATH = 'notifications.db'

class NotificationHandler(SimpleHTTPRequestHandler):
    
    def __init__(self, *args, **kwargs):
        # Servir archivos desde la carpeta 'public'
        super().__init__(*args, directory='public', **kwargs)
    
    def do_OPTIONS(self):
        """Manejar preflight CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Manejar peticiones POST de la API"""
        # CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        
        # Rutas de la API
        if self.path == '/api/subscribe':
            self.handle_subscribe()
        elif self.path == '/api/unsubscribe':
            self.handle_unsubscribe()
        elif self.path == '/api/send-test':
            self.handle_send_test()
        elif self.path == '/api/send-to-all':
            self.handle_send_to_all()
        elif self.path == '/api/subscriptions':
            self.handle_get_subscriptions()
        else:
            self.send_error(404, 'Ruta no encontrada')
    
    def do_GET(self):
        """Manejar peticiones GET"""
        # Rutas de la API
        if self.path.startswith('/api/'):
            self.send_header('Access-Control-Allow-Origin', '*')
            
            if self.path == '/api/subscriptions':
                self.handle_get_subscriptions()
            elif self.path == '/api/stats':
                self.handle_get_stats()
            elif self.path == '/health':
                self.handle_health()
            else:
                self.send_error(404, 'Ruta no encontrada')
        else:
            # Servir archivos estáticos
            super().do_GET()
    
    def handle_subscribe(self):
        """Suscribir un token"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            token = data.get('token')
            user_id = data.get('userId', 'anonymous')
            
            if not token:
                self.send_json_response({'success': False, 'error': 'Token requerido'}, 400)
                return
            
            # Guardar en base de datos
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO subscriptions (token, user_id, created_at, last_active)
                VALUES (?, ?, ?, ?)
            ''', (token, user_id, datetime.now().isoformat(), datetime.now().isoformat()))
            conn.commit()
            conn.close()
            
            self.send_json_response({
                'success': True,
                'message': 'Suscripción guardada correctamente'
            })
            
        except Exception as e:
            print(f"Error en subscribe: {e}")
            self.send_json_response({'success': False, 'error': str(e)}, 500)
    
    def handle_unsubscribe(self):
        """Desuscribir un token"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            token = data.get('token')
            
            if not token:
                self.send_json_response({'success': False, 'error': 'Token requerido'}, 400)
                return
            
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM subscriptions WHERE token = ?', (token,))
            conn.commit()
            deleted = cursor.rowcount > 0
            conn.close()
            
            self.send_json_response({
                'success': True,
                'message': 'Suscripción eliminada' if deleted else 'Suscripción no encontrada'
            })
            
        except Exception as e:
            print(f"Error en unsubscribe: {e}")
            self.send_json_response({'success': False, 'error': str(e)}, 500)
    
    def handle_send_test(self):
        """Enviar notificación de prueba"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            token = data.get('token')
            
            if not token:
                self.send_json_response({'success': False, 'error': 'Token requerido'}, 400)
                return
            
            # Enviar notificación
            message = messaging.Message(
                notification=messaging.Notification(
                    title='🧪 Notificación de prueba',
                    body='Si ves esto, ¡las notificaciones funcionan correctamente!'
                ),
                token=token,
                webpush=messaging.WebpushConfig(
                    notification=messaging.WebpushNotification(
                        icon='/icon.png',
                        badge='/badge.png'
                    ),
                    fcm_options=messaging.WebpushFCMOptions(
                        link='/'
                    )
                )
            )
            
            response = messaging.send(message)
            print(f'Notificación enviada: {response}')
            
            self.send_json_response({
                'success': True,
                'message': 'Notificación enviada correctamente'
            })
            
        except Exception as e:
            print(f"Error al enviar notificación: {e}")
            self.send_json_response({'success': False, 'error': str(e)}, 500)
    
    def handle_send_to_all(self):
        """Enviar notificación a todos los usuarios"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            title = data.get('title')
            body = data.get('body')
            url = data.get('url', '/')
            
            if not title or not body:
                self.send_json_response({'success': False, 'error': 'Título y mensaje requeridos'}, 400)
                return
            
            # Obtener todos los tokens
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('SELECT token FROM subscriptions WHERE active = 1')
            tokens = [row[0] for row in cursor.fetchall()]
            conn.close()
            
            if not tokens:
                self.send_json_response({
                    'success': True,
                    'message': 'No hay usuarios suscritos',
                    'count': 0
                })
                return
            
            # Enviar notificaciones (en lotes de 500)
            success_count = 0
            failure_count = 0
            
            for i in range(0, len(tokens), 500):
                batch = tokens[i:i+500]
                
                message = messaging.MulticastMessage(
                    notification=messaging.Notification(
                        title=title,
                        body=body
                    ),
                    tokens=batch,
                    webpush=messaging.WebpushConfig(
                        notification=messaging.WebpushNotification(
                            icon='/icon.png',
                            badge='/badge.png'
                        ),
                        fcm_options=messaging.WebpushFCMOptions(
                            link=url
                        )
                    )
                )
                
                response = messaging.send_multicast(message)
                success_count += response.success_count
                failure_count += response.failure_count
            
            self.send_json_response({
                'success': True,
                'count': success_count,
                'failed': failure_count,
                'message': f'Notificación enviada a {success_count} usuarios'
            })
            
        except Exception as e:
            print(f"Error al enviar notificaciones: {e}")
            self.send_json_response({'success': False, 'error': str(e)}, 500)
    
    def handle_get_subscriptions(self):
        """Obtener lista de suscripciones"""
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(*) FROM subscriptions WHERE active = 1')
            count = cursor.fetchone()[0]
            conn.close()
            
            self.send_json_response({
                'success': True,
                'count': count
            })
            
        except Exception as e:
            print(f"Error al obtener suscripciones: {e}")
            self.send_json_response({'success': False, 'error': str(e)}, 500)
    
    def handle_get_stats(self):
        """Obtener estadísticas"""
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(*) FROM subscriptions WHERE active = 1')
            active = cursor.fetchone()[0]
            cursor.execute('SELECT COUNT(*) FROM subscriptions')
            total = cursor.fetchone()[0]
            conn.close()
            
            self.send_json_response({
                'success': True,
                'data': {
                    'active_subscriptions': active,
                    'total_subscriptions': total
                }
            })
            
        except Exception as e:
            print(f"Error al obtener estadísticas: {e}")
            self.send_json_response({'success': False, 'error': str(e)}, 500)
    
    def handle_health(self):
        """Health check"""
        self.send_json_response({
            'status': 'OK',
            'timestamp': datetime.now().isoformat()
        })
    
    def send_json_response(self, data, status=200):
        """Enviar respuesta JSON"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def log_message(self, format, *args):
        """Log personalizado"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")


def init_database():
    """Inicializar base de datos"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT UNIQUE NOT NULL,
            user_id TEXT,
            created_at TEXT,
            last_active TEXT,
            active INTEGER DEFAULT 1
        )
    ''')
    
    conn.commit()
    conn.close()
    print('✅ Base de datos inicializada')


def init_firebase():
    """Inicializar Firebase Admin SDK"""
    try:
        cred_path = './firebase-adminsdk.json'
        
        if not os.path.exists(cred_path):
            print(f'❌ Error: No se encuentra {cred_path}')
            return False
        
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print('✅ Firebase inicializado correctamente')
        return True
        
    except Exception as e:
        print(f'❌ Error al inicializar Firebase: {e}')
        return False


def main():
    """Función principal"""
    print('\n🚀 Iniciando servidor...')
    
    # Inicializar base de datos
    print('💾 Inicializando base de datos...')
    init_database()
    
    # Inicializar Firebase
    print('📱 Inicializando Firebase...')
    if not init_firebase():
        print('\n❌ No se pudo inicializar Firebase')
        print('Verifica que existe el archivo firebase-adminsdk.json')
        return
    
    # Iniciar servidor
    server = HTTPServer(('', PORT), NotificationHandler)
    
    print('\n' + '='*50)
    print(f'✨ Servidor corriendo en http://localhost:{PORT}')
    print(f'🌍 Entorno: development')
    print(f'📡 API disponible en http://localhost:{PORT}/api')
    print('='*50)
    print('\nPresiona Ctrl+C para detener el servidor\n')
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n\n🛑 Deteniendo servidor...')
        server.shutdown()
        print('✅ Servidor detenido')


if __name__ == '__main__':
    main()
