// Test para entorno Docker
const axios = require('axios');

// En el contenedor, el servidor está en localhost:3000
const SERVER_URL = 'http://localhost:3000';

async function testNotificationInDocker() {
    console.log('🐳 Test de notificaciones en contenedor Docker');
    console.log(`🔗 Servidor: ${SERVER_URL}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
        // Test 1: Verificar que el servidor responda
        console.log('🔍 Verificando estado del servidor...');
        const healthResponse = await axios.get(`${SERVER_URL}/`);
        console.log('✅ Servidor respondiendo:', healthResponse.data);
        
        // Test 2: Verificar endpoint de notificaciones
        console.log('\n📋 Verificando endpoint de notificaciones...');
        const unreadResponse = await axios.get(`${SERVER_URL}/api/notifications/unread`);
        console.log(`✅ Endpoint accesible. Notificaciones no leídas: ${unreadResponse.data.length}`);
        
        // Test 3: Crear notificación de prueba
        console.log('\n📝 Creando notificación de prueba...');
        const testNotification = {
            titulo: '🐳 Test Docker',
            mensaje: 'Notificación de prueba desde contenedor Docker',
            tipo: 'test'
        };
        
        const createResponse = await axios.post(`${SERVER_URL}/api/notifications`, testNotification);
        console.log('✅ Notificación creada:', createResponse.data);
        
        // Test 4: Simular notificación de pedido
        console.log('\n🍕 Simulando notificación de pedido...');
        const { notifyOrder } = require('./packages/notifications-client/index');
        const orderResult = await notifyOrder({
            orderId: 99999,
            total: 29.99
        });
        console.log('✅ Notificación de pedido enviada:', orderResult);
        
        console.log('\n🎉 Todos los tests pasaron correctamente');
        console.log('📱 Verifica el panel frontend para confirmar que las notificaciones lleguen');
        
    } catch (error) {
        console.error('❌ Error en test:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Posibles soluciones:');
            console.log('1. Verifica que el servidor esté corriendo con: ps aux | grep node');
            console.log('2. Verifica que esté en puerto 3000 o el correcto');
            console.log('3. Reinicia el contenedor si es necesario');
        }
    }
}

// Ejecutar test
testNotificationInDocker();
