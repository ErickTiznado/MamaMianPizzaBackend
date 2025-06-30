# COMANDOS SQL PARA COPIAR Y PEGAR
# Ejecuta estos comandos uno por uno en tu cliente MySQL

# 1. Verificar columnas existentes
SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'transacciones';

# 2. Agregar columnas faltantes (ejecutar una por una)
ALTER TABLE transacciones ADD COLUMN url_pago VARCHAR(500) NULL COMMENT 'URL de pago generada por Wompi';
ALTER TABLE transacciones ADD COLUMN email VARCHAR(100) NOT NULL COMMENT 'Email del cliente';
ALTER TABLE transacciones ADD COLUMN nombre_cliente VARCHAR(200) NULL COMMENT 'Nombre completo del cliente';
ALTER TABLE transacciones ADD COLUMN telefono VARCHAR(20) NULL COMMENT 'Teléfono del cliente';
ALTER TABLE transacciones ADD COLUMN direccion TEXT NULL COMMENT 'Dirección del cliente';
ALTER TABLE transacciones ADD COLUMN descripcion VARCHAR(255) NULL COMMENT 'Descripción de la transacción';
ALTER TABLE transacciones ADD COLUMN pedido_id INT NULL COMMENT 'ID del pedido asociado';
ALTER TABLE transacciones ADD COLUMN usuario_id INT NULL COMMENT 'ID del usuario';
ALTER TABLE transacciones ADD COLUMN status ENUM('pending','completed','failed','cancelled','processing') NOT NULL DEFAULT 'pending' COMMENT 'Estado de la transacción';
ALTER TABLE transacciones ADD COLUMN wompi_data JSON NULL COMMENT 'Datos completos de respuesta de Wompi';
ALTER TABLE transacciones ADD COLUMN wompi_response JSON NULL COMMENT 'Respuesta de confirmación de Wompi';
ALTER TABLE transacciones ADD COLUMN fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación';
ALTER TABLE transacciones ADD COLUMN fecha_actualizacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización';

# 3. Verificar que todas las columnas se agregaron
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'transacciones' ORDER BY ORDINAL_POSITION;

# 4. Si la columna monto no existe, agregarla también
ALTER TABLE transacciones ADD COLUMN monto DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Monto de la transacción';
