-- Crear tabla para almacenar datos temporales del pedido
-- Esto evita actualizar la tabla transacciones con JSON largos

CREATE TABLE IF NOT EXISTS datos_pedido_temporal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    datos_pedido JSON NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    procesado BOOLEAN DEFAULT FALSE,
    
    -- Índices para mejor rendimiento
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_procesado (procesado),
    INDEX idx_fecha_creacion (fecha_creacion),
    
    -- Llave foránea
    FOREIGN KEY (transaction_id) REFERENCES transacciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar comentario
ALTER TABLE datos_pedido_temporal COMMENT = 'Tabla temporal para almacenar datos del pedido antes de la confirmación de pago';
