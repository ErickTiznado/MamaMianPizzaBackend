// test-final-payment.js
// Prueba final del sistema de pagos con las columnas corregidas

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Datos de prueba (mismos que usa el frontend)
const testData = {
    "cliente": {
        "nombre": "Juan Pérez Test",
        "telefono": "70123456",
        "email": "test@mamamianpizza.com",
        "direccion": "Calle Test #123, San Salvador"
    },
    "tarjeta": {
        "numeroTarjeta": "4573690001990693",
        "cvv": "835",
        "mesVencimiento": 12,
        "anioVencimiento": 2029
    },
    "productos": [
        {
            "id_producto": 123,
            "id_tamano": 2,
            "cantidad": 1,
            "precio_unitario": 5.50,
            "observaciones": "Masa: Tradicional, Tamaño: Personal"
        }
    ],
    "tipo_entrega": "recoger",
    "observaciones_generales": "Prueba del sistema corregido",
    "descuento": 0
};

async function testFinalPayment() {
    console.log('🧪 ===== PRUEBA FINAL DEL SISTEMA DE PAGOS =====');
    console.log('🎯 Probando con columnas de base de datos corregidas');
    
    try {
        console.log('\n📤 Enviando datos al endpoint /api/payments/process-order...');
        
        const response = await axios.post(`${BASE_URL}/api/payments/process-order`, testData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
        
        if (response.data.success) {
            console.log('\n🎉 ===== ÉXITO TOTAL =====');
            console.log('✅ Pago procesado correctamente');
            console.log('✅ Transacción guardada en base de datos');
            console.log('✅ Pedido creado automáticamente');
            
            console.log('\n📊 RESULTADOS:');
            console.log('🔗 URL de pago:', response.data.data.urlPago);
            console.log('💳 Transaction ID:', response.data.data.transactionId);
            console.log('📋 Código de pedido:', response.data.data.pedido?.codigo);
            console.log('💰 Total:', response.data.data.pedido?.total);
            console.log('📧 Email cliente:', response.data.data.pedido?.email_cliente);
            
            console.log('\n🚀 El cliente ahora puede abrir esta URL para completar el pago:');
            console.log(response.data.data.urlPago);
            
        } else {
            console.log('\n❌ Error en el proceso:', response.data.message);
            console.log('🔍 Detalles:', response.data.error);
        }
        
    } catch (error) {
        console.error('\n💥 Error en la prueba:');
        console.error('Status:', error.response?.status);
        console.error('Mensaje:', error.response?.data?.message);
        console.error('Error:', error.response?.data?.error);
        
        if (error.response?.data?.debug) {
            console.error('Debug info:', error.response.data.debug);
        }
    }
    
    console.log('\n📋 ===== REVISIÓN DE LOGS =====');
    console.log('🔍 Revisa la consola del servidor para ver:');
    console.log('  • Logs de detección de formato');
    console.log('  • Proceso de adaptación de datos');
    console.log('  • Llamada a Wompi (token, payload, respuesta)');
    console.log('  • Guardado en base de datos con columnas correctas');
    console.log('  • Creación automática del pedido');
}

// Ejecutar test
if (require.main === module) {
    testFinalPayment()
        .then(() => {
            console.log('\n🏁 Prueba completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Error crítico:', error.message);
            process.exit(1);
        });
}

module.exports = { testFinalPayment };
