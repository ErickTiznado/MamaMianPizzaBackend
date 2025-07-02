const express = require('express');
const router = express.Router();
const inventoriController = require('../contollers/inventoriController');

router.post('/addInventori', inventoriController.createInventarioItem);
router.get('/getInventori', inventoriController.getAllInventarioItems);
router.get('/getInventoriStats', inventoriController.getInventarioStats);
router.put('/updateInventori/:id_ingrediente', inventoriController.updateInventarioItem);
router.delete('/deleteInventori/:id_ingrediente', inventoriController.itemDelete);


module.exports = router;