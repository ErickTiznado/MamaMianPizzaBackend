const pool = require('../config/db');
const bcrypt = require('bcrypt');

const path = require('path');   

exports.createInventarioItem = (req, res) => {
    const {nombre, categoria, cantidad, unidad, fecha_caducidad, proveedor, costo} = req.body;
    try{
        if(!nombre || !categoria || !cantidad || !unidad || !fecha_caducidad || !proveedor || !costo){
            return res.status(400).json({message: 'Faltan datos requeridos'});
        }
        pool.query('INSERT INTO ingredientes (nombre, categoria ,cantidad_actual, unidad, fecha_caducidad, proveedor, costo) VALUES (?, ?, ?, ?, ?, ?, ?)', [nombre, categoria ,cantidad, unidad, fecha_caducidad, proveedor , costo], (err, results) =>{
            if(err){
                console.error('Error al crear el item de inventario', err);
                return res.status(500).json({message: 'Error al crear el item de inventario'})
            }
            res.status(201).json({message: 'Item de inventario creado exitosamente', id_ingrediente: results.insertId});
        })
    }catch(error){
        console.error('Error en el servidor', error);
        res.status(500).json({message: 'Error en el servidor'});
    }

}

exports.getAllInventarioItems = (req, res) => {
    pool.query('SELECT * FROM ingredientes', (err, results) =>{
        if(err){
            console.error('Error al obtener items de inventario', err);
            return res.status(500).json({error: 'Error al obtener items de inventario'})
        }
        res.json(results);
    });
}


exports.itemDelete = (req, res) => {
    const {id_ingrediente} = req.params;
    pool.query('DELETE FROM ingredientes WHERE id_ingrediente = ?', [id_ingrediente], (err, results) =>{
        if(err){
            console.error('Error al eliminar el item de inventario', err);
            return res.status(500).json({error: 'Error al eliminar el item de inventario'})
        }
        res.json({message: 'Item de inventario eliminado exitosamente'});
    });
}


exports.updateInventarioItem = (req, res) => {
    const { id_ingrediente } = req.params;
    const { nombre, categoria, cantidad, unidad, fecha_caducidad, proveedor, costo } = req.body;

    pool.query('UPDATE ingredientes SET nombre = ?, categoria = ?, cantidad_actual = ?, unidad = ?, fecha_caducidad = ?, proveedor = ?, costo = ? WHERE id_ingrediente = ?', [nombre, categoria, cantidad, unidad, fecha_caducidad, proveedor, costo, id_ingrediente], (err, results) => {
        if (err) {
            console.error('Error al actualizar el item de inventario', err);
            return res.status(500).json({ message: 'Error al actualizar el item de inventario' });
        }
        res.json({ message: 'Item de inventario actualizado exitosamente' });
    });
}

exports.getInventarioStats = (req, res) => {
    try {
        // Obtener todos los productos
        pool.query('SELECT * FROM ingredientes', (err, allProducts) => {
            if (err) {
                console.error('Error al obtener estadísticas del inventario', err);
                return res.status(500).json({ error: 'Error al obtener estadísticas del inventario' });
            }

            // Calcular estadísticas
            const totalProductos = allProducts.length;
            const valorTotalInventario = allProducts.reduce((total, item) => total + (item.cantidad_actual * item.costo), 0);
            
            // Productos con stock bajo (menos de 10 unidades)
            const stockMinimo = 10;
            const productosStockBajo = allProducts.filter(item => item.cantidad_actual < stockMinimo);
            
            // Productos próximos a vencer (en los próximos 7 días)
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() + 7);
            
            const productosProximosVencer = allProducts.filter(item => {
                const fechaCaducidad = new Date(item.fecha_caducidad);
                return fechaCaducidad <= fechaLimite && fechaCaducidad >= new Date();
            });

            const estadisticas = {
                totalProductos,
                valorTotalInventario: parseFloat(valorTotalInventario.toFixed(2)),
                stockBajo: {
                    cantidad: productosStockBajo.length,
                    productos: productosStockBajo.map(item => ({
                        id_ingrediente: item.id_ingrediente,
                        nombre: item.nombre,
                        categoria: item.categoria,
                        cantidad_actual: item.cantidad_actual,
                        unidad: item.unidad,
                        costo: item.costo
                    }))
                },
                proximosVencer: {
                    cantidad: productosProximosVencer.length,
                    productos: productosProximosVencer.map(item => ({
                        id_ingrediente: item.id_ingrediente,
                        nombre: item.nombre,
                        categoria: item.categoria,
                        fecha_caducidad: item.fecha_caducidad,
                        dias_restantes: Math.ceil((new Date(item.fecha_caducidad) - new Date()) / (1000 * 60 * 60 * 24))
                    }))
                }
            };

            res.json(estadisticas);
        });
    } catch (error) {
        console.error('Error en el servidor', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
}