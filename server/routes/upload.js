const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    /*if (Object.keys(req.files).length == 0) vs if (!req.files)*/
    if (Object.keys(req.files).length == 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado níngun archivo'
                }
            });
    }

    //Validaciones
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Los tipos validos son ' + tiposValidos.join(', ')
                }
            });
    }

    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    //Extensiones Permitidas
    let extensionesValidas = ['jpg', 'png', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'Las extensiones pemitidas son ' + extensionesValidas.join(', '),
                    ext: extension
                }
            });

    }

    //Cambiamos nombre de archivo para que sea unico
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        //archivo.mv('uploads/filename.jpg', (err) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //Imagen cargada
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }




    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, UsuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        /*Si el usuario no existe*/
        if (!UsuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El Usuario no existe'
                }
            });
        }

        borraArchivo(UsuarioDB.img, 'usuarios');

        /*Si todo va bien */
        UsuarioDB.img = nombreArchivo;

        UsuarioDB.save((err, UsuarioGuardado) => {
            res.json({
                ok: true,
                usuario: UsuarioGuardado,
                img: nombreArchivo

            })
        });

    });
}


function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        /*Si el usuario no existe*/
        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        borraArchivo(productoDB.img, 'productos');

        /*Si todo va bien */
        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo

            })
        });

    });

}

function borraArchivo(nombreImagen, tipo) {

    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`)

    if (fs.existsSync(pathImagen)) {
        console.log('170');
        fs.unlinkSync(pathImagen)
        console.log('172');

    }
}


module.exports = app;