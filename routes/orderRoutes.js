const express = require('express');
const router = express.Router();
const orderController = require('../contollers/orderController');

// Route to create a new order
router.post('/neworder', orderController.createOrder);

// Rutas para obtener y gestionar pedidos
router.get('/orders', orderController.getAllOrders);
router.get('/orders/user/:userId', orderController.getOrdersByUserId);
router.get('/orders/status/:status', orderController.getOrdersByStatus);
router.get('/orders/:id', orderController.getOrderById);
router.put('/orders/:id/status', orderController.updateOrderStatus);
router.get('/orders/count', orderController.countOrders);
router.get('/statistics', orderController.getOrderStatistics);
router.get('/statistics/tickets', orderController.getAverageTicket);
router.get('/statistics/averages', orderController.getOrderAverages);
router.get('/statistics/income', orderController.getNetIncomeStatistics);
router.get('/statistics/units', orderController.getUnitsSoldStatistics);
router.get('/statistics/units-per-order', orderController.getUnitsPerOrderStatistics);
router.get('/statistics/top-products', orderController.getTop5ProductsByUnits);
router.get('/statistics/top-products-filtered', orderController.getTop5ProductsByUnitsWithFilter);
router.get('/statistics/top-revenue', orderController.getTop5ProductsByRevenue);
router.get('/statistics/top-revenue-filtered', orderController.getTop5ProductsByRevenueWithFilter);
router.get('/statistics/product-combinations', orderController.getProductCombinations);
router.get('/income', orderController.getNetIncome);
router.get('/units', orderController.getUnitsSold);
router.get('/units-per-order', orderController.getUnitsPerOrderStatistics);
router.get('/satistics/entregas', orderController.metodo_entrega);
// Ruta para reparar pedidos sin detalles
router.post('/orders/:id_pedido/repair', orderController.checkOrderDetails);

module.exports = router;