// Script de debug para verificar el problema con la columna activo
// Ejecuta este script con: node debug-activo-mejorado.js

const pool = require('./config/db');

async function debugActivoColumn() {
    console.log('🔍 === INICIO DEBUG COLUMNA ACTIVO ===');
    
    try {
        // 1. Verificar la estructura de la columna
        console.log('\n📋 1. Verificando estructura de la columna activo...');
        const [columns] = await pool.promise().query("SHOW COLUMNS FROM `usuarios` LIKE 'activo'");
        console.log('Estructura de la columna:', columns);
        
        // 2. Obtener algunos usuarios para debug
        console.log('\n📋 2. Obteniendo usuarios para debug...');
        const [usuarios] = await pool.promise().query(`
            SELECT 
                id_usuario, 
                nombre, 
                correo, 
                activo,
                activo + 0 AS activo_numerico,
                LENGTH(activo) AS longitud_valor,
                activo IS NULL AS es_nulo
            FROM usuarios 
            LIMIT 5
        `);
        
        console.log('Usuarios encontrados:', usuarios.length);
        usuarios.forEach((user, index) => {
            console.log(`\n--- Usuario ${index + 1} ---`);
            console.log('ID:', user.id_usuario);
            console.log('Nombre:', user.nombre);
            console.log('Correo:', user.correo);
            console.log('Valor de activo:', user.activo);
            console.log('Tipo de activo:', typeof user.activo);
            console.log('Activo numérico:', user.activo_numerico);
            console.log('Longitud del valor:', user.longitud_valor);
            console.log('Es nulo:', user.es_nulo);
            console.log('Comparación === 0:', user.activo === 0);
            console.log('Comparación === 1:', user.activo === 1);
            console.log('Comparación === "0":', user.activo === "0");
            console.log('Comparación === "1":', user.activo === "1");
            console.log('Comparación == 0:', user.activo == 0);
            console.log('Comparación == 1:', user.activo == 1);
            console.log('Valor booleano:', !!user.activo);
        });
        
        // 3. Contar por estado
        console.log('\n📋 3. Conteo por estado...');
        const [counts] = await pool.promise().query(`
            SELECT 
                activo,
                COUNT(*) as cantidad,
                CASE 
                    WHEN activo = 1 THEN 'ACTIVOS'
                    WHEN activo = 0 THEN 'INACTIVOS'
                    ELSE 'VALOR_DESCONOCIDO'
                END as descripcion
            FROM usuarios 
            GROUP BY activo
        `);
        
        console.log('Conteo por estado:', counts);
        
        // 4. Simular el proceso de login
        console.log('\n📋 4. Simulando proceso de login...');
        console.log('Ingresa un correo para probar (o presiona Enter para saltar):');
        
        // Para propósitos de este debug, vamos a usar el primer usuario
        if (usuarios.length > 0) {
            const testUser = usuarios[0];
            console.log(`\n🔍 Simulando login con usuario: ${testUser.correo}`);
            console.log('Valor de activo recibido:', testUser.activo);
            console.log('Tipo:', typeof testUser.activo);
            
            // Simular la condición actual del código
            if (testUser.activo === 0) {
                console.log('❌ Resultado: CUENTA DESACTIVADA (condición actual)');
            } else {
                console.log('✅ Resultado: CUENTA ACTIVA (condición actual)');
            }
            
            // Probar diferentes condiciones
            console.log('\n🧪 Probando diferentes condiciones:');
            console.log('if (activo === 0):', testUser.activo === 0);
            console.log('if (activo == 0):', testUser.activo == 0);
            console.log('if (activo === false):', testUser.activo === false);
            console.log('if (!activo):', !testUser.activo);
            console.log('if (activo === "0"):', testUser.activo === "0");
        }
        
    } catch (error) {
        console.error('❌ Error durante el debug:', error);
    } finally {
        console.log('\n🔍 === FIN DEBUG COLUMNA ACTIVO ===');
        process.exit(0);
    }
}

// Ejecutar el debug
debugActivoColumn();
