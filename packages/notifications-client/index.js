const axios = require('axios');

const NOTIF_URL = process.env.NOTIF_URL;
const NOTIF_KEY = process.env.NOTIF_KEY;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

// Intentar importar el controlador de notificaciones para uso directo
let notificationController = null;
try {
    notificationController = require('../../contollers/notificationController');
    console.log('✅ Controlador de notificaciones importado exitosamente para uso directo');
} catch (error) {
    console.log('⚠️ No se pudo importar el controlador de notificaciones, usando HTTP fallback');
}

/**
 * 
 * 
@param {{orderId: Number, total: Number}} opts
 * 
 */

async function notifyOrder({orderId, total}){
    console.log(`📢 Iniciando notificación para pedido #${orderId} con total $${total}`);
    
    const titulo = `Nuevo pedido recibido #${orderId}`;
    const mensaje = `Pedido #${orderId} por un total de $${total.toFixed(2)}.`;
    const tipo = 'pedido';
    
    // Intentar crear notificación directamente si el controlador está disponible
    if (notificationController && notificationController.createNotificationDirect) {
        try {
            console.log(`📝 Creando notificación directa...`);
            const notification = await notificationController.createNotificationDirect(titulo, mensaje, tipo);
            console.log(`✅ Notificación directa creada y enviada vía SSE:`, notification);
        } catch (directError) {
            console.error(`❌ Error creando notificación directa:`, directError.message);
            console.log(`🔄 Intentando con HTTP fallback...`);
            await createNotificationViaHTTP(titulo, mensaje, tipo);
        }
    } else {
        // Fallback a HTTP si no está disponible el controlador
        await createNotificationViaHTTP(titulo, mensaje, tipo);
    }
    
    // Si están configuradas las variables de entorno para notificaciones externas, también enviar ahí
    if (NOTIF_KEY && NOTIF_URL) {
        try {
            console.log(`📡 Enviando notificación externa a ${NOTIF_URL}...`);
            const externalResponse = await axios.post(
                `${NOTIF_URL}/api/notifications`,
                {
                    titulo: titulo,
                    mensaje: mensaje,
                    url: `/pedidos/${orderId}`,
                    tipo: tipo, 
                },
                {
                    headers: {'x-internal-key': NOTIF_KEY}
                }
            );
            console.log(`✅ Notificación externa enviada exitosamente:`, externalResponse.data);
        } catch (externalError) {
            console.error(`❌ Error enviando notificación externa:`, externalError.response?.data || externalError.message);
        }
    } else {
        console.log(`⚠️ Variables NOTIF_KEY o NOTIF_URL no configuradas, solo se envió notificación local`);
    }
    
    return { success: true, message: 'Notificación procesada' };
}

// Función auxiliar para crear notificación vía HTTP (fallback)
async function createNotificationViaHTTP(titulo, mensaje, tipo) {
    try {
        console.log(`📝 Creando notificación vía HTTP...`);
        const localResponse = await axios.post(
            `${SERVER_URL}/api/notifications`,
            {
                titulo: titulo,
                mensaje: mensaje,
                tipo: tipo, 
            }
        );
        console.log(`✅ Notificación HTTP creada exitosamente:`, localResponse.data);
    } catch (localError) {
        console.error(`❌ Error creando notificación HTTP:`, localError.response?.data || localError.message);
        throw localError;
    }
}


module.exports = {notifyOrder}