const pool = require('../config/db');

// Obtener todos los ingredientes disponibles para pizzas
exports.getAllPizzaIngredients = (req, res) => {
    const query = `
        SELECT 
            pi.id,
            pi.id_ingrediente,
            pi.precio_extra,
            i.nombre,
            i.categoria,
            i.cantidad_actual as cantidad,
            i.unidad,
            i.proveedor,
            i.fecha_caducidad,
            i.costo
        FROM pizza_ingredientes pi
        INNER JOIN ingredientes i ON pi.id_ingrediente = i.id_ingrediente
        ORDER BY i.categoria, i.nombre
    `;
    
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener ingredientes de pizza:', err);
            return res.status(500).json({ error: 'Error al obtener ingredientes de pizza' });
        }
        res.json(results);
    });
};

// Obtener un ingrediente de pizza específico
exports.getPizzaIngredientById = (req, res) => {
    const { id } = req.params;
    
    const query = `
        SELECT 
            pi.id,
            pi.id_ingrediente,
            pi.precio_extra,
            i.nombre,
            i.categoria,
            i.cantidad_actual as cantidad,
            i.unidad,
            i.proveedor,
            i.fecha_caducidad,
            i.costo
        FROM pizza_ingredientes pi
        INNER JOIN ingredientes i ON pi.id_ingrediente = i.id_ingrediente
        WHERE pi.id = ?
    `;
    
    pool.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener ingrediente de pizza:', err);
            return res.status(500).json({ error: 'Error al obtener ingrediente de pizza' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Ingrediente de pizza no encontrado' });
        }
        
        res.json(results[0]);
    });
};

