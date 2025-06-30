const wompiService = require('../services/wompiService');
const pool = require('../config/db');
const orderController = require('./orderController');

// Helper function to log actions
const logAction = (req, accion, tabla_afectada, descripcion) => {
    const userId = req.user ? req.user.id : null;
    
    pool.query(
        'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
        [userId, accion, tabla_afectada, descripcion],
        (logErr) => {
            if (logErr) {
                console.error('Error al registrar en logs:', logErr);
            }
        }
    );
};

/**
 * Crear una nueva transacción de pago
 */
exports.createPaymentTransaction = async (req, res) => {
    try {
        const {
            // Datos de la tarjeta
            numeroTarjeta,
            cvv,
            mesVencimiento,
            anioVencimiento,
            
            // Datos del cliente
            nombre,
            apellido,
            email,
            telefono,
            direccion,
            ciudad,
            idPais,
            idRegion,
            codigoPostal,
            
            // Datos de la transacción
            monto,
            descripcion,
            pedidoId
        } = req.body;

        // Validar datos de la tarjeta
        const cardValidation = wompiService.validateCardData({
            numeroTarjeta, cvv, mesVencimiento, anioVencimiento
        });

        if (!cardValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Datos de tarjeta inválidos',
                errors: cardValidation.errors
            });
        }

        // Validar datos del cliente
        const clientValidation = wompiService.validateClientData({
            nombre, apellido, email, telefono, direccion, monto
        });

        if (!clientValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Datos del cliente inválidos',
                errors: clientValidation.errors
            });
        }

        console.log(`💳 [${req.method}] Iniciando proceso de transacción con Wompi...`);
        console.log(`📊 [${req.method}] Datos para Wompi:`, {
            nombre,
            apellido,
            email,
            telefono,
            monto,
            direccion,
            ciudad,
            idPais,
            idRegion,
            codigoPostal,
            numeroTarjeta: numeroTarjeta ? `****-****-****-${numeroTarjeta.slice(-4)}` : 'NO PROPORCIONADO',
            cvv: cvv ? '[OCULTO]' : 'NO PROPORCIONADO',
            mesVencimiento,
            anioVencimiento
        });

        // Crear la transacción con Wompi
        const transactionResult = await wompiService.createTransaction({
            numeroTarjeta,
            cvv,
            mesVencimiento: parseInt(mesVencimiento),
            anioVencimiento: parseInt(anioVencimiento),
            nombre,
            apellido,
            email,
            telefono,
            direccion,
            ciudad,
            idPais,
            idRegion,
            codigoPostal,
            monto
        });

        console.log(`📋 [${req.method}] Resultado de Wompi:`, {
            success: transactionResult.success,
            urlPago: transactionResult.urlPago,
            transactionId: transactionResult.transactionId,
            error: transactionResult.error,
            statusCode: transactionResult.statusCode
        });

        if (!transactionResult.success) {
            console.error(`❌ [${req.method}] Error en transacción Wompi:`, transactionResult.error);
            
            // Log del error
            logAction(req, 'PAYMENT_ERROR', 'transacciones', 
                `Error al crear transacción: ${transactionResult.error} - Monto: $${monto}`);
            
            return res.status(transactionResult.statusCode || 500).json({
                success: false,
                message: 'Error al procesar el pago',
                error: transactionResult.error,
                requestId: transactionResult.requestId
            });
        }

        console.log(`✅ [${req.method}] Transacción Wompi exitosa - URL: ${transactionResult.urlPago}`);

        // Guardar la transacción en la base de datos
        const transactionId = await saveTransaction({
            urlPago: transactionResult.urlPago,
            monto: parseFloat(monto),
            email,
            nombre: `${nombre} ${apellido}`,
            telefono,
            direccion,
            descripcion: descripcion || 'Pago en línea',
            pedidoId: pedidoId || null,
            userId: req.user ? req.user.id : null,
            status: 'pending',
            wompiData: JSON.stringify(transactionResult.data)
        });

        // Log de éxito
        logAction(req, 'PAYMENT_CREATED', 'transacciones', 
            `Transacción creada: ID ${transactionId} - Monto: $${monto} - Email: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Transacción creada exitosamente',
            data: {
                transactionId,
                urlPago: transactionResult.urlPago,
                monto: parseFloat(monto),
                mensaje: 'Redirige al usuario a la URL de pago para completar la transacción'
            }
        });

    } catch (error) {
        console.error('Error en createPaymentTransaction:', error);
        
        // Log del error
        logAction(req, 'PAYMENT_ERROR', 'transacciones', 
            `Error interno del servidor: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

/**
 * Guardar transacción en la base de datos
 */
async function saveTransaction(transactionData) {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO transacciones 
            (url_pago, monto, email, nombre_cliente, telefono, direccion, descripcion, pedido_id, usuario_id, status, wompi_data, fecha_creacion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        pool.query(query, [
            transactionData.urlPago,
            transactionData.monto,
            transactionData.email,
            transactionData.nombre,
            transactionData.telefono,
            transactionData.direccion,
            transactionData.descripcion,
            transactionData.pedidoId,
            transactionData.userId,
            transactionData.status,
            transactionData.wompiData
        ], (err, result) => {
            if (err) {
                console.error('Error al guardar transacción:', err);
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
}

/**
 * Obtener todas las transacciones (solo para administradores)
 */
exports.getAllTransactions = (req, res) => {
    const query = `
        SELECT 
            t.*,
            u.nombre as usuario_nombre,
            u.email as usuario_email
        FROM transacciones t
        LEFT JOIN usuarios u ON t.usuario_id = u.id_usuario
        ORDER BY t.fecha_creacion DESC
        LIMIT 100
    `;

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener transacciones:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener transacciones'
            });
        }

        res.json({
            success: true,
            message: 'Transacciones obtenidas exitosamente',
            data: results
        });
    });
};

