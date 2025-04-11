const express = require('express');
const router = express.Router();
const contentController = require('../contollers/contentController');
const { route } = require('./testRoutes');

// Route to add new content
router.post('/submit', contentController.submitContent);

router.get('/MostPopular', contentController.getLasMasPopulares);
router.get('/recomendacion', contentController.getRecomendacionDeLacasa)
router.get('/getMenu', contentController.getMenu);
module.exports = router;
