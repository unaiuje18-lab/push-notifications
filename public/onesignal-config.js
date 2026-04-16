/**
 * Configuración de OneSignal
 * 
 * INSTRUCCIONES:
 * 1. Ve a: https://onesignal.com/
 * 2. Inicia sesión
 * 3. Selecciona tu app
 * 4. Settings → Keys & IDs
 * 5. Copia el "App ID" y pégalo aquí
 */

export const ONESIGNAL_CONFIG = {
    appId: "a46b5099-4acb-4d44-b252-6a8384166c50",
    safari_web_id: "" // Opcional
};

/**
 * Inicializar OneSignal
 */
export async function initializeOneSignal() {
    if (ONESIGNAL_CONFIG.appId === "TU_ONESIGNAL_APP_ID_AQUI") {
        console.warn("⚠️ OneSignal App ID no configurado");
        return false;
    }

    try {
        // Cargar SDK de OneSignal
        await loadOneSignalSDK();

        // Inicializar OneSignal
        window.OneSignal = window.OneSignal || [];
        
        window.OneSignal.push(function() {
            window.OneSignal.init({
                appId: ONESIGNAL_CONFIG.appId,
                safari_web_id: ONESIGNAL_CONFIG.safari_web_id,
                notifyButton: {
                    enable: false // Usaremos nuestro propio botón
                },
                allowLocalhostAsSecureOrigin: true
            });

            // Event listeners
            window.OneSignal.on('subscriptionChange', function(isSubscribed) {
                console.log('OneSignal - Estado de suscripción:', isSubscribed);
            });

            window.OneSignal.on('notificationDisplay', function(event) {
                console.log('OneSignal - Notificación mostrada:', event);
            });
        });

        console.log('✅ OneSignal inicializado correctamente');
        return true;
        
    } catch (error) {
        console.error('❌ Error al inicializar OneSignal:', error);
        return false;
    }
}

/**
 * Cargar SDK de OneSignal
 */
async function loadOneSignalSDK() {
    return new Promise((resolve, reject) => {
        if (window.OneSignal) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

/**
 * Suscribir a OneSignal
 */
export async function subscribeOneSignal() {
    return new Promise((resolve) => {
        if (!window.OneSignal) {
            console.error('OneSignal no está inicializado');
            resolve({ success: false, error: 'OneSignal no inicializado' });
            return;
        }

        window.OneSignal.push(async function() {
            try {
                console.log('Iniciando suscripción a OneSignal...');
                
                // Registrar el prompt
                await window.OneSignal.registerForPushNotifications();
                
                // Esperar a obtener el Player ID
                window.OneSignal.getUserId(function(playerId) {
                    console.log('✅ Suscrito a OneSignal exitosamente!');
                    console.log('Player ID:', playerId);
                    resolve({ success: true, playerId });
                });
                
            } catch (error) {
                console.error('Error al suscribir a OneSignal:', error);
                resolve({ success: false, error: error.message });
            }
        });
    });
}

/**
 * Desuscribir de OneSignal
 */
export async function unsubscribeOneSignal() {
    try {
        if (!window.OneSignal) {
            return false;
        }

        await window.OneSignal.setSubscription(false);
        console.log('✅ Desuscrito de OneSignal');
        return true;
        
    } catch (error) {
        console.error('Error al desuscribir de OneSignal:', error);
        return false;
    }
}

/**
 * Obtener estado de suscripción de OneSignal
 */
export async function getOneSignalStatus() {
    try {
        if (!window.OneSignal) {
            return { subscribed: false, playerId: null };
        }

        const isSubscribed = await window.OneSignal.isPushNotificationsEnabled();
        const playerId = isSubscribed ? await window.OneSignal.getUserId() : null;

        return { subscribed: isSubscribed, playerId };
        
    } catch (error) {
        console.error('Error al obtener estado de OneSignal:', error);
        return { subscribed: false, playerId: null };
    }
}
