const express = require('express');
const router = express.Router();
const paymentController = require('../contollers/paymentController');

// Wompi 3DS Payment Routes

/**
 * POST /api/payments/3ds/create
 * Create a new 3DS payment transaction
 * 
 * Body should include:
 * - numeroTarjeta: string (card number)
 * - cvv: string (3-4 digits)
 * - mesVencimiento: number (1-12)
 * - anioVencimiento: number (full year, e.g., 2025)
 * - monto: number (amount in dollars)
 * - nombre: string (customer first name)
 * - apellido: string (customer last name)
 * - email: string (customer email)
 * - ciudad: string (customer city)
 * - direccion: string (customer address)
 * - telefono: string (customer phone)
 * - orderId: number (optional - existing order ID)
 * - orderCode: string (optional - existing order code)
 * - idPais: string (optional - country ID, defaults to 'SV')
 * - idRegion: string (optional - region ID, defaults to 'SV-SS')
 * - codigoPostal: string (optional - postal code, defaults to '01101')
 * - configuracion: object (optional - Wompi configuration options)
 */
router.post('/3ds/create', paymentController.create3DSTransaction);

/**
 * POST /api/payments/webhook
 * Handle Wompi webhook notifications
 * This endpoint will be called by Wompi when payment status changes
 */
router.post('/webhook', paymentController.handleWebhook);

/**
 * GET /api/payments/status/:transactionReference
 * Get transaction status by transaction reference
 */
router.get('/status/:transactionReference', paymentController.checkTransactionStatus);

/**
 * GET /api/payments/wompi-status/:wompiTransactionId
 * Get transaction status by Wompi transaction ID
 */
router.get('/wompi-status/:wompiTransactionId', paymentController.checkTransactionStatus);

/**
 * GET /api/payments/history
 * Get payment history with pagination and filters
 * 
 * Query parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - status: string (filter by status)
 * - orderId: number (filter by order ID)
 * - startDate: string (YYYY-MM-DD format)
 * - endDate: string (YYYY-MM-DD format)
 */
router.get('/history', paymentController.getPaymentHistory);

/**
 * GET /api/payments/redirect/success
 * Handle successful payment redirect from Wompi
 * Query parameter: ref (transaction reference)
 */
router.get('/redirect/success', paymentController.handlePaymentRedirect);

/**
 * GET /api/payments/redirect/failure
 * Handle failed payment redirect from Wompi
 * Query parameter: ref (transaction reference)
 */
router.get('/redirect/failure', paymentController.handlePaymentRedirect);

// Additional utility routes

/**
 * GET /api/payments/test-connection
 * Test connection to Wompi API (for debugging)
 */
router.get('/test-connection', async (req, res) => {
    try {
        const { WOMPI_CONFIG, generateAuthHeader } = require('../config/wompiConfig');
        const axios = require('axios');
        
        // Try a simple request to test connectivity
        const response = await axios.get(`${WOMPI_CONFIG.BASE_URL}/health`, {
            headers: {
                'Authorization': generateAuthHeader()
            },
            timeout: 10000
        });
        
        res.json({
            success: true,
            message: 'Conexión con Wompi exitosa',
            status: response.status,
            wompiBaseUrl: WOMPI_CONFIG.BASE_URL
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error conectando con Wompi',
            error: error.message,
            wompiBaseUrl: WOMPI_CONFIG.BASE_URL
        });
    }
});

/**
 * GET /api/payments/config
 * Get payment configuration (public info only)
 */
router.get('/config', (req, res) => {
    const { WOMPI_CONFIG } = require('../config/wompiConfig');
    
    res.json({
        success: true,
        config: {
            baseUrl: WOMPI_CONFIG.BASE_URL,
            currency: WOMPI_CONFIG.DEFAULT_CURRENCY,
            country: WOMPI_CONFIG.DEFAULT_COUNTRY,
            redirectUrls: {
                success: WOMPI_CONFIG.URLS.REDIRECT_SUCCESS,
                failure: WOMPI_CONFIG.URLS.REDIRECT_FAILURE
            }
            // Note: We don't expose APP_ID or API_SECRET for security
        }
    });
});

/**
 * POST /api/payments/validate-card
 * Validate card information before creating transaction
 */
router.post('/validate-card', (req, res) => {
    const { validateCardExpiration } = require('../config/wompiConfig');
    const { numeroTarjeta, cvv, mesVencimiento, anioVencimiento } = req.body;
    
    const errors = [];
    
    // Basic card validation
    if (!numeroTarjeta || numeroTarjeta.length < 13 || numeroTarjeta.length > 19) {
        errors.push('Número de tarjeta inválido');
    }
    
    if (!cvv || cvv.length < 3 || cvv.length > 4) {
        errors.push('CVV inválido');
    }
    
    if (!validateCardExpiration(parseInt(mesVencimiento), parseInt(anioVencimiento))) {
        errors.push('Fecha de vencimiento inválida');
    }
    
    // Basic Luhn algorithm check for card number
    if (numeroTarjeta) {
        const cardDigits = numeroTarjeta.replace(/\D/g, '');
        let sum = 0;
        let isEven = false;
        
        for (let i = cardDigits.length - 1; i >= 0; i--) {
            let digit = parseInt(cardDigits.charAt(i));
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        if (sum % 10 !== 0) {
            errors.push('Número de tarjeta inválido (falla verificación Luhn)');
        }
    }
    
    res.json({
        success: errors.length === 0,
        valid: errors.length === 0,
        errors: errors
    });
});

module.exports = router;
