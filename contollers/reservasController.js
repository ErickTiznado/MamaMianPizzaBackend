const pool = require('../config/db');

// Function to create a new reservation
exports.createReserva = async (req, res) => {
    try {
        const { id_usuario, tipo_reserva, fecha_hora } = req.body;
        
        // Validate required fields
        const missingFields = [];
        const receivedData = { id_usuario, tipo_reserva, fecha_hora };
        
        if (!id_usuario) missingFields.push('id_usuario');
        if (!tipo_reserva) missingFields.push('tipo_reserva');
        if (!fecha_hora) missingFields.push('fecha_hora');
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Faltan campos requeridos',
                campos_faltantes: missingFields,
                campos_recibidos: Object.keys(receivedData).filter(key => receivedData[key] !== undefined && receivedData[key] !== null && receivedData[key] !== ''),
                datos_recibidos: receivedData,
                ejemplo_correcto: {
                    id_usuario: 1,
                    tipo_reserva: "reserva de mesa",
                    fecha_hora: "2025-06-20 19:30:00"
                }
            });
        }
        
        // Validate tipo_reserva values
        const tiposValidos = ['pedido para recoger', 'reserva de mesa'];
        if (!tiposValidos.includes(tipo_reserva)) {
            return res.status(400).json({
                message: 'Tipo de reserva inválido',
                tipo_recibido: tipo_reserva,
                tipos_validos: tiposValidos
            });
        }
        
        // Validate date format
        const fechaReserva = new Date(fecha_hora);
        if (isNaN(fechaReserva.getTime())) {
            return res.status(400).json({
                message: 'Formato de fecha inválido',
                formato_esperado: 'YYYY-MM-DD HH:MM:SS',
                ejemplo: '2025-06-20 19:30:00'
            });
        }
        
        // Validate that the reservation is not in the past
        if (fechaReserva <= new Date()) {
            return res.status(400).json({
                message: 'La fecha de reserva debe ser futura'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Check if user exists
            const [userExists] = await connection.query(
                'SELECT id_usuario FROM usuarios WHERE id_usuario = ?',
                [id_usuario]
            );
            
            if (userExists.length === 0) {
                return res.status(404).json({
                    message: 'Usuario no encontrado'
                });
            }
            
            // Insert the new reservation
            const [result] = await connection.query(`
                INSERT INTO reservas (id_usuario, tipo_reserva, fecha_hora, estado)
                VALUES (?, ?, ?, 'pendiente')
            `, [id_usuario, tipo_reserva, fecha_hora]);
            
            // Get the created reservation with user info
            const [newReserva] = await connection.query(`
                SELECT 
                    r.*,
                    u.nombre as nombre_usuario,
                    u.correo as correo_usuario
                FROM reservas r
                JOIN usuarios u ON r.id_usuario = u.id_usuario
                WHERE r.id_reserva = ?
            `, [result.insertId]);
            
            res.status(201).json({
                message: 'Reserva creada exitosamente',
                reserva: {
                    id_reserva: newReserva[0].id_reserva,
                    id_usuario: newReserva[0].id_usuario,
                    nombre_usuario: newReserva[0].nombre_usuario,
                    correo_usuario: newReserva[0].correo_usuario,
                    tipo_reserva: newReserva[0].tipo_reserva,
                    fecha_hora: newReserva[0].fecha_hora,
                    estado: newReserva[0].estado
                }
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({
            message: 'Error interno del servidor al crear la reserva',
            error: error.message
        });
    }
};

// Function to get all reservations
exports.getAllReservas = async (req, res) => {
    try {
        const { estado, tipo_reserva } = req.query;
        
        const connection = await pool.promise().getConnection();
        
        try {
            let query = `
                SELECT 
                    r.*,
                    u.nombre as nombre_usuario,
                    u.correo as correo_usuario,
                    u.celular as celular_usuario
                FROM reservas r
                JOIN usuarios u ON r.id_usuario = u.id_usuario
                WHERE 1=1
            `;
            const params = [];
            
            // Apply filters if provided
            if (estado) {
                query += ' AND r.estado = ?';
                params.push(estado);
            }
            
            if (tipo_reserva) {
                query += ' AND r.tipo_reserva = ?';
                params.push(tipo_reserva);
            }
            
            query += ' ORDER BY r.fecha_hora DESC';
            
            const [reservas] = await connection.query(query, params);
            
            // Get summary statistics
            const [stats] = await connection.query(`
                SELECT 
                    COUNT(*) as total_reservas,
                    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
                    COUNT(CASE WHEN estado = 'confirmada' THEN 1 END) as confirmadas,
                    COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as canceladas,
                    COUNT(CASE WHEN tipo_reserva = 'reserva de mesa' THEN 1 END) as mesas,
                    COUNT(CASE WHEN tipo_reserva = 'pedido para recoger' THEN 1 END) as recoger
                FROM reservas
            `);
            
            res.status(200).json({
                message: 'Reservas obtenidas exitosamente',
                estadisticas: {
                    total_reservas: parseInt(stats[0].total_reservas || 0),
                    pendientes: parseInt(stats[0].pendientes || 0),
                    confirmadas: parseInt(stats[0].confirmadas || 0),
                    canceladas: parseInt(stats[0].canceladas || 0),
                    reservas_mesa: parseInt(stats[0].mesas || 0),
                    pedidos_recoger: parseInt(stats[0].recoger || 0)
                },
                filtros_aplicados: {
                    estado: estado || 'todos',
                    tipo_reserva: tipo_reserva || 'todos'
                },
                reservas: reservas
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({
            message: 'Error interno del servidor al obtener las reservas',
            error: error.message
        });
    }
};

// Function to get a specific reservation by ID
exports.getReservaById = async (req, res) => {
    try {
        const { id_reserva } = req.params;
        
        if (!id_reserva) {
            return res.status(400).json({
                message: 'ID de reserva requerido'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            const [reserva] = await connection.query(`
                SELECT 
                    r.*,
                    u.nombre as nombre_usuario,
                    u.correo as correo_usuario,
                    u.celular as celular_usuario
                FROM reservas r
                JOIN usuarios u ON r.id_usuario = u.id_usuario
                WHERE r.id_reserva = ?
            `, [id_reserva]);
            
            if (reserva.length === 0) {
                return res.status(404).json({
                    message: 'Reserva no encontrada'
                });
            }
            
            res.status(200).json({
                message: 'Reserva obtenida exitosamente',
                reserva: reserva[0]
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al obtener reserva:', error);
        res.status(500).json({
            message: 'Error interno del servidor al obtener la reserva',
            error: error.message
        });
    }
};

// Function to update reservation status (activate/deactivate)
exports.updateReservaStatus = async (req, res) => {
    try {
        const { id_reserva } = req.params;
        const { estado } = req.body;
        
        if (!id_reserva) {
            return res.status(400).json({
                message: 'ID de reserva requerido'
            });
        }
        
        if (!estado) {
            return res.status(400).json({
                message: 'Estado requerido',
                estados_validos: ['pendiente', 'confirmada', 'cancelada']
            });
        }
        
        // Validate estado values
        const estadosValidos = ['pendiente', 'confirmada', 'cancelada'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                message: 'Estado inválido',
                estado_recibido: estado,
                estados_validos: estadosValidos
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Check if reservation exists
            const [reservaExists] = await connection.query(
                'SELECT id_reserva, estado FROM reservas WHERE id_reserva = ?',
                [id_reserva]
            );
            
            if (reservaExists.length === 0) {
                return res.status(404).json({
                    message: 'Reserva no encontrada'
                });
            }
            
            const estadoAnterior = reservaExists[0].estado;
            
            // Update reservation status
            const [result] = await connection.query(
                'UPDATE reservas SET estado = ? WHERE id_reserva = ?',
                [estado, id_reserva]
            );
            
            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: 'No se pudo actualizar la reserva'
                });
            }
            
            // Get updated reservation with user info
            const [updatedReserva] = await connection.query(`
                SELECT 
                    r.*,
                    u.nombre as nombre_usuario,
                    u.correo as correo_usuario
                FROM reservas r
                JOIN usuarios u ON r.id_usuario = u.id_usuario
                WHERE r.id_reserva = ?
            `, [id_reserva]);
            
            res.status(200).json({
                message: 'Estado de reserva actualizado exitosamente',
                cambio: {
                    estado_anterior: estadoAnterior,
                    estado_nuevo: estado
                },
                reserva: updatedReserva[0]
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al actualizar estado de reserva:', error);
        res.status(500).json({
            message: 'Error interno del servidor al actualizar el estado de la reserva',
            error: error.message
        });
    }
};

// Function to delete a reservation
exports.deleteReserva = async (req, res) => {
    try {
        const { id_reserva } = req.params;
        
        if (!id_reserva) {
            return res.status(400).json({
                message: 'ID de reserva requerido'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Check if reservation exists and get its info before deletion
            const [reservaExists] = await connection.query(`
                SELECT 
                    r.*,
                    u.nombre as nombre_usuario,
                    u.correo as correo_usuario
                FROM reservas r
                JOIN usuarios u ON r.id_usuario = u.id_usuario
                WHERE r.id_reserva = ?
            `, [id_reserva]);
            
            if (reservaExists.length === 0) {
                return res.status(404).json({
                    message: 'Reserva no encontrada'
                });
            }
            
            const reservaInfo = reservaExists[0];
            
            // Delete the reservation
            const [result] = await connection.query(
                'DELETE FROM reservas WHERE id_reserva = ?',
                [id_reserva]
            );
            
            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: 'No se pudo eliminar la reserva'
                });
            }
            
            res.status(200).json({
                message: 'Reserva eliminada exitosamente',
                reserva_eliminada: {
                    id_reserva: reservaInfo.id_reserva,
                    nombre_usuario: reservaInfo.nombre_usuario,
                    correo_usuario: reservaInfo.correo_usuario,
                    tipo_reserva: reservaInfo.tipo_reserva,
                    fecha_hora: reservaInfo.fecha_hora,
                    estado: reservaInfo.estado
                }
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al eliminar reserva:', error);
        res.status(500).json({
            message: 'Error interno del servidor al eliminar la reserva',
            error: error.message
        });
    }
};

// Function to get reservations by user ID
exports.getReservasByUser = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        
        if (!id_usuario) {
            return res.status(400).json({
                message: 'ID de usuario requerido'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Check if user exists
            const [userExists] = await connection.query(
                'SELECT id_usuario, nombre, correo FROM usuarios WHERE id_usuario = ?',
                [id_usuario]
            );
            
            if (userExists.length === 0) {
                return res.status(404).json({
                    message: 'Usuario no encontrado'
                });
            }
            
            // Get all reservations for the user
            const [reservas] = await connection.query(`
                SELECT 
                    r.*,
                    u.nombre as nombre_usuario,
                    u.correo as correo_usuario
                FROM reservas r
                JOIN usuarios u ON r.id_usuario = u.id_usuario
                WHERE r.id_usuario = ?
                ORDER BY r.fecha_hora DESC
            `, [id_usuario]);
            
            // Get user statistics
            const [stats] = await connection.query(`
                SELECT 
                    COUNT(*) as total_reservas,
                    COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
                    COUNT(CASE WHEN estado = 'confirmada' THEN 1 END) as confirmadas,
                    COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as canceladas
                FROM reservas
                WHERE id_usuario = ?
            `, [id_usuario]);
            
            res.status(200).json({
                message: 'Reservas del usuario obtenidas exitosamente',
                usuario: {
                    id_usuario: parseInt(id_usuario),
                    nombre_usuario: userExists[0].nombre,
                    correo_usuario: userExists[0].correo
                },
                estadisticas: {
                    total_reservas: parseInt(stats[0].total_reservas || 0),
                    pendientes: parseInt(stats[0].pendientes || 0),
                    confirmadas: parseInt(stats[0].confirmadas || 0),
                    canceladas: parseInt(stats[0].canceladas || 0)
                },
                reservas: reservas
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al obtener reservas del usuario:', error);
        res.status(500).json({
            message: 'Error interno del servidor al obtener las reservas del usuario',
            error: error.message
        });
    }
};
