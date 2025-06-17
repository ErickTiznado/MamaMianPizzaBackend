const axios = require('axios');

// Configuración del servidor
const BASE_URL = 'http://localhost:3000/api'; // Ajusta según tu configuración

// ================================================================
// SCRIPT DE PRUEBA PARA CAMBIO DE CONTRASEÑA DE ADMINISTRADORES
// ================================================================

// Función para probar cambio de contraseña de administrador
async function testChangePasswordAdmin() {
    console.log('🧪 Iniciando pruebas del cambio de contraseña para ADMINISTRADORES...\n');

    try {
        // Datos de prueba - CAMBIA ESTOS VALORES POR DATOS REALES
        const datosAdmin = {
            correo: 'admin@mamamianpizza.com', // Cambia por un correo que exista en tu tabla administradores
            contrasenaActual: 'adminPassword123!', // La contraseña actual del admin
            nuevaContrasena: 'newAdminPassword456@' // La nueva contraseña que quieres establecer
        };

        console.log('🔐 Cambiando contraseña de administrador...');
        console.log(`📧 Admin: ${datosAdmin.correo}`);
        
        const response = await axios.put(`${BASE_URL}/auth/admin/change-password`, datosAdmin);

        console.log('✅ Respuesta exitosa:', response.data);
        console.log('\n🎉 ¡Cambio de contraseña de ADMINISTRADOR completado exitosamente!');
        console.log('\n📊 DETALLES DE LA OPERACIÓN:');
        console.log(`   👤 Administrador: ${response.data.administrador.nombre}`);
        console.log(`   📧 Correo: ${response.data.administrador.correo}`);
        console.log(`   🕒 Timestamp: ${response.data.timestamp}`);
        console.log(`   📧 Confirmación: ${response.data.correo_confirmacion}`);

    } catch (error) {
        console.error('❌ Error en la prueba de cambio de contraseña de ADMINISTRADOR:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            
            // Mensajes específicos según el error
            switch (error.response.status) {
                case 400:
                    console.error('\n💡 SUGERENCIAS:');
                    console.error('   • Verifica que todos los campos estén presentes');
                    console.error('   • La nueva contraseña debe tener al menos 8 caracteres');
                    console.error('   • La nueva contraseña debe ser diferente a la actual');
                    break;
                case 401:
                    console.error('\n💡 SUGERENCIAS:');
                    console.error('   • Verifica que la contraseña actual sea correcta');
                    break;
                case 404:
                    console.error('\n💡 SUGERENCIAS:');
                    console.error('   • Verifica que el correo del administrador exista en la base de datos');
                    console.error('   • Asegúrate de usar un correo válido de la tabla administradores');
                    break;
                case 500:
                    console.error('\n💡 SUGERENCIAS:');
                    console.error('   • Verifica la conexión a la base de datos');
                    console.error('   • Revisa los logs del servidor para más detalles');
                    break;
            }
        } else {
            console.error('Error:', error.message);
            console.error('\n💡 SUGERENCIAS:');
            console.error('   • Verifica que el servidor esté ejecutándose en el puerto correcto');
            console.error('   • Asegúrate de que la URL base sea correcta');
        }
    }
}

// Función para probar validaciones específicas de admin
async function testAdminChangePasswordValidations() {
    console.log('🔍 Probando validaciones específicas de cambio de contraseña ADMIN...\n');

    const tests = [
        {
            name: 'ID de admin faltante',
            data: {
                contrasenaActual: 'adminPassword123',
                nuevaContrasena: 'nuevaAdminPassword123!'
            }
        },
        {
            name: 'Contraseña actual faltante',
            data: {
                id_admin: 1,
                nuevaContrasena: 'nuevaAdminPassword123!'
            }
        },
        {
            name: 'Nueva contraseña faltante',
            data: {
                id_admin: 1,
                contrasenaActual: 'adminPassword123'
            }
        },
        {
            name: 'Nueva contraseña muy corta',
            data: {
                id_admin: 1,
                contrasenaActual: 'adminPassword123',
                nuevaContrasena: '123'
            }
        },
        {
            name: 'ID de admin no existe',
            data: {
                id_admin: 99999,
                contrasenaActual: 'adminPassword123',
                nuevaContrasena: 'nuevaAdminPassword123!'
            }
        },
        {
            name: 'Contraseña actual incorrecta',
            data: {
                id_admin: 1,
                contrasenaActual: 'contraseñaIncorrecta',
                nuevaContrasena: 'nuevaAdminPassword123!'
            }
        },
        {
            name: 'Nueva contraseña igual a la actual',
            data: {
                id_admin: 1,
                contrasenaActual: 'adminPassword123',
                nuevaContrasena: 'adminPassword123' // Misma contraseña
            }
        }
    ];

    for (const test of tests) {
        try {
            console.log(`🧪 Probando: ${test.name}`);
            const response = await axios.put(`${BASE_URL}/auth/admin/change-password`, test.data);
            console.log(`✅ Respuesta inesperada: ${response.status}`);
            console.log(JSON.stringify(response.data, null, 2));
        } catch (error) {
            console.log(`❌ Error esperado: ${error.response?.status} - ${error.response?.data?.message}`);
        }
        console.log('');
    }
}

