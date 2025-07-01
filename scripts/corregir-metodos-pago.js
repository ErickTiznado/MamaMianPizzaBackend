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
        
        // 1. Verificar pedidos con método de pago 'tarjeta'
        console.log('🔍 Buscando pedidos con método de pago "tarjeta"...');
        
        const [pedidosConTarjeta] = await connection.query(
            'SELECT id_pedido, codigo_pedido, metodo_pago, total, fecha_pedido FROM pedidos WHERE metodo_pago = ?',
            ['tarjeta']
        );
        
        console.log(`📊 Encontrados ${pedidosConTarjeta.length} pedidos con método de pago "tarjeta"`);
        
        if (pedidosConTarjeta.length > 0) {
            console.log('📋 Pedidos a corregir:');
            pedidosConTarjeta.forEach(pedido => {
                console.log(`  - ${pedido.codigo_pedido} | $${pedido.total} | ${pedido.fecha_pedido} | ${pedido.metodo_pago}`);
            });
            
            // 2. Actualizar método de pago de 'tarjeta' a 'tarjeta_credito'
            console.log('🔄 Actualizando métodos de pago...');
            
            const [updateResult] = await connection.query(
                'UPDATE pedidos SET metodo_pago = ? WHERE metodo_pago = ?',
                ['tarjeta_credito', 'tarjeta']
            );
            
            console.log(`✅ ${updateResult.affectedRows} pedidos actualizados de "tarjeta" a "tarjeta_credito"`);
        }
        
        // 3. Verificar distribución actual de métodos de pago
        console.log('📊 Distribución actual de métodos de pago:');
        
        const [distribucion] = await connection.query(`
            SELECT 
                metodo_pago, 
                COUNT(*) as cantidad,
                SUM(total) as monto_total
            FROM pedidos 
            GROUP BY metodo_pago 
            ORDER BY cantidad DESC
        `);
        
        distribucion.forEach(metodo => {
            console.log(`  ${metodo.metodo_pago}: ${metodo.cantidad} pedidos, $${metodo.monto_total}`);
        });
        
        // 4. Verificar pedidos con métodos no estándar
        console.log('🔍 Verificando métodos de pago no estándar...');
        
        const [metodosNoEstandar] = await connection.query(`
            SELECT DISTINCT metodo_pago, COUNT(*) as cantidad
            FROM pedidos 
            WHERE metodo_pago NOT IN ('efectivo', 'tarjeta_credito')
            GROUP BY metodo_pago
        `);
        
        if (metodosNoEstandar.length > 0) {
            console.log('⚠️ Métodos de pago no estándar encontrados:');
            metodosNoEstandar.forEach(metodo => {
                console.log(`  ${metodo.metodo_pago}: ${metodo.cantidad} pedidos`);
            });
        } else {
            console.log('✅ Todos los métodos de pago están estandarizados');
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
