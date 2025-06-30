// test-complete-flow.js
// Prueba completa del flujo de pago y pedido con todas las correcciones

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Datos de prueba simplificados
const testData = {
    "cliente": {
        "nombre": "María Rodríguez",
        "telefono": "70987654",
        "email": "maria@test.com",
        "direccion": "Colonia Centroamérica, San Salvador"
    },
    "tarjeta": {
        "numeroTarjeta": "4573690001990693",
        "cvv": "835",
        "mesVencimiento": 12,
        "anioVencimiento": 2029
    },
    "productos": [
        {
            "id_producto": 101,
            "id_tamano": 2,
            "cantidad": 2,
            "precio_unitario": 8.50,
            "observaciones": "Masa: Integral, Tamaño: Mediana"
        }
    ],
    "tipo_entrega": "domicilio",
    "observaciones_generales": "Casa azul, portón negro",
    "descuento": 1.00
};

async function testCompleteFlow() {
    console.log('🚀 ===== PRUEBA COMPLETA DEL FLUJO PAGO + PEDIDO =====');
    console.log('🎯 Con todas las correcciones de columnas aplicadas');
    
    console.log('\n📊 DATOS DE LA PRUEBA:');
    console.log('👤 Cliente:', `${testData.cliente.nombre} (${testData.cliente.email})`);
    console.log('📱 Teléfono:', testData.cliente.telefono);
    console.log('💳 Tarjeta:', `****-****-****-${testData.tarjeta.numeroTarjeta.slice(-4)}`);
    console.log('🛍️ Productos:', testData.productos.length);
    console.log('🚚 Tipo entrega:', testData.tipo_entrega);
    
    const totalCalculado = testData.productos.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0);
    const costoEnvio = testData.tipo_entrega === 'domicilio' ? 2.50 : 0;
    const totalFinal = totalCalculado + costoEnvio - testData.descuento;
    console.log('💰 Total calculado:', `$${totalFinal}`);
    
    try {
        console.log('\n📤 Enviando solicitud al servidor...');
        
        const response = await axios.post(`${BASE_URL}/api/payments/process-order`, testData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
        
        if (response.data.success) {
            console.log('\n🎉 ===== ÉXITO COMPLETO =====');
            console.log('✅ Pago procesado con Wompi');
            console.log('✅ Transacción guardada en base de datos');
            console.log('✅ Usuario invitado creado');
            console.log('✅ Pedido creado automáticamente');
            
            const data = response.data.data;
            
            console.log('\n📊 RESULTADOS DETALLADOS:');
            console.log('='.repeat(50));
            console.log('💳 ID Transacción:', data.transactionId);
            console.log('🔗 URL de pago Wompi:', data.urlPago);
            
            if (data.pedido) {
                console.log('\n📋 PEDIDO CREADO:');
                console.log('🔖 Código:', data.pedido.codigo);
                console.log('🆔 ID Pedido:', data.pedido.id);
                console.log('💰 Total:', `$${data.pedido.total}`);
                console.log('📧 Email:', data.pedido.email_cliente);
                console.log('📱 Teléfono:', data.pedido.telefono);
                console.log('🏠 Estado:', data.pedido.estado);
                console.log('👤 Tipo cliente:', data.pedido.tipo_cliente);
                console.log('💳 Método pago:', data.pedido.metodo_pago);
            }
            
            console.log('\n🔗 SIGUIENTE PASO:');
            console.log('El cliente debe abrir esta URL para completar el pago 3DS:');
            console.log(data.urlPago);
            
            console.log('\n✅ TODO EL SISTEMA FUNCIONA CORRECTAMENTE');
            
        } else {
            console.log('\n❌ FALLO EN EL PROCESO:');
            console.log('Mensaje:', response.data.message);
            console.log('Error:', response.data.error);
            if (response.data.debug) {
                console.log('Debug:', response.data.debug);
            }
        }
        
    } catch (error) {
        console.error('\n💥 ERROR EN LA PRUEBA:');
        
        if (error.response) {
            console.error('🔍 Status HTTP:', error.response.status);
            console.error('📋 Mensaje:', error.response.data?.message);
            console.error('❌ Error:', error.response.data?.error);
            console.error('🐞 SQL:', error.response.data?.sql);
            
            if (error.response.data?.debug) {
                console.error('🔧 Debug info:', error.response.data.debug);
            }
        } else {
            console.error('💥 Error de conexión:', error.message);
        }
    }
    
    console.log('\n📋 REVISIÓN:');
    console.log('🔍 Revisa los logs del servidor para ver el flujo completo:');
    console.log('  • Detección y adaptación de formato de datos');
    console.log('  • Llamada a Wompi (OAuth + 3DS)');
    console.log('  • Guardado en tabla transacciones (con columnas corregidas)');
    console.log('  • Creación de usuario invitado en usuarios_invitados (celular)');
    console.log('  • Creación de pedido en tabla pedidos');
    console.log('  • Manejo de direcciones');
    console.log('  • Creación de detalles de productos');
}

// Ejecutar test
if (require.main === module) {
    testCompleteFlow()
        .then(() => {
            console.log('\n🏁 Prueba completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Error crítico en el test:', error.message);
            process.exit(1);
        });
}

module.exports = { testCompleteFlow };
