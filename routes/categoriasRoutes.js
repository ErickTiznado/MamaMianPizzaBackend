const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory } = require('../contollers/categoriasControllers');

// GET /api/categorias - Obtener todas las categorías
router.get('/', getAllCategories);

// POST /api/categorias - Crear nueva categoría
router.post('/', createCategory);

module.exports = router;