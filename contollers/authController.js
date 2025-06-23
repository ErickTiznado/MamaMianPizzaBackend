const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createTransporter, validateEmailConfig } = require('../config/emailConfig');
const { templatePasswordReset, templatePasswordChanged, templatePasswordResetAdmin, templatePasswordChangedAdmin } = require('../config/emailTemplates');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'mama_mian_pizza_jwt_secret_2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_ADMIN_EXPIRES_IN = process.env.JWT_ADMIN_EXPIRES_IN || '8h';

// Generate JWT token for regular users (temporary solution)
const generateUserToken = (userId) => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2);
    return Buffer.from(`${userId}:${timestamp}:${randomPart}`).toString('base64');
};

// Generate JWT token for administrators
const generateJWTToken = (adminId, adminEmail, adminNombre, expiresIn = JWT_ADMIN_EXPIRES_IN) => {
    const payload = {
        id: adminId,
        email: adminEmail,
        nombre: adminNombre,
        type: 'admin',
        iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: expiresIn,
        issuer: 'MamaMianPizza',
        audience: 'admin'
    });
};

// Generate temporary JWT for password reset (shorter expiration)
const generateResetJWTToken = (adminId, purpose = 'password_reset') => {
    const payload = {
        id: adminId,
        purpose: purpose,
        type: 'admin_reset',
        iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '15m', // 15 minutes for password reset
        issuer: 'MamaMianPizza',
        audience: 'admin_reset'
    });
};

// Validate JWT token
const validateJWTToken = (token, expectedAudience = 'admin') => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'MamaMianPizza',
            audience: expectedAudience
        });
        
        return {
            valid: true,
            data: decoded
        };
    } catch (error) {
        let errorType = 'INVALID_TOKEN';
        
        if (error.name === 'TokenExpiredError') {
            errorType = 'TOKEN_EXPIRED';
        } else if (error.name === 'JsonWebTokenError') {
            errorType = 'MALFORMED_TOKEN';
        } else if (error.name === 'NotBeforeError') {
            errorType = 'TOKEN_NOT_ACTIVE';
        }
        
        return {
            valid: false,
            error: errorType,
            message: error.message
        };
    }
};

// Simple token generation (temporary solution without JWT for regular users)
const generateSimpleToken = (userId) => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2);
    return Buffer.from(`${userId}:${timestamp}:${randomPart}`).toString('base64');
};

// Validate simple token
const validateSimpleToken = (token) => {
    try {
        const decoded = Buffer.from(token, 'base64').toString();
        const [userId, timestamp, randomPart] = decoded.split(':');
        const tokenAge = Date.now() - parseInt(timestamp);
        
        // Token expires after 15 minutes (900000 ms)
        if (tokenAge > 900000) {
            return null;
        }
        
        return { id_usuario: parseInt(userId) };
    } catch (error) {
        return null;
    }
};

// Helper function to generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to validate email format
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function to send email
const enviarCorreo = async (email, nombre, otp, tipoCorreo = 'password_reset') => {
    try {
        // Validar configuración
        validateEmailConfig();
        
        // Crear transporter
        const transporter = createTransporter();
        
        // Configurar opciones del correo según el tipo
        let mailOptions;
        
        if (tipoCorreo === 'password_reset') {
            mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Mama Mian Pizza',
                    address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
                },
                to: email,
                subject: '🔐 Código de Verificación - Mama Mian Pizza',
                html: templatePasswordReset(nombre, otp, 10),
                // Versión texto plano como fallback
                text: `
Hola ${nombre},

Tu código de verificación para restablecer tu contraseña es: ${otp}

Este código es válido por 10 minutos.
No compartas este código con nadie.

Si no solicitaste este código, ignora este correo.

Saludos,
Equipo de Mama Mian Pizza
                `.trim()
            };
        } else if (tipoCorreo === 'password_changed') {
            mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Mama Mian Pizza',
                    address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
                },
                to: email,
                subject: '✅ Contraseña Actualizada - Mama Mian Pizza',
                html: templatePasswordChanged(nombre),
                text: `
Hola ${nombre},

Tu contraseña ha sido cambiada exitosamente.

Si no realizaste este cambio, contacta inmediatamente a nuestro equipo de soporte.

Saludos,
Equipo de Mama Mian Pizza
                `.trim()
            };
        } else if (tipoCorreo === 'password_reset_admin') {
            mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Mama Mian Pizza',
                    address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
                },
                to: email,
                subject: '🔐 Código de Verificación de Admin - Mama Mian Pizza',
                html: templatePasswordResetAdmin(nombre, otp, 10),
                // Versión texto plano como fallback
                text: `
Hola ${nombre},

Tu código de verificación para restablecer la contraseña de admin es: ${otp}

Este código es válido por 10 minutos.
No compartas este código con nadie.

Si no solicitaste este código, ignora este correo.

Saludos,
Equipo de Mama Mian Pizza
                `.trim()
            };
        } else if (tipoCorreo === 'password_changed_admin') {
            mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Mama Mian Pizza',
                    address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
                },
                to: email,
                subject: '✅ Contraseña de Admin Actualizada - Mama Mian Pizza',
                html: templatePasswordChangedAdmin(nombre),
                text: `
Hola ${nombre},

La contraseña de admin ha sido cambiada exitosamente.

Si no realizaste este cambio, contacta inmediatamente a nuestro equipo de soporte.

Saludos,
Equipo de Mama Mian Pizza
                `.trim()
            };
        }
        
        // Enviar correo
        const info = await transporter.sendMail(mailOptions);
        
        // Log de éxito con información detallada
        console.log(`✅ Correo enviado exitosamente:`);
        console.log(`   📧 Destinatario: ${email}`);
        console.log(`   📝 Tipo: ${tipoCorreo}`);
        console.log(`   🆔 Message ID: ${info.messageId}`);
        console.log(`   📊 Response: ${info.response}`);
        
        return {
            success: true,
            messageId: info.messageId,
            response: info.response
        };
        
    } catch (error) {
        console.error('❌ Error enviando correo:');
        console.error(`   📧 Destinatario: ${email}`);
        console.error(`   📝 Tipo: ${tipoCorreo}`);
        console.error(`   ⚠️  Error: ${error.message}`);
        
        // Log detallado para debugging
        if (error.code) {
            console.error(`   🔧 Código de error: ${error.code}`);
        }
        if (error.command) {
            console.error(`   📡 Comando: ${error.command}`);
        }
        
        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
};

