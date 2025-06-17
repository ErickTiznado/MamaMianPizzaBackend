const nodemailer = require('nodemailer');

// Configuración de diferentes proveedores de correo
const emailConfig = {
    gmail: {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    },
    outlook: {
        service: 'outlook',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    },
    yahoo: {
        service: 'yahoo',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    },
    custom: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true' || false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    }
};

// Función para crear transporter
const createTransporter = () => {
    const provider = process.env.EMAIL_PROVIDER || 'gmail';
    const config = emailConfig[provider];
    
    if (!config) {
        throw new Error(`Proveedor de correo no soportado: ${provider}`);
    }
    
    return nodemailer.createTransporter(config);
};

// Validar configuración de correo
const validateEmailConfig = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER y EMAIL_PASS son requeridos en las variables de entorno');
    }
    
    return true;
};

module.exports = {
    createTransporter,
    validateEmailConfig
};
