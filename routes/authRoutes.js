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

// Change password for authenticated users
router.put('/change-password', authController.changePassword);

// ============================
// RUTAS PARA ADMINISTRADORES
// ============================

// ---- AUTENTICACIÓN JWT PARA ADMINISTRADORES ----
// Admin login with JWT
router.post('/admin/login', authController.loginAdmin);

// Refresh JWT token for admin
router.post('/admin/refresh-token', authController.refreshAdminToken);

// Get admin profile (protected route)
router.get('/admin/profile', authController.verifyAdminToken, authController.getAdminProfile);

// Admin logout
router.post('/admin/logout', authController.verifyAdminToken, authController.logoutAdmin);

// ---- RESTABLECIMIENTO DE CONTRASEÑA ----
// Request password reset for admin via email
router.post('/admin/request-reset', authController.requestPasswordResetAdmin);

// Verify OTP code for admin
router.post('/admin/verify-reset', authController.verifyResetOTPAdmin);

// Reset password with token for admin
router.put('/admin/reset-password', authController.resetPasswordAdmin);

// Change password directly for admin (with current password)
router.put('/admin/change-password', authController.changePasswordAdmin);

module.exports = router;