// Función para mostrar características del sistema
function showAdminChangePasswordFeatures() {
    console.log('📋 CARACTERÍSTICAS DEL CAMBIO DE CONTRASEÑA PARA ADMINISTRADORES:\n');
    
    console.log('🔗 ENDPOINT:');
    console.log('   PUT /auth/admin/change-password\n');
    
    console.log('📝 DATOS REQUERIDOS:');
    console.log('   • id_admin: ID del administrador');
    console.log('   • contrasenaActual: Contraseña actual');
    console.log('   • nuevaContrasena: Nueva contraseña (min 8 caracteres)\n');
    
    console.log('🔒 VALIDACIONES:');
    console.log('   • Administrador debe existir en tabla "administradores"');
    console.log('   • Contraseña actual debe ser correcta');
    console.log('   • Nueva contraseña min 8 caracteres');
    console.log('   • Nueva contraseña debe ser diferente a la actual');
    console.log('   • Encriptación con saltRounds: 12 (mayor seguridad)\n');
    
    console.log('📧 CORREO DE CONFIRMACIÓN:');
    console.log('   • Template específico para administradores');
    console.log('   • Subject: "✅ Contraseña Admin Actualizada"');
    console.log('   • Colores corporativos (marrón/dorado)');
    console.log('   • Warnings de seguridad adicionales\n');
    
    console.log('🎨 DIFERENCIAS CON USUARIOS:');
    console.log('   • Tabla: administradores (no usuarios)');
    console.log('   • Mayor encriptación (saltRounds: 12 vs 10)');
    console.log('   • Templates de correo específicos');
    console.log('   • Validaciones específicas de admin\n');
    
    console.log('✅ RESPUESTA EXITOSA:');
    console.log('   • success: true');
    console.log('   • message: Confirmación de cambio');
    console.log('   • administrador: Nombre del admin');
    console.log('   • timestamp: Fecha y hora del cambio');
    console.log('   • correo_confirmacion: Estado del envío');
    console.log('   • tipo_usuario: "administrador"\n');
}

// Función para comparar user vs admin
function showUserVsAdminComparison() {
    console.log('📊 COMPARACIÓN: USUARIO VS ADMINISTRADOR\n');
    
    console.log('| Característica | Usuario | Administrador |');
    console.log('|----------------|---------|---------------|');
    console.log('| **Endpoint** | `/auth/change-password` | `/auth/admin/change-password` |');
    console.log('| **Campo ID** | `id_usuario` | `id_admin` |');
    console.log('| **Tabla BD** | `usuarios` | `administradores` |');
    console.log('| **saltRounds** | `10` | `12` |');
    console.log('| **Template** | Usuario estándar | Admin corporativo |');
    console.log('| **Colores** | Naranja/Rojo | Marrón/Dorado |');
    console.log('| **Subject** | "Contraseña Actualizada" | "Contraseña Admin Actualizada" |');
    console.log('| **Seguridad** | Estándar | Reforzada |\n');
}

// Función principal
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
        await testChangePasswordAdmin();
    } else if (args.includes('--validations')) {
        await testAdminChangePasswordValidations();
    } else if (args.includes('--compare')) {
        showUserVsAdminComparison();
    } else if (args.includes('--features')) {
        showAdminChangePasswordFeatures();
    } else {
        console.log('🧪 SCRIPT DE PRUEBAS - CAMBIO DE CONTRASEÑA ADMIN - MAMA MIAN PIZZA\n');
        console.log('Uso:');
        console.log('  node test-change-password-admin.js --test         # Probar cambio exitoso');
        console.log('  node test-change-password-admin.js --validations  # Probar validaciones');
        console.log('  node test-change-password-admin.js --compare      # Comparar user vs admin');
        console.log('  node test-change-password-admin.js --features     # Mostrar características');
        console.log('\nPor defecto, muestra las características del sistema.');
        console.log('');
        showAdminChangePasswordFeatures();
    }
}

// Ejecutar el script
main().catch(console.error);
