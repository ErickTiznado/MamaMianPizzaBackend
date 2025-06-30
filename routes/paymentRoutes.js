const express = require('express');
const router = express.Router();
const paymentController = require('../contollers/paymentController');
const { verifyToken } = require('../contollers/authController');
const { verifyAdminToken } = require('../contollers/authController');

/**
 * @route POST /api/payments/create
 * @desc Crear una nueva transacción de pago
 * @access Público (puede requerir token dependiendo de tu implementación)
 */
router.post('/create', paymentController.createPaymentTransaction);

/**
 * @route POST /api/payments/process-order
 * @desc Procesar pago completo con creación automática de pedido (estado: 'en proceso')
 * @access Público 
 * @description Este endpoint procesa el pago Y crea automáticamente el pedido en estado 'en proceso'
 */
router.post('/process-order', paymentController.processPaymentAndOrder);

/**
 * @route POST /api/payments/test
 * @desc Crear una transacción de prueba
 * @access Público (para testing)
 */
router.post('/test', paymentController.createTestTransaction);

/**
 * @route GET /api/payments
 * @desc Obtener todas las transacciones (solo administradores)
 * @access Privado - Solo administradores
 */
router.get('/', verifyAdminToken, paymentController.getAllTransactions);

/**
 * @route GET /api/payments/:id
 * @desc Obtener una transacción específica
 * @access Privado - Usuario propietario o administrador
 */
router.get('/:id', verifyToken, paymentController.getTransaction);

/**
 * @route PUT /api/payments/:id/status
 * @desc Actualizar el estado de una transacción
 * @access Privado - Solo administradores o webhooks
 */
router.put('/:id/status', paymentController.updateTransactionStatus);

/**
 * @route GET /api/payments/confirmation
 * @desc Manejar la confirmación de pago desde Wompi
 * @access Público (redirect desde Wompi)
 */
router.get('/confirmation', paymentController.handlePaymentConfirmation);

module.exports = router;
