const express = require('express');
const router = express.Router();
const userController = require('../contollers/userControllers');

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id/profile', userController.updateUserProfile);
router.post('/admins', userController.createAdmin);
router.post('/login', userController.loginAdmin);
router.post('/users_login', userController.loginClient);
router.post('/users_register', userController.createClient);
module.exports = router;