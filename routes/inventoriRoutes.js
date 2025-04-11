const express = require('express');
const router = express.Router();
const inventoriController = require('../contollers/inventoriController');

router.post('/addInventori', inventoriController.createInventarioItem);
router.get('/getInventori', inventoriController.getAllInventarioItems);



module.exports = router;