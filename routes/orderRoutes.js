const express = require('express');
const router = express.Router();
const orderController = require('../contollers/orderController');

// Route to create a new order
router.post('/neworder', orderController.createOrder);

// Additional routes can be added here as needed:
// router.get('/orders', orderController.getAllOrders);
// router.get('/orders/:id', orderController.getOrderById);
// router.put('/orders/:id', orderController.updateOrder);

module.exports = router;