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

module.exports = router;