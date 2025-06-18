const pool = require('./config/db');
const bcrypt = require('bcrypt');

// Script para investigar la diferencia entre login y change-password
async function investigateHashDifference() {
    console.log('🕵️ INVESTIGACIÓN DE DIFERENCIAS DE HASH\n');
    
    const testEmail = 'nathy.zelaya5@gmail.com';
    const testPassword = 'Losiento321';
    
    console.log(`📧 Email a investigar: ${testEmail}`);
    console.log(`🔑 Contraseña a probar: "${testPassword}"`);
    console.log('');
    
    try {
        // 1. Buscar TODOS los usuarios con ese correo
        console.log('🔍 1. Buscando TODOS los usuarios con ese correo...');
        
        pool.query(
            'SELECT id_usuario, nombre, correo, contrasena FROM usuarios WHERE correo = ?',
            [testEmail],
            async (err, userResults) => {
                if (err) {
                    console.error('❌ Error consultando usuarios:', err);
                    return;
                }
                
                console.log(`📊 Encontrados ${userResults.length} usuarios con ese correo:`);
                
                for (let i = 0; i < userResults.length; i++) {
                    const user = userResults[i];
                    console.log(`\n👤 Usuario ${i + 1}:`);
                    console.log(`   🆔 ID: ${user.id_usuario}`);
                    console.log(`   👤 Nombre: ${user.nombre}`);
                    console.log(`   📧 Correo: ${user.correo}`);
                    console.log(`   🔐 Hash: ${user.contrasena}`);
                    
                    // Probar la contraseña contra cada hash
                    try {
                        const matches = await bcrypt.compare(testPassword, user.contrasena);
                        console.log(`   🔄 bcrypt.compare("${testPassword}", hash) = ${matches ? '✅ TRUE' : '❌ FALSE'}`);
                        
                        if (matches) {
                            console.log(`   🎉 ¡ESTE ES EL USUARIO CORRECTO!`);
                            
                            // Probar otras variaciones también
                            console.log(`   🧪 Probando variaciones adicionales:`);
                            const variations = [
                                testPassword.trim(),
                                testPassword.toLowerCase(),
                                testPassword.toUpperCase(),
                                ' ' + testPassword,
                                testPassword + ' ',
                                testPassword + '!',
                                testPassword.replace('321', '123')
                            ];
                            
                            for (const variation of variations) {
                                const varMatch = await bcrypt.compare(variation, user.contrasena);
                                if (varMatch && variation !== testPassword) {
                                    console.log(`   🎯 OTRA VARIACIÓN QUE FUNCIONA: "${variation}"`);
                                }
                            }
                        }
                        
                    } catch (compareErr) {
                        console.log(`   ❌ Error comparando: ${compareErr.message}`);
                    }
                }
                
                // 2. Buscar también en administradores por si acaso
                console.log('\n🔍 2. Verificando también tabla ADMINISTRADORES...');
                
                pool.query(
                    'SELECT id_admin, nombre, correo, contrasena FROM administradores WHERE correo = ?',
                    [testEmail],
                    async (err, adminResults) => {
                        if (err) {
                            console.error('❌ Error consultando administradores:', err);
                        } else {
                            console.log(`📊 Encontrados ${adminResults.length} administradores con ese correo:`);
                            
                            for (let i = 0; i < adminResults.length; i++) {
                                const admin = adminResults[i];
                                console.log(`\n👨‍💼 Administrador ${i + 1}:`);
                                console.log(`   🆔 ID: ${admin.id_admin}`);
                                console.log(`   👤 Nombre: ${admin.nombre}`);
                                console.log(`   📧 Correo: ${admin.correo}`);
                                console.log(`   🔐 Hash: ${admin.contrasena}`);
                                
                                try {
                                    const matches = await bcrypt.compare(testPassword, admin.contrasena);
                                    console.log(`   🔄 bcrypt.compare("${testPassword}", hash) = ${matches ? '✅ TRUE' : '❌ FALSE'}`);
                                    
                                    if (matches) {
                                        console.log(`   🎉 ¡ESTE ADMIN TAMBIÉN FUNCIONA!`);
                                    }
                                    
                                } catch (compareErr) {
                                    console.log(`   ❌ Error comparando admin: ${compareErr.message}`);
                                }
                            }
                        }
                        
                        // 3. Análisis final
                        console.log('\n📋 3. ANÁLISIS FINAL:');
                        
                        const workingUsers = userResults.filter(async (user) => {
                            try {
                                return await bcrypt.compare(testPassword, user.contrasena);
                            } catch {
                                return false;
                            }
                        });
                        
                        // 4. Probar login manual con diferentes IDs
                        console.log('\n🧪 4. PROBANDO LOGIN MANUAL CON DIFERENTES IDs...');
                        
                        const testUserIds = [1, 2, 3, 4, 5]; // Probar varios IDs
                        
                        for (const userId of testUserIds) {
                            pool.query(
                                'SELECT id_usuario, nombre, correo, contrasena FROM usuarios WHERE id_usuario = ?',
                                [userId],
                                async (err, singleUserResults) => {
                                    if (err || singleUserResults.length === 0) return;
                                    
                                    const singleUser = singleUserResults[0];
                                    
                                    try {
                                        const matches = await bcrypt.compare(testPassword, singleUser.contrasena);
                                        if (matches) {
                                            console.log(`🎯 USUARIO ID ${userId} SÍ FUNCIONA:`);
                                            console.log(`   📧 Correo: ${singleUser.correo}`);
                                            console.log(`   👤 Nombre: ${singleUser.nombre}`);
                                            console.log(`   🔐 Hash: ${singleUser.contrasena}`);
                                        }
                                    } catch (compareErr) {
                                        // Silenciar errores
                                    }
                                }
                            );
                        }
                        
                        // 5. Buscar por nombre también
                        console.log('\n🔍 5. BUSCANDO POR NOMBRE "nathaly"...');
                        
                        pool.query(
                            'SELECT id_usuario, nombre, correo, contrasena FROM usuarios WHERE nombre LIKE ? OR nombre LIKE ?',
                            ['%nathaly%', '%Nathaly%'],
                            async (err, nameResults) => {
                                if (err) {
                                    console.error('❌ Error buscando por nombre:', err);
                                    process.exit(1);
                                    return;
                                }
                                
                                console.log(`📊 Encontrados ${nameResults.length} usuarios con nombre similar:`);
                                
                                for (const user of nameResults) {
                                    console.log(`\n👤 Usuario:`);
                                    console.log(`   🆔 ID: ${user.id_usuario}`);
                                    console.log(`   👤 Nombre: ${user.nombre}`);
                                    console.log(`   📧 Correo: ${user.correo}`);
                                    console.log(`   🔐 Hash: ${user.contrasena}`);
                                    
                                    try {
                                        const matches = await bcrypt.compare(testPassword, user.contrasena);
                                        console.log(`   🔄 Contraseña match: ${matches ? '✅ SÍ' : '❌ NO'}`);
                                        
                                        if (matches) {
                                            console.log(`   🎉 ¡ESTE ES EL USUARIO CORRECTO!`);
                                            console.log(`   📝 USA ID: ${user.id_usuario} en lugar de 3`);
                                        }
                                    } catch (compareErr) {
                                        console.log(`   ❌ Error: ${compareErr.message}`);
                                    }
                                }
                                
                                console.log('\n🏁 Investigación completada.');
                                process.exit(0);
                            }
                        );
                    }
                );
            }
        );
        
    } catch (error) {
        console.error('❌ Error general:', error);
        process.exit(1);
    }
}

// Ejecutar investigación
console.log('🚀 Iniciando investigación de hashes...\n');
investigateHashDifference();
