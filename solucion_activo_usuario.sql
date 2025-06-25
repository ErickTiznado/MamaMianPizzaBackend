-- Script para activar usuarios desactivados
-- Fecha: 2025-06-24
-- Propósito: Activar las cuentas de usuarios que están desactivadas

-- 1. Ver el estado actual de los usuarios
SELECT 
    id_usuario,
    nombre,
    correo,
    activo,
    fecha_registro,
    CASE 
        WHEN activo = 1 THEN 'ACTIVO'
        WHEN activo = 0 THEN 'INACTIVO'
    END as estado
FROM usuarios 
ORDER BY fecha_registro DESC;

-- 2. OPCIÓN A: Activar TODOS los usuarios (usar con cuidado)
-- UPDATE usuarios SET activo = 1;

-- 3. OPCIÓN B: Activar un usuario específico por correo
-- Reemplaza 'correo@ejemplo.com' con el correo del usuario que quieres activar
-- UPDATE usuarios SET activo = 1 WHERE correo = 'correo@ejemplo.com';

-- 4. OPCIÓN C: Activar varios usuarios por ID
-- Reemplaza los números con los IDs de los usuarios que quieres activar
-- UPDATE usuarios SET activo = 1 WHERE id_usuario IN (1, 2, 3, 4, 5);

-- 5. OPCIÓN D: Activar usuarios que se registraron después de una fecha específica
-- UPDATE usuarios SET activo = 1 WHERE fecha_registro >= '2025-01-01';

-- 6. Verificar los cambios después de ejecutar el UPDATE
-- SELECT 
--     activo,
--     COUNT(*) as cantidad,
--     CASE 
--         WHEN activo = 1 THEN 'ACTIVOS'
--         WHEN activo = 0 THEN 'INACTIVOS'
--     END as descripcion
-- FROM usuarios 
-- GROUP BY activo;

-- 7. Ver usuarios específicos que acabas de activar
-- SELECT id_usuario, nombre, correo, activo 
-- FROM usuarios 
-- WHERE correo IN ('nathy.zelaya5@gmail.com', 'nathy.zelaya55@gmail.com');
