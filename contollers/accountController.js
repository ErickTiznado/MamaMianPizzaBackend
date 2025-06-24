const pool = require('../config/db');
const bcrypt = require('bcrypt');

// ============================
// GESTIÓN DE CUENTAS DE USUARIO
// ============================

// Helper function to validate email format
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function to check if user exists and is active
const checkUserActiveStatus = async (userId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT id_usuario, nombre, correo, activo FROM usuarios WHERE id_usuario = ?',
            [userId],
            (err, results) => {
                if (err) {
                    return reject(err);
                }
                
                if (results.length === 0) {
                    return resolve({ exists: false, active: false, user: null });
                }
                
                const user = results[0];
                resolve({
                    exists: true,
                    active: user.activo === 1,
                    user: user
                });
            }
        );
    });
};

// ============================
// ENDPOINT PARA DESACTIVAR CUENTA DE USUARIO
// ============================

// Endpoint PUT /account/deactivate
exports.deactivateAccount = async (req, res) => {
    try {
        const { id_usuario, motivo } = req.body;
        
        // Validate input
        if (!id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario es requerido',
                campos_requeridos: ['id_usuario']
            });
        }
        
        // Validate user ID format (should be a positive integer)
        if (!Number.isInteger(Number(id_usuario)) || Number(id_usuario) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }
        
        // Check if user exists
        pool.query(
            'SELECT id_usuario, nombre, correo, activo FROM usuarios WHERE id_usuario = ?',
            [id_usuario],
            (err, userResults) => {
                if (err) {
                    console.error('Error al buscar usuario:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error interno del servidor',
                        error: err.message
                    });
                }
                
                if (userResults.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado'
                    });
                }
                
                const user = userResults[0];
                
                // Check if account is already deactivated
                if (user.activo === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'La cuenta ya está desactivada'
                    });
                }
                
                // Deactivate the account
                pool.query(
                    'UPDATE usuarios SET activo = 0 WHERE id_usuario = ?',
                    [id_usuario],
                    (updateErr, updateResults) => {
                        if (updateErr) {
                            console.error('Error al desactivar cuenta:', updateErr);
                            return res.status(500).json({
                                success: false,
                                message: 'Error al desactivar la cuenta',
                                error: updateErr.message
                            });
                        }
                        
                        if (updateResults.affectedRows === 0) {
                            return res.status(404).json({
                                success: false,
                                message: 'No se pudo desactivar la cuenta'
                            });
                        }
                        
                        // Log the deactivation (optional)
                        const logMotivo = motivo || 'Desactivación solicitada por el usuario';
                        pool.query(
                            'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
                            [id_usuario, 'DESACTIVAR_CUENTA', 'usuarios', `Cuenta desactivada. Motivo: ${logMotivo}`],
                            (logErr) => {
                                if (logErr) {
                                    console.error('Error al registrar log:', logErr);
                                }
                            }
                        );
                        
                        res.status(200).json({
                            success: true,
                            message: 'Cuenta desactivada exitosamente',
                            usuario: {
                                id: user.id_usuario,
                                nombre: user.nombre,
                                correo: user.correo,
                                activo: false
                            },
                            motivo: motivo || 'No especificado',
                            timestamp: new Date().toISOString()
                        });
                    }
                );
            }
        );
        
    } catch (error) {
        console.error('Error en deactivateAccount:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// ============================
// ENDPOINT PARA REACTIVAR CUENTA DE USUARIO
// ============================

// Endpoint PUT /account/activate
exports.activateAccount = async (req, res) => {
    try {
        const { id_usuario, motivo } = req.body;
        
        // Validate input
        if (!id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario es requerido',
                campos_requeridos: ['id_usuario']
            });
        }
        
        // Validate user ID format
        if (!Number.isInteger(Number(id_usuario)) || Number(id_usuario) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }
        
        // Check if user exists
        pool.query(
            'SELECT id_usuario, nombre, correo, activo FROM usuarios WHERE id_usuario = ?',
            [id_usuario],
            (err, userResults) => {
                if (err) {
                    console.error('Error al buscar usuario:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error interno del servidor',
                        error: err.message
                    });
                }
                
                if (userResults.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado'
                    });
                }
                
                const user = userResults[0];
                
                // Check if account is already active
                if (user.activo === 1) {
                    return res.status(400).json({
                        success: false,
                        message: 'La cuenta ya está activa'
                    });
                }
                
                // Activate the account
                pool.query(
                    'UPDATE usuarios SET activo = 1 WHERE id_usuario = ?',
                    [id_usuario],
                    (updateErr, updateResults) => {
                        if (updateErr) {
                            console.error('Error al activar cuenta:', updateErr);
                            return res.status(500).json({
                                success: false,
                                message: 'Error al activar la cuenta',
                                error: updateErr.message
                            });
                        }
                        
                        if (updateResults.affectedRows === 0) {
                            return res.status(404).json({
                                success: false,
                                message: 'No se pudo activar la cuenta'
                            });
                        }
                        
                        // Log the activation
                        const logMotivo = motivo || 'Reactivación solicitada';
                        pool.query(
                            'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
                            [id_usuario, 'ACTIVAR_CUENTA', 'usuarios', `Cuenta reactivada. Motivo: ${logMotivo}`],
                            (logErr) => {
                                if (logErr) {
                                    console.error('Error al registrar log:', logErr);
                                }
                            }
                        );
                        
                        res.status(200).json({
                            success: true,
                            message: 'Cuenta activada exitosamente',
                            usuario: {
                                id: user.id_usuario,
                                nombre: user.nombre,
                                correo: user.correo,
                                activo: true
                            },
                            motivo: motivo || 'No especificado',
                            timestamp: new Date().toISOString()
                        });
                    }
                );
            }
        );
        
    } catch (error) {
        console.error('Error en activateAccount:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// ============================
// ENDPOINT PARA VERIFICAR ESTADO DE CUENTA
// ============================

// Endpoint GET /account/status/:id_usuario
exports.getAccountStatus = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        
        // Validate user ID format
        if (!Number.isInteger(Number(id_usuario)) || Number(id_usuario) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }
        
        // Get user status
        pool.query(
            'SELECT id_usuario, nombre, correo, activo FROM usuarios WHERE id_usuario = ?',
            [id_usuario],
            (err, userResults) => {
                if (err) {
                    console.error('Error al buscar usuario:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error interno del servidor',
                        error: err.message
                    });
                }
                
                if (userResults.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado'
                    });
                }
                
                const user = userResults[0];
                
                res.status(200).json({
                    success: true,
                    usuario: {
                        id: user.id_usuario,
                        nombre: user.nombre,
                        correo: user.correo,
                        activo: user.activo === 1,
                        estado: user.activo === 1 ? 'Activa' : 'Desactivada'
                    }
                });
            }
        );
        
    } catch (error) {
        console.error('Error en getAccountStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// ============================
// FUNCIÓN PARA VALIDAR LOGIN SOLO CUENTAS ACTIVAS
// ============================

// Function to validate login with active account check
exports.validateLoginActiveAccount = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        
        // Validate input
        if (!correo || !contrasena) {
            return res.status(400).json({
                success: false,
                message: 'Correo electrónico y contraseña son requeridos',
                campos_requeridos: ['correo', 'contrasena']
            });
        }
        
        // Validate email format
        if (!validateEmail(correo)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de correo electrónico inválido'
            });
        }
        
        // Find user and check if account is active
        pool.query(
            'SELECT id_usuario, nombre, correo, contrasena, activo FROM usuarios WHERE correo = ?',
            [correo],
            async (err, userResults) => {
                if (err) {
                    console.error('Error al buscar usuario:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error interno del servidor',
                        error: err.message
                    });
                }
                
                if (userResults.length === 0) {
                    return res.status(401).json({
                        success: false,
                        message: 'Credenciales inválidas'
                    });
                }
                
                const user = userResults[0];
                
                // Check if account is active
                if (user.activo === 0) {
                    return res.status(403).json({
                        success: false,
                        message: 'Tu cuenta ha sido desactivada. Contacta al administrador para más información.',
                        codigo_error: 'ACCOUNT_DEACTIVATED'
                    });
                }
                
                // Verify password
                try {
                    const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);
                    
                    if (!isPasswordValid) {
                        return res.status(401).json({
                            success: false,
                            message: 'Credenciales inválidas'
                        });
                    }
                    
                    // Successful login
                    res.status(200).json({
                        success: true,
                        message: 'Inicio de sesión exitoso',
                        usuario: {
                            id: user.id_usuario,
                            nombre: user.nombre,
                            correo: user.correo,
                            activo: true
                        },
                        timestamp: new Date().toISOString()
                    });
                    
                } catch (bcryptError) {
                    console.error('Error al verificar contraseña:', bcryptError);
                    return res.status(500).json({
                        success: false,
                        message: 'Error al verificar credenciales',
                        error: bcryptError.message
                    });
                }
            }
        );
        
    } catch (error) {
        console.error('Error en validateLoginActiveAccount:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// ============================
// ENDPOINT PARA LISTAR USUARIOS Y SU ESTADO
// ============================

// Endpoint GET /account/list
exports.listUsersWithStatus = async (req, res) => {
    try {
        const { page = 1, limit = 10, activo } = req.query;
        
        // Calculate offset for pagination
        const offset = (page - 1) * limit;
        
        // Build query based on activo filter
        let query = 'SELECT id_usuario, nombre, correo, celular, activo FROM usuarios';
        let countQuery = 'SELECT COUNT(*) as total FROM usuarios';
        let queryParams = [];
        
        if (activo !== undefined) {
            const isActive = activo === '1' || activo === 'true';
            query += ' WHERE activo = ?';
            countQuery += ' WHERE activo = ?';
            queryParams.push(isActive ? 1 : 0);
        }
        
        query += ' ORDER BY id_usuario DESC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), parseInt(offset));
        
        // Get total count
        pool.query(countQuery, activo !== undefined ? [queryParams[0]] : [], (countErr, countResults) => {
            if (countErr) {
                console.error('Error al contar usuarios:', countErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    error: countErr.message
                });
            }
            
            const total = countResults[0].total;
            
            // Get users
            pool.query(query, queryParams, (err, userResults) => {
                if (err) {
                    console.error('Error al obtener usuarios:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error interno del servidor',
                        error: err.message
                    });
                }
                
                const usuarios = userResults.map(user => ({
                    id: user.id_usuario,
                    nombre: user.nombre,
                    correo: user.correo,
                    celular: user.celular,
                    activo: user.activo === 1,
                    estado: user.activo === 1 ? 'Activa' : 'Desactivada'
                }));
                
                res.status(200).json({
                    success: true,
                    usuarios: usuarios,
                    paginacion: {
                        pagina_actual: parseInt(page),
                        total_paginas: Math.ceil(total / limit),
                        total_usuarios: total,
                        usuarios_por_pagina: parseInt(limit)
                    }
                });
            });
        });
        
    } catch (error) {
        console.error('Error en listUsersWithStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = exports;
