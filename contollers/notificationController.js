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
    console.log('📝 Creando nueva notificación...');
    console.log('📋 Body recibido:', JSON.stringify(req.body, null, 2));
    console.log('🔑 Headers:', JSON.stringify(req.headers, null, 2));
    
    try {
        const { titulo, mensaje, tipo } = req.body;
        
        if (!titulo || !mensaje) {
            console.error('❌ Datos faltantes: título y mensaje son obligatorios');
            return res.status(400).json({ message: 'El título y mensaje son obligatorios' });
        }
        
        console.log(`📝 Insertando notificación: "${titulo}" - "${mensaje}" (tipo: ${tipo || 'sin tipo'})`);
        
        pool.query(
            'INSERT INTO notificaciones (titulo, mensaje, tipo) VALUES (?, ?, ?)',
            [titulo, mensaje, tipo || null],
            (err, results) => {
                if (err) {
                    console.error('❌ Error al crear notificación en BD:', err);
                    return res.status(500).json({ error: 'Error al crear notificación', details: err.message });
                }
                
                console.log(`✅ Notificación creada en BD con ID: ${results.insertId}`);
                
                // Obtener la notificación recién creada para enviarla vía SSE
                pool.query(
                    'SELECT * FROM notificaciones WHERE id_notificacion = ?',
                    [results.insertId],
                    (selectErr, selectResults) => {
                        if (!selectErr && selectResults.length > 0) {
                            console.log(`📡 Enviando notificación vía SSE a ${sseClients.size} clientes conectados...`);
                            // Enviar notificación a todos los clientes SSE conectados
                            broadcastNotification(selectResults[0]);
                            console.log(`✅ Notificación SSE enviada exitosamente`);
                        } else {
                            console.error('❌ Error al obtener notificación para SSE:', selectErr);
                        }
                    }
                );
                
                res.status(201).json({
                    message: 'Notificación creada exitosamente',
                    id_notificacion: results.insertId,
                    titulo: titulo,
                    mensaje: mensaje,
                    tipo: tipo || null
                });
            }
        );
    } catch (error) {
        console.error('❌ Error en el servidor al crear notificación:', error);
        res.status(500).json({ message: 'Error en el servidor', details: error.message });
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


// Almacenar las conexiones SSE activas
const sseClients = new Set();

// Función para enviar notificación a todos los clientes SSE conectados
function broadcastNotification(notification) {
    console.log(`📡 Broadcasting notificación a ${sseClients.size} clientes SSE:`, notification);
    
    if (sseClients.size === 0) {
        console.log('⚠️ No hay clientes SSE conectados para recibir la notificación');
        return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    sseClients.forEach(client => {
        try {
            client.write(`data: ${JSON.stringify(notification)}\n\n`);
            successCount++;
        } catch (error) {
            console.error('❌ Error enviando notificación SSE a cliente:', error);
            sseClients.delete(client);
            errorCount++;
        }
    });
    
    console.log(`✅ Notificación SSE enviada: ${successCount} exitosos, ${errorCount} errores`);
}

// Endpoint SSE para notificaciones en tiempo real
exports.getNotificationStream = (req, res) => {
    console.log('🔗 Nueva conexión SSE solicitada');
    
    // Obtener el origin del request
    const origin = req.headers.origin;
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'https://panel.mamamianpizza.com',
        'https://mamamianpizza.com'
    ];
    
    console.log(`🌐 Origin del request: ${origin}`);
    console.log(`✅ Origins permitidos:`, allowedOrigins);
    
    // Configurar headers para SSE
    const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Headers': 'Cache-Control, Authorization',
        'Access-Control-Allow-Credentials': 'true'
    };
    
    // Solo establecer Access-Control-Allow-Origin si el origin está permitido
    if (allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
        console.log(`✅ CORS habilitado para origin: ${origin}`);
    } else {
        console.log(`⚠️ Origin no permitido: ${origin}`);
    }
    
    res.writeHead(200, headers);

    // Enviar un comentario inicial para establecer la conexión
    res.write(': SSE connection established\n\n');
    console.log('✅ Conexión SSE establecida');

    // Agregar cliente a la lista de conexiones activas
    sseClients.add(res);
    console.log(`📊 Clientes SSE conectados: ${sseClients.size}`);

    // Enviar notificaciones no leídas al conectarse
    pool.query("SELECT * FROM notificaciones WHERE estado = 'no leida' ORDER BY fecha_emision DESC", (err, results) => {
        if (!err && results.length > 0) {
            console.log(`📬 Enviando ${results.length} notificaciones no leídas al nuevo cliente`);
            results.forEach(notification => {
                try {
                    res.write(`data: ${JSON.stringify(notification)}\n\n`);
                } catch (error) {
                    console.error('❌ Error enviando notificación inicial:', error);
                }
            });
        } else if (err) {
            console.error('❌ Error obteniendo notificaciones no leídas:', err);
        } else {
            console.log('📬 No hay notificaciones no leídas para enviar');
        }
    });

    // Manejar desconexión del cliente
    req.on('close', () => {
        sseClients.delete(res);
        console.log(`🔌 Cliente SSE desconectado. Clientes restantes: ${sseClients.size}`);
    });

    req.on('error', () => {
        sseClients.delete(res);
        console.log(`❌ Error en conexión SSE. Clientes restantes: ${sseClients.size}`);
    });
};