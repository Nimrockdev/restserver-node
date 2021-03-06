require('./config/config.js');

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Habilitar la carpeta index
/* app.use(express.static(path.resolve(__dirname, '../public'))); */
app.use(express.static(path.resolve(__dirname, './public')));
/* console.log(path.resolve(__dirname, '../public')); */

/* Configuracion de las rutas */
app.use(require('./routes/index'));


mongoose.connect(process.env.URLDB, (err, res) => {
    if (err) throw err;
    console.log('BD conectada');
});

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto; ', process.env.PORT);
});