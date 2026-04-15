# 🔔 Sistema de Notificaciones Push Web

Sistema completo de notificaciones push web con Firebase Cloud Messaging (FCM), listo para producción.

## 📋 Características

### Frontend
- ✅ Interfaz moderna y responsive
- ✅ Botón no intrusivo para activar notificaciones
- ✅ Service Worker con manejo completo de eventos
- ✅ Soporte para notificaciones incluso con la web cerrada
- ✅ Gestión de estados (activado/desactivado/bloqueado)

### Backend
- ✅ API RESTful con Express.js
- ✅ Integración con Firebase Admin SDK
- ✅ Base de datos SQLite para almacenamiento de tokens
- ✅ Sistema de envío a todos los usuarios, usuario específico o topics
- ✅ Historial de notificaciones enviadas
- ✅ Estadísticas en tiempo real

### Seguridad
- ✅ Rate limiting
- ✅ Validación y sanitización de datos
- ✅ Helmet para headers de seguridad
- ✅ Variables de entorno para credenciales

### Extras
- ✅ Panel de administración web
- ✅ Trabajos programados (cron jobs)
- ✅ Limpieza automática de tokens inválidos
- ✅ Sistema modular y escalable

---

## 🚀 Instalación

### 1. Requisitos previos

- **Node.js** >= 16.0.0
- **npm** o **yarn**
- Cuenta de **Firebase** (gratuita)

### 2. Clonar o descargar el proyecto

```bash
cd web-push-notifications
```

### 3. Instalar dependencias

```bash
npm install
```

---

## 🔥 Configuración de Firebase

### Paso 1: Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Activa **Cloud Messaging** en el proyecto

### Paso 2: Obtener credenciales web (Frontend)

1. En Firebase Console → **Project Settings** (⚙️)
2. En la pestaña **General**, baja hasta **Your apps**
3. Haz clic en el ícono **Web** (</>)
4. Registra tu app
5. Copia el objeto `firebaseConfig`
6. Pega estos valores en:
   - `public/app.js` (línea 2-10)
   - `public/sw.js` (línea 11-18)

Ejemplo:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};
```

### Paso 3: Obtener VAPID Key

1. En Firebase Console → **Project Settings** → **Cloud Messaging**
2. En **Web configuration**, genera un nuevo par de claves
3. Copia la **Web Push certificate** (VAPID Key)
4. Pega este valor en `public/app.js` línea 203

Ejemplo:
```javascript
vapidKey: 'BJ4Xh3kJ9X...' // Tu clave VAPID
```

### Paso 4: Obtener credenciales del servidor (Backend)

1. En Firebase Console → **Project Settings** → **Service Accounts**
2. Haz clic en **Generate new private key**
3. Descarga el archivo JSON
4. **Opción A**: Guarda el archivo como `server/config/firebase-adminsdk.json`
5. **Opción B**: O usa las variables de entorno (ver siguiente paso)

### Paso 5: Configurar variables de entorno

1. Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

2. Edita el archivo `.env` con tus credenciales:

```env
PORT=3000
FRONTEND_URL=http://localhost:3000

# Opción A: Ruta al archivo JSON
FIREBASE_ADMIN_SDK_PATH=./server/config/firebase-adminsdk.json

# Opción B: Variables individuales (abre el JSON descargado y copia los valores)
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_AQUI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com

