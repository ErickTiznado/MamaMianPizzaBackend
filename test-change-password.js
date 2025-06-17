// Test script para probar el endpoint de cambio de contraseña
const axios = require('axios');

const BASE_URL = 'http://localhost:3001'; // Ajusta según tu puerto

// Función para probar cambio de contraseña de usuario
async function testChangePasswordUser() {
    console.log('🧪 Probando cambio de contraseña para USUARIO...\n');

    try {
        const response = await axios.put(`${BASE_URL}/auth/change-password`, {
            id_usuario: 1, // Cambia por un ID válido
            contrasenaActual: 'password123', // Contraseña actual del usuario
            nuevaContrasena: 'nuevaPassword123!'
        });

        console.log('✅ Contraseña de usuario cambiada exitosamente:');
        console.log(response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Función para probar cambio de contraseña de administrador
async function testChangePasswordAdmin() {
    console.log('🧪 Probando cambio de contraseña para ADMINISTRADOR...\n');

    try {
        const response = await axios.put(`${BASE_URL}/auth/admin/change-password`, {
            id_admin: 1, // Cambia por un ID válido
            contrasenaActual: 'adminPassword123', // Contraseña actual del admin
            nuevaContrasena: 'nuevaAdminPassword123!'
        });

        console.log('✅ Contraseña de administrador cambiada exitosamente:');
        console.log(response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Función para probar validaciones
async function testValidations() {
    console.log('🔍 Probando validaciones...\n');

    const tests = [
        {
            name: 'Contraseña actual incorrecta',
            endpoint: '/auth/change-password',
            data: {
                id_usuario: 1,
                contrasenaActual: 'passwordIncorrecta',
                nuevaContrasena: 'nuevaPassword123!'
            }
        },
        {
            name: 'Nueva contraseña muy corta',
            endpoint: '/auth/change-password',
            data: {
                id_usuario: 1,
                contrasenaActual: 'password123',
                nuevaContrasena: '123'
            }
        },
        {
            name: 'Nueva contraseña igual a la actual',
            endpoint: '/auth/change-password',
            data: {
                id_usuario: 1,
                contrasenaActual: 'password123',
                nuevaContrasena: 'password123'
            }
        },
        {
            name: 'Campos faltantes',
            endpoint: '/auth/change-password',
            data: {
                id_usuario: 1
            }
        }
    ];

    for (const test of tests) {
        try {
            console.log(`🧪 Probando: ${test.name}`);
            const response = await axios.put(`${BASE_URL}${test.endpoint}`, test.data);
            console.log(`✅ Respuesta inesperada: ${response.status}`);
        } catch (error) {
            console.log(`❌ Error esperado: ${error.response?.status} - ${error.response?.data?.message}`);
        }
        console.log('');
    }
}

// Función para mostrar información de los endpoints
function showEndpointInfo() {
    console.log('📋 INFORMACIÓN DE LOS ENDPOINTS DE CAMBIO DE CONTRASEÑA:\n');
    
    console.log('👤 USUARIOS:');
    console.log('   PUT /auth/change-password');
    console.log('   Body: { id_usuario, contrasenaActual, nuevaContrasena }\n');
    
    console.log('👨‍💼 ADMINISTRADORES:');
    console.log('   PUT /auth/admin/change-password');
    console.log('   Body: { id_admin, contrasenaActual, nuevaContrasena }\n');
    
    console.log('🔒 VALIDACIONES:');
    console.log('   • Contraseña actual debe ser correcta');
    console.log('   • Nueva contraseña mínimo 8 caracteres');
    console.log('   • Nueva contraseña debe ser diferente a la actual');
    console.log('   • Todos los campos son requeridos\n');
    
    console.log('📧 CARACTERÍSTICAS:');
    console.log('   • Envío de correo de confirmación');
    console.log('   • Encriptación segura (bcrypt saltRounds: 12)');
    console.log('   • Logs detallados para auditoría');
    console.log('   • Validación de fortaleza de contraseña\n');
}

// Ejecutar funciones según argumentos
const action = process.argv[2];

if (action === 'user') {
    testChangePasswordUser();
} else if (action === 'admin') {
    testChangePasswordAdmin();
} else if (action === 'validations') {
    testValidations();
} else if (action === 'info') {
    showEndpointInfo();
} else {
    console.log('🔧 USO DEL SCRIPT:\n');
    console.log('node test-change-password.js user         # Probar cambio usuario');
    console.log('node test-change-password.js admin        # Probar cambio admin');
    console.log('node test-change-password.js validations  # Probar validaciones');
    console.log('node test-change-password.js info         # Mostrar información');
    console.log('\n💡 NOTA: Ajusta los IDs y contraseñas en el código antes de ejecutar');
}