/**
 * Obtener una transacción específica
 */
exports.getTransaction = (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT 
            t.*,
            u.nombre as usuario_nombre,
            u.email as usuario_email
        FROM transacciones t
        LEFT JOIN usuarios u ON t.usuario_id = u.id_usuario
        WHERE t.id = ?
    `;

    pool.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener transacción:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener transacción'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Transacción obtenida exitosamente',
            data: results[0]
        });
    });
};

/**
 * Actualizar el estado de una transacción (webhook o confirmación)
 */
exports.updateTransactionStatus = (req, res) => {
    const { id } = req.params;
    const { status, wompiResponse } = req.body;

    const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Estado inválido'
        });
    }

    const query = `
        UPDATE transacciones 
        SET status = ?, wompi_response = ?, fecha_actualizacion = NOW()
        WHERE id = ?
    `;

    pool.query(query, [status, JSON.stringify(wompiResponse || {}), id], (err, result) => {
        if (err) {
            console.error('Error al actualizar transacción:', err);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar transacción'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            });
        }

        // Log de la actualización
        logAction(req, 'PAYMENT_UPDATED', 'transacciones', 
            `Estado de transacción ${id} actualizado a: ${status}`);

        res.json({
            success: true,
            message: 'Estado de transacción actualizado exitosamente'
        });
    });
};

/**
 * Endpoint para manejar la confirmación de pago (desde el redirect)
 */
exports.handlePaymentConfirmation = (req, res) => {
    // Este endpoint recibirá los parámetros de confirmación de Wompi
    const { transactionId, status, amount } = req.query;

    console.log('📝 Confirmación de pago recibida:', {
        transactionId,
        status,
        amount
    });

    // Aquí puedes actualizar el estado en tu base de datos
    // y redirigir al usuario a una página de confirmación

    if (status === 'success') {
        res.redirect(`https://mamamianpizza.com/pago-exitoso?transaction=${transactionId}&amount=${amount}`);
    } else {
        res.redirect(`https://mamamianpizza.com/pago-fallido?transaction=${transactionId}`);
    }
};

/**
 * Crear transacción rápida para testing
 */
