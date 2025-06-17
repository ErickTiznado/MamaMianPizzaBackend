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

// Admin management routes
router.get('/admins/all', userController.getAllAdmins);
router.get('/admins/stats', userController.getAdminStats);
router.get('/admins/:id', userController.getAdminById);
router.put('/admins/:id', userController.updateAdmin);
router.delete('/admins/:id', userController.deleteAdmin);
router.patch('/admins/:id/toggle-status', userController.toggleAdminStatus);

module.exports = router;