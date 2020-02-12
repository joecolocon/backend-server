//Requires
var express = require('express');
var mongoose = require('mongoose');

var app = express();

//rutas
app.get('/', (_req, res, _next) => {
    res.status(200).json({
        ok: true,
        message: 'peticion correcta'
    });
});

module.exports = app;