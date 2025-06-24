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

exports.createAdmin = async (req, res) => {
    let connection;
    try {
        connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        const { nombre, correo, contrasena, rol, celular } = req.body;

        // Validaciones de campos requeridos
        if (!nombre || !correo || !contrasena || !rol) {
            await connection.rollback();
            return res.status(400).json({
                message: 'Los campos nombre, correo, contrasena y rol son requeridos',
                campos_requeridos: ['nombre', 'correo', 'contrasena', 'rol'],
                campos_opcionales: ['celular']
            });
        }

        // Validar roles permitidos
        const rolesPermitidos = ['super_admin', 'admin', 'moderador'];
        if (!rolesPermitidos.includes(rol)) {
            await connection.rollback();
            return res.status(400).json({
                message: 'Rol no válido',
                roles_permitidos: rolesPermitidos
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            await connection.rollback();
            return res.status(400).json({
                message: 'El formato del correo electrónico no es válido'
            });
        }

        // Verificar si el correo ya existe
        const [existingAdmin] = await connection.query(
            'SELECT id_admin FROM administradores WHERE correo = ?',
            [correo]
        );

        if (existingAdmin.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                message: 'Ya existe un administrador con este correo electrónico'
            });
        }

        // Validar fortaleza de contraseña
        if (contrasena.length < 8) {
            await connection.rollback();
            return res.status(400).json({
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        // Validar formato de celular (opcional)
        if (celular) {
            const celularRegex = /^(\+503\s?)?[67]\d{3}-?\d{4}$/;
            if (!celularRegex.test(celular)) {
                await connection.rollback();
                return res.status(400).json({
                    message: 'El formato del celular no es válido. Use: +503 7000-0000 o 70000000'
                });
            }
        }

        // Encriptar contraseña
        const saltRounds = 12; // Mayor seguridad para administradores
        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

        // Insertar nuevo administrador
        const [result] = await connection.query(`
            INSERT INTO administradores (nombre, correo, contrasena, rol, celular, fecha_creacion) 
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [nombre, correo, hashedPassword, rol, celular]);

        // Obtener el administrador creado
        const [newAdmin] = await connection.query(`
            SELECT 
                id_admin,
                nombre,
                correo,
                rol,
                celular,
                fecha_creacion
            FROM administradores 
            WHERE id_admin = ?
        `, [result.insertId]);

        await connection.commit();

        res.status(201).json({
            message: 'Administrador creado exitosamente',
            administrador: newAdmin[0]
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error al crear administrador:', error);
        res.status(500).json({
            message: 'Error al crear administrador',
            error: error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};


exports.loginAdmin = (req, res) =>{
    const {correo, contrasena} = req.body;    if(!correo || !contrasena){
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
            }            if(isMatch){
                // Update ultimo_acceso for the admin
                pool.query(
                    'UPDATE administradores SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id_admin = ?',
                    [admin.id_admin],
                    (updateErr) => {
                        if (updateErr) {
                            console.error('Error al actualizar ultimo_acceso del admin:', updateErr);
                        }
                    }
                );

                // Log successful admin login
                const descripcionLog = `Inicio de sesión exitoso del administrador: ${admin.nombre} (${admin.correo}) - Rol: ${admin.rol}`;
                pool.query(
                    'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
                    [admin.id_admin, 'LOGIN', 'administradores', descripcionLog],
                    (logErr) => {
                        if (logErr) {
                            console.error('Error al registrar login en logs:', logErr);
                        }
                    }
                );

                res.status(200).json({ 
                    success: true,
                    message: 'Inicio de sesion exitoso',
                    id_admin: admin.id_admin,
                    nombre: admin.nombre,
                    rol: admin.rol
                });

            }else {
                // Log failed admin login attempt
                const descripcionLogFail = `Intento de inicio de sesión fallido para administrador con correo: ${correo}`;
                pool.query(
                    'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
                    [null, 'LOGIN_FAILED', 'administradores', descripcionLogFail],
                    (logErr) => {
                        if (logErr) {
                            console.error('Error al registrar login fallido en logs:', logErr);
                        }
                    }
                );

                return res.status(401).json({message: 'Credenciales invalidas'});
            }
        }
    );
    })
};

exports.loginClient = (req, res) => {
    const {correo, contrasena} = req.body;    if(!correo || !contrasena){
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
            }            if(isMatch){
                // Update ultimo_acceso for the user
                pool.query(
                    'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id_usuario = ?',
                    [user.id_usuario],
                    (updateErr) => {
                        if (updateErr) {
                            console.error('Error al actualizar ultimo_acceso del usuario:', updateErr);
                        }
                    }
                );

                // Log successful user login
                const descripcionLog = `Inicio de sesión exitoso del usuario: ${user.nombre} (${user.correo})`;
                pool.query(
                    'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
                    [user.id_usuario, 'LOGIN', 'usuarios', descripcionLog],
                    (logErr) => {
                        if (logErr) {
                            console.error('Error al registrar login en logs:', logErr);
                        }
                    }
                );

                res.status(200).json({ 
                    success: true, 
                    message: 'Inicio de sesion exitoso',
                    id_usuario: user.id_usuario,
                    nombre: user.nombre
                });
            }
            else{
                // Log failed user login attempt
                const descripcionLogFail = `Intento de inicio de sesión fallido para usuario con correo: ${correo}`;
                pool.query(
                    'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
                    [null, 'LOGIN_FAILED', 'usuarios', descripcionLogFail],
                    (logErr) => {
                        if (logErr) {
                            console.error('Error al registrar login fallido en logs:', logErr);
                        }
                    }
                );

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
        const { nombre, correo, telefono, fecha_nacimiento, sexo } = req.body;
        
        if (!id) {
            return res.status(400).json({
                message: 'ID de usuario requerido'
            });
        }
        
        // Verificar que el usuario existe
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
                    const urlFoto = `${SERVER_BASE_URL}/uploads/profiles/${req.file.filename}`;
                    fieldsToUpdate.foto_perfil = urlFoto;
                    updateFields.push('foto_perfil = ?');
                    updateValues.push(urlFoto);
                }
                  // Check if there are fields to update
                if (updateFields.length === 0) {
                    return res.status(400).json({
                        message: 'No se proporcionaron campos válidos para actualizar',
                        campos_disponibles: ['nombre', 'correo', 'telefono', 'foto_perfil (archivo)']
                    });
                }
                
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
                    pool.query('SELECT id_usuario, nombre, correo, celular, foto_perfil, fecha_nacimiento, sexo, dui FROM usuarios WHERE id_usuario = ?', [id], (selectErr, selectResults) => {
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
                                dui: updatedUser.dui
                            }
                        });
                    });
                });
            }
        });
    });
};

// ========== ADMINISTRATOR MANAGEMENT ENDPOINTS ==========

/**
 * Obtener todos los administradores
 * GET /api/users/admins
 */
exports.getAllAdmins = async (req, res) => {
    try {
        const { page = 1, limit = 10, rol } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = 'WHERE 1=1';
        const queryParams = [];
        
        // Filtrar por rol si se especifica
        if (rol) {
            whereClause += ' AND rol = ?';
            queryParams.push(rol);
        }
        
        // Obtener administradores con paginación (SIN columna activo)
        const [admins] = await pool.promise().query(`
            SELECT *
            FROM administradores 
            ORDER BY fecha_creacion DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), parseInt(offset)]);
        
        // Obtener total de registros para paginación
        const [totalCount] = await pool.promise().query(`
            SELECT COUNT(*) as total 
            FROM administradores 
            ${whereClause}
        `, queryParams);
        
        const total = totalCount[0].total;
        const totalPages = Math.ceil(total / limit);
        
        res.status(200).json({
            message: 'Administradores obtenidos exitosamente',
            total: total,
            administradores: admins,
            paginacion: {
                pagina_actual: parseInt(page),
                total_paginas: totalPages,
                total_registros: total,
                registros_por_pagina: parseInt(limit),
                tiene_siguiente: page < totalPages,
                tiene_anterior: page > 1
            },
            filtros_aplicados: {
                rol: rol || 'todos'
            }
        });
        
    } catch (error) {
        console.error('Error al obtener administradores:', error);
        res.status(500).json({
            message: 'Error al obtener administradores',
            error: error.message
        });
    }
};

/**
 * Obtener administrador por ID
 * GET /api/users/admins/:id
 */
exports.getAdminById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar que el ID sea un número válido
        if (!id || isNaN(id)) {
            return res.status(400).json({
                message: 'ID de administrador no válido'
            });
        }
        
        const [admin] = await pool.promise().query(`
            SELECT 
                id_admin,
                nombre,
                correo,
                rol,
                celular,
                fecha_creacion,
                ultimo_acceso
            FROM administradores 
            WHERE id_admin = ?
        `, [id]);
        
        if (admin.length === 0) {
            return res.status(404).json({
                message: 'Administrador no encontrado'
            });
        }
        
        res.status(200).json({
            message: 'Administrador encontrado',
            administrador: admin[0]
        });
        
    } catch (error) {
        console.error('Error al obtener administrador:', error);
        res.status(500).json({
            message: 'Error al obtener administrador',
            error: error.message
        });
    }
};

