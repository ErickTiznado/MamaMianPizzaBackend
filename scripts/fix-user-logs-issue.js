const pool = require('../config/db');

async function checkAndFixUserIssues() {
    console.log('🔍 === VERIFICACIÓN DE PROBLEMAS DE USUARIOS ===\n');
    
    try {
        // 1. Verificar usuarios en tabla usuarios
        console.log('👥 1. Verificando usuarios en tabla "usuarios"...');
        const [usuarios] = await pool.promise().query('SELECT id_usuario, nombre, correo FROM usuarios ORDER BY id_usuario');
        console.log(`✅ Usuarios encontrados: ${usuarios.length}`);
        usuarios.forEach(user => {
            console.log(`   - ID: ${user.id_usuario}, Nombre: ${user.nombre}, Email: ${user.correo}`);
        });
        
        // 2. Verificar administradores en tabla admins (si existe)
        console.log('\n👑 2. Verificando administradores...');
        try {
            const [admins] = await pool.promise().query('SHOW TABLES LIKE "admins"');
            if (admins.length > 0) {
                const [adminUsers] = await pool.promise().query('SELECT id_admin, nombre, email FROM admins ORDER BY id_admin');
                console.log(`✅ Administradores encontrados: ${adminUsers.length}`);
                adminUsers.forEach(admin => {
                    console.log(`   - ID: ${admin.id_admin}, Nombre: ${admin.nombre}, Email: ${admin.email}`);
                });
            } else {
                console.log('⚠️ Tabla "admins" no encontrada');
            }
        } catch (adminErr) {
            console.log('⚠️ Error verificando tabla admins:', adminErr.message);
        }
        
        // 3. Verificar logs que fallan
        console.log('\n📋 3. Verificando logs con referencias de usuario problemáticas...');
        const [problematicLogs] = await pool.promise().query(`
            SELECT l.id_usuario, COUNT(*) as intentos_fallidos 
            FROM logs l 
            LEFT JOIN usuarios u ON l.id_usuario = u.id_usuario 
            WHERE l.id_usuario IS NOT NULL AND u.id_usuario IS NULL 
            GROUP BY l.id_usuario 
            ORDER BY intentos_fallidos DESC
        `);
        
        if (problematicLogs.length > 0) {
            console.log('❌ IDs de usuario problemáticos encontrados:');
            problematicLogs.forEach(log => {
                console.log(`   - Usuario ID ${log.id_usuario}: ${log.intentos_fallidos} logs fallidos`);
            });
        } else {
            console.log('✅ No se encontraron logs con referencias problemáticas');
        }
        
        // 4. Verificar el usuario específico ID 6
        console.log('\n🔍 4. Verificando específicamente el usuario ID 6...');
        const [user6] = await pool.promise().query('SELECT * FROM usuarios WHERE id_usuario = 6');
        if (user6.length > 0) {
            console.log('✅ Usuario ID 6 encontrado:', user6[0]);
        } else {
            console.log('❌ Usuario ID 6 NO existe en la tabla usuarios');
            
            // Verificar si existe en tabla admins
            try {
                const [admin6] = await pool.promise().query('SELECT * FROM admins WHERE id_admin = 6');
                if (admin6.length > 0) {
                    console.log('🔍 Pero SÍ existe como administrador:', admin6[0]);
                    
                    // Ofrecer crear el usuario en la tabla usuarios
                    console.log('\n💡 SOLUCIÓN SUGERIDA:');
                    console.log('Crear usuario equivalente en tabla usuarios para mantener integridad referencial');
                    
                    const admin = admin6[0];
                    const createUserQuery = `
                        INSERT INTO usuarios (id_usuario, nombre, correo, contrasena, celular, tipo_usuario, fecha_registro)
                        VALUES (?, ?, ?, ?, ?, 'admin', NOW())
                    `;
                    
                    console.log('📝 Query sugerido:');
                    console.log(createUserQuery);
                    console.log('Parámetros:', [6, admin.nombre, admin.email, admin.contrasena || 'hash_admin', admin.telefono || null]);
                }
            } catch (adminCheckErr) {
                console.log('⚠️ Error verificando admin ID 6:', adminCheckErr.message);
            }
        }
        
        // 5. Mostrar estructura de las tablas relevantes
        console.log('\n🏗️ 5. Estructura de tabla logs...');
        const [logsStructure] = await pool.promise().query('DESCRIBE logs');
        console.log('Estructura de tabla logs:');
        logsStructure.forEach(col => {
            console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL permitido)' : '(NOT NULL)'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
    } catch (error) {
        console.error('❌ Error en la verificación:', error);
    }
}

// Función para arreglar el problema del usuario 6
async function fixUser6Issue() {
    console.log('\n🔧 === ARREGLANDO PROBLEMA DEL USUARIO ID 6 ===\n');
    
    try {
        // Verificar si existe en admins
        const [admin6] = await pool.promise().query('SELECT * FROM admins WHERE id_admin = 6');
        
        if (admin6.length > 0) {
            const admin = admin6[0];
            console.log('👤 Administrador encontrado:', admin);
            
            // Crear usuario equivalente
            const insertQuery = `
                INSERT INTO usuarios (id_usuario, nombre, correo, contrasena, celular, tipo_usuario, fecha_registro)
                VALUES (?, ?, ?, ?, ?, 'admin', NOW())
                ON DUPLICATE KEY UPDATE
                nombre = VALUES(nombre),
                correo = VALUES(correo),
                tipo_usuario = 'admin'
            `;
            
            await pool.promise().query(insertQuery, [
                6,
                admin.nombre,
                admin.email,
                admin.contrasena || '$2b$10$dummy.hash.for.admin.user',
                admin.telefono || null
            ]);
            
            console.log('✅ Usuario ID 6 creado/actualizado en tabla usuarios');
            
            // Verificar que se creó correctamente
            const [newUser] = await pool.promise().query('SELECT * FROM usuarios WHERE id_usuario = 6');
            console.log('✅ Usuario verificado:', newUser[0]);
            
        } else {
            console.log('❌ No se encontró admin con ID 6 para crear usuario equivalente');
        }
        
    } catch (error) {
        console.error('❌ Error arreglando usuario ID 6:', error);
    }
}

// Ejecutar verificación si este archivo se ejecuta directamente
if (require.main === module) {
    (async () => {
        await checkAndFixUserIssues();
        
        console.log('\n🤔 ¿Desea arreglar el problema del usuario ID 6? (y/n)');
        console.log('(Este script solo muestra el problema, ejecute fixUser6Issue() para arreglar)');
        
        // Para arreglar automáticamente, descomente la siguiente línea:
        // await fixUser6Issue();
    })();
}

module.exports = { checkAndFixUserIssues, fixUser6Issue };
