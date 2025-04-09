const express = require('express');
const router = express.Router();
const contentController = require('../contollers/contentController');

// Route to add new content
router.post('/submit', contentController.submitContent);

router.get('/MostPopular', contentController.getLasMasPopulares);

module.exports = router;
