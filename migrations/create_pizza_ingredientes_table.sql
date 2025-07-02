-- Crear tabla para ingredientes de pizza personalizables
CREATE TABLE IF NOT EXISTS pizza_ingredientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_ingrediente INT NOT NULL,
    precio_extra DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ingrediente) REFERENCES ingredientes(id_ingrediente) ON DELETE CASCADE,
    UNIQUE KEY unique_ingrediente (id_ingrediente)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_pizza_ingredientes_precio ON pizza_ingredientes(precio_extra);
CREATE INDEX idx_pizza_ingredientes_fecha ON pizza_ingredientes(fecha_creacion);

-- Comentarios de la tabla
ALTER TABLE pizza_ingredientes COMMENT = 'Tabla para almacenar ingredientes disponibles para personalización de pizzas con sus precios extra';

-- Insertar algunos datos de ejemplo (opcional)
-- INSERT INTO pizza_ingredientes (id_ingrediente, precio_extra) VALUES 
-- (1, 2.50),  -- Suponiendo que existe un ingrediente con id 1
-- (2, 1.50),  -- Suponiendo que existe un ingrediente con id 2
-- (3, 3.00);  -- Suponiendo que existe un ingrediente con id 3
