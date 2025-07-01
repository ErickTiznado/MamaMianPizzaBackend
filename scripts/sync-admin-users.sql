-- Script para sincronizar administradores entre tablas admins/administradores y usuarios
-- Ejecutar una sola vez para resolver problemas de logs con foreign key constraint

-- Primero, crear usuarios equivalentes para todos los administradores existentes
-- (Ajustar nombres de tabla según la implementación actual)

-- Opción 1: Si la tabla de administradores se llama 'admins'
INSERT IGNORE INTO usuarios (id_usuario, nombre, correo, contrasena, tipo_usuario, fecha_registro)
SELECT 
    id_admin as id_usuario,
    nombre,
    email as correo,
    COALESCE(contrasena, '$2b$10$dummy.hash.for.admin.logging.sync') as contrasena,
    'admin' as tipo_usuario,
    NOW() as fecha_registro
FROM admins
WHERE id_admin NOT IN (SELECT id_usuario FROM usuarios WHERE id_usuario IS NOT NULL);

-- Opción 2: Si la tabla de administradores se llama 'administradores'
INSERT IGNORE INTO usuarios (id_usuario, nombre, correo, contrasena, tipo_usuario, fecha_registro)
SELECT 
    id_admin as id_usuario,
    nombre,
    correo,
    COALESCE(contrasena, '$2b$10$dummy.hash.for.admin.logging.sync') as contrasena,
    'admin' as tipo_usuario,
    NOW() as fecha_registro
FROM administradores
WHERE id_admin NOT IN (SELECT id_usuario FROM usuarios WHERE id_usuario IS NOT NULL);

-- Verificar que se crearon correctamente
SELECT 
    u.id_usuario,
    u.nombre,
    u.correo,
    u.tipo_usuario,
    'Sincronizado para logs' as estado
FROM usuarios u
WHERE u.tipo_usuario = 'admin'
ORDER BY u.id_usuario;

-- Mostrar estadísticas
SELECT 
    COUNT(*) as total_usuarios_admin
FROM usuarios 
WHERE tipo_usuario = 'admin';

-- Limpiar logs huérfanos (opcional)
-- CUIDADO: Esto eliminará logs que hacen referencia a usuarios que no existen
-- UPDATE logs SET id_usuario = NULL WHERE id_usuario NOT IN (SELECT id_usuario FROM usuarios);

-- Verificar que no hay más problemas de foreign key
SELECT 
    l.id_usuario,
    COUNT(*) as logs_count,
    CASE 
        WHEN u.id_usuario IS NULL THEN 'USUARIO NO EXISTE'
        ELSE 'OK'
    END as estado
FROM logs l
LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
WHERE l.id_usuario IS NOT NULL
GROUP BY l.id_usuario, u.id_usuario
ORDER BY logs_count DESC;
