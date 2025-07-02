// Script para probar notificaciones SSE directamente
require('dotenv').config();
const axios = require('axios');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

async function testDirectNotification() {
    console.log('🧪 Probando notificación directa vía HTTP POST...');
    
    try {
        const response = await axios.post(`${SERVER_URL}/api/notifications`, {
            titulo: '🧪 Test de notificación',
            mensaje: 'Esta es una notificación de prueba para verificar que el SSE funciona correctamente.',
            tipo: 'test'
        });
        
        console.log('✅ Notificación enviada exitosamente:', response.data);
        console.log('📋 Verifica el panel frontend o el archivo test-sse-notifications.html para ver si llega la notificación');
        
    } catch (error) {
        console.error('❌ Error enviando notificación:', error.response?.data || error.message);
    }
}

async function testMultipleNotifications() {
    console.log('🧪 Probando múltiples notificaciones...');
    
    const notifications = [
        { titulo: '🛍️ Nuevo pedido', mensaje: 'Pedido #001 - Pizza Margarita', tipo: 'pedido' },
        { titulo: '💰 Pago recibido', mensaje: 'Pago confirmado para pedido #001', tipo: 'pago' },
        { titulo: '👨‍🍳 Pedido en preparación', mensaje: 'El pedido #001 está siendo preparado', tipo: 'estado' },
        { titulo: '🚚 Pedido listo', mensaje: 'El pedido #001 está listo para entrega', tipo: 'estado' }
    ];
    
    for (let i = 0; i < notifications.length; i++) {
        try {
            console.log(`📤 Enviando notificación ${i + 1}/${notifications.length}...`);
            const response = await axios.post(`${SERVER_URL}/api/notifications`, notifications[i]);
            console.log(`✅ Notificación ${i + 1} enviada:`, response.data.titulo);
            
            // Esperar un poco entre notificaciones
            await new Promise(resolve => setTimeout(resolve, 1500));
            
        } catch (error) {
            console.error(`❌ Error en notificación ${i + 1}:`, error.response?.data || error.message);
        }
    }
    
    console.log('🎉 Prueba de múltiples notificaciones completada');
}

async function checkSSEStatus() {
    console.log('🔍 Verificando estado del servidor SSE...');
    
    try {
        // Intentar obtener notificaciones no leídas para verificar conectividad
        const response = await axios.get(`${SERVER_URL}/api/notifications/unread`);
        console.log(`✅ Servidor accesible. Notificaciones no leídas: ${response.data.length}`);
        
        // Mostrar las notificaciones existentes
        if (response.data.length > 0) {
            console.log('📬 Notificaciones no leídas existentes:');
            response.data.forEach((notif, index) => {
                console.log(`  ${index + 1}. [${notif.id_notificacion}] ${notif.titulo} - ${notif.mensaje}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error verificando estado del servidor:', error.message);
        console.log('💡 Asegúrate de que el servidor esté corriendo en:', SERVER_URL);
    }
}

// Función principal
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'single';
    
    console.log('🍕 Test de Notificaciones SSE - Mama Mian Pizza');
    console.log(`🔗 Servidor: ${SERVER_URL}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Verificar estado del servidor primero
    await checkSSEStatus();
    console.log('');
    
    switch (command) {
        case 'single':
            await testDirectNotification();
            break;
        case 'multiple':
            await testMultipleNotifications();
            break;
        case 'status':
            // Ya se verificó arriba
            break;
        default:
            console.log('📋 Comandos disponibles:');
            console.log('  node test-manual-notifications.js single    - Enviar una notificación');
            console.log('  node test-manual-notifications.js multiple  - Enviar múltiples notificaciones');
            console.log('  node test-manual-notifications.js status    - Solo verificar estado');
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    testDirectNotification,
    testMultipleNotifications,
    checkSSEStatus
};
