# 🔐 Cómo obtener las credenciales del Admin SDK

Estas credenciales son necesarias para que el **servidor** pueda enviar notificaciones.

## Pasos:

1. **Ve a Firebase Console - Service Accounts**
   https://console.firebase.google.com/project/push-notifications-388cc/settings/serviceaccounts/adminsdk

2. **Haz click en "Generate new private key"** (Generar nueva clave privada)

3. **Se descargará un archivo JSON** con un nombre como:
   ```
   push-notifications-388cc-firebase-adminsdk-xxxxx-1234567890.json
   ```

4. **Guarda el archivo** en la carpeta raíz de tu proyecto:
   ```
   C:\Users\UnaiJoséEscudero\Documents\web-push-notifications\
   ```

5. **Actualiza el archivo `.env`**:
   
   Abre el archivo `.env` y descomenta/actualiza esta línea con el nombre de tu archivo:
   
   ```env
   FIREBASE_ADMIN_SDK_PATH=./push-notifications-388cc-firebase-adminsdk-xxxxx-1234567890.json
   ```

## Ejemplo completo de `.env`:

```env
# ============================================
# CONFIGURACIÓN DEL SERVIDOR
# ============================================
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# ============================================
# FIREBASE ADMIN SDK
# ============================================
FIREBASE_ADMIN_SDK_PATH=./push-notifications-388cc-firebase-adminsdk-abc12-123456.json

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

---

## ⚠️ IMPORTANTE - Seguridad

**NUNCA subas este archivo JSON a Git o GitHub**

El archivo ya está protegido en `.gitignore`, pero asegúrate de:
- No compartir el archivo
- No copiarlo a lugares públicos
- No incluirlo en capturas de pantalla

---

## 🔗 Link directo:
https://console.firebase.google.com/project/push-notifications-388cc/settings/serviceaccounts/adminsdk
