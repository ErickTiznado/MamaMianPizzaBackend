const axios = require('axios');
const pool = require('../config/db');
const crypto = require('crypto');
const { 
    WOMPI_CONFIG, 
    generateAuthHeader, 
    generateTransactionReference, 
    formatAmount,
    validateCardExpiration,
    validateWebhookSignature
} = require('../config/wompiConfig');

/**
 * Create a 3DS payment transaction with Wompi
 * This initiates the 3DS payment flow
 */
exports.create3DSTransaction = async (req, res) => {
    const requestId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`\n[${new Date().toISOString()}] ===== INICIO TRANSACCIÓN 3DS WOMPI =====`);
    console.log(`🆔 Request ID: ${requestId}`);

    let connection;
    try {
        // Extract payment data from request
        const {
            // Card information
            numeroTarjeta,
            cvv,
            mesVencimiento,
            anioVencimiento,
            
            // Amount
            monto,
            
            // Customer information
            nombre,
            apellido,
            email,
            ciudad,
            direccion,
            telefono,
            
            // Optional fields
            idPais = 'SV', // El Salvador by default
            idRegion = 'SV-SS', // San Salvador by default
            codigoPostal = '01101',
            
            // Order information (for tracking)
            orderId,
            orderCode,
            
            // Configuration
            configuracion = {}
        } = req.body;

        console.log(`📝 [${requestId}] Datos recibidos:`, {
            monto,
            nombre,
            apellido,
            email,
            ciudad,
            direccion,
            telefono,
            orderId,
            orderCode,
            numeroTarjeta: numeroTarjeta ? `****-****-****-${numeroTarjeta.slice(-4)}` : 'No proporcionado'
        });

        // Validation
        const errors = [];
        
        // Required field validation
        if (!numeroTarjeta) errors.push('numeroTarjeta es requerido');
        if (!cvv) errors.push('cvv es requerido');
        if (!mesVencimiento) errors.push('mesVencimiento es requerido');
        if (!anioVencimiento) errors.push('anioVencimiento es requerido');
        if (!monto || monto <= 0) errors.push('monto debe ser mayor a 0');
        if (!nombre) errors.push('nombre es requerido');
        if (!apellido) errors.push('apellido es requerido');
        if (!email) errors.push('email es requerido');
        if (!ciudad) errors.push('ciudad es requerida');
        if (!direccion) errors.push('direccion es requerida');
        if (!telefono) errors.push('telefono es requerido');

        // Card validation
        if (numeroTarjeta && (numeroTarjeta.length < 13 || numeroTarjeta.length > 19)) {
            errors.push('numeroTarjeta debe tener entre 13 y 19 dígitos');
        }
        
        if (cvv && (cvv.length < 3 || cvv.length > 4)) {
            errors.push('cvv debe tener 3 o 4 dígitos');
        }

        if (mesVencimiento && anioVencimiento) {
            if (!validateCardExpiration(parseInt(mesVencimiento), parseInt(anioVencimiento))) {
                errors.push('La tarjeta está vencida o la fecha de vencimiento es inválida');
            }
        }

        if (errors.length > 0) {
            console.log(`❌ [${requestId}] Errores de validación:`, errors);
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors,
                request_id: requestId
            });
        }

        // Connect to database
        connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        // Generate unique transaction reference
        const transactionReference = generateTransactionReference();
        console.log(`🔗 [${requestId}] Referencia generada: ${transactionReference}`);

        // Prepare Wompi 3DS transaction payload
        const wompiPayload = {
            tarjetaCreditoDebido: {
                numeroTarjeta: numeroTarjeta.replace(/\s/g, ''), // Remove spaces
                cvv: cvv,
                mesVencimiento: parseInt(mesVencimiento),
                anioVencimiento: parseInt(anioVencimiento)
            },
            monto: formatAmount(monto),
            configuracion: {
                emailsNotificacion: configuracion.emailsNotificacion || email,
                urlWebhook: WOMPI_CONFIG.URLS.WEBHOOK,
                telefonosNotificacion: configuracion.telefonosNotificacion || telefono,
                notificarTransaccionCliente: configuracion.notificarTransaccionCliente !== false
            },
            urlRedirect: `${WOMPI_CONFIG.URLS.REDIRECT_SUCCESS}?ref=${transactionReference}`,
            nombre: nombre,
            apellido: apellido,
            email: email,
            ciudad: ciudad,
            direccion: direccion,
            idPais: idPais,
            idRegion: idRegion,
            codigoPostal: codigoPostal,
            telefono: telefono,
            datosAdicionales: {
                orderId: orderId?.toString(),
                orderCode: orderCode,
                transactionReference: transactionReference,
                source: 'mama_mian_pizza'
            }
        };

        console.log(`📤 [${requestId}] Enviando solicitud a Wompi...`);
        console.log(`🔗 [${requestId}] URL: ${WOMPI_CONFIG.BASE_URL}${WOMPI_CONFIG.ENDPOINTS.TRANSACTION_3DS}`);

        // Make request to Wompi API
        const wompiResponse = await axios.post(
            `${WOMPI_CONFIG.BASE_URL}${WOMPI_CONFIG.ENDPOINTS.TRANSACTION_3DS}`,
            wompiPayload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': generateAuthHeader()
                },
                timeout: 30000 // 30 seconds timeout
            }
        );

        console.log(`✅ [${requestId}] Respuesta de Wompi recibida:`, {
            status: wompiResponse.status,
            idTransaccion: wompiResponse.data.idTransaccion,
            monto: wompiResponse.data.monto,
            urlCompletarPago3Ds: wompiResponse.data.urlCompletarPago3Ds ? 'URL recibida' : 'No recibida'
        });

        // Save transaction to database
        const [transactionResult] = await connection.query(`
            INSERT INTO transacciones_wompi (
                transaction_reference, 
                wompi_transaction_id, 
                order_id, 
                order_code,
                amount, 
                status, 
                customer_name, 
                customer_email, 
                customer_phone,
                redirect_url,
                created_at,
                wompi_response
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
        `, [
            transactionReference,
            wompiResponse.data.idTransaccion,
            orderId || null,
            orderCode || null,
            formatAmount(monto),
            'pending',
            `${nombre} ${apellido}`,
            email,
            telefono,
            wompiResponse.data.urlCompletarPago3Ds,
            JSON.stringify(wompiResponse.data)
        ]);

        await connection.commit();
        console.log(`💾 [${requestId}] Transacción guardada en BD con ID: ${transactionResult.insertId}`);

        // Return success response with 3DS URL
        res.status(200).json({
            success: true,
            message: 'Transacción 3DS creada exitosamente',
            data: {
                transactionReference: transactionReference,
                wompiTransactionId: wompiResponse.data.idTransaccion,
                amount: wompiResponse.data.monto,
                redirectUrl: wompiResponse.data.urlCompletarPago3Ds,
                isReal: wompiResponse.data.esReal
            },
            request_id: requestId
        });

    } catch (error) {
        console.error(`❌ [${requestId}] Error en transacción 3DS:`, error.message);
        
        if (connection) {
            try {
                await connection.rollback();
                console.log(`🔄 [${requestId}] Rollback completado`);
            } catch (rollbackError) {
                console.error(`❌ [${requestId}] Error en rollback:`, rollbackError.message);
            }
        }

        // Handle Wompi API errors
        if (error.response) {
            console.error(`❌ [${requestId}] Error de Wompi API:`, {
                status: error.response.status,
                data: error.response.data
            });
            
            return res.status(400).json({
                success: false,
                message: 'Error en el procesamiento del pago',
                error: error.response.data?.message || 'Error desconocido de Wompi',
                details: error.response.data,
                request_id: requestId
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message,
            request_id: requestId
        });

    } finally {
        if (connection) {
            connection.release();
            console.log(`🔗 [${requestId}] Conexión liberada`);
        }
        console.log(`🏁 [${requestId}] ===== FIN TRANSACCIÓN 3DS =====\n`);
    }
};

