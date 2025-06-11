const pool = require('../config/db');


const getAllCategories = (req, res) => {
    pool.query('SELECT * FROM categorias', (err, results) => {
        if(err){
            console.error('Error al obtener las categorias', err);
            return res.status(500).json({error: 'Error al obtener las categorias'});
        }
        res.json(results);
    })
}

const createCategory = (req, res ) => {
    try {
        const {nombre, descripcion} = req.body;
        if(!nombre || !descripcion){
            return res.status(400).json({message: 'Faltan datos requeridos'});
        }
    } 
    catch (error) {
        console.error('Error en el servidor', error);
        return res.status(500).json({message: 'Error en el servidor'});
    }
    pool.query(
        'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
        [req.body.nombre, req.body.descripcion],
        (err, results) => {
            if(err){
                console.error('Error al crear la categoria', err);
                return res.status(500).json({error: 'Error al crear la categoria'});
            }
            res.status(201).json({
                message: 'Categoria creada exitosamente',
                id_categoria: results.insertId
            });
        }
    )
}