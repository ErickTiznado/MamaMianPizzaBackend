-- Migration: Add ultimo_acceso field to usuarios table
-- Date: 2025-06-18
-- Description: Add ultimo_acceso timestamp field to track last user login

ALTER TABLE `usuarios` 
ADD COLUMN `ultimo_acceso` timestamp NULL DEFAULT NULL 
AFTER `foto_perfil`;

-- Update existing records to set ultimo_acceso to NULL (default)
-- This is optional since the default is already NULL
UPDATE `usuarios` SET `ultimo_acceso` = NULL WHERE `ultimo_acceso` IS NULL;

-- Verification query (run this to check the migration worked)
-- SHOW COLUMNS FROM `usuarios` LIKE 'ultimo_acceso';
