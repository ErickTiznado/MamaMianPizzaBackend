// Script para verificar variables de entorno
require('dotenv').config();

console.log('=== VERIFICACIÓN DE VARIABLES DE ENTORNO ===');
console.log('WOMPI_CLIENT_ID:', process.env.WOMPI_CLIENT_ID ? '✅ Definido' : '❌ NO definido');
console.log('WOMPI_CLIENT_SECRET:', process.env.WOMPI_CLIENT_SECRET ? '✅ Definido' : '❌ NO definido');
console.log('WOMPI_API_URL:', process.env.WOMPI_API_URL ? '✅ Definido' : '❌ NO definido');
console.log('WOMPI_REDIRECT_URL:', process.env.WOMPI_REDIRECT_URL ? '✅ Definido' : '❌ NO definido');
console.log('WOMPI_REDIRECT_URL value:', process.env.WOMPI_REDIRECT_URL);

console.log('\n=== TODAS LAS VARIABLES QUE EMPIEZAN CON WOMPI ===');
Object.keys(process.env)
    .filter(key => key.startsWith('WOMPI'))
    .forEach(key => {
        console.log(`${key}: ${process.env[key]}`);
    });
