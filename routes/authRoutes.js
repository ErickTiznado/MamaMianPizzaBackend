const express = require('express');
const router = express.Router();
const authController = require('../contollers/authController');

// ============================
// RUTAS PARA USUARIOS
// ============================

// Request password reset via email
router.post('/request-reset', authController.requestPasswordReset);

// Verify OTP code
router.post('/verify-reset', authController.verifyResetOTP);

// Reset password with token
router.put('/reset-password', authController.resetPassword);

// ============================
// RUTAS PARA ADMINISTRADORES
// ============================

// Request password reset for admin via email
router.post('/admin/request-reset', authController.requestPasswordResetAdmin);

// Verify OTP code for admin
router.post('/admin/verify-reset', authController.verifyResetOTPAdmin);

// Reset password with token for admin
router.put('/admin/reset-password', authController.resetPasswordAdmin);

module.exports = router;
