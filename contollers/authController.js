const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { createTransporter, validateEmailConfig } = require('../config/emailConfig');
const { templatePasswordReset, templatePasswordChanged, templatePasswordResetAdmin, templatePasswordChangedAdmin } = require('../config/emailTemplates');

// Simple token generation (temporary solution without JWT)
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
            
            // Generate temporary token for password reset (15 minutes)
            const resetToken = generateSimpleToken(admin.id_admin);
            
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
                tipo_usuario: 'administrador'
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
        
        // Verify and decode token
        const decoded = validateSimpleToken(token);
        if (!decoded) {
            return res.status(401).json({
                message: 'Token inválido o expirado'
            });
        }
        
        const adminId = decoded.id_usuario; // Note: using same structure but for admin
        
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
        console.log('🔄 Iniciando cambio de contraseña...');
        console.log('📦 Body recibido:', { 
            id_usuario: req.body.id_usuario, 
            contrasenaActual: '***', 
            nuevaContrasena: '***' 
        });
        
        const { id_usuario, contrasenaActual, nuevaContrasena } = req.body;
        
        // Validate input
        if (!id_usuario || !contrasenaActual || !nuevaContrasena) {
            console.log('❌ Faltan datos requeridos');
            return res.status(400).json({
                message: 'ID de usuario, contraseña actual y nueva contraseña son requeridos',
                received: {
                    id_usuario: !!id_usuario,
                    contrasenaActual: !!contrasenaActual,
                    nuevaContrasena: !!nuevaContrasena
                }
            });
        }
        
        // Validate password strength
        if (nuevaContrasena.length < 8) {
            console.log('❌ Nueva contraseña muy corta');
            return res.status(400).json({
                message: 'La nueva contraseña debe tener al menos 8 caracteres'
            });
        }
        
        console.log(`🔍 Buscando usuario con ID: ${id_usuario}`);
        
        // Get user data
        pool.query(
            'SELECT id_usuario, nombre, correo, contrasena FROM usuarios WHERE id_usuario = ?',
            [id_usuario],
            async (err, userResults) => {
                if (err) {
                    console.error('❌ Error al buscar usuario:', err);
                    return res.status(500).json({
                        message: 'Error interno del servidor',
                        error: err.message
                    });
                }
                
                if (userResults.length === 0) {
                    console.log(`❌ Usuario no encontrado con ID: ${id_usuario}`);
                    return res.status(404).json({
                        message: 'Usuario no encontrado'
                    });
                }
                
                const user = userResults[0];
                console.log(`✅ Usuario encontrado: ${user.nombre} (${user.correo})`);
                console.log(`🔐 Hash en BD: ${user.contrasena.substring(0, 20)}...`);
                
                try {
                    // Verify current password with detailed logging
                    console.log('🔍 Verificando contraseña actual...');
                    console.log(`📝 Contraseña recibida: "${contrasenaActual}" (longitud: ${contrasenaActual.length})`);
                    
                    const isCurrentPasswordValid = await bcrypt.compare(contrasenaActual, user.contrasena);
                    console.log(`🔄 Resultado bcrypt.compare: ${isCurrentPasswordValid}`);
                    
                    if (!isCurrentPasswordValid) {
                        console.log('❌ Contraseña actual incorrecta');
                        
                        // Intentar con variaciones comunes para debugging
                        console.log('🧪 Probando variaciones...');
                        const variations = [
                            contrasenaActual.trim(),
                            contrasenaActual.toLowerCase(),
                            contrasenaActual.toUpperCase()
                        ];
                        
                        for (const variation of variations) {
                            try {
                                const varMatch = await bcrypt.compare(variation, user.contrasena);
                                console.log(`   "${variation}": ${varMatch}`);
                                if (varMatch) {
                                    console.log(`✅ Encontrada variación que funciona: "${variation}"`);
                                    // Usar la variación que funciona
                                    contrasenaActual = variation;
                                    isCurrentPasswordValid = true;
                                    break;
                                }
                            } catch (varErr) {
                                console.log(`   Error probando "${variation}":`, varErr.message);
                            }
                        }
                        
                        if (!isCurrentPasswordValid) {
                            return res.status(401).json({
                                message: 'La contraseña actual es incorrecta',
                                debug: {
                                    passwordLength: contrasenaActual.length,
                                    hashInDB: user.contrasena.substring(0, 20) + '...'
                                }
                            });
                        }
                    }
                    
                    console.log('✅ Contraseña actual verificada correctamente');
                    
                    // Check if new password is different from current
                    console.log('🔍 Verificando que la nueva contraseña sea diferente...');
                    const isSamePassword = await bcrypt.compare(nuevaContrasena, user.contrasena);
                    
                    if (isSamePassword) {
                        console.log('❌ Nueva contraseña es igual a la actual');
                        return res.status(400).json({
                            message: 'La nueva contraseña debe ser diferente a la contraseña actual'
                        });
                    }
                    
                    console.log('✅ Nueva contraseña es diferente');
                    
                    // Hash new password
                    console.log('🔐 Hasheando nueva contraseña...');
                    const saltRounds = 12;
                    const hashedNewPassword = await bcrypt.hash(nuevaContrasena, saltRounds);
                    console.log(`🔐 Nuevo hash generado: ${hashedNewPassword.substring(0, 20)}...`);
                    
                    // Update password in database
                    console.log('💾 Actualizando contraseña en la base de datos...');
                    pool.query(
                        'UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?',
                        [hashedNewPassword, id_usuario],
                        async (updateErr, updateResults) => {
                            if (updateErr) {
                                console.error('❌ Error al actualizar contraseña:', updateErr);
                                return res.status(500).json({
                                    message: 'Error al actualizar la contraseña',
                                    error: updateErr.message
                                });
                            }
                            
                            if (updateResults.affectedRows === 0) {
                                console.log('❌ No se actualizó ninguna fila');
                                return res.status(404).json({
                                    message: 'Usuario no encontrado al actualizar'
                                });
                            }
                            
                            console.log(`✅ Contraseña actualizada. Filas afectadas: ${updateResults.affectedRows}`);
                            
                            // Log successful password change
                            const descripcionLog = `Cambio de contraseña exitoso para usuario: ${user.nombre} (${user.correo})`;
                            pool.query(
                                'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
                                [user.id_usuario, 'CHANGE_PASSWORD', 'usuarios', descripcionLog],
                                (logErr) => {
                                    if (logErr) {
                                        console.error('Error al registrar cambio de contraseña en logs:', logErr);
                                    } else {
                                        console.log('✅ Cambio de contraseña registrado en logs');
                                    }
                                }
                            );
                            
                            // Send confirmation email (optional, non-blocking)
                            if (user.correo) {
                                try {
                                    console.log(`📧 Enviando confirmación de cambio de contraseña a: ${user.correo}`);
                                    const resultadoConfirmacion = await enviarCorreo(user.correo, user.nombre, null, 'password_changed');
                                    
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
                            
                            console.log('🎉 Cambio de contraseña completado exitosamente');
                            res.status(200).json({
                                success: true,
                                message: 'Contraseña cambiada exitosamente',
                                usuario: user.nombre,
                                timestamp: new Date().toISOString(),
                                correo_confirmacion: user.correo ? 'enviado' : 'no_disponible'
                            });
                        }
                    );
                    
                } catch (bcryptError) {
                    console.error('❌ Error en operación bcrypt:', bcryptError);
                    return res.status(500).json({
                        message: 'Error en la verificación de contraseña',
                        error: bcryptError.message
                    });
                }
            }
        );
        
    } catch (error) {
        console.error('❌ Error general en changePassword:', error);
        res.status(500).json({
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
        const { correo, contrasenaActual, nuevaContrasena } = req.body;
        
        // Validate input
        if (!correo || !contrasenaActual || !nuevaContrasena) {
            return res.status(400).json({
                message: 'Correo, contraseña actual y nueva contraseña son requeridos'
            });
        }
        
        // Validate email format
        if (!validateEmail(correo)) {
            return res.status(400).json({
                message: 'Formato de correo electrónico inválido'
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
        }
        
        // Find admin by email
        pool.query(
            'SELECT id_admin, nombre, correo, contrasena FROM administradores WHERE correo = ?',
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
