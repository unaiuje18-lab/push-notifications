# 🚀 Guía Rápida de Inicio

## Pasos para poner en marcha el sistema (5 minutos)

### 1️⃣ Instalar dependencias
```bash
npm install
```

### 2️⃣ Crear proyecto en Firebase
1. Ve a https://console.firebase.google.com/
2. Crea un nuevo proyecto
3. Activa "Cloud Messaging"

### 3️⃣ Configurar Frontend
1. En Firebase Console, ve a **Project Settings** → **General**
2. Añade una app Web (</>)
3. Copia el `firebaseConfig` y pégalo en:
   - `public/app.js` (líneas 2-10)
   - `public/sw.js` (líneas 11-18)

### 4️⃣ Obtener VAPID Key
1. En Firebase Console → **Project Settings** → **Cloud Messaging**
2. Copia la "Web Push certificate"
3. Pégala en `public/app.js` línea 203

### 5️⃣ Configurar Backend
1. En Firebase Console → **Project Settings** → **Service Accounts**
2. Haz clic en "Generate new private key"
3. Descarga el JSON
4. Guárdalo como `server/config/firebase-adminsdk.json`

### 6️⃣ Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` y configura:
```env
PORT=3000
FIREBASE_ADMIN_SDK_PATH=./server/config/firebase-adminsdk.json
```

### 7️⃣ Iniciar el servidor
```bash
npm run dev
```

### 8️⃣ Probar
1. Abre http://localhost:3000
2. Haz clic en "Activar notificaciones"
3. Permite las notificaciones
4. Haz clic en "Enviar notificación de prueba"

---

## 🎉 ¡Listo!

Si todo funciona correctamente, deberías recibir una notificación de prueba.

### Siguiente paso
- Accede al panel de administración: http://localhost:3000/admin.html
- Lee el README.md completo para más detalles

---

## ⚠️ Problemas comunes

**"Firebase no inicializado"**
→ Verifica que el archivo `server/config/firebase-adminsdk.json` existe

**Las notificaciones no llegan**
→ Asegúrate de haber copiado correctamente el VAPID key en `app.js`

**Error al registrar Service Worker**
→ Recarga la página con Ctrl+Shift+R (o Cmd+Shift+R en Mac)

---

Para más ayuda, consulta el **README.md** completo.