// Agregar un ingrediente del inventario a los ingredientes de pizza
exports.addPizzaIngredient = (req, res) => {
    const { id_ingrediente, precio_extra } = req.body;
    
    try {
        // Validar datos requeridos
        if (!id_ingrediente || precio_extra === undefined || precio_extra === null) {
            return res.status(400).json({ 
                message: 'Faltan datos requeridos: id_ingrediente y precio_extra son obligatorios' 
            });
        }
        
        // Validar que el precio extra sea un número válido
        if (isNaN(precio_extra) || parseFloat(precio_extra) < 0) {
            return res.status(400).json({ 
                message: 'El precio extra debe ser un número positivo' 
            });
        }
        
        // Verificar que el ingrediente existe en el inventario
        pool.query('SELECT id_ingrediente FROM ingredientes WHERE id_ingrediente = ?', [id_ingrediente], (err, inventoryCheck) => {
            if (err) {
                console.error('Error al verificar ingrediente en inventario:', err);
                return res.status(500).json({ error: 'Error al verificar ingrediente en inventario' });
            }
            
            if (inventoryCheck.length === 0) {
                return res.status(404).json({ error: 'El ingrediente no existe en el inventario' });
            }
            
            // Verificar que el ingrediente no esté ya agregado a pizza_ingredientes
            pool.query('SELECT id FROM pizza_ingredientes WHERE id_ingrediente = ?', [id_ingrediente], (err, duplicateCheck) => {
                if (err) {
                    console.error('Error al verificar duplicado:', err);
                    return res.status(500).json({ error: 'Error al verificar duplicado' });
                }
                
                if (duplicateCheck.length > 0) {
                    return res.status(409).json({ error: 'Este ingrediente ya está agregado para personalización de pizzas' });
                }
                
                // Insertar el nuevo ingrediente de pizza
                const insertQuery = 'INSERT INTO pizza_ingredientes (id_ingrediente, precio_extra) VALUES (?, ?)';
                pool.query(insertQuery, [id_ingrediente, parseFloat(precio_extra)], (err, results) => {
                    if (err) {
                        console.error('Error al agregar ingrediente de pizza:', err);
                        return res.status(500).json({ error: 'Error al agregar ingrediente de pizza' });
                    }
                    
                    res.status(201).json({
                        message: 'Ingrediente agregado exitosamente para personalización de pizzas',
                        id: results.insertId,
                        id_ingrediente: id_ingrediente,
                        precio_extra: parseFloat(precio_extra)
                    });
                });
            });
        });
        
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Actualizar el precio extra de un ingrediente de pizza
exports.updatePizzaIngredient = (req, res) => {
    const { id } = req.params;
    const { precio_extra } = req.body;
    
    try {
        // Validar datos requeridos
        if (precio_extra === undefined || precio_extra === null) {
            return res.status(400).json({ 
                message: 'El precio_extra es requerido' 
            });
        }
        
        // Validar que el precio extra sea un número válido
        if (isNaN(precio_extra) || parseFloat(precio_extra) < 0) {
            return res.status(400).json({ 
                message: 'El precio extra debe ser un número positivo' 
            });
        }
        
        // Verificar que el ingrediente de pizza existe
        pool.query('SELECT id FROM pizza_ingredientes WHERE id = ?', [id], (err, existsCheck) => {
            if (err) {
                console.error('Error al verificar ingrediente de pizza:', err);
                return res.status(500).json({ error: 'Error al verificar ingrediente de pizza' });
            }
            
            if (existsCheck.length === 0) {
                return res.status(404).json({ error: 'Ingrediente de pizza no encontrado' });
            }
            
            // Actualizar el precio extra
            const updateQuery = 'UPDATE pizza_ingredientes SET precio_extra = ? WHERE id = ?';
            pool.query(updateQuery, [parseFloat(precio_extra), id], (err, results) => {
                if (err) {
                    console.error('Error al actualizar ingrediente de pizza:', err);
                    return res.status(500).json({ error: 'Error al actualizar ingrediente de pizza' });
                }
                
                res.json({
                    message: 'Precio actualizado exitosamente',
                    id: parseInt(id),
                    precio_extra: parseFloat(precio_extra)
                });
            });
        });
        
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Eliminar un ingrediente de la personalización de pizzas
exports.deletePizzaIngredient = (req, res) => {
    const { id } = req.params;
    
    try {
        // Verificar que el ingrediente de pizza existe
        pool.query('SELECT id FROM pizza_ingredientes WHERE id = ?', [id], (err, existsCheck) => {
            if (err) {
                console.error('Error al verificar ingrediente de pizza:', err);
                return res.status(500).json({ error: 'Error al verificar ingrediente de pizza' });
            }
            
            if (existsCheck.length === 0) {
                return res.status(404).json({ error: 'Ingrediente de pizza no encontrado' });
            }
            
            // Eliminar el ingrediente de pizza
            pool.query('DELETE FROM pizza_ingredientes WHERE id = ?', [id], (err, results) => {
                if (err) {
                    console.error('Error al eliminar ingrediente de pizza:', err);
                    return res.status(500).json({ error: 'Error al eliminar ingrediente de pizza' });
                }
                
                res.json({
                    message: 'Ingrediente removido exitosamente de la personalización de pizzas'
                });
            });
        });
        
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Obtener ingredientes del inventario disponibles para agregar (que no estén ya en pizza_ingredientes)
exports.getAvailableInventoryIngredients = (req, res) => {
    const query = `
        SELECT 
            i.id_ingrediente,
            i.nombre,
            i.categoria,
            i.cantidad_actual,
            i.unidad,
            i.proveedor,
            i.fecha_caducidad,
            i.costo
        FROM ingredientes i
        LEFT JOIN pizza_ingredientes pi ON i.id_ingrediente = pi.id_ingrediente
        WHERE pi.id_ingrediente IS NULL
        ORDER BY i.categoria, i.nombre
    `;
    
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener ingredientes disponibles:', err);
            return res.status(500).json({ error: 'Error al obtener ingredientes disponibles' });
        }
        res.json(results);
    });
};

// Obtener estadísticas de ingredientes de pizza
exports.getPizzaIngredientsStats = (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_ingredientes,
                AVG(precio_extra) as precio_promedio,
                MIN(precio_extra) as precio_minimo,
                MAX(precio_extra) as precio_maximo,
                COUNT(CASE WHEN i.cantidad_actual < 10 THEN 1 END) as ingredientes_stock_bajo
            FROM pizza_ingredientes pi
            INNER JOIN ingredientes i ON pi.id_ingrediente = i.id_ingrediente
        `;
        
        pool.query(statsQuery, (err, statsResults) => {
            if (err) {
                console.error('Error al obtener estadísticas:', err);
                return res.status(500).json({ error: 'Error al obtener estadísticas' });
            }
            
            // Obtener ingredientes por categoría
            const categoryQuery = `
                SELECT 
                    i.categoria,
                    COUNT(*) as cantidad,
                    AVG(pi.precio_extra) as precio_promedio_categoria
                FROM pizza_ingredientes pi
                INNER JOIN ingredientes i ON pi.id_ingrediente = i.id_ingrediente
                GROUP BY i.categoria
                ORDER BY cantidad DESC
            `;
            
            pool.query(categoryQuery, (err, categoryResults) => {
                if (err) {
                    console.error('Error al obtener estadísticas por categoría:', err);
                    return res.status(500).json({ error: 'Error al obtener estadísticas por categoría' });
                }
                
                const stats = {
                    ...statsResults[0],
                    precio_promedio: parseFloat(statsResults[0].precio_promedio || 0).toFixed(2),
                    precio_minimo: parseFloat(statsResults[0].precio_minimo || 0).toFixed(2),
                    precio_maximo: parseFloat(statsResults[0].precio_maximo || 0).toFixed(2),
                    por_categoria: categoryResults.map(cat => ({
                        categoria: cat.categoria,
                        cantidad: cat.cantidad,
                        precio_promedio: parseFloat(cat.precio_promedio_categoria || 0).toFixed(2)
                    }))
                };
                
                res.json(stats);
            });
        });
        
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
