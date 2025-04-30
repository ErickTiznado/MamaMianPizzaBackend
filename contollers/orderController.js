const pool = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Helper function to generate a unique order code
const generateOrderCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 8;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// Helper function to generate a numeric product ID that's safe for INT columns
const generateProductId = (originalId) => {
    // Si ya tenemos un ID que es un número dentro del rango seguro, lo usamos
    if (originalId && typeof originalId === 'number' && originalId > 0 && originalId <= 2147483647) {
        return originalId;
    }
    
    // Si es un string o un número fuera de rango, generamos uno nuevo basado en hash
    let hash;
    if (originalId) {
        // Generamos un hash basado en el ID original (timestamp u otro valor)
        const idString = String(originalId);
        hash = crypto.createHash('md5').update(idString).digest('hex');
    } else {
        // Generamos un ID completamente aleatorio
        hash = crypto.randomBytes(16).toString('hex');
    }
    
    // Convertimos los primeros 8 caracteres del hash a un número en base 16 (hexadecimal)
    // y nos aseguramos que esté dentro del rango seguro para INT (menor a 2,147,483,647)
    const numericId = parseInt(hash.substring(0, 8), 16) % 2147483647;
    return numericId > 0 ? numericId : 1; // Asegurar que sea positivo
};

// Function to create a new order
exports.createOrder = async (req, res) => {
    // Start a transaction
    let connection;
    try {
        connection = await pool.promise().getConnection();
        await connection.beginTransaction();
        
        const {
            tipo_cliente,
            cliente,
            direccion,
            metodo_pago,
            productos,
            subtotal,
            costo_envio,
            impuestos,
            total,
            aceptado_terminos,
            tiempo_estimado_entrega
        } = req.body;

        // Validate required fields
        if (!tipo_cliente || !cliente || !direccion || !metodo_pago || !productos || !total) {
            return res.status(400).json({ message: 'Faltan datos requeridos para el pedido' });
        }

        if (!Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({ message: 'El pedido debe contener al menos un producto' });
        }

        // Validar estructura de cada producto
        for (const producto of productos) {
            if (!producto.nombre_producto || !producto.cantidad || !producto.precio_unitario) {
                return res.status(400).json({ 
                    message: 'Datos de producto incompletos', 
                    detalle: 'Cada producto debe incluir nombre_producto, cantidad y precio_unitario' 
                });
            }
        }

        // Generate unique order code
        const codigo_pedido = generateOrderCode();

        let id_usuario = null;
        let id_usuario_invitado = null;
        let id_direccion = null;

        // Handle user data based on client type
        if (tipo_cliente === 'registrado') {
            // Authenticate user
            const [users] = await connection.query(
                'SELECT * FROM usuarios WHERE correo = ?', 
                [cliente.email]
            );
            
            if (users.length === 0) {
                return res.status(401).json({ message: 'Usuario no encontrado' });
            }

            const user = users[0];
            const isMatch = await bcrypt.compare(cliente.password, user.contrasena);
            
            if (!isMatch) {
                return res.status(401).json({ message: 'Credenciales inválidas' });
            }

            id_usuario = user.id_usuario;
            
            // Create or update address
            if (direccion.tipo_direccion === 'formulario') {
                const [addressResult] = await connection.query(
                    'INSERT INTO direcciones (id_usuario, direccion, tipo_direccion, pais, departamento, municipio) VALUES (?, ?, ?, ?, ?, ?)',
                    [id_usuario, direccion.direccion, 'formulario', direccion.pais, direccion.departamento, direccion.municipio]
                );
                id_direccion = addressResult.insertId;
            } else {
                const [addressResult] = await connection.query(
                    'INSERT INTO direcciones (id_usuario, tipo_direccion, latitud, longitud, precision_ubicacion, direccion_formateada) VALUES (?, ?, ?, ?, ?, ?)',
                    [id_usuario, 'tiempo_real', direccion.latitud, direccion.longitud, direccion.precision_ubicacion, direccion.direccion_formateada]
                );
                id_direccion = addressResult.insertId;
            }
        } else {
            // Para clientes invitados, guardamos en la tabla usuarios_invitados
            // Verificamos si ya existe un usuario invitado con ese número celular
            const [existingGuests] = await connection.query(
                'SELECT * FROM usuarios_invitados WHERE celular = ?',
                [cliente.telefono]
            );
            
            if (existingGuests.length > 0) {
                // Si ya existe, usamos ese ID
                id_usuario_invitado = existingGuests[0].id_usuario_invitado;
                
                // Actualizamos el registro para actualizar el timestamp de último pedido
                await connection.query(
                    'UPDATE usuarios_invitados SET ultimo_pedido = CURRENT_TIMESTAMP WHERE id_usuario_invitado = ?',
                    [id_usuario_invitado]
                );
            } else {
                // Si no existe, creamos un nuevo usuario invitado
                const [guestResult] = await connection.query(
                    'INSERT INTO usuarios_invitados (nombre, apellido, celular) VALUES (?, ?, ?)',
                    [cliente.nombre, cliente.apellido || '', cliente.telefono]
                );
                
                id_usuario_invitado = guestResult.insertId;
            }

            // Para resolver el problema con el id_usuario null, primero necesitamos 
            // crear un usuario básico que tenga id_usuario para asociarlo a las direcciones
            const [guestUserResult] = await connection.query(
                'INSERT INTO usuarios (nombre, correo, contrasena, celular) VALUES (?, ?, ?, ?)',
                [cliente.nombre, cliente.email || `invitado_${Date.now()}@mamamianpizza.com`, bcrypt.hashSync(Math.random().toString(36).substring(2), 5), cliente.telefono]
            );
            id_usuario = guestUserResult.insertId;

            // Creamos la dirección asociada al usuario
            if (direccion.tipo_direccion === 'formulario') {
                const [addressResult] = await connection.query(
                    'INSERT INTO direcciones (id_usuario, direccion, tipo_direccion, pais, departamento, municipio) VALUES (?, ?, ?, ?, ?, ?)',
                    [id_usuario, direccion.direccion, 'formulario', direccion.pais, direccion.departamento, direccion.municipio]
                );
                id_direccion = addressResult.insertId;
            } else {
                const [addressResult] = await connection.query(
                    'INSERT INTO direcciones (id_usuario, direccion, tipo_direccion, latitud, longitud, precision_ubicacion, direccion_formateada) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [id_usuario, direccion.direccion_formateada || 'Ubicación en tiempo real', 'tiempo_real', direccion.latitud, direccion.longitud, direccion.precision_ubicacion, direccion.direccion_formateada]
                );
                id_direccion = addressResult.insertId;
            }
        }

        // Create new order
        const [orderResult] = await connection.query(
            `INSERT INTO pedidos (
                codigo_pedido, id_usuario, id_usuario_invitado, id_direccion, estado, total, tipo_cliente, 
                metodo_pago, nombre_cliente, apellido_cliente, telefono, email, 
                num_tarjeta_masked, nombre_tarjeta, subtotal, costo_envio, impuestos, 
                aceptado_terminos, tiempo_estimado_entrega
            ) VALUES (?, ?, ?, ?, 'pendiente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

            [
                codigo_pedido, id_usuario, id_usuario_invitado, id_direccion, total, tipo_cliente, 
                metodo_pago, cliente.nombre, cliente.apellido, cliente.telefono, cliente.email || null, 
                metodo_pago === 'tarjeta' ? req.body.num_tarjeta_masked : null, 
                metodo_pago === 'tarjeta' ? req.body.nombre_tarjeta : null, 
                subtotal, costo_envio, impuestos, aceptado_terminos ? 1 : 0, tiempo_estimado_entrega
            ]
        );

        const id_pedido = orderResult.insertId;
        console.log(`Pedido creado con ID: ${id_pedido}, Código: ${codigo_pedido}`);
        
        // Array para almacenar los detalles insertados correctamente
        const detallesInsertados = [];
        const erroresDetalles = [];

        // Add order details
        for (const producto of productos) {
            try {
                // Generar un ID seguro para la base de datos si viene uno del frontend
                const id_producto_original = producto.id_producto ? generateProductId(producto.id_producto) : null;
                
                // Primero buscamos si el producto existe
                let id_producto_a_usar = null;
                
                // Buscamos primero por título del producto para mayor precisión
                const [productosByName] = await connection.query(
                    'SELECT id_producto FROM productos WHERE titulo = ?',
                    [producto.nombre_producto]
                );
                
                if (productosByName.length > 0) {
                    // Si encontramos el producto por nombre, usamos ese ID
                    id_producto_a_usar = productosByName[0].id_producto;
                    console.log(`Producto encontrado por título: ${producto.nombre_producto}, ID: ${id_producto_a_usar}`);
                } else if (id_producto_original) {
                    // Si no encontramos por nombre pero tenemos un ID original, verificamos si existe
                    const [productsById] = await connection.query(
                        'SELECT id_producto FROM productos WHERE id_producto = ?',
                        [id_producto_original]
                    );
                    
                    if (productsById.length > 0) {
                        id_producto_a_usar = id_producto_original;
                        console.log(`Producto encontrado por ID: ${id_producto_a_usar}`);
                    }
                }
                
                if (!id_producto_a_usar) {
                    // El producto no existe en la base de datos.
                    console.log(`El producto ${producto.nombre_producto} no existe en la BD. Creando nuevo producto.`);
                    
                    // Insertamos un producto básico en la tabla productos
                    const [newProductResult] = await connection.query(
                        'INSERT INTO productos (titulo, precio, descripcion) VALUES (?, ?, ?)',
                        [producto.nombre_producto, producto.precio_unitario, 'Producto agregado desde pedido']
                    );
                    
                    id_producto_a_usar = newProductResult.insertId;
                    console.log(`Nuevo producto creado con ID: ${id_producto_a_usar}`);
                }
                
                // Calculamos el subtotal si no viene
                const subtotalProducto = producto.subtotal || (producto.cantidad * producto.precio_unitario);
                
                // Insertamos el detalle del pedido con el ID de producto adecuado
                const detalleSql = `INSERT INTO detalle_pedidos (
                    id_pedido, id_producto, nombre_producto, cantidad, precio_unitario,
                    masa, tamano, instrucciones_especiales, subtotal
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                
                const detalleParams = [
                    id_pedido, id_producto_a_usar, producto.nombre_producto,
                    producto.cantidad, producto.precio_unitario, producto.masa || null,
                    producto.tamano || null, producto.instrucciones_especiales || null,
                    subtotalProducto
                ];
                
                console.log(`Insertando detalle: ${JSON.stringify({
                    sql: detalleSql,
                    params: detalleParams
                })}`);
                
                const [detailResult] = await connection.query(detalleSql, detalleParams);
                
                // Guardamos el ID del detalle insertado
                detallesInsertados.push({
                    id_detalle: detailResult.insertId,
                    nombre_producto: producto.nombre_producto,
                    cantidad: producto.cantidad,
                    precio_unitario: producto.precio_unitario,
                    subtotal: subtotalProducto
                });
                
                console.log(`Detalle de pedido insertado con ID: ${detailResult.insertId}`);
            } catch (detailError) {
                console.error(`Error al procesar detalle del pedido para producto ${producto.nombre_producto}:`, detailError);
                console.error('Datos del producto con error:', JSON.stringify(producto));
                
                // Añadir a la lista de errores
                erroresDetalles.push({
                    producto: producto.nombre_producto,
                    error: detailError.message
                });
            }
        }
        
        // Verificar si hay algún detalle insertado
        if (detallesInsertados.length === 0) {
            // Si no se pudo insertar ningún detalle, hacemos rollback y devolvemos error
            await connection.rollback();
            return res.status(500).json({ 
                message: 'No se pudo crear ningún detalle del pedido',
                errores: erroresDetalles
            });
        }
        
        // Verificamos que los detalles fueron guardados
        const [verificacionDetalles] = await connection.query(
            'SELECT COUNT(*) as count FROM detalle_pedidos WHERE id_pedido = ?',
            [id_pedido]
        );
        
        console.log(`Detalles verificados: ${verificacionDetalles[0].count} de ${productos.length} productos`);
        
        // Commit the transaction
        await connection.commit();

        // Send success response
        res.status(201).json({
            message: 'Pedido creado exitosamente',
            id_pedido: id_pedido,
            codigo_pedido: codigo_pedido,
            productos_registrados: detallesInsertados.length,
            total_productos: productos.length,
            detalles: detallesInsertados,
            errores: erroresDetalles.length > 0 ? erroresDetalles : undefined
        });

    } catch (error) {
        // Rollback transaction in case of error
        if (connection) {
            await connection.rollback();
        }
        console.error('Error al crear el pedido:', error);
        res.status(500).json({ message: 'Error al procesar el pedido', error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Function to get all orders
exports.getAllOrders = async (req, res) => {
    try {
        // Obtener todos los pedidos con sus detalles y datos de cliente
        const [orders] = await pool.promise().query(`
            SELECT 
                p.*,
                u.nombre AS nombre_usuario,
                ui.nombre AS nombre_invitado,
                ui.apellido AS apellido_invitado,
                ui.celular AS celular_invitado,
                d.direccion,
                d.latitud,
                d.longitud,
                d.direccion_formateada
            FROM 
                pedidos p
            LEFT JOIN 
                usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN 
                usuarios_invitados ui ON p.id_usuario_invitado = ui.id_usuario_invitado
            LEFT JOIN 
                direcciones d ON p.id_direccion = d.id_direccion
            ORDER BY 
                p.fecha_pedido DESC
        `);

        // Para cada pedido, obtener sus detalles de productos
        for (const order of orders) {
            const [detalles] = await pool.promise().query(`
                SELECT 
                    dp.*,
                    pr.titulo AS nombre_producto_original,
                    pr.descripcion
                FROM 
                    detalle_pedidos dp
                LEFT JOIN
                    productos pr ON dp.id_producto = pr.id_producto
                WHERE 
                    dp.id_pedido = ?
            `, [order.id_pedido]);
            
            order.detalles = detalles;
        }

        res.json(orders);
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
    }
};

// Function to get orders by status
exports.getOrdersByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        
        // Validar que el estado proporcionado sea válido
        const estadosValidos = ['pendiente', 'en_proceso', 'entregado', 'cancelado'];
        if (!estadosValidos.includes(status)) {
            return res.status(400).json({ message: 'Estado de pedido no válido' });
        }
        
        // Obtener pedidos filtrados por estado
        const [orders] = await pool.promise().query(`
            SELECT 
                p.*,
                u.nombre AS nombre_usuario,
                ui.nombre AS nombre_invitado,
                ui.apellido AS apellido_invitado,
                ui.celular AS celular_invitado,
                d.direccion,
                d.latitud,
                d.longitud,
                d.direccion_formateada
            FROM 
                pedidos p
            LEFT JOIN 
                usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN 
                usuarios_invitados ui ON p.id_usuario_invitado = ui.id_usuario_invitado
            LEFT JOIN 
                direcciones d ON p.id_direccion = d.id_direccion
            WHERE 
                p.estado = ?
            ORDER BY 
                p.fecha_pedido DESC
        `, [status]);

        // Para cada pedido, obtener sus detalles de productos
        for (const order of orders) {
            const [detalles] = await pool.promise().query(`
                SELECT 
                    dp.*,
                    pr.titulo AS nombre_producto_original,
                    pr.descripcion
                FROM 
                    detalle_pedidos dp
                LEFT JOIN
                    productos pr ON dp.id_producto = pr.id_producto
                WHERE 
                    dp.id_pedido = ?
            `, [order.id_pedido]);
            
            order.detalles = detalles;
        }

        res.json(orders);
    } catch (error) {
        console.error(`Error al obtener los pedidos con estado ${req.params.status}:`, error);
        res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
    }
};

// Function to get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`Buscando pedido con ID: ${id}`);
        
        // Obtener los detalles del pedido específico
        const [orders] = await pool.promise().query(`
            SELECT 
                p.*,
                u.nombre AS nombre_usuario,
                ui.nombre AS nombre_invitado,
                ui.apellido AS apellido_invitado,
                ui.celular AS celular_invitado,
                d.direccion,
                d.latitud,
                d.longitud,
                d.direccion_formateada
            FROM 
                pedidos p
            LEFT JOIN 
                usuarios u ON p.id_usuario = u.id_usuario
            LEFT JOIN 
                usuarios_invitados ui ON p.id_usuario_invitado = ui.id_usuario_invitado
            LEFT JOIN 
                direcciones d ON p.id_direccion = d.id_direccion
            WHERE 
                p.id_pedido = ?
        `, [id]);
        
        if (orders.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        
        const order = orders[0];
        console.log(`Pedido encontrado: ${order.codigo_pedido}`);
        
        // Verificamos primero si existen detalles para este pedido
        const [checkDetalles] = await pool.promise().query(`
            SELECT COUNT(*) as count FROM detalle_pedidos WHERE id_pedido = ?
        `, [id]);
        
        console.log(`Número de detalles encontrados: ${checkDetalles[0].count}`);
        
        // Si no hay detalles, realizamos la inserción manual para debug
        if (checkDetalles[0].count === 0) {
            console.log(`No se encontraron detalles para el pedido ${id}. Puede ser necesario verificar la tabla detalle_pedidos.`);
        }
        
        // Obtener los detalles de productos del pedido
        const detallesQuery = `
            SELECT 
                dp.*,
                pr.titulo AS nombre_producto_original,
                pr.descripcion
            FROM 
                detalle_pedidos dp
            LEFT JOIN
                productos pr ON dp.id_producto = pr.id_producto
            WHERE 
                dp.id_pedido = ?
        `;
        console.log(`Ejecutando consulta de detalles: ${detallesQuery.replace(/\s+/g, ' ')} con ID: ${id}`);
        
        const [detalles] = await pool.promise().query(detallesQuery, [id]);
        console.log(`Detalles recuperados: ${detalles.length}`);
        
        order.detalles = detalles;
        
        res.json(order);
    } catch (error) {
        console.error(`Error al obtener el pedido con ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error al obtener el pedido', error: error.message });
    }
};

// Function to update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        
        // Validar que el estado proporcionado sea válido
        const estadosValidos = ['pendiente', 'en_proceso', 'entregado', 'cancelado'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ message: 'Estado de pedido no válido' });
        }
        
        // Actualizar el estado del pedido
        const [result] = await pool.promise().query(
            'UPDATE pedidos SET estado = ? WHERE id_pedido = ?',
            [estado, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        
        res.json({ 
            message: 'Estado del pedido actualizado correctamente',
            id_pedido: id,
            nuevo_estado: estado
        });
    } catch (error) {
        console.error(`Error al actualizar el estado del pedido con ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error al actualizar el estado del pedido', error: error.message });
    }
};

// Function to check and repair orders without details
exports.checkOrderDetails = async (req, res) => {
    let connection;
    try {
        connection = await pool.promise().getConnection();
        await connection.beginTransaction();
        
        const { id_pedido } = req.params;
        const { productos } = req.body;
        
        // Verificar si existen detalles para este pedido
        const [checkDetalles] = await connection.query(
            'SELECT COUNT(*) as count FROM detalle_pedidos WHERE id_pedido = ?',
            [id_pedido]
        );

        if (checkDetalles[0].count > 0) {
            // Si ya existen detalles, informamos que todo está bien
            await connection.commit();
            return res.status(200).json({
                message: 'El pedido ya tiene detalles registrados',
                detalles_count: checkDetalles[0].count
            });
        }

        // Si no hay productos en la solicitud, devolvemos error
        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                message: 'Se requieren productos para reparar el pedido',
                error: 'El array de productos está vacío o no fue proporcionado'
            });
        }

        // Array para almacenar los detalles insertados
        const detallesInsertados = [];

        // Insertar los detalles del pedido
        for (const producto of productos) {
            try {
                if (!producto.nombre_producto || !producto.cantidad || !producto.precio_unitario) {
                    console.error('Datos de producto incompletos:', producto);
                    continue;
                }

                // Buscar si el producto existe por título
                const [productosByName] = await connection.query(
                    'SELECT id_producto FROM productos WHERE titulo = ?',
                    [producto.nombre_producto]
                );

                let id_producto_a_usar = null;

                if (productosByName.length > 0) {
                    id_producto_a_usar = productosByName[0].id_producto;
                    console.log(`Producto encontrado: ${producto.nombre_producto}, ID: ${id_producto_a_usar}`);
                } else {
                    // Crear producto si no existe
                    const [newProductResult] = await connection.query(
                        'INSERT INTO productos (titulo, precio, descripcion) VALUES (?, ?, ?)',
                        [producto.nombre_producto, producto.precio_unitario, 'Producto añadido desde reparación de pedido']
                    );
                    
                    id_producto_a_usar = newProductResult.insertId;
                    console.log(`Nuevo producto creado: ${producto.nombre_producto}, ID: ${id_producto_a_usar}`);
                }
                
                // Calcular subtotal si no viene en la petición
                const subtotal = producto.subtotal || (producto.cantidad * producto.precio_unitario);
                
                // Insertar detalle del pedido
                const [detailResult] = await connection.query(
                    `INSERT INTO detalle_pedidos (
                        id_pedido, id_producto, nombre_producto, cantidad, precio_unitario,
                        masa, tamano, instrucciones_especiales, subtotal
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        id_pedido, id_producto_a_usar, producto.nombre_producto,
                        producto.cantidad, producto.precio_unitario, producto.masa || null,
                        producto.tamano || null, producto.instrucciones_especiales || null,
                        subtotal
                    ]
                );
                
                detallesInsertados.push({
                    id_detalle: detailResult.insertId,
                    nombre_producto: producto.nombre_producto,
                    cantidad: producto.cantidad,
                    precio_unitario: producto.precio_unitario,
                    subtotal
                });
                
                console.log(`Detalle insertado para pedido ${id_pedido}, producto ${producto.nombre_producto}`);
            } catch (error) {
                console.error(`Error al procesar producto ${producto.nombre_producto}:`, error);
            }
        }
        
        // Verificar si se insertaron detalles
        if (detallesInsertados.length === 0) {
            await connection.rollback();
            return res.status(500).json({
                message: 'No se pudo reparar el pedido',
                error: 'No se pudo insertar ningún detalle'
            });
        }
        
        // Confirmar la transacción
        await connection.commit();
        
        return res.status(200).json({
            message: 'Pedido reparado exitosamente',
            detalles_insertados: detallesInsertados.length,
            detalles: detallesInsertados
        });
        
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error al reparar el pedido:', error);
        return res.status(500).json({
            message: 'Error al reparar el pedido',
            error: error.message
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};