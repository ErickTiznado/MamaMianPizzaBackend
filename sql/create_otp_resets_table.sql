-- SQL Script para crear la tabla otp_resets
-- Ejecutar este script en tu base de datos MySQL

CREATE TABLE IF NOT EXISTS otp_resets (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at DATETIME NULL,
    INDEX idx_usuario (id_usuario),
    INDEX idx_otp (otp),
    INDEX idx_expires (expires_at),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Opcional: Crear índice compuesto para búsquedas más eficientes
CREATE INDEX idx_usuario_otp_expires ON otp_resets (id_usuario, otp, expires_at);

-- Opcional: Crear evento para limpiar automáticamente OTPs expirados
-- (esto es opcional y requiere que tengas privilegios para crear eventos)
/*
DELIMITER $$
CREATE EVENT IF NOT EXISTS cleanup_expired_otps
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM otp_resets WHERE expires_at < NOW();
END$$
DELIMITER ;
*/