// ============================
// SISTEMA DE RESTABLECIMIENTO PARA ADMINISTRADORES
// ============================

// Helper function to send email for admins
const enviarCorreoAdmin = async (email, nombre, otp, tipoCorreo = 'password_reset') => {
    try {
        // Validar configuración
        validateEmailConfig();
        
        // Crear transporter
        const transporter = createTransporter();
        
        // Configurar opciones del correo según el tipo
        let mailOptions;
        
        if (tipoCorreo === 'password_reset') {
            mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Mama Mian Pizza Admin',
                    address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
                },
                to: email,
                subject: '🔐 Código Admin - Restablecimiento de Contraseña',
                html: templatePasswordResetAdmin(nombre, otp, 10),
                // Versión texto plano como fallback
                text: `
ADMINISTRADOR - Código de Verificación

Hola ${nombre},

Tu código de verificación de administrador para restablecer tu contraseña es: ${otp}

Este código es válido por 10 minutos.
No compartas este código con nadie.

Si no solicitaste este código, contacta inmediatamente al administrador principal.

Saludos,
Sistema de Administración - Mama Mian Pizza
                `.trim()
            };
        } else if (tipoCorreo === 'password_changed') {
            mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Mama Mian Pizza Admin',
                    address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
                },
                to: email,
                subject: '✅ Contraseña Admin Actualizada - Mama Mian Pizza',
                html: templatePasswordChangedAdmin(nombre),
                text: `
ADMINISTRADOR - Contraseña Actualizada

Hola ${nombre},

Tu contraseña de administrador ha sido cambiada exitosamente.

Si no realizaste este cambio, contacta inmediatamente al administrador principal.

Saludos,
Sistema de Administración - Mama Mian Pizza
                `.trim()
            };
        }
        
        // Enviar correo
        const info = await transporter.sendMail(mailOptions);
        
        // Log de éxito con información detallada
        console.log(`✅ Correo ADMIN enviado exitosamente:`);
        console.log(`   📧 Destinatario: ${email}`);
        console.log(`   📝 Tipo: ${tipoCorreo}`);
        console.log(`   🆔 Message ID: ${info.messageId}`);
        console.log(`   📊 Response: ${info.response}`);
        
        return {
            success: true,
            messageId: info.messageId,
            response: info.response
        };
        
    } catch (error) {
        console.error('❌ Error enviando correo ADMIN:');
        console.error(`   📧 Destinatario: ${email}`);
        console.error(`   📝 Tipo: ${tipoCorreo}`);
        console.error(`   ⚠️  Error: ${error.message}`);
        
        // Log detallado para debugging
        if (error.code) {
            console.error(`   🔧 Código de error: ${error.code}`);
        }
        if (error.command) {
            console.error(`   📡 Comando: ${error.command}`);
        }
        
        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
};

