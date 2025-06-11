const express = require('express');
const router = express.Router();
const tamanosController = require('../contollers/tamanosController');



router.get('/tamanos', tamanosController.getAllSizes);
router.get('/tamanosandprices', tamanosController.GetSizesandPrices);

module.exports = router;