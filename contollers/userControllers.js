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


exports.loginAdmin = (req, res) =>{
    const {correo, contrasena} = req.body;
    if(!correo || !contrasena){
        return res.status(400).json({message: 'Faltan datos requeridos'});
    }

    pool.query('SELECT * FROM administradores WHERE correo = ?', [correo], (err, results) =>{
        if(err){
            console.error('Error al iniciar sesion', err);
            return res.status(500).json({error: 'Error al iniciar sesion'})
        }
        if(results.length === 0){
            return res.status(401).json({message: 'Credenciales invalidas'});
        }

        const admin = results[0];
        console.log('Admin:', admin);
        bcrypt.compare(contrasena, admin.contrasena, (err, isMatch) =>{
            if(err){
                console.error('Error al comparar contraseñas', err);
                return res.status(500).json({message: 'Error en el servidor'});
            }

            if(isMatch){
                res.status(200).json({ success:true ,message: 'Inicio de sesion exitoso'});

            }else {
                return res.status(401).json({message: 'Credenciales invalidas'});
            }
        }
    );
    })
};

exports.loginClient = (req, res) => {
    const {correo, contrasena} = req.body;
    if(!correo || !contrasena){
        return res.status(400).json({message: 'Faltan datos requeridos'})
    }

    pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, results) => {
        if(err){
            console.error('Error al iniciar sesion', err);
            return res.status(500).json({error: 'Error al iniciar sesion'})
        }
        if(results.length === 0){
            return res.status(401).json({message: 'Credenciales invalidas'})
        }

        const user = results[0];
        bcrypt.compare(contrasena, user.contrasena, (err, isMatch) => {
            if(err){
                console.log('Error al comparar contraseñas', err);
                return res.status(500).json({message: 'Error en el servidor'});
            }
            if(isMatch){
                res.status(200).json({ success:true, message: 'Inicio de sesion exitoso'});
            }
            else{
                return res.status(401).json({message: 'Credenciales invalidas'})
            }
        })
    })
}

exports.createClient = (req, res) => {
    try{
    const { nombre, correo, contrasena, celular, fecha_nacimiento, sexo, dui } = req.body;
    if(!nombre || !correo || !contrasena || !celular || !fecha_nacimiento || !sexo || !dui){
        return res.status(400).json({message: 'Faltan datos requeridos'})
    }

    const haShedPass = bcrypt.hashSync(contrasena, 10);
    pool.query('INSERT INTO usuarios (nombre, correo, contrasena, celular, fecha_nacimiento, sexo, dui) VALUES (?, ?, ?, ?, ?, ?, ?)', [nombre, correo, haShedPass, celular, fecha_nacimiento, sexo, dui] , (err, results ) => {
        if(err){
            console.error('Error al crear usuario', err);
            return res.status(500).json({error: 'Error al crear usuario'})
        }
        res.status(201).json({message: 'Usuario creado exitosamente', id_usuario: results.insertId})
    } )
}catch(error){
    console.error('Error en el servidor', error);
    res.status(500).json({message: 'Error en el servidor'});
}
}