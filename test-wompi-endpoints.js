const axios = require('axios');
require('dotenv').config();

console.log('🧪 Probando endpoints específicos de Wompi basados en el panel...\n');

const APP_ID = process.env.WOMPI_APP_ID;
const API_SECRET = process.env.WOMPI_API_SECRET;

console.log('App ID:', APP_ID);
console.log('API Secret:', API_SECRET?.substring(0, 8) + '...');

// Diferentes endpoints que podrían existir
const endpointsToTest = [
    {
        name: 'TransaccionCompra/3DS (actual)',
        url: 'https://api.wompi.sv/TransaccionCompra/3DS'
    },
    {
        name: 'Transaccion/3DS',
        url: 'https://api.wompi.sv/Transaccion/3DS'
    },
    {
        name: 'QuickPay',
        url: 'https://api.wompi.sv/QuickPay'
    },
    {
        name: 'Pago',
        url: 'https://api.wompi.sv/Pago'
    },
    {
        name: 'EnlaceCompra',
        url: 'https://api.wompi.sv/EnlaceCompra'
    },
    {
        name: 'Checkout',
        url: 'https://api.wompi.sv/Checkout'
    }
];

// Métodos de autenticación
const authMethods = [
    {
        name: 'Basic Auth',
        header: `Basic ${Buffer.from(`${APP_ID}:${API_SECRET}`).toString('base64')}`
    },
    {
        name: 'Bearer API_SECRET',
        header: `Bearer ${API_SECRET}`
    },
    {
        name: 'Bearer APP_ID',
        header: `Bearer ${APP_ID}`
    }
];

const testPayload = {
    tarjetaCreditoDebido: {
        numeroTarjeta: "4111111111111111",
        cvv: "123",
        mesVencimiento: 12,
        anioVencimiento: 2025
    },
    monto: 1.0,
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

async function testEndpoints() {
    for (const endpoint of endpointsToTest) {
        console.log(`\n🌐 Probando endpoint: ${endpoint.name}`);
        console.log(`URL: ${endpoint.url}`);
        
        for (const auth of authMethods) {
            console.log(`\n  🔑 Con ${auth.name}...`);
            
            try {
                const response = await axios.post(endpoint.url, testPayload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': auth.header,
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                });
                
                console.log(`  ✅ ¡ÉXITO! Status: ${response.status}`);
                console.log(`  Respuesta:`, response.data);
                
                console.log(`\n🎉 ¡COMBINACIÓN EXITOSA ENCONTRADA!`);
                console.log(`Endpoint: ${endpoint.url}`);
                console.log(`Auth: ${auth.name}`);
                console.log(`Header: ${auth.header}`);
                return;
                
            } catch (error) {
                if (error.response) {
                    const status = error.response.status;
                    if (status === 404) {
                        console.log(`  ❌ 404 - Endpoint no existe`);
                    } else if (status === 401) {
                        console.log(`  ❌ 401 - Credenciales rechazadas`);
                    } else if (status === 400) {
                        console.log(`  ⚠️  400 - Endpoint existe pero payload incorrecto`);
                        console.log(`  Detalle:`, error.response.data);
                    } else {
                        console.log(`  ❌ ${status} - ${error.response.statusText}`);
                        if (error.response.data) {
                            console.log(`  Detalle:`, error.response.data);
                        }
                    }
                } else {
                    console.log(`  ❌ Error de red:`, error.message);
                }
            }
        }
    }
    
    console.log(`\n❌ No se encontró ninguna combinación exitosa`);
    console.log(`\n📞 Recomendaciones:`);
    console.log(`1. Verificar documentación específica de Wompi El Salvador`);
    console.log(`2. Contactar soporte de Wompi para confirmar endpoints`);
    console.log(`3. Verificar si necesitas activar 3DS en el panel`);
}

testEndpoints();
