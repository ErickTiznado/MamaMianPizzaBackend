const pool = require('./config/db');
const bcrypt = require('bcrypt');

// Script para intentar encontrar la contraseña original mediante fuerza bruta
async function bruteForcePassword() {
    console.log('🔓 BÚSQUEDA DE CONTRASEÑA ORIGINAL - FUERZA BRUTA\n');
    
    // Datos del usuario - CAMBIA ESTOS VALORES
    const testUserId = 3; // Cambia por tu ID de usuario
    const storedHash = '$2b$10$UkKD/yDKIIcaqN3Hl.K1KuBWENdiB.f4u9eDK7dnV9uxcwCWVxS/2'; // Hash que obtuviste
    
    console.log(`🎯 Buscando contraseña para usuario ID: ${testUserId}`);
    console.log(`🔐 Hash objetivo: ${storedHash}\n`);
    
    // Lista de contraseñas comunes para probar
    const commonPasswords = [
        // Variaciones de lo que intentaste
        'Losiento321',
        'losiento321',
        'LOSIENTO321',
        'LoSiento321',
        'Lo siento321',
        'losiento 321',
        'Losiento 321',
        
        // Contraseñas típicas
        'password',
        'password123',
        'Password123',
        'PASSWORD123',
        '123456',
        '123456789',
        'qwerty',
        'admin',
        'admin123',
        'Administrator',
        
        // Variaciones con el nombre
        'nathaly',
        'Nathaly',
        'NATHALY',
        'nathaly123',
        'Nathaly123',
        'nathaly321',
        'Nathaly321',
        'milenas',
        'Milenas',
        'milenas123',
        'Milenas123',
        
        // Contraseñas en español
        'contraseña',
        'Contraseña',
        'contrasena',
        'Contrasena',
        'clave',
        'Clave',
        'clave123',
        'Clave123',
        
        // Fechas comunes
        '2024',
        '2023',
        '2025',
        '01012024',
        '12345678',
        
        // Palabras comunes con números
        'casa123',
        'Casa123',
        'amor123',
        'Amor123',
        'familia123',
        'Familia123',
        
        // Variaciones de "Lo siento"
        'losiento',
        'Losiento',
        'LOSIENTO',
        'lo siento',
        'Lo siento',
        'LO SIENTO',
        'losiento123',
        'Losiento123',
        'LOSIENTO123',
        
        // Si fue generada automáticamente
        'temp123',
        'Temp123',
        'temporal',
        'Temporal',
        'temporal123',
        'Temporal123',
        
        // Otras variaciones numéricas
        'Losiento123',
        'Losiento456',
        'Losiento789',
        'losiento123',
        'losiento456',
        'losiento789',
        
        // Con caracteres especiales
        'Losiento321!',
        'Losiento321@',
        'Losiento321#',
        'Losiento321$',
        'Losiento321%',
        'losiento321!',
        'losiento321@',
        'losiento321#',
        
        // Contraseñas de prueba comunes
        'test',
        'Test',
        'TEST',
        'test123',
        'Test123',
        'TEST123',
        'testing',
        'Testing',
        'TESTING',
        'testing123',
        'Testing123',
        'TESTING123'
    ];
    
    console.log(`🔍 Probando ${commonPasswords.length} contraseñas comunes...\n`);
    
    let found = false;
    let attemptCount = 0;
    
    for (const password of commonPasswords) {
        attemptCount++;
        
        try {
            const isMatch = await bcrypt.compare(password, storedHash);
            
            if (isMatch) {
                console.log(`🎉 ¡CONTRASEÑA ENCONTRADA!`);
                console.log(`   🔑 Contraseña original: "${password}"`);
                console.log(`   📊 Intento número: ${attemptCount}`);
                console.log(`   📏 Longitud: ${password.length} caracteres`);
                found = true;
                break;
            } else {
                // Mostrar progreso cada 10 intentos
                if (attemptCount % 10 === 0) {
                    console.log(`   🔄 Probando... ${attemptCount}/${commonPasswords.length} (actual: "${password}")`);
                }
            }
            
        } catch (error) {
            console.error(`   ❌ Error probando "${password}":`, error.message);
        }
    }
    
    if (!found) {
        console.log(`\n❌ No se encontró la contraseña entre las ${commonPasswords.length} opciones probadas.`);
        console.log('\n💡 Sugerencias:');
        console.log('   1. La contraseña podría ser más compleja');
        console.log('   2. Podría contener caracteres especiales únicos');
        console.log('   3. Podría ser una frase completa');
        console.log('   4. Pregunta directamente al usuario cuál era su contraseña');
        console.log('   5. Usa el endpoint de recuperación de contraseña');
        
        console.log('\n🔄 OPCIÓN: Actualizar con nueva contraseña conocida');
        const newPassword = 'nuevaPassword123!';
        const saltRounds = 12;
        
        try {
            const newHash = await bcrypt.hash(newPassword, saltRounds);
            console.log(`\n📝 COMANDO SQL para establecer nueva contraseña:`);
            console.log(`UPDATE usuarios SET contrasena = '${newHash}' WHERE id_usuario = ${testUserId};`);
            console.log(`🔑 Nueva contraseña sería: "${newPassword}"`);
        } catch (error) {
            console.error('❌ Error generando nuevo hash:', error);
        }
    }
    
    console.log('\n🏁 Búsqueda completada.');
    process.exit(0);
}

// También agregar función para buscar por patrones específicos
async function searchByPattern() {
    const storedHash = '$2b$10$UkKD/yDKIIcaqN3Hl.K1KuBWENdiB.f4u9eDK7dnV9uxcwCWVxS/2';
    
    console.log('\n🎯 BÚSQUEDA POR PATRONES ESPECÍFICOS...\n');
    
    // Patrones basados en información conocida
    const patterns = [
        // Variaciones de "Losiento" con diferentes números
        ...Array.from({length: 1000}, (_, i) => `Losiento${i}`),
        ...Array.from({length: 1000}, (_, i) => `losiento${i}`),
        
        // Variaciones con el nombre "nathaly"
        ...Array.from({length: 100}, (_, i) => `nathaly${i}`),
        ...Array.from({length: 100}, (_, i) => `Nathaly${i}`),
        
        // Fechas posibles
        ...['2020', '2021', '2022', '2023', '2024', '2025'].map(year => `Losiento${year}`),
        ...['2020', '2021', '2022', '2023', '2024', '2025'].map(year => `losiento${year}`),
    ];
    
    console.log(`🔍 Probando ${patterns.length} patrones...\n`);
    
    let found = false;
    let count = 0;
    
    for (const password of patterns) {
        count++;
        
        try {
            const isMatch = await bcrypt.compare(password, storedHash);
            
            if (isMatch) {
                console.log(`🎉 ¡CONTRASEÑA ENCONTRADA POR PATRÓN!`);
                console.log(`   🔑 Contraseña: "${password}"`);
                found = true;
                break;
            }
            
            if (count % 100 === 0) {
                console.log(`   🔄 Patrones probados: ${count}/${patterns.length}`);
            }
            
        } catch (error) {
            // Silenciar errores en búsqueda masiva
        }
    }
    
    if (!found) {
        console.log('❌ No se encontró por patrones.');
    }
}

// Ejecutar búsqueda
console.log('🚀 Iniciando búsqueda de contraseña...\n');
bruteForcePassword().then(() => {
    console.log('✅ Búsqueda principal completada.');
}).catch(error => {
    console.error('❌ Error en búsqueda:', error);
});
