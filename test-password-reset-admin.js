const axios = require('axios');

// Configuración
const BASE_URL = 'https://api.mamamianpizza.com/api'; // Cambia por tu URL

// Función principal para probar el flujo completo de administradores
async function testPasswordResetFlowAdmin() {
    console.log('🧪 Iniciando pruebas del flujo de restablecimiento de contraseña para ADMINISTRADORES...\n');

    try {
        // Paso 1: Solicitar código de restablecimiento para admin
        console.log('📧 Paso 1: Solicitando código de restablecimiento para ADMINISTRADOR...');
        const resetRequest = await axios.post(`${BASE_URL}/auth/admin/request-reset`, {
            correo: 'admin@mamamianpizza.com' // Cambia por un correo que exista en tu tabla administradores
        });

        console.log('✅ Respuesta:', resetRequest.data);
        console.log('📧 Revisa tu correo electrónico para obtener el código de administrador\n');

        // Esperar a que el usuario ingrese el código
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const otp = await new Promise((resolve) => {
            rl.question('Ingresa el código OTP de ADMINISTRADOR que recibiste por correo: ', (answer) => {
                rl.close();
                resolve(answer);
            });
        });

        // Paso 2: Verificar código OTP para admin
        console.log('\n🔍 Paso 2: Verificando código OTP de ADMINISTRADOR...');
        const verifyRequest = await axios.post(`${BASE_URL}/auth/admin/verify-reset`, {
            correo: 'admin@mamamianpizza.com',
            otp: otp
        });

        console.log('✅ Respuesta:', verifyRequest.data);
        const token = verifyRequest.data.token;

        // Paso 3: Cambiar contraseña de admin
        console.log('\n🔐 Paso 3: Cambiando contraseña de ADMINISTRADOR...');
        const resetPassword = await axios.put(`${BASE_URL}/auth/admin/reset-password`, {
            token: token,
            nuevaContrasena: 'adminPassword123!'
        });

        console.log('✅ Respuesta:', resetPassword.data);
        console.log('\n🎉 ¡Flujo de ADMINISTRADOR completado exitosamente!');

    } catch (error) {
        console.error('❌ Error en la prueba de ADMINISTRADOR:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Función para probar solo el paso 1 de admins
async function testRequestResetAdmin() {
    console.log('📧 Probando solo el envío de código para ADMINISTRADOR...\n');

    try {
        const response = await axios.post(`${BASE_URL}/auth/admin/request-reset`, {
            correo: 'admin@mamamianpizza.com' // Cambia por un correo válido de administrador
        });

        console.log('✅ Código de ADMINISTRADOR enviado exitosamente:');
        console.log(response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Función para comparar flujos de usuario vs admin
async function compareUserVsAdminFlow() {
    console.log('🔄 Comparando flujos de Usuario vs Administrador...\n');

    try {
        // Probar endpoint de usuario
        console.log('👤 Probando endpoint de USUARIO...');
        const userResponse = await axios.post(`${BASE_URL}/auth/request-reset`, {
            correo: 'usuario@ejemplo.com'
        });
        console.log('Usuario response:', userResponse.data);

        // Probar endpoint de admin
        console.log('\n👨‍💼 Probando endpoint de ADMINISTRADOR...');
        const adminResponse = await axios.post(`${BASE_URL}/auth/admin/request-reset`, {
            correo: 'admin@mamamianpizza.com'
        });
        console.log('Admin response:', adminResponse.data);

    } catch (error) {
        console.error('❌ Error en comparación:', error.response?.data || error.message);
    }
}

// Función para probar validaciones específicas de admin
async function testAdminValidations() {
    console.log('🔍 Probando validaciones específicas de ADMINISTRADOR...\n');

    const tests = [
        {
            name: 'Correo vacío',
            data: {}
        },
        {
            name: 'Correo inválido',
            data: { correo: 'correo-invalido' }
        },
        {
            name: 'Correo no registrado como admin',
            data: { correo: 'noexiste@admin.com' }
        }
    ];

    for (const test of tests) {
        try {
            console.log(`🧪 Probando: ${test.name}`);
            const response = await axios.post(`${BASE_URL}/auth/admin/request-reset`, test.data);
            console.log(`✅ Respuesta inesperada: ${response.status}`);
        } catch (error) {
            console.log(`❌ Error esperado: ${error.response?.status} - ${error.response?.data?.message}`);
        }
        console.log('');
    }
}

// Función de ayuda para mostrar las diferencias
function showAdminFeatures() {
    console.log('📋 CARACTERÍSTICAS DEL SISTEMA DE ADMINISTRADORES:\n');
    
    console.log('🔗 ENDPOINTS:');
    console.log('   POST /auth/admin/request-reset  - Solicitar código admin');
    console.log('   POST /auth/admin/verify-reset   - Verificar código admin');
    console.log('   PUT  /auth/admin/reset-password - Cambiar contraseña admin\n');
    
    console.log('🎨 TEMPLATES ESPECÍFICOS:');
    console.log('   • Colores de administración (marrón/dorado)');
    console.log('   • Badge de "ADMINISTRADOR"');
    console.log('   • Warnings de seguridad específicos');
    console.log('   • Información de contacto admin\n');
    
    console.log('🔒 VALIDACIONES:');
    console.log('   • Tabla: administradores (no usuarios)');
    console.log('   • user_type: "administrador"');
    console.log('   • Encriptación más fuerte (saltRounds: 12)');
    console.log('   • Logs específicos para admin\n');
    
    console.log('📧 CORREOS:');
    console.log('   • Subject específico para admins');
    console.log('   • Templates con diseño corporativo');
    console.log('   • Información de seguridad adicional\n');
}

// Ejecutar funciones según argumentos
const args = process.argv.slice(2);

if (args.includes('--full')) {
    testPasswordResetFlowAdmin();
} else if (args.includes('--request-only')) {
    testRequestResetAdmin();
} else if (args.includes('--compare')) {
    compareUserVsAdminFlow();
} else if (args.includes('--validations')) {
    testAdminValidations();
} else if (args.includes('--features')) {
    showAdminFeatures();
} else {
    console.log('🧪 SCRIPT DE PRUEBAS PARA ADMINISTRADORES - MAMA MIAN PIZZA\n');
    console.log('Uso:');
    console.log('  node test-password-reset-admin.js --full         # Flujo completo');
    console.log('  node test-password-reset-admin.js --request-only # Solo envío de código');
    console.log('  node test-password-reset-admin.js --compare      # Comparar user vs admin');
    console.log('  node test-password-reset-admin.js --validations  # Probar validaciones');
    console.log('  node test-password-reset-admin.js --features     # Mostrar características');
    console.log('\nPor defecto, ejecuta --features para mostrar información.');
    console.log('');
    showAdminFeatures();
}
