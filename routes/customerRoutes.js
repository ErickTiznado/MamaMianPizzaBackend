const express = require('express');
const router = express.Router();
const customerController = require('../contollers/customerController');

// ============ CUSTOMER ANALYTICS ENDPOINTS ============

// Basic customer metrics
router.get('/unique-customers', customerController.getUniqueCustomersServed);

// Customer growth and trends
router.get('/growth-trends', customerController.getCustomerGrowthTrends);

// Customer retention analysis
router.get('/retention-metrics', customerController.getCustomerRetentionMetrics);

// Customer lifetime value analysis
router.get('/lifetime-value', customerController.getCustomerLifetimeValue);

// Customer demographics and preferences
router.get('/demographics', customerController.getCustomerDemographicsAndPreferences);

// Customer satisfaction metrics
router.get('/satisfaction-metrics', customerController.getCustomerSatisfactionMetrics);

module.exports = router;
