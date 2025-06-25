const express = require('express');
const router = express.Router();
const { toggleProductStatus } = require('../contollers/activeController');

// PUT /api/products/:id/toggle
router.put('/:id/activar', toggleProductStatus);

module.exports = router;
