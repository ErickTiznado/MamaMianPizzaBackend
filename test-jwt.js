// Test script para verificar la implementación JWT
// Este archivo demuestra cómo usar las nuevas funciones JWT

const jwt = require('jsonwebtoken');

// Simular las mismas funciones del controlador para testing
const JWT_SECRET = 'test-secret-key-minimum-32-characters';
const JWT_ADMIN_EXPIRES_IN = '8h';

// Función para generar JWT token (copia de authController)
const generateJWTToken = (adminId, adminEmail, adminNombre, expiresIn = JWT_ADMIN_EXPIRES_IN) => {
    const payload = {
        id: adminId,
        email: adminEmail,
        nombre: adminNombre,
        type: 'admin',
        iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: expiresIn,
        issuer: 'MamaMianPizza',
        audience: 'admin'
    });
};

// Función para validar JWT token (copia de authController)
const validateJWTToken = (token, expectedAudience = 'admin') => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'MamaMianPizza',
            audience: expectedAudience
        });
        
        return {
            valid: true,
            data: decoded
        };
    } catch (error) {
        let errorType = 'INVALID_TOKEN';
        
        if (error.name === 'TokenExpiredError') {
            errorType = 'TOKEN_EXPIRED';
        } else if (error.name === 'JsonWebTokenError') {
            errorType = 'MALFORMED_TOKEN';
        } else if (error.name === 'NotBeforeError') {
            errorType = 'TOKEN_NOT_ACTIVE';
        }
        
        return {
            valid: false,
            error: errorType,
            message: error.message
        };
    }
};

// ============================
// TESTS
// ============================

console.log('🧪 Iniciando tests de JWT para administradores...\n');

// Test 1: Generar token válido
console.log('📝 Test 1: Generar token JWT válido');
const testToken = generateJWTToken(1, 'admin@test.com', 'Admin Test');
console.log('✅ Token generado:', testToken.substring(0, 50) + '...');

// Test 2: Validar token válido
console.log('\n📝 Test 2: Validar token válido');
const validation = validateJWTToken(testToken);
if (validation.valid) {
    console.log('✅ Token válido');
    console.log('   ID:', validation.data.id);
    console.log('   Email:', validation.data.email);
    console.log('   Nombre:', validation.data.nombre);
    console.log('   Tipo:', validation.data.type);
    console.log('   Emitido:', new Date(validation.data.iat * 1000).toISOString());
} else {
    console.log('❌ Token inválido:', validation.error);
}

// Test 3: Validar token inválido
console.log('\n📝 Test 3: Validar token inválido');
const invalidValidation = validateJWTToken('token-invalido');
if (!invalidValidation.valid) {
    console.log('✅ Token inválido detectado correctamente');
    console.log('   Error:', invalidValidation.error);
} else {
    console.log('❌ Error: token inválido marcado como válido');
}

// Test 4: Decodificar token sin verificar (para debugging)
console.log('\n📝 Test 4: Decodificar token sin verificar');
const decoded = jwt.decode(testToken);
console.log('✅ Token decodificado:');
console.log('   Payload:', JSON.stringify(decoded, null, 2));

// Test 5: Generar token con expiración corta para testing
console.log('\n📝 Test 5: Token con expiración corta (5 segundos)');
const shortToken = generateJWTToken(2, 'admin2@test.com', 'Admin Short', '5s');
console.log('✅ Token de corta duración generado');

// Esperar 6 segundos y verificar expiración
setTimeout(() => {
    console.log('\n📝 Test 6: Verificar expiración de token');
    const expiredValidation = validateJWTToken(shortToken);
    if (!expiredValidation.valid && expiredValidation.error === 'TOKEN_EXPIRED') {
        console.log('✅ Expiración de token detectada correctamente');
    } else {
        console.log('❌ Error: expiración no detectada');
    }
    
    console.log('\n🎉 Tests completados!');
}, 6000);

// Test 7: Generar token para reset de contraseña
console.log('\n📝 Test 7: Token para reset de contraseña');
const generateResetJWTToken = (adminId, purpose = 'password_reset') => {
    const payload = {
        id: adminId,
        purpose: purpose,
        type: 'admin_reset',
        iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '15m',
        issuer: 'MamaMianPizza',
        audience: 'admin_reset'
    });
};

const resetToken = generateResetJWTToken(1);
console.log('✅ Token de reset generado:', resetToken.substring(0, 50) + '...');

const resetValidation = validateJWTToken(resetToken, 'admin_reset');
if (resetValidation.valid) {
    console.log('✅ Token de reset válido');
    console.log('   ID:', resetValidation.data.id);
    console.log('   Propósito:', resetValidation.data.purpose);
    console.log('   Tipo:', resetValidation.data.type);
} else {
    console.log('❌ Token de reset inválido:', resetValidation.error);
}

// Test 8: Mostrar estructura completa del token
console.log('\n📝 Test 8: Estructura completa del token');
const parts = testToken.split('.');
console.log('✅ Partes del JWT:');
console.log('   Header:', JSON.parse(Buffer.from(parts[0], 'base64').toString()));
console.log('   Payload:', JSON.parse(Buffer.from(parts[1], 'base64').toString()));
console.log('   Signature:', parts[2].substring(0, 20) + '...');

console.log('\n💡 Para usar en desarrollo:');
console.log('1. Copia este token para pruebas:');
console.log(`   ${testToken}`);
console.log('\n2. Úsalo en headers de Postman:');
console.log(`   Authorization: Bearer ${testToken}`);
console.log('\n3. Verifica en jwt.io con la clave secreta:', JWT_SECRET);
