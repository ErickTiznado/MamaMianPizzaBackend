const axios = require('axios');

class WompiService {
    constructor() {
        // —————— CREDENCIALES OAuth ——————
        this.CLIENT_ID = process.env.WOMPI_CLIENT_ID || '116288d1-10ee-47c4-8969-a7fd0c671c40';
        this.CLIENT_SECRET = process.env.WOMPI_CLIENT_SECRET || '249aca7c-8a8f-48ca-acda-a28d4a9ea0fc';
        
        // —————— ENDPOINTS ——————
        this.TOKEN_URL = 'https://id.wompi.sv/connect/token';
        this.TRANS_URL = 'https://api.wompi.sv/TransaccionCompra/3DS';
        this.REDIRECT_URL = process.env.WOMPI_REDIRECT_URL || 'https://mamamianpizza.com/confirmacion';
        
        // Token cache
        this.accessToken = null;
        this.tokenExpiry = null;
        
        console.log('🔧 WompiService inicializado');
        console.log(`🔑 CLIENT_ID: ${this.CLIENT_ID}`);
        console.log(`🔗 TOKEN_URL: ${this.TOKEN_URL}`);
        console.log(`💳 TRANS_URL: ${this.TRANS_URL}`);
        console.log(`↩️  REDIRECT_URL: ${this.REDIRECT_URL}`);
    }

