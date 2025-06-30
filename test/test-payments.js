const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3000/api/payments'; // Cambiar por tu URL

// Datos de prueba
const testData = {
    numeroTarjeta: '4573690001990693',
    cvv: '835',
    mesVencimiento: 12,
    anioVencimiento: 2029,
    nombre: 'Erick',
    apellido: 'Tiznado',
    email: 'tiznadoerick3@gmail.com',
    telefono: '50300000000',
    direccion: 'Tu Dirección 123',
    ciudad: 'San Salvador',
    idPais: 'SV',
    idRegion: 'SV-SS',
    codigoPostal: '1101',
    monto: 4.00,
    descripcion: 'Pago de prueba desde script',
    pedidoId: null
};

async function testPaymentAPI() {
    console.log('🧪 Iniciando pruebas de la API de Pagos...\n');

    try {
        // Test 1: Transacción de prueba rápida
        console.log('📝 Test 1: Transacción de prueba rápida');
        const testResponse = await axios.post(`${API_BASE_URL}/test`);
        console.log('✅ Resultado:', testResponse.data);
        console.log('🔗 URL de pago:', testResponse.data.urlPago);
        console.log('');

        // Test 2: Crear transacción completa
        console.log('📝 Test 2: Crear transacción completa');
        const createResponse = await axios.post(`${API_BASE_URL}/create`, testData);
        console.log('✅ Resultado:', createResponse.data);
        
        if (createResponse.data.success) {
            const transactionId = createResponse.data.data.transactionId;
            console.log('🆔 ID de transacción:', transactionId);
            console.log('🔗 URL de pago:', createResponse.data.data.urlPago);
            
            // Test 3: Obtener la transacción creada
            console.log('\n📝 Test 3: Obtener transacción por ID');
            try {
                const getResponse = await axios.get(`${API_BASE_URL}/${transactionId}`);
                console.log('✅ Transacción obtenida:', getResponse.data.data);
            } catch (error) {
                console.log('⚠️ No se pudo obtener la transacción (puede requerir autenticación)');
            }

            // Test 4: Actualizar estado
            console.log('\n📝 Test 4: Actualizar estado de transacción');
            try {
                const updateResponse = await axios.put(`${API_BASE_URL}/${transactionId}/status`, {
                    status: 'completed',
                    wompiResponse: {
                        transactionId: `test_${Date.now()}`,
                        authorizationCode: '123456',
                        responseCode: '00'
                    }
                });
                console.log('✅ Estado actualizado:', updateResponse.data);
            } catch (error) {
                console.log('⚠️ No se pudo actualizar el estado:', error.response?.data?.message || error.message);
            }
        }

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    }
}

async function testValidations() {
    console.log('\n🔍 Probando validaciones...\n');

    // Test con datos inválidos
    const invalidData = {
        numeroTarjeta: '123', // Muy corto
        cvv: '12', // Muy corto
        mesVencimiento: 13, // Inválido
        anioVencimiento: 2020, // Expirado
        nombre: 'A', // Muy corto
        apellido: '', // Vacío
        email: 'invalid-email', // Formato inválido
        telefono: '123', // Muy corto
        direccion: 'Dir', // Muy corta
        monto: -5 // Negativo
    };

    try {
        console.log('📝 Test: Datos inválidos (debería fallar)');
        const response = await axios.post(`${API_BASE_URL}/create`, invalidData);
        console.log('⚠️ Inesperado: La validación no funcionó');
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Validación funcionando correctamente');
            console.log('📋 Errores detectados:', error.response.data.errors);
        } else {
            console.log('❌ Error inesperado:', error.response?.data || error.message);
        }
    }
}

async function runAllTests() {
    console.log('🚀 Iniciando suite completa de pruebas para la API de Pagos');
    console.log('=' * 60);
    
    await testPaymentAPI();
    await testValidations();
    
    console.log('\n' + '=' * 60);
    console.log('✅ Pruebas completadas');
    console.log('\n💡 Para probar el flujo completo:');
    console.log('1. Usa la URL de pago generada');
    console.log('2. Completa el proceso en Wompi');
    console.log('3. Verifica el estado final en tu base de datos');
}

// Ejecutar las pruebas
runAllTests().catch(console.error);
