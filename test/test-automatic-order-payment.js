// Archivo de prueba para el nuevo endpoint de pago + pedido automático
// test-automatic-order-payment.js

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000'; // Ajustar según tu configuración
const ENDPOINT = '/api/payments/process-order';

/**
 * Datos de prueba para el pago completo con pedido automático
 */
const testData = {
    // 💳 Datos de la tarjeta (datos de prueba de Wompi)
    numeroTarjeta: '4573690001990693',
    cvv: '835',
    mesVencimiento: 12,
    anioVencimiento: 2029,
    
    // 👤 Datos del cliente para el pago
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@example.com',
    telefono: '50312345678',
    direccionPago: 'Colonia Escalón, Calle Principal #123',
    ciudad: 'San Salvador',
    idPais: 'SV',
    idRegion: 'SV-SS',
    codigoPostal: '1101',
    
    // 🛍️ Datos completos del pedido
    pedidoData: {
        tipo_cliente: 'invitado',
        cliente: {
            nombre: 'Juan',
            apellido: 'Pérez',
            telefono: '50312345678',
            email: 'juan.perez@example.com'
        },
        direccion: {
            tipo_direccion: 'formulario',
            direccion: 'Colonia Escalón, Calle Principal #123',
            pais: 'El Salvador',
            departamento: 'San Salvador',
            municipio: 'San Salvador',
            codigo_postal: '1101',
            instrucciones_entrega: 'Casa amarilla con portón negro'
        },
        productos: [
            {
                id_producto: 1,
                nombre_producto: 'Pizza Margarita Mediana',
                cantidad: 2,
                precio_unitario: 12.50,
                subtotal: 25.00,
                masa: 'tradicional',
                tamano: 'mediana',
                instrucciones_especiales: 'Sin cebolla'
            },
            {
                id_producto: 2,
                nombre_producto: 'Coca Cola 600ml',
                cantidad: 2,
                precio_unitario: 1.50,
                subtotal: 3.00
            },
            {
                id_producto: 3,
                nombre_producto: 'Pizza Pepperoni Grande',
                cantidad: 1,
                precio_unitario: 15.00,
                subtotal: 15.00
            }
        ],
        subtotal: 43.00,
        costo_envio: 3.00,
        impuestos: 5.59,
        total: 51.59,
        aceptado_terminos: true,
        tiempo_estimado_entrega: 45
    }
};

/**
 * Función para probar el endpoint de pago + pedido automático
 */
