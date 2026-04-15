/**
 * Configuración de Firebase
 * 
 * INSTRUCCIONES PARA OBTENER TUS CREDENCIALES:
 * 
 * 1. Ve a Firebase Console: https://console.firebase.google.com/
 * 2. Selecciona tu proyecto (o crea uno nuevo)
 * 3. Ve a Configuración del proyecto (⚙️ → Project Settings)
 * 4. En "Tus aplicaciones" → Aplicación web → Configuración
 * 5. Copia los valores y reemplázalos aquí
 * 
 * Para obtener el VAPID_KEY:
 * 1. En Firebase Console → Project Settings
 * 2. Pestaña "Cloud Messaging"
 * 3. Sección "Web Push certificates"
 * 4. Si no existe, haz click en "Generar par de claves"
 * 5. Copia la "Clave pública" (Key pair)
 */

export const firebaseConfig = {
    apiKey: "AIzaSyAgsnEwU6aeZXxkyNQVAuDl5ht03coEPgs",
    authDomain: "push-notifications-388cc.firebaseapp.com",
    projectId: "push-notifications-388cc",
    storageBucket: "push-notifications-388cc.firebasestorage.app",
    messagingSenderId: "537762498144",
    appId: "1:537762498144:web:5386267ce2f34fe7a62505",
    measurementId: "G-LF6W42F7YE"
};

export const VAPID_KEY = "BBHRvDBVP05bZ19h7Y2ZeFp9_fDsZohk2eujrFyq_yL4WXUogVI71DxiWO7VM1Mp7ndzxay74P_mLB1PJ2W-S3E";

// URL del servidor backend
export const API_URL = 'https://push-notifications-sooty.vercel.app/api';

// Validar configuración
export function validateFirebaseConfig() {
    const errors = [];
    
    if (firebaseConfig.apiKey === "TU_API_KEY") {
        errors.push("❌ Necesitas configurar tu API Key de Firebase");
    }
    
    if (firebaseConfig.projectId === "tu-proyecto-id") {
        errors.push("❌ Necesitas configurar tu Project ID de Firebase");
    }
    
    if (VAPID_KEY === "TU_VAPID_KEY_PUBLICA_AQUI") {
        errors.push("❌ Necesitas configurar tu VAPID Key de Firebase");
    }
    
    if (errors.length > 0) {
        console.error("⚠️ CONFIGURACIÓN DE FIREBASE INCOMPLETA:");
        errors.forEach(error => console.error(error));
        console.error("\n📖 Lee las instrucciones en firebase-config.js");
        return false;
    }
    
    console.log("✅ Configuración de Firebase validada correctamente");
    return true;
}
