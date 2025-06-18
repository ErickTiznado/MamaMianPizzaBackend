const bcrypt = require('bcrypt');

// Test específico para comparar el hash enviado con la contraseña
async function testSpecificHash() {
    console.log('🔍 TEST ESPECÍFICO DE HASH\n');
    
    // El hash que me enviaste en la respuesta de error
    const hashFromError = '$2b$05$jC4KdqS8vHrlw...'; // Hash truncado del error
    
    // Hash completo que vimos en la investigación anterior
    const hashFromDB = '$2b$12$0t6cjTMqUG7lCcY.1OLuzuHFytil8fliMFxl2loe0OrmALpOCmi72';
    
    // La contraseña que quieres probar
    const testPassword = 'Losiento321!';
    
    console.log(`🔑 Contraseña a probar: "${testPassword}"`);
    console.log(`📏 Longitud: ${testPassword.length} caracteres`);
    console.log('');
    
    console.log('📊 Hashes a comparar:');
    console.log(`   🔐 Hash del error: ${hashFromError}`);
    console.log(`   🔐 Hash de la BD:  ${hashFromDB}`);
    console.log('');
    
    // Analizar estructura de los hashes
    console.log('🔍 Análisis de estructura:');
    
    console.log(`\n📋 Hash del error:`);
    if (hashFromError.startsWith('$2b$')) {
        const parts = hashFromError.split('$');
        console.log(`   🔧 Algoritmo: ${parts[1]}`);
        console.log(`   📊 Salt rounds: ${parts[2]}`);
        console.log(`   ⚠️  Hash truncado: ${hashFromError.includes('...')}`);
    }
    
    console.log(`\n📋 Hash de la BD:`);
    if (hashFromDB.startsWith('$2b$')) {
        const parts = hashFromDB.split('$');
        console.log(`   🔧 Algoritmo: ${parts[1]}`);
        console.log(`   📊 Salt rounds: ${parts[2]}`);
        console.log(`   ✅ Hash completo: ${hashFromDB.length === 60}`);
    }
    
    // Comparaciones
    console.log('\n🧪 COMPARACIONES:');
    
    try {
        // 1. Comparar con el hash de la BD
        console.log('\n1️⃣ Comparando con hash de la BD...');
        const matchDB = await bcrypt.compare(testPassword, hashFromDB);
        console.log(`   🔄 bcrypt.compare("${testPassword}", hashFromDB) = ${matchDB ? '✅ TRUE' : '❌ FALSE'}`);
        
        if (matchDB) {
            console.log('   🎉 ¡MATCH! Esta es la contraseña correcta para este hash');
        } else {
            console.log('   ❌ No match con el hash de la BD');
        }
        
    } catch (error) {
        console.error('   ❌ Error comparando con hash de BD:', error.message);
    }
    
    // 2. Probar variaciones de la contraseña
    console.log('\n2️⃣ Probando variaciones de la contraseña...');
    
    const variations = [
        'Losiento321!',
        'losiento321!',
        'LOSIENTO321!',
        'Losiento321',
        'losiento321',
        'LOSIENTO321',
        'Losiento321!!',
        'Losiento321@',
        'Losiento321#',
        ' Losiento321!',
        'Losiento321! ',
        'Lo siento321!',
        'LoSiento321!',
        'Losiento 321!',
        'Losiento_321!',
        'Losiento-321!'
    ];
    
    let foundMatch = false;
    
    for (const variation of variations) {
        try {
            const match = await bcrypt.compare(variation, hashFromDB);
            console.log(`   🧪 "${variation}" = ${match ? '✅ MATCH!' : '❌ No'}`);
            
            if (match && !foundMatch) {
                foundMatch = true;
                console.log(`   🎯 PRIMERA COINCIDENCIA ENCONTRADA: "${variation}"`);
            }
            
        } catch (error) {
            console.log(`   🧪 "${variation}" = ❌ Error: ${error.message}`);
        }
    }
    
    // 3. Crear hash con la contraseña para verificar
    console.log('\n3️⃣ Creando nuevo hash con la contraseña para verificar...');
    
    try {
        // Con salt rounds 10 (como el hash de la BD)
        const newHash10 = await bcrypt.hash(testPassword, 10);
        console.log(`   🔐 Nuevo hash (rounds=10): ${newHash10}`);
        
        const verifyNew10 = await bcrypt.compare(testPassword, newHash10);
        console.log(`   ✅ Verificación rounds=10: ${verifyNew10}`);
        
        // Con salt rounds 5 (como el hash del error)
        const newHash5 = await bcrypt.hash(testPassword, 5);
        console.log(`   🔐 Nuevo hash (rounds=5):  ${newHash5}`);
        
        const verifyNew5 = await bcrypt.compare(testPassword, newHash5);
        console.log(`   ✅ Verificación rounds=5:  ${verifyNew5}`);
        
    } catch (error) {
        console.error('   ❌ Error creando nuevos hashes:', error.message);
    }
    
    // 4. Conclusiones
    console.log('\n📋 CONCLUSIONES:');
    
    if (foundMatch) {
        console.log('✅ Se encontró al menos una variación que funciona');
        console.log('💡 El problema puede estar en:');
        console.log('   • Espacios extra en la contraseña');
        console.log('   • Diferencias en mayúsculas/minúsculas');
        console.log('   • Caracteres especiales adicionales');
    } else {
        console.log('❌ Ninguna variación funcionó');
        console.log('💡 Posibles causas:');
        console.log('   • La contraseña real es diferente');
        console.log('   • Hay múltiples usuarios con el mismo correo');
        console.log('   • El hash fue cambiado recientemente');
        console.log('   • Estás usando el ID de usuario incorrecto');
    }
    
    console.log('\n🔧 RECOMENDACIONES:');
    console.log('1. Ejecuta el script de investigación para encontrar el usuario correcto');
    console.log('2. Verifica que estés usando el ID de usuario correcto');
    console.log('3. Usa el sistema de recuperación de contraseña');
    console.log('4. Establece una nueva contraseña conocida');
    
    console.log('\n🏁 Test completado.');
}

// Ejecutar test
console.log('🚀 Iniciando test específico de hash...\n');
testSpecificHash().catch(error => {
    console.error('❌ Error en test:', error);
});
