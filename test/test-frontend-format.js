// test-frontend-format.js
// Script para probar el formato exacto que está enviando el frontend

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000';

// Datos exactos como los está enviando el frontend
const frontendData = {
    "cliente": {
        "nombre": "Erick Tiznado",
        "telefono": "70830446",
        "email": "USIS038521@ugb.edu.sv",
        "direccion": "CP #3417, Puerto El Triunfo, EL salvador"
    },
    "tarjeta": {
        "numeroTarjeta": "4573690001990693",
        "cvv": "835",
        "mesVencimiento": 12,
        "anioVencimiento": 2029
    },
    "productos": [
        {
            "id_producto": 1751242609900,
            "id_tamano": 2,
            "cantidad": 1,
            "precio_unitario": 7,
            "observaciones": "Masa: Tradicional, Tamaño: Personal"
        }
    ],
    "tipo_entrega": "recoger",
    "observaciones_generales": "",
    "descuento": 0
};

/**
 * Test 1: Probar endpoint de debug
 */
async function testDebugEndpoint() {
    console.log('\n🔍 ===== PROBANDO ENDPOINT DE DEBUG =====');
    
    try {
        const response = await axios.post(`${BASE_URL}/api/payments/debug`, frontendData, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('✅ Debug Response:', JSON.stringify(response.data, null, 2));
        return response.data;
        
    } catch (error) {
        console.error('❌ Error en debug:', error.response?.data || error.message);
        return null;
    }
}

/**
 * Test 2: Probar endpoint principal con datos del frontend
 */
async function testMainEndpoint() {
    console.log('\n💳 ===== PROBANDO ENDPOINT PRINCIPAL CON DATOS FRONTEND =====');
    
    try {
        const response = await axios.post(`${BASE_URL}/api/payments/process-order`, frontendData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
        
        if (response.data.success) {
            console.log('🎉 ===== ÉXITO =====');
            console.log('💳 Transaction ID:', response.data.data.transactionId);
            console.log('📋 Código Pedido:', response.data.data.pedido.codigo);
            console.log('🔗 URL Wompi:', response.data.data.urlPago);
            console.log('💰 Total:', response.data.data.pedido.total);
        } else {
            console.log('❌ Error:', response.data.message);
        }
        
        return response.data;
        
    } catch (error) {
        console.error('\n❌ ===== ERROR EN ENDPOINT PRINCIPAL =====');
        console.error('Status:', error.response?.status);
        console.error('Mensaje:', error.response?.data?.message);
        console.error('Error:', error.response?.data?.error);
        console.error('Debug:', error.response?.data?.debug);
        
        return null;
    }
}

/**
 * Test 3: Mostrar qué datos están calculando mal
 */
function analyzeData() {
    console.log('\n📊 ===== ANÁLISIS DE DATOS FRONTEND =====');
    
    const totalProductos = frontendData.productos.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0);
    const costoEnvio = frontendData.tipo_entrega === 'domicilio' ? 2.50 : 0;
    const totalFinal = totalProductos + costoEnvio - frontendData.descuento;
    
    console.log('🛍️ Productos:');
    frontendData.productos.forEach((p, i) => {
        console.log(`  ${i+1}. ID: ${p.id_producto}, Cantidad: ${p.cantidad}, Precio: $${p.precio_unitario}, Subtotal: $${p.cantidad * p.precio_unitario}`);
    });
    
    console.log(`💰 Subtotal productos: $${totalProductos}`);
    console.log(`🚚 Costo envío (${frontendData.tipo_entrega}): $${costoEnvio}`);
    console.log(`🎯 Descuento: $${frontendData.descuento}`);
    console.log(`💳 TOTAL FINAL: $${totalFinal}`);
    
    console.log('\n📋 Estructura esperada por backend:');
    console.log('- cliente: ✅');
    console.log('- tarjeta: ✅');
    console.log('- productos: ✅');
    console.log('- tipo_entrega: ✅');
    console.log('- observaciones_generales: ✅');
    console.log('- descuento: ✅');
}

/**
 * Ejecutar todas las pruebas
 */
async function runAllTests() {
    console.log('🧪 ===== INICIANDO PRUEBAS CON FORMATO FRONTEND =====');
    
    // Análisis inicial
    analyzeData();
    
    // Test de debug
    const debugResult = await testDebugEndpoint();
    
    if (debugResult) {
        console.log('\n📋 Formato detectado:', debugResult.analisis.formatoDetectado);
        console.log('📍 Endpoint recomendado:', debugResult.sugerencias.endpointRecomendado);
    }
    
    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test principal
    const mainResult = await testMainEndpoint();
    
    if (mainResult) {
        console.log('\n🎯 ===== RESULTADO FINAL =====');
        console.log('Éxito:', mainResult.success ? '✅' : '❌');
        if (!mainResult.success) {
            console.log('Razón del error:', mainResult.message);
            console.log('Detalles:', mainResult.error);
        }
    }
    
    console.log('\n📋 ===== LOGS DEL SERVIDOR =====');
    console.log('🔍 Revisa la consola del servidor para ver todos los logs de depuración detallados');
    console.log('📊 Deberías ver el proceso completo de normalización de datos');
    console.log('💳 Y todo el flujo de Wompi si los datos son válidos');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runAllTests()
        .then(() => {
            console.log('\n🏁 Pruebas completadas');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Error crítico:', error);
            process.exit(1);
        });
}

module.exports = { testDebugEndpoint, testMainEndpoint, frontendData };
