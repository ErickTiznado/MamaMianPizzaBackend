const express = require('express');
const router = express.Router();
const segmentacionController = require('../contollers/segmentacionController');

/**
 * Rutas para análisis de segmentación de clientes
 * Base URL: /api/segmentacion
 */

// Ruta principal para obtener análisis de segmentación de clientes
// GET /api/segmentacion
router.get('/', segmentacionController.getCustomerSegmentation);

// Ruta para obtener detalles de un segmento específico
// GET /api/segmentacion/segment/:segment
// Parámetros válidos: nuevos, ocasionales, habituales, leales
router.get('/segment/:segment', segmentacionController.getSegmentDetails);

// Ruta para obtener estadísticas adicionales de segmentación
// GET /api/segmentacion/stats
router.get('/stats', segmentacionController.getSegmentationStats);

module.exports = router;
