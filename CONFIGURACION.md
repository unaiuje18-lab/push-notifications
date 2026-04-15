# 🔧 Guía de Configuración - Sistema de Notificaciones Push

## ❌ Problema: "Los mensajes no se envían"

Si las notificaciones no se están enviando, **necesitas configurar tus credenciales de Firebase** en los siguientes archivos:

---

## 📋 Checklist de Configuración

### ✅ Paso 1: Configurar Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. **Crea un proyecto nuevo** o selecciona uno existente
3. Habilita **Cloud Messaging** en tu proyecto

---

### ✅ Paso 2: Configurar el Frontend (Cliente)

#### 2.1 Obtener credenciales de la aplicación web

1. En Firebase Console → **Project Settings** (⚙️)
2. En la sección **"Your apps"** (Tus aplicaciones), busca o crea una **Web app**
3. Verás algo como esto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-123456",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456",
  measurementId: "G-XXXXXXXXXX"
};
```

#### 2.2 Obtener VAPID Key (Web Push Certificate)

1. En Firebase Console → **Project Settings** → Pestaña **"Cloud Messaging"**
2. Baja hasta **"Web Push certificates"**
3. Si no tienes ninguna, haz click en **"Generate key pair"**
4. Copia la **clave pública** (se ve algo así: `BPxxx...xxx`)

#### 2.3 Actualizar archivos de configuración

Edita estos **DOS archivos** con tus credenciales:

**📄 `public/firebase-config.js`**
```javascript
export const firebaseConfig = {
    apiKey: "AIzaSyDxxxxx",  // ← REEMPLAZAR
    authDomain: "tu-proyecto.firebaseapp.com",  // ← REEMPLAZAR
    projectId: "tu-proyecto-123456",  // ← REEMPLAZAR
    storageBucket: "tu-proyecto.appspot.com",  // ← REEMPLAZAR
    messagingSenderId: "123456789012",  // ← REEMPLAZAR
    appId: "1:123456789012:web:abc123",  // ← REEMPLAZAR
    measurementId: "G-XXXXXXXXXX"  // ← REEMPLAZAR
};

export const VAPID_KEY = "BPxxxxxxxxxxxxxx";  // ← REEMPLAZAR
```

**📄 `public/firebase-config-sw.js`**
```javascript
const firebaseConfigSW = {
    apiKey: "AIzaSyDxxxxx",  // ← MISMOS VALORES QUE ARRIBA
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-123456",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123"
};
```

---

### ✅ Paso 3: Configurar el Backend (Servidor)

#### 3.1 Obtener credenciales del Admin SDK

1. En Firebase Console → **Project Settings** → Pestaña **"Service accounts"**
2. Haz click en **"Generate new private key"**
3. Se descargará un archivo JSON (algo como `tu-proyecto-firebase-adminsdk-xxxxx.json`)
4. **Guarda este archivo** en la raíz de tu proyecto y **NO LO SUBAS A GIT**

#### 3.2 Configurar el archivo .env

**OPCIÓN A: Usar archivo JSON (Recomendado)**

Edita `.env` y descomenta/actualiza esta línea:

```env
FIREBASE_ADMIN_SDK_PATH=./tu-proyecto-firebase-adminsdk-xxxxx.json
```

**OPCIÓN B: Usar variables individuales**

Abre el archivo JSON y copia los valores a `.env`:

```env
FIREBASE_PROJECT_ID=tu-proyecto-123456
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----"
```

---

## 🚀 Probar la Configuración

### 1. Reiniciar el servidor

```powershell
# Detén el servidor si está corriendo (Ctrl+C)
# Inicia de nuevo:
node server/index.js
```

Deberías ver:
```
✅ Firebase inicializado correctamente
✅ Base de datos inicializada correctamente
✨ Servidor corriendo en http://localhost:3000
```

### 2. Abrir el navegador

1. Ve a `http://localhost:3000`
2. Abre la consola del navegador (F12)
3. Deberías ver:
   - ✅ `Aplicación iniciada`
   - ✅ `Service Worker registrado`
   - ✅ `Firebase SDK cargado correctamente`
   - ✅ `Firebase inicializado correctamente`
   - ✅ `Configuración de Firebase validada correctamente`

### 3. Activar notificaciones

1. Click en **"Activar notificaciones"**
2. Acepta los permisos en el navegador
3. En la consola deberías ver:
   - ✅ `Token obtenido: xxx...`
   - ✅ `Token guardado en el servidor correctamente`

### 4. Enviar una notificación de prueba

1. Click en **"Enviar notificación de prueba"**
2. Deberías recibir la notificación

---

## ❓ Solución de Problemas

### "Firebase no está inicializado"

❌ **Problema**: Credenciales incorrectas en el servidor
✅ **Solución**: Revisa el archivo `.env` y las credenciales del Admin SDK

### "Error al obtener token"

❌ **Problema**: VAPID Key incorrecta o falta configuración
✅ **Solución**: 
- Verifica que `VAPID_KEY` en `firebase-config.js` sea correcto
- Asegúrate de que ambos archivos de config tengan los mismos valores

### "No se pudo obtener el token"

❌ **Problema**: Service Worker no registrado o Firebase mal configurado
✅ **Solución**:
- Abre DevTools → Application → Service Workers
- Asegúrate de que `sw.js` esté activo
- Verifica que `firebase-config-sw.js` tenga las credenciales correctas

### Las notificaciones no llegan

❌ **Problema**: No hay suscripciones activas o servidor no envía
✅ **Solución**:
```powershell
# Verificar suscripciones activas:
curl http://localhost:3000/api/subscriptions
```

Si devuelve `count: 0`, necesitas suscribirte desde el frontend primero.

---

## 📚 Recursos

- [Firebase Console](https://console.firebase.google.com/)
- [Documentación de FCM](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)

---

## 🔒 Seguridad

⚠️ **IMPORTANTE**: 
- NO subas a Git el archivo `.env` ni el JSON de credenciales
- Añade estos archivos a `.gitignore`:
  ```
  .env
  *-firebase-adminsdk-*.json
  serviceAccountKey.json
  ```
