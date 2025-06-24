const pool = require('../config/db');

/**
 * LOGS MANAGEMENT CONTROLLER
 * Manejo completo de logs del sistema MamaMianPizza
 * 
 * Estructura de tabla logs:
 * - id_log (INT, AUTO_INCREMENT, PRIMARY KEY)
 * - id_usuario (INT, NULL) - Referencias usuarios.id_usuario o administradores.id_admin
 * - accion (VARCHAR(50), NOT NULL) - Tipo de acción realizada
 * - tabla_afectada (VARCHAR(50), NOT NULL) - Tabla que fue afectada por la acción
 * - fecha_hora (DATETIME, DEFAULT CURRENT_TIMESTAMP) - Timestamp de la acción
 * - descripcion (TEXT, NULL) - Descripción detallada de la acción
 */

// Función para obtener todos los logs con filtros opcionales
exports.getAllLogs = async (req, res) => {
    try {
        const { 
            limit = 50, 
            page = 1, 
            accion, 
            tabla_afectada, 
            fecha_inicio, 
            fecha_fin,
            id_usuario,
            search 
        } = req.query;

        const connection = await pool.promise().getConnection();

        try {
            // Calcular offset para paginación
            const limitNumber = parseInt(limit);
            const offset = (parseInt(page) - 1) * limitNumber;

            // Construir condiciones WHERE dinámicamente
            let whereConditions = [];
            let queryParams = [];

            if (accion) {
                whereConditions.push('l.accion = ?');
                queryParams.push(accion);
            }

            if (tabla_afectada) {
                whereConditions.push('l.tabla_afectada = ?');
                queryParams.push(tabla_afectada);
            }

            if (fecha_inicio) {
                whereConditions.push('DATE(l.fecha_hora) >= ?');
                queryParams.push(fecha_inicio);
            }

            if (fecha_fin) {
                whereConditions.push('DATE(l.fecha_hora) <= ?');
                queryParams.push(fecha_fin);
            }

            if (id_usuario) {
                whereConditions.push('l.id_usuario = ?');
                queryParams.push(id_usuario);
            }

            if (search) {
                whereConditions.push('(l.descripcion LIKE ? OR l.accion LIKE ? OR l.tabla_afectada LIKE ?)');
                const searchPattern = `%${search}%`;
                queryParams.push(searchPattern, searchPattern, searchPattern);
            }

            const whereClause = whereConditions.length > 0 ? 
                'WHERE ' + whereConditions.join(' AND ') : '';

            // Query principal para obtener logs con información de usuario
            const [logs] = await connection.query(`
                SELECT 
                    l.id_log,
                    l.id_usuario,
                    l.accion,
                    l.tabla_afectada,
                    l.fecha_hora,
                    l.descripcion,
                    COALESCE(u.nombre, a.nombre, 'Sistema') as nombre_usuario,
                    COALESCE(u.correo, a.correo, null) as correo_usuario,
                    CASE 
                        WHEN a.id_admin IS NOT NULL THEN 'administrador'
                        WHEN u.id_usuario IS NOT NULL THEN 'usuario'
                        ELSE 'sistema'
                    END as tipo_usuario,
                    COALESCE(a.rol, 'cliente') as rol_usuario
                FROM logs l
                LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
                LEFT JOIN administradores a ON l.id_usuario = a.id_admin
                ${whereClause}
                ORDER BY l.fecha_hora DESC
                LIMIT ? OFFSET ?
            `, [...queryParams, limitNumber, offset]);

            // Query para contar total de registros (para paginación)
            const [totalCount] = await connection.query(`
                SELECT COUNT(*) as total
                FROM logs l
                LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
                LEFT JOIN administradores a ON l.id_usuario = a.id_admin
                ${whereClause}
            `, queryParams);

            // Estadísticas generales de logs
            const [generalStats] = await connection.query(`
                SELECT 
                    COUNT(*) as total_logs,
                    COUNT(DISTINCT accion) as acciones_unicas,
                    COUNT(DISTINCT tabla_afectada) as tablas_afectadas,
                    COUNT(DISTINCT id_usuario) as usuarios_activos,
                    MIN(fecha_hora) as primer_log,
                    MAX(fecha_hora) as ultimo_log
                FROM logs
                ${whereClause}
            `, queryParams);

            connection.release();

            const totalLogs = totalCount[0].total;
            const totalPages = Math.ceil(totalLogs / limitNumber);

            res.status(200).json({
                message: 'Logs obtenidos exitosamente',
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_logs: totalLogs,
                    logs_per_page: limitNumber,
                    has_next_page: parseInt(page) < totalPages,
                    has_prev_page: parseInt(page) > 1
                },
                filters_applied: {
                    accion: accion || null,
                    tabla_afectada: tabla_afectada || null,
                    fecha_inicio: fecha_inicio || null,
                    fecha_fin: fecha_fin || null,
                    id_usuario: id_usuario || null,
                    search: search || null
                },
                estadisticas: {
                    total_logs_filtrados: totalLogs,
                    total_logs_sistema: parseInt(generalStats[0].total_logs),
                    acciones_unicas: parseInt(generalStats[0].acciones_unicas),
                    tablas_afectadas: parseInt(generalStats[0].tablas_afectadas),
                    usuarios_activos: parseInt(generalStats[0].usuarios_activos),
                    primer_log: generalStats[0].primer_log,
                    ultimo_log: generalStats[0].ultimo_log
                },
                logs: logs.map(log => ({
                    id_log: log.id_log,
                    usuario: {
                        id: log.id_usuario,
                        nombre: log.nombre_usuario,
                        correo: log.correo_usuario,
                        tipo: log.tipo_usuario,
                        rol: log.rol_usuario
                    },
                    accion: log.accion,
                    tabla_afectada: log.tabla_afectada,
                    fecha_hora: log.fecha_hora,
                    descripcion: log.descripcion
                }))
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error al obtener logs:', error);
        res.status(500).json({
            message: 'Error al obtener logs del sistema',
            error: error.message
        });
    }
};

// Función para obtener log específico por ID
exports.getLogById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'ID de log válido es requerido'
            });
        }

        const connection = await pool.promise().getConnection();

        try {
            const [logs] = await connection.query(`
                SELECT 
                    l.id_log,
                    l.id_usuario,
                    l.accion,
                    l.tabla_afectada,
                    l.fecha_hora,
                    l.descripcion,
                    COALESCE(u.nombre, a.nombre, 'Sistema') as nombre_usuario,
                    COALESCE(u.correo, a.correo, null) as correo_usuario,
                    CASE 
                        WHEN a.id_admin IS NOT NULL THEN 'administrador'
                        WHEN u.id_usuario IS NOT NULL THEN 'usuario'
                        ELSE 'sistema'
                    END as tipo_usuario,
                    COALESCE(a.rol, 'cliente') as rol_usuario
                FROM logs l
                LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
                LEFT JOIN administradores a ON l.id_usuario = a.id_admin
                WHERE l.id_log = ?
            `, [id]);

            if (logs.length === 0) {
                return res.status(404).json({
                    message: 'Log no encontrado'
                });
            }

            const log = logs[0];

            res.status(200).json({
                message: 'Log obtenido exitosamente',
                log: {
                    id_log: log.id_log,
                    usuario: {
                        id: log.id_usuario,
                        nombre: log.nombre_usuario,
                        correo: log.correo_usuario,
                        tipo: log.tipo_usuario,
                        rol: log.rol_usuario
                    },
                    accion: log.accion,
                    tabla_afectada: log.tabla_afectada,
                    fecha_hora: log.fecha_hora,
                    descripcion: log.descripcion
                }
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error al obtener log por ID:', error);
        res.status(500).json({
            message: 'Error al obtener log específico',
            error: error.message
        });
    }
};

// Función para crear un nuevo log (normalmente usado internamente por el sistema)
exports.createLog = async (req, res) => {
    try {
        const { id_usuario, accion, tabla_afectada, descripcion } = req.body;

        // Validaciones
        if (!accion || !tabla_afectada) {
            return res.status(400).json({
                message: 'Acción y tabla afectada son requeridos',
                campos_requeridos: ['accion', 'tabla_afectada']
            });
        }

        const connection = await pool.promise().getConnection();

        try {
            // Insertar nuevo log
            const [result] = await connection.query(`
                INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion, fecha_hora)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [id_usuario || null, accion, tabla_afectada, descripcion || null]);

            // Obtener el log creado
            const [newLog] = await connection.query(`
                SELECT 
                    l.id_log,
                    l.id_usuario,
                    l.accion,
                    l.tabla_afectada,
                    l.fecha_hora,
                    l.descripcion,
                    COALESCE(u.nombre, a.nombre, 'Sistema') as nombre_usuario,
                    COALESCE(u.correo, a.correo, null) as correo_usuario,
                    CASE 
                        WHEN a.id_admin IS NOT NULL THEN 'administrador'
                        WHEN u.id_usuario IS NOT NULL THEN 'usuario'
                        ELSE 'sistema'
                    END as tipo_usuario
                FROM logs l
                LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
                LEFT JOIN administradores a ON l.id_usuario = a.id_admin
                WHERE l.id_log = ?
            `, [result.insertId]);

            res.status(201).json({
                message: 'Log creado exitosamente',
                log: {
                    id_log: newLog[0].id_log,
                    usuario: {
                        id: newLog[0].id_usuario,
                        nombre: newLog[0].nombre_usuario,
                        correo: newLog[0].correo_usuario,
                        tipo: newLog[0].tipo_usuario
                    },
                    accion: newLog[0].accion,
                    tabla_afectada: newLog[0].tabla_afectada,
                    fecha_hora: newLog[0].fecha_hora,
                    descripcion: newLog[0].descripcion
                }
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error al crear log:', error);
        res.status(500).json({
            message: 'Error al crear log',
            error: error.message
        });
    }
};

// Función para obtener estadísticas de logs
exports.getLogsStats = async (req, res) => {
    try {
        const { periodo = 'mes' } = req.query;

        const connection = await pool.promise().getConnection();

        try {
            // Configurar filtro de tiempo según el período
            let timeFilter = '';
            let periodName = '';

            switch (periodo) {
                case 'dia':
                    timeFilter = 'WHERE DATE(fecha_hora) = CURDATE()';
                    periodName = 'hoy';
                    break;
                case 'semana':
                    timeFilter = 'WHERE YEARWEEK(fecha_hora, 1) = YEARWEEK(CURDATE(), 1)';
                    periodName = 'esta semana';
                    break;
                case 'mes':
                default:
                    timeFilter = 'WHERE YEAR(fecha_hora) = YEAR(CURDATE()) AND MONTH(fecha_hora) = MONTH(CURDATE())';
                    periodName = 'este mes';
                    break;
                case 'año':
                    timeFilter = 'WHERE YEAR(fecha_hora) = YEAR(CURDATE())';
                    periodName = 'este año';
                    break;
                case 'todo':
                    timeFilter = '';
                    periodName = 'todo el tiempo';
                    break;
            }

            // Estadísticas generales
            const [generalStats] = await connection.query(`
                SELECT 
                    COUNT(*) as total_logs,
                    COUNT(DISTINCT accion) as acciones_diferentes,
                    COUNT(DISTINCT tabla_afectada) as tablas_afectadas,
                    COUNT(DISTINCT id_usuario) as usuarios_activos,
                    COUNT(CASE WHEN id_usuario IS NULL THEN 1 END) as acciones_sistema
                FROM logs
                ${timeFilter}
            `);

            // Top 10 acciones más frecuentes
            const [topAcciones] = await connection.query(`
                SELECT 
                    accion,
                    COUNT(*) as frecuencia,
                    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM logs ${timeFilter})), 2) as porcentaje
                FROM logs
                ${timeFilter}
                GROUP BY accion
                ORDER BY frecuencia DESC
                LIMIT 10
            `);

            // Top 10 tablas más afectadas
            const [topTablas] = await connection.query(`
                SELECT 
                    tabla_afectada,
                    COUNT(*) as frecuencia,
                    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM logs ${timeFilter})), 2) as porcentaje
                FROM logs
                ${timeFilter}
                GROUP BY tabla_afectada
                ORDER BY frecuencia DESC
                LIMIT 10
            `);

            // Actividad por día (últimos 30 días)
            const [actividadDiaria] = await connection.query(`
                SELECT 
                    DATE(fecha_hora) as fecha,
                    COUNT(*) as cantidad_logs,
                    COUNT(DISTINCT accion) as acciones_diferentes,
                    COUNT(DISTINCT id_usuario) as usuarios_activos
                FROM logs
                WHERE fecha_hora >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                GROUP BY DATE(fecha_hora)
                ORDER BY fecha DESC
                LIMIT 30
            `);

            // Usuarios más activos
            const [usuariosActivos] = await connection.query(`
                SELECT 
                    l.id_usuario,
                    COALESCE(u.nombre, a.nombre, 'Sistema') as nombre_usuario,
                    COALESCE(u.correo, a.correo, null) as correo_usuario,
                    CASE 
                        WHEN a.id_admin IS NOT NULL THEN 'administrador'
                        WHEN u.id_usuario IS NOT NULL THEN 'usuario'
                        ELSE 'sistema'
                    END as tipo_usuario,
                    COUNT(*) as total_acciones,
                    COUNT(DISTINCT l.accion) as acciones_diferentes,
                    MAX(l.fecha_hora) as ultima_actividad
                FROM logs l
                LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
                LEFT JOIN administradores a ON l.id_usuario = a.id_admin
                ${timeFilter}
                GROUP BY l.id_usuario, nombre_usuario, correo_usuario, tipo_usuario
                ORDER BY total_acciones DESC
                LIMIT 10
            `);

            connection.release();

            res.status(200).json({
                message: 'Estadísticas de logs obtenidas exitosamente',
                periodo: {
                    filtro: periodo,
                    descripcion: periodName
                },
                estadisticas_generales: {
                    total_logs: parseInt(generalStats[0].total_logs),
                    acciones_diferentes: parseInt(generalStats[0].acciones_diferentes),
                    tablas_afectadas: parseInt(generalStats[0].tablas_afectadas),
                    usuarios_activos: parseInt(generalStats[0].usuarios_activos),
                    acciones_sistema: parseInt(generalStats[0].acciones_sistema)
                },
                top_acciones: topAcciones.map(accion => ({
                    accion: accion.accion,
                    frecuencia: parseInt(accion.frecuencia),
                    porcentaje: parseFloat(accion.porcentaje)
                })),
                top_tablas: topTablas.map(tabla => ({
                    tabla: tabla.tabla_afectada,
                    frecuencia: parseInt(tabla.frecuencia),
                    porcentaje: parseFloat(tabla.porcentaje)
                })),
                actividad_diaria: actividadDiaria.map(dia => ({
                    fecha: dia.fecha,
                    cantidad_logs: parseInt(dia.cantidad_logs),
                    acciones_diferentes: parseInt(dia.acciones_diferentes),
                    usuarios_activos: parseInt(dia.usuarios_activos)
                })),
                usuarios_mas_activos: usuariosActivos.map(usuario => ({
                    id: usuario.id_usuario,
                    nombre: usuario.nombre_usuario,
                    correo: usuario.correo_usuario,
                    tipo: usuario.tipo_usuario,
                    total_acciones: parseInt(usuario.total_acciones),
                    acciones_diferentes: parseInt(usuario.acciones_diferentes),
                    ultima_actividad: usuario.ultima_actividad
                }))
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error al obtener estadísticas de logs:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas de logs',
            error: error.message
        });
    }
};

// Función para obtener logs de un usuario específico
exports.getLogsByUser = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const { limit = 50, page = 1, accion, tabla_afectada } = req.query;

        if (!id_usuario || isNaN(id_usuario)) {
            return res.status(400).json({
                message: 'ID de usuario válido es requerido'
            });
        }

        const connection = await pool.promise().getConnection();

        try {
            // Verificar si el usuario existe
            const [userExists] = await connection.query(`
                SELECT 'usuario' as tipo, nombre, correo FROM usuarios WHERE id_usuario = ?
                UNION
                SELECT 'administrador' as tipo, nombre, correo FROM administradores WHERE id_admin = ?
            `, [id_usuario, id_usuario]);

            if (userExists.length === 0) {
                return res.status(404).json({
                    message: 'Usuario no encontrado'
                });
            }

            const limitNumber = parseInt(limit);
            const offset = (parseInt(page) - 1) * limitNumber;

            // Construir filtros adicionales
            let additionalFilters = '';
            let queryParams = [id_usuario];

            if (accion) {
                additionalFilters += ' AND l.accion = ?';
                queryParams.push(accion);
            }

            if (tabla_afectada) {
                additionalFilters += ' AND l.tabla_afectada = ?';
                queryParams.push(tabla_afectada);
            }

            // Obtener logs del usuario
            const [logs] = await connection.query(`
                SELECT 
                    l.id_log,
                    l.accion,
                    l.tabla_afectada,
                    l.fecha_hora,
                    l.descripcion
                FROM logs l
                WHERE l.id_usuario = ? ${additionalFilters}
                ORDER BY l.fecha_hora DESC
                LIMIT ? OFFSET ?
            `, [...queryParams, limitNumber, offset]);

            // Contar total de logs del usuario
            const [totalCount] = await connection.query(`
                SELECT COUNT(*) as total
                FROM logs l
                WHERE l.id_usuario = ? ${additionalFilters}
            `, queryParams);

            // Estadísticas del usuario
            const [userStats] = await connection.query(`
                SELECT 
                    COUNT(*) as total_acciones,
                    COUNT(DISTINCT accion) as acciones_diferentes,
                    COUNT(DISTINCT tabla_afectada) as tablas_afectadas,
                    MIN(fecha_hora) as primera_accion,
                    MAX(fecha_hora) as ultima_accion
                FROM logs
                WHERE id_usuario = ?
            `, [id_usuario]);

            connection.release();

            const user = userExists[0];
            const totalLogs = totalCount[0].total;
            const totalPages = Math.ceil(totalLogs / limitNumber);

            res.status(200).json({
                message: 'Logs del usuario obtenidos exitosamente',
                usuario: {
                    id: parseInt(id_usuario),
                    nombre: user.nombre,
                    correo: user.correo,
                    tipo: user.tipo
                },
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_logs: totalLogs,
                    logs_per_page: limitNumber
                },
                estadisticas_usuario: {
                    total_acciones: parseInt(userStats[0].total_acciones),
                    acciones_diferentes: parseInt(userStats[0].acciones_diferentes),
                    tablas_afectadas: parseInt(userStats[0].tablas_afectadas),
                    primera_accion: userStats[0].primera_accion,
                    ultima_accion: userStats[0].ultima_accion
                },
                logs: logs.map(log => ({
                    id_log: log.id_log,
                    accion: log.accion,
                    tabla_afectada: log.tabla_afectada,
                    fecha_hora: log.fecha_hora,
                    descripcion: log.descripcion
                }))
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error al obtener logs del usuario:', error);
        res.status(500).json({
            message: 'Error al obtener logs del usuario',
            error: error.message
        });
    }
};

// Función para eliminar logs antiguos (limpieza del sistema)
exports.cleanOldLogs = async (req, res) => {
    try {
        const { dias = 90 } = req.body;

        if (isNaN(dias) || dias < 1) {
            return res.status(400).json({
                message: 'Número de días debe ser un número positivo'
            });
        }

        const connection = await pool.promise().getConnection();

        try {
            // Contar logs que serán eliminados
            const [countToDelete] = await connection.query(`
                SELECT COUNT(*) as total
                FROM logs
                WHERE fecha_hora < DATE_SUB(NOW(), INTERVAL ? DAY)
            `, [dias]);

            // Eliminar logs antiguos
            const [deleteResult] = await connection.query(`
                DELETE FROM logs
                WHERE fecha_hora < DATE_SUB(NOW(), INTERVAL ? DAY)
            `, [dias]);

            connection.release();

            res.status(200).json({
                message: 'Limpieza de logs completada exitosamente',
                configuracion: {
                    dias_retencion: parseInt(dias),
                    fecha_corte: new Date(Date.now() - (dias * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
                },
                resultados: {
                    logs_identificados: parseInt(countToDelete[0].total),
                    logs_eliminados: deleteResult.affectedRows,
                    logs_retenidos: parseInt(countToDelete[0].total) - deleteResult.affectedRows
                }
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error al limpiar logs antiguos:', error);
        res.status(500).json({
            message: 'Error al limpiar logs antiguos',
            error: error.message
        });
    }
};

module.exports = exports;
