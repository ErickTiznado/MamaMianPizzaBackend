const axios = require('axios');

console.log('🧪 ===== PRUEBA DIRECTA DEL ENDPOINT /api/payments/process-order =====\n');

const testEndpoint = async () => {
    try {
        const testData = {
            cliente: {
                nombre: "Erick Tiznado",
                telefono: "70830446",
                email: "USIS038521@ugb.edu.sv",
                direccion: "CP #3417, Puerto El Triunfo, EL salvador"
            },
            descuento: 0,
            observaciones_generales: "",
            productos: [{
                id_producto: 1751248830338,
                id_tamano: 2,
                cantidad: 1,
                precio_unitario: 7,
                nombre: "Pizza Margherita"
            }],
            tarjeta: {
                numeroTarjeta: "4573690001990693",
                cvv: "835",
                mesVencimiento: 12,
                anioVencimiento: 2029
            },
            tipo_entrega: "recoger"
        };

        console.log('📤 Enviando request a: http://localhost:3000/api/payments/process-order');
        console.log('📦 Data enviada:', JSON.stringify(testData, null, 2));
        console.log('\n⏱️  Enviando request...\n');

        const response = await axios.post('http://localhost:3000/api/payments/process-order', testData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log('✅ Response Status:', response.status);
        console.log('📋 Response Headers:', response.headers);
        console.log('📦 Response Data:', JSON.stringify(response.data, null, 2));

        // Verificar si la respuesta es la esperada
        if (response.data && response.data.success && response.data.data && response.data.data.urlPago) {
            console.log('\n🎉 ===== RESPUESTA CORRECTA =====');
            console.log('✅ success:', response.data.success);
            console.log('🔗 urlPago:', response.data.data.urlPago);
            console.log('💰 monto:', response.data.data.monto);
            console.log('🆔 transactionId:', response.data.data.transactionId);
        } else {
            console.log('\n❌ ===== RESPUESTA INCORRECTA =====');
            console.log('❌ La respuesta no tiene el formato esperado');
            console.log('🔍 Campos presentes:', Object.keys(response.data || {}));
        }

    } catch (error) {
        console.log('\n❌ ===== ERROR EN LA REQUEST =====');
        console.log('❌ Error status:', error.response?.status);
        console.log('❌ Error message:', error.message);
        console.log('❌ Error data:', error.response?.data);
        console.log('❌ Error completo:', error.response || error);
    }
};

testEndpoint();
