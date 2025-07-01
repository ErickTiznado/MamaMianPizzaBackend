const axios = require('axios');

const NOTIF_URL = process.env.NOTIF_URL;
const NOTIF_KEY = process.env.NOTIF_KEY;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

/**
 * 
 * 
@param {{orderId: Number, total: Number}} opts
 * 
 */

async function notifyOrder({orderId, total}){
    console.log(`📢 Iniciando notificación para pedido #${orderId} con total $${total}`);
    
    // Crear notificación local en la base de datos
    try {
        console.log(`📝 Creando notificación local en la base de datos...`);
        const localResponse = await axios.post(
            `${SERVER_URL}/api/notifications`,
            {
                titulo: `Nuevo pedido recibido #${orderId}`,
                mensaje: `Pedido #${orderId} por un total de $${total.toFixed(2)}.`,
                tipo: 'pedido', 
            }
        );
        console.log(`✅ Notificación local creada exitosamente:`, localResponse.data);
    } catch (localError) {
        console.error(`❌ Error creando notificación local:`, localError.response?.data || localError.message);
    }
    
    // Si están configuradas las variables de entorno para notificaciones externas, también enviar ahí
    if (NOTIF_KEY && NOTIF_URL) {
        try {
            console.log(`📡 Enviando notificación externa a ${NOTIF_URL}...`);
            const externalResponse = await axios.post(
                `${NOTIF_URL}/api/notifications`,
                {
                    titulo: `Nuevo pedido recibido #${orderId}`,
                    mensaje: `Pedido #${orderId} por un total de $${total.toFixed(2)}.`,
                    url: `/pedidos/${orderId}`,
                    tipo: 'pedido', 
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


module.exports = {notifyOrder}