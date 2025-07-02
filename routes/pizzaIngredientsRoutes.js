const express = require('express');
const router = express.Router();
const pizzaIngredientsController = require('../contollers/pizzaIngredientsController');

// Obtener todos los ingredientes de pizza
router.get('/getPizzaIngredients', pizzaIngredientsController.getAllPizzaIngredients);

// Obtener un ingrediente de pizza específico
router.get('/getPizzaIngredient/:id', pizzaIngredientsController.getPizzaIngredientById);

// Obtener ingredientes del inventario disponibles para agregar
router.get('/getAvailableIngredients', pizzaIngredientsController.getAvailableInventoryIngredients);

// Obtener estadísticas de ingredientes de pizza
router.get('/getPizzaIngredientsStats', pizzaIngredientsController.getPizzaIngredientsStats);

// Agregar un ingrediente del inventario a los ingredientes de pizza
router.post('/addPizzaIngredient', pizzaIngredientsController.addPizzaIngredient);

// Actualizar el precio extra de un ingrediente de pizza
router.put('/updatePizzaIngredient/:id', pizzaIngredientsController.updatePizzaIngredient);

// Eliminar un ingrediente de la personalización de pizzas
router.delete('/deletePizzaIngredient/:id', pizzaIngredientsController.deletePizzaIngredient);

module.exports = router;
