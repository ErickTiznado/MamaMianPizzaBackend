// filepath: contollers/notificationController.js
const pool = require('../config/db');

// Almacenar las conexiones SSE activas
const sseClients = new Set();

// Función para enviar notificación a todos los clientes SSE conectados
function broadcastNotification(notification) {
    console.log(`📡 =================== BROADCAST NOTIFICATION ===================`);
    console.log(`📡 Intentando enviar notificación a ${sseClients.size} clientes SSE`);
    console.log(`📋 Notificación:`, {
        id: notification.id_notificacion,
        titulo: notification.titulo,
        mensaje: notification.mensaje,
        tipo: notification.tipo
    });
    
    if (sseClients.size === 0) {
        console.log('⚠️ No hay clientes SSE conectados para recibir la notificación');
        return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    let clientIndex = 0;
    
    sseClients.forEach(client => {
        clientIndex++;
        console.log(`📤 Enviando a cliente ${clientIndex}...`);
        console.log(`   - Cliente writable: ${client.writable}`);
        console.log(`   - Cliente destroyed: ${client.destroyed}`);
        
        try {
            if (client.writable && !client.destroyed) {
                const data = `data: ${JSON.stringify(notification)}\n\n`;
                console.log(`   - Datos a enviar: ${data.substring(0, 100)}...`);
                
                client.write(data);
                console.log(`   - ✅ Enviado exitosamente a cliente ${clientIndex}`);
                successCount++;
                
                // Verificar que el cliente siga siendo válido después del write
                console.log(`   - Cliente después del write - writable: ${client.writable}, destroyed: ${client.destroyed}`);
            } else {
                console.log(`   - ⚠️ Cliente ${clientIndex} no está disponible (writable: ${client.writable}, destroyed: ${client.destroyed})`);
                console.log(`   - 🗑️ Removiendo cliente inválido`);
                sseClients.delete(client);
                errorCount++;
            }
        } catch (error) {
            console.error(`   - ❌ Error enviando a cliente ${clientIndex}:`, error.message);
            console.log(`   - 🗑️ Removiendo cliente con error`);
            sseClients.delete(client);
            errorCount++;
        }
    });
    
    console.log(`📊 Resultado del broadcast:`);
    console.log(`   - ✅ Exitosos: ${successCount}`);
    console.log(`   - ❌ Errores: ${errorCount}`);
    console.log(`   - 👥 Clientes restantes: ${sseClients.size}`);
    console.log(`📡 ================ FIN BROADCAST NOTIFICATION ==================`);
}

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

    // IMPORTANTE: Verificar que res.write funcione
    console.log(`🔧 Response writable: ${res.writable}`);
    console.log(`🔧 Response destroyed: ${res.destroyed}`);

    // Agregar cliente a la lista de conexiones activas
    sseClients.add(res);
    console.log(`📊 Cliente SSE agregado. Total clientes conectados: ${sseClients.size}`);
    
    // Log detallado de clientes conectados
    console.log(`📊 Estado de clientes SSE:`);
    let clientIndex = 0;
    sseClients.forEach(client => {
        console.log(`  Cliente ${++clientIndex}: writable=${client.writable}, destroyed=${client.destroyed}`);
    });

    // Enviar notificaciones no leídas al conectarse
    pool.query("SELECT * FROM notificaciones WHERE estado = 'no leida' ORDER BY fecha_emision DESC", (err, results) => {
        if (!err && results.length > 0) {
            console.log(`📬 Enviando ${results.length} notificaciones no leídas al nuevo cliente`);
            results.forEach((notification, index) => {
                try {
                    const data = `data: ${JSON.stringify(notification)}\n\n`;
                    console.log(`📤 Enviando notificación ${index + 1}/${results.length} al cliente:`, notification.titulo);
                    res.write(data);
                    console.log(`✅ Notificación ${index + 1} enviada exitosamente`);
                } catch (error) {
                    console.error(`❌ Error enviando notificación inicial ${index + 1}:`, error);
                }
            });
        } else if (err) {
            console.error('❌ Error obteniendo notificaciones no leídas:', err);
        } else {
            console.log('📬 No hay notificaciones no leídas para enviar');
            // Enviar un mensaje de test para verificar que la conexión funciona
            try {
                const testMessage = {
                    id_notificacion: 'test',
                    titulo: '🟢 Conexión SSE establecida',
                    mensaje: 'Conexión SSE funcionando correctamente',
                    tipo: 'system',
                    fecha_emision: new Date().toISOString(),
                    estado: 'leida'
                };
                res.write(`data: ${JSON.stringify(testMessage)}\n\n`);
                console.log('📤 Mensaje de test SSE enviado');
            } catch (error) {
                console.error('❌ Error enviando mensaje de test:', error);
            }
        }
    });

    // Manejar desconexión del cliente
    req.on('close', () => {
        console.log(`🔌 Cliente SSE desconectado (evento close)`);
        const removed = sseClients.delete(res);
        console.log(`�️ Cliente removido: ${removed}. Clientes restantes: ${sseClients.size}`);
    });

    req.on('error', (error) => {
        console.log(`❌ Error en conexión SSE:`, error.message);
        const removed = sseClients.delete(res);
        console.log(`🗑️ Cliente removido por error: ${removed}. Clientes restantes: ${sseClients.size}`);
    });
    
    res.on('error', (error) => {
        console.log(`❌ Error en response SSE:`, error.message);
        const removed = sseClients.delete(res);
        console.log(`🗑️ Cliente removido por error en response: ${removed}. Clientes restantes: ${sseClients.size}`);
    });
};

