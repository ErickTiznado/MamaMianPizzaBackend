const pool = require('./config/db');
const bcrypt = require('bcrypt');

// Script para diagnosticar problemas de contraseña
async function debugPasswordIssue() {
    console.log('🔍 DIAGNÓSTICO DE CONTRASEÑA - DEBUG\n');
    
    // Datos de prueba - CAMBIA ESTOS VALORES
    const testUserId = 3; // Cambia por tu ID de usuario
    const testPassword = 'Losiento321'; // Cambia por la contraseña que crees que es correcta
    
    try {
        // 1. Obtener datos del usuario
        console.log('📊 1. Obteniendo datos del usuario...');
        const getUserQuery = 'SELECT id_usuario, nombre, correo, contrasena FROM usuarios WHERE id_usuario = ?';
        
        pool.query(getUserQuery, [testUserId], async (err, results) => {
            if (err) {
                console.error('❌ Error al obtener usuario:', err);
                return;
            }
            
            if (results.length === 0) {
                console.error('❌ Usuario no encontrado con ID:', testUserId);
                return;
            }
            
            const user = results[0];
            console.log('✅ Usuario encontrado:');
            console.log(`   📧 Correo: ${user.correo}`);
            console.log(`   👤 Nombre: ${user.nombre}`);
            console.log(`   🔑 Hash almacenado: ${user.contrasena}`);
            console.log(`   📏 Longitud del hash: ${user.contrasena.length}`);
            console.log(`   🏷️  Tipo de hash: ${user.contrasena.substring(0, 4)}`);
            
            // 2. Verificar estructura del hash
            console.log('\n🔍 2. Analizando estructura del hash...');
            if (user.contrasena.startsWith('$2b$') || user.contrasena.startsWith('$2a$')) {
                console.log('✅ Hash bcrypt válido detectado');
                const parts = user.contrasena.split('$');
                console.log(`   🔧 Algoritmo: ${parts[1]}`);
                console.log(`   📊 Salt rounds: ${parts[2]}`);
            } else {
                console.log('⚠️  Hash no parece ser bcrypt válido');
            }
            
            // 3. Probar comparación de contraseña
            console.log('\n🔐 3. Probando comparación de contraseña...');
            console.log(`   🧪 Contraseña a probar: "${testPassword}"`);
            
            try {
                const isMatch = await bcrypt.compare(testPassword, user.contrasena);
                console.log(`   ✅ Resultado de bcrypt.compare(): ${isMatch}`);
                
                if (isMatch) {
                    console.log('🎉 ¡CONTRASEÑA CORRECTA!');
                } else {
                    console.log('❌ Contraseña incorrecta');
                    
                    // 4. Sugerencias de debugging
                    console.log('\n💡 4. Sugerencias de debugging:');
                    console.log('   • Verifica que no haya espacios extra en la contraseña');
                    console.log('   • Verifica mayúsculas y minúsculas');
                    console.log('   • Verifica caracteres especiales');
                    console.log('   • ¿La contraseña fue cambiada recientemente?');
                    
                    // 5. Probar algunas variaciones comunes
                    console.log('\n🔄 5. Probando variaciones comunes...');
                    const variations = [
                        testPassword.trim(),
                        testPassword.toLowerCase(),
                        testPassword.toUpperCase(),
                        testPassword + '!',
                        testPassword + '123'
                    ];
                    
                    for (const variation of variations) {
                        try {
                            const varMatch = await bcrypt.compare(variation, user.contrasena);
                            console.log(`   🧪 "${variation}": ${varMatch ? '✅ MATCH!' : '❌ No match'}`);
                        } catch (err) {
                            console.log(`   🧪 "${variation}": Error al comparar`);
                        }
                    }
                }
                
            } catch (compareError) {
                console.error('❌ Error en bcrypt.compare():', compareError);
            }
            
            // 6. Crear nueva contraseña de prueba
            console.log('\n🆕 6. Creando nueva contraseña de prueba...');
            const newTestPassword = 'testPassword123!';
            const saltRounds = 12;
            
            try {
                const newHash = await bcrypt.hash(newTestPassword, saltRounds);
                console.log(`   🔑 Nueva contraseña: "${newTestPassword}"`);
                console.log(`   🔐 Hash generado: ${newHash}`);
                
                // Verificar que la nueva funciona
                const newMatch = await bcrypt.compare(newTestPassword, newHash);
                console.log(`   ✅ Verificación nueva contraseña: ${newMatch}`);
                
                console.log('\n📝 COMANDO SQL para actualizar (OPCIONAL):');
                console.log(`UPDATE usuarios SET contrasena = '${newHash}' WHERE id_usuario = ${testUserId};`);
                
            } catch (hashError) {
                console.error('❌ Error al crear nuevo hash:', hashError);
            }
            
            console.log('\n🏁 Diagnóstico completado.');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Error general:', error);
        process.exit(1);
    }
}

// Ejecutar diagnóstico
debugPasswordIssue();
