/**
 * Configuración y gestión de la base de datos SQLite
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db = null;

/**
 * Inicializar la base de datos
 */
async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        try {
            // Crear directorio de datos si no existe
            const dbPath = process.env.DB_PATH || './server/data/notifications.db';
            const dbDir = path.dirname(dbPath);
            
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
                console.log(`Directorio de base de datos creado: ${dbDir}`);
            }

            // Conectar a la base de datos
            db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error al conectar con la base de datos:', err);
                    reject(err);
                } else {
                    console.log(`Conectado a la base de datos: ${dbPath}`);
                    createTables().then(resolve).catch(reject);
                }
            });
            
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Crear tablas necesarias
 */
async function createTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Tabla de tokens de suscripción
            db.run(`
                CREATE TABLE IF NOT EXISTS subscriptions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    token TEXT UNIQUE NOT NULL,
                    user_id TEXT,
                    user_agent TEXT,
                    platform TEXT,
                    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
                    is_active INTEGER DEFAULT 1
                )
            `, (err) => {
                if (err) {
                    console.error('Error al crear tabla subscriptions:', err);
                    reject(err);
                }
            });

            // Tabla de historial de notificaciones enviadas
            db.run(`
                CREATE TABLE IF NOT EXISTS notification_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    body TEXT NOT NULL,
                    url TEXT,
                    icon TEXT,
                    recipients_count INTEGER DEFAULT 0,
                    success_count INTEGER DEFAULT 0,
                    failure_count INTEGER DEFAULT 0,
                    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    sent_by TEXT,
                    notification_type TEXT DEFAULT 'manual',
                    metadata TEXT
                )
            `, (err) => {
                if (err) {
                    console.error('Error al crear tabla notification_history:', err);
                    reject(err);
                }
            });

            // Tabla de topics/categorías
            db.run(`
                CREATE TABLE IF NOT EXISTS topics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    topic_name TEXT UNIQUE NOT NULL,
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    is_active INTEGER DEFAULT 1
                )
            `, (err) => {
                if (err) {
                    console.error('Error al crear tabla topics:', err);
                    reject(err);
                }
            });

            // Tabla de suscripciones a topics
            db.run(`
                CREATE TABLE IF NOT EXISTS topic_subscriptions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    subscription_id INTEGER NOT NULL,
                    topic_id INTEGER NOT NULL,
                    subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
                    FOREIGN KEY (topic_id) REFERENCES topics(id),
                    UNIQUE(subscription_id, topic_id)
                )
            `, (err) => {
                if (err) {
                    console.error('Error al crear tabla topic_subscriptions:', err);
                    reject(err);
                } else {
                    console.log('Todas las tablas creadas correctamente');
                    resolve();
                }
            });

            // Crear índices para optimizar consultas
            db.run('CREATE INDEX IF NOT EXISTS idx_subscriptions_token ON subscriptions(token)');
            db.run('CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)');
            db.run('CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(is_active)');
            db.run('CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON notification_history(sent_at)');
        });
    });
}

/**
 * Obtener instancia de la base de datos
 */
function getDatabase() {
    if (!db) {
        throw new Error('La base de datos no está inicializada');
    }
    return db;
}

/**
 * Ejecutar query con promesas
 */
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}

/**
 * Obtener una fila
 */
function getOne(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

/**
 * Obtener todas las filas
 */
function getAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Cerrar conexión a la base de datos
 */
function closeDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Conexión a la base de datos cerrada');
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}

module.exports = {
    initializeDatabase,
    getDatabase,
    runQuery,
    getOne,
    getAll,
    closeDatabase
};
