const express = require('express');
let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

// Mostrar Categorias
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email') //campos a devolver
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            };
            res.json({
                ok: true,
                categorias
            });
        })
});


// Mostrar Categoria or id
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        };
        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            })
        };

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    })
});


// Crear una Categoria
app.post('/categoria', verificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        };

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        };

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


// Mostrar todas las Categorias
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let desCategoria = {
        descripcion: body.descripcion,
    };
    Categoria.findByIdAndUpdate(id, desCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        };

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        };

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});


// Borrar Categoria
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        };

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID Categoria inexistente'
                }
            })
        }

        res.json({
            ok: true,
            message: 'Categoria Borrada'
        });

    });
});


module.exports = app;