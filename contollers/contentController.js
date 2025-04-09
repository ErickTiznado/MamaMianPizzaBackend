const pool = require('../config/db');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const actualDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

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
        
        const { titulo, descripcion, porciones, categoria, sesion } = req.body;
        const activo = req.body.activo === 'true' || req.body.activo === true;
        const actDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        // Default precio if not provided
        const precio = req.body.precio || 0;
        
        // Get file path or null if no file
        const imagenPath = req.file ? '/uploads/' + req.file.filename : null;
        
        try {
            if (!titulo || !descripcion || !porciones || !sesion || !categoria) {
                return res.status(400).json({ message: 'Faltan datos requeridos' });
            }
            
            getCategoryId(categoria, (err, idcategoria) => {
                if (err) {
                    console.error('Error al obtener/crear la categoría', err);
                    return res.status(500).json({ message: 'Error al procesar la categoría' });
                }
                console.log('ID de categoría:', idcategoria);
                pool.query(
                    'INSERT INTO productos (titulo, descripcion, precio, porciones, seccion, id_categoria, activo, imagen, fecha_creacion, fecha_actualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [titulo, descripcion, precio, porciones, sesion, idcategoria, activo, imagenPath, actualDate, actDate],
                    (err, results) => {
                        if (err) {
                            console.error('Error al crear el producto', err);
                            return res.status(500).json({ message: 'Error al crear el producto' });
                        }

                        res.status(201).json({ message: 'Producto creado exitosamente', id_producto: results.insertId });
                    }
                );
            });
        } catch (error) {
            console.error('Error en el servidor', error);
            res.status(500).json({ message: 'Error en el servidor' });
        }
    });
};

exports.getLasMasPopulares = (req, res) => {
    pool.query('SELECT * FROM productos WHERE activo = 1 AND seccion = Las más populares ORDER BY fecha_creacion DESC LIMIT 3', (err, results) => {
        if(err){
            console.error('Error al obtener productos', err);
            return res.status(500).json({ message: 'Error al obtener productos' });
        }
        res.status(200).json({ message: 'Productos obtenidos exitosamente', productos: results });
    })
}