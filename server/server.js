require('./config/config.js');

const express = require('express');
const mongoose = require('mongoose');

const app = express();

var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(require('./routes/usuario'));

mongoose.connect('mongodb://localhost:27017/BD1', (err, res) => {
    if (err) throw err;

    console.log('BD conectada');

});

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto; ', process.env.PORT);
});