//Requires
var express = require('express');
var Hospital = require('../models/hospital');
var mdAutenticacion = require('../middleware/autenticacion');

var app = express();

//Buscar todo los hospitales (paginado)
app.get('/', (req, res, _next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);
    var limit = req.query.limit || 5;
    limit = Number(limit);

    Hospital.find({}, 'nombre img usuario')
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(limit)
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error cargando hospital',
                        errors: err
                    });
                }

                Hospital.count({}, (err, contador) => {

                    return res.status(200).json({
                        ok: true,
                        message: 'peticion de hospitales correcta',
                        hospitales: hospitales,
                        total: contador
                    });
                });
            });
});

// ==========================================
// Obtener Hospital por ID (sin token)
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id).populate('usuario', 'nombre img email').exec((err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospital
        });
    })
});

// ==========================================
// Crear Hospital
// ==========================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    console.log("hospital", hospital, req.usuario._id);

    hospital.save((err, hospitaldb) => {

        if (err) {
            return res.status(422).json({
                ok: false,
                message: 'Error creando hospital',
                errors: err
            });
        }

        return res.status(201).header({
            'Location': '/hospital/' + hospitaldb._id
        }).json({
            ok: true,
            message: 'creacion de hospital correcta',
            body: hospitaldb
        });

    });


});

// ==========================================
// Modificar Hospital
// ==========================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    let hospital = null;

    Hospital.findById(id, (err, hospital) => {
        if (err || !hospital) {
            return res.status(err ? 500 : 404).json({
                ok: false,
                message: 'Error cargando hospital',
                ...(err && { errors: err }) // way to define an optional property errors
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(422).json({
                    ok: false,
                    message: 'Error actualizando hospital',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });
    });
});

// ==========================================
// Borrar Hospital
// ==========================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    let id = req.params.id;

    let hospital = null;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err || !hospitalBorrado) {
            return res.status(err ? 500 : 404).json({
                ok: false,
                message: 'Error borrando hospital',
                ...(err && { errors: err }) // way to define an optional property errors
            });
        }
        return res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });
});


module.exports = app;