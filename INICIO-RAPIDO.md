# 🚀 Inicio Rápido - 2 pasos restantes

## ¿Por qué no se envían los mensajes?

**Faltan 2 configuraciones:**

---

## 1️⃣ VAPID Key (1 minuto)

### Paso a paso:
1. Abre este link: https://console.firebase.google.com/project/push-notifications-388cc/settings/cloudmessaging

2. Busca la sección **"Web Push certificates"**

3. Si no existe, click en **"Generate key pair"**

4. **Copia la clave** (empieza con "B" y tiene muchos caracteres)

5. **Pega la clave** en `public/firebase-config.js` línea 30:
   ```javascript
   export const VAPID_KEY = "BPxxxxxxxxxxxxxxxxxxx...";
   ```

---

## 2️⃣ Admin SDK (2 minutos)

### Paso a paso:
1. Abre este link: https://console.firebase.google.com/project/push-notifications-388cc/settings/serviceaccounts/adminsdk

2. Click en **"Generate new private key"**

3. Se descarga un archivo `.json`

4. **Mueve el archivo** a tu carpeta:
   ```
   C:\Users\UnaiJoséEscudero\Documents\web-push-notifications\
   ```

5. **Abre el archivo `.env`** y agrega esta línea (reemplaza con tu nombre de archivo):
   ```env
   FIREBASE_ADMIN_SDK_PATH=./push-notifications-388cc-firebase-adminsdk-xxxxx.json
   ```

---

## ✅ ¡Listo! Ahora prueba:

```powershell
# Inicia el servidor
node server/index.js

# Abre el navegador
# http://localhost:3000

# Activa notificaciones y prueba
```

---

## 📚 Más ayuda:
- `CHECKLIST.md` - Lista de verificación
- `OBTENER-VAPID-KEY.md` - Guía detallada VAPID
- `OBTENER-ADMIN-SDK.md` - Guía detallada Admin SDK
- `CONFIGURACION.md` - Guía completa con solución de problemas