    /**
     * Obtiene un token de acceso OAuth con depuración completa
     */
    async authenticate() {
        const requestId = `AUTH-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        try {
            console.log(`\n🔐 [${requestId}] ===== INICIANDO AUTENTICACIÓN OAUTH =====`);
            console.log(`🔗 [${requestId}] URL: ${this.TOKEN_URL}`);
            console.log(`🆔 [${requestId}] Client ID: ${this.CLIENT_ID}`);
            console.log(`🔒 [${requestId}] Client Secret: ${this.CLIENT_SECRET ? '[OCULTO]' : 'NO CONFIGURADO'}`);
            
            const params = new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: this.CLIENT_ID,
                client_secret: this.CLIENT_SECRET,
                audience: 'wompi_api'
            });
            
            console.log(`📤 [${requestId}] Parametros OAuth:`, {
                grant_type: 'client_credentials',
                client_id: this.CLIENT_ID,
                audience: 'wompi_api',
                client_secret: '[OCULTO]'
            });
            
            console.log(`🚀 [${requestId}] Enviando request de autenticación...`);
            const startTime = Date.now();
            
            const response = await axios.post(this.TOKEN_URL, params.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            
            const responseTime = Date.now() - startTime;
            
            console.log(`✅ [${requestId}] Respuesta OAuth recibida (${responseTime}ms)`);
            console.log(`📊 [${requestId}] Status: ${response.status}`);
            console.log(`📋 [${requestId}] Datos de respuesta:`, {
                access_token: response.data.access_token ? `${response.data.access_token.substring(0, 20)}...` : 'NO RECIBIDO',
                token_type: response.data.token_type,
                expires_in: response.data.expires_in,
                scope: response.data.scope
            });

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            
            const expiryDate = new Date(this.tokenExpiry);
            console.log(`⏰ [${requestId}] Token expira en: ${response.data.expires_in} segundos (${expiryDate.toLocaleString()})`);
            console.log(`✅ [${requestId}] ===== AUTENTICACIÓN COMPLETADA =====\n`);
            
            return this.accessToken;
            
        } catch (error) {
            console.error(`❌ [${requestId}] ===== ERROR EN AUTENTICACIÓN =====`);
            console.error(`📊 [${requestId}] Status: ${error.response?.status || 'SIN RESPUESTA'}`);
            console.error(`📋 [${requestId}] Headers:`, error.response?.headers || 'NO DISPONIBLES');
            console.error(`💔 [${requestId}] Error Data:`, error.response?.data || 'NO DISPONIBLE');
            console.error(`🔍 [${requestId}] Error Message:`, error.message);
            console.error(`❌ [${requestId}] ===== FIN ERROR AUTENTICACIÓN =====\n`);
            
            throw new Error(`Error de autenticación con Wompi: ${error.response?.data || error.message}`);
        }
    }

    /**
     * Obtiene un token válido, renovándolo si es necesario
     */
    async getValidToken() {
        const now = Date.now();
        const needsRenewal = !this.accessToken || now >= this.tokenExpiry;
        
        console.log(`🔍 Verificando token: ${needsRenewal ? 'NECESITA RENOVACIÓN' : 'VÁLIDO'}`);
        
        if (needsRenewal) {
            if (!this.accessToken) {
                console.log('🔄 No hay token - obteniendo nuevo token...');
            } else {
                const expiredSince = now - this.tokenExpiry;
                console.log(`🔄 Token expirado hace ${Math.round(expiredSince / 1000)} segundos - renovando...`);
            }
            await this.authenticate();
        } else {
            const remainingTime = Math.round((this.tokenExpiry - now) / 1000);
            console.log(`✅ Token válido - expira en ${remainingTime} segundos`);
        }
        
        return this.accessToken;
    }

    /**
     * Crea una transacción 3DS con Wompi - CON DEPURACIÓN COMPLETA
     * @param {Object} transactionData - Datos de la transacción
     * @returns {Promise<Object>} - Respuesta de Wompi con URL de pago
     */
    async createTransaction(transactionData) {
        const requestId = `3DS-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        
        try {
            console.log(`\n💳 [${requestId}] ===== INICIANDO TRANSACCIÓN 3DS =====`);
            console.log(`📋 [${requestId}] Datos de entrada:`, {
                nombre: transactionData.nombre,
                apellido: transactionData.apellido,
                email: transactionData.email,
                telefono: transactionData.telefono,
                monto: transactionData.monto,
                direccion: transactionData.direccion,
                ciudad: transactionData.ciudad,
                numeroTarjeta: transactionData.numeroTarjeta ? `****-****-****-${transactionData.numeroTarjeta.slice(-4)}` : 'NO PROPORCIONADO',
                cvv: transactionData.cvv ? '[OCULTO]' : 'NO PROPORCIONADO',
                mesVencimiento: transactionData.mesVencimiento,
                anioVencimiento: transactionData.anioVencimiento
            });
            
            console.log(`🔑 [${requestId}] Obteniendo token válido...`);
            const token = await this.getValidToken();
            console.log(`✅ [${requestId}] Token obtenido exitosamente`);

            // —————— PAYLOAD SIGUIENDO LA LÓGICA EXACTA ——————
            const payload = {
                tarjetaCreditoDebido: {
                    numeroTarjeta: transactionData.numeroTarjeta,
                    cvv: transactionData.cvv,
                    mesVencimiento: parseInt(transactionData.mesVencimiento),
                    anioVencimiento: parseInt(transactionData.anioVencimiento)
                },
                monto: parseFloat(transactionData.monto),
                urlRedirect: this.REDIRECT_URL,
                nombre: transactionData.nombre,
                apellido: transactionData.apellido,
                email: transactionData.email,
                ciudad: transactionData.ciudad || 'San Salvador',
                direccion: transactionData.direccion,
                idPais: transactionData.idPais || 'SV',       // ISO 3166-1 alpha2
                idRegion: transactionData.idRegion || 'SV-SS', // ISO 3166-2 para San Salvador
                codigoPostal: transactionData.codigoPostal || '1101',
                telefono: transactionData.telefono
            };

            console.log(`📦 [${requestId}] Payload construido:`, {
                tarjetaCreditoDebido: {
                    numeroTarjeta: `****-****-****-${payload.tarjetaCreditoDebido.numeroTarjeta.slice(-4)}`,
                    cvv: '[OCULTO]',
                    mesVencimiento: payload.tarjetaCreditoDebido.mesVencimiento,
                    anioVencimiento: payload.tarjetaCreditoDebido.anioVencimiento
                },
                monto: payload.monto,
                urlRedirect: payload.urlRedirect,
                nombre: payload.nombre,
                apellido: payload.apellido,
                email: payload.email,
                ciudad: payload.ciudad,
                direccion: payload.direccion,
                idPais: payload.idPais,
                idRegion: payload.idRegion,
                codigoPostal: payload.codigoPostal,
                telefono: payload.telefono
            });

            console.log(`🔗 [${requestId}] URL de transacción: ${this.TRANS_URL}`);
            console.log(`🚀 [${requestId}] Enviando transacción a Wompi...`);
            
            const startTime = Date.now();
            
            const response = await axios.post(this.TRANS_URL, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const responseTime = Date.now() - startTime;
            
            console.log(`✅ [${requestId}] Respuesta 3DS recibida (${responseTime}ms)`);
            console.log(`📊 [${requestId}] Status: ${response.status}`);
            console.log(`📋 [${requestId}] Response Headers:`, response.headers);
            console.log(`📦 [${requestId}] Response Data:`, response.data);
            
            const urlCompletarPago3Ds = response.data.urlCompletarPago3Ds;
            
            if (urlCompletarPago3Ds) {
                console.log(`🎉 [${requestId}] ===== TRANSACCIÓN 3DS EXITOSA =====`);
                console.log(`🔗 [${requestId}] URL 3DS: ${urlCompletarPago3Ds}`);
                console.log(`▶️  [${requestId}] Cliente debe abrir esta URL para completar el pago`);
            } else {
                console.warn(`⚠️  [${requestId}] No se recibió URL de pago 3DS en la respuesta`);
            }
            
            console.log(`✅ [${requestId}] ===== FIN TRANSACCIÓN 3DS =====\n`);
            
            return {
                success: true,
                urlPago: urlCompletarPago3Ds,
                transactionId: response.data.transactionId || response.data.id || null,
                data: response.data
            };

        } catch (error) {
            console.error(`❌ [${requestId}] ===== ERROR EN TRANSACCIÓN 3DS =====`);
            console.error(`📊 [${requestId}] Status: ${error.response?.status || 'SIN RESPUESTA'}`);
            console.error(`📋 [${requestId}] Response Headers:`, error.response?.headers || 'NO DISPONIBLES');
            console.error(`💔 [${requestId}] Error Body:`, error.response?.data || 'NO DISPONIBLE');
            console.error(`🔍 [${requestId}] Error Message:`, error.message);
            console.error(`📤 [${requestId}] Request Config:`, {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers
            });
            console.error(`❌ [${requestId}] ===== FIN ERROR 3DS =====\n`);
            
            return {
                success: false,
                error: error.response?.data || error.message,
                statusCode: error.response?.status || 500,
                requestId: requestId
            };
        }
    }

    /**
     * Valida los datos de tarjeta de crédito
     * @param {Object} cardData - Datos de la tarjeta
     * @returns {Object} - Resultado de la validación
     */
    validateCardData(cardData) {
        const errors = [];

        if (!cardData.numeroTarjeta || cardData.numeroTarjeta.length < 13 || cardData.numeroTarjeta.length > 19) {
            errors.push('Número de tarjeta inválido');
        }

        if (!cardData.cvv || cardData.cvv.length < 3 || cardData.cvv.length > 4) {
            errors.push('CVV inválido');
        }

        if (!cardData.mesVencimiento || cardData.mesVencimiento < 1 || cardData.mesVencimiento > 12) {
            errors.push('Mes de vencimiento inválido');
        }

        const currentYear = new Date().getFullYear();
        if (!cardData.anioVencimiento || cardData.anioVencimiento < currentYear || cardData.anioVencimiento > currentYear + 10) {
            errors.push('Año de vencimiento inválido');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Valida los datos del cliente
     * @param {Object} clientData - Datos del cliente
     * @returns {Object} - Resultado de la validación
     */
    validateClientData(clientData) {
        const errors = [];

        if (!clientData.nombre || clientData.nombre.trim().length < 2) {
            errors.push('Nombre es requerido');
        }

        if (!clientData.apellido || clientData.apellido.trim().length < 2) {
            errors.push('Apellido es requerido');
        }

        if (!clientData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
            errors.push('Email inválido');
        }

        if (!clientData.telefono || clientData.telefono.length < 8) {
            errors.push('Teléfono inválido');
        }

        if (!clientData.direccion || clientData.direccion.trim().length < 5) {
            errors.push('Dirección es requerida');
        }

        if (!clientData.monto || parseFloat(clientData.monto) <= 0) {
            errors.push('Monto debe ser mayor a 0');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = new WompiService();
