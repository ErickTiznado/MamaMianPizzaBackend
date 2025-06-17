const express = require('express');
const router = express.Router();
const userController = require('../contollers/userControllers');

// User routes - específicas primero
router.get('/', userController.getAllUsers);
router.put('/:id/profile', userController.updateUserProfile);
router.post('/users_login', userController.loginClient);
router.post('/users_register', userController.createClient);

// Admin routes - TODAS las rutas específicas primero antes de /:id
router.post('/admins', userController.createAdmin);
router.post('/login', userController.loginAdmin);
router.get('/Gettadmins', userController.getAllAdmins);
router.get('/admins/stats', userController.getAdminStats);
router.get('/admins/:id', userController.getAdminById);
router.put('/Updateadmins/:id', userController.updateAdmin);
router.delete('/Deleteadmins/:id', userController.deleteAdmin);

// User routes con parámetros - AL FINAL para evitar conflictos
router.get('/:id', userController.getUserById);

module.exports = router;