/**
 * Handle Wompi webhook notifications - VERSION MEJORADA
 */
exports.handleWebhook = async (req, res) => {
    const requestId = `WEBHOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`\n[${new Date().toISOString()}] ===== WEBHOOK WOMPI =====`);
    console.log(`🆔 Request ID: ${requestId}`);

    let connection;
    try {
        const webhookData = req.body;
        console.log(`📥 [${requestId}] Webhook data recibido:`, JSON.stringify(webhookData, null, 2));

        // Validate webhook signature if provided
        const signature = req.headers['x-wompi-signature'] || req.headers['wompi-signature'];
        if (signature) {
            const rawBody = JSON.stringify(webhookData);
            if (!validateWebhookSignature(rawBody, signature)) {
                console.log(`❌ [${requestId}] Firma del webhook inválida`);
                return res.status(401).json({ success: false, message: 'Firma inválida' });
            }
            console.log(`✅ [${requestId}] Firma del webhook validada`);
        }

        // Verify if transacciones_wompi table exists
        try {
            connection = await pool.promise().getConnection();
            console.log(`✅ [${requestId}] Conexión a BD establecida`);
            
            // Test table existence
            await connection.query('SELECT 1 FROM transacciones_wompi LIMIT 1');
            console.log(`✅ [${requestId}] Tabla transacciones_wompi existe`);
        } catch (tableError) {
            console.error(`❌ [${requestId}] Error con tabla transacciones_wompi:`, tableError.message);
            return res.status(500).json({ 
                success: false, 
                message: 'Tabla de transacciones no existe. Ejecute las migraciones primero.',
                error: tableError.message,
                request_id: requestId
            });
        }

        await connection.beginTransaction();

        // Extract transaction information from webhook
        const {
            idTransaccion,
            estado,
            monto,
            fechaTransaccion,
            datosAdicionales,
            // Other possible fields
            codigoAutorizacion,
            referenciaPago,
            metodoPago
        } = webhookData;

        console.log(`📊 [${requestId}] Información de la transacción:`, {
            idTransaccion,
            estado,
            monto,
            fechaTransaccion
        });

        // Handle test webhooks
        if (!idTransaccion) {
            console.log(`❌ [${requestId}] idTransaccion no proporcionado en webhook`);
            return res.status(400).json({ 
                success: false, 
                message: 'idTransaccion es requerido',
                request_id: requestId
            });
        }

        // Find the transaction in our database
        const [existingTransaction] = await connection.query(
            'SELECT * FROM transacciones_wompi WHERE wompi_transaction_id = ?',
            [idTransaccion]
        );

        if (existingTransaction.length === 0) {
            console.log(`⚠️ [${requestId}] Transacción no encontrada en la BD: ${idTransaccion}`);
            
            // For test webhooks, create a test response
            if (idTransaccion.includes('test') || !estado) {
                console.log(`🧪 [${requestId}] Procesando webhook de prueba`);
                await connection.commit();
                return res.status(200).json({ 
                    success: true, 
                    message: 'Webhook de prueba procesado exitosamente',
                    data: {
                        transactionId: idTransaccion,
                        status: estado || 'test',
                        note: 'Esta es una transacción de prueba. En producción, las transacciones deben existir antes de recibir el webhook.'
                    },
                    request_id: requestId
                });
            }
            
            // For real webhooks, respond with success to avoid retries
            console.log(`⚠️ [${requestId}] Transacción real no encontrada, respondiendo 200`);
            await connection.commit();
            return res.status(200).json({ 
                success: false, 
                message: 'Transacción no encontrada en base de datos',
                data: {
                    transactionId: idTransaccion,
                    note: 'Webhook procesado pero transacción no existe en BD'
                },
                request_id: requestId
            });
        }

        const transaction = existingTransaction[0];
        console.log(`✅ [${requestId}] Transacción encontrada: ${transaction.transaction_reference}`);

        // Update transaction status
        const [updateResult] = await connection.query(`
            UPDATE transacciones_wompi 
            SET 
                status = ?,
                wompi_status = ?,
                authorization_code = ?,
                payment_reference = ?,
                payment_method = ?,
                completed_at = NOW(),
                webhook_data = ?,
                updated_at = NOW()
            WHERE wompi_transaction_id = ?
        `, [
            estado === 'APROBADA' ? 'approved' : 
            estado === 'RECHAZADA' ? 'rejected' : 
            estado === 'PENDIENTE' ? 'pending' : 'unknown',
            estado,
            codigoAutorizacion || null,
            referenciaPago || null,
            metodoPago || null,
            JSON.stringify(webhookData),
            idTransaccion
        ]);

        console.log(`💾 [${requestId}] Transacción actualizada en BD`);

        // If payment was approved and we have an order ID, update the order
        if (estado === 'APROBADA' && transaction.order_id) {
            console.log(`📦 [${requestId}] Actualizando estado del pedido: ${transaction.order_id}`);
            
            // Check if pedidos table has the new columns
            try {
                const [orderUpdateResult] = await connection.query(`
                    UPDATE pedidos 
                    SET 
                        estado = 'confirmado',
                        metodo_pago = 'wompi_3ds'
                        ${transaction.transaction_reference ? ', payment_reference = ?' : ''}
                        ${codigoAutorizacion ? ', payment_authorization = ?, payment_completed_at = NOW()' : ''}
                    WHERE id_pedido = ?
                `, [
                    ...(transaction.transaction_reference ? [transaction.transaction_reference] : []),
                    ...(codigoAutorizacion ? [codigoAutorizacion] : []),
                    transaction.order_id
                ]);

                if (orderUpdateResult.affectedRows > 0) {
                    console.log(`✅ [${requestId}] Pedido actualizado exitosamente`);
                } else {
                    console.log(`⚠️ [${requestId}] No se pudo actualizar el pedido`);
                }
            } catch (orderError) {
                console.log(`⚠️ [${requestId}] Error actualizando pedido (probablemente faltan columnas nuevas):`, orderError.message);
                // Continue anyway, the transaction update is more important
            }
        }

        await connection.commit();

        // Respond to Wompi webhook
        res.status(200).json({
            success: true,
            message: 'Webhook procesado exitosamente',
            transactionId: idTransaccion,
            status: estado,
            request_id: requestId
        });

        console.log(`✅ [${requestId}] Webhook procesado exitosamente`);

    } catch (error) {
        console.error(`❌ [${requestId}] Error procesando webhook:`, error.message);
        console.error(`❌ [${requestId}] Stack trace:`, error.stack);
        
        if (connection) {
            try {
                await connection.rollback();
                console.log(`🔄 [${requestId}] Rollback completado`);
            } catch (rollbackError) {
                console.error(`❌ [${requestId}] Error en rollback:`, rollbackError.message);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Error procesando webhook',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            request_id: requestId
        });

    } finally {
        if (connection) {
            connection.release();
            console.log(`🔗 [${requestId}] Conexión liberada`);
        }
        console.log(`🏁 [${requestId}] ===== FIN WEBHOOK =====\n`);
    }
};

/**
 * Check transaction status
 */
exports.checkTransactionStatus = async (req, res) => {
    const requestId = `STATUS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const { transactionReference, wompiTransactionId } = req.params;

    console.log(`\n[${new Date().toISOString()}] ===== CONSULTA ESTADO TRANSACCIÓN =====`);
    console.log(`🆔 Request ID: ${requestId}`);

    let connection;
    try {
        connection = await pool.promise().getConnection();

        // Find transaction by reference or Wompi ID
        let query, params;
        if (transactionReference) {
            query = 'SELECT * FROM transacciones_wompi WHERE transaction_reference = ?';
            params = [transactionReference];
        } else if (wompiTransactionId) {
            query = 'SELECT * FROM transacciones_wompi WHERE wompi_transaction_id = ?';
            params = [wompiTransactionId];
        } else {
            return res.status(400).json({
                success: false,
                message: 'Se requiere transactionReference o wompiTransactionId'
            });
        }

        const [transactions] = await connection.query(query, params);

        if (transactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            });
        }

        const transaction = transactions[0];

        // Optionally, check with Wompi API for the latest status
        let wompiStatus = null;
        try {
            const statusResponse = await axios.get(
                `${WOMPI_CONFIG.BASE_URL}${WOMPI_CONFIG.ENDPOINTS.TRANSACTION_STATUS}/${transaction.wompi_transaction_id}`,
                {
                    headers: {
                        'Authorization': generateAuthHeader()
                    },
                    timeout: 10000
                }
            );
            wompiStatus = statusResponse.data;
        } catch (apiError) {
            console.log(`⚠️ [${requestId}] No se pudo consultar estado en Wompi API:`, apiError.message);
        }

        res.status(200).json({
            success: true,
            data: {
                transactionReference: transaction.transaction_reference,
                wompiTransactionId: transaction.wompi_transaction_id,
                status: transaction.status,
                wompiStatus: transaction.wompi_status,
                amount: transaction.amount,
                orderId: transaction.order_id,
                orderCode: transaction.order_code,
                customerName: transaction.customer_name,
                customerEmail: transaction.customer_email,
                createdAt: transaction.created_at,
                completedAt: transaction.completed_at,
                authorizationCode: transaction.authorization_code,
                paymentReference: transaction.payment_reference,
                // Include latest Wompi status if available
                latestWompiStatus: wompiStatus
            },
            request_id: requestId
        });

    } catch (error) {
        console.error(`❌ [${requestId}] Error consultando estado:`, error.message);
        
        res.status(500).json({
            success: false,
            message: 'Error consultando estado de transacción',
            error: error.message,
            request_id: requestId
        });

    } finally {
        if (connection) {
            connection.release();
        }
        console.log(`🏁 [${requestId}] ===== FIN CONSULTA ESTADO =====\n`);
    }
};

