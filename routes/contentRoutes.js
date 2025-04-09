const express = require('express');
const router = express.Router();
const contentController = require('../contollers/contentController');

// Route to add new content
router.post('/submit', contentController.submitContent);

// Add a route to get all products
router.get('/', (req, res) => {
    // This is a placeholder - you'll implement this in the controller
    res.status(200).json({ message: 'Get all products route' });
});

// Add a route to get a specific product
router.get('/:id', (req, res) => {
    // This is a placeholder - you'll implement this in the controller
    res.status(200).json({ message: `Get product with ID: ${req.params.id}` });
});

// Add a route to update a product
router.put('/:id', (req, res) => {
    // This is a placeholder - you'll implement this in the controller
    res.status(200).json({ message: `Update product with ID: ${req.params.id}` });
});

// Add a route to delete a product
router.delete('/:id', (req, res) => {
    // This is a placeholder - you'll implement this in the controller
    res.status(200).json({ message: `Delete product with ID: ${req.params.id}` });
});


router.get('/MostPopular', contentController.getLasMasPopulares);

module.exports = router;
