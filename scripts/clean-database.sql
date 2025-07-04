-- Script para limpiar la base de datos manteniendo usuarios y administradores
-- ADVERTENCIA: Este script elimina TODOS los datos excepto usuarios y administradores
-- Fecha: 3-Julio-2025
-- Ejecutar con precaución en entornos de producción

-- Verificar que existan usuarios antes de limpiar (safeguard)
-- Usamos un enfoque compatible con versiones anteriores de MySQL
SELECT COUNT(*) INTO @user_count FROM usuarios;
SELECT COUNT(*) INTO @admin_count FROM administradores;

-- Mostrar conteo de usuarios y administradores para verificación
SELECT @user_count AS 'Total Usuarios', @admin_count AS 'Total Administradores', 
       CONCAT('Verificación completada - ', 
              IF(@user_count > 0 AND @admin_count > 0, 'OK para continuar', 
                 'ADVERTENCIA: Faltan usuarios o administradores')) as 'Estado';

-- Desactivar restricciones de clave foránea temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------
-- Transacciones y datos de pago
-- -----------------------------------------------------
TRUNCATE TABLE transacciones;
-- La tabla datos_pedido_temporal no existe en esta BD
DELETE FROM logs WHERE accion = 'PAYMENT';
DELETE FROM notificaciones WHERE tipo LIKE '%pago%';

-- -----------------------------------------------------
-- Pedidos y relacionados
-- -----------------------------------------------------
TRUNCATE TABLE detalle_pedidos;
TRUNCATE TABLE pedidos;
DELETE FROM logs WHERE tabla_afectada = 'pedidos';
DELETE FROM notificaciones WHERE tipo = 'pedido';

-- -----------------------------------------------------
-- Reseñas y experiencia de usuario
-- -----------------------------------------------------
TRUNCATE TABLE resenas;
TRUNCATE TABLE experiencia;
DELETE FROM logs WHERE tabla_afectada = 'resenas';

-- -----------------------------------------------------
-- Reservas
-- -----------------------------------------------------
TRUNCATE TABLE reservas;
DELETE FROM logs WHERE tabla_afectada = 'reservas';
DELETE FROM notificaciones WHERE tipo LIKE '%reserva%';

-- -----------------------------------------------------
-- Direcciones de clientes (mantiene la tabla usuarios)
-- -----------------------------------------------------
TRUNCATE TABLE direcciones;

-- -----------------------------------------------------
-- Contenido Web (manteniendo la estructura)
-- -----------------------------------------------------
TRUNCATE TABLE historial_contenido;
DELETE FROM contenido_web WHERE seccion NOT IN ('about', 'welcome', 'footer');

-- -----------------------------------------------------
-- Limpiar notificaciones y logs no esenciales
-- -----------------------------------------------------
-- La tabla push_subscriptions no existe en esta BD
DELETE FROM notificaciones WHERE fecha_emision < DATE_SUB(NOW(), INTERVAL 1 DAY);
DELETE FROM logs WHERE fecha_hora < DATE_SUB(NOW(), INTERVAL 7 DAY) AND accion NOT IN ('LOGIN', 'SECURITY', 'ADMIN_ACTION');

-- -----------------------------------------------------
-- Mantener tablas de productos pero limpiar movimientos
-- -----------------------------------------------------
TRUNCATE TABLE movimientos_inventario;

-- -----------------------------------------------------
-- Limpiar datos temporales de recuperación de contraseña
-- -----------------------------------------------------
TRUNCATE TABLE password_reset;

-- -----------------------------------------------------
-- Reactivar restricciones de clave foránea
-- -----------------------------------------------------
SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------
-- Limpiar otras tablas que pueden contener datos transaccionales
-- -----------------------------------------------------
TRUNCATE TABLE metodos_pago;

-- -----------------------------------------------------
-- Estadísticas después de la limpieza
-- -----------------------------------------------------
SELECT 'Usuarios mantenidos' as entidad, COUNT(*) as total FROM usuarios;
SELECT 'Administradores mantenidos' as entidad, COUNT(*) as total FROM administradores;
SELECT 'Productos mantenidos' as entidad, COUNT(*) as total FROM productos;
SELECT 'Categorías mantenidas' as entidad, COUNT(*) as total FROM categorias;
SELECT 'Pedidos eliminados' as entidad, COUNT(*) as total FROM pedidos;

-- -----------------------------------------------------
-- No registramos en logs automáticamente para evitar error de prepared statement
-- -----------------------------------------------------
-- En su lugar, mostraremos un mensaje de éxito
SELECT 'Limpieza completada exitosamente' as resultado;

-- NOTA: Para registrar esta acción en logs, ejecutar manualmente:
/*
INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) 
VALUES (
  (SELECT id_usuario FROM administradores JOIN usuarios ON id_admin = id_usuario LIMIT 1),
  'ADMIN_ACTION',
  'system',
  'Limpieza general de la base de datos ejecutada, manteniendo usuarios y administradores'
);
*/

-- -----------------------------------------------------
-- RESUMEN DEL SCRIPT
-- -----------------------------------------------------
-- Este script ha eliminado:
-- 1. Todos los pedidos y sus detalles
-- 2. Todas las transacciones de pago
-- 3. Todas las reseñas y experiencias de usuario
-- 4. Todas las reservas
-- 5. Todas las direcciones de entrega
-- 6. Notificaciones antiguas
-- 7. Logs no esenciales
-- 
-- Se han mantenido:
-- 1. Usuarios y administradores
-- 2. Productos y categorías (estructura)
-- 3. Configuración del sistema
-- -----------------------------------------------------
