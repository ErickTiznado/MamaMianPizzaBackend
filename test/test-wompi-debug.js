// test-wompi-debug.js
// Script de prueba para verificar la depuración completa del sistema de pagos Wompi

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000'; // Ajusta según tu configuración
const ENDPOINT = '/api/payments/process-order';

// Datos de prueba que siguen la misma lógica del script original
const testPaymentData = {
    // Datos de la tarjeta (exactos del script de referencia)
    numeroTarjeta: '4573690001990693',
    cvv: '835',
    mesVencimiento: 12,
    anioVencimiento: 2029,
    
    // Datos del cliente (exactos del script de referencia)
    nombre: 'Erick',
    apellido: 'Tiznado',
    email: 'tiznadoerick3@gmail.com',
    telefono: '50300000000',
    direccionPago: 'Tu Dirección 123',
    ciudad: 'San Salvador',
    idPais: 'SV',
    idRegion: 'SV-SS',
    codigoPostal: '1101',
    
    // Datos del pedido
    pedidoData: {
        tipo_cliente: 'invitado',
        cliente: {
            nombre: 'Erick',
            apellido: 'Tiznado',
            telefono: '50300000000',
            email: 'tiznadoerick3@gmail.com'
        },
        direccion: {
            tipo_direccion: 'formulario',
            direccion: 'Tu Dirección 123',
            pais: 'El Salvador',
            departamento: 'San Salvador',
            municipio: 'San Salvador',
            codigo_postal: '1101',
            instrucciones_entrega: 'Casa de prueba'
        },
        productos: [
            {
                id_producto: 1,
                nombre_producto: 'Pizza Margarita',
                cantidad: 1,
                precio_unitario: 4.00,
                subtotal: 4.00
            }
        ],
        subtotal: 4.00,
        costo_envio: 0.00,
        impuestos: 0.00,
        total: 4.00,
        aceptado_terminos: true,
        tiempo_estimado_entrega: 30
    }
};

/**
 * Función principal para probar la depuración
 */
