const pool = require('../config/db');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const actualDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

// Server base URL
const SERVER_BASE_URL = 'https://api.mamamianpizza.com';

// Helper function to extract user ID from request (with authentication)
const getUserId = (req) => {
    // Para administradores autenticados con JWT
    if (req.admin && req.admin.id) {
        return req.admin.id;
    }
    
    // Para usuarios regulares (cuando implementes su autenticación)
    if (req.user && req.user.id) {
        return req.user.id;
    }
    
    // Si no hay autenticación, devolver null
    return null;
};

// Helper function to get user info for logging
const getUserInfo = (req) => {
    if (req.admin) {
        return {
            id: req.admin.id,
            tipo: 'admin',
            nombre: req.admin.nombre,
            email: req.admin.email
        };
    }
    
    if (req.user) {
        return {
            id: req.user.id,
            tipo: 'usuario',
            nombre: req.user.nombre,
            email: req.user.email
        };
    }
    
    return {
        id: null,
        tipo: 'anonimo',
        nombre: 'Usuario no autenticado',
        email: null
    };
};

// Helper function to ensure admin exists in usuarios table for logging
const ensureAdminInUsuarios = async (adminId, adminInfo) => {
    return new Promise((resolve, reject) => {
        // Verificar si el admin ya existe en usuarios
        pool.query(
            'SELECT id_usuario FROM usuarios WHERE id_usuario = ?',
            [adminId],
            (checkErr, checkResults) => {
                if (checkErr) {
                    console.error('Error verificando usuario admin:', checkErr);
                    resolve(false);
                    return;
                }
                
                if (checkResults.length > 0) {
                    // Ya existe, todo bien
                    resolve(true);
                } else {
                    // No existe, necesitamos crearlo
                    console.log(`🔧 Creando usuario equivalente para admin ID ${adminId}...`);
                    
                    pool.query(
                        `INSERT INTO usuarios (id_usuario, nombre, correo, contrasena, tipo_usuario, fecha_registro) 
                         VALUES (?, ?, ?, ?, 'admin', NOW())
                         ON DUPLICATE KEY UPDATE 
                         nombre = VALUES(nombre), 
                         correo = VALUES(correo), 
                         tipo_usuario = 'admin'`,
                        [
                            adminId,
                            adminInfo.nombre || 'Administrador',
                            adminInfo.email || `admin${adminId}@mamamianpizza.com`,
                            '$2b$10$dummy.hash.for.admin.logging.sync'
                        ],
                        (insertErr, insertResults) => {
                            if (insertErr) {
                                console.error('Error creando usuario admin para logs:', insertErr);
                                resolve(false);
                            } else {
                                console.log(`✅ Usuario admin ${adminId} creado exitosamente para logs`);
                                resolve(true);
                            }
                        }
                    );
                }
            }
        );
    });
};

// Helper function to log actions to database with enhanced user info
const logAction = async (req, accion, tabla_afectada, descripcion) => {
    const userInfo = getUserInfo(req);
    const userId = userInfo.id;
    
    // Enriquecer la descripción con información del usuario
    const descripcionCompleta = userInfo.id 
        ? `[${userInfo.tipo.toUpperCase()}] ${userInfo.nombre} (${userInfo.email}): ${descripcion}`
        : `[ANONIMO]: ${descripcion}`;
    
    // Función helper para insertar log sin id_usuario
    const insertLogWithoutUser = () => {
        pool.query(
            'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (NULL, ?, ?, ?)',
            [accion, tabla_afectada, descripcionCompleta],
            (logErr) => {
                if (logErr) {
                    console.error('Error al registrar en logs (sin usuario):', logErr);
                } else {
                    console.log(`📝 Log registrado: ${accion} en ${tabla_afectada} por ${userInfo.nombre || 'Usuario anónimo'} (sin ID de usuario)`);
                }
            }
        );
    };
    
    if (userId) {
        // Si es un admin, asegurar que existe en la tabla usuarios
        if (userInfo.tipo === 'admin') {
            try {
                const adminExists = await ensureAdminInUsuarios(userId, userInfo);
                if (!adminExists) {
                    console.warn(`⚠️ No se pudo sincronizar admin ID ${userId}, insertando log sin referencia`);
                    insertLogWithoutUser();
                    return;
                }
            } catch (syncErr) {
                console.error('Error sincronizando admin para logs:', syncErr);
                insertLogWithoutUser();
                return;
            }
        }
        
        // Intentar insertar log con userId
        pool.query(
            'INSERT INTO logs (id_usuario, accion, tabla_afectada, descripcion) VALUES (?, ?, ?, ?)',
            [userId, accion, tabla_afectada, descripcionCompleta],
            (logErr) => {
                if (logErr) {
                    console.error('Error al registrar en logs:', logErr);
                    // Como fallback, intentar insertar sin id_usuario
                    insertLogWithoutUser();
                } else {
                    console.log(`📝 Log registrado: ${accion} en ${tabla_afectada} por ${userInfo.nombre || 'Usuario'} (ID: ${userId})`);
                }
            }
        );
    } else {
        // No hay userId, insertar sin referencia de usuario
        insertLogWithoutUser();
    }
};

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'));
        }
    }
}).single('imagen');

