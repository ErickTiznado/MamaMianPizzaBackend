const express = require('express');
const router = express.Router();
const userController = require('../contollers/userControllers');

router.get('/', userController.getAllUsers);
router.post('/admins', userController.createAdmin);
router.post('/login', userController.loginAdmin);
router.post('/users_login', userController.loginClient);

module.exports = router;