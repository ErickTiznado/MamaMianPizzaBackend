const axios = require('axios');
const { notifyOrder } = require('../packages/notifications-client/index');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

async function testNotifications() {
    console.log('🧪 === PRUEBA DEL SISTEMA DE NOTIFICACIONES ===\n');
    
    try {
        // 1. Probar crear notificación directamente
        console.log('📝 1. Probando creación directa de notificación...');
        const directResponse = await axios.post(`${SERVER_URL}/api/notifications`, {
            titulo: 'Notificación de prueba',
            mensaje: 'Esta es una notificación de prueba del sistema.',
            tipo: 'test'
        });
        console.log('✅ Notificación directa creada:', directResponse.data);
        
        // 2. Probar notificación de pedido
        console.log('\n📦 2. Probando notificación de pedido...');
        await notifyOrder({
            orderId: 999,
            total: 25.99
        });
        console.log('✅ Notificación de pedido procesada');
        
        // 3. Obtener notificaciones no leídas
        console.log('\n📬 3. Obteniendo notificaciones no leídas...');
        const unreadResponse = await axios.get(`${SERVER_URL}/api/notifications/unread`);
        console.log('✅ Notificaciones no leídas:', unreadResponse.data.length);
        
        // 4. Obtener todas las notificaciones
        console.log('\n📋 4. Obteniendo todas las notificaciones...');
        const allResponse = await axios.get(`${SERVER_URL}/api/notifications`);
        console.log('✅ Total de notificaciones:', allResponse.data.length);
        
        console.log('\n🎉 ¡Todas las pruebas de notificaciones pasaron exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en la prueba de notificaciones:', error.response?.data || error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Ejecutar las pruebas si este archivo se ejecuta directamente
if (require.main === module) {
    testNotifications();
}

module.exports = { testNotifications };
