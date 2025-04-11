const express = require('express');
const router = express.Router();
const inventoriController = require('../contollers/inventoriController');

router.post('/addInventori', inventoriController.createInventarioItem);




module.exports = router;