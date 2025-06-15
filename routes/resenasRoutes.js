const express = require('express');
const router = express.Router();
const resenasController = require('../contollers/resenasController');

// Create a new review
router.post('/', resenasController.createResena);

// Get all reviews with user information
router.get('/', resenasController.getAllResenas);

// Get all reviews for a specific product
router.get('/producto/:id_producto', resenasController.getResenasByProduct);

// Get all reviews by a specific user
router.get('/usuario/:id_usuario', resenasController.getResenasByUser);

// Get reviews by approval status (0 = not approved, 1 = approved)
router.get('/estado/:aprobada', resenasController.getResenasByApprovalStatus);

// Toggle review approval status (activate/deactivate)
router.put('/estado/:id_resena', resenasController.toggleResenaApproval);

// Delete a review
router.delete('/:id_resena', resenasController.deleteResena);

module.exports = router;
