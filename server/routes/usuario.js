const express = require('express');
const Usuario = require('../models/usuario');
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');

/* app.get('/', function(req, res) {
    res.json('Hello World');
}); */

app.get('/usuario', verificaToken, (req, res) => {

    /*     return res.json({
            usuario: req.usuario,
            nombre: req.usuario.nombre,
            email: req.usuario.email
        }) */

    /*Parametros=
    desde: posición, 
    limite: número de registros que devuelve
    */
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);
    //Find nos filtra  sobre lo que queremos devolver
    //Filtro de los campos que devuelve, nombre, email...
    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite) //
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    conteo
                });

            });


        });
});

app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {

    let body = req.body;
    console.log(body);
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            //si llega al retorn sale
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //usuarioDB.password = null;
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {
    let id = req.params.id;
    //let body = req.body;
    //Se envian los argumentos que se pueden actualizar, en un array
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);


    //Deprecated
    //Usuario.findByIdAndUpdate(id, body, { new: true }, (err, usuarioDB) => {
    Usuario.findOneAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            usuario: usuarioDB

        });
    })
});

app.delete('/usuario/:id', verificaToken, function(req, res) {
    let id = req.params.id;

    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    let cambiaEstado = {
        estado: false
    }
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        };
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            })
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    })

    //res.json('delete usuario');
});

module.exports = app;