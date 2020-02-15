//Requires
var express = require('express');

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();

//busqueda en paralelo en las tres entidades
app.get('/coleccion/:grupo/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var grupo = req.params.grupo;
    var regexp = new RegExp(busqueda, 'i');
    var promesa = null;
    switch (grupo) {
        case 'usuarios':
            promesa = buscarUsuarios;
            break;
        case 'hospitales':
            promesa = buscarHospitales;
            break;
        case 'medicos':
            promesa = buscarMedicos;
            break;
        default:
            res.status(422).json({
                ok: false,
                message: 'grupo desconocido. Grupos válidos usuarios, hospitales, medicos',
                error: { mensaje: grupo + ' not found' }
            });

            break;
    }

    if (promesa) {
        promesa(busqueda, regexp)
            .then((resultados) => res.status(200).json({
                ok: true,
                message: 'resultados de la busqueda',
                [grupo]: resultados
            }))
            .catch(err => res.status(500).json({
                ok: false,
                message: 'Error durante la busqueda',
                error: err
            }));
    }

});

//busqueda en paralelo en las tres entidades
app.get('/todo/:busqueda', (req, res, _next) => {

    var busqueda = req.params.busqueda;
    var regexp = new RegExp(busqueda, 'i');

    doall(busqueda, regexp).then(resp => {

        res.status(200).json({
            ok: true,
            message: 'resultados de la busqueda',
            hospitales: resp[0],
            medicos: resp[1],
            usuarios: resp[2]
        });

    }).catch(err => {

        res.status(400).json({
            ok: false,
            message: 'error durante busqueda',
            error: err
        });
    });
});

//misma búsqueda con syntasis asyn/await
app.get('/algo/:busqueda', async(req, res, _next) => {

    var busqueda = req.params.busqueda;
    var regexp = new RegExp(busqueda, 'i');

    try {
        var resp = await doall(busqueda, regexp);

        res.status(200).json({
            ok: true,
            message: 'resultados de la busqueda',
            hospitales: resp[0],
            medicos: resp[1],
            usuarios: resp[2]
        });
    } catch (err) {

        res.status(400).json({
            ok: false,
            message: 'error durante busqueda',
            error: err
        });

    }

});

//Promesa de busqeda en paralelo. retorna un array de hospitales,medicos y usuarios
function doall(busqueda, regexp) {

    return Promise.all([
        buscarHospitales(busqueda, regexp),
        buscarMedicos(busqueda, regexp),
        buscarUsuarios(busqueda, regexp)
    ]);
}

//Promise de busqueda de hospitales
function buscarHospitales(busqueda, regexp) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regexp }, "nombre")
            .populate("usuario", "nombre email")
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error buscando hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });

}

function buscarMedicos(busqueda, regexp) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regexp }, "nombre")
            .populate("usuario", "nombre email")
            .populate("hospital")
            .exec((err, medicos) => {
                if (err) {
                    reject('Error buscando medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });

}

function buscarUsuarios(busqueda, regexp) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email img')
            .or([{ nombre: regexp }, { email: regexp }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error buscando usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;