// Script para probar la configuración de correo electrónico
require('dotenv').config();

const { createTransporter, validateEmailConfig } = require('./config/emailConfig');
const { templatePasswordReset, templatePasswordChanged } = require('./config/emailTemplates');

// Colores para el terminal
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

// Función para probar la configuración
async function testEmailConfig() {
    log('\n🧪 PROBANDO CONFIGURACIÓN DE CORREO ELECTRÓNICO\n', 'cyan');
    
    try {
        // 1. Validar variables de entorno
        log('📋 Paso 1: Validando variables de entorno...', 'blue');
        validateEmailConfig();
        log('✅ Variables de entorno válidas', 'green');
        
        // Mostrar configuración (sin mostrar la contraseña)
        log(`   📧 EMAIL_USER: ${process.env.EMAIL_USER}`, 'blue');
        log(`   🔧 EMAIL_PROVIDER: ${process.env.EMAIL_PROVIDER || 'gmail'}`, 'blue');
        log(`   📝 EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME || 'Mama Mian Pizza'}`, 'blue');
        
        // 2. Crear transporter
        log('\n📡 Paso 2: Creando conexión de correo...', 'blue');
        const transporter = createTransporter();
        log('✅ Transporter creado exitosamente', 'green');
        
        // 3. Verificar conexión
        log('\n🔍 Paso 3: Verificando conexión con el servidor...', 'blue');
        await transporter.verify();
        log('✅ Conexión verificada exitosamente', 'green');
        
        // 4. Preguntar si enviar correo de prueba
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        const shouldSendTest = await new Promise((resolve) => {
            rl.question('\n📨 ¿Quieres enviar un correo de prueba? (s/n): ', (answer) => {
                rl.close();
                resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'y');
            });
        });
        
        if (shouldSendTest) {
            const rl2 = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            
            const testEmail = await new Promise((resolve) => {
                rl2.question('📧 Ingresa tu correo para la prueba: ', (answer) => {
                    rl2.close();
                    resolve(answer);
                });
            });
            
            // 5. Enviar correo de prueba
            log('\n📮 Paso 4: Enviando correo de prueba...', 'blue');
            
            const testOTP = '123456';
            const htmlContent = templatePasswordReset('Usuario de Prueba', testOTP, 10);
            
            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Mama Mian Pizza',
                    address: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER
                },
                to: testEmail,
                subject: '🧪 PRUEBA - Configuración de Correo - Mama Mian Pizza',
                html: htmlContent,
                text: `
Esto es una prueba de configuración de correo electrónico.

Tu código de prueba es: ${testOTP}

Si recibes este correo, la configuración está funcionando correctamente.

Saludos,
Equipo de Mama Mian Pizza (Prueba)
                `.trim()
            };
            
            const info = await transporter.sendMail(mailOptions);
            
            log(`✅ Correo de prueba enviado exitosamente`, 'green');
            log(`   📧 Destinatario: ${testEmail}`, 'blue');
            log(`   🆔 Message ID: ${info.messageId}`, 'blue');
            log(`   📊 Response: ${info.response}`, 'blue');
            
            log('\n📬 Revisa tu bandeja de entrada (y spam) para ver el correo de prueba', 'yellow');
        }
        
        log('\n🎉 ¡CONFIGURACIÓN DE CORREO COMPLETADA EXITOSAMENTE!', 'green');
        log('\n📋 Resumen:', 'cyan');
        log('   ✅ Variables de entorno configuradas', 'green');
        log('   ✅ Conexión al servidor de correo establecida', 'green');
        log('   ✅ Plantillas de correo funcionando', 'green');
        
        if (shouldSendTest) {
            log('   ✅ Correo de prueba enviado', 'green');
        }
        
        log('\n🚀 Tu sistema está listo para enviar correos de restablecimiento de contraseña!', 'green');
        
    } catch (error) {
        log(`\n❌ ERROR EN LA CONFIGURACIÓN:`, 'red');
        log(`   ${error.message}`, 'red');
        
        // Guía de solución de problemas
        log('\n🔧 POSIBLES SOLUCIONES:', 'yellow');
        
        if (error.message.includes('Invalid login')) {
            log('   • Verifica que EMAIL_USER y EMAIL_PASS estén correctos', 'yellow');
            log('   • Asegúrate de usar una contraseña de aplicación (no la personal)', 'yellow');
            log('   • Verifica que la verificación en 2 pasos esté activada en Gmail', 'yellow');
        } else if (error.message.includes('connect') || error.message.includes('timeout')) {
            log('   • Verifica tu conexión a internet', 'yellow');
            log('   • Intenta cambiar EMAIL_PROVIDER a "outlook" o "yahoo"', 'yellow');
            log('   • Revisa si tu firewall bloquea el puerto 587', 'yellow');
        } else if (error.message.includes('requeridos')) {
            log('   • Crea un archivo .env en la raíz del proyecto', 'yellow');
            log('   • Agrega EMAIL_USER=tu-email@gmail.com', 'yellow');
            log('   • Agrega EMAIL_PASS=tu-contraseña-de-aplicacion', 'yellow');
        }
        
        log('\n📖 Consulta EMAIL-SETUP.md para instrucciones detalladas', 'blue');
        
        process.exit(1);
    }
}

// Función para mostrar ayuda
function showHelp() {
    log('\n📧 UTILIDAD DE PRUEBA DE CORREO ELECTRÓNICO\n', 'cyan');
    log('Uso:', 'blue');
    log('  node test-email.js          # Probar configuración completa', 'yellow');
    log('  node test-email.js help     # Mostrar esta ayuda', 'yellow');
    log('\nEste script verifica:', 'blue');
    log('  ✓ Variables de entorno', 'green');
    log('  ✓ Conexión al servidor de correo', 'green');
    log('  ✓ Envío de correo de prueba', 'green');
    log('  ✓ Plantillas HTML', 'green');
    log('\n📖 Para configurar: consulta EMAIL-SETUP.md\n', 'blue');
}

// Ejecutar según argumentos
const action = process.argv[2];

if (action === 'help' || action === '--help' || action === '-h') {
    showHelp();
} else {
    testEmailConfig().catch(console.error);
}
