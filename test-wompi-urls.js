const axios = require('axios');
require('dotenv').config();

console.log('🧪 Probando diferentes URLs base de Wompi...\n');

const APP_ID = process.env.WOMPI_APP_ID;
const API_SECRET = process.env.WOMPI_API_SECRET;

// Diferentes URLs base para probar
const baseUrls = [
    'https://api.wompi.sv',
    'https://api.wompi.com', 
    'https://api-sandbox.wompi.sv',
    'https://sandbox.wompi.sv',
    'https://checkout.wompi.sv',
    'https://payments.wompi.sv'
];

const endpoints = [
    '/TransaccionCompra/3DS',
    '/api/TransaccionCompra/3DS',
    '/v1/TransaccionCompra/3DS',
    '/QuickPay',
    '/api/QuickPay',
    '/EnlaceCompra',
    '/api/EnlaceCompra',
    '/Pago',
    '/api/payments'
];

const authHeader = `Basic ${Buffer.from(`${APP_ID}:${API_SECRET}`).toString('base64')}`;

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

async function testUrls() {
    console.log('🔑 Usando Basic Auth:', authHeader.substring(0, 30) + '...');
    
    for (const baseUrl of baseUrls) {
        console.log(`\n🌐 Probando base URL: ${baseUrl}`);
        
        for (const endpoint of endpoints) {
            const fullUrl = baseUrl + endpoint;
            console.log(`\n  📡 ${fullUrl}`);
            
            try {
                const response = await axios.post(fullUrl, testPayload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader,
                        'Accept': 'application/json',
                        'User-Agent': 'MamaMianPizza/1.0'
                    },
                    timeout: 8000
                });
                
                console.log(`  ✅ ¡ÉXITO! Status: ${response.status}`);
                console.log(`  Respuesta:`, response.data);
                
                console.log(`\n🎉 ¡URL CORRECTA ENCONTRADA!`);
                console.log(`URL completa: ${fullUrl}`);
                console.log(`Base: ${baseUrl}`);
                console.log(`Endpoint: ${endpoint}`);
                return;
                
            } catch (error) {
                if (error.response) {
                    const status = error.response.status;
                    if (status === 404) {
                        console.log(`  ❌ 404 - No existe`);
                    } else if (status === 401) {
                        console.log(`  ❌ 401 - No autorizado`);
                    } else if (status === 400) {
                        console.log(`  ⚠️  400 - Existe pero payload incorrecto`);
                        console.log(`  Detalle:`, error.response.data);
                        // 400 es mejor que 401/404, significa que el endpoint existe
                    } else {
                        console.log(`  ❓ ${status} - ${error.response.statusText}`);
                        if (error.response.data) {
                            console.log(`  Detalle:`, error.response.data);
                        }
                    }
                } else if (error.code === 'ENOTFOUND') {
                    console.log(`  ❌ DNS - URL no existe`);
                } else {
                    console.log(`  ❌ ${error.message}`);
                }
            }
        }
    }
    
    console.log(`\n❌ No se encontró ninguna URL funcional`);
}

// También probemos solo un GET a las URLs base para ver si responden
async function testBaseUrls() {
    console.log(`\n\n🌍 Probando conectividad básica a URLs base...\n`);
    
    for (const baseUrl of baseUrls) {
        try {
            const response = await axios.get(baseUrl, {
                headers: {
                    'Authorization': authHeader,
                    'Accept': 'application/json'
                },
                timeout: 5000
            });
            
            console.log(`✅ ${baseUrl} - Status: ${response.status}`);
            
        } catch (error) {
            if (error.response) {
                console.log(`⚠️  ${baseUrl} - Status: ${error.response.status} (servidor responde)`);
            } else if (error.code === 'ENOTFOUND') {
                console.log(`❌ ${baseUrl} - No existe`);
            } else {
                console.log(`❓ ${baseUrl} - ${error.message}`);
            }
        }
    }
}

async function main() {
    await testUrls();
    await testBaseUrls();
}

main();
