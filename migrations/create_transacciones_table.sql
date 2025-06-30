-- Crear tabla para almacenar transacciones de pago
CREATE TABLE IF NOT EXISTS `transacciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url_pago` varchar(500) NOT NULL COMMENT 'URL de pago generada por Wompi',
  `monto` decimal(10,2) NOT NULL COMMENT 'Monto de la transacción',
  `email` varchar(100) NOT NULL COMMENT 'Email del cliente',
  `nombre_cliente` varchar(200) NOT NULL COMMENT 'Nombre completo del cliente',
  `telefono` varchar(20) DEFAULT NULL COMMENT 'Teléfono del cliente',
  `direccion` text DEFAULT NULL COMMENT 'Dirección del cliente',
  `descripcion` varchar(255) DEFAULT NULL COMMENT 'Descripción de la transacción',
  `pedido_id` int DEFAULT NULL COMMENT 'ID del pedido asociado (si aplica)',
  `usuario_id` int DEFAULT NULL COMMENT 'ID del usuario (si está registrado)',
  `status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Estado de la transacción',
  `wompi_data` json DEFAULT NULL COMMENT 'Datos completos de respuesta de Wompi',
  `wompi_response` json DEFAULT NULL COMMENT 'Respuesta de confirmación de Wompi',
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_fecha_creacion` (`fecha_creacion`),
  KEY `idx_pedido_id` (`pedido_id`),
  KEY `idx_usuario_id` (`usuario_id`),
  CONSTRAINT `fk_transacciones_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL,
  CONSTRAINT `fk_transacciones_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id_pedido`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tabla para almacenar transacciones de pago con Wompi';

-- Insertar datos de prueba (opcional)
INSERT INTO `transacciones` (`url_pago`, `monto`, `email`, `nombre_cliente`, `telefono`, `direccion`, `descripcion`, `status`, `wompi_data`) VALUES
('https://checkout.wompi.sv/test123', 25.50, 'cliente@example.com', 'Juan Pérez', '50312345678', 'Colonia Escalón, San Salvador', 'Pago de pedido #123', 'completed', '{"transactionId": "test123", "method": "3DS"}'),
('https://checkout.wompi.sv/test124', 18.75, 'maria@example.com', 'María González', '50387654321', 'Santa Tecla, La Libertad', 'Pago de pedido #124', 'pending', '{"transactionId": "test124", "method": "3DS"}');
