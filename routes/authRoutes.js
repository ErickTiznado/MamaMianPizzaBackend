const express = require('express');
const router = express.Router();
const authController = require('../contollers/authController');

// Request password reset via SMS
router.post('/request-reset', authController.requestPasswordReset);

// Verify OTP code
router.post('/verify-reset', authController.verifyResetOTP);

// Reset password with token
router.put('/reset-password', authController.resetPassword);

module.exports = router;