async function testWompiDebug() {
    console.log('\n🧪 ===== INICIANDO PRUEBA DE DEPURACIÓN WOMPI =====');
    console.log(`🔗 URL: ${BASE_URL}${ENDPOINT}`);
    console.log(`💰 Monto: $${testPaymentData.pedidoData.total}`);
    console.log(`💳 Tarjeta: ****-****-****-${testPaymentData.numeroTarjeta.slice(-4)}`);
    console.log(`👤 Cliente: ${testPaymentData.nombre} ${testPaymentData.apellido}`);
    console.log(`📧 Email: ${testPaymentData.email}`);
    console.log(`📱 Teléfono: ${testPaymentData.telefono}`);
    
    try {
        console.log('\n📤 Enviando petición al backend...');
        console.log('🔍 Revisa la consola del servidor para ver la depuración completa');
        
        const startTime = Date.now();
        
        const response = await axios.post(`${BASE_URL}${ENDPOINT}`, testPaymentData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 60000 // 60 segundos para ver toda la depuración
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`\n✅ ===== RESPUESTA EXITOSA (${responseTime}ms) =====`);
        console.log(`📊 Status: ${response.status}`);
        
        if (response.data.success) {
            console.log('\n🎉 ===== PROCESO COMPLETADO EXITOSAMENTE =====');
            console.log(`💳 Transaction ID: ${response.data.data.transactionId}`);
            console.log(`🔗 URL Wompi 3DS: ${response.data.data.urlPago}`);
            console.log(`📋 Código del pedido: ${response.data.data.pedido.codigo}`);
            console.log(`🍕 Estado del pedido: ${response.data.data.pedido.estado}`);
            console.log(`💰 Total: $${response.data.data.pedido.total}`);
            
            console.log('\n📋 ===== INFORMACIÓN DE DEPURACIÓN =====');
            console.log('✅ Autenticación OAuth: Revisa los logs del servidor para ver el proceso completo');
            console.log('✅ Creación de transacción 3DS: Revisa los logs del servidor para ver el payload y respuesta');
            console.log('✅ Creación de pedido: Revisa los logs del servidor para ver el proceso de BD');
            console.log('✅ Vinculación: Revisa los logs del servidor para ver cómo se vinculan transacción y pedido');
            
            console.log('\n🔗 ===== PRÓXIMOS PASOS =====');
            console.log(`1. Abre esta URL en tu navegador para completar el pago 3DS:`);
            console.log(`   ${response.data.data.urlPago}`);
            console.log(`2. Completa la autenticación 3DS`);
            console.log(`3. El sistema te redirigirá a: ${process.env.WOMPI_REDIRECT_URL || 'https://mamamianpizza.com/confirmacion'}`);
            
        } else {
            console.log('\n❌ ===== ERROR EN LA RESPUESTA =====');
            console.log(`📝 Mensaje: ${response.data.message}`);
            console.log(`🔍 Error: ${response.data.error}`);
            console.log('📋 Revisa los logs del servidor para ver los detalles de depuración');
        }
        
        console.log('\n📊 ===== DATOS COMPLETOS DE RESPUESTA =====');
        console.log(JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('\n❌ ===== ERROR EN LA PETICIÓN =====');
        
        if (error.response) {
            console.error(`📊 Status: ${error.response.status}`);
            console.error(`📝 Mensaje: ${error.response.data?.message || 'Error desconocido'}`);
            console.error(`🔍 Error: ${error.response.data?.error || 'Sin detalles'}`);
            console.error(`🆔 Request ID: ${error.response.data?.requestId || 'No disponible'}`);
            
            console.error('\n📋 Datos completos del error:');
            console.error(JSON.stringify(error.response.data, null, 2));
            
        } else if (error.request) {
            console.error('🌐 Error de red - no se recibió respuesta');
            console.error('🔍 Detalles:', error.message);
            console.error('💡 Verifica que el servidor esté ejecutándose en:', BASE_URL);
            
        } else {
            console.error('⚙️ Error de configuración:', error.message);
        }
        
        console.log('\n📋 ===== CONSEJOS DE DEPURACIÓN =====');
        console.log('1. 🔍 Revisa la consola del servidor para ver los logs detallados de Wompi');
        console.log('2. 🔑 Verifica que las variables de entorno de Wompi estén configuradas');
        console.log('3. 🌐 Asegúrate de que el servidor esté ejecutándose');
        console.log('4. 📊 Revisa que la base de datos esté conectada');
        console.log('5. 💳 Verifica que las credenciales de Wompi sean válidas');
    }
}

/**
 * Función para mostrar información de configuración
 */
function showConfig() {
    console.log('\n⚙️ ===== CONFIGURACIÓN DE PRUEBA =====');
    console.log(`🔗 Base URL: ${BASE_URL}`);
    console.log(`📍 Endpoint: ${ENDPOINT}`);
    console.log(`💳 Tarjeta de prueba: 4573690001990693 (Wompi test card)`);
    console.log(`🔒 CVV: 835`);
    console.log(`📅 Vencimiento: 12/2029`);
    console.log(`👤 Cliente de prueba: Erick Tiznado`);
    console.log(`💰 Monto de prueba: $4.00`);
    
    console.log('\n📋 ===== VARIABLES DE ENTORNO REQUERIDAS =====');
    console.log('WOMPI_CLIENT_ID=116288d1-10ee-47c4-8969-a7fd0c671c40');
    console.log('WOMPI_CLIENT_SECRET=249aca7c-8a8f-48ca-acda-a28d4a9ea0fc');
    console.log('WOMPI_REDIRECT_URL=https://mamamianpizza.com/confirmacion');
    
    console.log('\n🎯 ===== QUÉ ESPERAR EN LOS LOGS =====');
    console.log('✅ Logs de autenticación OAuth con Wompi');
    console.log('✅ Logs de construcción del payload 3DS');
    console.log('✅ Logs de respuesta de Wompi con URL 3DS');
    console.log('✅ Logs de creación del pedido en BD');
    console.log('✅ Logs de vinculación transacción-pedido');
    console.log('✅ Tiempos de respuesta y request IDs para trazabilidad');
}

// Ejecutar la prueba
if (require.main === module) {
    showConfig();
    
    setTimeout(() => {
        testWompiDebug()
            .then(() => {
                console.log('\n🏁 ===== PRUEBA DE DEPURACIÓN COMPLETADA =====');
                console.log('📋 Revisa la consola del servidor para ver todos los logs de depuración');
                process.exit(0);
            })
            .catch((error) => {
                console.error('\n💥 ===== ERROR CRÍTICO =====');
                console.error(error);
                process.exit(1);
            });
    }, 1000);
}

module.exports = { testWompiDebug, testPaymentData };
