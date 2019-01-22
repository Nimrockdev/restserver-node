const express = require('express');
let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');


//Obtener todos los productos
app.get('/productos', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            };

            res.json({
                ok: true,
                productos
            });

        })
});

//Obtener un producto por id
app.get('/productos/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            };

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Id Producto no existe'
                    }
                })
            };

            res.json({
                ok: true,
                producto: productoDB
            });

        });

});

//Buscar Productos
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let negex = new RegExp(termino, 'i'); //expresion regular, la i es insesiible a may/min

    Producto.find({ nombre: negex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            };

            res.json({
                ok: true,
                productos
            });

        });

});


//Crear Producto
app.post('/productos', verificaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario_id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: body.usuario
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        };

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });

});


//Actualizar Producto
app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        };

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID Producto inexistente'
                }
            })
        }

        productoDB.nombre = productoDB.nombre;
        productoDB.precioUni = productoDB.precioUni;
        productoDB.descripcion = productoDB.descripcion;
        productoDB.disponible = productoDB.disponible;
        productoDB.categoria = productoDB.categoria;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });

        });

    })

});


//Borrar Producto
app.delete('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID Producto inexistente'
                }
            })
        }

        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto: productoBorrado,
                message: 'Producto borrado'
            });
        })
    })

});

module.exports = app;