const pool = require('../config/db');
const bcrypt = require('bcrypt');

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

// Helper function to validate phone number format
const validatePhoneNumber = (celular) => {
    // Remove any non-digit characters
    const cleanPhone = celular.replace(/\D/g, '');
    // Check if it's 8 digits (El Salvador format) or 10+ digits (international)
    return cleanPhone.length >= 8 && cleanPhone.length <= 15;
};

// Helper function to format phone number for SMS
const formatPhoneForSMS = (celular) => {
    const cleanPhone = celular.replace(/\D/g, '');
    // If it's 8 digits, assume it's El Salvador and add country code
    if (cleanPhone.length === 8) {
        return `+503${cleanPhone}`;
    }
    // If it already has country code, return as is
    if (cleanPhone.startsWith('503') && cleanPhone.length === 11) {
        return `+${cleanPhone}`;
    }
    // Otherwise, assume it's already properly formatted
    return cleanPhone.startsWith('+') ? celular : `+${cleanPhone}`;
};

// Endpoint POST /auth/request-reset
exports.requestPasswordReset = async (req, res) => {
    try {
        const { celular } = req.body;
        
        // Validate input
        if (!celular) {
            return res.status(400).json({
                message: 'Número de celular es requerido'
            });
        }
        
        // Validate phone number format
        if (!validatePhoneNumber(celular)) {
            return res.status(400).json({
                message: 'Formato de número de celular inválido'
            });
        }
        
        // Clean phone number for database lookup
        const cleanPhone = celular.replace(/\D/g, '');
          // Check if user exists with this phone number
        pool.query(
            'SELECT id_usuario, nombre FROM usuarios WHERE celular = ? OR celular = ? OR celular = ?',
            [celular, cleanPhone, `+503${cleanPhone}`],
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
                        message: 'No se encontró un usuario con este número de celular'
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
                                }
                                
                                // Generate OTP response
                                try {
                                    const phoneForSMS = formatPhoneForSMS(celular);
                                    const message = `Hola ${user.nombre}, tu código de verificación para restablecer tu contraseña es: ${otp}. Válido por 10 minutos.`;
                                    
                                    // For now, just log the OTP (SMS functionality can be added later)
                                    console.log(`[CÓDIGO OTP] Para ${phoneForSMS}: ${otp}`);
                                    console.log(`[MENSAJE] ${message}`);
                                    
                                    res.status(200).json({
                                        message: 'Código de verificación generado (revisar logs del servidor)',
                                        celular: celular.replace(/\d(?=\d{4})/g, '*'), // Mask phone number
                                        validez_minutos: 10,
                                        otp_para_pruebas: otp // Solo para desarrollo - quitar en producción
                                    });
                                    
                                } catch (smsError) {
                                    console.error('Error al generar código:', smsError);
                                    
                                    // Delete the OTP if failed
                                    pool.query('DELETE FROM otp_resets WHERE id_usuario = ?', [user.id_usuario]);
                                    
                                    return res.status(500).json({
                                        message: 'Error al generar código de verificación',
                                        error: 'Error interno del servidor'
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
        const { celular, otp } = req.body;
        
        // Validate input
        if (!celular || !otp) {
            return res.status(400).json({
                message: 'Número de celular y código OTP son requeridos'
            });
        }
        
        // Validate OTP format (6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                message: 'El código OTP debe tener 6 dígitos'
            });
        }
        
        // Clean phone number
        const cleanPhone = celular.replace(/\D/g, '');
          // Find user and verify reset code
        pool.query(`
            SELECT u.id_usuario, u.nombre, pr.reset_code, pr.expiracion
            FROM usuarios u
            JOIN password_reset pr ON u.id_usuario = pr.user_id
            WHERE (u.celular = ? OR u.celular = ? OR u.celular = ?)
            AND pr.reset_code = ?
            AND pr.expiracion > NOW()
            AND pr.used = 0
            AND pr.user_type = 'usuario'
        `, [celular, cleanPhone, `+503${cleanPhone}`, otp], (err, results) => {
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
                
                // Get user info for response
                pool.query(
                    'SELECT nombre, correo FROM usuarios WHERE id_usuario = ?',
                    [userId],
                    (selectErr, userResults) => {
                        const userName = userResults && userResults.length > 0 
                            ? userResults[0].nombre 
                            : 'Usuario';
                        
                        res.status(200).json({
                            message: 'Contraseña restablecida exitosamente',
                            usuario: userName,
                            timestamp: new Date().toISOString()
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
