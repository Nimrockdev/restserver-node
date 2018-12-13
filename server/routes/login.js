const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();

app.post('/login', (req, res) => {

    let body = req.body;
    /*     console.log(req.body);
        console.log(body); */
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        //console.log('El usuario introducido es : ' + body.email);
        if (err) {
            /* Excepcion servidor internarl server error */
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            /* Usuario no encontrado */
            /* console.log('Usuario no encontrado, lanzamos error 400'); */
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario (o contraseña) incorrectos'
                }
            });

        }

        /* Intentamos revisar  si la contraseña concuerda con la que esta en la bd */
        /* Si no son iguales */
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            /* console.log('Usuario no encontrado, lanzamos error 500'); */
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario o) contraseña incorrectos'

                }
            });
        }


        let token = jwt.sign({
            usuario: usuarioDB /* payload */
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });


        /* Si las validaciones son correctas */
        res.json({
                ok: true,
                usuario: usuarioDB,
                token
            })
            /* console.log(token); */
    })
});


module.exports = app;