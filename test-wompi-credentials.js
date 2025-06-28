// Script para probar las credenciales de Wompi
const axios = require('axios');

const WOMPI_APP_ID = '116288d1-10ee-47c4-8969-a7fd0c671c40';
const WOMPI_API_SECRET = '249aca7c-8a8f-48ca-acda-a28d4a9ea0fc';

function generateAuthHeader() {
    const credentials = `${WOMPI_APP_ID}:${WOMPI_API_SECRET}`;
    const encoded = Buffer.from(credentials).toString('base64');
    return `Basic ${encoded}`;
}

async function testWompiCredentials() {
    console.log('🧪 Probando credenciales de Wompi...');
    console.log('APP_ID:', WOMPI_APP_ID);
    console.log('API_SECRET:', WOMPI_API_SECRET ? WOMPI_API_SECRET.substring(0, 8) + '...' : 'NO DEFINIDO');
    console.log('Auth Header:', generateAuthHeader());
    
    // Payload de prueba mínimo
    const testPayload = {
        tarjetaCreditoDebido: {
            numeroTarjeta: "4111111111111111", // Visa de prueba
            cvv: "123",
            mesVencimiento: 12,
            anioVencimiento: 2025
        },
        monto: 1.00,
        urlRedirect: "https://mamamianpizza.com/test",
        nombre: "Test",
        apellido: "User",
        email: "test@test.com",
        ciudad: "San Salvador",
        direccion: "Test Address",
        idPais: "SV",
        idRegion: "SV-SS",
        codigoPostal: "01101",
        telefono: "12345678"
    };
    
    try {
        console.log('\n📤 Enviando petición de prueba a Wompi...');
        
        const response = await axios.post(
            'https://api.wompi.sv/TransaccionCompra/3DS',
            testPayload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': generateAuthHeader(),
                    'Accept': 'application/json',
                    'User-Agent': 'MamaMianPizza/1.0'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ Respuesta exitosa de Wompi:');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
        
    } catch (error) {
        console.log('❌ Error en la petición:');
        console.log('Status:', error.response?.status);
        console.log('Headers:', error.response?.headers);
        console.log('Data:', error.response?.data);
        console.log('Message:', error.message);
        
        if (error.response?.status === 401) {
            console.log('\n🔍 Análisis del error 401:');
            console.log('- Las credenciales APP_ID/API_SECRET no son válidas');
            console.log('- O las credenciales son para un entorno diferente (sandbox vs producción)');
            console.log('- O el formato del header de autorización es incorrecto');
        }
    }
}

// Ejecutar la prueba
testWompiCredentials();
