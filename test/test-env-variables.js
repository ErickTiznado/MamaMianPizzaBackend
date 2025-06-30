require('dotenv').config();

console.log('=== VERIFICANDO VARIABLES DE ENTORNO ===');
console.log(`WOMPI_CLIENT_ID: ${process.env.WOMPI_CLIENT_ID}`);
console.log(`WOMPI_CLIENT_SECRET: ${process.env.WOMPI_CLIENT_SECRET ? '[DEFINIDO]' : '[NO DEFINIDO]'}`);
console.log(`WOMPI_REDIRECT_URL: ${process.env.WOMPI_REDIRECT_URL}`);
console.log(`PORT: ${process.env.PORT}`);
console.log(`BD_HOST: ${process.env.BD_HOST}`);
console.log('=== FIN VERIFICACIÓN ===');

// También probemos hacer una request de prueba para ver la respuesta
const axios = require('axios');

const testPaymentRequest = async () => {
    try {
        console.log('\n=== PROBANDO REQUEST AL ENDPOINT DE PAGO ===');
        
        const response = await axios.post('http://localhost:3000/api/payments/create-payment', {
            productos: [
                {
                    id: 1,
                    nombre: "Pizza Margherita",
                    precio: 7.00,
                    cantidad: 1
                }
            ],
            datosCliente: {
                nombre: "Erick",
                apellido: "Tiznado",
                email: "USIS038521@ugb.edu.sv",
                telefono: "70830446",
                direccion: "CP #3417, Puerto El Triunfo, EL salvador"
            },
            metodoPago: "tarjeta_credito",
            cardData: {
                numero: "4111111111110693",
                cvv: "123",
                mes: "12",
                anio: "2029"
            }
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Status:', response.status);
        console.log('✅ Response:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ Error en request:', error.response?.status);
        console.log('❌ Error data:', error.response?.data);
        console.log('❌ Error message:', error.message);
    }
};

// Ejecutar test solo si el servidor está corriendo
setTimeout(testPaymentRequest, 1000);