/**
 * Get payment history
 */
exports.getPaymentHistory = async (req, res) => {
    const requestId = `HISTORY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`\n[${new Date().toISOString()}] ===== HISTORIAL DE PAGOS =====`);
    console.log(`🆔 Request ID: ${requestId}`);

    let connection;
    try {
        const { 
            page = 1, 
            limit = 20, 
            status, 
            orderId,
            startDate,
            endDate 
        } = req.query;

        connection = await pool.promise().getConnection();

        // Build query with filters
        let whereConditions = [];
        let queryParams = [];

        if (status) {
            whereConditions.push('status = ?');
            queryParams.push(status);
        }

        if (orderId) {
            whereConditions.push('order_id = ?');
            queryParams.push(orderId);
        }

        if (startDate) {
            whereConditions.push('DATE(created_at) >= ?');
            queryParams.push(startDate);
        }

        if (endDate) {
            whereConditions.push('DATE(created_at) <= ?');
            queryParams.push(endDate);
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        // Get total count
        const [countResult] = await connection.query(
            `SELECT COUNT(*) as total FROM transacciones_wompi ${whereClause}`,
            queryParams
        );

        const totalRecords = countResult[0].total;
        const offset = (page - 1) * limit;

        // Get paginated results
        const [transactions] = await connection.query(`
            SELECT 
                transaction_reference,
                wompi_transaction_id,
                order_id,
                order_code,
                amount,
                status,
                wompi_status,
                customer_name,
                customer_email,
                customer_phone,
                authorization_code,
                payment_reference,
                payment_method,
                created_at,
                completed_at
            FROM transacciones_wompi 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [...queryParams, parseInt(limit), offset]);

        res.status(200).json({
            success: true,
            data: {
                transactions: transactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalRecords / limit),
                    totalRecords: totalRecords,
                    limit: parseInt(limit)
                }
            },
            request_id: requestId
        });

    } catch (error) {
        console.error(`❌ [${requestId}] Error obteniendo historial:`, error.message);
        
        res.status(500).json({
            success: false,
            message: 'Error obteniendo historial de pagos',
            error: error.message,
            request_id: requestId
        });

    } finally {
        if (connection) {
            connection.release();
        }
        console.log(`🏁 [${requestId}] ===== FIN HISTORIAL =====\n`);
    }
};

