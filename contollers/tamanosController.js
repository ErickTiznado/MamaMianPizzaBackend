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
