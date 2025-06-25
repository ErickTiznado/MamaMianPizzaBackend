require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pool = require('./config/db');

// Import routes
const userRoutes = require('./routes/userRoutes');
const contentRoutes = require('./routes/contentRoutes');
const inventoriRoutes = require('./routes/inventoriRoutes');
const orderRoutes = require('./routes/orderRoutes');
const customerRoutes = require('./routes/customerRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const tamanosRoutes = require('./routes/tamanosRoutes');
const resenasRoutes = require('./routes/resenasRoutes');
const experienciaRoutes = require('./routes/experienciaRoutes');
const authRoutes = require('./routes/authRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
const accountRoutes = require('./routes/accountRoutes'); // Import account routes
const segmentacionRoutes = require('./routes/segmentacionRoutes'); // Import the new route
const logsRoutes = require('./routes/logsRoutes'); // Import logs routes
const activeRoutes = require('./routes/activeRoutes'); // Import activar usuarios routes
// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        'https://panel.mamamianpizza.com',
        'https://mamamianpizza.com'  // Agregado
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
// Ensure the uploads directory exists
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('Created uploads directory');
}
// Serve static files with optimized options
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d',  // Cache for 1 day
  etag: true,    // Enable etag for caching
  index: false,  // Disable directory listing for security
}));

// Check database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database: ', err);
    if (connection) connection.release();
    return;
  }
  console.log('Database connected successfully!');
  connection.release();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/inventory', inventoriRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reportes', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tamanos', tamanosRoutes);
app.use('/api/resenas', resenasRoutes);
app.use('/api/experiencias', experienciaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/account', accountRoutes); // Use account routes
app.use('/api/segmentacion', segmentacionRoutes); // Use the new route for customer segmentation
app.use('/api/logs', logsRoutes); // Use logs routes
app.use('/api/act', activeRoutes); // Use activar usuarios routes
// Default route

app.get('/', (req, res) => {
  res.send('Mama Mian Pizza API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});