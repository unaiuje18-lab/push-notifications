/**
 * Modelo para gestión de suscripciones de notificaciones push
 */

const { runQuery, getOne, getAll } = require('../config/database');
const validator = require('validator');

class Subscription {
    /**
     * Crear o actualizar una suscripción
     */
    static async createOrUpdate(token, userId = null, metadata = {}) {
        try {
            // Validar token
            if (!token || typeof token !== 'string') {
                throw new Error('Token inválido');
            }

            // Sanitizar userId si existe
            const sanitizedUserId = userId ? validator.escape(userId) : null;

            // Verificar si el token ya existe
            const existing = await getOne(
                'SELECT id FROM subscriptions WHERE token = ?',
                [token]
            );

            if (existing) {
                // Actualizar suscripción existente
                await runQuery(`
                    UPDATE subscriptions 
                    SET user_id = ?,
                        user_agent = ?,
                        platform = ?,
                        last_active = CURRENT_TIMESTAMP,
                        is_active = 1
                    WHERE token = ?
                `, [sanitizedUserId, metadata.userAgent, metadata.platform, token]);
                
                return { 
                    id: existing.id, 
                    token, 
                    isNew: false 
                };
            } else {
                // Crear nueva suscripción
                const result = await runQuery(`
                    INSERT INTO subscriptions (token, user_id, user_agent, platform)
                    VALUES (?, ?, ?, ?)
                `, [token, sanitizedUserId, metadata.userAgent, metadata.platform]);
                
                return { 
                    id: result.lastID, 
                    token, 
                    isNew: true 
                };
            }
        } catch (error) {
            console.error('Error al crear/actualizar suscripción:', error);
            throw error;
        }
    }

    /**
     * Obtener una suscripción por token
     */
    static async getByToken(token) {
        try {
            return await getOne(
                'SELECT * FROM subscriptions WHERE token = ? AND is_active = 1',
                [token]
            );
        } catch (error) {
            console.error('Error al obtener suscripción:', error);
            throw error;
        }
    }

    /**
     * Obtener todas las suscripciones activas
     */
    static async getAllActive() {
        try {
            return await getAll(
                'SELECT * FROM subscriptions WHERE is_active = 1 ORDER BY subscribed_at DESC'
            );
        } catch (error) {
            console.error('Error al obtener suscripciones activas:', error);
            throw error;
        }
    }

    /**
     * Obtener todos los tokens activos
     */
    static async getAllActiveTokens() {
        try {
            const rows = await getAll(
                'SELECT token FROM subscriptions WHERE is_active = 1'
            );
            return rows.map(row => row.token);
        } catch (error) {
            console.error('Error al obtener tokens activos:', error);
            throw error;
        }
    }

    /**
     * Obtener suscripciones por usuario
     */
    static async getByUserId(userId) {
        try {
            return await getAll(
                'SELECT * FROM subscriptions WHERE user_id = ? AND is_active = 1',
                [userId]
            );
        } catch (error) {
            console.error('Error al obtener suscripciones por usuario:', error);
            throw error;
        }
    }

    /**
     * Desactivar una suscripción
     */
    static async deactivate(token) {
        try {
            const result = await runQuery(
                'UPDATE subscriptions SET is_active = 0 WHERE token = ?',
                [token]
            );
            return result.changes > 0;
        } catch (error) {
            console.error('Error al desactivar suscripción:', error);
            throw error;
        }
    }

    /**
     * Eliminar una suscripción
     */
    static async delete(token) {
        try {
            const result = await runQuery(
                'DELETE FROM subscriptions WHERE token = ?',
                [token]
            );
            return result.changes > 0;
        } catch (error) {
            console.error('Error al eliminar suscripción:', error);
            throw error;
        }
    }

    /**
     * Eliminar suscripciones inactivas antiguas
     */
    static async deleteInactive(daysOld = 30) {
        try {
            const result = await runQuery(`
                DELETE FROM subscriptions 
                WHERE is_active = 0 
                AND datetime(last_active) < datetime('now', '-' || ? || ' days')
            `, [daysOld]);
            
            return result.changes;
        } catch (error) {
            console.error('Error al eliminar suscripciones inactivas:', error);
            throw error;
        }
    }

    /**
     * Actualizar última actividad
     */
    static async updateLastActive(token) {
        try {
            await runQuery(
                'UPDATE subscriptions SET last_active = CURRENT_TIMESTAMP WHERE token = ?',
                [token]
            );
        } catch (error) {
            console.error('Error al actualizar última actividad:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas
     */
    static async getStats() {
        try {
            const totalActive = await getOne(
                'SELECT COUNT(*) as count FROM subscriptions WHERE is_active = 1'
            );
            
            const totalInactive = await getOne(
                'SELECT COUNT(*) as count FROM subscriptions WHERE is_active = 0'
            );
            
            const totalUsers = await getOne(
                'SELECT COUNT(DISTINCT user_id) as count FROM subscriptions WHERE is_active = 1 AND user_id IS NOT NULL'
            );
            
            const recentSubscriptions = await getOne(`
                SELECT COUNT(*) as count FROM subscriptions 
                WHERE is_active = 1 
                AND datetime(subscribed_at) > datetime('now', '-7 days')
            `);

            return {
                activeSubscriptions: totalActive.count,
                inactiveSubscriptions: totalInactive.count,
                uniqueUsers: totalUsers.count,
                recentSubscriptions: recentSubscriptions.count
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    }
}

module.exports = Subscription;