// Function to get category ID from name
const getCategoryId = (categoryName, callback) => {
    pool.query('SELECT id_categoria FROM categorias WHERE nombre = ?', [categoryName], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        
        if (results.length > 0) {
            console.log('Categoría existente:', results[0].id_categoria);
            callback(null, results[0].id_categoria);
        } else {            // If category doesn't exist, create it
            pool.query('INSERT INTO categorias (nombre) VALUES (?)', [categoryName], (err, result) => {                if (err) {
                    callback(err, null);
                    return;
                }
                console.log('Nueva categoría creada:', result.insertId);
                callback(null, result.insertId);
            });
        }
    });
};

exports.submitContent = (req, res) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Error al subir la imagen: ' + err.message });
    } else if (err) {
      return res.status(500).json({ message: 'Error al subir la imagen: ' + err.message });
    }

    const { titulo, descripcion, categoria, sesion, precios } = req.body;
    // precios debe venir como objeto: { "1": "6.00", "2": "8.00", ... }
    const preciosObj = typeof precios === 'string'
      ? JSON.parse(precios)
      : precios;

    if (!titulo || !descripcion || !sesion || !categoria || !preciosObj) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    // Para nuevos productos, establecer activo=1 por defecto si no se especifica
    const activo = req.body.activo !== undefined 
      ? (req.body.activo === 'true' || req.body.activo === true)
      : true; // Por defecto activo=1 para nuevos productos
    const imagenPath = req.file
      ? `${SERVER_BASE_URL}/uploads/${req.file.filename}`
      : null;

    getCategoryId(categoria, (err, idcategoria) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al procesar la categoría' });
      }

      // 1) Creamos el producto
      pool.query(
        `INSERT INTO productos
           (titulo, descripcion, seccion, id_categoria, activo, imagen, fecha_creacion, fecha_actualizacion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [titulo, descripcion, sesion, idcategoria, activo, imagenPath, actualDate, actualDate],        (err, result) => {          if (err) {
            console.error(err);
            // Log product creation error
            const descripcionLog = `Error al crear producto: "${titulo}" - ${err.message}`;
            logAction(req, 'CREATE_ERROR', 'productos', descripcionLog);
            return res.status(500).json({ message: 'Error al crear el producto' });
          }
          const pizzaId = result.insertId;

          // 2) Insertamos los precios para cada tamaño
          const entries = Object.entries(preciosObj);
          let pendientes = entries.length, fallo = false;

          entries.forEach(([tamanoId, precio]) => {
            pool.query(
              `INSERT INTO precios (pizza_id, tamano_id, precio) VALUES (?, ?, ?)`,
              [pizzaId, tamanoId, parseFloat(precio)],
              err => {                if (err && !fallo) {
                  fallo = true;
                  console.error('Error al insertar precio', err);
                  // Log price insertion error during creation
                  const descripcionLog = `Error al guardar precios del producto: "${titulo}" (ID: ${pizzaId}) - ${err.message}`;
                  logAction(req, 'CREATE_ERROR', 'precios', descripcionLog);
                  return res.status(500).json({ message: 'Error al guardar precios' });
                }
                pendientes--;
                if (pendientes === 0 && !fallo) {
                  // Log successful product creation
                  const descripcionLog = `Producto creado: "${titulo}" (ID: ${pizzaId}) en categoría "${categoria}" con ${entries.length} precios configurados`;
                  logAction(req, 'CREATE', 'productos', descripcionLog);
                  
                  res.status(201).json({
                    message: 'Producto y precios creados exitosamente',
                    id_producto: pizzaId
                  });
                }
              }            );
          });

          // Si no hay tamaños (no debería pasar), devolvemos ya:
          if (entries.length === 0) {
            // Log product creation without prices
            const descripcionLog = `Producto creado sin precios: "${titulo}" (ID: ${pizzaId}) en categoría "${categoria}"`;
            logAction(req, 'CREATE', 'productos', descripcionLog);
            
            res.status(201).json({
              message: 'Producto creado sin precios (ajusta tu formulario)',
              id_producto: pizzaId
            });
          }
        }
      );
    });
  });
};


exports.getLasMasPopulares = (req, res) => {
    pool.query('SELECT * FROM productos WHERE seccion = "Las más populares" AND activo = 1 ORDER BY fecha_creacion DESC LIMIT 3', (err, results) => {        if(err){
            console.error('Error al obtener productos', err);
            // Log error when getting popular products
            const descripcionLog = `Error al consultar productos más populares - ${err.message}`;
            logAction(req, 'READ_ERROR', 'productos', descripcionLog);
            return res.status(500).json({ message: 'Error al obtener productos' });
        }
        // Log successful query
        const descripcionLog = `Productos más populares consultados exitosamente - ${results.length} productos activos encontrados`;
        logAction(req, 'READ', 'productos', descripcionLog);
        
        res.status(200).json({ message: 'Productos obtenidos exitosamente', productos: results });
        console.log('Productos obtenidos exitosamente', results);
    })
}


exports.getRecomendacionDeLacasa = (req, res) => {
    pool.query('SELECT * FROM productos where seccion = "Recomendación de la casa" AND activo = 1 ORDER BY fecha_creacion DESC LIMIT 3', (err, results) => {        if(err){
            console.error('Error al obtener productos', err);
            // Log error when getting house recommendations
            const descripcionLog = `Error al consultar recomendaciones de la casa - ${err.message}`;
            logAction(req, 'READ_ERROR', 'productos', descripcionLog);
            return res.status(500).json({ message: 'Error al obtener productos' });
        }
        // Log successful query
        const descripcionLog = `Recomendaciones de la casa consultadas exitosamente - ${results.length} productos activos encontrados`;
        logAction(req, 'READ', 'productos', descripcionLog);
        
        res.status(200).json({message: 'Productos obtenidos exitosamente', productos: results });            
    })
    }

exports.getMenu = (req, res) => {
  // Primero obtenemos todos los productos activos
  const productosQuery = `
    SELECT 
      p.id_producto,
      p.titulo,
      p.descripcion,
      p.imagen,
      p.activo,
      p.seccion,
      c.nombre AS categoria,
      c.descripcion AS categoria_descripcion
    FROM productos p
    LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    WHERE p.activo = 1
    ORDER BY p.id_producto
  `;

  pool.query(productosQuery, (err, productos) => {
    if (err) {
      console.error(err);
      // Log menu query error
      const descripcionLog = `Error al consultar el menú - ${err.message}`;
      logAction(req, 'READ_ERROR', 'productos', descripcionLog);
      return res.status(500).json({ message: 'Error al obtener el menú' });
    }

    if (productos.length === 0) {
      const descripcionLog = `Menú consultado exitosamente - 0 productos activos encontrados`;
      logAction(req, 'READ', 'productos', descripcionLog);
      return res.status(200).json({ message: 'Menú cargado', menu: [] });
    }

    // Para cada producto, obtenemos sus precios si los tiene
    const menu = [];
    let productosCompletados = 0;

    productos.forEach((producto) => {
      // Buscar precios para este producto (solo para pizzas)
      const preciosQuery = `
        SELECT 
          t.id_tamano,
          t.nombre AS tamano,
          t.indice AS orden_tamano,
          pr.precio
        FROM precios pr
        JOIN tamanos t ON pr.tamano_id = t.id_tamano
        WHERE pr.pizza_id = ?
        ORDER BY t.indice
      `;

      pool.query(preciosQuery, [producto.id_producto], (err, precios) => {
        if (err) {
          console.error(`Error al obtener precios para producto ${producto.id_producto}:`, err);
          precios = []; // Si hay error, continuar sin precios
        }

        // Crear el objeto del producto para el menú
        const productoMenu = {
          id: producto.id_producto,
          titulo: producto.titulo,
          descripcion: producto.descripcion,
          imagen: producto.imagen,
          activo: producto.activo,
          categoria: producto.categoria,
          categoria_descripcion: producto.categoria_descripcion,
          seccion: producto.seccion,
          opciones: precios.map(precio => ({
            tamanoId: precio.id_tamano,
            nombre: precio.tamano,
            precio: parseFloat(precio.precio)
          }))
        };

        // Si no tiene precios, agregar opciones vacías (para complementos, bebidas, etc.)
        if (precios.length === 0) {
          productoMenu.opciones = [];
        }

        menu.push(productoMenu);
        productosCompletados++;

        // Si ya procesamos todos los productos, enviar respuesta
        if (productosCompletados === productos.length) {
          // Ordenar el menú por ID de producto
          menu.sort((a, b) => a.id - b.id);

          const descripcionLog = `Menú consultado exitosamente - ${productos.length} productos activos encontrados (incluyendo pizzas, complementos y otros productos)`;
          logAction(req, 'READ', 'productos', descripcionLog);

          res.status(200).json({ 
            message: 'Menú cargado', 
            menu: menu,
            estadisticas: {
              total_productos: productos.length,
              productos_con_precios: menu.filter(p => p.opciones.length > 0).length,
              productos_sin_precios: menu.filter(p => p.opciones.length === 0).length
            }
          });
        }
      });
    });
  });
};

    exports.DeleteContent = (req, res) => {
        const { id_producto } = req.params;
        
        // Primero eliminar los precios asociados al producto
        pool.query('DELETE FROM precios WHERE pizza_id = ?', [id_producto], (err, priceResults) => {
            if(err){
                console.error('Error al eliminar precios del producto', err);
                return res.status(500).json({ message: 'Error al eliminar precios del producto' });
            }
              // Después eliminar el producto
            pool.query('DELETE FROM productos WHERE id_producto = ?', [id_producto], (err, productResults) => {
                if(err){
                    console.error('Error al eliminar el producto', err);                    // Log product deletion error
                    const descripcionLog = `Error al eliminar producto (ID: ${id_producto}) - ${err.message}`;
                    logAction(getUserId(req), 'DELETE_ERROR', 'productos', descripcionLog);
                    return res.status(500).json({ message: 'Error al eliminar el producto' });
                }
                  if(productResults.affectedRows === 0){
                    return res.status(404).json({ message: 'Producto no encontrado' });
                }                // Log successful product deletion
                const descripcionLog = `Producto eliminado (ID: ${id_producto}) junto con ${priceResults.affectedRows} precios asociados`;
                logAction(req, 'DELETE', 'productos', descripcionLog);
                
                res.status(200).json({ 
                    message: 'Producto y sus precios eliminados exitosamente',
                    preciosEliminados: priceResults.affectedRows,
                    productosEliminados: productResults.affectedRows                });
            });
        });
    };

// Nuevo endpoint: Obtener TODOS los productos (activos e inactivos) con todos sus campos
exports.getAllProducts = (req, res) => {
    const sql = `
        SELECT 
            p.id_producto,
            p.titulo,
            p.descripcion,
            p.seccion,
            p.activo,
            p.imagen,
            p.fecha_creacion,
            p.fecha_actualizacion,
            c.id_categoria,
            c.nombre AS categoria,
            c.descripcion AS categoria_descripcion
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
        ORDER BY p.fecha_creacion DESC, p.id_producto DESC
    `;

    pool.query(sql, (err, productos) => {
        if (err) {
            console.error('Error al obtener todos los productos:', err);
            const descripcionLog = `Error al consultar todos los productos - ${err.message}`;
            logAction(req, 'READ_ERROR', 'productos', descripcionLog);
            return res.status(500).json({ message: 'Error al obtener todos los productos' });
        }

        // Para cada producto, obtener sus precios si los tiene
        const productosConPrecios = [];
        let productosCompletados = 0;

        if (productos.length === 0) {
            const descripcionLog = `Consulta de todos los productos completada - 0 productos encontrados`;
            logAction(req, 'READ', 'productos', descripcionLog);
            return res.status(200).json({ 
                message: 'Consulta exitosa', 
                productos: [],
                total: 0
            });
        }

        productos.forEach((producto, index) => {
            // Buscar precios para este producto
            const preciosQuery = `
                SELECT 
                    pr.precio,
                    t.id_tamano,
                    t.nombre AS tamano,
                    t.indice AS orden_tamano
                FROM precios pr
                JOIN tamanos t ON pr.tamano_id = t.id_tamano
                WHERE pr.pizza_id = ?
                ORDER BY t.indice
            `;

            pool.query(preciosQuery, [producto.id_producto], (err, precios) => {
                if (err) {
                    console.error(`Error al obtener precios para producto ${producto.id_producto}:`, err);
                    precios = []; // Si hay error, continuar sin precios
                }

                // Agregar precios al producto
                producto.precios = precios.map(precio => ({
                    tamanoId: precio.id_tamano,
                    tamano: precio.tamano,
                    precio: parseFloat(precio.precio),
                    orden: precio.orden_tamano
                }));

                productosConPrecios.push(producto);
                productosCompletados++;

                // Si ya procesamos todos los productos, enviar respuesta
                if (productosCompletados === productos.length) {
                    // Ordenar los productos por el orden original
                    productosConPrecios.sort((a, b) => {
                        // Primero por fecha de creación (más reciente primero)
                        const fechaA = new Date(a.fecha_creacion);
                        const fechaB = new Date(b.fecha_creacion);
                        if (fechaB.getTime() !== fechaA.getTime()) {
                            return fechaB.getTime() - fechaA.getTime();
                        }
                        // Si las fechas son iguales, por ID descendente
                        return b.id_producto - a.id_producto;
                    });

                    const descripcionLog = `Todos los productos consultados exitosamente - ${productos.length} productos encontrados (${productos.filter(p => p.activo).length} activos, ${productos.filter(p => !p.activo).length} inactivos)`;
                    logAction(req, 'READ', 'productos', descripcionLog);

                    res.status(200).json({ 
                        message: 'Todos los productos obtenidos exitosamente', 
                        productos: productosConPrecios,
                        total: productos.length,
                        estadisticas: {
                            total: productos.length,
                            activos: productos.filter(p => p.activo).length,
                            inactivos: productos.filter(p => !p.activo).length,
                            con_precios: productosConPrecios.filter(p => p.precios.length > 0).length,
                            sin_precios: productosConPrecios.filter(p => p.precios.length === 0).length
                        }
                    });
                }
            });
        });
    });
};

    exports.TotalProducts = (req, res) => {
        pool.query('SELECT COUNT(*) as total FROM productos', (err, results) => {            if(err){
                console.error('Error al obtener el total de productos', err);
                // Log error when getting total products
                const descripcionLog = `Error al consultar total de productos - ${err.message}`;
                logAction(req, 'READ_ERROR', 'productos', descripcionLog);
                return res.status(500).json({ message: 'Error al obtener el total de productos' });
            }
              // Log successful query
            const descripcionLog = `Total de productos consultado exitosamente - ${results[0].total} productos encontrados`;
            logAction(req, 'READ', 'productos', descripcionLog);
            
            res.status(200).json({ message: 'Total de productos obtenidos exitosamente', total: results[0].total });
        })
    }

    exports.updateContent = (req, res) => {
  upload(req, res, function(err) {
    if (err) return res.status(400).json({ message: err.message });

    const { id_producto } = req.params;
    const { titulo, descripcion, categoria, sesion, precios } = req.body;
    const preciosObj = typeof precios === 'string'
      ? JSON.parse(precios)
      : precios;

    if (!titulo || !descripcion || !sesion || !categoria || !preciosObj) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    // Solo actualizar 'activo' si se proporciona explícitamente en el body
    let activoValue = null;
    let shouldUpdateActivo = false;
    
    if (req.body.activo !== undefined) {
      activoValue = req.body.activo === 'true' || req.body.activo === true;
      shouldUpdateActivo = true;
    }
    const imagenPath = req.file
      ? `${SERVER_BASE_URL}/uploads/${req.file.filename}`
      : null;
    const actDate = new Date().toISOString().slice(0,19).replace('T',' ');

    getCategoryId(categoria, (err, idcategoria) => {
      if (err) return res.status(500).json({ message: 'Error al procesar la categoría' });

      // 1) Actualizar datos básicos de la pizza
      let updateQuery, updateParams;
      
      if (shouldUpdateActivo) {
        // Actualizar incluyendo el campo activo
        updateQuery = `UPDATE productos SET
           titulo = ?, descripcion = ?, seccion = ?, id_categoria = ?, activo = ?, imagen = COALESCE(?, imagen), fecha_actualizacion = ?
         WHERE id_producto = ?`;
        updateParams = [titulo, descripcion, sesion, idcategoria, activoValue, imagenPath, actDate, id_producto];
      } else {
        // Actualizar sin modificar el campo activo
        updateQuery = `UPDATE productos SET
           titulo = ?, descripcion = ?, seccion = ?, id_categoria = ?, imagen = COALESCE(?, imagen), fecha_actualizacion = ?
         WHERE id_producto = ?`;
        updateParams = [titulo, descripcion, sesion, idcategoria, imagenPath, actDate, id_producto];
      }
      
      pool.query(updateQuery, updateParams,        err => {
          if (err) {
            console.error(err);
            // Log product update error
            const descripcionLog = `Error al actualizar producto: "${titulo}" (ID: ${id_producto}) - ${err.message}`;
            logAction(req, 'UPDATE_ERROR', 'productos', descripcionLog);
            return res.status(500).json({ message: 'Error al actualizar el producto' });
          }

          // 2) Borrar precios antiguos
          pool.query(
            `DELETE FROM precios WHERE pizza_id = ?`,
            [id_producto],
            err => {              if (err) {
                console.error(err);
                // Log price deletion error during update
                const descripcionLog = `Error al limpiar precios antiguos del producto (ID: ${id_producto}) - ${err.message}`;
                logAction(req, 'UPDATE_ERROR', 'precios', descripcionLog);
                return res.status(500).json({ message: 'Error al limpiar precios antiguos' });
              }

              // 3) Insertar precios nuevos
              const entries = Object.entries(preciosObj);
              let pendientes = entries.length, fallo = false;

              entries.forEach(([tamanoId, precio]) => {
                pool.query(
                  `INSERT INTO precios (pizza_id, tamano_id, precio) VALUES (?, ?, ?)`,
                  [id_producto, tamanoId, parseFloat(precio)],
                  err => {                    if (err && !fallo) {
                      fallo = true;
                      console.error(err);
                      // Log price insertion error during update
                      const descripcionLog = `Error al guardar nuevos precios del producto (ID: ${id_producto}) - ${err.message}`;
                      logAction(req, 'UPDATE_ERROR', 'precios', descripcionLog);
                      return res.status(500).json({ message: 'Error al guardar nuevos precios' });
                    }
                    pendientes--;
                    if (pendientes === 0 && !fallo) {
                      // Log successful product update
                      const descripcionLog = `Producto actualizado: "${titulo}" (ID: ${id_producto}) en categoría "${categoria}" con ${entries.length} precios actualizados`;
                      logAction(req, 'UPDATE', 'productos', descripcionLog);
                      
                      res.status(200).json({
                        message: 'Producto y precios actualizados exitosamente',
                        id_producto
                      });
                    }
                  }
                );
              });              if (entries.length === 0) {
                // Log product update without prices
                const descripcionLog = `Producto actualizado sin precios: "${titulo}" (ID: ${id_producto}) en categoría "${categoria}"`;
                logAction(req, 'UPDATE', 'productos', descripcionLog);
                
                res.status(200).json({
                  message: 'Producto actualizado sin precios (verifica tu formulario)',
                  id_producto
                });
              }
            }
          );
        }
      );
    });
  });
};
