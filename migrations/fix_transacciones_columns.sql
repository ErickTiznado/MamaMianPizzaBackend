-- Migración para agregar columnas faltantes a la tabla transacciones existente
-- Ejecutar solo si la tabla ya existe pero le faltan columnas

-- 1. Verificar si la tabla existe
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'transacciones';

-- 2. Agregar columnas que podrían estar faltando
-- (Se ejecutará solo si no existen)

-- Agregar url_pago si no existe
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_schema = DATABASE() 
               AND table_name = 'transacciones' 
               AND column_name = 'url_pago') = 0,
              'ALTER TABLE transacciones ADD COLUMN url_pago VARCHAR(500) NULL COMMENT "URL de pago generada por Wompi"',
              'SELECT "Columna url_pago ya existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar wompi_data si no existe
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_schema = DATABASE() 
               AND table_name = 'transacciones' 
               AND column_name = 'wompi_data') = 0,
              'ALTER TABLE transacciones ADD COLUMN wompi_data JSON NULL COMMENT "Datos completos de respuesta de Wompi"',
              'SELECT "Columna wompi_data ya existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar wompi_response si no existe
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_schema = DATABASE() 
               AND table_name = 'transacciones' 
               AND column_name = 'wompi_response') = 0,
              'ALTER TABLE transacciones ADD COLUMN wompi_response JSON NULL COMMENT "Respuesta de confirmación de Wompi"',
              'SELECT "Columna wompi_response ya existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar nombre_cliente si no existe
SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_schema = DATABASE() 
               AND table_name = 'transacciones' 
               AND column_name = 'nombre_cliente') = 0,
              'ALTER TABLE transacciones ADD COLUMN nombre_cliente VARCHAR(200) NULL COMMENT "Nombre completo del cliente"',
              'SELECT "Columna nombre_cliente ya existe"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar que el status tenga los valores correctos
ALTER TABLE transacciones MODIFY COLUMN status 
ENUM('pending','completed','failed','cancelled','processing') 
NOT NULL DEFAULT 'pending' 
COMMENT 'Estado de la transacción';

-- Mostrar estructura final
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'transacciones'
ORDER BY ORDINAL_POSITION;
