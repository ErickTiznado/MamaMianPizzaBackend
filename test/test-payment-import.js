// Test para verificar que las importaciones de paymentController funcionan correctamente
console.log('Iniciando prueba de importación de paymentController...');

try {
    // Probar la importación del controlador de pagos
    const paymentController = require('../contollers/paymentController');
    console.log('✓ paymentController importado correctamente');
    
    // Verificar que todas las funciones necesarias existen
    const requiredFunctions = [
        'createPaymentTransaction',
        'processPaymentAndOrder', 
        'createTestTransaction',
        'handlePaymentConfirmation',
        'getAllTransactions',
        'getTransaction',
        'updateTransactionStatus'
    ];
    
    console.log('\nVerificando funciones exportadas:');
    requiredFunctions.forEach(func => {
        if (paymentController[func]) {
            console.log(`✓ ${func} encontrada (tipo: ${typeof paymentController[func]})`);
        } else {
            console.log(`✗ ${func} NO encontrada`);
        }
    });
    
    console.log('\nTodas las funciones disponibles en paymentController:');
    console.log(Object.keys(paymentController));
    
} catch (error) {
    console.error('✗ Error al importar paymentController:', error.message);
    console.error('Stack trace:', error.stack);
}

console.log('\nPrueba de importación completada.');
