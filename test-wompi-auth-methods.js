const axios = require('axios');
require('dotenv').config();

console.log('🧪 Probando diferentes métodos de autenticación con Wompi...\n');

const APP_ID = process.env.WOMPI_APP_ID;
const API_SECRET = process.env.WOMPI_API_SECRET;

console.log('APP_ID:', APP_ID);
console.log('API_SECRET:', API_SECRET?.substring(0, 8) + '...');

// Diferentes métodos de autenticación para probar
const authMethods = [
    {
        name: 'Basic Auth (APP_ID:API_SECRET)',
        header: `Basic ${Buffer.from(`${APP_ID}:${API_SECRET}`).toString('base64')}`
    },
    {
        name: 'Bearer Token (solo API_SECRET)',
        header: `Bearer ${API_SECRET}`
    },
    {
        name: 'Bearer Token (solo APP_ID)',
        header: `Bearer ${APP_ID}`
    }
];

// Diferentes endpoints para probar
const endpoints = [
    {
        name: 'Transacción 3DS',
        url: 'https://api.wompi.sv/TransaccionCompra/3DS',
        method: 'POST',
        data: {
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
        }
    },
    {
        name: 'Endpoint de Estado (GET)',
        url: 'https://api.wompi.sv/TransaccionCompra/Estado/test',
        method: 'GET'
    }
];

async function testAuth() {
    for (const authMethod of authMethods) {
        console.log(`\n🔑 Probando: ${authMethod.name}`);
        console.log(`Header: ${authMethod.header.substring(0, 30)}...`);
        
        for (const endpoint of endpoints) {
            try {
                console.log(`\n📡 Endpoint: ${endpoint.name}`);
                console.log(`URL: ${endpoint.url}`);
                
                const config = {
                    method: endpoint.method,
                    url: endpoint.url,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authMethod.header,
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                };
                
                if (endpoint.data) {
                    config.data = endpoint.data;
                }
                
                const response = await axios(config);
                
                console.log(`✅ ÉXITO! Status: ${response.status}`);
                console.log(`Respuesta:`, response.data);
                
                // Si llegamos aquí, las credenciales funcionan
                console.log(`\n🎉 ¡CREDENCIALES VÁLIDAS ENCONTRADAS!`);
                console.log(`Método: ${authMethod.name}`);
                console.log(`Header: ${authMethod.header}`);
                return;
                
            } catch (error) {
                if (error.response) {
                    console.log(`❌ Error ${error.response.status}: ${error.response.statusText}`);
                    if (error.response.data) {
                        console.log(`Detalle:`, error.response.data);
                    }
                } else {
                    console.log(`❌ Error de red:`, error.message);
                }
            }
        }
    }
    
    console.log(`\n❌ NINGÚN MÉTODO DE AUTENTICACIÓN FUNCIONÓ`);
    console.log(`\n📞 CONTACTA CON WOMPI PARA OBTENER CREDENCIALES VÁLIDAS:`);
    console.log(`- Verifica que las credenciales sean para el entorno correcto`);
    console.log(`- Asegúrate de que las credenciales no hayan expirado`);
    console.log(`- Confirma el formato correcto de autenticación con Wompi`);
}

testAuth();
