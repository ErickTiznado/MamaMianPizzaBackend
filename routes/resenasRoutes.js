const express = require('express');
const router = express.Router();
const resenasController = require('../contollers/resenasController');

// Create a new review
router.post('/', resenasController.createResena);

// Get all reviews for a specific product
router.get('/producto/:id_producto', resenasController.getResenasByProduct);

// Get all reviews by a specific user
router.get('/usuario/:id_usuario', resenasController.getResenasByUser);

module.exports = router;
