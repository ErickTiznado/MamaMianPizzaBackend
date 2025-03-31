require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: 'http://localhost:5173', // Cambia esto por la URL de tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
res.send('Hello Wordl!')
});

app.get('/milu', (req, res) => {
    res.send({message :'Te amo miuuuuuuuuu <3'});
})

app.listen(PORT, () => {
    console.log('Servidor corriendo en el puerto', PORT);
});


//Rutas de usuarios

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
//Rutas de Testeo

const testRoutes = require('./routes/testRoutes');
app.use('/api/test', testRoutes);