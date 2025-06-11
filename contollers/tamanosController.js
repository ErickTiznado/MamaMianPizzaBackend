const pool = require('../config/db');




exports.getAllSizes = (req, res) => {
    pool.query('SELECT * FROM tamanos', (err, results) => {
        if (err) {
            console.error('Error al obtener tamaños', err);
            return res.status(500).json({ error: 'Error al obtener tamaños' });
        }
        res.json(results);
    });
}


exports.GetSizesandPrices = (req, res) => {
    pool.query('SELECT tamanos.id_tamano, tamanos.nombre, tamanos.descripcion, precios.precio FROM tamanos JOIN precios ON tamanos.id_tamano = precios.id_tamano', (err, results) => {
        if (err) {
            console.error('Error al obtener tamaños y precios', err);
            return res.status(500).json({ error: 'Error al obtener tamaños y precios' });
        }
        res.json(results);
    });
}