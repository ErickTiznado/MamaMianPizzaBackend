const express = require('express');
const router = express.Router();
const accountController = require('../contollers/accountController');

// ============================
// RUTAS PARA GESTIÓN DE CUENTAS
// ============================

// Desactivar cuenta de usuario
// PUT /account/deactivate
router.put('/deactivate', accountController.deactivateAccount);

// Reactivar cuenta de usuario
// PUT /account/activate
router.put('/activate', accountController.activateAccount);

// Obtener estado de cuenta de usuario
// GET /account/status/:id_usuario
router.get('/status/:id_usuario', accountController.getAccountStatus);

// Login con validación de cuenta activa
// POST /account/login
router.post('/login', accountController.validateLoginActiveAccount);

// Listar usuarios con su estado (activo/inactivo)
// GET /account/list
router.get('/list', accountController.listUsersWithStatus);

module.exports = router;