async function testAutomaticOrderPayment() {
    console.log('\n🚀 ===== INICIANDO PRUEBA DE PAGO + PEDIDO AUTOMÁTICO =====');
    console.log(`🔗 URL: ${BASE_URL}${ENDPOINT}`);
    console.log(`💰 Monto total: $${testData.pedidoData.total}`);
    console.log(`🛍️ Productos: ${testData.pedidoData.productos.length} items`);
    console.log(`📧 Cliente: ${testData.nombre} ${testData.apellido} (${testData.email})`);
    
    try {
        console.log('\n📤 Enviando petición...');
        const startTime = Date.now();
        
        const response = await axios.post(`${BASE_URL}${ENDPOINT}`, testData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 segundos de timeout
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`\n✅ ===== RESPUESTA EXITOSA (${responseTime}ms) =====`);
        console.log(`📊 Status: ${response.status}`);
        console.log(`📋 Datos de respuesta:`);
        console.log(JSON.stringify(response.data, null, 2));
        
        if (response.data.success) {
            console.log('\n🎉 ===== PAGO Y PEDIDO PROCESADOS EXITOSAMENTE =====');
            console.log(`💳 Transaction ID: ${response.data.data.transactionId}`);
            console.log(`🔗 URL de pago: ${response.data.data.urlPago}`);
            console.log(`📋 Código del pedido: ${response.data.data.pedido.codigo}`);
            console.log(`🍕 Estado del pedido: ${response.data.data.pedido.estado}`);
            console.log(`💰 Total procesado: $${response.data.data.pedido.total}`);
            console.log(`⏱️ Tiempo de procesamiento: ${response.data.data.processingTime}ms`);
            console.log(`📝 Mensaje: ${response.data.data.message}`);
            
            // Mostrar detalles del pedido
            console.log('\n📦 ===== DETALLES DEL PEDIDO CREADO =====');
            console.log(`🆔 ID: ${response.data.data.pedido.id}`);
            console.log(`🔖 Código: ${response.data.data.pedido.codigo}`);
            console.log(`📊 Estado: ${response.data.data.pedido.estado} (⭐ AUTOMÁTICO)`);
            console.log(`🛍️ Productos: ${response.data.data.pedido.productos_count} items`);
            console.log(`💰 Total: $${response.data.data.pedido.total}`);
            
            return {
                success: true,
                data: response.data.data,
                responseTime
            };
        } else {
            console.log('\n❌ ===== ERROR EN LA RESPUESTA =====');
            console.log(`📝 Mensaje: ${response.data.message}`);
            console.log(`🔍 Error: ${response.data.error}`);
            return {
                success: false,
                error: response.data.message,
                responseTime
            };
        }
        
    } catch (error) {
        console.error('\n❌ ===== ERROR EN LA PETICIÓN =====');
        
        if (error.response) {
            // Error de respuesta del servidor
            console.error(`📊 Status: ${error.response.status}`);
            console.error(`📝 Mensaje: ${error.response.data?.message || 'Error desconocido'}`);
            console.error(`🔍 Error: ${error.response.data?.error || 'Sin detalles'}`);
            console.error(`📋 Datos completos:`, JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            // Error de red
            console.error('🌐 Error de red - no se recibió respuesta');
            console.error('🔍 Detalles:', error.message);
        } else {
            // Error de configuración
            console.error('⚙️ Error de configuración:', error.message);
        }
        
        return {
            success: false,
            error: error.message,
            responseTime: null
        };
    }
}

/**
 * Función para probar múltiples escenarios
 */
async function runTestSuite() {
    console.log('\n🧪 ===== INICIANDO SUITE DE PRUEBAS =====\n');
    
    const tests = [
        {
            name: 'Pago + Pedido Automático - Cliente Invitado',
            data: testData
        },
        {
            name: 'Pago + Pedido Automático - Cliente Registrado',
            data: {
                ...testData,
                pedidoData: {
                    ...testData.pedidoData,
                    tipo_cliente: 'registrado',
                    cliente: {
                        ...testData.pedidoData.cliente,
                        id_usuario: 1 // Simular usuario registrado
                    }
                }
            }
        },
        {
            name: 'Pago + Pedido con Dirección por Coordenadas',
            data: {
                ...testData,
                pedidoData: {
                    ...testData.pedidoData,
                    direccion: {
                        tipo_direccion: 'coordenadas',
                        latitud: 13.6929,
                        longitud: -89.2182,
                        direccion_formateada: 'Colonia Escalón, San Salvador',
                        instrucciones_entrega: 'Casa amarilla con portón negro'
                    }
                }
            }
        }
    ];
    
    const results = [];
    
    for (const [index, test] of tests.entries()) {
        console.log(`\n🧪 Prueba ${index + 1}/${tests.length}: ${test.name}`);
        console.log('═'.repeat(50));
        
        const result = await testAutomaticOrderPayment();
        results.push({
            name: test.name,
            ...result
        });
        
        // Esperar 2 segundos entre pruebas
        if (index < tests.length - 1) {
            console.log('\n⏳ Esperando 2 segundos antes de la siguiente prueba...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    // Resumen de resultados
    console.log('\n📊 ===== RESUMEN DE PRUEBAS =====');
    results.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        const time = result.responseTime ? `(${result.responseTime}ms)` : '';
        console.log(`${status} ${index + 1}. ${result.name} ${time}`);
        if (!result.success) {
            console.log(`   🔍 Error: ${result.error}`);
        }
    });
    
    const successCount = results.filter(r => r.success).length;
    console.log(`\n🎯 Resultado: ${successCount}/${results.length} pruebas exitosas`);
}

// Ejecutar las pruebas si el archivo se ejecuta directamente
if (require.main === module) {
    runTestSuite()
        .then(() => {
            console.log('\n🏁 ===== PRUEBAS COMPLETADAS =====');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 ===== ERROR CRÍTICO =====');
            console.error(error);
            process.exit(1);
        });
}

module.exports = {
    testAutomaticOrderPayment,
    runTestSuite,
    testData
};
