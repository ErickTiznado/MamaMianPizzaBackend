const pool = require('../config/db');

// Function to create a new review
exports.createResena = async (req, res) => {
    try {
        const { id_usuario, id_producto, comentario, valoracion } = req.body;
          // Validate required fields
        const missingFields = [];
        const receivedData = { id_usuario, id_producto, comentario, valoracion };
        
        if (!id_usuario) missingFields.push('id_usuario');
        if (!id_producto) missingFields.push('id_producto');
        if (!comentario) missingFields.push('comentario');
        if (valoracion === undefined || valoracion === null || valoracion === '') missingFields.push('valoracion');
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Faltan campos requeridos',
                campos_faltantes: missingFields,
                campos_recibidos: Object.keys(receivedData).filter(key => receivedData[key] !== undefined && receivedData[key] !== null && receivedData[key] !== ''),
                datos_recibidos: receivedData,
                ejemplo_correcto: {
                    id_usuario: 1,
                    id_producto: 5,
                    comentario: "Pizza excelente, muy sabrosa!",
                    valoracion: 5
                }
            });
        }
        
        // Validate valoracion range (1-5 stars)
        if (valoracion < 1 || valoracion > 5) {
            return res.status(400).json({
                message: 'La valoración debe estar entre 1 y 5 estrellas'
            });
        }
        
        // Validate data types
        if (!Number.isInteger(parseInt(id_usuario)) || !Number.isInteger(parseInt(id_producto))) {
            return res.status(400).json({
                message: 'id_usuario e id_producto deben ser números enteros'
            });
        }
        
        if (!Number.isInteger(parseInt(valoracion))) {
            return res.status(400).json({
                message: 'La valoración debe ser un número entero'
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
            
            // Check if product exists
            const [productExists] = await connection.query(
                'SELECT id_producto FROM productos WHERE id_producto = ?',
                [id_producto]
            );
            
            if (productExists.length === 0) {
                return res.status(404).json({
                    message: 'Producto no encontrado'
                });
            }
            
            // Check if user has already reviewed this product
            const [existingReview] = await connection.query(
                'SELECT id_resena FROM resenas WHERE id_usuario = ? AND id_producto = ?',
                [id_usuario, id_producto]
            );
            
            if (existingReview.length > 0) {
                return res.status(409).json({
                    message: 'Ya has escrito una reseña para este producto'
                });
            }
            
            // Insert the new review
            const [result] = await connection.query(`
                INSERT INTO resenas (id_usuario, id_producto, comentario, valoracion, fecha_creacion)
                VALUES (?, ?, ?, ?, NOW())
            `, [id_usuario, id_producto, comentario, valoracion]);
            
            // Get the created review with additional info
            const [newReview] = await connection.query(`
                SELECT 
                    r.*,
                    u.nombre as nombre_usuario,
                    p.titulo as nombre_producto
                FROM resenas r
                JOIN usuarios u ON r.id_usuario = u.id_usuario
                JOIN productos p ON r.id_producto = p.id_producto
                WHERE r.id_resena = ?
            `, [result.insertId]);
            
            res.status(201).json({
                message: 'Reseña creada exitosamente',
                resena: {
                    id_resena: newReview[0].id_resena,
                    id_usuario: newReview[0].id_usuario,
                    nombre_usuario: newReview[0].nombre_usuario,
                    id_producto: newReview[0].id_producto,
                    nombre_producto: newReview[0].nombre_producto,
                    comentario: newReview[0].comentario,
                    valoracion: newReview[0].valoracion,
                    fecha_creacion: newReview[0].fecha_creacion
                }
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al crear reseña:', error);
        res.status(500).json({
            message: 'Error interno del servidor al crear la reseña',
            error: error.message
        });
    }
};

// Function to get all reviews for a product
exports.getResenasByProduct = async (req, res) => {
    try {
        const { id_producto } = req.params;
        
        if (!id_producto) {
            return res.status(400).json({
                message: 'ID de producto requerido'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Get all reviews for the product
            const [reviews] = await connection.query(`
                SELECT 
                    r.*,
                    u.nombre as nombre_usuario
                FROM resenas r
                JOIN usuarios u ON r.id_usuario = u.id_usuario
                WHERE r.id_producto = ?
                ORDER BY r.fecha_creacion DESC
            `, [id_producto]);
            
            // Get product info and average rating
            const [productInfo] = await connection.query(`
                SELECT 
                    p.titulo as nombre_producto,
                    COUNT(r.id_resena) as total_resenas,
                    AVG(r.valoracion) as valoracion_promedio
                FROM productos p
                LEFT JOIN resenas r ON p.id_producto = r.id_producto
                WHERE p.id_producto = ?
                GROUP BY p.id_producto, p.titulo
            `, [id_producto]);
            
            if (productInfo.length === 0) {
                return res.status(404).json({
                    message: 'Producto no encontrado'
                });
            }
            
            res.status(200).json({
                message: 'Reseñas obtenidas exitosamente',
                producto: {
                    id_producto: parseInt(id_producto),
                    nombre_producto: productInfo[0].nombre_producto,
                    total_resenas: parseInt(productInfo[0].total_resenas || 0),
                    valoracion_promedio: parseFloat(productInfo[0].valoracion_promedio || 0).toFixed(1)
                },
                resenas: reviews.map(review => ({
                    id_resena: review.id_resena,
                    nombre_usuario: review.nombre_usuario,
                    comentario: review.comentario,
                    valoracion: review.valoracion,
                    fecha_creacion: review.fecha_creacion
                }))
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        res.status(500).json({
            message: 'Error interno del servidor al obtener las reseñas',
            error: error.message
        });
    }
};

// Function to get all reviews by a user
exports.getResenasByUser = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        
        if (!id_usuario) {
            return res.status(400).json({
                message: 'ID de usuario requerido'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Get all reviews by the user
            const [reviews] = await connection.query(`
                SELECT 
                    r.*,
                    p.titulo as nombre_producto
                FROM resenas r
                JOIN productos p ON r.id_producto = p.id_producto
                WHERE r.id_usuario = ?
                ORDER BY r.fecha_creacion DESC
            `, [id_usuario]);
            
            // Get user info
            const [userInfo] = await connection.query(`
                SELECT nombre FROM usuarios WHERE id_usuario = ?
            `, [id_usuario]);
            
            if (userInfo.length === 0) {
                return res.status(404).json({
                    message: 'Usuario no encontrado'
                });
            }
              // Calculate approval statistics
            const resenas_aprobadas = reviews.filter(r => r.aprobada === 1).length;
            const resenas_pendientes = reviews.filter(r => r.aprobada === 0).length;
            
            res.status(200).json({
                message: 'Reseñas del usuario obtenidas exitosamente',
                usuario: {
                    id_usuario: parseInt(id_usuario),
                    nombre_usuario: userInfo[0].nombre,
                    total_resenas: reviews.length,
                    resenas_aprobadas: resenas_aprobadas,
                    resenas_pendientes: resenas_pendientes
                },
                resenas: reviews.map(review => ({
                    id_resena: review.id_resena,
                    id_producto: review.id_producto,
                    nombre_producto: review.nombre_producto,
                    comentario: review.comentario,
                    valoracion: review.valoracion,
                    aprobada: review.aprobada,
                    estado: review.aprobada === 1 ? 'aprobada' : 'pendiente',
                    fecha_creacion: review.fecha_creacion
                }))
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al obtener reseñas del usuario:', error);
        res.status(500).json({
            message: 'Error interno del servidor al obtener las reseñas del usuario',
            error: error.message
        });
    }
};

// Function to get all reviews with user information
exports.getAllResenas = async (req, res) => {
    try {
        const connection = await pool.promise().getConnection();
        
        try {
            // Get all reviews with user and product information
            const [reviews] = await connection.query(`
                SELECT 
                    r.id_resena,
                    r.id_usuario,
                    r.id_producto,
                    r.comentario,
                    r.valoracion,
                    r.fecha_creacion,
                    u.nombre as nombre_usuario,
                    p.titulo as nombre_producto
                FROM resenas r
                JOIN usuarios u ON r.id_usuario = u.id_usuario
                JOIN productos p ON r.id_producto = p.id_producto
                ORDER BY r.fecha_creacion DESC
            `);
            
            // Get summary statistics
            const [stats] = await connection.query(`
                SELECT 
                    COUNT(*) as total_resenas,
                    AVG(valoracion) as valoracion_promedio,
                    COUNT(DISTINCT id_usuario) as usuarios_activos,
                    COUNT(DISTINCT id_producto) as productos_resenados,
                    MIN(fecha_creacion) as primera_resena,
                    MAX(fecha_creacion) as ultima_resena
                FROM resenas
            `);
            
            res.status(200).json({
                message: 'Todas las reseñas obtenidas exitosamente',
                estadisticas: {
                    total_resenas: parseInt(stats[0].total_resenas || 0),
                    valoracion_promedio: parseFloat(stats[0].valoracion_promedio || 0).toFixed(1),
                    usuarios_activos: parseInt(stats[0].usuarios_activos || 0),
                    productos_resenados: parseInt(stats[0].productos_resenados || 0),
                    primera_resena: stats[0].primera_resena,
                    ultima_resena: stats[0].ultima_resena
                },
                resenas: reviews.map(review => ({
                    id_resena: review.id_resena,
                    usuario: {
                        id: review.id_usuario,
                        nombre: review.nombre_usuario,
                        fecha_resena: review.fecha_creacion
                    },
                    producto: {
                        id: review.id_producto,
                        nombre: review.nombre_producto
                    },
                    comentario: review.comentario,
                    valoracion: review.valoracion,
                    fecha_creacion: review.fecha_creacion
                }))
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al obtener todas las reseñas:', error);
        res.status(500).json({
            message: 'Error interno del servidor al obtener las reseñas',
            error: error.message
        });
    }
};

// Function to toggle review approval status (active/inactive)
exports.toggleResenaApproval = async (req, res) => {
    try {
        const { id_resena } = req.params;
        const { aprobada } = req.body;
        
        // Validate required fields
        if (!id_resena) {
            return res.status(400).json({
                message: 'ID de reseña requerido'
            });
        }
        
        if (aprobada === undefined || aprobada === null) {
            return res.status(400).json({
                message: 'Estado de aprobación requerido',
                ejemplo: {
                    aprobada: 1, // 1 para aprobada/activa, 0 para no aprobada/inactiva
                }
            });
        }
        
        // Validate data types
        if (!Number.isInteger(parseInt(id_resena))) {
            return res.status(400).json({
                message: 'id_resena debe ser un número entero'
            });
        }
        
        // Validate approval status (0 or 1)
        const approvalStatus = parseInt(aprobada);
        if (![0, 1].includes(approvalStatus)) {
            return res.status(400).json({
                message: 'El estado de aprobación debe ser 0 (inactiva) o 1 (activa)'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Check if review exists
            const [reviewExists] = await connection.query(
                'SELECT id_resena, aprobada FROM resenas WHERE id_resena = ?',
                [id_resena]
            );
            
            if (reviewExists.length === 0) {
                return res.status(404).json({
                    message: 'Reseña no encontrada'
                });
            }
            
            const currentStatus = reviewExists[0].aprobada;
            
            // Update review approval status
            await connection.query(`
                UPDATE resenas 
                SET aprobada = ? 
                WHERE id_resena = ?
            `, [approvalStatus, id_resena]);
            
            // Get updated review with additional info
            const [updatedReview] = await connection.query(`
                SELECT 
                    r.*,
                    u.nombre as nombre_usuario,
                    p.titulo as nombre_producto
                FROM resenas r
                JOIN usuarios u ON r.id_usuario = u.id_usuario
                JOIN productos p ON r.id_producto = p.id_producto
                WHERE r.id_resena = ?
            `, [id_resena]);
            
            const statusText = approvalStatus === 1 ? 'aprobada/activa' : 'no aprobada/inactiva';
            const actionText = currentStatus !== approvalStatus ? 'actualizado' : 'mantenido';
            
            res.status(200).json({
                message: `Estado de reseña ${actionText} exitosamente`,
                resena: {
                    id_resena: updatedReview[0].id_resena,
                    id_usuario: updatedReview[0].id_usuario,
                    nombre_usuario: updatedReview[0].nombre_usuario,
                    id_producto: updatedReview[0].id_producto,
                    nombre_producto: updatedReview[0].nombre_producto,
                    comentario: updatedReview[0].comentario,
                    valoracion: updatedReview[0].valoracion,
                    aprobada: updatedReview[0].aprobada,
                    estado: statusText,
                    fecha_creacion: updatedReview[0].fecha_creacion
                }
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al cambiar estado de reseña:', error);
        res.status(500).json({
            message: 'Error interno del servidor al cambiar el estado de la reseña',
            error: error.message
        });
    }
};

// Function to delete a review
exports.deleteResena = async (req, res) => {
    try {
        const { id_resena } = req.params;
        
        // Validate required fields
        if (!id_resena) {
            return res.status(400).json({
                message: 'ID de reseña requerido'
            });
        }
        
        // Validate data types
        if (!Number.isInteger(parseInt(id_resena))) {
            return res.status(400).json({
                message: 'id_resena debe ser un número entero'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Check if review exists and get info before deletion
            const [reviewToDelete] = await connection.query(`
                SELECT 
                    r.*,
                    u.nombre as nombre_usuario,
                    p.titulo as nombre_producto
                FROM resenas r
                JOIN usuarios u ON r.id_usuario = u.id_usuario
                JOIN productos p ON r.id_producto = p.id_producto
                WHERE r.id_resena = ?
            `, [id_resena]);
            
            if (reviewToDelete.length === 0) {
                return res.status(404).json({
                    message: 'Reseña no encontrada'
                });
            }
            
            // Delete the review
            const [deleteResult] = await connection.query(
                'DELETE FROM resenas WHERE id_resena = ?',
                [id_resena]
            );
            
            if (deleteResult.affectedRows === 0) {
                return res.status(404).json({
                    message: 'No se pudo eliminar la reseña'
                });
            }
            
            res.status(200).json({
                message: 'Reseña eliminada exitosamente',
                resena_eliminada: {
                    id_resena: reviewToDelete[0].id_resena,
                    nombre_usuario: reviewToDelete[0].nombre_usuario,
                    nombre_producto: reviewToDelete[0].nombre_producto,
                    comentario: reviewToDelete[0].comentario,
                    valoracion: reviewToDelete[0].valoracion,
                    fecha_creacion: reviewToDelete[0].fecha_creacion
                }
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al eliminar reseña:', error);
        res.status(500).json({
            message: 'Error interno del servidor al eliminar la reseña',
            error: error.message
        });
    }
};

// Function to get reviews by approval status
exports.getResenasByApprovalStatus = async (req, res) => {
    try {
        const { aprobada } = req.params;
        
        // Validate approval status
        const approvalStatus = parseInt(aprobada);
        if (![0, 1].includes(approvalStatus)) {
            return res.status(400).json({
                message: 'Estado de aprobación inválido. Debe ser 0 (no aprobadas) o 1 (aprobadas)'
            });
        }
        
        const connection = await pool.promise().getConnection();
        
        try {
            // Get reviews by approval status
            const [reviews] = await connection.query(`
                SELECT 
                    r.*,
                    u.nombre as nombre_usuario,
                    p.titulo as nombre_producto
                FROM resenas r
                JOIN usuarios u ON r.id_usuario = u.id_usuario
                JOIN productos p ON r.id_producto = p.id_producto
                WHERE r.aprobada = ?
                ORDER BY r.fecha_creacion DESC
            `, [approvalStatus]);
            
            const statusText = approvalStatus === 1 ? 'aprobadas' : 'no aprobadas';
            
            res.status(200).json({
                message: `Reseñas ${statusText} obtenidas exitosamente`,
                estado_filtro: {
                    codigo: approvalStatus,
                    descripcion: statusText
                },
                total_resenas: reviews.length,
                resenas: reviews.map(review => ({
                    id_resena: review.id_resena,
                    usuario: {
                        id: review.id_usuario,
                        nombre: review.nombre_usuario
                    },
                    producto: {
                        id: review.id_producto,
                        nombre: review.nombre_producto
                    },
                    comentario: review.comentario,
                    valoracion: review.valoracion,
                    aprobada: review.aprobada,
                    estado: statusText,
                    fecha_creacion: review.fecha_creacion
                }))
            });
            
        } finally {
            connection.release();
        }
        
    } catch (error) {
        console.error('Error al obtener reseñas por estado:', error);
        res.status(500).json({
            message: 'Error interno del servidor al obtener las reseñas por estado',
            error: error.message
        });
    }
};
