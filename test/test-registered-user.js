// test-registered-user.js
// Prueba específica para usuarios registrados

const axios = require('axios');
const mysql = require('mysql2');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

// Configuración de base de datos para verificar usuarios
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306
});

/**
 * Buscar un usuario registrado existente para probar
 */
async function findRegisteredUser() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id_usuario, nombre, apellido, correo, telefono FROM usuarios WHERE activo = 1 LIMIT 1';
        
        pool.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results[0] || null);
        });
    });
}

/**
 * Crear un usuario de prueba si no existe ninguno
 */
async function createTestUser() {
    return new Promise((resolve, reject) => {
        const testUser = {
            nombre: 'Carlos',
            apellido: 'González',
            correo: 'carlos.test@mamamianpizza.com',
            telefono: '70111222',
            contrasena_hash: '$2b$10$example.hash', // Hash de ejemplo
            activo: 1
        };
        
        const query = `
            INSERT INTO usuarios (nombre, apellido, correo, telefono, contrasena_hash, activo, fecha_registro)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        pool.query(query, [
            testUser.nombre,
            testUser.apellido,
            testUser.correo,
            testUser.telefono,
            testUser.contrasena_hash,
            testUser.activo
        ], (err, result) => {
            if (err) return reject(err);
            
            resolve({
                id_usuario: result.insertId,
                ...testUser
            });
        });
    });
}

/**
 * Prueba 1: Usuario registrado con ID explícito
 */
async function testWithUserId(user) {
    console.log('\n🧪 ===== PRUEBA 1: USUARIO REGISTRADO CON ID =====');
    
    const testData = {
        id_usuario: user.id_usuario,  // ID explícito
        cliente: {
            nombre: `${user.nombre} ${user.apellido}`,
            telefono: user.telefono,
            email: user.correo,
            direccion: "Colonia Escalón, San Salvador"
        },
        tarjeta: {
            numeroTarjeta: "4573690001990693",
            cvv: "835",
            mesVencimiento: 12,
            anioVencimiento: 2029
        },
        productos: [
            {
                id_producto: 201,
                cantidad: 1,
                precio_unitario: 12.50,
                observaciones: "Masa: Integral, Tamaño: Grande"
            }
        ],
        tipo_entrega: "domicilio",
        observaciones_generales: "Test usuario registrado con ID",
        descuento: 0
    };
    
    console.log(`👤 Probando con usuario: ${user.nombre} ${user.apellido} (ID: ${user.id_usuario})`);
    console.log(`📧 Email: ${user.correo}`);
    
    return await sendPaymentRequest(testData, 'CON ID EXPLÍCITO');
}

/**
 * Prueba 2: Usuario registrado solo con email (búsqueda automática)
 */
async function testWithEmailOnly(user) {
    console.log('\n🧪 ===== PRUEBA 2: USUARIO REGISTRADO SOLO EMAIL =====');
    
    const testData = {
        // NO incluir id_usuario para forzar búsqueda por email
        cliente: {
            nombre: `${user.nombre} ${user.apellido}`,
            telefono: user.telefono,
            email: user.correo,  // Solo email para búsqueda automática
            direccion: "Colonia Escalón, San Salvador"
        },
        tarjeta: {
            numeroTarjeta: "4573690001990693",
            cvv: "835",
            mesVencimiento: 12,
            anioVencimiento: 2029
        },
        productos: [
            {
                id_producto: 202,
                cantidad: 1,
                precio_unitario: 8.75,
                observaciones: "Masa: Tradicional, Tamaño: Personal"
            }
        ],
        tipo_entrega: "recoger",
        observaciones_generales: "Test búsqueda automática por email",
        descuento: 0
    };
    
    console.log(`👤 Probando búsqueda automática para: ${user.correo}`);
    console.log(`🔍 Sistema debe encontrar usuario ID: ${user.id_usuario}`);
    
    return await sendPaymentRequest(testData, 'BÚSQUEDA POR EMAIL');
}

/**
 * Prueba 3: Usuario no registrado (invitado)
 */
async function testGuestUser() {
    console.log('\n🧪 ===== PRUEBA 3: USUARIO INVITADO =====');
    
    const testData = {
        cliente: {
            nombre: "Ana López",
            telefono: "70999888",
            email: "ana.invitada@noregistrado.com",  // Email que NO existe
            direccion: "Colonia Médica, San Salvador"
        },
        tarjeta: {
            numeroTarjeta: "4573690001990693",
            cvv: "835",
            mesVencimiento: 12,
            anioVencimiento: 2029
        },
        productos: [
            {
                id_producto: 203,
                cantidad: 2,
                precio_unitario: 6.25,
                observaciones: "Masa: Delgada, Tamaño: Personal"
            }
        ],
        tipo_entrega: "domicilio",
        observaciones_generales: "Test usuario invitado",
        descuento: 1.50
    };
    
    console.log(`👤 Probando con usuario invitado: ana.invitada@noregistrado.com`);
    console.log(`🔍 Sistema debe tratar como invitado`);
    
    return await sendPaymentRequest(testData, 'USUARIO INVITADO');
}

/**
 * Enviar solicitud de pago y analizar respuesta
 */
async function sendPaymentRequest(testData, testType) {
    try {
        const response = await axios.post(`${BASE_URL}/api/payments/process-order`, testData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
        
        if (response.data.success) {
            const pedido = response.data.data.pedido;
            
            console.log(`✅ ${testType} - ÉXITO`);
            console.log(`📋 Código pedido: ${pedido.codigo}`);
            console.log(`👤 Tipo cliente: ${pedido.tipo_cliente}`);
            console.log(`🆔 ID Usuario: ${pedido.id_usuario || 'N/A'}`);
            console.log(`👥 ID Usuario Invitado: ${pedido.id_usuario_invitado || 'N/A'}`);
            console.log(`📧 Email: ${pedido.email}`);
            console.log(`💰 Total: $${pedido.total}`);
            
            // Verificar resultado esperado
            if (testType.includes('REGISTRADO') || testType.includes('EMAIL')) {
                if (pedido.tipo_cliente === 'registrado' && pedido.id_usuario) {
                    console.log(`🎉 CORRECTO: Usuario detectado como registrado`);
                } else {
                    console.log(`⚠️  PROBLEMA: Usuario debería ser registrado pero es ${pedido.tipo_cliente}`);
                }
            } else if (testType.includes('INVITADO')) {
                if (pedido.tipo_cliente === 'invitado' && pedido.id_usuario_invitado) {
                    console.log(`🎉 CORRECTO: Usuario detectado como invitado`);
                } else {
                    console.log(`⚠️  PROBLEMA: Usuario debería ser invitado pero es ${pedido.tipo_cliente}`);
                }
            }
            
            return true;
        } else {
            console.log(`❌ ${testType} - ERROR: ${response.data.message}`);
            return false;
        }
        
    } catch (error) {
        console.error(`💥 ${testType} - ERROR:`, error.response?.data?.message || error.message);
        return false;
    }
}

/**
 * Ejecutar todas las pruebas
 */
async function runUserTypeTests() {
    console.log('🧪 ===== PRUEBAS DE DETECCIÓN DE TIPO DE USUARIO =====');
    
    try {
        // Buscar usuario existente o crear uno de prueba
        console.log('\n🔍 Buscando usuario registrado para probar...');
        let user = await findRegisteredUser();
        
        if (!user) {
            console.log('❌ No se encontró usuario registrado, creando uno de prueba...');
            user = await createTestUser();
            console.log(`✅ Usuario de prueba creado: ${user.nombre} ${user.apellido} (ID: ${user.id_usuario})`);
        } else {
            console.log(`✅ Usuario encontrado: ${user.nombre} ${user.apellido} (ID: ${user.id_usuario})`);
        }
        
        // Ejecutar pruebas
        const test1 = await testWithUserId(user);
        const test2 = await testWithEmailOnly(user);
        const test3 = await testGuestUser();
        
        // Resumen
        console.log('\n📊 ===== RESUMEN DE PRUEBAS =====');
        console.log(`🧪 Usuario con ID: ${test1 ? '✅ ÉXITO' : '❌ FALLO'}`);
        console.log(`🔍 Búsqueda por email: ${test2 ? '✅ ÉXITO' : '❌ FALLO'}`);
        console.log(`👥 Usuario invitado: ${test3 ? '✅ ÉXITO' : '❌ FALLO'}`);
        
        const allPassed = test1 && test2 && test3;
        console.log(`\n🎯 RESULTADO GENERAL: ${allPassed ? '🎉 TODAS LAS PRUEBAS EXITOSAS' : '⚠️ ALGUNAS PRUEBAS FALLARON'}`);
        
    } catch (error) {
        console.error('💥 Error en las pruebas:', error);
    } finally {
        pool.end();
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runUserTypeTests()
        .then(() => {
            console.log('\n🏁 Pruebas completadas');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Error crítico:', error);
            process.exit(1);
        });
}

module.exports = { runUserTypeTests };
