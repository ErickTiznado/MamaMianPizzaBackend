// Test de diagnóstico detallado para SSE
const axios = require('axios');

const SERVER_URL = 'http://localhost:3000';

async function testSSEDiagnostic() {
    console.log('🔬 DIAGNÓSTICO DETALLADO DE SSE');
    console.log('════════════════════════════════════════════');
    
    try {
        // Test 1: Verificar que el endpoint SSE existe
        console.log('\n1️⃣ Verificando endpoint SSE...');
        
        // Hacer una petición HTTP normal al endpoint SSE para ver qué pasa
        try {
            const sseResponse = await axios.get(`${SERVER_URL}/api/notifications/stream`, {
                timeout: 5000,
                headers: {
                    'Accept': 'text/event-stream',
                    'Cache-Control': 'no-cache'
                }
            });
            console.log('⚠️ El endpoint SSE respondió como HTTP normal, esto puede ser un problema');
            console.log('📋 Response headers:', sseResponse.headers);
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.log('✅ El endpoint SSE está funcionando (timeout esperado para SSE)');
            } else {
                console.log('❌ Error accediendo al endpoint SSE:', error.message);
            }
        }
        
        // Test 2: Verificar que se puedan crear notificaciones
        console.log('\n2️⃣ Verificando creación de notificaciones...');
        const createResponse = await axios.post(`${SERVER_URL}/api/notifications`, {
            titulo: '🔬 Test Diagnóstico',
            mensaje: 'Notificación para diagnóstico SSE',
            tipo: 'diagnostic'
        });
        console.log('✅ Notificación creada:', createResponse.data.id_notificacion);
        
        // Test 3: Verificar notificaciones no leídas
        console.log('\n3️⃣ Verificando notificaciones no leídas...');
        const unreadResponse = await axios.get(`${SERVER_URL}/api/notifications/unread`);
        console.log(`✅ Notificaciones no leídas: ${unreadResponse.data.length}`);
        
        // Test 4: Probar conexión SSE simple
        console.log('\n4️⃣ Probando conexión SSE básica...');
        await testBasicSSEConnection();
        
    } catch (error) {
        console.error('❌ Error en diagnóstico:', error.message);
    }
}

function testBasicSSEConnection() {
    return new Promise((resolve, reject) => {
        console.log('🔗 Iniciando conexión SSE de prueba...');
        
        // Simular EventSource usando Node.js
        const http = require('http');
        const url = require('url');
        
        const sseUrl = url.parse(`${SERVER_URL}/api/notifications/stream`);
        
        const options = {
            hostname: sseUrl.hostname,
            port: sseUrl.port,
            path: sseUrl.path,
            method: 'GET',
            headers: {
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        };
        
        const req = http.request(options, (res) => {
            console.log(`📡 SSE Response Status: ${res.statusCode}`);
            console.log(`📋 SSE Response Headers:`, res.headers);
            
            if (res.statusCode === 200) {
                console.log('✅ Conexión SSE establecida correctamente');
                
                let dataReceived = false;
                const timeout = setTimeout(() => {
                    if (!dataReceived) {
                        console.log('⚠️ No se recibieron datos en 10 segundos');
                        req.destroy();
                        resolve();
                    }
                }, 10000);
                
                res.on('data', (chunk) => {
                    dataReceived = true;
                    clearTimeout(timeout);
                    console.log('📨 Datos SSE recibidos:', chunk.toString().substring(0, 200));
                    
                    // Cerrar conexión después de recibir datos
                    req.destroy();
                    resolve();
                });
                
                res.on('end', () => {
                    console.log('🔚 Conexión SSE terminada');
                    resolve();
                });
                
            } else {
                console.log(`❌ Error en conexión SSE: ${res.statusCode}`);
                reject(new Error(`SSE connection failed: ${res.statusCode}`));
            }
        });
        
        req.on('error', (error) => {
            console.error('❌ Error en request SSE:', error.message);
            reject(error);
        });
        
        req.setTimeout(15000, () => {
            console.log('⏱️ Timeout en conexión SSE');
            req.destroy();
            resolve();
        });
        
        req.end();
    });
}

// Ejecutar diagnóstico
testSSEDiagnostic().then(() => {
    console.log('\n🏁 Diagnóstico completado');
    process.exit(0);
}).catch((error) => {
    console.error('\n💥 Error fatal en diagnóstico:', error);
    process.exit(1);
});
