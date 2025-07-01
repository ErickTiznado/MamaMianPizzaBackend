const pool = require('../config/db');

/**
 * Script para corregir métodos de pago inconsistentes
 * Convierte 'tarjeta' a 'tarjeta_credito' en pedidos existentes
 */

async function corregirMetodosPago() {
    let connection;
    
    try {
        console.log('🔧 Iniciando corrección de métodos de pago...');
        
        connection = await pool.promise().getConnection();
        
        // 1. Verificar pedidos con método de pago no estándar
        console.log('� Verificando distribución actual de métodos de pago...');
        
        const [distribucionActual] = await connection.query(`
            SELECT 
                metodo_pago, 
                COUNT(*) as cantidad,
                SUM(total) as monto_total
            FROM pedidos 
            GROUP BY metodo_pago 
            ORDER BY cantidad DESC
        `);
        
        console.log('📊 Distribución actual de métodos de pago:');
        distribucionActual.forEach(metodo => {
            console.log(`  ${metodo.metodo_pago}: ${metodo.cantidad} pedidos, $${metodo.monto_total}`);
        });
        
        // 2. Verificar si hay métodos de pago que no estén en el ENUM de la base de datos
        // Según el schema: enum('efectivo','tarjeta')
        console.log('🔍 Verificando métodos de pago válidos según base de datos...');
        
        const metodosValidosDB = ['efectivo', 'tarjeta'];
        const [metodosNoValidos] = await connection.query(`
            SELECT DISTINCT metodo_pago, COUNT(*) as cantidad
            FROM pedidos 
            WHERE metodo_pago NOT IN (${metodosValidosDB.map(() => '?').join(',')})
            GROUP BY metodo_pago
        `, metodosValidosDB);
        
        if (metodosNoValidos.length > 0) {
            console.log('⚠️ Métodos de pago no válidos encontrados:');
            metodosNoValidos.forEach(metodo => {
                console.log(`  ${metodo.metodo_pago}: ${metodo.cantidad} pedidos`);
            });
            console.log('❌ ATENCIÓN: Se encontraron métodos de pago que no están permitidos por el ENUM de la base de datos');
        } else {
            console.log('✅ Todos los métodos de pago son válidos según el schema de la base de datos');
        }
        
        console.log('🎉 Corrección de métodos de pago completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error al corregir métodos de pago:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
            console.log('🔗 Conexión liberada');
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    corregirMetodosPago()
        .then(() => {
            console.log('✅ Script completado exitosamente');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Error en el script:', error);
            process.exit(1);
        });
}

module.exports = { corregirMetodosPago };
