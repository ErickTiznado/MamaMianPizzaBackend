const pool = require('../database/db');
const bcrypt = require('bcrypt');
const actualDate = new Date().toISOString().slice(0, 19).replace('T', ' ');


exports.submmiitContent = (req, res) => {
    const { titulo, descripcion, precio, porciones, seccion, idcategoria, activo, imagen } = req.body;
    const actDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    try{
        if(!titulo || !descripcion || !precio || !porciones || !seccion || !idcategoria || !activo || !imagen  ){
            return res.status(400).json({message: 'Faltan datos requeridos'})
        }
        pool.query('INSERT INTO productos (titulo, descripcion, precio, porciones, seccion, idcaategoria, activo, imagen, fecha_creacion, fecha_actualizacion	) VALUES (?,?,?, ?, ?, ?, ?, ?, ?, ?)', [titulo, descripcion, precio, porciones, seccion, idcategoria, activo, imagen, actualDate, actDate], (err, results) => {
            if(err){
                console.error('Error al crear el producto', err)
                return res.status(500).json({message: 'Error al crear el producto'})
            }

            res.status(201),json({message: 'Producto creado exitosamente', id_producto: results.insertId})
        })
    }catch(error){
        console.error('Error en el servidor', error);
        res.status(500).json({message: 'Error en el servidor'});
    }

}