-- Migration: Add activo field to usuarios table
-- Date: 2025-06-23
-- Description: Add activo boolean field to control account activation/deactivation

ALTER TABLE `usuarios` 
ADD COLUMN `activo` tinyint(1) NOT NULL DEFAULT '1' 
AFTER `foto_perfil`;

-- Update existing records to set activo = 1 (active by default)
UPDATE `usuarios` SET `activo` = 1 WHERE `activo` IS NULL;

-- Verification query (run this to check the migration worked)
-- SHOW COLUMNS FROM `usuarios` LIKE 'activo';

-- Index for better performance on login queries
CREATE INDEX idx_usuarios_activo ON `usuarios` (`activo`);
