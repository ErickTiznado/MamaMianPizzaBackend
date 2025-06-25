-- Script de debug para verificar el estado de la columna activo en usuarios
-- Ejecuta este script para verificar los valores de la columna activo

-- 1. Verificar la estructura de la columna activo
SHOW COLUMNS FROM `usuarios` LIKE 'activo';

-- 2. Verificar todos los valores de activo en la tabla usuarios
SELECT 
    id_usuario, 
    nombre, 
    correo, 
    activo,
    CASE 
        WHEN activo = 1 THEN 'ACTIVO'
        WHEN activo = 0 THEN 'INACTIVO'
        ELSE 'VALOR_DESCONOCIDO'
    END as estado_legible,
    activo + 0 AS activo_numerico,
    LENGTH(activo) AS longitud_valor,
    activo IS NULL AS es_nulo
FROM usuarios 
ORDER BY id_usuario;

-- 3. Contar usuarios por estado
SELECT 
    activo,
    COUNT(*) as cantidad_usuarios,
    CASE 
        WHEN activo = 1 THEN 'ACTIVOS'
        WHEN activo = 0 THEN 'INACTIVOS'
        ELSE 'VALOR_DESCONOCIDO'
    END as descripcion
FROM usuarios 
GROUP BY activo;

-- 4. Verificar si hay valores NULL o extraños
SELECT 
    COUNT(*) as total_usuarios,
    SUM(CASE WHEN activo IS NULL THEN 1 ELSE 0 END) as usuarios_con_null,
    SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as usuarios_activos,
    SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as usuarios_inactivos,
    SUM(CASE WHEN activo NOT IN (0, 1) AND activo IS NOT NULL THEN 1 ELSE 0 END) as usuarios_con_valor_extraño
FROM usuarios;

-- 5. Verificar un usuario específico (reemplaza 'tu_correo@ejemplo.com' con el correo que estás probando)
-- SELECT 
--     id_usuario, 
--     nombre, 
--     correo, 
--     activo,
--     activo + 0 AS activo_numerico,
--     activo = 1 AS es_activo_comparacion_1,
--     activo = 0 AS es_inactivo_comparacion_0,
--     activo = '1' AS es_activo_comparacion_string,
--     activo = '0' AS es_inactivo_comparacion_string
-- FROM usuarios 
-- WHERE correo = 'tu_correo@ejemplo.com';