DB_PATH=./server/data/notifications.db
SECRET_KEY=genera-una-clave-secreta-aqui
```

Para generar una clave secreta:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ▶️ Ejecutar el proyecto

### Modo desarrollo

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor estará disponible en:
- **Frontend**: http://localhost:3000
- **Panel de admin**: http://localhost:3000/admin.html
- **API**: http://localhost:3000/api

---

## 📡 API Endpoints

### Suscripciones

#### `POST /api/subscribe`
Suscribir un token de usuario

```json
{
  "token": "firebase-token-aqui",
  "userId": "usuario123",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "platform": "Windows"
  }
}
```

#### `POST /api/unsubscribe`
Desuscribir un token

```json
{
  "token": "firebase-token-aqui"
}
```

### Envío de notificaciones

#### `POST /api/send-test`
Enviar notificación de prueba a un token

```json
{
  "token": "firebase-token-aqui"
}
```

#### `POST /api/send-to-all`
Enviar notificación a todos los usuarios

```json
{
  "title": "Título de la notificación",
  "body": "Mensaje de la notificación",
  "url": "https://ejemplo.com",
  "icon": "/icon.png"
}
```

#### `POST /api/send-to-user`
Enviar notificación a un usuario específico

```json
{
  "userId": "usuario123",
  "title": "Notificación personal",
  "body": "Este mensaje es solo para ti",
  "url": "/perfil"
}
```

#### `POST /api/send-to-topic`
Enviar notificación a un topic

```json
{
  "topic": "noticias",
  "title": "Nueva noticia",
  "body": "Contenido de la noticia"
}
```

### Estadísticas

#### `GET /api/stats`
Obtener estadísticas del sistema

Respuesta:
```json
{
  "success": true,
  "data": {
    "subscriptions": {
      "activeSubscriptions": 150,
      "inactiveSubscriptions": 10,
      "uniqueUsers": 120,
      "recentSubscriptions": 25
    },
    "notifications": {
      "totalNotifications": 500,
      "totalSuccess": 480,
      "totalFailure": 20,
      "successRate": "96.00"
    }
  }
}
```

#### `GET /api/history?limit=50`
Obtener historial de notificaciones

#### `GET /api/subscriptions`
Obtener lista de suscripciones activas

---

## 🎨 Panel de Administración

Accede al panel en: **http://localhost:3000/admin.html**

Funcionalidades:
- 📊 Estadísticas en tiempo real
- 📤 Enviar notificaciones manualmente
- 📜 Ver historial de envíos
- 🎯 Enviar a todos, usuario específico o topic

---

## ⏰ Trabajos Programados (Cron Jobs)

El sistema incluye cron jobs que puedes activar o personalizar en `server/jobs/scheduler.js`:

### Activos por defecto:
- **Limpieza diaria**: Elimina suscripciones inactivas > 30 días (3:00 AM)
- **Reporte semanal**: Genera estadísticas (Domingos 12:00 PM)

### Ejemplos comentados (para activar):
- Notificación diaria a las 9:00 AM
- Resumen semanal los lunes a las 10:00 AM

Para activar un ejemplo, simplemente descomenta el código en `server/jobs/scheduler.js`.

---

## 🗂️ Estructura del Proyecto

```
web-push-notifications/
├── public/                  # Frontend
│   ├── index.html          # Página principal
│   ├── admin.html          # Panel de administración
│   ├── app.js              # Lógica del frontend
│   ├── sw.js               # Service Worker
│   ├── styles.css          # Estilos
│   └── manifest.json       # PWA manifest
├── server/                  # Backend
│   ├── config/             # Configuraciones
│   │   ├── firebase.js     # Firebase Admin SDK
│   │   └── database.js     # SQLite
│   ├── controllers/        # Controladores
│   │   └── notificationController.js
│   ├── models/             # Modelos de datos
│   │   ├── Subscription.js
│   │   └── NotificationHistory.js
│   ├── routes/             # Rutas de la API
│   │   └── notifications.js
│   ├── jobs/               # Cron jobs
│   │   └── scheduler.js
│   └── index.js            # Servidor principal
├── .env.example            # Ejemplo de variables de entorno
├── .gitignore
├── package.json
└── README.md
```

---

## 🔐 Seguridad

### Buenas prácticas implementadas:

1. **Variables de entorno**: Credenciales nunca en el código
2. **Rate limiting**: Máximo 100 requests/minuto por IP
3. **Helmet**: Headers de seguridad HTTP
4. **Validación**: Todos los inputs son validados y sanitizados
5. **CORS**: Configurado para permitir solo orígenes confiables

### Recomendaciones para producción:

- Usa HTTPS (obligatorio para Service Workers)
- Configura un firewall
- Implementa autenticación para endpoints sensibles
- Usa un servicio de base de datos robusto (PostgreSQL, MongoDB)
- Configura logs y monitoreo

---

## 🧪 Testing

Para probar el sistema:

1. **Inicia el servidor**: `npm run dev`
2. **Abre**: http://localhost:3000
3. **Haz clic en**: "Activar notificaciones"
4. **Permite** las notificaciones en el navegador
5. **Haz clic en**: "Enviar notificación de prueba"

También puedes:
- Ir a **http://localhost:3000/admin.html**
- Enviar notificaciones desde el panel
- Ver estadísticas e historial

---

## 🐛 Solución de Problemas

### Error: "Firebase no inicializado"
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que el archivo `firebase-adminsdk.json` existe

### Las notificaciones no llegan
- Verifica que el VAPID key sea correcto en `app.js`
- Comprueba que Firebase Cloud Messaging esté habilitado
- Revisa la consola del navegador para errores

### Error de CORS
- Actualiza `FRONTEND_URL` en `.env` con la URL correcta
- Si usas un dominio diferente, configura CORS en `server/index.js`

### Service Worker no se registra
- Asegúrate de usar HTTPS (en producción)
- En desarrollo, `localhost` funciona sin HTTPS
- Verifica que `sw.js` esté en la carpeta `public/`

---

## 📦 Despliegue en Producción

### Preparación

1. Configura variables de entorno en tu servidor
2. Usa un gestor de procesos como **PM2**:

```bash
npm install -g pm2
pm2 start server/index.js --name push-notifications
pm2 save
pm2 startup
```

3. Configura un reverse proxy (Nginx, Apache)
4. Obtén un certificado SSL (Let's Encrypt)

### Ejemplo de configuración Nginx:

```nginx
server {
    listen 80;
    server_name tudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name tudominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si encuentras un bug o quieres añadir una funcionalidad:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT License - Siéntete libre de usar este proyecto para lo que necesites.

---

## 📞 Soporte

Si necesitas ayuda:

1. Revisa la documentación de [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
2. Consulta los [issues](https://github.com/tu-usuario/web-push-notifications/issues)
3. Lee la sección de **Solución de Problemas** arriba

---

## 🎓 Recursos Adicionales

- [MDN: Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Web Push Protocol](https://tools.ietf.org/html/rfc8030)

---

**¡Hecho con ❤️ para la comunidad!**
