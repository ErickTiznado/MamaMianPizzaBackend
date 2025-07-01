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
 * Usa los nombres de columnas exactos de la base de datos actual
 */
async function saveTransaction(transactionData) {
    return new Promise((resolve, reject) => {
        console.log('📊 Datos a guardar en transacción:', transactionData);
        
        // Usar los nombres de columnas exactos de tu base de datos
        const query = `
            INSERT INTO transacciones 
            (url_pago, monto, email_cliente, nombre_cliente, telefono_cliente, direccion_cliente, descripcion, pedido_id, estado, response_wompi, fecha_creacion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const values = [
            transactionData.urlPago,
            transactionData.monto,
            transactionData.email,
            transactionData.nombre,
            transactionData.telefono,
            transactionData.direccion,
            transactionData.descripcion,
            transactionData.pedidoId,
            transactionData.status === 'completed' ? 'completado' : 
            transactionData.status === 'pending' ? 'pendiente' : 
            transactionData.status === 'failed' ? 'fallido' : 'pendiente',
            JSON.stringify(transactionData.wompiData)
        ];

        console.log('🔧 Query SQL:', query);
        console.log('📋 Valores:', values);

        pool.query(query, values, (err, result) => {
            if (err) {
                console.error('❌ Error al guardar transacción:', err);
                reject(err);
            } else {
                console.log('✅ Transacción guardada con ID:', result.insertId);
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
 * Endpoint para manejar la confirmación de pago (desde el redirect de Wompi)
 * URL de ejemplo: /api/payments/confirmation?idTransaccion=xxx&monto=4.00&esReal=True&formaPago=PagoNormal&esAprobada=False&codigoAutorizacion=&mensaje=Fondos+insuficientes&hash=xxx
 */
exports.handlePaymentConfirmation = async (req, res) => {
    const requestId = `CONFIRMATION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let connection;
    
    console.log(`\n[${new Date().toISOString()}] ===== CONFIRMACIÓN DE PAGO WOMPI =====`);
    console.log(`🆔 Request ID: ${requestId}`);
    console.log(`📋 Query params:`, req.query);
    
    try {
        const {
            idTransaccion,
            monto,
            esReal,
            formaPago,
            esAprobada,
            codigoAutorizacion,
            mensaje,
            hash
        } = req.query;
        
        console.log(`💳 [${requestId}] Datos de confirmación:`);
        console.log(`🆔 [${requestId}] ID Transacción: ${idTransaccion}`);
        console.log(`💰 [${requestId}] Monto: $${monto}`);
        console.log(`✅ [${requestId}] Es Aprobada: ${esAprobada}`);
        console.log(`🔧 [${requestId}] Código Autorización: ${codigoAutorizacion || 'N/A'}`);
        console.log(`📝 [${requestId}] Mensaje: ${decodeURIComponent(mensaje || '')}`);
        
        // Buscar la transacción en nuestra base de datos
        console.log(`🔍 [${requestId}] Buscando transacción en base de datos...`);
        
        connection = await pool.getConnection();
        
        const [transactionRows] = await connection.query(
            'SELECT * FROM transacciones WHERE response_wompi LIKE ? OR url_pago LIKE ?',
            [`%${idTransaccion}%`, `%${idTransaccion}%`]
        );
        
        if (transactionRows.length === 0) {
            console.error(`❌ [${requestId}] Transacción no encontrada para ID: ${idTransaccion}`);
            return res.redirect(`https://mamamianpizza.com/pago-error?message=Transaccion+no+encontrada`);
        }
        
        const transaction = transactionRows[0];
        console.log(`✅ [${requestId}] Transacción encontrada: ID ${transaction.id}`);
        
        // Actualizar la transacción con la respuesta de Wompi
        const wompiResponse = {
            idTransaccion,
            monto: parseFloat(monto),
            esReal: esReal === 'True',
            formaPago,
            esAprobada: esAprobada === 'True',
            codigoAutorizacion: codigoAutorizacion || null,
            mensaje: decodeURIComponent(mensaje || ''),
            hash,
            fechaRespuesta: new Date().toISOString()
        };
        
        const nuevoEstado = esAprobada === 'True' ? 'completado' : 'fallido';
        
        console.log(`🔄 [${requestId}] Actualizando estado de transacción a: ${nuevoEstado}`);
        
        await connection.query(
            'UPDATE transacciones SET estado = ?, response_wompi = ?, fecha_actualizacion = NOW() WHERE id = ?',
            [nuevoEstado, JSON.stringify(wompiResponse), transaction.id]
        );
        
        if (esAprobada === 'True') {
            console.log(`🎉 [${requestId}] ===== PAGO APROBADO =====`);
            console.log(`💰 [${requestId}] Monto: $${monto}`);
            console.log(`🔐 [${requestId}] Código autorización: ${codigoAutorizacion}`);
            
            // AQUÍ ES DONDE CREAMOS EL PEDIDO
            console.log(`🛒 [${requestId}] Creando pedido automáticamente...`);
            
            // Recuperar los datos del pedido guardados en la descripción
            let pedidoData;
            try {
                const descripcion = transaction.descripcion || '';
                if (descripcion.includes('Datos del pedido:')) {
                    const jsonStr = descripcion.split('Datos del pedido:')[1].trim();
                    pedidoData = JSON.parse(jsonStr);
                    console.log(`📋 [${requestId}] Datos del pedido recuperados exitosamente`);
                } else {
                    throw new Error('Datos del pedido no encontrados en la transacción');
                }
            } catch (error) {
                console.error(`❌ [${requestId}] Error al recuperar datos del pedido:`, error.message);
                return res.redirect(`https://mamamianpizza.com/pago-error?message=Error+al+procesar+pedido`);
            }
            
            // Crear el pedido usando el orderController
            const orderController = require('./orderController');
            const orderResult = await orderController.createOrderFromPayment(pedidoData, transaction.id);
            
            if (orderResult.success) {
                console.log(`✅ [${requestId}] Pedido creado exitosamente: ${orderResult.data.codigo_pedido}`);
                
                // Actualizar la transacción con el ID del pedido
                await connection.query(
                    'UPDATE transacciones SET pedido_id = ? WHERE id = ?',
                    [orderResult.data.id_pedido, transaction.id]
                );
                
                // Log de éxito completo
                logAction({ user: null }, 'PAYMENT_CONFIRMED_SUCCESS', 'transacciones,pedidos', 
                    `Pago confirmado y pedido creado - Transaction: ${transaction.id}, Pedido: ${orderResult.data.codigo_pedido}, Monto: $${monto}`);
                
                console.log(`🎉 [${requestId}] ===== PROCESO COMPLETADO EXITOSAMENTE =====`);
                
                // Redirigir a página de éxito con información del pedido
                return res.redirect(`https://mamamianpizza.com/pago-exitoso?transaction=${transaction.id}&pedido=${orderResult.data.codigo_pedido}&monto=${monto}`);
                
            } else {
                console.error(`❌ [${requestId}] Error al crear pedido:`, orderResult.error);
                logAction({ user: null }, 'PAYMENT_CONFIRMED_ORDER_ERROR', 'transacciones', 
                    `Pago confirmado pero error al crear pedido - Transaction: ${transaction.id}, Error: ${orderResult.error}`);
                
                return res.redirect(`https://mamamianpizza.com/pago-error?message=Error+al+crear+pedido`);
            }
            
        } else {
            console.log(`❌ [${requestId}] ===== PAGO RECHAZADO =====`);
            console.log(`💔 [${requestId}] Motivo: ${decodeURIComponent(mensaje || 'Pago no aprobado')}`);
            
            logAction({ user: null }, 'PAYMENT_REJECTED', 'transacciones', 
                `Pago rechazado - Transaction: ${transaction.id}, Motivo: ${mensaje}`);
            
            return res.redirect(`https://mamamianpizza.com/pago-fallido?transaction=${transaction.id}&mensaje=${encodeURIComponent(mensaje || 'Pago no aprobado')}`);
        }
        
    } catch (error) {
        console.error(`❌ [${requestId}] Error en handlePaymentConfirmation:`, error);
        
        logAction({ user: null }, 'PAYMENT_CONFIRMATION_ERROR', 'transacciones', 
            `Error en confirmación de pago: ${error.message}`);
        
        return res.redirect(`https://mamamianpizza.com/pago-error?message=Error+interno`);
        
    } finally {
        if (connection) {
            connection.release();
            console.log(`🔗 [${requestId}] Conexión liberada`);
        }
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
    console.log(`🌐 [${requestId}] Método: ${req.method}`);
    console.log(`🔗 [${requestId}] URL: ${req.originalUrl}`);
    console.log(`📋 [${requestId}] Headers:`, req.headers);
    console.log(`📦 [${requestId}] Body tipo:`, typeof req.body);
    console.log(`� [${requestId}] Body está vacío:`, Object.keys(req.body).length === 0);
    console.log(`�📝 [${requestId}] Body completo:`, JSON.stringify(req.body, null, 2));
    console.log(`✅ [${requestId}] ENDPOINT ALCANZADO CORRECTAMENTE`);
    
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
            
            // Verificar si el usuario está registrado
            console.log(`🔍 [${requestId}] Verificando tipo de usuario...`);
            
            let tipoCliente = 'invitado';
            let idUsuario = null;
            
            // 1. Verificar si viene un id_usuario en los datos
            if (req.body.id_usuario || req.body.cliente.id_usuario) {
                idUsuario = req.body.id_usuario || req.body.cliente.id_usuario;
                tipoCliente = 'registrado';
                console.log(`👤 [${requestId}] Usuario registrado detectado por ID: ${idUsuario}`);
            } 
            // 2. Si no viene ID, buscar por email en la base de datos
            else if (req.body.cliente.email) {
                console.log(`🔍 [${requestId}] Buscando usuario por email: ${req.body.cliente.email}`);
                
                try {
                    // Buscar usuario registrado por email
                    const userCheckQuery = 'SELECT id_usuario, nombre, apellido FROM usuarios WHERE correo = ? AND activo = 1';
                    const [userResult] = await new Promise((resolve, reject) => {
                        pool.query(userCheckQuery, [req.body.cliente.email], (err, result) => {
                            if (err) reject(err);
                            else resolve([result]);
                        });
                    });
                    
                    if (userResult && userResult.length > 0) {
                        idUsuario = userResult[0].id_usuario;
                        tipoCliente = 'registrado';
                        console.log(`✅ [${requestId}] Usuario registrado encontrado: ID ${idUsuario} - ${userResult[0].nombre} ${userResult[0].apellido}`);
                    } else {
                        console.log(`❌ [${requestId}] Usuario no encontrado en base de datos, será tratado como invitado`);
                    }
                } catch (error) {
                    console.error(`⚠️ [${requestId}] Error al buscar usuario, continuando como invitado:`, error.message);
                }
            }
            
            console.log(`📋 [${requestId}] Tipo de cliente determinado: ${tipoCliente}${idUsuario ? ` (ID: ${idUsuario})` : ''}`);
            
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
                    tipo_cliente: tipoCliente,
                    cliente: {
                        id_usuario: idUsuario, // Agregar ID si existe
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

        // Guardar datos del pedido en la transacción para procesarlos después de la confirmación
        const pedidoDataCompleto = {
            ...pedidoData,
            metodo_pago: 'tarjeta_credito',
            cliente: {
                ...pedidoData.cliente,
                nombre: pedidoData.cliente?.nombre || nombre,
                apellido: pedidoData.cliente?.apellido || apellido,
                email: pedidoData.cliente?.email || email,
                telefono: pedidoData.cliente?.telefono || telefono
            }
        };

        console.log(`� [${requestId}] Datos del pedido guardados en transacción, se procesarán después de la confirmación de pago`);
        console.log(`🔗 [${requestId}] Cliente debe completar el pago en: ${transactionResult.urlPago}`);
        console.log(`↩️  [${requestId}] Después del pago, Wompi redirigirá a: ${process.env.WOMPI_REDIRECT_URL}`);

        // IMPORTANTE: NO crear el pedido aquí, solo guardamos los datos
        // El pedido se creará en el endpoint /confirmacion cuando el pago sea exitoso
        
        console.log(`✅ [${requestId}] Transacción preparada exitosamente`);
        console.log(`🎯 [${requestId}] Estado: Esperando confirmación de pago`);

        // Guardar datos del pedido en una descripción más compacta (antes del commit)
        const descripcionCompacta = `Pedido: ${pedidoData.productos.length} productos, Total: $${pedidoData.total}, Cliente: ${nombre} ${apellido}`;
        
        console.log(`💾 [${requestId}] Actualizando descripción de transacción...`);
        try {
            await connection.query(
                'UPDATE transacciones SET descripcion = ? WHERE id = ?',
                [descripcionCompacta, transactionId]
            );
            console.log(`✅ [${requestId}] Descripción actualizada exitosamente`);
        } catch (updateError) {
            console.error(`⚠️ [${requestId}] Error al actualizar descripción (no crítico):`, updateError.message);
            // No fallar por esto, continuar con el proceso
        }

        // Guardar datos completos del pedido en tabla separada (más seguro)
        console.log(`💾 [${requestId}] Guardando datos completos del pedido en tabla temporal...`);
        try {
            await connection.query(
                'INSERT INTO datos_pedido_temporal (transaction_id, datos_pedido) VALUES (?, ?)',
                [transactionId, JSON.stringify(pedidoDataCompleto)]
            );
            console.log(`✅ [${requestId}] Datos del pedido guardados en tabla temporal`);
        } catch (tempDataError) {
            console.error(`⚠️ [${requestId}] Error al guardar datos temporales:`, tempDataError.message);
            // Continuar sin fallar, los datos están en la transacción básica
        }

        // Confirmar la transacción
        await connection.commit();
        console.log(`✅ [${requestId}] Transaction committed exitosamente`);

        // Log de éxito de preparación
        logAction(req, 'PAYMENT_PREPARED_SUCCESS', 'transacciones', 
            `Pago preparado exitosamente - Transaction: ${transactionId}, Monto: $${monto}, URL: ${transactionResult.urlPago}`);

        console.log(`🎉 [${requestId}] ===== TRANSACCIÓN PREPARADA EXITOSAMENTE =====`);
        console.log(`🔗 [${requestId}] Cliente debe completar el pago en Wompi`);

        // Preparar la respuesta para el frontend
        const responseData = {
            success: true,
            message: 'Transacción de pago creada exitosamente. Redirige al usuario a la URL de pago.',
            data: {
                // Datos del pago
                transactionId,
                urlPago: transactionResult.urlPago,
                monto: parseFloat(monto),
                metodoPago: 'tarjeta_credito',
                
                // Información para el frontend
                instructions: {
                    message: 'Redirige al usuario a la URL de pago para completar la transacción 3DS',
                    redirectUrl: transactionResult.urlPago,
                    returnUrl: process.env.WOMPI_REDIRECT_URL || 'https://mamamianpizza.com/confirmacion'
                },
                
                // El pedido se creará DESPUÉS de la confirmación de pago
                pedidoStatus: 'PENDIENTE_CONFIRMACION_PAGO'
            }
        };

        // LOG DETALLADO PARA EL FRONTEND
        console.log(`📋 [${requestId}] ===== RESPUESTA PARA EL FRONTEND =====`);
        console.log(`📦 [${requestId}] Status Code: 201`);
        console.log(`📦 [${requestId}] Content-Type: application/json`);
        console.log(`📦 [${requestId}] Response Body:`);
        console.log(JSON.stringify(responseData, null, 2));
        console.log(`📋 [${requestId}] ===== DATOS CLAVE PARA EL FRONTEND =====`);
        console.log(`✅ [${requestId}] success: ${responseData.success}`);
        console.log(`🔗 [${requestId}] urlPago: ${responseData.data.urlPago}`);
        console.log(`💰 [${requestId}] monto: ${responseData.data.monto}`);
        console.log(`🆔 [${requestId}] transactionId: ${responseData.data.transactionId}`);
        console.log(`🔄 [${requestId}] redirectUrl: ${responseData.data.instructions.redirectUrl}`);
        console.log(`↩️  [${requestId}] returnUrl: ${responseData.data.instructions.returnUrl}`);
        console.log(`📊 [${requestId}] pedidoStatus: ${responseData.data.pedidoStatus}`);
        console.log(`📋 [${requestId}] ===== FIN RESPUESTA FRONTEND =====`);

        res.status(201).json(responseData);

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

        // Preparar respuesta de error para el frontend
        const errorResponse = {
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno',
            requestId
        };

        // LOG DETALLADO DEL ERROR PARA EL FRONTEND
        console.log(`📋 [${requestId}] ===== RESPUESTA DE ERROR PARA EL FRONTEND =====`);
        console.log(`📦 [${requestId}] Status Code: 500`);
        console.log(`📦 [${requestId}] Content-Type: application/json`);
        console.log(`📦 [${requestId}] Error Response Body:`);
        console.log(JSON.stringify(errorResponse, null, 2));
        console.log(`📋 [${requestId}] ===== DATOS CLAVE DEL ERROR =====`);
        console.log(`❌ [${requestId}] success: ${errorResponse.success}`);
        console.log(`💬 [${requestId}] message: ${errorResponse.message}`);
        console.log(`🔍 [${requestId}] error: ${errorResponse.error}`);
        console.log(`🆔 [${requestId}] requestId: ${errorResponse.requestId}`);
        console.log(`📋 [${requestId}] ===== FIN RESPUESTA ERROR FRONTEND =====`);

        res.status(500).json(errorResponse);
        
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
