const pool = require('../config/db');
const bcrypt = require('bcrypt');


exports.getAllUsers = (req, res) => {
    pool.query('SELECT * FROM users', (err, results) =>{
        if(err){
            console.error('Error al obtener usuarios', err);
            return res.status(500).json({error: 'Error al obtener usuarios'})
        }
        res.json(results);
    });
};

exports.createAdmin = (req, res) => {
    try{
    const {nombre, correo, contrasena, rol, telefono} = req.body;
    
        if(!nombre || !correo || !contrasena || !rol || !telefono){
            return res.status(400).json({message: 'Faltan datos requeridos'});
        }
        const hashedPass = bcrypt.hashSync(contrasena, 10);
        pool.query('INSERT INTO administradores ( nombre, correo, contrasena, rol, telefono) VALUES ( ?, ? ,? ,? ,?)', [ nombre, correo, hashedPass, rol, telefono], (err, results) => {
            if(err){
                console.error('Error al crear administrador', err);
                return res.status(500).json({message: 'Error al crear el usuario administrador'})
            }
            res.status(201).json({message: 'Usuario Administrador creado exitosamente', id_admin: results.insertId});
        });
}catch(error){
    console.error('Error en el servidor', error);
    res.status(500).json({message: 'Error en el servidor'});
}
};