/**
 * Actualizar administrador
 * PUT /api/admin/:id
 */
exports.updateAdmin = async (req, res) => {
    let connection;
    try {
        connection = await pool.promise().getConnection();
        await connection.beginTransaction();
        
        const { id } = req.params;
        const { nombre, correo, rol, celular } = req.body;
        
        // Validar que el ID sea un número válido
        if (!id || isNaN(id)) {
            await connection.rollback();
            return res.status(400).json({
                message: 'ID de administrador no válido'
            });
        }
        
        // Verificar que el administrador existe
        const [existingAdmin] = await connection.query(
            'SELECT id_admin, correo FROM administradores WHERE id_admin = ?',
            [id]
        );
        
        if (existingAdmin.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: 'Administrador no encontrado'
            });
        }
        
        // Validar al menos un campo para actualizar
        if (!nombre && !correo && !rol && !celular) {
            await connection.rollback();
            return res.status(400).json({
                message: 'Debe proporcionar al menos un campo para actualizar',
                campos_disponibles: ['nombre', 'correo', 'rol', 'celular']
            });
        }
        
        // Validar roles permitidos si se especifica
        if (rol) {
            const rolesPermitidos = ['super_admin', 'admin', 'moderador'];
            if (!rolesPermitidos.includes(rol)) {
                await connection.rollback();
                return res.status(400).json({
                    message: 'Rol no válido',
                    roles_permitidos: rolesPermitidos
                });
            }
        }
        
        // Validar formato de email si se especifica
        if (correo) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo)) {
                await connection.rollback();
                return res.status(400).json({
                    message: 'El formato del correo electrónico no es válido'
                });
            }
            
            // Verificar que el correo no esté en uso por otro administrador
            if (correo !== existingAdmin[0].correo) {
                const [emailExists] = await connection.query(
                    'SELECT id_admin FROM administradores WHERE correo = ? AND id_admin != ?',
                    [correo, id]
                );
                
                if (emailExists.length > 0) {
                    await connection.rollback();
                    return res.status(409).json({
                        message: 'El correo electrónico ya está en uso por otro administrador'
                    });
                }
            }
        }
        
        // Validar formato de celular si se especifica
        if (celular) {
            const celularRegex = /^(\+503\s?)?[67]\d{3}-?\d{4}$/;
            if (!celularRegex.test(celular)) {
                await connection.rollback();
                return res.status(400).json({
                    message: 'El formato del celular no es válido. Use: +503 7000-0000 o 70000000'
                });
            }
        }
        
        // Construir la consulta de actualización dinámicamente
        const fieldsToUpdate = {};
        const updateValues = [];
        
        if (nombre) {
            fieldsToUpdate.nombre = '?';
            updateValues.push(nombre);
        }
        if (correo) {
            fieldsToUpdate.correo = '?';
            updateValues.push(correo);
        }
        if (rol) {
            fieldsToUpdate.rol = '?';
            updateValues.push(rol);
        }
        if (celular !== undefined) {
            fieldsToUpdate.celular = '?';
            updateValues.push(celular);
        }
        
        const setClause = Object.keys(fieldsToUpdate)
            .map(field => `${field} = ?`)
            .join(', ');
        
        updateValues.push(id);
        
        // Ejecutar la actualización
        await connection.query(`
            UPDATE administradores 
            SET ${setClause}
            WHERE id_admin = ?
        `, updateValues);
          // Obtener el administrador actualizado (SIN columna activo)
        const [updatedAdmin] = await connection.query(`
            SELECT 
                id_admin,
                nombre,
                correo,
                rol,
                celular,
                fecha_creacion,
                ultimo_acceso
            FROM administradores 
            WHERE id_admin = ?
        `, [id]);
        
        await connection.commit();
        
        res.status(200).json({
            message: 'Administrador actualizado exitosamente',
            campos_actualizados: Object.keys(fieldsToUpdate),
            administrador: updatedAdmin[0]
        });
        
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error al actualizar administrador:', error);
        res.status(500).json({
            message: 'Error al actualizar administrador',
            error: error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * Eliminar administrador (hard delete únicamente)
 * DELETE /api/users/admins/:id
 */
exports.deleteAdmin = async (req, res) => {
    let connection;
    try {
        connection = await pool.promise().getConnection();
        await connection.beginTransaction();
        
        const { id } = req.params;
        
        // Validar que el ID sea un número válido
        if (!id || isNaN(id)) {
            await connection.rollback();
            return res.status(400).json({
                message: 'ID de administrador no válido'
            });
        }
        
        // Verificar que el administrador existe
        const [existingAdmin] = await connection.query(
            'SELECT id_admin, nombre, rol FROM administradores WHERE id_admin = ?',
            [id]
        );
        
        if (existingAdmin.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: 'Administrador no encontrado'
            });
        }
        
        const admin = existingAdmin[0];
        
        // Prevenir eliminación del último super_admin
        if (admin.rol === 'super_admin') {
            const [superAdminCount] = await connection.query(
                'SELECT COUNT(*) as count FROM administradores WHERE rol = "super_admin"'
            );
            
            if (superAdminCount[0].count <= 1) {
                await connection.rollback();
                return res.status(400).json({
                    message: 'No se puede eliminar el último super administrador del sistema'
                });
            }
        }
        
        // Eliminación permanente
        await connection.query('DELETE FROM administradores WHERE id_admin = ?', [id]);
        
        await connection.commit();
        
        res.status(200).json({
            message: 'Administrador eliminado permanentemente',
            administrador_eliminado: {
                id_admin: admin.id_admin,
                nombre: admin.nombre,
                rol: admin.rol
            }
        });
        
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error al eliminar administrador:', error);
        res.status(500).json({
            message: 'Error al eliminar administrador',
            error: error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * Obtener estadísticas de administradores
 * GET /api/users/admins/stats
 */
exports.getAdminStats = async (req, res) => {
    try {
        // Estadísticas generales (SIN columna activo)
        const [generalStats] = await pool.promise().query(`
            SELECT 
                COUNT(*) as total_administradores
            FROM administradores
        `);
        
        // Estadísticas por rol (SIN columna activo)
        const [roleStats] = await pool.promise().query(`
            SELECT 
                rol,
                COUNT(*) as total
            FROM administradores
            GROUP BY rol
            ORDER BY 
                CASE rol 
                    WHEN 'super_admin' THEN 1 
                    WHEN 'admin' THEN 2 
                    WHEN 'moderador' THEN 3 
                    ELSE 4 
                END
        `);
        
        // Últimos administradores creados
        const [recentAdmins] = await pool.promise().query(`
            SELECT 
                id_admin,
                nombre,
                rol,
                fecha_creacion
            FROM administradores
            ORDER BY fecha_creacion DESC
            LIMIT 5
        `);
        
        // Administradores con acceso reciente
        const [recentAccess] = await pool.promise().query(`
            SELECT 
                id_admin,
                nombre,
                rol,
                ultimo_acceso
            FROM administradores
            WHERE ultimo_acceso IS NOT NULL
            ORDER BY ultimo_acceso DESC
            LIMIT 5
        `);
        
        res.status(200).json({
            message: 'Estadísticas de administradores obtenidas exitosamente',
            estadisticas: {
                resumen_general: generalStats[0],
                distribucion_por_rol: roleStats,
                administradores_recientes: recentAdmins,
                accesos_recientes: recentAccess
            },
            generado_en: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error al obtener estadísticas de administradores:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas de administradores',
            error: error.message
        });
    }
};