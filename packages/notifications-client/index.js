const axios = require('axios');
const { param } = require('../../route/activeRoutes');

const NOTIF_URL = process.env.NOTIF_URL;
const NOTIF_KEY = process.env.NOTIF_KEY;

/**
 * 
 * 
@param {{orderId: Number, total: Number}} opts
 * 
 */

async function notifyOrder({orderId, total}){
    if (!NOTIF_KEY || !NOTIF_URL) {
        throw new Error('Faltan variables de entorno NOTIF_KEY o NOTIF_URL');
    }
    return axios.post(
        `${NOTIF_URL}/api/notifications`,
        {
            titulo: `Nuevo pedido recibido #${orderId}`,
            mensaje: `Pedidos #${orderId} por un total de $${total.toFixed(2)}.`,
            url: `/pedidos/${orderId}`,
            tipo: 'pedido', 
        },
        {
            headers: {'x-internal-key': NOTIF_KEY}
        }
    );
}


module.exports = {notifyOrder}