/**
 * Process payment redirect (success/failure pages)
 */
exports.handlePaymentRedirect = async (req, res) => {
    const { ref: transactionReference } = req.query;
    const isSuccess = req.path.includes('success');
    
    console.log(`📥 Redirect de pago ${isSuccess ? 'exitoso' : 'fallido'}: ${transactionReference}`);

    if (!transactionReference) {
        return res.status(400).json({
            success: false,
            message: 'Referencia de transacción requerida'
        });
    }

    let connection;
    try {
        connection = await pool.promise().getConnection();

        const [transactions] = await connection.query(
            'SELECT * FROM transacciones_wompi WHERE transaction_reference = ?',
            [transactionReference]
        );

        if (transactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            });
        }

        const transaction = transactions[0];

        // Return transaction details for frontend processing
        res.status(200).json({
            success: true,
            isSuccess: isSuccess,
            data: {
                transactionReference: transaction.transaction_reference,
                wompiTransactionId: transaction.wompi_transaction_id,
                status: transaction.status,
                amount: transaction.amount,
                orderId: transaction.order_id,
                orderCode: transaction.order_code,
                customerName: transaction.customer_name
            }
        });

    } catch (error) {
        console.error('Error procesando redirect:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Error procesando redirect de pago',
            error: error.message
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * Simple health check for webhook debugging
 */
exports.webhookHealth = async (req, res) => {
    console.log('🏥 Webhook health check called');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    res.status(200).json({
        success: true,
        message: 'Webhook endpoint is working',
        timestamp: new Date().toISOString(),
        method: req.method,
        headers: req.headers,
        body: req.body
    });
};
