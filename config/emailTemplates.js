// Templates de correo electrónico para Mama Mian Pizza

// Función auxiliar para generar la fecha actual en español
const getFechaActual = () => {
    const opciones = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'America/El_Salvador'
    };
    return new Date().toLocaleDateString('es-ES', opciones);
};

// Template para código de verificación de restablecimiento de contraseña
const templatePasswordReset = (nombre, otp, tiempoExpiracion = 10) => {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de Verificación - Mama Mian Pizza</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
            }
            
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                border-radius: 8px;
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #FF6B35, #FF8A65);
                padding: 30px 20px;
                text-align: center;
                color: white;
            }
            
            .logo {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            
            .tagline {
                font-size: 14px;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px 30px;
                background-color: #ffffff;
            }
            
            .greeting {
                font-size: 20px;
                color: #333;
                margin-bottom: 20px;
                font-weight: 600;
            }
            
            .message {
                font-size: 16px;
                color: #666;
                margin-bottom: 30px;
                line-height: 1.8;
            }
            
            .otp-container {
                text-align: center;
                margin: 40px 0;
                padding: 30px;
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                border-radius: 12px;
                border: 2px dashed #FF6B35;
            }
            
            .otp-label {
                font-size: 14px;
                color: #666;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 600;
            }
            
            .otp-code {
                font-size: 36px;
                font-weight: bold;
                color: #FF6B35;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
                background-color: #fff;
                padding: 15px 25px;
                border-radius: 8px;
                display: inline-block;
                border: 2px solid #FF6B35;
                box-shadow: 0 2px 4px rgba(255, 107, 53, 0.2);
            }
            
            .info-box {
                background-color: #f8f9fa;
                border-left: 4px solid #FF6B35;
                padding: 20px;
                margin: 30px 0;
                border-radius: 0 8px 8px 0;
            }
            
            .info-item {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
                font-size: 14px;
                color: #555;
            }
            
            .info-item:last-child {
                margin-bottom: 0;
            }
            
            .info-icon {
                margin-right: 10px;
                font-size: 16px;
            }
            
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
            }
            
            .footer {
                background-color: #2c3e50;
                padding: 25px 30px;
                text-align: center;
                color: #bdc3c7;
            }
            
            .footer-text {
                font-size: 12px;
                margin-bottom: 10px;
                line-height: 1.5;
            }
            
            .footer-link {
                color: #FF6B35;
                text-decoration: none;
            }
            
            .footer-link:hover {
                text-decoration: underline;
            }
            
            .social-links {
                margin-top: 15px;
            }
            
            .social-link {
                display: inline-block;
                margin: 0 10px;
                color: #bdc3c7;
                font-size: 18px;
                text-decoration: none;
            }
            
            @media (max-width: 600px) {
                .container {
                    margin: 0 10px;
                }
                
                .content {
                    padding: 25px 20px;
                }
                
                .otp-code {
                    font-size: 28px;
                    letter-spacing: 4px;
                    padding: 12px 20px;
                }
                
                .logo {
                    font-size: 24px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🍕 Mama Mian Pizza</div>
                <div class="tagline">La mejor pizza de El Salvador</div>
            </div>
            
            <div class="content">
                <div class="greeting">¡Hola ${nombre}!</div>
                
                <div class="message">
                    Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. 
                    Para continuar con el proceso, utiliza el siguiente código de verificación:
                </div>
                
                <div class="otp-container">
                    <div class="otp-label">Tu Código de Verificación</div>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="info-box">
                    <div class="info-item">
                        <span class="info-icon">⏰</span>
                        <span>Este código es válido por <strong>${tiempoExpiracion} minutos</strong></span>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">🔒</span>
                        <span>No compartas este código con nadie</span>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">📱</span>
                        <span>Úsalo en la app o sitio web de Mama Mian Pizza</span>
                    </div>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong> Si no solicitaste este código, puedes ignorar este correo. 
                    Tu cuenta permanecerá segura y no se realizarán cambios.
                </div>
                
                <div class="message">
                    Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. 
                    ¡Estamos aquí para servirte! 🍕
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-text">
                    © ${new Date().getFullYear()} Mama Mian Pizza. Todos los derechos reservados.<br>
                    Este correo fue enviado el ${getFechaActual()}
                </div>
                
                <div class="footer-text">
                    📧 <a href="mailto:info@mamamianpizza.com" class="footer-link">info@mamamianpizza.com</a> |
                    📞 <a href="tel:+50325551234" class="footer-link">+503 2555-1234</a>
                </div>
                
                <div class="social-links">
                    <a href="#" class="social-link">📘</a>
                    <a href="#" class="social-link">📷</a>
                    <a href="#" class="social-link">🐦</a>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Template para confirmación de contraseña cambiada
const templatePasswordChanged = (nombre) => {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contraseña Actualizada - Mama Mian Pizza</title>
        <style>
            /* Mismos estilos que el template anterior */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #28a745, #20c997); padding: 30px 20px; text-align: center; color: white; }
            .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 40px 30px; background-color: #ffffff; }
            .success-icon { font-size: 64px; text-align: center; margin: 20px 0; }
            .message { font-size: 16px; color: #666; margin-bottom: 20px; line-height: 1.8; text-align: center; }
            .footer { background-color: #2c3e50; padding: 25px 30px; text-align: center; color: #bdc3c7; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🍕 Mama Mian Pizza</div>
            </div>
            
            <div class="content">
                <div class="success-icon">✅</div>
                <h2 style="text-align: center; color: #28a745; margin-bottom: 20px;">¡Contraseña Actualizada!</h2>
                
                <div class="message">
                    Hola ${nombre},<br><br>
                    Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </div>
                
                <div class="message">
                    Si no realizaste este cambio, contacta inmediatamente a nuestro equipo de soporte.
                </div>
            </div>
            
            <div class="footer">
                <div>© ${new Date().getFullYear()} Mama Mian Pizza. Todos los derechos reservados.</div>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    templatePasswordReset,
    templatePasswordChanged
};
