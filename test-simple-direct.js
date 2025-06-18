const pool = require('./config/db');
const bcrypt = require('bcrypt');

// Test simple y directo
async function simpleTest() {
    console.log('🔍 TEST SIMPLE Y DIRECTO\n');
    
    const testPasswords = ['Losiento321!', 'Losiento321'];
    const testEmail = 'nathy.zelaya5@gmail.com';
    
    console.log(`📧 Buscando usuarios con email: ${testEmail}`);
    console.log(`🔑 Contraseñas a probar: ${testPasswords.join(', ')}`);
    console.log('');
    
    // Usar promesa para evitar callbacks anidados
    return new Promise((resolve, reject) => {
        pool.query(
            'SELECT id_usuario, nombre, correo, contrasena FROM usuarios WHERE correo = ? LIMIT 5',
            [testEmail],
            async (err, results) => {
                if (err) {
                    console.error('❌ Error SQL:', err);
                    reject(err);
                    return;
                }
                
                console.log(`📊 Encontrados ${results.length} usuarios:`);
                
                if (results.length === 0) {
                    console.log('❌ No se encontraron usuarios con ese correo');
                    
                    // Buscar sin filtro de correo
                    console.log('\n🔍 Buscando TODOS los usuarios (primeros 10)...');
                    
                    pool.query(
                        'SELECT id_usuario, nombre, correo, contrasena FROM usuarios LIMIT 10',
                        [],
                        async (err2, allResults) => {
                            if (err2) {
                                console.error('❌ Error SQL 2:', err2);
                                reject(err2);
                                return;
                            }
                            
                            console.log(`📊 Usuarios en la BD:`);
                            for (const user of allResults) {
                                console.log(`   🆔 ID: ${user.id_usuario} | 📧 ${user.correo} | 👤 ${user.nombre}`);
                            }
                            
                            resolve();
                        }
                    );
                    return;
                }
                
                // Probar cada usuario encontrado
                for (let i = 0; i < results.length; i++) {
                    const user = results[i];
                    console.log(`\n👤 Usuario ${i + 1}:`);
                    console.log(`   🆔 ID: ${user.id_usuario}`);
                    console.log(`   👤 Nombre: ${user.nombre}`);
                    console.log(`   📧 Correo: ${user.correo}`);
                    console.log(`   🔐 Hash: ${user.contrasena}`);
                    
                    // Probar cada contraseña
                    for (const password of testPasswords) {
                        try {
                            const matches = await bcrypt.compare(password, user.contrasena);
                            console.log(`   🔄 "${password}" = ${matches ? '✅ MATCH!' : '❌ No match'}`);
                            
                            if (matches) {
                                console.log(`\n🎉 ¡ENCONTRADO!`);
                                console.log(`   📝 Usuario ID: ${user.id_usuario}`);
                                console.log(`   📝 Contraseña correcta: "${password}"`);
                                console.log(`   📝 Usa este ID en tu endpoint de change-password`);
                                
                                // Crear comando de prueba
                                console.log(`\n🧪 COMANDO DE PRUEBA:`);
                                console.log(`curl -X PUT http://localhost:3001/api/auth/change-password \\`);
                                console.log(`  -H "Content-Type: application/json" \\`);
                                console.log(`  -d '{`);
                                console.log(`    "id_usuario": ${user.id_usuario},`);
                                console.log(`    "contrasenaActual": "${password}",`);
                                console.log(`    "nuevaContrasena": "nuevaPassword123!"`);
                                console.log(`  }'`);
                            }
                        } catch (compareErr) {
                            console.log(`   🔄 "${password}" = ❌ Error: ${compareErr.message}`);
                        }
                    }
                }
                
                console.log('\n🏁 Test completado.');
                resolve();
            }
        );
    });
}

// Ejecutar
simpleTest().then(() => {
    console.log('✅ Proceso completado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
