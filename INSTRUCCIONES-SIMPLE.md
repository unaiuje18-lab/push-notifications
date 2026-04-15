# 🚀 Notificaciones Push - Versión Simple (SIN INSTALAR NADA)

Esta es la versión simplificada que funciona **sin necesidad de instalar Node.js** ni servidor backend.

## 📁 Archivos a usar:

- **`index-simple.html`** → Página para que los usuarios activen notificaciones
- **`admin-simple.html`** → Panel para enviar notificaciones  
- **`sw-simple.js`** → Service Worker (necesario)

---

## 🔥 Paso 1: Configurar Firebase (5 minutos)

### 1.1 Crear proyecto en Firebase

1. Ve a: **https://console.firebase.google.com/**
2. Haz clic en **"Crear un proyecto"**
3. Dale un nombre (ej: "mis-notificaciones")
4. Acepta los términos y **crea el proyecto**

### 1.2 Activar Cloud Messaging

1. En el menú lateral, busca **"Cloud Messaging"**
2. Si te pide activarlo, hazlo

### 1.3 Obtener credenciales para el FRONTEND

1. Ve a **⚙️ Configuración del proyecto**
2. Pestaña **"General"**
3. Baja hasta **"Tus apps"**
4. Haz clic en el ícono **Web** (`</>`)
5. Dale un nombre a tu app
6. **COPIA** el código que aparece (firebaseConfig)

### 1.4 Configurar los archivos HTML

Abre **`index-simple.html`** y reemplaza las líneas 169-176:

```javascript
const firebaseConfig = {
    apiKey: "TU-API-KEY-REAL",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

Haz lo mismo en **`sw-simple.js`** líneas 6-13

### 1.5 Obtener VAPID Key

1. En Firebase Console → **Cloud Messaging**
2. Pestaña **"Configuración web"**
3. Haz clic en **"Generar par de claves"**
4. **COPIA** la clave que aparece

Pégala en **`index-simple.html`** línea 179:

```javascript
const VAPID_KEY = "TU-VAPID-KEY-REAL";
```

### 1.6 Obtener Server Key (para el admin)

1. En Firebase Console → **Cloud Messaging**
2. Pestaña **"Cloud Messaging API (Legacy)"**
3. Si dice "deshabilitada", **actívala**
4. **COPIA** la **Server Key**

(La usarás luego en el panel de admin)

---

## 📤 Paso 2: Subir a un servidor web

Necesitas que los archivos estén en un servidor web (no funcionan abriendo directamente desde el explorador de archivos).

### Opción A: GitHub Pages (GRATIS y fácil)

1. Sube los archivos a tu repositorio de GitHub
2. Ve a **Settings** → **Pages**
3. En **Source** selecciona **"main"** branch
4. Guarda y espera 1 minuto
5. Tu sitio estará en: `https://tu-usuario.github.io/tu-repo/`

### Opción B: Netlify Drop (GRATIS, sin cuenta)

1. Ve a: **https://app.netlify.com/drop**
2. Arrastra la carpeta `public` completa
3. Listo, te dará una URL pública

### Opción C: Servidor local simple

Si tienes Python instalado:

```bash
# En la carpeta 'public':
python -m http.server 8000
```

Luego abre: **http://localhost:8000/index-simple.html**

---

## 🎯 Paso 3: Usar el sistema

### Para USUARIOS (activar notificaciones):

1. Abre: **`index-simple.html`**
2. Haz clic en **"Activar Notificaciones"**
3. Dale **"Permitir"** cuando el navegador lo pida
4. ¡Listo! Verás una notificación de bienvenida

### Para ADMINISTRADORES (enviar notificaciones):

1. Abre: **`admin-simple.html`**
2. Pega tu **Server Key** de Firebase (paso 1.6)
3. Escribe el **título** y **mensaje**
4. Haz clic en **"Enviar a Todos los Usuarios"**
5. ¡Todas las personas que activaron las notificaciones las recibirán!

---

## 💡 Cómo funciona

1. Cuando alguien activa las notificaciones, su **token** se guarda en `localStorage`
2. El panel de admin lee todos los tokens guardados
3. Cuando envías una notificación, usa la API de Firebase para enviarla a cada token
4. **No necesitas servidor** → Todo funciona en el navegador

---

## ⚠️ Limitaciones de esta versión simple

- Los tokens se guardan solo en el navegador del usuario
- Si borran cookies/datos, pierden el token
- No hay base de datos centralizada
- Solo funciona si el admin y los usuarios usan el mismo navegador/dispositivo

### Para una versión profesional:

Si necesitas:
- Base de datos centralizada
- Múltiples administradores
- Estadísticas avanzadas
- Envío programado automático

→ Usa la versión completa con Node.js (README.md principal)

---

## 🧪 Probar AHORA mismo

1. **Abre** dos pestañas del navegador
2. **Pestaña 1**: `index-simple.html` → Activa notificaciones
3. **Pestaña 2**: `admin-simple.html` → Envía una notificación
4. ¡Deberías verla aparecer! 🎉

---

## 🔒 Seguridad

⚠️ **IMPORTANTE**: La Server Key es sensible. En producción:
- No la incluyas en el código
- Usa un backend para enviar notificaciones
- Esta versión simple es solo para pruebas/demos

---

## 📞 ¿Problemas?

### "No funciona al abrir el archivo directamente"
→ Necesitas un servidor web (GitHub Pages, Netlify, o `python -m http.server`)

### "No aparece la opción de permitir notificaciones"
→ Asegúrate de usar **HTTPS** o **localhost**

### "Error al enviar notificaciones"
→ Verifica que la Server Key sea correcta y que Cloud Messaging API (Legacy) esté habilitada

---

¡Listo! Ahora tienes notificaciones push funcionando sin instalar nada. 🚀
