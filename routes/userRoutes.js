const express = require('express');
const router = express.Router();
const userController = require('../contollers/userControllers');

router.get('/', userController.getAllUsers);
router.post('/admins', userController.createAdmin);



module.exports = router;