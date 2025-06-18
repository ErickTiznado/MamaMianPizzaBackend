const pool = require('./config/db');

// Test script to verify the ultimo_acceso field addition and login logging functionality

async function testDatabaseStructure() {
    try {
        console.log('🔍 Verificando estructura de la tabla usuarios...');
        
        // Check if ultimo_acceso field exists in usuarios table
        const [columns] = await pool.promise().query(
            "SHOW COLUMNS FROM usuarios LIKE 'ultimo_acceso'"
        );
        
        if (columns.length > 0) {
            console.log('✅ Campo ultimo_acceso encontrado en tabla usuarios');
            console.log('   Tipo:', columns[0].Type);
            console.log('   Default:', columns[0].Default);
        } else {
            console.log('❌ Campo ultimo_acceso NO encontrado en tabla usuarios');
            console.log('💡 Ejecuta el archivo add_ultimo_acceso_to_usuarios.sql para agregar el campo');
        }
        
        // Test logs table structure
        console.log('\n🔍 Verificando estructura de la tabla logs...');
        const [logsColumns] = await pool.promise().query('DESCRIBE logs');
        console.log('✅ Estructura de tabla logs:');
        logsColumns.forEach(col => {
            console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });
        
        // Test connection to both tables
        console.log('\n🔍 Probando consultas...');
        const [userCount] = await pool.promise().query('SELECT COUNT(*) as total FROM usuarios');
        const [adminCount] = await pool.promise().query('SELECT COUNT(*) as total FROM administradores');
        const [logCount] = await pool.promise().query('SELECT COUNT(*) as total FROM logs');
        
        console.log(`✅ Usuarios en BD: ${userCount[0].total}`);
        console.log(`✅ Administradores en BD: ${adminCount[0].total}`);
        console.log(`✅ Logs en BD: ${logCount[0].total}`);
        
    } catch (error) {
        console.error('❌ Error al verificar estructura:', error.message);
    } finally {
        process.exit(0);
    }
}

// Run the test
testDatabaseStructure();
