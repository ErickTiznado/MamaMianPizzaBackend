const pool = require('../config/db');

async function verificarMetodosPago() {
    console.log('🔍 === VERIFICACIÓN DE MÉTODOS DE PAGO EN PEDIDOS ===\n');
    
    try {
        const connection = await pool.promise();
        
        // 1. Verificar todos los métodos de pago únicos en la base de datos
        console.log('💳 1. Métodos de pago únicos en la base de datos:');
        const [metodosUnicos] = await connection.query(`
            SELECT DISTINCT metodo_pago, COUNT(*) as cantidad
            FROM pedidos 
            GROUP BY metodo_pago 
            ORDER BY cantidad DESC
        `);
        
        metodosUnicos.forEach(metodo => {
            console.log(`   - ${metodo.metodo_pago}: ${metodo.cantidad} pedidos`);
        });
        
        // 2. Verificar pedidos recientes (últimos 10)
        console.log('\n📋 2. Últimos 10 pedidos y sus métodos de pago:');
        const [pedidosRecientes] = await connection.query(`
            SELECT 
                id_pedido,
                codigo_pedido,
                metodo_pago,
                estado,
                total,
                transaction_id,
                fecha_pedido
            FROM pedidos 
            ORDER BY fecha_pedido DESC 
            LIMIT 10
        `);
        
        pedidosRecientes.forEach(pedido => {
            const tieneTransactionId = pedido.transaction_id ? '✅' : '❌';
            console.log(`   - Pedido #${pedido.codigo_pedido}: ${pedido.metodo_pago} | Estado: ${pedido.estado} | Total: $${pedido.total} | TX ID: ${tieneTransactionId}`);
        });
        
        // 3. Verificar inconsistencias (pedidos con transaction_id pero método de pago en efectivo)
        console.log('\n🚨 3. Verificando inconsistencias:');
        const [inconsistencias] = await connection.query(`
            SELECT 
                id_pedido,
                codigo_pedido,
                metodo_pago,
                transaction_id,
                estado
            FROM pedidos 
            WHERE 
                (transaction_id IS NOT NULL AND metodo_pago = 'efectivo') OR
                (transaction_id IS NULL AND metodo_pago != 'efectivo')
            ORDER BY fecha_pedido DESC
            LIMIT 20
        `);
        
        if (inconsistencias.length === 0) {
            console.log('   ✅ No se encontraron inconsistencias');
        } else {
            console.log(`   ❌ Se encontraron ${inconsistencias.length} inconsistencias:`);
            inconsistencias.forEach(pedido => {
                console.log(`      - Pedido #${pedido.codigo_pedido}: método=${pedido.metodo_pago}, transaction_id=${pedido.transaction_id ? 'Sí' : 'No'}`);
            });
        }
        
        // 4. Estadísticas generales
        console.log('\n📊 4. Estadísticas generales:');
        const [estadisticas] = await connection.query(`
            SELECT 
                COUNT(*) as total_pedidos,
                SUM(CASE WHEN metodo_pago = 'efectivo' THEN 1 ELSE 0 END) as pedidos_efectivo,
                SUM(CASE WHEN metodo_pago = 'tarjeta_credito' THEN 1 ELSE 0 END) as pedidos_tarjeta,
                SUM(CASE WHEN transaction_id IS NOT NULL THEN 1 ELSE 0 END) as pedidos_con_transaction_id
            FROM pedidos
        `);
        
        const stats = estadisticas[0];
        console.log(`   - Total de pedidos: ${stats.total_pedidos}`);
        console.log(`   - Pedidos en efectivo: ${stats.pedidos_efectivo}`);
        console.log(`   - Pedidos con tarjeta: ${stats.pedidos_tarjeta}`);
        console.log(`   - Pedidos con transaction_id: ${stats.pedidos_con_transaction_id}`);
        
        // 5. Verificar pedidos de hoy
        console.log('\n📅 5. Pedidos de hoy por método de pago:');
        const [pedidosHoy] = await connection.query(`
            SELECT 
                metodo_pago,
                COUNT(*) as cantidad,
                SUM(total) as total_ingresos
            FROM pedidos 
            WHERE DATE(fecha_pedido) = CURDATE()
            GROUP BY metodo_pago
        `);
        
        if (pedidosHoy.length === 0) {
            console.log('   📭 No hay pedidos hoy');
        } else {
            pedidosHoy.forEach(metodo => {
                console.log(`   - ${metodo.metodo_pago}: ${metodo.cantidad} pedidos, $${parseFloat(metodo.total_ingresos).toFixed(2)}`);
            });
        }
        
        console.log('\n✅ Verificación completada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en la verificación:', error);
    }
}

// Función para corregir inconsistencias (usar con cuidado)
async function corregirInconsistencias() {
    console.log('🔧 === CORRECCIÓN DE INCONSISTENCIAS DE MÉTODOS DE PAGO ===\n');
    
    try {
        const connection = await pool.promise();
        
        // Encontrar pedidos con transaction_id pero método de pago en efectivo
        const [pedidosIncorrectos] = await connection.query(`
            SELECT id_pedido, codigo_pedido, metodo_pago, transaction_id
            FROM pedidos 
            WHERE transaction_id IS NOT NULL AND metodo_pago = 'efectivo'
        `);
        
        if (pedidosIncorrectos.length === 0) {
            console.log('✅ No hay inconsistencias para corregir');
            return;
        }
        
        console.log(`🔍 Encontrados ${pedidosIncorrectos.length} pedidos con inconsistencias:`);
        pedidosIncorrectos.forEach(pedido => {
            console.log(`   - Pedido #${pedido.codigo_pedido}: tiene transaction_id pero método de pago es '${pedido.metodo_pago}'`);
        });
        
        console.log('\n🔧 Corrigiendo inconsistencias...');
        
        const [resultado] = await connection.query(`
            UPDATE pedidos 
            SET metodo_pago = 'tarjeta_credito' 
            WHERE transaction_id IS NOT NULL AND metodo_pago = 'efectivo'
        `);
        
        console.log(`✅ Corregidos ${resultado.affectedRows} pedidos`);
        
        // Verificar corrección
        const [verificacion] = await connection.query(`
            SELECT COUNT(*) as count
            FROM pedidos 
            WHERE transaction_id IS NOT NULL AND metodo_pago = 'efectivo'
        `);
        
        if (verificacion[0].count === 0) {
            console.log('✅ Todas las inconsistencias han sido corregidas');
        } else {
            console.log(`⚠️ Aún quedan ${verificacion[0].count} inconsistencias`);
        }
        
    } catch (error) {
        console.error('❌ Error en la corrección:', error);
    }
}

// Ejecutar verificación si este archivo se ejecuta directamente
if (require.main === module) {
    (async () => {
        await verificarMetodosPago();
        
        console.log('\n💡 Para corregir inconsistencias automáticamente, ejecute:');
        console.log('node -e "require(\'./scripts/verificar-metodos-pago.js\').corregirInconsistencias()"');
    })();
}

module.exports = { verificarMetodosPago, corregirInconsistencias };
