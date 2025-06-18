const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001/api';

// Test del endpoint reconstruido
async function testChangePasswordEndpoint() {
    console.log('🔄 PROBANDO ENDPOINT RECONSTRUIDO DE CAMBIO DE CONTRASEÑA\n');
    
    // Datos de prueba - AJUSTA ESTOS VALORES
    const testData = {
        id_usuario: 1, // Ajusta el ID correcto del usuario
        contrasenaActual: 'Losiento321!', // La contraseña que confirmamos que funciona
        nuevaContrasena: 'nuevaPassword2024!'
    };
    
    console.log('📋 Datos de prueba:');
    console.log(`   🆔 ID Usuario: ${testData.id_usuario}`);
    console.log(`   🔑 Contraseña actual: "${testData.contrasenaActual}"`);
    console.log(`   🆕 Nueva contraseña: "${testData.nuevaContrasena}"`);
    console.log('');
    
    try {
        console.log('🚀 Enviando request al endpoint...');
        
        const response = await axios.put(`${BASE_URL}/auth/change-password`, testData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ CAMBIO DE CONTRASEÑA EXITOSO:');
        console.log(`   📊 Status: ${response.status}`);
        console.log(`   📦 Response:`, JSON.stringify(response.data, null, 2));
        
        // Verificar los campos de respuesta esperados
        const { success, message, usuario, timestamp, correo_confirmacion } = response.data;
        
        console.log('\n🔍 Verificación de respuesta:');
        console.log(`   ✅ success: ${success}`);
        console.log(`   ✅ message: ${message}`);
        console.log(`   ✅ usuario: ${JSON.stringify(usuario)}`);
        console.log(`   ✅ timestamp: ${timestamp}`);
        console.log(`   ✅ correo_confirmacion: ${correo_confirmacion}`);
        
        if (success) {
            console.log('\n🎉 ¡ENDPOINT FUNCIONANDO CORRECTAMENTE!');
            console.log('💡 Ahora puedes usar la nueva contraseña para hacer login');
        }
        
    } catch (error) {
        console.log('❌ ERROR EN EL CAMBIO DE CONTRASEÑA:');
        console.log(`   📊 Status: ${error.response?.status || 'Sin conexión'}`);
        console.log(`   📦 Error:`, error.response?.data || error.message);
        
        // Análisis del error
        console.log('\n🔍 ANÁLISIS DEL ERROR:');
        
        if (!error.response) {
            console.log('🔌 Error de conexión:');
            console.log('   • Verifica que el servidor esté ejecutándose');
            console.log('   • Verifica la URL del endpoint');
            
        } else if (error.response.status === 401) {
            console.log('🔑 Error de autenticación (401):');
            console.log('   • La contraseña actual es incorrecta');
            console.log('   • Verifica que la contraseña sea exactamente "Losiento321!"');
            console.log('   • Verifica que el ID de usuario sea correcto');
            
        } else if (error.response.status === 404) {
            console.log('👤 Usuario no encontrado (404):');
            console.log('   • Verifica que el ID de usuario exista en la base de datos');
            console.log('   • Intenta con diferentes IDs: 1, 2, 3, etc.');
            
        } else if (error.response.status === 400) {
            console.log('📝 Error de validación (400):');
            console.log('   • Verifica que todos los campos estén presentes');
            console.log('   • La nueva contraseña debe tener al menos 8 caracteres');
            console.log('   • La nueva contraseña debe ser diferente a la actual');
            
        } else if (error.response.status === 500) {
            console.log('💥 Error interno del servidor (500):');
            console.log('   • Verifica la conexión a la base de datos');
            console.log('   • Revisa los logs del servidor');
        }
        
        console.log('\n🔧 SUGERENCIAS:');
        console.log('1. Ejecuta primero el script para encontrar el ID de usuario correcto');
        console.log('2. Verifica que el servidor esté ejecutándose');
        console.log('3. Verifica la conexión a la base de datos');
    }
    
    console.log('\n🏁 Test completado.');
}

// Función para encontrar el usuario correcto
async function findCorrectUser() {
    console.log('🔍 BUSCANDO USUARIO CORRECTO...\n');
    
    const testPassword = 'Losiento321!';
    console.log(`🔑 Buscando usuario que funcione con: "${testPassword}"`);
    
    // Probar diferentes IDs de usuario
    const userIds = [1, 2, 3, 4, 5];
    
    for (const userId of userIds) {
        try {
            console.log(`\n🧪 Probando ID de usuario: ${userId}`);
            
            const testData = {
                id_usuario: userId,
                contrasenaActual: testPassword,
                nuevaContrasena: 'testPassword123!' // Contraseña temporal
            };
            
            const response = await axios.put(`${BASE_URL}/auth/change-password`, testData);
            
            console.log(`✅ ¡USUARIO ENCONTRADO! ID: ${userId}`);
            console.log(`   📦 Response:`, response.data);
            
            // Revertir el cambio (cambiar de vuelta a la contraseña original)
            console.log('🔄 Revirtiendo cambio...');
            const revertData = {
                id_usuario: userId,
                contrasenaActual: 'testPassword123!',
                nuevaContrasena: testPassword
            };
            
            await axios.put(`${BASE_URL}/auth/change-password`, revertData);
            console.log('✅ Contraseña revertida exitosamente');
            
            return userId;
            
        } catch (error) {
            if (error.response?.status === 401) {
                console.log(`❌ ID ${userId}: Contraseña incorrecta`);
            } else if (error.response?.status === 404) {
                console.log(`❌ ID ${userId}: Usuario no encontrado`);
            } else {
                console.log(`❌ ID ${userId}: Error ${error.response?.status || 'conexión'}`);
            }
        }
    }
    
    console.log('\n❌ No se encontró un usuario que funcione con esa contraseña');
    return null;
}

// Función principal
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--find-user')) {
        await findCorrectUser();
    } else if (args.includes('--test')) {
        await testChangePasswordEndpoint();
    } else {
        console.log('🧪 SCRIPT DE PRUEBA - ENDPOINT RECONSTRUIDO\n');
        console.log('Uso:');
        console.log('  node test-change-password-rebuilt.js --find-user  # Buscar usuario correcto');
        console.log('  node test-change-password-rebuilt.js --test       # Probar cambio de contraseña');
        console.log('');
        console.log('Ejecutando búsqueda por defecto...');
        await findCorrectUser();
    }
}

// Ejecutar
main().catch(error => {
    console.error('❌ Error en script:', error.message);
});
