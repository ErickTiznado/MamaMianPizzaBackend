const pool = require('../config/db');

async function syncAdminUsers() {
    console.log('🔧 === SINCRONIZACIÓN DE USUARIOS ADMINISTRADORES ===\n');
    
    try {
        const connection = await pool.promise();
        
        // 1. Verificar qué tabla de administradores existe
        console.log('🔍 1. Verificando tablas de administradores...');
        const [tables] = await connection.query("SHOW TABLES");
        const tableNames = tables.map(t => Object.values(t)[0]);
        
        let adminTable = null;
        if (tableNames.includes('admins')) {
            adminTable = 'admins';
            console.log('✅ Encontrada tabla: admins');
        } else if (tableNames.includes('administradores')) {
            adminTable = 'administradores';
            console.log('✅ Encontrada tabla: administradores');
        } else {
            console.log('❌ No se encontró tabla de administradores (admins/administradores)');
            return false;
        }
        
        // 2. Obtener estructura de la tabla de administradores
        console.log(`\n🏗️ 2. Analizando estructura de tabla ${adminTable}...`);
        const [adminStructure] = await connection.query(`DESCRIBE ${adminTable}`);
        
        let idField = 'id_admin';
        let nameField = 'nombre';
        let emailField = 'email';
        let passwordField = 'contrasena';
        
        adminStructure.forEach(col => {
            if (col.Field.includes('correo')) emailField = col.Field;
            if (col.Field === 'password') passwordField = col.Field;
        });
        
        console.log(`   - ID: ${idField}`);
        console.log(`   - Nombre: ${nameField}`);
        console.log(`   - Email: ${emailField}`);
        console.log(`   - Contraseña: ${passwordField}`);
        
        // 3. Obtener administradores existentes
        console.log(`\n👥 3. Obteniendo administradores de tabla ${adminTable}...`);
        const [admins] = await connection.query(`SELECT * FROM ${adminTable}`);
        console.log(`✅ Administradores encontrados: ${admins.length}`);
        
        if (admins.length === 0) {
            console.log('⚠️ No hay administradores para sincronizar');
            return true;
        }
        
        // 4. Verificar cuáles administradores ya existen en usuarios
        console.log('\n🔍 4. Verificando administradores existentes en tabla usuarios...');
        const adminIds = admins.map(admin => admin[idField]);
        const [existingUsers] = await connection.query(
            `SELECT id_usuario FROM usuarios WHERE id_usuario IN (${adminIds.map(() => '?').join(',')})`,
            adminIds
        );
        const existingUserIds = existingUsers.map(user => user.id_usuario);
        
        console.log(`   - Administradores ya en usuarios: ${existingUserIds.length}`);
        console.log(`   - Administradores a sincronizar: ${admins.length - existingUserIds.length}`);
        
        // 5. Sincronizar administradores faltantes
        let syncCount = 0;
        
        for (const admin of admins) {
            const adminId = admin[idField];
            
            if (!existingUserIds.includes(adminId)) {
                console.log(`\n🔄 Sincronizando admin ID ${adminId}: ${admin[nameField]}...`);
                
                try {
                    await connection.query(`
                        INSERT INTO usuarios (id_usuario, nombre, correo, contrasena, tipo_usuario, fecha_registro)
                        VALUES (?, ?, ?, ?, 'admin', NOW())
                        ON DUPLICATE KEY UPDATE 
                        nombre = VALUES(nombre),
                        correo = VALUES(correo),
                        tipo_usuario = 'admin'
                    `, [
                        adminId,
                        admin[nameField] || `Admin-${adminId}`,
                        admin[emailField] || `admin${adminId}@mamamianpizza.com`,
                        admin[passwordField] || '$2b$10$dummy.hash.for.admin.logging.sync'
                    ]);
                    
                    console.log(`   ✅ Admin ${adminId} sincronizado exitosamente`);
                    syncCount++;
                    
                } catch (syncError) {
                    console.error(`   ❌ Error sincronizando admin ${adminId}:`, syncError.message);
                }
            } else {
                console.log(`   ⏭️ Admin ID ${adminId} ya existe en usuarios`);
            }
        }
        
        console.log(`\n📊 Resumen de sincronización:`);
        console.log(`   - Total administradores: ${admins.length}`);
        console.log(`   - Ya existían: ${existingUserIds.length}`);
        console.log(`   - Sincronizados: ${syncCount}`);
        
        // 6. Verificar integridad final
        console.log('\n🔍 6. Verificando integridad final...');
        const [finalCheck] = await connection.query(`
            SELECT 
                l.id_usuario,
                COUNT(*) as logs_count,
                CASE 
                    WHEN u.id_usuario IS NULL THEN 'PROBLEMA'
                    ELSE 'OK'
                END as estado
            FROM logs l
            LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
            WHERE l.id_usuario IS NOT NULL
            GROUP BY l.id_usuario, u.id_usuario
            HAVING estado = 'PROBLEMA'
            ORDER BY logs_count DESC
        `);
        
        if (finalCheck.length === 0) {
            console.log('✅ No se encontraron problemas de integridad referencial');
        } else {
            console.log('❌ Problemas pendientes:');
            finalCheck.forEach(problem => {
                console.log(`   - Usuario ID ${problem.id_usuario}: ${problem.logs_count} logs problemáticos`);
            });
        }
        
        console.log('\n🎉 Sincronización completada exitosamente!');
        return true;
        
    } catch (error) {
        console.error('❌ Error en la sincronización:', error);
        return false;
    }
}

// Función para ejecutar solo verificación sin cambios
async function checkSyncStatus() {
    console.log('📋 === VERIFICACIÓN DE ESTADO DE SINCRONIZACIÓN ===\n');
    
    try {
        const connection = await pool.promise();
        
        // Verificar problemas de logs
        const [problems] = await connection.query(`
            SELECT 
                l.id_usuario,
                COUNT(*) as logs_problemáticos,
                u.id_usuario as usuario_existe
            FROM logs l
            LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario
            WHERE l.id_usuario IS NOT NULL AND u.id_usuario IS NULL
            GROUP BY l.id_usuario
            ORDER BY logs_problemáticos DESC
        `);
        
        if (problems.length === 0) {
            console.log('✅ No hay problemas de integridad referencial en logs');
        } else {
            console.log('❌ Problemas encontrados:');
            problems.forEach(problem => {
                console.log(`   - Usuario ID ${problem.id_usuario}: ${problem['logs_problemáticos']} logs problemáticos`);
            });
            
            console.log('\n💡 Ejecute syncAdminUsers() para resolver estos problemas');
        }
        
    } catch (error) {
        console.error('❌ Error en la verificación:', error);
    }
}

// Ejecutar si este archivo se ejecuta directamente
if (require.main === module) {
    (async () => {
        console.log('Seleccione una opción:');
        console.log('1. Solo verificar estado');
        console.log('2. Sincronizar administradores');
        
        // Por defecto, solo verificar
        await checkSyncStatus();
        
        console.log('\n💡 Para ejecutar la sincronización, use: syncAdminUsers()');
        
        // Para ejecutar sincronización automáticamente, descomente:
        // await syncAdminUsers();
    })();
}

module.exports = { syncAdminUsers, checkSyncStatus };
