-- Agregar columna transaction_id a la tabla pedidos para vincular con transacciones de pago
ALTER TABLE `pedidos` 
ADD COLUMN `transaction_id` int DEFAULT NULL COMMENT 'ID de la transacción de pago asociada' AFTER `id_pedido`;

-- Agregar índice para mejorar las consultas
ALTER TABLE `pedidos` 
ADD KEY `idx_transaction_id` (`transaction_id`);

-- Agregar constraint de foreign key (opcional, depende de si quieres integridad referencial estricta)
-- ALTER TABLE `pedidos` 
-- ADD CONSTRAINT `fk_pedidos_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transacciones` (`id`) ON DELETE SET NULL;

-- Comentario: La foreign key está comentada porque los pedidos pueden existir sin transacción (pedidos en efectivo, etc.)
-- Si deseas activarla, descomenta las líneas anteriores
