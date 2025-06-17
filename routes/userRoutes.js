const express = require('express');
const router = express.Router();
const userController = require('../contollers/userControllers');

// User routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id/profile', userController.updateUserProfile);
router.post('/users_login', userController.loginClient);
router.post('/users_register', userController.createClient);

// Admin authentication routes
router.post('/admins', userController.createAdmin);
router.post('/login', userController.loginAdmin);

// Admin management routes (corregidas para tu DB)
router.get('/admins', userController.getAllAdmins);  // Cambiado de /admins/all a /admins
router.get('/admins/stats', userController.getAdminStats);
router.get('/admins/:id', userController.getAdminById);
router.put('/admins/:id', userController.updateAdmin);
router.delete('/admins/:id', userController.deleteAdmin);
// Removed toggle-status route since there's no 'activo' column

module.exports = router;