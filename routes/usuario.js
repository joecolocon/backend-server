//Requires
var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var mdAutenticacion = require('../middleware/autenticacion');

var app = express();

//rutas
app.get('/', (req, res, _next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var limit = req.query.limit || 5;
    limit = Number(limit);


    Usuario
        .find({}, 'nombre email img role google')
        .skip(desde)
        .limit(limit)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error cargando usuario',
                    errors: err
                });
            }

            Usuario.count({}, (err, contador) => {

                return res.status(200).json({
                    ok: true,
                    message: 'peticion de usuarios correcta',
                    usuarios,
                    total: contador
                });
            });
        });
});

app.post('/', (req, res) => {

    //Usuario.post()
    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuariodb) => {

        if (err) {
            return res.status(422).json({
                ok: false,
                message: 'Error creando usuario',
                errors: err
            });
        }

        return res.status(201).header({ 'Location': '/usuarios/' + usuariodb._id }).json({
            ok: true,
            message: 'creacion de usuario correcta',
            body: usuariodb,
            caller: req.usuario
        });

    });


});


app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdminOSameUser], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let usuario = null;

    Usuario.findById(id, (err, usuario) => {
        if (err || !usuario) {
            return res.status(err ? 500 : 404).json({
                ok: false,
                message: 'Error cargando usuario',
                ...(err && { errors: err }) // way to define an optional property errors
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        if (body.img) {
            usuario.img = body.img;
        }

        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(422).json({
                    ok: false,
                    message: 'Error actualizando usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':-)';

            return res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });
    });
});


app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verificaAdmin], (req, res) => {

    let id = req.params.id;

    let usuario = null;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err || !usuarioBorrado) {
            return res.status(err ? 500 : 404).json({
                ok: false,
                message: 'Error borrando usuario',
                ...(err && { errors: err }) // way to define an optional property errors
            });
        }
        return res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});


module.exports = app;