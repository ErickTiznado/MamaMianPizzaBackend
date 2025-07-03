const pool = require('../config/db');

// Function to create a new experience comment
exports.createExperiencia = async (req, res) => {
    try {
        console.log('📝 Datos recibidos en createExperiencia:', req.body);
        const { titulo, valoracion, id_usuario, contenido } = req.body;
        
        // Validate required fields
        const missingFields = [];
        const receivedData = { titulo, valoracion, id_usuario, contenido };
        
        console.log('🔍 Datos extraídos:', receivedData);
        
        if (!titulo) missingFields.push('titulo');
        if (!valoracion) missingFields.push('valoracion');
        if (!id_usuario) missingFields.push('id_usuario');
        if (!contenido) missingFields.push('contenido');
        
        if (missingFields.length > 0) {
            console.log('❌ Campos faltantes:', missingFields);
            return res.status(400).json({
                message: 'Faltan campos requeridos',
                campos_faltantes: missingFields,
                campos_recibidos: Object.keys(receivedData).filter(key => receivedData[key] !== undefined && receivedData[key] !== null && receivedData[key] !== ''),
                datos_recibidos: receivedData,
                ejemplo_correcto: {
                    titulo: "Excelente experiencia",
                    valoracion: 5,
                    id_usuario: 1,
                    contenido: "La pizza estaba deliciosa y el servicio fue excelente..."
                }
            });
        }
        
        // Validate valoracion range (1-5 stars)
        if (valoracion < 1 || valoracion > 5) {
            console.log('❌ Valoración fuera de rango:', valoracion);
            return res.status(400).json({
                message: 'La valoración debe estar entre 1 y 5 estrellas'
            });
        }
        
        // Validate data types
        if (!Number.isInteger(parseInt(id_usuario))) {
            console.log('❌ id_usuario no es entero:', id_usuario);
            return res.status(400).json({
                message: 'id_usuario debe ser un número entero'
            });
        }
        
        if (!Number.isInteger(parseInt(valoracion))) {
            console.log('❌ valoracion no es entero:', valoracion);
            return res.status(400).json({
                message: 'La valoración debe ser un número entero'
            });
        }
        
        console.log('✅ Validaciones pasadas, conectando a BD...');
        const connection = await pool.promise().getConnection();
        
        try {
            console.log('🔍 Verificando si usuario existe:', id_usuario);
            // Check if user exists
            const [userExists] = await connection.query(
                'SELECT id_usuario FROM usuarios WHERE id_usuario = ?',
                [id_usuario]
            );
            
            if (userExists.length === 0) {
                console.log('❌ Usuario no encontrado:', id_usuario);
                return res.status(404).json({
                    message: 'Usuario no encontrado'
                });
            }
            
            console.log('✅ Usuario encontrado, insertando experiencia...');
            console.log('📝 Datos a insertar:', { titulo, valoracion, id_usuario, contenido });
            
            // Insert the new experience
            const [result] = await connection.query(`
                INSERT INTO experiencia (titulo, valoracion, id_usuario, contenido)
                VALUES (?, ?, ?, ?)
            `, [titulo, valoracion, id_usuario, contenido]);
            
            console.log('✅ Experiencia insertada con ID:', result.insertId);
              // Get the created experience with user info
            const [newExperience] = await connection.query(`
                SELECT 
                    e.*,
                    u.nombre as nombre_usuario
                FROM experiencia e
                JOIN usuarios u ON e.id_usuario = u.id_usuario
                WHERE e.id_experiencia = ?
            `, [result.insertId]);
            
            console.log('✅ Experiencia creada y recuperada:', newExperience[0]);
            
            res.status(201).json({
                message: 'Experiencia creada exitosamente',
                experiencia: {
                    id_experiencia: newExperience[0].id_experiencia,
                    titulo: newExperience[0].titulo,
                    valoracion: newExperience[0].valoracion,
                    contenido: newExperience[0].contenido,
                    aprobado: newExperience[0].aprobado,
                    estado: newExperience[0].aprobado === 1 ? 'aprobada' : 'pendiente',                    usuario: {
                        id: newExperience[0].id_usuario,
                        nombre: newExperience[0].nombre_usuario,
                        ruta_foto: newExperience[0].ruta_foto
                    }
                }
            });
              } finally {
            connection.release();
            console.log('🔌 Conexión a BD liberada');
        }
        
    } catch (error) {
        console.error('❌ Error al crear experiencia:', error);
        console.error('📝 Stack trace:', error.stack);
        res.status(500).json({
            message: 'Error interno del servidor al crear la experiencia',
            error: error.message,
            details: error.stack
        });
    }
};

