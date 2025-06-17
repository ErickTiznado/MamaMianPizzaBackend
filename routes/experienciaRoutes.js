const express = require('express');
const router = express.Router();
const experienciaController = require('../contollers/experienciaController');

// POST - Create a new experience
router.post('/', experienciaController.createExperiencia);

// GET - Get all experiences
router.get('/', experienciaController.getAllExperiencias);

// GET - Get experiences by user ID
router.get('/user/:id_usuario', experienciaController.getExperienciasByUser);

// GET - Get experiences by approval status (0 = not approved, 1 = approved)
router.get('/status/:aprobado', experienciaController.getExperienciasByApprovalStatus);

// PUT - Update an experience
router.put('/:id_experiencia', experienciaController.updateExperiencia);

// PUT - Toggle experience approval status
router.put('/:id_experiencia/approval', experienciaController.toggleExperienciaApproval);

// DELETE - Delete an experience
router.delete('/:id_experiencia', experienciaController.deleteExperiencia);

module.exports = router;
