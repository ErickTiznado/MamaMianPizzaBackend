-- Script para limpiar la base de datos manteniendo usuarios y administradores
-- ADVERTENCIA: Este script elimina TODOS los datos excepto usuarios y administradores
-- Fecha: 3-Julio-2025
-- Ejecutar con precaución en entornos de producción

-- Desactivar restricciones de clave foránea temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------
-- Transacciones y datos de pago
-- -----------------------------------------------------
TRUNCATE TABLE transacciones;
TRUNCATE TABLE datos_pedido_temporal;
DELETE FROM logs WHERE tipo = 'PAYMENT';
DELETE FROM notificaciones WHERE tipo LIKE '%PAGO%';

-- -----------------------------------------------------
-- Pedidos y relacionados
-- -----------------------------------------------------
TRUNCATE TABLE detalle_pedidos;
TRUNCATE TABLE pedidos;
DELETE FROM logs WHERE tabla = 'pedidos';
DELETE FROM notificaciones WHERE tipo LIKE '%PEDIDO%';

-- -----------------------------------------------------
-- Reseñas y experiencia de usuario
-- -----------------------------------------------------
TRUNCATE TABLE resenas;
TRUNCATE TABLE experiencia;
DELETE FROM logs WHERE tabla = 'resenas';

-- -----------------------------------------------------
-- Reservas
-- -----------------------------------------------------
TRUNCATE TABLE reservas;
DELETE FROM logs WHERE tabla = 'reservas';
DELETE FROM notificaciones WHERE tipo LIKE '%RESERVA%';

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
TRUNCATE TABLE push_subscriptions;
DELETE FROM notificaciones WHERE fecha_creacion < DATE_SUB(NOW(), INTERVAL 1 DAY);
DELETE FROM logs WHERE fecha < DATE_SUB(NOW(), INTERVAL 7 DAY) AND tipo NOT IN ('LOGIN', 'SECURITY', 'ADMIN_ACTION');

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
-- Estadísticas después de la limpieza
-- -----------------------------------------------------
SELECT 'Usuarios mantenidos' as entidad, COUNT(*) as total FROM usuarios;
SELECT 'Administradores mantenidos' as entidad, COUNT(*) as total FROM administradores;
SELECT 'Productos mantenidos' as entidad, COUNT(*) as total FROM productos;
SELECT 'Categorías mantenidas' as entidad, COUNT(*) as total FROM categorias;

-- -----------------------------------------------------
-- Registrar la limpieza en logs
-- -----------------------------------------------------
INSERT INTO logs (id_usuario, tipo, tabla, descripcion) 
VALUES (
  (SELECT id_usuario FROM administradores JOIN usuarios ON id_admin = id_usuario LIMIT 1),
  'ADMIN_ACTION',
  'system',
  'Limpieza general de la base de datos ejecutada, manteniendo usuarios y administradores'
);

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
