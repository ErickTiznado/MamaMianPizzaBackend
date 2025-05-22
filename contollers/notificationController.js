// filepath: contollers/notificationController.js
const pool = require('../config/db');

// Obtener todas las notificaciones
exports.getAllNotifications = (req, res) => {
    pool.query('SELECT * FROM notificaciones ORDER BY fecha_emision DESC', (err, results) => {
        if (err) {
            console.error('Error al obtener notificaciones', err);
            return res.status(500).json({ error: 'Error al obtener notificaciones' });
        }
        res.json(results);
    });
};

// Crear una nueva notificación
exports.createNotification = (req, res) => {
    try {
        const { titulo, mensaje, tipo } = req.body;
        
        if (!titulo || !mensaje) {
            return res.status(400).json({ message: 'El título y mensaje son obligatorios' });
        }
        
        pool.query(
            'INSERT INTO notificaciones (titulo, mensaje, tipo) VALUES (?, ?, ?)',
            [titulo, mensaje, tipo || null],
            (err, results) => {
                if (err) {
                    console.error('Error al crear notificación', err);
                    return res.status(500).json({ error: 'Error al crear notificación' });
                }
                res.status(201).json({
                    message: 'Notificación creada exitosamente',
                    id_notificacion: results.insertId
                });
            }
        );
    } catch (error) {
        console.error('Error en el servidor', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Obtener una notificación específica por ID
exports.getNotificationById = (req, res) => {
    const id = req.params.id;
    
    pool.query('SELECT * FROM notificaciones WHERE id_notificacion = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al obtener notificación', err);
            return res.status(500).json({ error: 'Error al obtener notificación' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }
        
        res.json(results[0]);
    });
};

// Actualizar el estado de la notificación (marcar como leída/no leída)
exports.updateNotificationStatus = (req, res) => {
    try {
        const id = req.params.id;
        const { estado } = req.body;
        
        if (!estado || !['leida', 'no leida'].includes(estado)) {
            return res.status(400).json({ message: 'Estado inválido. Debe ser "leida" o "no leida"' });
        }
        
        pool.query(
            'UPDATE notificaciones SET estado = ? WHERE id_notificacion = ?',
            [estado, id],
            (err, results) => {
                if (err) {
                    console.error('Error al actualizar estado de notificación', err);
                    return res.status(500).json({ error: 'Error al actualizar estado de notificación' });
                }
                
                if (results.affectedRows === 0) {
                    return res.status(404).json({ message: 'Notificación no encontrada' });
                }
                
                res.json({ message: 'Estado de notificación actualizado exitosamente' });
            }
        );
    } catch (error) {
        console.error('Error en el servidor', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Eliminar una notificación
exports.deleteNotification = (req, res) => {
    const id = req.params.id;
    
    pool.query('DELETE FROM notificaciones WHERE id_notificacion = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al eliminar notificación', err);
            return res.status(500).json({ error: 'Error al eliminar notificación' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }
        
        res.json({ message: 'Notificación eliminada exitosamente' });
    });
};

// Obtener notificaciones no leídas
exports.getUnreadNotifications = (req, res) => {
    pool.query("SELECT * FROM notificaciones WHERE estado = 'no leida' ORDER BY fecha_emision DESC", (err, results) => {
        if (err) {
            console.error('Error al obtener notificaciones no leídas', err);
            return res.status(500).json({ error: 'Error al obtener notificaciones no leídas' });
        }
        res.json(results);
    });
};

// Marcar todas las notificaciones como leídas
exports.markAllNotificationsAsRead = (req, res) => {
    pool.query("UPDATE notificaciones SET estado = 'leida' WHERE estado = 'no leida'", (err, results) => {
        if (err) {
            console.error('Error al marcar notificaciones como leídas', err);
            return res.status(500).json({ error: 'Error al marcar notificaciones como leídas' });
        }
        
        res.json({ 
            message: 'Todas las notificaciones marcadas como leídas',
            affectedRows: results.affectedRows
        });
    });
};