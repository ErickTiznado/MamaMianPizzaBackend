const pool = require('../config/db');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Server base URL for profile photos
const SERVER_BASE_URL = 'https://api.mamamianpizza.com';

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/profiles');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'profile-' + uniqueSuffix + ext);
    }
});

const uploadProfile = multer({ 
    storage: storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit for profile photos
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes para la foto de perfil'));
        }
    }
}).single('foto_perfil');


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
};

exports.getUserById = (req, res) => {
    const { id } = req.params;
    
    if (!id) {
        return res.status(400).json({ message: 'ID de usuario requerido' });
    }

    pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al obtener usuario por ID', err);
            return res.status(500).json({ error: 'Error al obtener usuario' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Remove password from response for security
        const user = results[0];
        delete user.contrasena;
        
        res.status(200).json(user);
    });
};

exports.updateUserProfile = async (req, res) => {
    uploadProfile(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ 
                message: 'Error al subir la foto de perfil: ' + err.message 
            });
        } else if (err) {
            return res.status(500).json({ 
                message: 'Error al subir la foto de perfil: ' + err.message 
            });
        }

        const { id } = req.params;
        const { nombre, correo, telefono } = req.body;
        
        if (!id) {
            return res.status(400).json({
                message: 'ID de usuario requerido'
            });
        }
        
        // Check if user exists
        pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id], (err, userResults) => {
            if (err) {
                console.error('Error al verificar usuario:', err);
                return res.status(500).json({
                    message: 'Error interno del servidor',
                    error: err.message
                });
            }
            
            if (userResults.length === 0) {
                return res.status(404).json({
                    message: 'Usuario no encontrado'
                });
            }
            
            const currentUser = userResults[0];
            
            // Prepare fields to update (only update provided fields)
            const fieldsToUpdate = {};
            const updateFields = [];
            const updateValues = [];
            
            if (nombre !== undefined && nombre !== null && nombre.trim() !== '') {
                fieldsToUpdate.nombre = nombre.trim();
                updateFields.push('nombre = ?');
                updateValues.push(nombre.trim());
            }
            
            if (correo !== undefined && correo !== null && correo.trim() !== '') {
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(correo.trim())) {
                    return res.status(400).json({
                        message: 'Formato de correo electrónico inválido'
                    });
                }
                
                // Check if email already exists for another user
                pool.query('SELECT id_usuario FROM usuarios WHERE correo = ? AND id_usuario != ?', [correo.trim(), id], (emailErr, emailResults) => {
                    if (emailErr) {
                        console.error('Error al verificar correo:', emailErr);
                        return res.status(500).json({
                            message: 'Error interno del servidor',
                            error: emailErr.message
                        });
                    }
                    
                    if (emailResults.length > 0) {
                        return res.status(409).json({
                            message: 'El correo electrónico ya está en uso por otro usuario'
                        });
                    }
                    
                    // Continue with the update process
                    continueUpdate();
                });
                
                fieldsToUpdate.correo = correo.trim();
                updateFields.push('correo = ?');
                updateValues.push(correo.trim());
            } else {
                // Continue immediately if no email update
                continueUpdate();
            }
            
            function continueUpdate() {
                if (telefono !== undefined && telefono !== null && telefono.trim() !== '') {
                    // Validate phone format (basic validation)
                    const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
                    if (!phoneRegex.test(telefono.trim())) {
                        return res.status(400).json({
                            message: 'Formato de teléfono inválido'
                        });
                    }
                    
                    fieldsToUpdate.telefono = telefono.trim();
                    updateFields.push('celular = ?');
                    updateValues.push(telefono.trim());
                }
                
                // Handle profile photo upload
                if (req.file) {
                    const fotoPerfilPath = `${SERVER_BASE_URL}/uploads/profiles/${req.file.filename}`;
                    fieldsToUpdate.foto_perfil = fotoPerfilPath;
                    updateFields.push('foto_perfil = ?');
                    updateValues.push(fotoPerfilPath);
                }
                
                // Check if there are fields to update
                if (updateFields.length === 0) {
                    return res.status(400).json({
                        message: 'No se proporcionaron campos válidos para actualizar',
                        campos_disponibles: ['nombre', 'correo', 'telefono', 'foto_perfil (archivo)']
                    });
                }
                
                // Add updated_at timestamp
                updateFields.push('updated_at = NOW()');
                updateValues.push(id);
                
                const updateQuery = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id_usuario = ?`;
                
                pool.query(updateQuery, updateValues, (updateErr, updateResults) => {
                    if (updateErr) {
                        console.error('Error al actualizar usuario:', updateErr);
                        return res.status(500).json({
                            message: 'Error al actualizar el perfil del usuario',
                            error: updateErr.message
                        });
                    }
                    
                    // Get updated user information
                    pool.query('SELECT id_usuario, nombre, correo, celular, foto_perfil, fecha_nacimiento, sexo, dui, created_at, updated_at FROM usuarios WHERE id_usuario = ?', [id], (selectErr, selectResults) => {
                        if (selectErr) {
                            console.error('Error al obtener usuario actualizado:', selectErr);
                            return res.status(500).json({
                                message: 'Perfil actualizado pero error al obtener datos actualizados',
                                error: selectErr.message
                            });
                        }
                        
                        const updatedUser = selectResults[0];
                        
                        res.status(200).json({
                            message: 'Perfil de usuario actualizado exitosamente',
                            campos_actualizados: Object.keys(fieldsToUpdate),
                            usuario: {
                                id_usuario: updatedUser.id_usuario,
                                nombre: updatedUser.nombre,
                                correo: updatedUser.correo,
                                telefono: updatedUser.celular,
                                foto_perfil: updatedUser.foto_perfil,
                                fecha_nacimiento: updatedUser.fecha_nacimiento,
                                sexo: updatedUser.sexo,
                                dui: updatedUser.dui,
                                fecha_creacion: updatedUser.created_at,
                                fecha_actualizacion: updatedUser.updated_at
                            }
                        });
                    });
                });
            }
        });
    });
};