const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');

// Twilio configuration from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

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
                
                // Delete any existing OTP for this user
                pool.query(
                    'DELETE FROM otp_resets WHERE id_usuario = ?',
                    [user.id_usuario],
                    (deleteErr) => {
                        if (deleteErr) {
                            console.error('Error al limpiar OTP existente:', deleteErr);
                        }
                        
                        // Insert new OTP
                        pool.query(
                            'INSERT INTO otp_resets (id_usuario, otp, expires_at, created_at) VALUES (?, ?, ?, NOW())',
                            [user.id_usuario, otp, expiresAt],
                            async (insertErr) => {
                                if (insertErr) {
                                    console.error('Error al guardar OTP:', insertErr);
                                    return res.status(500).json({
                                        message: 'Error al generar código de verificación',
                                        error: insertErr.message
                                    });
                                }
                                
                                // Send SMS with OTP
                                try {
                                    const phoneForSMS = formatPhoneForSMS(celular);
                                    const message = `Hola ${user.nombre}, tu código de verificación para restablecer tu contraseña es: ${otp}. Válido por 10 minutos.`;
                                    
                                    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER) {
                                        await twilioClient.messages.create({
                                            body: message,
                                            from: TWILIO_FROM_NUMBER,
                                            to: phoneForSMS
                                        });
                                        
                                        console.log(`SMS enviado a ${phoneForSMS} con OTP: ${otp}`);
                                    } else {
                                        // For development/testing - log OTP instead of sending SMS
                                        console.log(`[DESARROLLO] OTP para ${phoneForSMS}: ${otp}`);
                                    }
                                    
                                    res.status(200).json({
                                        message: 'Código de verificación enviado por SMS',
                                        celular: celular.replace(/\d(?=\d{4})/g, '*'), // Mask phone number
                                        validez_minutos: 10
                                    });
                                    
                                } catch (smsError) {
                                    console.error('Error al enviar SMS:', smsError);
                                    
                                    // Delete the OTP if SMS failed
                                    pool.query('DELETE FROM otp_resets WHERE id_usuario = ?', [user.id_usuario]);
                                    
                                    return res.status(500).json({
                                        message: 'Error al enviar código por SMS',
                                        error: 'Servicio de SMS no disponible'
                                    });
                                }
                            }
                        );
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
        
        // Find user and verify OTP
        pool.query(`
            SELECT u.id_usuario, u.nombre, o.otp, o.expires_at
            FROM usuarios u
            JOIN otp_resets o ON u.id_usuario = o.id_usuario
            WHERE (u.celular = ? OR u.celular = ? OR u.celular = ?)
            AND o.otp = ?
            AND o.expires_at > NOW()
        `, [celular, cleanPhone, `+503${cleanPhone}`, otp], (err, results) => {
            if (err) {
                console.error('Error al verificar OTP:', err);
                return res.status(500).json({
                    message: 'Error interno del servidor',
                    error: err.message
                });
            }
            
            if (results.length === 0) {
                return res.status(400).json({
                    message: 'Código OTP inválido o expirado'
                });
            }
            
            const user = results[0];
            
            // Generate temporary token for password reset (15 minutes)
            const resetToken = jwt.sign(
                { 
                    id_usuario: user.id_usuario,
                    purpose: 'password-reset',
                    timestamp: Date.now()
                },
                JWT_SECRET,
                { expiresIn: '15m' }
            );
            
            // Mark OTP as used (optional: you could delete it or add a 'used' flag)
            pool.query(
                'UPDATE otp_resets SET used_at = NOW() WHERE id_usuario = ? AND otp = ?',
                [user.id_usuario, otp],
                (updateErr) => {
                    if (updateErr) {
                        console.error('Error al marcar OTP como usado:', updateErr);
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
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (tokenError) {
            return res.status(401).json({
                message: 'Token inválido o expirado'
            });
        }
        
        // Validate token purpose
        if (decoded.purpose !== 'password-reset') {
            return res.status(401).json({
                message: 'Token no válido para esta operación'
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
                
                // Delete/invalidate all OTPs for this user
                pool.query(
                    'DELETE FROM otp_resets WHERE id_usuario = ?',
                    [userId],
                    (deleteErr) => {
                        if (deleteErr) {
                            console.error('Error al limpiar OTPs:', deleteErr);
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
