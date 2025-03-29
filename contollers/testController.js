const pool = require('../config/db');

exports.testConnection = (req, res) => {
    pool.query('SELECT 1 + 1 AS result', (err, results) =>{
        if(err){
            console.error('Error al conectar a la base de datos', err);
            return res.status(500).json({error: 'Error al conectar a la base de datos'})
        }
        res.json({message: 'Conexion Exitosa', result: results[0].result });
    });
};