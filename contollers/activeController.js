const pool = require('../config/db');

// Toggle estado activo/inactivo de un producto
exports.toggleProductStatus = async (req, res) => {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (!id || isNaN(id)) {
        return res.status(400).json({
            message: 'ID de producto no válido'
        });
    }

    let connection;
    try {
        connection = await pool.promise().getConnection();

        // Obtener el estado actual
        const [rows] = await connection.query(
            'SELECT activo FROM productos WHERE id_producto = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Producto no encontrado'
            });
        }

        const currentStatus = rows[0].activo;
        const newStatus = currentStatus === 1 ? 0 : 1;

        // Actualizar el estado
        await connection.query(
            'UPDATE productos SET activo = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id_producto = ?',
            [newStatus, id]
        );

        // Opcional: registrar en logs
        const descripcionLog = `Producto ID ${id} cambiado a ${newStatus === 1 ? 'activo' : 'inactivo'}`;
        await connection.query(
            'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
            [null, 'UPDATE', 'productos', descripcionLog]
        );

        res.status(200).json({
            message: `Producto ${newStatus === 1 ? 'activado' : 'desactivado'} exitosamente`,
            id_producto: parseInt(id, 10),
            activo: Boolean(newStatus)
        });
    } catch (error) {
        console.error('Error al togglear estado de producto:', error);
        res.status(500).json({
            message: 'Error interno al actualizar estado de producto',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};
