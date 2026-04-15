/**
 * API Serverless para Vercel
 * Maneja todas las rutas /api/*
 */

const admin = require('firebase-admin');

// Inicializar Firebase Admin (una sola vez)
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            })
        });
        console.log('Firebase inicializado');
    } catch (error) {
        console.error('Error inicializando Firebase:', error);
    }
}

// Almacenamiento en memoria (temporal)
const subscriptions = new Map();

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Extraer la ruta limpia
    let path = req.url || '';
    
    // Remover query params
    if (path.includes('?')) {
        path = path.split('?')[0];
    }
    
    // Normalizar la ruta
    path = path.replace('/api', '').replace(/^\//, '');
    
    console.log('Request:', req.method, path);

    try {
        // Rutas
        if (path === 'subscribe' && req.method === 'POST') {
            return handleSubscribe(req, res);
        }
        
        if (path === 'unsubscribe' && req.method === 'POST') {
            return handleUnsubscribe(req, res);
        }
        
        if (path === 'send-test' && req.method === 'POST') {
            return handleSendTest(req, res);
        }
        
        if (path === 'send-to-all' && req.method === 'POST') {
            return handleSendToAll(req, res);
        }
        
        if (path === 'subscriptions') {
            return handleGetSubscriptions(req, res);
        }
        
        if (path === 'health' || path === '') {
            return res.json({ status: 'OK', timestamp: new Date().toISOString() });
        }

        res.status(404).json({ success: false, error: 'Ruta no encontrada' });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

async function handleSubscribe(req, res) {
    const { token, userId } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, error: 'Token requerido' });
    }

    subscriptions.set(token, {
        userId: userId || 'anonymous',
        createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Suscripción guardada' });
}

async function handleUnsubscribe(req, res) {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, error: 'Token requerido' });
    }

    const deleted = subscriptions.delete(token);
    res.json({
        success: true,
        message: deleted ? 'Suscripción eliminada' : 'Suscripción no encontrada'
    });
}

async function handleSendTest(req, res) {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, error: 'Token requerido' });
    }

    const message = {
        token,
        notification: {
            title: '🧪 Notificación de prueba',
            body: 'Si ves esto, ¡las notificaciones funcionan correctamente!'
        },
        webpush: {
            notification: {
                icon: '/icon.png',
                badge: '/badge.png'
            },
            fcmOptions: {
                link: '/'
            }
        }
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Notificación enviada:', response);
        res.json({ success: true, message: 'Notificación enviada' });
    } catch (error) {
        console.error('Error enviando notificación:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function handleSendToAll(req, res) {
    const { title, body, url } = req.body;

    if (!title || !body) {
        return res.status(400).json({
            success: false,
            error: 'Título y mensaje requeridos'
        });
    }

    const tokens = Array.from(subscriptions.keys());

    if (tokens.length === 0) {
        return res.json({
            success: true,
            message: 'No hay usuarios suscritos',
            count: 0
        });
    }

    const message = {
        notification: {
            title,
            body
        },
        tokens,
        webpush: {
            notification: {
                icon: '/icon.png',
                badge: '/badge.png'
            },
            fcmOptions: {
                link: url || '/'
            }
        }
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        res.json({
            success: true,
            count: response.successCount,
            failed: response.failureCount,
            message: `Notificación enviada a ${response.successCount} usuarios`
        });
    } catch (error) {
        console.error('Error enviando notificaciones:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

async function handleGetSubscriptions(req, res) {
    res.json({
        success: true,
        count: subscriptions.size
    });
}
