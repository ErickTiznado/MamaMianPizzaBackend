// Wompi Payment Gateway Configuration
const crypto = require('crypto');

const WOMPI_CONFIG = {
    // Your Wompi credentials
    APP_ID: process.env.WOMPI_APP_ID || '116288d1-10ee-47c4-8969-a7fd0c671c40',
    API_SECRET: process.env.WOMPI_API_SECRET || '249aca7c-8a8f-48ca-acda-a28d4a9ea0fc',
    
    // API URLs
    BASE_URL: 'https://api.wompi.sv',
    ENDPOINTS: {
        TRANSACTION_3DS: '/TransaccionCompra/3DS',
        TRANSACTION_STATUS: '/TransaccionCompra/Estado',
        PURCHASE_LINK: '/EnlaceCompra',
        WEBHOOK: '/webhook'
    },
    
    // Payment configuration
    DEFAULT_CURRENCY: 'USD',
    DEFAULT_COUNTRY: 'SV', // El Salvador
    
    // Your application URLs - these should be replaced with your actual URLs
    URLS: {
        REDIRECT_SUCCESS: process.env.WOMPI_REDIRECT_SUCCESS || 'https://mamamianpizza.com/payment/success',
        REDIRECT_FAILURE: process.env.WOMPI_REDIRECT_FAILURE || 'https://mamamianpizza.com/payment/failure',
        WEBHOOK: process.env.WOMPI_WEBHOOK_URL || 'https://api.mamamianpizza.com/api/payments/webhook'
    }
};

/**
 * Generate authorization header for Wompi API
 * @returns {string} Authorization header value
 */
const generateAuthHeader = () => {
    const credentials = `${WOMPI_CONFIG.APP_ID}:${WOMPI_CONFIG.API_SECRET}`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

/**
 * Validate webhook signature (if needed)
 * @param {string} payload - Raw webhook payload
 * @param {string} signature - Webhook signature header
 * @returns {boolean} True if signature is valid
 */
const validateWebhookSignature = (payload, signature) => {
    // Wompi webhook signature validation (implement if they provide it)
    // For now, we'll implement basic validation
    const hmac = crypto.createHmac('sha256', WOMPI_CONFIG.API_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
    );
};

/**
 * Generate unique transaction reference
 * @returns {string} Unique transaction reference
 */
const generateTransactionReference = () => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `MAMA-${timestamp}-${randomPart}`.toUpperCase();
};

/**
 * Format amount for Wompi (they might require specific formatting)
 * @param {number} amount - Amount in dollars
 * @returns {number} Formatted amount
 */
const formatAmount = (amount) => {
    // Ensure amount has 2 decimal places and is a number
    return parseFloat(amount.toFixed(2));
};

/**
 * Validate card expiration date
 * @param {number} month - Expiration month (1-12)
 * @param {number} year - Expiration year (full year, e.g., 2025)
 * @returns {boolean} True if expiration date is valid
 */
const validateCardExpiration = (month, year) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
    const currentYear = now.getFullYear();
    
    // Basic validation
    if (month < 1 || month > 12) return false;
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
};

/**
 * Get payment method display name
 * @param {string} method - Payment method code
 * @returns {string} Display name
 */
const getPaymentMethodName = (method) => {
    const methods = {
        'tarjeta': 'Tarjeta de Crédito/Débito',
        'efectivo': 'Efectivo',
        'transferencia': 'Transferencia Bancaria',
        'wompi_3ds': 'Pago Seguro con Tarjeta (3DS)'
    };
    
    return methods[method] || method;
};

module.exports = {
    WOMPI_CONFIG,
    generateAuthHeader,
    validateWebhookSignature,
    generateTransactionReference,
    formatAmount,
    validateCardExpiration,
    getPaymentMethodName
};