// Function to get a single experience by ID
exports.getExperienciaById = async (req, res) => {
    try {
        const { id_experiencia } = req.params;
        
        // Validate required parameter
        if (!id_experiencia) {
            return res.status(400).json({
                message: 'ID de experiencia requerido'
            });
        }
        
        // Validate data type
        if (!Number.isInteger(parseInt(id_experiencia))) {
            return res.status(400).json({
                message: 'id_experiencia debe ser un número entero'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Get the experience with user info
            const [experience] = await connection.query(`
                SELECT 
                    e.*,
                    u.nombre as nombre_usuario,
                    u.foto_perfil as foto_perfil_usuario
                FROM experiencia e
                JOIN usuarios u ON e.id_usuario = u.id_usuario
                WHERE e.id_experiencia = ?
            `, [id_experiencia]);
            
            if (experience.length === 0) {
                return res.status(404).json({
                    message: `No se encontró una experiencia con el ID ${id_experiencia}`
                });
            }
            
            res.status(200).json({
                message: 'Experiencia obtenida exitosamente',
                experiencia: {
                    id_experiencia: experience[0].id_experiencia,
                    titulo: experience[0].titulo,
                    valoracion: experience[0].valoracion,
                    contenido: experience[0].contenido,
                    aprobado: experience[0].aprobado,
                    estado: experience[0].aprobado === 1 ? 'aprobada' : 'pendiente',
                    usuario: {
                        id: experience[0].id_usuario,
                        nombre: experience[0].nombre_usuario,
                        foto_perfil: experience[0].foto_perfil_usuario
                    }
                }
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al obtener experiencia por ID:', error);
        res.status(500).json({
            message: 'Error interno del servidor al obtener la experiencia',
            error: error.message
        });
    }
};

// Function to get all experiences
exports.getAllExperiencias = async (req, res) => {
    try {
        const connection = await pool.promise().getConnection();
        
        try {
            // Get all experiences with user information
            const [experiences] = await connection.query(`
                SELECT 
                    e.id_experiencia,
                    e.titulo,
                    e.valoracion,
                    e.contenido,
                    e.aprobado,
                    e.id_usuario,
                    u.nombre as nombre_usuario,
                    u.foto_perfil as foto_perfil_usuario
                FROM experiencia e
                JOIN usuarios u ON e.id_usuario = u.id_usuario
                ORDER BY e.id_experiencia DESC
            `);
            
            // Get summary statistics
            const [stats] = await connection.query(`
                SELECT 
                    COUNT(*) as total_experiencias,
                    AVG(valoracion) as valoracion_promedio,
                    COUNT(DISTINCT id_usuario) as usuarios_activos,
                    SUM(CASE WHEN aprobado = 1 THEN 1 ELSE 0 END) as experiencias_aprobadas,
                    SUM(CASE WHEN aprobado = 0 THEN 1 ELSE 0 END) as experiencias_pendientes
                FROM experiencia
            `);
            
            res.status(200).json({
                message: 'Todas las experiencias obtenidas exitosamente',
                estadisticas: {
                    total_experiencias: parseInt(stats[0].total_experiencias || 0),
                    valoracion_promedio: parseFloat(stats[0].valoracion_promedio || 0).toFixed(1),
                    usuarios_activos: parseInt(stats[0].usuarios_activos || 0),
                    experiencias_aprobadas: parseInt(stats[0].experiencias_aprobadas || 0),
                    experiencias_pendientes: parseInt(stats[0].experiencias_pendientes || 0)
                },
                experiencias: experiences.map(exp => ({
                    id_experiencia: exp.id_experiencia,
                    titulo: exp.titulo,
                    valoracion: exp.valoracion,
                    contenido: exp.contenido,
                    aprobado: exp.aprobado,
                    estado: exp.aprobado === 1 ? 'aprobada' : 'pendiente',
                    usuario: {
                        id: exp.id_usuario,
                        nombre: exp.nombre_usuario,
                        foto_perfil: exp.foto_perfil_usuario
                    }
                }))
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al obtener todas las experiencias:', error);
        res.status(500).json({
            message: 'Error interno del servidor al obtener las experiencias',
            error: error.message
        });
    }
};

// Function to get experiences by user
exports.getExperienciasByUser = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        
        if (!id_usuario) {
            return res.status(400).json({
                message: 'ID de usuario requerido'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Get all experiences by the user
            const [experiences] = await connection.query(`
                SELECT e.*
                FROM experiencia e
                WHERE e.id_usuario = ?
                ORDER BY e.id_experiencia DESC
            `, [id_usuario]);
            
            // Get user info
            const [userInfo] = await connection.query(`
                SELECT nombre, foto_perfil FROM usuarios WHERE id_usuario = ?
            `, [id_usuario]);
            
            if (userInfo.length === 0) {
                return res.status(404).json({
                    message: 'Usuario no encontrado'
                });
            }
            
            // Calculate approval statistics
            const experiencias_aprobadas = experiences.filter(e => e.aprobado === 1).length;
            const experiencias_pendientes = experiences.filter(e => e.aprobado === 0).length;
            
            res.status(200).json({
                message: 'Experiencias del usuario obtenidas exitosamente',
                usuario: {
                    id_usuario: parseInt(id_usuario),
                    nombre_usuario: userInfo[0].nombre,
                    foto_perfil: userInfo[0].foto_perfil,
                    total_experiencias: experiences.length,
                    experiencias_aprobadas: experiencias_aprobadas,
                    experiencias_pendientes: experiencias_pendientes
                },
                experiencias: experiences.map(exp => ({
                    id_experiencia: exp.id_experiencia,
                    titulo: exp.titulo,
                    valoracion: exp.valoracion,
                    contenido: exp.contenido,
                    aprobado: exp.aprobado,
                    estado: exp.aprobado === 1 ? 'aprobada' : 'pendiente'
                }))
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al obtener experiencias del usuario:', error);
        res.status(500).json({
            message: 'Error interno del servidor al obtener las experiencias del usuario',
            error: error.message
        });
    }
};

// Function to get experiences by approval status
exports.getExperienciasByApprovalStatus = async (req, res) => {
    try {
        const { aprobado } = req.params;
        
        // Validate approval status
        const approvalStatus = parseInt(aprobado);
        if (![0, 1].includes(approvalStatus)) {
            return res.status(400).json({
                message: 'Estado de aprobación inválido. Debe ser 0 (no aprobadas) o 1 (aprobadas)'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Get experiences by approval status
            const [experiences] = await connection.query(`
                SELECT 
                    e.*,
                    u.nombre as nombre_usuario,
                    u.foto_perfil as foto_perfil_usuario
                FROM experiencia e
                JOIN usuarios u ON e.id_usuario = u.id_usuario
                WHERE e.aprobado = ?
                ORDER BY e.id_experiencia DESC
            `, [approvalStatus]);
            
            const statusText = approvalStatus === 1 ? 'aprobadas' : 'no aprobadas';
            
            res.status(200).json({
                message: `Experiencias ${statusText} obtenidas exitosamente`,
                estado_filtro: {
                    codigo: approvalStatus,
                    descripcion: statusText
                },
                total_experiencias: experiences.length,
                experiencias: experiences.map(exp => ({
                    id_experiencia: exp.id_experiencia,
                    titulo: exp.titulo,
                    valoracion: exp.valoracion,
                    contenido: exp.contenido,
                    aprobado: exp.aprobado,
                    estado: statusText,
                    usuario: {
                        id: exp.id_usuario,
                        nombre: exp.nombre_usuario,
                        foto_perfil: exp.foto_perfil_usuario
                    }
                }))
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al obtener experiencias por estado:', error);
        res.status(500).json({
            message: 'Error interno del servidor al obtener las experiencias por estado',
            error: error.message
        });
    }
};

// Function to update an experience
exports.updateExperiencia = async (req, res) => {
    try {
        const { id_experiencia } = req.params;
        const { titulo, valoracion, contenido } = req.body;
        
        // Validate required fields
        if (!id_experiencia) {
            return res.status(400).json({
                message: 'ID de experiencia requerido'
            });
        }
        
        // Validate data types
        if (!Number.isInteger(parseInt(id_experiencia))) {
            return res.status(400).json({
                message: 'id_experiencia debe ser un número entero'
            });
        }
        
        // Validate valoracion if provided
        if (valoracion && (valoracion < 1 || valoracion > 5)) {
            return res.status(400).json({
                message: 'La valoración debe estar entre 1 y 5 estrellas'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Check if experience exists
            const [experienceExists] = await connection.query(
                'SELECT id_experiencia FROM experiencia WHERE id_experiencia = ?',
                [id_experiencia]
            );
            
            if (experienceExists.length === 0) {
                return res.status(404).json({
                    message: 'Experiencia no encontrada'
                });
            }
            
            // Build update query dynamically
            const updateFields = [];
            const updateValues = [];
            
            if (titulo) {
                updateFields.push('titulo = ?');
                updateValues.push(titulo);
            }
            if (valoracion) {
                updateFields.push('valoracion = ?');
                updateValues.push(valoracion);
            }
            if (contenido) {
                updateFields.push('contenido = ?');
                updateValues.push(contenido);
            }
            
            if (updateFields.length === 0) {
                return res.status(400).json({
                    message: 'No se proporcionaron campos para actualizar'
                });
            }
            
            updateValues.push(id_experiencia);
            
            // Update experience
            await connection.query(`
                UPDATE experiencia 
                SET ${updateFields.join(', ')} 
                WHERE id_experiencia = ?
            `, updateValues);
            
            // Get updated experience with user info
            const [updatedExperience] = await connection.query(`
                SELECT 
                    e.*,
                    u.nombre as nombre_usuario,
                    u.foto_perfil as foto_perfil_usuario
                FROM experiencia e
                JOIN usuarios u ON e.id_usuario = u.id_usuario
                WHERE e.id_experiencia = ?
            `, [id_experiencia]);
            
            res.status(200).json({
                message: 'Experiencia actualizada exitosamente',
                experiencia: {
                    id_experiencia: updatedExperience[0].id_experiencia,
                    titulo: updatedExperience[0].titulo,
                    valoracion: updatedExperience[0].valoracion,
                    contenido: updatedExperience[0].contenido,
                    aprobado: updatedExperience[0].aprobado,
                    estado: updatedExperience[0].aprobado === 1 ? 'aprobada' : 'pendiente',
                    usuario: {
                        id: updatedExperience[0].id_usuario,
                        nombre: updatedExperience[0].nombre_usuario,
                        foto_perfil: updatedExperience[0].foto_perfil_usuario
                    }
                }
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al actualizar experiencia:', error);
        res.status(500).json({
            message: 'Error interno del servidor al actualizar la experiencia',
            error: error.message
        });
    }
};

// Function to toggle experience approval status
exports.toggleExperienciaApproval = async (req, res) => {
    try {
        const { id_experiencia } = req.params;
        const { aprobado } = req.body;
        
        // Validate required fields
        if (!id_experiencia) {
            return res.status(400).json({
                message: 'ID de experiencia requerido'
            });
        }
        
        if (aprobado === undefined || aprobado === null) {
            return res.status(400).json({
                message: 'Estado de aprobación requerido',
                ejemplo: {
                    aprobado: 1, // 1 para aprobada/visible, 0 para no aprobada/no visible
                }
            });
        }
        
        // Validate data types
        if (!Number.isInteger(parseInt(id_experiencia))) {
            return res.status(400).json({
                message: 'id_experiencia debe ser un número entero'
            });
        }
        
        // Validate approval status (0 or 1)
        const approvalStatus = parseInt(aprobado);
        if (![0, 1].includes(approvalStatus)) {
            return res.status(400).json({
                message: 'El estado de aprobación debe ser 0 (no visible) o 1 (visible)'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Check if experience exists
            const [experienceExists] = await connection.query(
                'SELECT id_experiencia, aprobado FROM experiencia WHERE id_experiencia = ?',
                [id_experiencia]
            );
            
            if (experienceExists.length === 0) {
                return res.status(404).json({
                    message: 'Experiencia no encontrada'
                });
            }
            
            const currentStatus = experienceExists[0].aprobado;
            
            // Update experience approval status
            await connection.query(`
                UPDATE experiencia 
                SET aprobado = ? 
                WHERE id_experiencia = ?
            `, [approvalStatus, id_experiencia]);
            
            // Get updated experience with user info
            const [updatedExperience] = await connection.query(`
                SELECT 
                    e.*,
                    u.nombre as nombre_usuario,
                    u.foto_perfil as foto_perfil_usuario
                FROM experiencia e
                JOIN usuarios u ON e.id_usuario = u.id_usuario
                WHERE e.id_experiencia = ?
            `, [id_experiencia]);
            
            const statusText = approvalStatus === 1 ? 'aprobada/visible' : 'no aprobada/no visible';
            const actionText = currentStatus !== approvalStatus ? 'actualizado' : 'mantenido';
            
            res.status(200).json({
                message: `Estado de experiencia ${actionText} exitosamente`,
                experiencia: {
                    id_experiencia: updatedExperience[0].id_experiencia,
                    titulo: updatedExperience[0].titulo,
                    valoracion: updatedExperience[0].valoracion,
                    contenido: updatedExperience[0].contenido,
                    aprobado: updatedExperience[0].aprobado,
                    estado: statusText,
                    usuario: {
                        id: updatedExperience[0].id_usuario,
                        nombre: updatedExperience[0].nombre_usuario,
                        foto_perfil: updatedExperience[0].foto_perfil_usuario
                    }
                }
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al cambiar estado de experiencia:', error);
        res.status(500).json({
            message: 'Error interno del servidor al cambiar el estado de la experiencia',
            error: error.message
        });
    }
};

// Function to delete an experience
exports.deleteExperiencia = async (req, res) => {
    try {
        const { id_experiencia } = req.params;
        
        // Validate required fields
        if (!id_experiencia) {
            return res.status(400).json({
                message: 'ID de experiencia requerido'
            });
        }
        
        // Validate data types
        if (!Number.isInteger(parseInt(id_experiencia))) {
            return res.status(400).json({
                message: 'id_experiencia debe ser un número entero'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Check if experience exists and get info before deletion
            const [experienceToDelete] = await connection.query(`
                SELECT 
                    e.*,
                    u.nombre as nombre_usuario
                FROM experiencia e
                JOIN usuarios u ON e.id_usuario = u.id_usuario
                WHERE e.id_experiencia = ?
            `, [id_experiencia]);
            
            if (experienceToDelete.length === 0) {
                return res.status(404).json({
                    message: 'Experiencia no encontrada'
                });
            }
            
            // Delete the experience
            const [deleteResult] = await connection.query(
                'DELETE FROM experiencia WHERE id_experiencia = ?',
                [id_experiencia]
            );
            
            if (deleteResult.affectedRows === 0) {
                return res.status(404).json({
                    message: 'No se pudo eliminar la experiencia'
                });
            }
            
            res.status(200).json({
                message: 'Experiencia eliminada exitosamente',
                experiencia_eliminada: {
                    id_experiencia: experienceToDelete[0].id_experiencia,
                    titulo: experienceToDelete[0].titulo,
                    valoracion: experienceToDelete[0].valoracion,
                    contenido: experienceToDelete[0].contenido,
                    nombre_usuario: experienceToDelete[0].nombre_usuario
                }
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al eliminar experiencia:', error);
        res.status(500).json({
            message: 'Error interno del servidor al eliminar la experiencia',
            error: error.message
        });
    }
};
