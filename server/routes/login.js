const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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



/* Configuración Google */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    /*     console.log(payload.name);
        console.log(payload.email);
        console.log(payload.picture); */

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}


app.post('/google', async(req, res) => {
    let token = req.body.idtoken;

    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            })
        })

    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            /* Excepcion servidor internarl server error */
            return res.status(500).json({
                ok: false,
                err
            });
        }

        /* Si existe el usuario, entra con los datos de la BD,
        en caso contrario entra con los datos de Google */
        if (usuarioDB) {
            /* Usuario que se autentifico con credenciales normales */
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar la autentificación normal'
                    }
                });
            } else { /* Es un usuario de Google, se renueva el token */
                let token = jwt.sign({
                    usuario: usuarioDB /* payload */
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
        } else { /* El usuario no existe en la BD, lo creamos */
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':-(';
            /* Grabo el nuevo usuario */
            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                };
            });
            /* generación del nuevo token */
            let token = jwt.sign({
                usuario: usuarioDB /* payload */
            }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

            return res.json({
                ok: true,
                usuario: usuarioDB,
                token
            })

        }
    })



    /*     res.json({
            usuario: googleUser
        }); */

});

module.exports = app;