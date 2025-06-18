const axios = require('axios');

// Script simple para probar el endpoint de cambio de contraseña
async function testChangePasswordFixed() {
    console.log('🧪 PROBANDO ENDPOINT CHANGE-PASSWORD ARREGLADO\n');
    
    const BASE_URL = 'http://localhost:3001/api';
    
    // Datos de prueba
    const testData = {
        id_usuario: 3,
        contrasenaActual: 'Losiento321',
        nuevaContrasena: 'nuevaPassword123!'
    };
    
    console.log('📋 Datos de prueba:');
    console.log(`   🆔 ID Usuario: ${testData.id_usuario}`);
    console.log(`   🔑 Contraseña actual: "${testData.contrasenaActual}"`);
    console.log(`   🆕 Nueva contraseña: "${testData.nuevaContrasena}"`);
    console.log('');
    
    try {
        console.log('🔄 Enviando petición al endpoint...');
        
        const response = await axios.put(`${BASE_URL}/auth/change-password`, testData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 segundos de timeout
        });
        
        console.log('✅ ÉXITO:');
        console.log(`   📊 Status: ${response.status}`);
        console.log(`   📦 Response:`, response.data);
        
        console.log('\n🎉 ¡Cambio de contraseña exitoso!');
        console.log('💡 Ahora puedes hacer login con la nueva contraseña');
        
    } catch (error) {
        console.log('❌ ERROR:');
        
        if (error.response) {
            console.log(`   📊 Status: ${error.response.status}`);
            console.log(`   📦 Response:`, error.response.data);
            
            // Análisis específico del error
            switch (error.response.status) {
                case 400:
                    console.log('\n💡 Error 400 - Datos inválidos:');
                    console.log('   • Verifica que todos los campos estén presentes');
                    console.log('   • La nueva contraseña debe tener al menos 8 caracteres');
                    break;
                    
                case 401:
                    console.log('\n💡 Error 401 - Contraseña actual incorrecta:');
                    console.log('   • El debugging en el servidor mostrará más detalles');
                    console.log('   • Revisa los logs del servidor');
                    break;
                    
                case 404:
                    console.log('\n💡 Error 404 - Usuario no encontrado:');
                    console.log('   • Verifica que el ID del usuario sea correcto');
                    break;
                    
                case 500:
                    console.log('\n💡 Error 500 - Error del servidor:');
                    console.log('   • Verifica que el servidor esté funcionando');
                    console.log('   • Revisa los logs del servidor para más detalles');
                    break;
            }
            
        } else if (error.code === 'ECONNREFUSED') {
            console.log('   🚫 No se puede conectar al servidor');
            console.log('\n💡 Soluciones:');
            console.log('   • Verifica que el servidor esté ejecutándose en el puerto 3001');
            console.log('   • Ejecuta: npm start o node server.js');
            
        } else {
            console.log(`   ⚠️  Error: ${error.message}`);
        }
    }
    
    console.log('\n🏁 Prueba completada.');
}

// Ejecutar prueba
console.log('🚀 Iniciando prueba del endpoint change-password...\n');
testChangePasswordFixed().catch(error => {
    console.error('❌ Error en la prueba:', error.message);
});
