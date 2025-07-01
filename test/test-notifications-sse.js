// Test script para probar notificaciones SSE
const { notifyOrder } = require('../packages/notifications-client/index');

async function testNotifications() {
    console.log('🧪 Iniciando prueba de notificaciones SSE...');
    
    try {
        // Test 1: Crear una notificación de pedido
        console.log('\n📝 Test 1: Creando notificación de pedido...');
        const result1 = await notifyOrder({
            orderId: 12345,
            total: 25.99
        });
        console.log('✅ Resultado test 1:', result1);
        
        // Esperar un poco
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 2: Crear otra notificación
        console.log('\n📝 Test 2: Creando segunda notificación...');
        const result2 = await notifyOrder({
            orderId: 12346,
            total: 35.50
        });
        console.log('✅ Resultado test 2:', result2);
        
        console.log('\n🎉 Pruebas de notificaciones completadas');
        console.log('📋 Revisa el panel frontend para ver si las notificaciones aparecen en tiempo real');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    testNotifications();
}

module.exports = { testNotifications };
