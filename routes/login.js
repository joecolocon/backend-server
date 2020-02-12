//Requires
var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
var seed = require('../config/config');

var app = express();

app.post('/', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuariodb) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error de acceso',
                errors: err
            });
        }

        if (!usuariodb) {
            return res.status(401).json({
                ok: false,
                message: 'Error en identifación - email'
            });
        }

        if (!bcrypt.compareSync(body.password, usuariodb.password)) {
            return res.status(401).json({
                ok: false,
                message: 'Error en identificación - password'
            });
        }

        // crear JSON token a retornar, guardando el usuario._id de BD.
        usuariodb.password = ";-)";
        var token = jwt.sign({ usuario: usuariodb }, seed.SEED, {
            expiresIn: 60 * 60 * 4 // expires in 4 hours
        });

        return res.status(200).json({
            ok: true,
            message: 'identificación correcta',
            body: usuariodb,
            token: token
        });

    });


});


module.exports = app;