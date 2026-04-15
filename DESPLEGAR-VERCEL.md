# 🚀 Desplegar en Vercel - ULTRA RÁPIDO

## ⭐ Opción RECOMENDADA: Subir a GitHub + Vercel

### Paso 1: Crear cuenta en Vercel
1. Ve a: https://vercel.com/signup
2. Regístrate **con tu cuenta de GitHub** (más fácil)

### Paso 2: Subir tu proyecto a GitHub
1. Ve a: https://github.com/new
2. Crea un repositorio nuevo llamado `web-push-notifications` (puede ser privado)
3. En tu terminal (PowerShell), ejecuta:

```powershell
# Inicializar git (si no lo has hecho)
git init

# Agregar archivos
git add .

# Hacer commit
git commit -m "Configuración inicial de notificaciones push"

# Agregar remote (reemplaza con tu URL)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git

# Subir a GitHub
git push -u origin main
```

### Paso 3: Importar en Vercel
1. Ve a: https://vercel.com/new
2. Click en "Import Git Repository"
3. Selecciona tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Node.js

### Paso 4: Configurar variables de entorno
En la página de configuración del proyecto en Vercel, agrega estas variables:

```
FIREBASE_PROJECT_ID=push-notifications-388cc
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@push-notifications-388cc.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDEZM9w4TiIFYqT...
-----END PRIVATE KEY-----
```

⚠️ **IMPORTANTE**: Copia la private key completa del archivo `firebase-adminsdk.json`

### Paso 5: Deploy
1. Click en "Deploy"
2. Espera 1-2 minutos
3. ¡Tu app estará online!

---

## Opción 2: Drag & Drop (Sin Git)

### Si no quieres usar Git:

1. Ve a: https://vercel.com/new
2. Arrastra la carpeta del proyecto directamente
3. Configura las variables de entorno (ver Paso 4 arriba)
4. Click en "Deploy"

---

## Opción 3: Desde la terminal (requiere Node.js)

Si decides instalar Node.js después:

```powershell
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel

# Seguir las instrucciones en pantalla
```

---

## 📝 Después del despliegue

1. Vercel te dará una URL como: `https://tu-proyecto.vercel.app`
2. Actualiza `public/firebase-config.js`:
   ```javascript
   export const API_URL = 'https://tu-proyecto.vercel.app/api';
   ```
3. Haz commit y push de nuevo (Vercel se redesplegará automáticamente)

---

## 🔒 Seguridad

**NO olvides:**
- Agregar `firebase-adminsdk.json` a `.gitignore` (ya está)
- Usar las variables de entorno en Vercel en lugar del archivo JSON
- Rotar tu clave privada después de subirla a Vercel

---

## ✅ Verificar que funciona

1. Abre tu URL de Vercel
2. Click en "Activar notificaciones"
3. Envía una notificación de prueba
4. ¡Deberías recibirla!

---

## 🆘 Problemas comunes

### Error: "Firebase no inicializado"
- Verifica que agregaste todas las variables de entorno
- La `FIREBASE_PRIVATE_KEY` debe incluir los saltos de línea (`\n`)

### Error: "Module not found"
- Vercel instala automáticamente las dependencias de `package.json`
- Asegúrate de que `package.json` tenga todas las dependencias

### Las notificaciones no llegan
- Verifica que la URL en `firebase-config.js` apunte a tu URL de Vercel
- Revisa los logs en Vercel: https://vercel.com/dashboard
