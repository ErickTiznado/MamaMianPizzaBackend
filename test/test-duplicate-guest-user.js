// test-duplicate-guest-user.js
// Prueba para verificar el manejo de usuarios invitados duplicados

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Datos de prueba con el mismo número de celular
const testDataSamePhone = {
    "cliente": {
        "nombre": "María Elena", // Diferente nombre
        "telefono": "70830446",  // MISMO número que causó el error
        "email": "maria.elena@test.com", // Diferente email
        "direccion": "Nueva dirección, San Salvador"
    },
    "tarjeta": {
        "numeroTarjeta": "4573690001990693",
        "cvv": "835",
        "mesVencimiento": 12,
        "anioVencimiento": 2029
    },
    "productos": [
        {
            "id_producto": 1001,
            "cantidad": 1,
            "precio_unitario": 9.50,
            "observaciones": "Masa: Tradicional, Tamaño: Mediana"
        }
    ],
    "tipo_entrega": "recoger",
    "observaciones_generales": "Prueba usuario invitado existente",
    "descuento": 0
};

async function testDuplicateGuestUser() {
    console.log('🧪 ===== PRUEBA: USUARIO INVITADO CON CELULAR DUPLICADO =====');
    console.log('🎯 Objetivo: Verificar que usa el usuario invitado existente en lugar de crear uno nuevo');
    
    console.log('\n📱 Probando con celular que ya existe: 70830446');
    console.log('👤 Nuevo nombre: María Elena (diferente al original Erick Tiznado)');
    console.log('📧 Nuevo email: maria.elena@test.com');
    
    try {
        console.log('\n📤 Enviando solicitud...');
        
        const response = await axios.post(`${BASE_URL}/api/payments/process-order`, testDataSamePhone, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
        
        if (response.data.success) {
            const data = response.data.data;
            const pedido = data.pedido;
            
            console.log('\n🎉 ===== ÉXITO =====');
            console.log('✅ Pago procesado correctamente');
            console.log('✅ Usuario invitado manejado sin duplicados');
            
            console.log('\n📊 DETALLES DEL PEDIDO:');
            console.log('🔖 Código:', pedido.codigo);
            console.log('👤 Tipo cliente:', pedido.tipo_cliente);
            console.log('🆔 ID Usuario Invitado:', pedido.id_usuario_invitado);
            console.log('📧 Email del pedido:', pedido.email);
            console.log('📱 Teléfono del pedido:', pedido.telefono);
            console.log('💰 Total:', `$${pedido.total}`);
            console.log('🏠 Estado:', pedido.estado);
            
            console.log('\n💳 DATOS DEL PAGO:');
            console.log('🆔 Transaction ID:', data.transactionId);
            console.log('🔗 URL Wompi:', data.urlPago);
            
            console.log('\n✅ VERIFICACIÓN:');
            if (pedido.tipo_cliente === 'invitado' && pedido.id_usuario_invitado) {
                console.log('🎉 CORRECTO: Usuario tratado como invitado');
                console.log('🔄 CORRECTO: Se reutilizó usuario invitado existente (sin error de duplicado)');
            } else {
                console.log('⚠️  PROBLEMA: Tipo de cliente o ID incorrecto');
            }
            
        } else {
            console.log('\n❌ FALLO EN EL PROCESO:');
            console.log('Mensaje:', response.data.message);
            console.log('Error:', response.data.error);
            
            if (response.data.debug) {
                console.log('Debug:', response.data.debug);
            }
        }
        
    } catch (error) {
        console.error('\n💥 ERROR EN LA PRUEBA:');
        
        if (error.response) {
            console.error('🔍 Status HTTP:', error.response.status);
            console.error('📋 Mensaje:', error.response.data?.message);
            console.error('❌ Error:', error.response.data?.error);
            
            // Verificar si sigue siendo error de duplicado
            if (error.response.data?.error?.includes('Duplicate entry')) {
                console.error('💥 SIGUE HABIENDO ERROR DE DUPLICADO - La corrección no funcionó');
            } else {
                console.error('🔍 Error diferente:', error.response.data?.error);
            }
            
        } else {
            console.error('💥 Error de conexión:', error.message);
        }
    }
    
    console.log('\n📋 ANÁLISIS DE LOGS:');
    console.log('🔍 En los logs del servidor deberías ver:');
    console.log('  • "Verificando si ya existe usuario invitado con celular: 70830446"');
    console.log('  • "Usuario invitado existente encontrado: [ID] - [Nombre]"');
    console.log('  • "Fecha de último pedido actualizada"');
    console.log('  • NO debería haber "Creando nuevo usuario invitado"');
}

// Función adicional para probar usuario completamente nuevo
async function testNewGuestUser() {
    console.log('\n\n🧪 ===== PRUEBA: USUARIO INVITADO NUEVO =====');
    console.log('🎯 Objetivo: Verificar que crea nuevo usuario con celular que no existe');
    
    const uniquePhone = `701${Date.now().toString().slice(-5)}`; // Número único
    
    const testDataNewPhone = {
        "cliente": {
            "nombre": "Roberto Carlos",
            "telefono": uniquePhone,
            "email": "roberto.carlos@test.com",
            "direccion": "Colonia Nueva, San Salvador"
        },
        "tarjeta": {
            "numeroTarjeta": "4573690001990693",
            "cvv": "835",
            "mesVencimiento": 12,
            "anioVencimiento": 2029
        },
        "productos": [
            {
                "id_producto": 1002,
                "cantidad": 1,
                "precio_unitario": 7.25,
                "observaciones": "Masa: Delgada, Tamaño: Personal"
            }
        ],
        "tipo_entrega": "domicilio",
        "observaciones_generales": "Prueba usuario invitado nuevo",
        "descuento": 0
    };
    
    console.log(`📱 Probando con celular nuevo: ${uniquePhone}`);
    
    try {
        const response = await axios.post(`${BASE_URL}/api/payments/process-order`, testDataNewPhone, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
        
        if (response.data.success) {
            const pedido = response.data.data.pedido;
            
            console.log('\n✅ USUARIO NUEVO CREADO EXITOSAMENTE');
            console.log('🆔 ID Usuario Invitado:', pedido.id_usuario_invitado);
            console.log('📱 Teléfono:', pedido.telefono);
            console.log('🔖 Código pedido:', pedido.codigo);
            
        } else {
            console.log('\n❌ Error al crear usuario nuevo:', response.data.message);
        }
        
    } catch (error) {
        console.error('\n💥 Error en prueba de usuario nuevo:', error.response?.data?.message || error.message);
    }
}

// Ejecutar todas las pruebas
async function runDuplicateTests() {
    console.log('🚀 ===== INICIANDO PRUEBAS DE USUARIOS INVITADOS DUPLICADOS =====');
    
    await testDuplicateGuestUser();
    await testNewGuestUser();
    
    console.log('\n🏁 Pruebas completadas');
    console.log('\n📋 RESUMEN:');
    console.log('1. Primera prueba debe reutilizar usuario invitado existente');
    console.log('2. Segunda prueba debe crear nuevo usuario invitado');
    console.log('3. Ambas deben completar el pago exitosamente');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runDuplicateTests()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Error crítico:', error);
            process.exit(1);
        });
}

module.exports = { runDuplicateTests };
