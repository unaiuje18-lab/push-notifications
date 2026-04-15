# 🔑 Cómo obtener tu VAPID Key

## Pasos:

1. **Ve a Firebase Console**
   https://console.firebase.google.com/project/push-notifications-388cc/settings/cloudmessaging

2. **En la pestaña "Cloud Messaging"**, busca la sección **"Web Push certificates"**

3. **Si NO tienes ninguna clave:**
   - Haz click en **"Generate key pair"** (Generar par de claves)
   - Se generará una clave pública

4. **Copia la clave pública** (se ve algo así):
   ```
   BP7xLw3Bm9-JLWxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **Pega la clave** en el archivo:
   - `public/firebase-config.js` en la línea que dice:
     ```javascript
     export const VAPID_KEY = "TU_VAPID_KEY_PUBLICA_AQUI";
     ```

## Ejemplo:

Si tu VAPID Key es: `BP7xLw3Bm9-JLWxxxxx`

Entonces actualiza:
```javascript
export const VAPID_KEY = "BP7xLw3Bm9-JLWxxxxx";
```

---

## 🔗 Link directo:
https://console.firebase.google.com/project/push-notifications-388cc/settings/cloudmessaging
