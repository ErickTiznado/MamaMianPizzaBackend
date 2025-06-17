// Test script para probar el flujo de restablecimiento de contraseña por correo
const axios = require('axios');

const BASE_URL = 'http://localhost:3001'; // Ajusta según tu puerto

async function testPasswordResetFlow() {
    console.log('🧪 Iniciando pruebas del flujo de restablecimiento de contraseña por correo...\n');

    try {
        // Paso 1: Solicitar código de restablecimiento
        console.log('📧 Paso 1: Solicitando código de restablecimiento...');
        const resetRequest = await axios.post(`${BASE_URL}/auth/request-reset`, {
            correo: 'nathy.zelaya55@gmail.com' // Cambia por un correo que exista en tu BD
        });

        console.log('✅ Respuesta:', resetRequest.data);
        console.log('📧 Revisa tu correo electrónico para obtener el código\n');

        // Esperar a que el usuario ingrese el código
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const otp = await new Promise((resolve) => {
            rl.question('Ingresa el código OTP que recibiste por correo: ', (answer) => {
                rl.close();
                resolve(answer);
            });
        });

        // Paso 2: Verificar código OTP
        console.log('\n🔍 Paso 2: Verificando código OTP...');
        const verifyRequest = await axios.post(`${BASE_URL}/auth/verify-reset`, {
            correo: 'nathy.zelaya55@gmail.com',
            otp: otp
        });

        console.log('✅ Respuesta:', verifyRequest.data);
        const token = verifyRequest.data.token;

        // Paso 3: Cambiar contraseña
        console.log('\n🔐 Paso 3: Cambiando contraseña...');
        const resetPassword = await axios.put(`${BASE_URL}/auth/reset-password`, {
            token: token,
            nuevaContrasena: 'nuevaPassword123!'
        });

        console.log('✅ Respuesta:', resetPassword.data);
        console.log('\n🎉 ¡Flujo completado exitosamente!');

    } catch (error) {
        console.error('❌ Error en la prueba:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Función para probar solo el paso 1
async function testRequestReset() {
    console.log('📧 Probando solo el envío de código...\n');

    try {
        const response = await axios.post(`${BASE_URL}/auth/request-reset`, {
            correo: 'nathy.zelaya55@gmail.com' // Cambia por un correo válido
        });

        console.log('✅ Código enviado exitosamente:');
        console.log(response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Ejecutar según el argumento
const action = process.argv[2];

if (action === 'request') {
    testRequestReset();
} else if (action === 'full') {
    testPasswordResetFlow();
} else {
    console.log('Uso:');
    console.log('node test-password-reset.js request  # Solo probar envío de código');
    console.log('node test-password-reset.js full     # Probar flujo completo');
}
