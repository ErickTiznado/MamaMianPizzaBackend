require('dotenv').config();
const express = require('express');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
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