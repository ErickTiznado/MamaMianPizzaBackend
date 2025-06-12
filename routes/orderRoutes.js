const express = require('express');
const router = express.Router();
const orderController = require('../contollers/orderController');

// Route to create a new order
router.post('/neworder', orderController.createOrder);

// Rutas para obtener y gestionar pedidos
router.get('/orders', orderController.getAllOrders);
router.get('/orders/status/:status', orderController.getOrdersByStatus);
router.get('/orders/:id', orderController.getOrderById);
router.put('/orders/:id/status', orderController.updateOrderStatus);
router.get('/orders/count', orderController.countOrders);
router.get('/statistics', orderController.getOrderStatistics);
router.get('/statistics/tickets', orderController.getAverageTicket);
router.get('/statistics/averages', orderController.getOrderAverages);
router.get('/statistics/income', orderController.getNetIncomeStatistics);
router.get('/income', orderController.getNetIncome);
router.get('/satistics/entregas', orderController.metodo_entrega);
// Ruta para reparar pedidos sin detalles
router.post('/orders/:id_pedido/repair', orderController.checkOrderDetails);

module.exports = router;