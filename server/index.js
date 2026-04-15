/**
 * Servidor principal para el sistema de notificaciones push
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Importar configuraciones y utilidades
const { initializeFirebase } = require('./config/firebase');
const { initializeDatabase } = require('./config/database');
const notificationRoutes = require('./routes/notifications');
const { startScheduledJobs } = require('./jobs/scheduler');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Middleware de seguridad
 */
app.use(helmet({
    contentSecurityPolicy: false, // Desactivar CSP para desarrollo
}));

/**
 * CORS - Configuración
 */
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

/**
 * Rate limiting - Protección contra abuso
 */
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minuto
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // máximo 100 requests por ventana
    message: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

/**
 * Body parsers
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Servir archivos estáticos
 */
app.use(express.static(path.join(__dirname, '../public')));

/**
 * Logging middleware
 */
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * API Routes
 */
app.use('/api', notificationRoutes);

/**
 * Ruta principal - Servir el frontend
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

/**
 * Manejo de rutas no encontradas
 */
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
});

/**
 * Manejo de errores global
 */
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

/**
 * Inicialización del servidor
 */
async function startServer() {
    try {
        console.log('🚀 Iniciando servidor...');
        
        // Inicializar Firebase Admin SDK
        console.log('📱 Inicializando Firebase...');
        await initializeFirebase();
        console.log('✅ Firebase inicializado correctamente');
        
        // Inicializar base de datos
        console.log('💾 Inicializando base de datos...');
        await initializeDatabase();
        console.log('✅ Base de datos inicializada correctamente');
        
        // Iniciar trabajos programados
        console.log('⏰ Iniciando trabajos programados...');
        startScheduledJobs();
        console.log('✅ Trabajos programados iniciados');
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('');
            console.log('='.repeat(50));
            console.log(`✨ Servidor corriendo en http://localhost:${PORT}`);
            console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📡 API disponible en http://localhost:${PORT}/api`);
            console.log('='.repeat(50));
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

/**
 * Manejo de cierre graceful
 */
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT recibido, cerrando servidor...');
    process.exit(0);
});

// Iniciar servidor
startServer();

module.exports = app;
