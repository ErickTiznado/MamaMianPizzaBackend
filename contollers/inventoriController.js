const pool = require('../config/db');
const bcrypt = require('bcrypt');

const path = require('path');   

exports.createInventarioItem = (req, res) => {
    const {nombre, categoria, cantidad, unidad, fecha_caducidad, proveedor, costo} = req.body;
    try{
        if(!nombre || !categoria || !cantidad || !unidad || !fecha_caducidad || !proveedor || !costo){
            return res.status(400).json({message: 'Faltan datos requeridos'});
        }
        pool.query('INSERT INTO ingredientes (nombre, categoria ,cantidad_actual, unidad, fecha_caducidad, proveedor, costo) VALUES (?, ?, ?, ?, ?, ?)', [nombre, cantidad, unidad, fecha_caducidad, proveedor , costo], (err, results) =>{
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