require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./config/db');

// Import routes
const userRoutes = require('./routes/userRoutes');
const testRoutes = require('./routes/testRoutes');
const contentRoutes = require('./routes/contentRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://q8w8g48gwkco444g8sow000g.82.29.198.111.sslip.io',
        'http://bkcww48c8swokk0s4wo4gkk8.82.29.198.111.sslip.io'  // Agregado
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/test', testRoutes);
app.use('/api/content', contentRoutes);

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