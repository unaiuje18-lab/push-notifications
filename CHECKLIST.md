# ✅ Checklist de Configuración

## Estado actual:

### ✅ COMPLETADO:
- [x] Credenciales de Firebase Web App configuradas
  - `public/firebase-config.js` ✅
  - `public/firebase-config-sw.js` ✅

### ⏳ PENDIENTE:

#### 1. Obtener VAPID Key
- [ ] Ve a: https://console.firebase.google.com/project/push-notifications-388cc/settings/cloudmessaging
- [ ] Genera el "Web Push certificate" (si no existe)
- [ ] Copia la clave pública
- [ ] Actualiza `public/firebase-config.js` línea 30:
  ```javascript
  export const VAPID_KEY = "TU_CLAVE_AQUI";
  ```
- 📖 **Instrucciones detalladas**: Lee `OBTENER-VAPID-KEY.md`

#### 2. Descargar Admin SDK (para el servidor)
- [ ] Ve a: https://console.firebase.google.com/project/push-notifications-388cc/settings/serviceaccounts/adminsdk
- [ ] Click en "Generate new private key"
- [ ] Guarda el archivo JSON en la carpeta del proyecto
- [ ] Actualiza `.env` con la ruta del archivo:
  ```env
  FIREBASE_ADMIN_SDK_PATH=./nombre-del-archivo.json
  ```
- 📖 **Instrucciones detalladas**: Lee `OBTENER-ADMIN-SDK.md`

---

## 🚀 Una vez completado:

### Reinicia el servidor:
```powershell
node server/index.js
```

Deberías ver:
```
✅ Firebase inicializado correctamente
✅ Base de datos inicializada correctamente
✨ Servidor corriendo en http://localhost:3000
```

### Prueba las notificaciones:
1. Abre http://localhost:3000
2. Click en "Activar notificaciones"
3. Acepta los permisos
4. Click en "Enviar notificación de prueba"
5. ¡Deberías recibir la notificación! 🎉

---

## ❓ ¿Problemas?

Lee `CONFIGURACION.md` para solución de problemas detallada.