exports.createTestTransaction = async (req, res) => {
    try {
        const testData = {
            numeroTarjeta: '4573690001990693',
            cvv: '835',
            mesVencimiento: 12,
            anioVencimiento: 2029,
            nombre: 'Erick',
            apellido: 'Tiznado',
            email: 'tiznadoerick3@gmail.com',
            telefono: '50300000000',
            direccion: 'Tu Dirección 123',
            ciudad: 'San Salvador',
            idPais: 'SV',
            idRegion: 'SV-SS',
            codigoPostal: '1101',
            monto: 4.00
        };

        const result = await wompiService.createTransaction(testData);

        if (result.success) {
            res.json({
                success: true,
                message: 'Transacción de prueba creada',
                urlPago: result.urlPago,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error en transacción de prueba',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Error en createTestTransaction:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Procesar pago completo con creación automática de pedido
 * Este endpoint recibe todos los datos necesarios para el pago Y el pedido
 */
exports.processPaymentAndOrder = async (req, res) => {
    let connection;
    const requestId = `PAYMENT-PROCESS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`\n[${new Date().toISOString()}] ===== INICIO PROCESO PAGO + PEDIDO =====`);
    console.log(`🆔 Request ID: ${requestId}`);
    console.log(`📝 Body completo:`, JSON.stringify(req.body, null, 2));
    
    try {
        console.log(`🔍 [${requestId}] Analizando formato de datos recibidos...`);
        
        // Detectar si viene en formato nuevo (con pedidoData) o formato directo
        let datosNormalizados;
        
        if (req.body.pedidoData) {
            console.log(`📋 [${requestId}] Formato detectado: NUEVO (con pedidoData)`);
            datosNormalizados = req.body;
        } else if (req.body.cliente && req.body.tarjeta && req.body.productos) {
            console.log(`📋 [${requestId}] Formato detectado: DIRECTO (frontend simplificado)`);
            console.log(`🔄 [${requestId}] Adaptando formato directo a formato interno...`);
            
            // Adaptar formato directo al formato esperado
            datosNormalizados = {
                // Datos de la tarjeta del formato directo
                numeroTarjeta: req.body.tarjeta.numeroTarjeta,
                cvv: req.body.tarjeta.cvv,
                mesVencimiento: req.body.tarjeta.mesVencimiento,
                anioVencimiento: req.body.tarjeta.anioVencimiento,
                
                // Datos del cliente para pago
                nombre: req.body.cliente.nombre.split(' ')[0] || req.body.cliente.nombre,
                apellido: req.body.cliente.nombre.split(' ').slice(1).join(' ') || 'Cliente',
                email: req.body.cliente.email,
                telefono: req.body.cliente.telefono,
                direccionPago: req.body.cliente.direccion,
                ciudad: 'San Salvador',
                idPais: 'SV',
                idRegion: 'SV-SS',
                codigoPostal: '1101',
                
                // Construir pedidoData desde el formato directo
                pedidoData: {
                    tipo_cliente: 'invitado',
                    cliente: {
                        nombre: req.body.cliente.nombre.split(' ')[0] || req.body.cliente.nombre,
                        apellido: req.body.cliente.nombre.split(' ').slice(1).join(' ') || 'Cliente',
                        telefono: req.body.cliente.telefono,
                        email: req.body.cliente.email
                    },
                    direccion: {
                        tipo_direccion: 'formulario',
                        direccion: req.body.cliente.direccion,
                        pais: 'El Salvador',
                        departamento: 'San Salvador',
                        municipio: 'San Salvador',
                        codigo_postal: '1101',
                        instrucciones_entrega: req.body.observaciones_generales || null
                    },
                    productos: req.body.productos.map(producto => ({
                        id_producto: producto.id_producto,
                        nombre_producto: `Producto ID ${producto.id_producto}`,
                        cantidad: producto.cantidad,
                        precio_unitario: producto.precio_unitario,
                        subtotal: producto.cantidad * producto.precio_unitario,
                        masa: producto.observaciones?.includes('Masa:') ? 
                              producto.observaciones.split('Masa:')[1]?.split(',')[0]?.trim() : null,
                        tamano: producto.observaciones?.includes('Tamaño:') ? 
                               producto.observaciones.split('Tamaño:')[1]?.trim() : null,
                        instrucciones_especiales: producto.observaciones || null
                    })),
                    subtotal: req.body.productos.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0),
                    costo_envio: req.body.tipo_entrega === 'domicilio' ? 2.50 : 0,
                    impuestos: 0,
                    total: req.body.productos.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0) + 
                           (req.body.tipo_entrega === 'domicilio' ? 2.50 : 0) - 
                           (req.body.descuento || 0),
                    aceptado_terminos: true,
                    tiempo_estimado_entrega: req.body.tipo_entrega === 'domicilio' ? 45 : 15
                }
            };
            
            console.log(`✅ [${requestId}] Datos adaptados correctamente`);
            console.log(`📊 [${requestId}] Total calculado: $${datosNormalizados.pedidoData.total}`);
            console.log(`🛍️ [${requestId}] Productos adaptados: ${datosNormalizados.pedidoData.productos.length} items`);
            
        } else {
            console.error(`❌ [${requestId}] Formato de datos no reconocido`);
            console.error(`🔍 [${requestId}] Campos recibidos:`, Object.keys(req.body));
            
            return res.status(400).json({
                success: false,
                message: 'Formato de datos no válido',
                error: 'Se esperaba formato con pedidoData o formato directo con cliente/tarjeta/productos',
                formatosValidos: {
                    nuevo: { pedidoData: '{ cliente, direccion, productos, etc. }' },
                    directo: { cliente: '{}', tarjeta: '{}', productos: '[]' }
                },
                camposRecibidos: Object.keys(req.body)
            });
        }

        const {
            numeroTarjeta,
            cvv,
            mesVencimiento,
            anioVencimiento,
            nombre,
            apellido,
            email,
            telefono,
            direccionPago,
            ciudad,
            idPais,
            idRegion,
            codigoPostal,
            pedidoData
        } = datosNormalizados;

        console.log(`📋 [${requestId}] Datos normalizados para procesamiento:`);
        console.log(`👤 [${requestId}] Cliente: ${nombre} ${apellido} (${email})`);
        console.log(`💳 [${requestId}] Tarjeta: ****-****-****-${numeroTarjeta.slice(-4)}`);
        console.log(`🛍️ [${requestId}] Productos: ${pedidoData.productos.length} items`);
        console.log(`💰 [${requestId}] Total: $${pedidoData.total}`);

        // Validar que tenemos todos los datos necesarios
        if (!pedidoData || !pedidoData.productos || !Array.isArray(pedidoData.productos) || pedidoData.productos.length === 0) {
            console.error(`❌ [${requestId}] Validación fallida - pedidoData incompleto`);
            console.error(`🔍 [${requestId}] pedidoData:`, pedidoData);
            
            return res.status(400).json({
                success: false,
                message: 'Datos del pedido incompletos después de normalización',
                error: 'El pedidoData normalizado no contiene productos válidos',
                debug: {
                    tieneProductos: !!pedidoData?.productos,
                    esArray: Array.isArray(pedidoData?.productos),
                    cantidad: pedidoData?.productos?.length || 0
                }
            });
        }

        // Extraer el monto del pedido
        const monto = pedidoData.total;
        if (!monto || monto <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Monto inválido',
                error: 'El monto debe ser mayor a 0'
            });
        }

        console.log(`💰 [${requestId}] Monto a procesar: $${monto}`);
        console.log(`🛍️ [${requestId}] Productos: ${pedidoData.productos.length} items`);

        // Validar datos de la tarjeta
        const cardValidation = wompiService.validateCardData({
            numeroTarjeta, cvv, mesVencimiento, anioVencimiento
        });

        if (!cardValidation.isValid) {
            console.error(`❌ [${requestId}] Datos de tarjeta inválidos:`, cardValidation.errors);
            return res.status(400).json({
                success: false,
                message: 'Datos de tarjeta inválidos',
                errors: cardValidation.errors
            });
        }

        // Validar datos del cliente
        const clientValidation = wompiService.validateClientData({
            nombre, apellido, email, telefono, direccion: direccionPago, monto
        });

        if (!clientValidation.isValid) {
            console.error(`❌ [${requestId}] Datos del cliente inválidos:`, clientValidation.errors);
            return res.status(400).json({
                success: false,
                message: 'Datos del cliente inválidos',
                errors: clientValidation.errors
            });
        }

        console.log(`✅ [${requestId}] Validaciones completadas`);

        // Obtener conexión para transacciones
        connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        console.log(`💳 [${requestId}] ===== INICIANDO PROCESO WOMPI 3DS =====`);
        console.log(`📊 [${requestId}] Datos para Wompi:`, {
            nombre,
            apellido,
            email,
            telefono,
            monto,
            direccionPago,
            ciudad,
            idPais,
            idRegion,
            codigoPostal,
            numeroTarjeta: numeroTarjeta ? `****-****-****-${numeroTarjeta.slice(-4)}` : 'NO PROPORCIONADO',
            cvv: cvv ? '[OCULTO]' : 'NO PROPORCIONADO',
            mesVencimiento,
            anioVencimiento
        });

        // Crear la transacción con Wompi
        const transactionResult = await wompiService.createTransaction({
            numeroTarjeta,
            cvv,
            mesVencimiento: parseInt(mesVencimiento),
            anioVencimiento: parseInt(anioVencimiento),
            nombre,
            apellido,
            email,
            telefono,
            direccion: direccionPago,
            ciudad,
            idPais,
            idRegion,
            codigoPostal,
            monto
        });

        console.log(`📋 [${requestId}] Resultado de Wompi:`, {
            success: transactionResult.success,
            urlPago: transactionResult.urlPago,
            transactionId: transactionResult.transactionId,
            error: transactionResult.error,
            statusCode: transactionResult.statusCode,
            requestId: transactionResult.requestId
        });

        if (!transactionResult.success) {
            console.error(`❌ [${requestId}] Error en transacción Wompi:`, transactionResult.error);
            
            // Log del error
            logAction(req, 'PAYMENT_ERROR', 'transacciones', 
                `Error al crear transacción: ${transactionResult.error} - Monto: $${monto}`);
            
            return res.status(transactionResult.statusCode || 500).json({
                success: false,
                message: 'Error al procesar el pago',
                error: transactionResult.error,
                requestId: transactionResult.requestId
            });
        }

        console.log(`✅ [${requestId}] Pago procesado exitosamente con Wompi`);
        console.log(`🔗 [${requestId}] URL 3DS generada: ${transactionResult.urlPago}`);

        // Guardar la transacción en la base de datos
        console.log(`💾 [${requestId}] Guardando transacción en base de datos...`);
        const transactionId = await saveTransaction({
            urlPago: transactionResult.urlPago,
            monto: parseFloat(monto),
            email,
            nombre: `${nombre} ${apellido}`,
            telefono,
            direccion: direccionPago,
            descripcion: `Pedido con ${pedidoData.productos.length} productos`,
            pedidoId: null, // Se actualizará después de crear el pedido
            userId: req.user ? req.user.id : null,
            status: 'completed', // Asumimos que el pago fue exitoso
            wompiData: JSON.stringify(transactionResult.data)
        });

        console.log(`✅ [${requestId}] Transacción guardada con ID: ${transactionId}`);

        // Preparar datos del pedido para que incluyan el método de pago
        const pedidoDataCompleto = {
            ...pedidoData,
            metodo_pago: 'tarjeta_credito',
            // Asegurar que el cliente tenga los datos del pago si no están
            cliente: {
                ...pedidoData.cliente,
                nombre: pedidoData.cliente?.nombre || nombre,
                apellido: pedidoData.cliente?.apellido || apellido,
                email: pedidoData.cliente?.email || email,
                telefono: pedidoData.cliente?.telefono || telefono
            }
        };

        console.log(`🛒 [${requestId}] Creando pedido automáticamente...`);

        // Crear el pedido automáticamente en estado 'en proceso'
        const orderResult = await orderController.createOrderFromPayment(pedidoDataCompleto, transactionId);

        if (!orderResult.success) {
            throw new Error('Error al crear el pedido después del pago exitoso');
        }

        console.log(`✅ [${requestId}] Pedido creado exitosamente: ${orderResult.data.codigo_pedido}`);

        // Actualizar la transacción con el ID del pedido
        await connection.query(
            'UPDATE transacciones SET pedido_id = ?, fecha_actualizacion = NOW() WHERE id = ?',
            [orderResult.data.id_pedido, transactionId]
        );

        console.log(`✅ [${requestId}] Transacción vinculada con pedido`);

        // Confirmar toda la transacción
        await connection.commit();

        // Log de éxito completo
        logAction(req, 'PAYMENT_ORDER_SUCCESS', 'transacciones,pedidos', 
            `Pago y pedido creados exitosamente - Transaction: ${transactionId}, Pedido: ${orderResult.data.codigo_pedido}, Monto: $${monto}`);

        console.log(`🎉 [${requestId}] ===== PROCESO COMPLETADO EXITOSAMENTE =====`);

        res.status(201).json({
            success: true,
            message: 'Pago procesado y pedido creado exitosamente',
            data: {
                // Datos del pago
                transactionId,
                urlPago: transactionResult.urlPago,
                monto: parseFloat(monto),
                metodoPago: 'tarjeta_credito',
                
                // Datos del pedido
                pedido: {
                    id: orderResult.data.id_pedido,
                    codigo: orderResult.data.codigo_pedido,
                    estado: orderResult.data.estado, // 'en proceso'
                    total: orderResult.data.total,
                    productos_count: orderResult.data.productos_count
                },
                
                // Información de seguimiento
                processingTime: orderResult.data.processing_time_ms,
                message: 'El pedido ha sido enviado automáticamente a cocina y está en proceso'
            }
        });

    } catch (error) {
        console.error(`❌ [${requestId}] Error en processPaymentAndOrder:`, error);
        
        // Rollback si hay conexión activa
        if (connection) {
            try {
                await connection.rollback();
                console.log(`🔄 [${requestId}] Rollback ejecutado`);
            } catch (rollbackError) {
                console.error(`❌ [${requestId}] Error en rollback:`, rollbackError);
            }
        }
        
        // Log del error
        logAction(req, 'PAYMENT_ORDER_ERROR', 'transacciones,pedidos', 
            `Error en proceso de pago y pedido: ${error.message}`);

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno',
            requestId
        });
        
    } finally {
        if (connection) {
            connection.release();
            console.log(`🔗 [${requestId}] Conexión liberada`);
        }
    }
};

/**
 * Endpoint de debug para analizar el formato de datos del frontend
 */
exports.debugPaymentData = (req, res) => {
    const requestId = `DEBUG-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    console.log(`\n🔍 [${requestId}] ===== DEBUG DATOS DEL FRONTEND =====`);
    console.log(`📋 [${requestId}] Headers:`, req.headers);
    console.log(`📦 [${requestId}] Body completo:`, JSON.stringify(req.body, null, 2));
    console.log(`🔑 [${requestId}] Campos principales:`, Object.keys(req.body));
    
    // Analizar estructura
    const analisis = {
        tieneCliente: !!req.body.cliente,
        tieneTarjeta: !!req.body.tarjeta,
        tieneProductos: !!req.body.productos,
        tienePedidoData: !!req.body.pedidoData,
        formatoDetectado: 'desconocido'
    };
    
    if (req.body.pedidoData) {
        analisis.formatoDetectado = 'formato_nuevo_con_pedidoData';
    } else if (req.body.cliente && req.body.tarjeta && req.body.productos) {
        analisis.formatoDetectado = 'formato_directo_frontend';
    }
    
    console.log(`📊 [${requestId}] Análisis:`, analisis);
    
    if (req.body.productos && Array.isArray(req.body.productos)) {
        console.log(`🛍️ [${requestId}] Productos (${req.body.productos.length}):`);
        req.body.productos.forEach((producto, index) => {
            console.log(`   ${index + 1}. ID: ${producto.id_producto}, Cantidad: ${producto.cantidad}, Precio: $${producto.precio_unitario}`);
        });
        
        const totalCalculado = req.body.productos.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0);
        console.log(`💰 [${requestId}] Total calculado: $${totalCalculado}`);
    }
    
    res.json({
        success: true,
        message: 'Datos recibidos correctamente',
        requestId,
        analisis,
        datosRecibidos: req.body,
        sugerencias: {
            formatoActual: analisis.formatoDetectado,
            endpointRecomendado: analisis.formatoDetectado === 'formato_directo_frontend' 
                ? '/api/payments/process-order (ya adaptado)' 
                : '/api/payments/process-order (formato original)'
        }
    });
};
