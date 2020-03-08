//Requires
var express = require('express');
var Medico = require('../models/medico');
var mdAutenticacion = require('../middleware/autenticacion');

var app = express();

//rutas
app.get('/', (req, res, _next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var limit = req.query.limit || 5;
    limit = Number(limit);

    Medico.find({}, 'nombre img hospital usuario')
        .populate('hospital', 'nombre')
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(limit)
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error cargando médico',
                    errors: err
                });
            }

            Medico.count({}, (err, contador) => {
                return res.status(200).json({
                    ok: true,
                    message: 'peticion de médicos correcta',
                    medicos: medicos,
                    total: contador
                });
            });
        });
});

app.get('/:id', (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let medico = null;

    Medico.findById(id, 'nombre img hospital usuario')
        .populate('hospital', 'nombre')
        .populate('usuario', 'nombre email')
        .exec((err, medico) => {
            if (err || !medico) {
                return res.status(err ? 500 : 404).json({
                    ok: false,
                    message: 'Error cargando médico',
                    ...(err && { errors: err }) // way to define an optional property errors
                });
            }

            return res.status(200).json({
                ok: true,
                medico
            });
        });
});

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    let body = req.body;
    let medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        hospital: body.hospital,
        usuario: req.usuario._id //usuario creador del registro
    });

    medico.save((err, medicodb) => {

        if (err) {
            return res.status(422).json({
                ok: false,
                message: 'Error creando médico',
                errors: err
            });
        }

        return res.status(201).header({
            'Location': '/medico/' + medicodb._id
        }).json({
            ok: true,
            message: 'creacion de médico correcta',
            body: medicodb
        });

    });


});


app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let medico = null;

    Medico.findById(id, (err, medico) => {
        if (err || !medico) {
            return res.status(err ? 500 : 404).json({
                ok: false,
                message: 'Error cargando médico',
                ...(err && { errors: err }) // way to define an optional property errors
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(422).json({
                    ok: false,
                    message: 'Error actualizando médico',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });
    });
});


app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    let id = req.params.id;

    let medico = null;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err || !medicoBorrado) {
            return res.status(err ? 500 : 404).json({
                ok: false,
                message: 'Error borrando médico',
                ...(err && { errors: err }) // way to define an optional property errors
            });
        }
        return res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });
});


module.exports = app;