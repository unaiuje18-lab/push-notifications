# 🔔 Configurar OneSignal + Firebase (Sistema Dual)

## 🎯 Objetivo:
Hacer que tu aplicación soporte **DOS sistemas de notificaciones**:
1. **Firebase** - Para enviar desde tu app web ✅ (Ya funciona)
2. **OneSignal** - Para enviar desde el dashboard de OneSignal ⏳ (Por configurar)

---

## 📋 Paso 1: Obtener credenciales de OneSignal

### 1. Ve a OneSignal Dashboard
🔗 https://onesignal.com/

### 2. Inicia sesión y selecciona tu app

### 3. Ve a Settings → Keys & IDs

### 4. Copia estos valores:

```
OneSignal App ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Safari Web ID: (opcional)
```

---

## 📝 Paso 2: Actualizar la configuración

Abre el archivo: `public/onesignal-config.js`

Reemplaza:
```javascript
appId: "TU_ONESIGNAL_APP_ID_AQUI"
```

Con tu App ID real:
```javascript
appId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

---

## 🚀 Paso 3: Actualizar app.js

Necesitas agregar el soporte de OneSignal en `app.js`.

Te voy a preparar el código actualizado...

---

## 🎯 Cómo funcionará:

### Sistema Dual:

**Para el usuario:**
1. Click en "Activar notificaciones"
2. Se suscribe **AUTOMÁTICAMENTE** a:
   - ✅ Firebase (para notificaciones desde tu app)
   - ✅ OneSignal (para notificaciones desde OneSignal dashboard)

**Para enviar notificaciones:**

**Opción A - Desde tu app web:**
- Abre: https://push-notifications-sooty.vercel.app/?admin=true
- Usa el panel de administración
- Envía notificaciones (usa Firebase)

**Opción B - Desde OneSignal Dashboard:**
- Ve a OneSignal Dashboard
- Create Message → Send to All
- Envía notificaciones (usa OneSignal)

Ambas llegarán a los usuarios suscritos! 🎉

---

## ⚠️ Importante:

Cuando envíes desde OneSignal, el usuario debe estar suscrito a OneSignal.
Cuando envíes desde tu app, el usuario debe estar suscrito a Firebase.

Si el usuario activa notificaciones en tu app, quedará suscrito a **AMBOS**.

---

## 📌 Próximos pasos:

1. Dame tu **OneSignal App ID**
2. Actualizaré `app.js` para soportar ambos sistemas
3. Subiré los cambios
4. Podrás enviar desde ambos lados

**¿Ya tienes tu OneSignal App ID?**
