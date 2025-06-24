const express = require('express');
const router = express.Router();
const contentController = require('../contollers/contentController');
const { verifyAdminToken } = require('../contollers/authController');

// ============================
// RUTAS PÚBLICAS (sin autenticación)
// ============================
router.get('/MostPopular', contentController.getLasMasPopulares);
router.get('/recomendacion', contentController.getRecomendacionDeLacasa);
router.get('/getMenu', contentController.getMenu);
router.get('/totalProducts', contentController.TotalProducts);

// ============================
// RUTAS PROTEGIDAS PARA ADMINISTRADORES (requieren JWT)
// ============================
router.post('/submit', verifyAdminToken, contentController.submitContent);
router.put('/updateContent/:id_producto', verifyAdminToken, contentController.updateContent);
router.delete('/deleteContent/:id_producto', verifyAdminToken, contentController.DeleteContent);

module.exports = router;