// Endpoint POST /auth/request-reset
exports.requestPasswordReset = async (req, res) => {
    try {
        const { correo } = req.body;
        
        // Validate input
        if (!correo) {
            return res.status(400).json({
                message: 'Correo electrónico es requerido'
            });
        }
        
        // Validate email format
        if (!validateEmail(correo)) {
            return res.status(400).json({
                message: 'Formato de correo electrónico inválido'
            });
        }
        
        // Check if user exists with this email
        pool.query(
            'SELECT id_usuario, nombre, correo FROM usuarios WHERE correo = ?',
            [correo],
            async (err, userResults) => {
                if (err) {
                    console.error('Error al buscar usuario:', err);
                    return res.status(500).json({
                        message: 'Error interno del servidor',
                        error: err.message
                    });
                }
                
                if (userResults.length === 0) {
                    return res.status(404).json({
                        message: 'No se encontró un usuario con este correo electrónico'
                    });
                }
                
                const user = userResults[0];
                const otp = generateOTP();
                const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
                
                // Delete any existing password reset for this user
                pool.query(
                    'DELETE FROM password_reset WHERE user_id = ? AND user_type = ?',
                    [user.id_usuario, 'usuario'],
                    (deleteErr) => {
                        if (deleteErr) {
                            console.error('Error al limpiar código existente:', deleteErr);
                        }
                        
                        // Insert new password reset code
                        pool.query(
                            'INSERT INTO password_reset (user_id, user_type, reset_code, expiracion, used) VALUES (?, ?, ?, ?, ?)',
                            [user.id_usuario, 'usuario', otp, expiresAt, 0],
                            async (insertErr) => {
                                if (insertErr) {
                                    console.error('Error al guardar código de restablecimiento:', insertErr);
                                    return res.status(500).json({
                                        message: 'Error al generar código de verificación',
                                        error: insertErr.message
                                    });
                                }                                // Enviar código por correo electrónico
                                try {
                                    console.log(`📧 Enviando código de verificación a: ${user.correo}`);
                                    const resultadoCorreo = await enviarCorreo(user.correo, user.nombre, otp, 'password_reset');
                                    
                                    if (resultadoCorreo.success) {
                                        res.status(200).json({
                                            success: true,
                                            message: 'Código de verificación enviado a tu correo electrónico',
                                            correo: user.correo.replace(/(.{2}).*@/, '$1***@'), // Mask email
                                            validez_minutos: 10,
                                            timestamp: new Date().toISOString()
                                        });
                                    } else {
                                        // Si falla el envío del correo, eliminar el código de la BD
                                        pool.query('DELETE FROM password_reset WHERE user_id = ? AND user_type = ?', 
                                            [user.id_usuario, 'usuario']);
                                        
                                        return res.status(500).json({
                                            success: false,
                                            message: 'Error al enviar el correo de verificación',
                                            error: 'Servicio de correo no disponible',
                                            details: resultadoCorreo.error
                                        });
                                    }
                                    
                                } catch (emailError) {
                                    console.error('Error crítico al enviar correo:', emailError);
                                    
                                    // Delete the reset code if email failed
                                    pool.query('DELETE FROM password_reset WHERE user_id = ? AND user_type = ?', 
                                        [user.id_usuario, 'usuario']);
                                    
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Error al enviar código de verificación',
                                        error: 'Error interno del servidor',
                                        details: emailError.message
                                    });
                                }
                            });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error en requestPasswordReset:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Endpoint POST /auth/verify-reset
exports.verifyResetOTP = async (req, res) => {
    try {
        const { correo, otp } = req.body;
        
        // Validate input
        if (!correo || !otp) {
            return res.status(400).json({
                message: 'Correo electrónico y código OTP son requeridos'
            });
        }
        
        // Validate email format
        if (!validateEmail(correo)) {
            return res.status(400).json({
                message: 'Formato de correo electrónico inválido'
            });
        }
        
        // Validate OTP format (6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                message: 'El código OTP debe tener 6 dígitos'
            });
        }
          // Find user and verify reset code
        pool.query(`
            SELECT u.id_usuario, u.nombre, pr.reset_code, pr.expiracion
            FROM usuarios u
            JOIN password_reset pr ON u.id_usuario = pr.user_id
            WHERE u.correo = ?
            AND pr.reset_code = ?
            AND pr.expiracion > NOW()
            AND pr.used = 0
            AND pr.user_type = 'usuario'
        `, [correo, otp], (err, results) => {
            if (err) {
                console.error('Error al verificar código de restablecimiento:', err);
                return res.status(500).json({
                    message: 'Error interno del servidor',
                    error: err.message
                });
            }
            
            if (results.length === 0) {
                return res.status(400).json({
                    message: 'Código inválido o expirado'
                });
            }
            
            const user = results[0];
            
            // Generate temporary token for password reset (15 minutes)
            const resetToken = generateSimpleToken(user.id_usuario);
            
            // Mark reset code as used
            pool.query(
                'UPDATE password_reset SET used = 1 WHERE user_id = ? AND reset_code = ? AND user_type = ?',
                [user.id_usuario, otp, 'usuario'],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Error al marcar código como usado:', updateErr);
                    }
                }
            );
            
            res.status(200).json({
                message: 'Código verificado correctamente',
                token: resetToken,
                expires_in: '15 minutos'
            });
        });
        
    } catch (error) {
        console.error('Error en verifyResetOTP:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Endpoint PUT /auth/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const { token, nuevaContrasena } = req.body;
        
        // Validate input
        if (!token || !nuevaContrasena) {
            return res.status(400).json({
                message: 'Token y nueva contraseña son requeridos'
            });
        }
        
        // Validate password strength
        if (nuevaContrasena.length < 8) {
            return res.status(400).json({
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }
          // Verify and decode token
        const decoded = validateSimpleToken(token);
        if (!decoded) {
            return res.status(401).json({
                message: 'Token inválido o expirado'
            });
        }
        
        const userId = decoded.id_usuario;
        
        // Hash new password
        const saltRounds = 12; // Increased from 10 for better security
        const hashedPassword = await bcrypt.hash(nuevaContrasena, saltRounds);
        
        // Update user password
        pool.query(
            'UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?',
            [hashedPassword, userId],
            (updateErr, updateResults) => {
                if (updateErr) {
                    console.error('Error al actualizar contraseña:', updateErr);
                    return res.status(500).json({
                        message: 'Error al actualizar la contraseña',
                        error: updateErr.message
                    });
                }
                
                if (updateResults.affectedRows === 0) {
                    return res.status(404).json({
                        message: 'Usuario no encontrado'
                    });
                }
                  // Delete/invalidate all password reset codes for this user
                pool.query(
                    'DELETE FROM password_reset WHERE user_id = ? AND user_type = ?',
                    [userId, 'usuario'],
                    (deleteErr) => {
                        if (deleteErr) {
                            console.error('Error al limpiar códigos de restablecimiento:', deleteErr);
                        }
                    }
                );
                  // Get user info for response and send confirmation email
                pool.query(
                    'SELECT nombre, correo FROM usuarios WHERE id_usuario = ?',
                    [userId],
                    async (selectErr, userResults) => {
                        if (selectErr) {
                            console.error('Error al obtener datos del usuario:', selectErr);
                        }
                        
                        const userName = userResults && userResults.length > 0 
                            ? userResults[0].nombre 
                            : 'Usuario';
                        
                        const userEmail = userResults && userResults.length > 0 
                            ? userResults[0].correo 
                            : null;
                        
                        // Enviar correo de confirmación (opcional, no debe bloquear la respuesta)
                        if (userEmail) {
                            try {
                                console.log(`📧 Enviando confirmación de cambio de contraseña a: ${userEmail}`);
                                const resultadoConfirmacion = await enviarCorreo(userEmail, userName, null, 'password_changed');
                                
                                if (resultadoConfirmacion.success) {
                                    console.log(`✅ Correo de confirmación enviado exitosamente`);
                                } else {
                                    console.error(`❌ Error enviando confirmación: ${resultadoConfirmacion.error}`);
                                }
                            } catch (confirmationError) {
                                console.error('Error al enviar correo de confirmación:', confirmationError.message);
                                // No afecta la respuesta principal
                            }
                        }
                        
                        res.status(200).json({
                            success: true,
                            message: 'Contraseña restablecida exitosamente',
                            usuario: userName,
                            timestamp: new Date().toISOString(),
                            correo_confirmacion: userEmail ? 'enviado' : 'no_disponible'
                        });
                    }
                );
            }
        );
        
    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Endpoint POST /admin/request-reset
exports.requestPasswordResetAdmin = async (req, res) => {
    try {
        const { correo } = req.body;
        
        // Validate input
        if (!correo) {
            return res.status(400).json({
                message: 'Correo electrónico es requerido'
            });
        }
        
        // Validate email format
        if (!validateEmail(correo)) {
            return res.status(400).json({
                message: 'Formato de correo electrónico inválido'
            });
        }
        
        // Check if admin exists with this email
        pool.query(
            'SELECT id_admin, nombre, correo FROM administradores WHERE correo = ?',
            [correo],
            async (err, adminResults) => {
                if (err) {
                    console.error('Error al buscar administrador:', err);
                    return res.status(500).json({
                        message: 'Error interno del servidor',
                        error: err.message
                    });
                }
                
                if (adminResults.length === 0) {
                    return res.status(404).json({
                        message: 'No se encontró un administrador con este correo electrónico'
                    });
                }
                
                const admin = adminResults[0];
                const otp = generateOTP();
                const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
                
                // Delete any existing password reset for this admin
                pool.query(
                    'DELETE FROM password_reset WHERE user_id = ? AND user_type = ?',
                    [admin.id_admin, 'administrador'],
                    (deleteErr) => {
                        if (deleteErr) {
                            console.error('Error al limpiar código existente:', deleteErr);
                        }
                        
                        // Insert new password reset code
                        pool.query(
                            'INSERT INTO password_reset (user_id, user_type, reset_code, expiracion, used) VALUES (?, ?, ?, ?, ?)',
                            [admin.id_admin, 'administrador', otp, expiresAt, 0],
                            async (insertErr) => {
                                if (insertErr) {
                                    console.error('Error al guardar código de restablecimiento:', insertErr);
                                    return res.status(500).json({
                                        message: 'Error al generar código de verificación',
                                        error: insertErr.message
                                    });
                                }
                                
                                // Enviar código por correo electrónico
                                try {
                                    console.log(`📧 Enviando código de verificación ADMIN a: ${admin.correo}`);
                                    const resultadoCorreo = await enviarCorreoAdmin(admin.correo, admin.nombre, otp, 'password_reset');
                                    
                                    if (resultadoCorreo.success) {
                                        res.status(200).json({
                                            success: true,
                                            message: 'Código de verificación de administrador enviado a tu correo electrónico',
                                            correo: admin.correo.replace(/(.{2}).*@/, '$1***@'), // Mask email
                                            validez_minutos: 10,
                                            timestamp: new Date().toISOString(),
                                            tipo_usuario: 'administrador'
                                        });
                                    } else {
                                        // Si falla el envío del correo, eliminar el código de la BD
                                        pool.query('DELETE FROM password_reset WHERE user_id = ? AND user_type = ?', 
                                            [admin.id_admin, 'administrador']);
                                        
                                        return res.status(500).json({
                                            success: false,
                                            message: 'Error al enviar el correo de verificación',
                                            error: 'Servicio de correo no disponible',
                                            details: resultadoCorreo.error
                                        });
                                    }
                                    
                                } catch (emailError) {
                                    console.error('Error crítico al enviar correo ADMIN:', emailError);
                                    
                                    // Delete the reset code if email failed
                                    pool.query('DELETE FROM password_reset WHERE user_id = ? AND user_type = ?', 
                                        [admin.id_admin, 'administrador']);
                                    
                                    return res.status(500).json({
                                        success: false,
                                        message: 'Error al enviar código de verificación',
                                        error: 'Error interno del servidor',
                                        details: emailError.message
                                    });
                                }
                            });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Error en requestPasswordResetAdmin:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Endpoint POST /admin/verify-reset
exports.verifyResetOTPAdmin = async (req, res) => {
    try {
        const { correo, otp } = req.body;
        
        // Validate input
        if (!correo || !otp) {
            return res.status(400).json({
                message: 'Correo electrónico y código OTP son requeridos'
            });
        }
        
        // Validate email format
        if (!validateEmail(correo)) {
            return res.status(400).json({
                message: 'Formato de correo electrónico inválido'
            });
        }
        
        // Validate OTP format (6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                message: 'El código OTP debe tener 6 dígitos'
            });
        }
        
        // Find admin and verify reset code
        pool.query(`
            SELECT a.id_admin, a.nombre, pr.reset_code, pr.expiracion
            FROM administradores a
            JOIN password_reset pr ON a.id_admin = pr.user_id
            WHERE a.correo = ?
            AND pr.reset_code = ?
            AND pr.expiracion > NOW()
            AND pr.used = 0
            AND pr.user_type = 'administrador'
        `, [correo, otp], (err, results) => {
            if (err) {
                console.error('Error al verificar código de restablecimiento ADMIN:', err);
                return res.status(500).json({
                    message: 'Error interno del servidor',
                    error: err.message
                });
            }
            
            if (results.length === 0) {
                return res.status(400).json({
                    message: 'Código inválido o expirado'
                });
            }
              const admin = results[0];
            
            // Generate JWT token for password reset (15 minutes)
            const resetToken = generateResetJWTToken(admin.id_admin, 'password_reset');
            
            // Mark reset code as used
            pool.query(
                'UPDATE password_reset SET used = 1 WHERE user_id = ? AND reset_code = ? AND user_type = ?',
                [admin.id_admin, otp, 'administrador'],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Error al marcar código ADMIN como usado:', updateErr);
                    }
                }
            );
            
            res.status(200).json({
                message: 'Código de administrador verificado correctamente',
                token: resetToken,
                expires_in: '15 minutos',
                tipo_usuario: 'administrador',
                token_type: 'JWT'
            });
        });
        
    } catch (error) {
        console.error('Error en verifyResetOTPAdmin:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Endpoint PUT /admin/reset-password
exports.resetPasswordAdmin = async (req, res) => {
    try {
        const { token, nuevaContrasena } = req.body;
        
        // Validate input
        if (!token || !nuevaContrasena) {
            return res.status(400).json({
                message: 'Token y nueva contraseña son requeridos'
            });
        }
        
        // Validate password strength
        if (nuevaContrasena.length < 8) {
            return res.status(400).json({
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }
          // Verify and decode JWT token
        const tokenValidation = validateJWTToken(token, 'admin_reset');
        if (!tokenValidation.valid) {
            let errorMessage = 'Token inválido o expirado';
            
            if (tokenValidation.error === 'TOKEN_EXPIRED') {
                errorMessage = 'El token de restablecimiento ha expirado. Solicita un nuevo código.';
            } else if (tokenValidation.error === 'MALFORMED_TOKEN') {
                errorMessage = 'Token malformado. Solicita un nuevo código.';
            }
            
            return res.status(401).json({
                message: errorMessage,
                error_type: tokenValidation.error
            });
        }
        
        const decoded = tokenValidation.data;
        
        // Verify token purpose
        if (decoded.purpose !== 'password_reset' || decoded.type !== 'admin_reset') {
            return res.status(401).json({
                message: 'Token no válido para restablecimiento de contraseña'
            });
        }
        
        const adminId = decoded.id;
        
        // Hash new password
        const saltRounds = 12; // Increased security for admins
        const hashedPassword = await bcrypt.hash(nuevaContrasena, saltRounds);
        
        // Update admin password
        pool.query(
            'UPDATE administradores SET contrasena = ? WHERE id_admin = ?',
            [hashedPassword, adminId],
            (updateErr, updateResults) => {
                if (updateErr) {
                    console.error('Error al actualizar contraseña ADMIN:', updateErr);
                    return res.status(500).json({
                        message: 'Error al actualizar la contraseña',
                        error: updateErr.message
                    });
                }
                
                if (updateResults.affectedRows === 0) {
                    return res.status(404).json({
                        message: 'Administrador no encontrado'
                    });
                }
                
                // Delete/invalidate all password reset codes for this admin
                pool.query(
                    'DELETE FROM password_reset WHERE user_id = ? AND user_type = ?',
                    [adminId, 'administrador'],
                    (deleteErr) => {
                        if (deleteErr) {
                            console.error('Error al limpiar códigos de restablecimiento ADMIN:', deleteErr);
                        }
                    }
                );
                
                // Get admin info for response and send confirmation email
                pool.query(
                    'SELECT nombre, correo FROM administradores WHERE id_admin = ?',
                    [adminId],
                    async (selectErr, adminResults) => {
                        if (selectErr) {
                            console.error('Error al obtener datos del administrador:', selectErr);
                        }
                        
                        const adminName = adminResults && adminResults.length > 0 
                            ? adminResults[0].nombre 
                            : 'Administrador';
                        
                        const adminEmail = adminResults && adminResults.length > 0 
                            ? adminResults[0].correo 
                            : null;
                        
                        // Enviar correo de confirmación (opcional, no debe bloquear la respuesta)
                        if (adminEmail) {
                            try {
                                console.log(`📧 Enviando confirmación de cambio de contraseña ADMIN a: ${adminEmail}`);
                                const resultadoConfirmacion = await enviarCorreoAdmin(adminEmail, adminName, null, 'password_changed');
                                
                                if (resultadoConfirmacion.success) {
                                    console.log(`✅ Correo de confirmación ADMIN enviado exitosamente`);
                                } else {
                                    console.error(`❌ Error enviando confirmación ADMIN: ${resultadoConfirmacion.error}`);
                                }
                            } catch (confirmationError) {
                                console.error('Error al enviar correo de confirmación ADMIN:', confirmationError.message);
                                // No afecta la respuesta principal
                            }
                        }
                        
                        res.status(200).json({
                            success: true,
                            message: 'Contraseña de administrador restablecida exitosamente',
                            administrador: adminName,
                            timestamp: new Date().toISOString(),
                            correo_confirmacion: adminEmail ? 'enviado' : 'no_disponible',
                            tipo_usuario: 'administrador'
                        });
                    }
                );
            }
        );
        
    } catch (error) {
        console.error('Error en resetPasswordAdmin:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// ============================
// CAMBIO DE CONTRASEÑA PARA USUARIOS AUTENTICADOS
// ============================

// Endpoint PUT /auth/change-password
exports.changePassword = async (req, res) => {
    try {
        const { id_usuario, contrasenaActual, nuevaContrasena } = req.body;
        
        // Validate input
        if (!id_usuario || !contrasenaActual || !nuevaContrasena) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario, contraseña actual y nueva contraseña son requeridos',
                campos_requeridos: ['id_usuario', 'contrasenaActual', 'nuevaContrasena']
            });
        }
        
        // Validate password strength
        if (nuevaContrasena.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 8 caracteres'
            });
        }
        
        // Get user data
        pool.query(
            'SELECT id_usuario, nombre, correo, contrasena FROM usuarios WHERE id_usuario = ?',
            [id_usuario],
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
                    return res.status(404).json({
                        success: false,
                        message: 'Usuario no encontrado'
                    });
                }
                
                const user = userResults[0];
                
                try {
                    // Verify current password
                    const isCurrentPasswordValid = await bcrypt.compare(contrasenaActual, user.contrasena);
                    
                    if (!isCurrentPasswordValid) {
                        return res.status(401).json({
                            success: false,
                            message: 'La contraseña actual es incorrecta'
                        });
                    }
                    
                    // Check if new password is different from current
                    const isSamePassword = await bcrypt.compare(nuevaContrasena, user.contrasena);
                    if (isSamePassword) {
                        return res.status(400).json({
                            success: false,
                            message: 'La nueva contraseña debe ser diferente a la contraseña actual'
                        });
                    }
                    
                    // Hash new password
                    const saltRounds = 12;
                    const hashedNewPassword = await bcrypt.hash(nuevaContrasena, saltRounds);
                    
                    // Update password in database
                    pool.query(
                        'UPDATE usuarios SET contrasena = ?, ultimo_acceso = CURRENT_TIMESTAMP WHERE id_usuario = ?',
                        [hashedNewPassword, id_usuario],
                        async (updateErr, updateResults) => {
                            if (updateErr) {
                                console.error('Error al actualizar contraseña:', updateErr);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Error al actualizar la contraseña',
                                    error: updateErr.message
                                });
                            }
                            
                            if (updateResults.affectedRows === 0) {
                                return res.status(404).json({
                                    success: false,
                                    message: 'Usuario no encontrado al actualizar'
                                });
                            }
                            
                            // Log successful password change
                            const descripcionLog = `Cambio de contraseña exitoso para usuario: ${user.nombre} (${user.correo})`;
                            pool.query(
                                'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
                                [user.id_usuario, 'CHANGE_PASSWORD', 'usuarios', descripcionLog],
                                (logErr) => {
                                    if (logErr) {
                                        console.error('Error al registrar cambio de contraseña en logs:', logErr);
                                    }
                                }
                            );
                            
                            // Send confirmation email (optional, non-blocking)
                            if (user.correo) {
                                enviarCorreo(user.correo, user.nombre, null, 'password_changed')
                                    .then((resultado) => {
                                        if (!resultado.success) {
                                            console.error('Error enviando confirmación:', resultado.error);
                                        }
                                    })
                                    .catch((error) => {
                                        console.error('Error al enviar correo de confirmación:', error.message);
                                    });
                            }
                            
                            // Send success response
                            res.status(200).json({
                                success: true,
                                message: 'Contraseña cambiada exitosamente',
                                usuario: {
                                    id: user.id_usuario,
                                    nombre: user.nombre,
                                    correo: user.correo
                                },
                                timestamp: new Date().toISOString(),
                                correo_confirmacion: user.correo ? 'enviado' : 'no_disponible'
                            });
                        }
                    );
                    
                } catch (bcryptError) {
                    console.error('Error en operación bcrypt:', bcryptError);
                    return res.status(500).json({
                        success: false,
                        message: 'Error en la verificación de contraseña',
                        error: bcryptError.message
                    });
                }
            }
        );
        
    } catch (error) {
        console.error('Error general en changePassword:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// ============================
// ENDPOINT PARA CAMBIO DIRECTO DE CONTRASEÑA ADMINISTRADORES
// ============================

// Endpoint PUT /auth/admin/change-password
exports.changePasswordAdmin = async (req, res) => {
    try {
        const { id_admin, contrasenaActual, nuevaContrasena } = req.body;
          // Validate input
        if (!id_admin || !contrasenaActual || !nuevaContrasena) {
            return res.status(400).json({
                message: 'ID de administrador, contraseña actual y nueva contraseña son requeridos',
                campos_requeridos: ['id_admin', 'contrasenaActual', 'nuevaContrasena']
            });
        }
        
        // Validate admin ID format (should be a positive integer)
        if (!Number.isInteger(Number(id_admin)) || Number(id_admin) <= 0) {
            return res.status(400).json({
                message: 'ID de administrador inválido'
            });
        }
        
        // Validate password strength
        if (nuevaContrasena.length < 8) {
            return res.status(400).json({
                message: 'La nueva contraseña debe tener al menos 8 caracteres'
            });
        }
        
        // Verificar que la nueva contraseña sea diferente a la actual
        if (contrasenaActual === nuevaContrasena) {
            return res.status(400).json({
                message: 'La nueva contraseña debe ser diferente a la contraseña actual'
            });
        }          // Find admin by ID
        pool.query(
            'SELECT id_admin, nombre, correo, contrasena FROM administradores WHERE id_admin = ?',
            [id_admin],
            async (err, adminResults) => {
                if (err) {
                    console.error('Error al buscar administrador:', err);
                    return res.status(500).json({
                        message: 'Error interno del servidor',
                        error: err.message
                    });
                }
                
                if (adminResults.length === 0) {
                    return res.status(404).json({
                        message: 'No se encontró un administrador con este ID'
                    });
                }
                
                const admin = adminResults[0];
                
                // Verify current password
                const isCurrentPasswordValid = await bcrypt.compare(contrasenaActual, admin.contrasena);
                
                if (!isCurrentPasswordValid) {
                    return res.status(401).json({
                        message: 'La contraseña actual es incorrecta'
                    });
                }
                
                // Hash new password with higher security for admins
                const saltRounds = 12;
                const hashedNewPassword = await bcrypt.hash(nuevaContrasena, saltRounds);
                
                // Update admin password
                pool.query(
                    'UPDATE administradores SET contrasena = ? WHERE id_admin = ?',
                    [hashedNewPassword, admin.id_admin],
                    (updateErr, updateResults) => {
                        if (updateErr) {
                            console.error('Error al actualizar contraseña del administrador:', updateErr);
                            return res.status(500).json({
                                message: 'Error al actualizar la contraseña',
                                error: updateErr.message
                            });
                        }
                        
                        if (updateResults.affectedRows === 0) {
                            return res.status(404).json({
                                message: 'Error al actualizar: administrador no encontrado'
                            });
                        }
                          // Log the password change for security
                        console.log(`🔐 Contraseña de administrador cambiada exitosamente:`);
                        console.log(`   📧 Admin: ${admin.correo}`);
                        console.log(`   👤 Nombre: ${admin.nombre}`);
                        console.log(`   🕒 Timestamp: ${new Date().toISOString()}`);
                        
                        // Log to database for audit trail
                        const descripcionLog = `Cambio de contraseña exitoso para administrador: ${admin.nombre} (ID: ${admin.id_admin}, Email: ${admin.correo})`;
                        pool.query(
                            'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
                            [admin.id_admin, 'CHANGE_PASSWORD_ADMIN', 'administradores', descripcionLog],
                            (logErr) => {
                                if (logErr) {
                                    console.error('Error al registrar cambio de contraseña de admin en logs:', logErr);
                                }
                            }
                        );
                        
                        // Send confirmation email (optional)
                        (async () => {
                            try {
                                console.log(`📧 Enviando confirmación de cambio de contraseña a: ${admin.correo}`);
                                const resultadoConfirmacion = await enviarCorreoAdmin(
                                    admin.correo, 
                                    admin.nombre, 
                                    null, 
                                    'password_changed'
                                );
                                
                                if (resultadoConfirmacion.success) {
                                    console.log(`✅ Correo de confirmación enviado exitosamente`);
                                } else {
                                    console.error(`❌ Error enviando confirmación: ${resultadoConfirmacion.error}`);
                                }
                            } catch (confirmationError) {
                                console.error('Error al enviar correo de confirmación:', confirmationError.message);
                            }
                        })();
                        
                        res.status(200).json({
                            success: true,
                            message: 'Contraseña de administrador cambiada exitosamente',
                            administrador: {
                                id: admin.id_admin,
                                nombre: admin.nombre,
                                correo: admin.correo
                            },
                            timestamp: new Date().toISOString(),
                            correo_confirmacion: 'enviado',
                            tipo_usuario: 'administrador'
                        });
                    }
                );
            }
        );
        
    } catch (error) {
        console.error('Error en changePasswordAdmin:', error);
        res.status(500).json({
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// ============================
// JWT ADMIN AUTHENTICATION SYSTEM
// ============================

// Admin Login with JWT
exports.loginAdmin = async (req, res) => {
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
        
        // Find admin by email
        pool.query(
            'SELECT id_admin, nombre, correo, contrasena, activo, ultimo_acceso FROM administradores WHERE correo = ?',
            [correo],
            async (err, adminResults) => {
                if (err) {
                    console.error('Error al buscar administrador:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error interno del servidor',
                        error: err.message
                    });
                }
                
                if (adminResults.length === 0) {
                    return res.status(401).json({
                        success: false,
                        message: 'Credenciales inválidas',
                        error_type: 'INVALID_CREDENTIALS'
                    });
                }
                
                const admin = adminResults[0];
                
                // Check if admin account is active
                if (!admin.activo) {
                    return res.status(403).json({
                        success: false,
                        message: 'Cuenta de administrador desactivada',
                        error_type: 'ACCOUNT_DISABLED'
                    });
                }
                
                try {
                    // Verify password
                    const isPasswordValid = await bcrypt.compare(contrasena, admin.contrasena);
                    
                    if (!isPasswordValid) {
                        return res.status(401).json({
                            success: false,
                            message: 'Credenciales inválidas',
                            error_type: 'INVALID_CREDENTIALS'
                        });
                    }
                    
                    // Generate JWT token
                    const accessToken = generateJWTToken(admin.id_admin, admin.correo, admin.nombre);
                    
                    // Update last access
                    pool.query(
                        'UPDATE administradores SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id_admin = ?',
                        [admin.id_admin],
                        (updateErr) => {
                            if (updateErr) {
                                console.error('Error al actualizar último acceso:', updateErr);
                            }
                        }
                    );
                    
                    // Log successful login
                    const descripcionLog = `Login exitoso para administrador: ${admin.nombre} (${admin.correo})`;
                    pool.query(
                        'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
                        [admin.id_admin, 'ADMIN_LOGIN', 'administradores', descripcionLog],
                        (logErr) => {
                            if (logErr) {
                                console.error('Error al registrar login en logs:', logErr);
                            }
                        }
                    );
                    
                    console.log(`✅ Admin login exitoso: ${admin.correo} - ${new Date().toISOString()}`);
                    
                    // Send success response
                    res.status(200).json({
                        success: true,
                        message: 'Autenticación exitosa',
                        admin: {
                            id: admin.id_admin,
                            nombre: admin.nombre,
                            correo: admin.correo,
                            ultimo_acceso: admin.ultimo_acceso
                        },
                        token: accessToken,
                        token_type: 'Bearer',
                        expires_in: JWT_ADMIN_EXPIRES_IN,
                        timestamp: new Date().toISOString()
                    });
                    
                } catch (bcryptError) {
                    console.error('Error en verificación de contraseña:', bcryptError);
                    return res.status(500).json({
                        success: false,
                        message: 'Error en la verificación de credenciales',
                        error: bcryptError.message
                    });
                }
            }
        );
        
    } catch (error) {
        console.error('Error en loginAdmin:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Refresh JWT Token for Admin
exports.refreshAdminToken = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token de autorización requerido',
                error_type: 'MISSING_TOKEN'
            });
        }
        
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Validate current token (even if expired)
        const tokenValidation = validateJWTToken(token, 'admin');
        
        if (!tokenValidation.valid && tokenValidation.error !== 'TOKEN_EXPIRED') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido',
                error_type: tokenValidation.error
            });
        }
        
        let adminId;
        if (tokenValidation.valid) {
            adminId = tokenValidation.data.id;
        } else {
            // For expired tokens, decode without verification to get admin ID
            try {
                const decoded = jwt.decode(token);
                adminId = decoded.id;
            } catch (decodeError) {
                return res.status(401).json({
                    success: false,
                    message: 'Token malformado',
                    error_type: 'MALFORMED_TOKEN'
                });
            }
        }
        
        // Verify admin still exists and is active
        pool.query(
            'SELECT id_admin, nombre, correo, activo FROM administradores WHERE id_admin = ?',
            [adminId],
            (err, adminResults) => {
                if (err) {
                    console.error('Error al verificar administrador:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error interno del servidor',
                        error: err.message
                    });
                }
                
                if (adminResults.length === 0) {
                    return res.status(401).json({
                        success: false,
                        message: 'Administrador no encontrado',
                        error_type: 'ADMIN_NOT_FOUND'
                    });
                }
                
                const admin = adminResults[0];
                
                if (!admin.activo) {
                    return res.status(403).json({
                        success: false,
                        message: 'Cuenta de administrador desactivada',
                        error_type: 'ACCOUNT_DISABLED'
                    });
                }
                
                // Generate new token
                const newAccessToken = generateJWTToken(admin.id_admin, admin.correo, admin.nombre);
                
                // Log token refresh
                const descripcionLog = `Token JWT renovado para administrador: ${admin.nombre} (${admin.correo})`;
                pool.query(
                    'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
                    [admin.id_admin, 'ADMIN_TOKEN_REFRESH', 'administradores', descripcionLog],
                    (logErr) => {
                        if (logErr) {
                            console.error('Error al registrar renovación de token en logs:', logErr);
                        }
                    }
                );
                
                console.log(`🔄 Token renovado para admin: ${admin.correo} - ${new Date().toISOString()}`);
                
                res.status(200).json({
                    success: true,
                    message: 'Token renovado exitosamente',
                    admin: {
                        id: admin.id_admin,
                        nombre: admin.nombre,
                        correo: admin.correo
                    },
                    token: newAccessToken,
                    token_type: 'Bearer',
                    expires_in: JWT_ADMIN_EXPIRES_IN,
                    timestamp: new Date().toISOString()
                });
            }
        );
        
    } catch (error) {
        console.error('Error en refreshAdminToken:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Verify JWT Token Middleware for Admin
exports.verifyAdminToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token de autorización requerido',
                error_type: 'MISSING_TOKEN'
            });
        }
        
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Validate JWT token
        const tokenValidation = validateJWTToken(token, 'admin');
        
        if (!tokenValidation.valid) {
            let errorMessage = 'Token inválido';
            
            if (tokenValidation.error === 'TOKEN_EXPIRED') {
                errorMessage = 'Token expirado. Por favor, inicia sesión nuevamente.';
            } else if (tokenValidation.error === 'MALFORMED_TOKEN') {
                errorMessage = 'Token malformado';
            }
            
            return res.status(401).json({
                success: false,
                message: errorMessage,
                error_type: tokenValidation.error
            });
        }
        
        const decoded = tokenValidation.data;
        
        // Verify token type
        if (decoded.type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Token no válido para administradores',
                error_type: 'INVALID_TOKEN_TYPE'
            });
        }
        
        // Add admin info to request object
        req.admin = {
            id: decoded.id,
            email: decoded.email,
            nombre: decoded.nombre,
            type: decoded.type
        };
        
        // Continue to next middleware/route handler
        next();
        
    } catch (error) {
        console.error('Error en verifyAdminToken middleware:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Get Admin Profile (protected route)
exports.getAdminProfile = async (req, res) => {
    try {
        const adminId = req.admin.id;
        
        // Get admin details from database
        pool.query(
            'SELECT id_admin, nombre, correo, activo, ultimo_acceso, fecha_creacion FROM administradores WHERE id_admin = ?',
            [adminId],
            (err, adminResults) => {
                if (err) {
                    console.error('Error al obtener perfil de administrador:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error interno del servidor',
                        error: err.message
                    });
                }
                
                if (adminResults.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Administrador no encontrado',
                        error_type: 'ADMIN_NOT_FOUND'
                    });
                }
                
                const admin = adminResults[0];
                
                res.status(200).json({
                    success: true,
                    message: 'Perfil de administrador obtenido exitosamente',
                    admin: {
                        id: admin.id_admin,
                        nombre: admin.nombre,
                        correo: admin.correo,
                        activo: admin.activo,
                        ultimo_acceso: admin.ultimo_acceso,
                        fecha_creacion: admin.fecha_creacion
                    },
                    timestamp: new Date().toISOString()
                });
            }
        );
        
    } catch (error) {
        console.error('Error en getAdminProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Admin Logout (invalidate token - client-side)
exports.logoutAdmin = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const adminNombre = req.admin.nombre;
        const adminEmail = req.admin.email;
        
        // Log logout action
        const descripcionLog = `Logout para administrador: ${adminNombre} (${adminEmail})`;
        pool.query(
            'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
            [adminId, 'ADMIN_LOGOUT', 'administradores', descripcionLog],
            (logErr) => {
                if (logErr) {
                    console.error('Error al registrar logout en logs:', logErr);
                }
            }
        );
        
        console.log(`🚪 Admin logout: ${adminEmail} - ${new Date().toISOString()}`);
        
        res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente',
            timestamp: new Date().toISOString(),
            note: 'El token debe ser eliminado del cliente'
        });
        
    } catch (error) {
        console.error('Error en logoutAdmin:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
