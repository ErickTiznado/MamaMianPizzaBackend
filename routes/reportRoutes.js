const express = require('express');
const router = express.Router();
const customerController = require('../contollers/customerController');

// ============ CUSTOMER REPORTS ENDPOINTS ============

// New vs recurring customers report by month
router.get('/clientes-nuevos-recurrentes', customerController.getNewVsRecurringCustomersReport);

// Customer frequency analysis report
router.get('/frecuencia-clientes', customerController.getCustomerFrequencyReport);

module.exports = router;
