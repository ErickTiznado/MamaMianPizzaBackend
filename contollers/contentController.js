const pool = require('../config/db');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const actualDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

// Server base URL
const SERVER_BASE_URL = 'https://api.mamamianpizza.com';

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
        } else {
            // If category doesn't exist, create it
            pool.query('INSERT INTO categorias (nombre, fecha_creacion) VALUES (?, ?)', [categoryName, actualDate], (err, result) => {
                if (err) {
                    
                    callback(err, null);
                    return;
                }
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

    const activo = req.body.activo === 'true' || req.body.activo === true;
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
        [titulo, descripcion, sesion, idcategoria, activo, imagenPath, actualDate, actualDate],
        (err, result) => {
          if (err) {
            console.error(err);
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
              err => {
                if (err && !fallo) {
                  fallo = true;
                  console.error('Error al insertar precio', err);
                  return res.status(500).json({ message: 'Error al guardar precios' });
                }
                pendientes--;
                if (pendientes === 0 && !fallo) {
                  res.status(201).json({
                    message: 'Producto y precios creados exitosamente',
                    id_producto: pizzaId
                  });
                }
              }
            );
          });

          // Si no hay tamaños (no debería pasar), devolvemos ya:
          if (entries.length === 0) {
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
    pool.query('SELECT * FROM productos WHERE seccion = "Las más populares" ORDER BY fecha_creacion DESC LIMIT 3', (err, results) => {
        if(err){
            console.error('Error al obtener productos', err);
            return res.status(500).json({ message: 'Error al obtener productos' });
        }
        res.status(200).json({ message: 'Productos obtenidos exitosamente', productos: results });
        console.log('Productos obtenidos exitosamente', results);
    })
}


exports.getRecomendacionDeLacasa = (req, res) => {
    pool.query('SELECT * FROM productos where seccion = "Recomendación de la casa" ORDER BY fecha_creacion DESC LIMIT 3', (err, results) => {
        if(err){
            console.error('Error al obtener productos', err);
            return res.status(500).json({ message: 'Error al obtener productos' });
        }
        res.status(200).json({message: 'Productos obtenidos exitosamente', productos: results });            
    })
    }

exports.getMenu = (req, res) => {
  const sql = `
    SELECT 
      p.id_producto,
      p.titulo,
      p.descripcion,
      p.imagen,
      p.activo,
      t.id_tamano,
      t.nombre    AS tamano,
      t.indice    AS orden_tamano,
      pr.precio
    FROM productos p
    JOIN precios pr ON p.id_producto = pr.pizza_id
    JOIN tamanos t  ON pr.tamano_id   = t.id_tamano
    ORDER BY p.id_producto, t.indice;
  `;
  pool.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error al obtener el menú' });
    }
    // Agrupamos por pizza
    const mapa = {};
    rows.forEach(r => {
      if (!mapa[r.id_producto]) {
        mapa[r.id_producto] = {
          id: r.id_producto,
          titulo: r.titulo,
          descripcion: r.descripcion,
          imagen: r.imagen,
          activo: r.activo,

          opciones: []
        };
      }
      mapa[r.id_producto].opciones.push({
        tamanoId: r.id_tamano,
        nombre:   r.tamano,
        precio:   parseFloat(r.precio)
      });
    });
    const menu = Object.values(mapa);
    res.status(200).json({ message: 'Menú cargado', menu });
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
                    console.error('Error al eliminar el producto', err);
                    return res.status(500).json({ message: 'Error al eliminar el producto' });
                }
                
                if(productResults.affectedRows === 0){
                    return res.status(404).json({ message: 'Producto no encontrado' });
                }
                
                res.status(200).json({ 
                    message: 'Producto y sus precios eliminados exitosamente',
                    preciosEliminados: priceResults.affectedRows,
                    productosEliminados: productResults.affectedRows
                });
            });
        });
    }

    exports.TotalProducts = (req, res) => {
        pool.query('SELECT COUNT(*) as total FROM productos', (err, results) => {
            if(err){
                console.error('Error al obtener el total de productos', err);
                return res.status(500).json({ message: 'Error al obtener el total de productos' });
            }
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

    const activo = req.body.activo === 'true' || req.body.activo === true;
    const imagenPath = req.file
      ? `${SERVER_BASE_URL}/uploads/${req.file.filename}`
      : null;
    const actDate = new Date().toISOString().slice(0,19).replace('T',' ');

    getCategoryId(categoria, (err, idcategoria) => {
      if (err) return res.status(500).json({ message: 'Error al procesar la categoría' });

      // 1) Actualizar datos básicos de la pizza
      pool.query(
        `UPDATE productos SET
           titulo = ?, descripcion = ?, seccion = ?, id_categoria = ?, activo = ?, imagen = COALESCE(?, imagen), fecha_actualizacion = ?
         WHERE id_producto = ?`,
        [titulo, descripcion, sesion, idcategoria, activo, imagenPath, actDate, id_producto],
        err => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al actualizar el producto' });
          }

          // 2) Borrar precios antiguos
          pool.query(
            `DELETE FROM precios WHERE pizza_id = ?`,
            [id_producto],
            err => {
              if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error al limpiar precios antiguos' });
              }

              // 3) Insertar precios nuevos
              const entries = Object.entries(preciosObj);
              let pendientes = entries.length, fallo = false;

              entries.forEach(([tamanoId, precio]) => {
                pool.query(
                  `INSERT INTO precios (pizza_id, tamano_id, precio) VALUES (?, ?, ?)`,
                  [id_producto, tamanoId, parseFloat(precio)],
                  err => {
                    if (err && !fallo) {
                      fallo = true;
                      console.error(err);
                      return res.status(500).json({ message: 'Error al guardar nuevos precios' });
                    }
                    pendientes--;
                    if (pendientes === 0 && !fallo) {
                      res.status(200).json({
                        message: 'Producto y precios actualizados exitosamente',
                        id_producto
                      });
                    }
                  }
                );
              });

              if (entries.length === 0) {
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
