const axios = require('axios');
const bcrypt = require('bcrypt');

// Configuración
const BASE_URL = 'http://localhost:3001/api'; // Ajusta según tu configuración

// Script para debuggear el endpoint de cambio de contraseña
async function debugChangePassword() {
    console.log('🔍 DEBUG DEL ENDPOINT CHANGE-PASSWORD\n');
    
    // Datos de prueba - CAMBIA ESTOS VALORES
    const testData = {
        id_usuario: 3,
        contrasenaActual: 'Losiento321', // La que SÍ funciona en login
        nuevaContrasena: 'nuevaPassword123!'
    };
    
    console.log('📋 Datos de prueba:');
    console.log(`   🆔 ID Usuario: ${testData.id_usuario}`);
    console.log(`   🔑 Contraseña actual: "${testData.contrasenaActual}"`);
    console.log(`   🆕 Nueva contraseña: "${testData.nuevaContrasena}"`);
    console.log('');
    
    try {
        // 1. Primero probar el login para confirmar que la contraseña funciona
        console.log('🔐 1. Probando LOGIN para confirmar que la contraseña es correcta...');
        
        try {
            const loginResponse = await axios.post(`${BASE_URL}/users/users_login`, {
                correo: 'nathy.zelaya5@gmail.com', // Cambia por el correo correcto
                contrasena: testData.contrasenaActual
            });
            
            console.log('✅ LOGIN exitoso:');
            console.log(`   📊 Status: ${loginResponse.status}`);
            console.log(`   📦 Response:`, loginResponse.data);
            console.log('');
            
        } catch (loginError) {
            console.log('❌ LOGIN falló:');
            console.log(`   📊 Status: ${loginError.response?.status}`);
            console.log(`   📦 Error:`, loginError.response?.data);
            console.log('⚠️  Si el login falla, confirma que la contraseña es correcta');
            console.log('');
        }
        
        // 2. Ahora probar el endpoint de cambio de contraseña
        console.log('🔄 2. Probando CHANGE-PASSWORD...');
        
        const changeResponse = await axios.put(`${BASE_URL}/auth/change-password`, testData);
        
        console.log('✅ CHANGE-PASSWORD exitoso:');
        console.log(`   📊 Status: ${changeResponse.status}`);
        console.log(`   📦 Response:`, changeResponse.data);
        
    } catch (error) {
        console.log('❌ CHANGE-PASSWORD falló:');
        console.log(`   📊 Status: ${error.response?.status}`);
        console.log(`   📦 Error:`, error.response?.data);
        
        // Análisis detallado del error
        console.log('\n🔍 ANÁLISIS DEL ERROR:');
        
        if (error.response?.status === 401) {
            console.log('❌ Error 401: La contraseña actual es incorrecta');
            console.log('💡 Posibles causas:');
            console.log('   1. El hash en la BD es diferente al usado en login');
            console.log('   2. Hay espacios extras en la contraseña');
            console.log('   3. Problema en la comparación bcrypt en changePassword');
            console.log('   4. El usuario ID no coincide');
            
        } else if (error.response?.status === 404) {
            console.log('❌ Error 404: Usuario no encontrado');
            console.log('💡 Verifica que el ID del usuario sea correcto');
            
        } else if (error.response?.status === 400) {
            console.log('❌ Error 400: Datos inválidos');
            console.log('💡 Revisa que todos los campos estén presentes');
            
        } else {
            console.log('❌ Error desconocido');
        }
        
        // 3. Investigación adicional: comparar manualmente
        console.log('\n🧪 3. COMPARACIÓN MANUAL DE HASHES...');
        
        try {
            // Obtener el hash de la BD manualmente
            const pool = require('./config/db');
            
            pool.query(
                'SELECT id_usuario, nombre, correo, contrasena FROM usuarios WHERE id_usuario = ?',
                [testData.id_usuario],
                async (err, results) => {
                    if (err) {
                        console.error('❌ Error consultando BD:', err);
                        return;
                    }
                    
                    if (results.length === 0) {
                        console.log('❌ Usuario no encontrado en BD');
                        return;
                    }
                    
                    const user = results[0];
                    console.log('📊 Datos del usuario en BD:');
                    console.log(`   🆔 ID: ${user.id_usuario}`);
                    console.log(`   👤 Nombre: ${user.nombre}`);
                    console.log(`   📧 Correo: ${user.correo}`);
                    console.log(`   🔐 Hash: ${user.contrasena}`);
                    
                    // Comparación manual
                    console.log('\n🔍 Comparación manual con bcrypt:');
                    try {
                        const manualMatch = await bcrypt.compare(testData.contrasenaActual, user.contrasena);
                        console.log(`   🔄 bcrypt.compare("${testData.contrasenaActual}", hash) = ${manualMatch}`);
                        
                        if (manualMatch) {
                            console.log('✅ La comparación manual SÍ funciona');
                            console.log('💡 El problema está en el código del endpoint changePassword');
                        } else {
                            console.log('❌ La comparación manual NO funciona');
                            console.log('💡 Hay una diferencia entre el hash del login y del changePassword');
                        }
                        
                    } catch (bcryptError) {
                        console.error('❌ Error en comparación manual:', bcryptError);
                    }
                    
                    process.exit(0);
                }
            );
            
        } catch (dbError) {
            console.error('❌ Error accediendo a la BD:', dbError);
            process.exit(1);
        }
    }
}

// Función adicional para probar con datos diferentes
async function testWithDifferentData() {
    console.log('\n🔄 PROBANDO CON DATOS ALTERNATIVOS...\n');
    
    const alternativeTests = [
        {
            name: 'Con espacios removidos',
            data: {
                id_usuario: 3,
                contrasenaActual: 'Losiento321'.trim(),
                nuevaContrasena: 'nuevaPassword123!'
            }
        },
        {
            name: 'Con ID como string',
            data: {
                id_usuario: '3',
                contrasenaActual: 'Losiento321',
                nuevaContrasena: 'nuevaPassword123!'
            }
        },
        {
            name: 'Con nueva contraseña diferente',
            data: {
                id_usuario: 3,
                contrasenaActual: 'Losiento321',
                nuevaContrasena: 'otraPassword456!'
            }
        }
    ];
    
    for (const test of alternativeTests) {
        console.log(`🧪 Probando: ${test.name}`);
        
        try {
            const response = await axios.put(`${BASE_URL}/auth/change-password`, test.data);
            console.log(`✅ ${test.name} - ÉXITO:`, response.data);
            break; // Si uno funciona, no probar más
            
        } catch (error) {
            console.log(`❌ ${test.name} - FALLÓ:`, error.response?.data?.message || error.message);
        }
        
        console.log('');
    }
}

// Ejecutar diagnóstico
console.log('🚀 Iniciando diagnóstico de change-password...\n');
debugChangePassword().catch(error => {
    console.error('❌ Error en diagnóstico:', error.message);
    process.exit(1);
});
