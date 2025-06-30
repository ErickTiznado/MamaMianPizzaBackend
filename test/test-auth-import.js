// Test para verificar que las importaciones de authController funcionan correctamente
const express = require('express');
const app = express();

console.log('Iniciando prueba de importación de authController...');

try {
    // Probar la importación del controlador de autenticación
    const authController = require('../contollers/authController');
    console.log('✓ authController importado correctamente');
    
    // Verificar que verifyAdminToken existe
    if (authController.verifyAdminToken) {
        console.log('✓ verifyAdminToken función encontrada');
        console.log('Tipo de verifyAdminToken:', typeof authController.verifyAdminToken);
    } else {
        console.log('✗ verifyAdminToken NO encontrada en exports');
        console.log('Funciones disponibles en authController:', Object.keys(authController));
    }
    
    // Probar la importación con destructuring
    const { verifyAdminToken } = require('../contollers/authController');
    if (verifyAdminToken) {
        console.log('✓ verifyAdminToken importada con destructuring correctamente');
        console.log('Tipo:', typeof verifyAdminToken);
    } else {
        console.log('✗ verifyAdminToken NO se pudo importar con destructuring');
    }
    
} catch (error) {
    console.error('✗ Error al importar authController:', error.message);
    console.error('Stack trace:', error.stack);
}

console.log('\nPrueba de importación completada.');
