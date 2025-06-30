// test-full-payment-flow.js
// Prueba del flujo completo de pago: Crear transacción → Simular confirmación → Crear pedido

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Datos de prueba para el pago
const paymentData = {
    "cliente": {
        "nombre": "Ana García",
        "telefono": "70555444",
        "email": "ana.garcia@test.com",
        "direccion": "Residencial Los Robles, San Salvador"
    },
    "tarjeta": {
        "numeroTarjeta": "4573690001990693",
        "cvv": "835",
        "mesVencimiento": 12,
        "anioVencimiento": 2029
    },
    "productos": [
        {
            "id_producto": 301,
            "cantidad": 1,
            "precio_unitario": 15.50,
            "observaciones": "Masa: Integral, Tamaño: Familiar"
        },
        {
            "id_producto": 302,
            "cantidad": 2,
            "precio_unitario": 2.25,
            "observaciones": "Bebida: Coca Cola 12oz"
        }
    ],
    "tipo_entrega": "domicilio",
    "observaciones_generales": "Prueba del flujo completo",
    "descuento": 2.00
};

/**
 * Paso 1: Crear la transacción de pago
 */
async function step1_createPaymentTransaction() {
    console.log('🚀 ===== PASO 1: CREAR TRANSACCIÓN DE PAGO =====');
    
    try {
        console.log('📤 Enviando datos al endpoint /api/payments/process-order...');
        
        const response = await axios.post(`${BASE_URL}/api/payments/process-order`, paymentData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
        
        if (response.data.success) {
            const data = response.data.data;
            
            console.log('✅ TRANSACCIÓN CREADA EXITOSAMENTE');
            console.log('🆔 Transaction ID:', data.transactionId);
            console.log('🔗 URL de pago:', data.urlPago);
            console.log('💰 Monto:', `$${data.monto}`);
            console.log('📋 Estado del pedido:', data.pedidoStatus);
            
            // Extraer el ID de transacción de Wompi de la URL
            const urlParams = new URL(data.urlPago);
            const wompiTransactionId = urlParams.searchParams.get('id');
            
            console.log('🔑 Wompi Transaction ID extraído:', wompiTransactionId);
            
            return {
                success: true,
                transactionId: data.transactionId,
                urlPago: data.urlPago,
                wompiTransactionId,
                monto: data.monto
            };
            
        } else {
            console.log('❌ Error al crear transacción:', response.data.message);
            return { success: false, error: response.data.message };
        }
        
    } catch (error) {
        console.error('💥 Error en paso 1:', error.response?.data?.message || error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Paso 2: Simular la confirmación de Wompi (pago exitoso)
 */
async function step2_simulateSuccessfulPayment(wompiTransactionId, monto) {
    console.log('\n🧪 ===== PASO 2: SIMULAR CONFIRMACIÓN EXITOSA =====');
    
    // Simular los parámetros que Wompi envía cuando el pago es exitoso
    const confirmationParams = {
        idTransaccion: wompiTransactionId,
        monto: monto.toString(),
        esReal: 'True',
        formaPago: 'PagoNormal',
        esAprobada: 'True', // ✅ PAGO EXITOSO
        codigoAutorizacion: '123456',
        mensaje: 'Pago+aprobado+exitosamente',
        hash: 'test_hash_123'
    };
    
    console.log('📋 Simulando parámetros de confirmación:');
    Object.entries(confirmationParams).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
    });
    
    try {
        const queryString = new URLSearchParams(confirmationParams).toString();
        const confirmationUrl = `${BASE_URL}/api/payments/confirmation?${queryString}`;
        
        console.log('\n🔗 URL de confirmación:');
        console.log(confirmationUrl);
        
        console.log('\n📤 Enviando confirmación...');
        
        const response = await axios.get(confirmationUrl, {
            maxRedirects: 0, // No seguir redirects para capturar la respuesta
            validateStatus: function (status) {
                return status >= 200 && status < 400; // Aceptar redirects como éxito
            }
        });
        
        console.log('✅ CONFIRMACIÓN PROCESADA');
        console.log('📊 Status:', response.status);
        
        if (response.status === 302) {
            const redirectLocation = response.headers.location;
            console.log('🔗 Redirect a:', redirectLocation);
            
            if (redirectLocation.includes('pago-exitoso')) {
                console.log('🎉 PAGO CONFIRMADO COMO EXITOSO');
                
                // Extraer parámetros del redirect
                const redirectUrl = new URL(redirectLocation);
                const pedidoCodigo = redirectUrl.searchParams.get('pedido');
                const transactionId = redirectUrl.searchParams.get('transaction');
                
                return {
                    success: true,
                    pedidoCodigo,
                    transactionId,
                    redirectLocation
                };
            } else {
                console.log('❌ Pago no exitoso, redirect:', redirectLocation);
                return { success: false, redirectLocation };
            }
        }
        
        return { success: true, status: response.status };
        
    } catch (error) {
        console.error('💥 Error en paso 2:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Paso 3: Simular confirmación de pago fallido
 */
async function step3_simulateFailedPayment(wompiTransactionId, monto) {
    console.log('\n🧪 ===== PASO 3: SIMULAR CONFIRMACIÓN FALLIDA =====');
    
    const confirmationParams = {
        idTransaccion: wompiTransactionId,
        monto: monto.toString(),
        esReal: 'True',
        formaPago: 'PagoNormal',
        esAprobada: 'False', // ❌ PAGO FALLIDO
        codigoAutorizacion: '',
        mensaje: 'Fondos+insuficientes.+Intenta+con+otra+tarjeta',
        hash: 'test_hash_failed'
    };
    
    console.log('📋 Simulando pago fallido:');
    console.log('❌ esAprobada: False');
    console.log('💔 mensaje: Fondos insuficientes');
    
    try {
        const queryString = new URLSearchParams(confirmationParams).toString();
        const confirmationUrl = `${BASE_URL}/api/payments/confirmation?${queryString}`;
        
        const response = await axios.get(confirmationUrl, {
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400
        });
        
        if (response.status === 302) {
            const redirectLocation = response.headers.location;
            console.log('🔗 Redirect a:', redirectLocation);
            
            if (redirectLocation.includes('pago-fallido')) {
                console.log('✅ PAGO RECHAZADO CORRECTAMENTE MANEJADO');
                return { success: true, failed: true, redirectLocation };
            }
        }
        
        return { success: true, status: response.status };
        
    } catch (error) {
        console.error('💥 Error en paso 3:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Ejecutar flujo completo
 */
async function runFullPaymentFlow() {
    console.log('🧪 ===== PRUEBA COMPLETA DEL FLUJO DE PAGO =====');
    console.log('🎯 Objetivo: Simular todo el flujo desde creación hasta confirmación');
    
    console.log('\n📊 DATOS DE LA PRUEBA:');
    console.log('👤 Cliente:', paymentData.cliente.nombre);
    console.log('📧 Email:', paymentData.cliente.email);
    console.log('🛍️ Productos:', paymentData.productos.length);
    const total = paymentData.productos.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0) + 2.50 - paymentData.descuento;
    console.log('💰 Total estimado:', `$${total}`);
    
    // Paso 1: Crear transacción
    const step1Result = await step1_createPaymentTransaction();
    
    if (!step1Result.success) {
        console.log('\n💥 FALLO EN PASO 1 - Abortando prueba');
        return;
    }
    
    // Esperar un momento
    console.log('\n⏳ Esperando 2 segundos antes de simular confirmación...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Paso 2: Simular pago exitoso
    const step2Result = await step2_simulateSuccessfulPayment(
        step1Result.wompiTransactionId, 
        step1Result.monto
    );
    
    if (step2Result.success && step2Result.pedidoCodigo) {
        console.log('\n🎉 ===== FLUJO EXITOSO COMPLETADO =====');
        console.log('✅ Transacción creada');
        console.log('✅ Pago confirmado');
        console.log('✅ Pedido creado automáticamente');
        console.log('🔖 Código del pedido:', step2Result.pedidoCodigo);
    }
    
    // Paso 3: Crear otra transacción y simular fallo
    console.log('\n⏳ Esperando antes de probar pago fallido...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Modificar datos para segunda prueba
    paymentData.cliente.email = 'test.failed@example.com';
    paymentData.cliente.telefono = '70111999';
    
    const step1FailResult = await step1_createPaymentTransaction();
    
    if (step1FailResult.success) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const step3Result = await step3_simulateFailedPayment(
            step1FailResult.wompiTransactionId,
            step1FailResult.monto
        );
        
        if (step3Result.success && step3Result.failed) {
            console.log('\n✅ FLUJO DE PAGO FALLIDO MANEJADO CORRECTAMENTE');
        }
    }
    
    console.log('\n📋 ===== RESUMEN FINAL =====');
    console.log('🧪 Pruebas completadas');
    console.log('📊 Revisa los logs del servidor para ver el flujo completo');
    console.log('🔍 Verifica la base de datos para ver las transacciones y pedidos creados');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runFullPaymentFlow()
        .then(() => {
            console.log('\n🏁 Todas las pruebas completadas');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Error crítico en las pruebas:', error);
            process.exit(1);
        });
}

module.exports = { runFullPaymentFlow };
