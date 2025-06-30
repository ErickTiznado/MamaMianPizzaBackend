-- Script para agregar TODAS las columnas faltantes a la tabla transacciones
-- Ejecutar este script en tu base de datos MySQL

-- 1. Primero verificamos qué columnas existen actualmente
SELECT COLUMN_NAME 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'transacciones'
ORDER BY ORDINAL_POSITION;

-- 2. Agregar columnas faltantes una por una (ignorar errores si ya existen)

-- Agregar url_pago
ALTER TABLE transacciones 
ADD COLUMN IF NOT EXISTS url_pago VARCHAR(500) NULL 
COMMENT 'URL de pago generada por Wompi';

-- Agregar email
ALTER TABLE transacciones 
ADD COLUMN IF NOT EXISTS email VARCHAR(100) NOT NULL 
COMMENT 'Email del cliente';

-- Agregar nombre_cliente
ALTER TABLE transacciones 
ADD COLUMN IF NOT EXISTS nombre_cliente VARCHAR(200) NULL 
COMMENT 'Nombre completo del cliente';

-- Agregar telefono
ALTER TABLE transacciones 
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20) NULL 
COMMENT 'Teléfono del cliente';

-- Agregar direccion
ALTER TABLE transacciones 
ADD COLUMN IF NOT EXISTS direccion TEXT NULL 
COMMENT 'Dirección del cliente';

-- Agregar descripcion
ALTER TABLE transacciones 
ADD COLUMN IF NOT EXISTS descripcion VARCHAR(255) NULL 
COMMENT 'Descripción de la transacción';

-- Agregar pedido_id
ALTER TABLE transacciones 
ADD COLUMN IF NOT EXISTS pedido_id INT NULL 
COMMENT 'ID del pedido asociado';

-- Agregar usuario_id
ALTER TABLE transacciones 
ADD COLUMN IF NOT EXISTS usuario_id INT NULL 
COMMENT 'ID del usuario';

-- Agregar status (con valores enum)
ALTER TABLE transacciones 
ADD COLUMN IF NOT EXISTS status ENUM('pending','completed','failed','cancelled','processing') 
NOT NULL DEFAULT 'pending' 
COMMENT 'Estado de la transacción';

-- Agregar wompi_data
ALTER TABLE transacciones 
ADD COLUMN IF NOT EXISTS wompi_data JSON NULL 
COMMENT 'Datos completos de respuesta de Wompi';

-- Agregar wompi_response
ALTER TABLE transacciones 
ADD COLUMN IF NOT EXISTS wompi_response JSON NULL 
COMMENT 'Respuesta de confirmación de Wompi';

-- Agregar fecha_creacion
ALTER TABLE transacciones 
ADD COLUMN IF NOT EXISTS fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
COMMENT 'Fecha de creación';

-- Agregar fecha_actualizacion
ALTER TABLE transacciones 
ADD COLUMN IF NOT EXISTS fecha_actualizacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP 
COMMENT 'Fecha de última actualización';

-- Agregar monto si no existe
ALTER TABLE transacciones 
ADD COLUMN IF NOT EXISTS monto DECIMAL(10,2) NOT NULL DEFAULT 0.00 
COMMENT 'Monto de la transacción';

-- 3. Verificar estructura final
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'transacciones'
ORDER BY ORDINAL_POSITION;

-- 4. Mensaje de confirmación
SELECT 'Todas las columnas han sido agregadas exitosamente' AS resultado;
