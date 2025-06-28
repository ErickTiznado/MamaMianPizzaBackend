-- SQL script to create the Wompi transactions table
-- Run this script in your MySQL database

-- Create the transacciones_wompi table
CREATE TABLE IF NOT EXISTS `transacciones_wompi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_reference` varchar(100) NOT NULL UNIQUE,
  `wompi_transaction_id` varchar(100) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `order_code` varchar(50) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','approved','rejected','cancelled','expired','failed','unknown') DEFAULT 'pending',
  `wompi_status` varchar(50) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `authorization_code` varchar(100) DEFAULT NULL,
  `payment_reference` varchar(100) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `redirect_url` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `wompi_response` longtext DEFAULT NULL,
  `webhook_data` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_transaction_reference` (`transaction_reference`),
  KEY `idx_wompi_transaction_id` (`wompi_transaction_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  -- Add foreign key constraint to orders table if it exists
  CONSTRAINT `fk_transacciones_wompi_order` 
    FOREIGN KEY (`order_id`) 
    REFERENCES `pedidos` (`id_pedido`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add new columns to pedidos table to track Wompi payments
-- Only add these columns if they don't already exist

-- Check if columns exist first (you may need to run these individually)
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'pedidos' 
AND COLUMN_NAME IN ('payment_reference', 'payment_authorization', 'payment_completed_at')
AND TABLE_SCHEMA = DATABASE();

-- Add columns if they don't exist (run each ALTER TABLE separately)
ALTER TABLE `pedidos` 
ADD COLUMN `payment_reference` varchar(100) DEFAULT NULL COMMENT 'Referencia del pago (Wompi transaction reference)';

ALTER TABLE `pedidos` 
ADD COLUMN `payment_authorization` varchar(100) DEFAULT NULL COMMENT 'Código de autorización del pago';

ALTER TABLE `pedidos` 
ADD COLUMN `payment_completed_at` timestamp NULL DEFAULT NULL COMMENT 'Fecha y hora cuando se completó el pago';

-- Add indexes for better performance
ALTER TABLE `pedidos` 
ADD INDEX `idx_payment_reference` (`payment_reference`);

-- Update metodo_pago enum to include wompi_3ds if not already present
-- First check current enum values
SHOW COLUMNS FROM `pedidos` LIKE 'metodo_pago';

-- If you need to update the enum (modify this based on your current enum values)
-- ALTER TABLE `pedidos` 
-- MODIFY COLUMN `metodo_pago` enum('efectivo','tarjeta','transferencia','wompi_3ds') DEFAULT NULL;

-- Create a view for easy payment reporting
CREATE OR REPLACE VIEW `vw_payment_summary` AS
SELECT 
    p.id_pedido,
    p.codigo_pedido,
    p.total as order_total,
    p.metodo_pago,
    p.estado as order_status,
    p.fecha_pedido,
    p.payment_reference,
    p.payment_authorization,
    p.payment_completed_at,
    tw.transaction_reference,
    tw.wompi_transaction_id,
    tw.amount as payment_amount,
    tw.status as payment_status,
    tw.wompi_status,
    tw.customer_name as payment_customer_name,
    tw.customer_email as payment_customer_email,
    tw.authorization_code,
    tw.created_at as payment_created_at,
    tw.completed_at as payment_completed_at
FROM pedidos p
LEFT JOIN transacciones_wompi tw ON p.id_pedido = tw.order_id
WHERE p.metodo_pago = 'wompi_3ds' OR tw.id IS NOT NULL
ORDER BY p.fecha_pedido DESC;

-- Insert some sample test data (optional - remove in production)
-- INSERT INTO `transacciones_wompi` (
--     `transaction_reference`, 
--     `wompi_transaction_id`, 
--     `amount`, 
--     `status`, 
--     `customer_name`, 
--     `customer_email`,
--     `customer_phone`
-- ) VALUES (
--     'MAMA-TEST-001', 
--     'WOMPI-TEST-001', 
--     25.50, 
--     'approved', 
--     'Cliente de Prueba', 
--     'test@mamamianpizza.com',
--     '+503 1234-5678'
-- );

-- Show table structure
DESCRIBE `transacciones_wompi`;