// Exportar funciones para uso interno
module.exports = {
    getAllNotifications: exports.getAllNotifications,
    createNotification: exports.createNotification,
    getNotificationById: exports.getNotificationById,
    updateNotificationStatus: exports.updateNotificationStatus,
    deleteNotification: exports.deleteNotification,
    getUnreadNotifications: exports.getUnreadNotifications,
    markAllNotificationsAsRead: exports.markAllNotificationsAsRead,
    getNotificationStream: exports.getNotificationStream,
    broadcastNotification: broadcastNotification,
    addSSEClient: (client) => sseClients.add(client),
    removeSSEClient: (client) => sseClients.delete(client),
    getSSEClientsCount: () => sseClients.size,
    createNotificationDirect: createNotificationDirect
};

// Función auxiliar para crear notificación directamente sin HTTP
function createNotificationDirect(titulo, mensaje, tipo = null) {
    return new Promise((resolve, reject) => {
        console.log(`📝 Creando notificación directa: "${titulo}" - "${mensaje}" (tipo: ${tipo || 'sin tipo'})`);
        
        pool.query(
            'INSERT INTO notificaciones (titulo, mensaje, tipo) VALUES (?, ?, ?)',
            [titulo, mensaje, tipo],
            (err, results) => {
                if (err) {
                    console.error('❌ Error al crear notificación directa en BD:', err);
                    return reject(err);
                }
                
                console.log(`✅ Notificación directa creada en BD con ID: ${results.insertId}`);
                
                // Obtener la notificación recién creada para enviarla vía SSE
                pool.query(
                    'SELECT * FROM notificaciones WHERE id_notificacion = ?',
                    [results.insertId],
                    (selectErr, selectResults) => {
                        if (!selectErr && selectResults.length > 0) {
                            console.log(`📡 Enviando notificación directa vía SSE a ${sseClients.size} clientes conectados...`);
                            // Enviar notificación a todos los clientes SSE conectados
                            broadcastNotification(selectResults[0]);
                            console.log(`✅ Notificación directa SSE enviada exitosamente`);
                            resolve(selectResults[0]);
                        } else {
                            console.error('❌ Error al obtener notificación directa para SSE:', selectErr);
                            reject(selectErr || new Error('No se pudo obtener la notificación creada'));
                        }
                    }
                );
            }
        );
    });
}