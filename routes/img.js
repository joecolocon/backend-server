//Requires
var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');

var app = express();

//rutas
app.get('/:group/:img', (req, res) => {
    const group = req.params.group;
    const img = req.params.img;

    var pathImg = path.resolve(__dirname, `../uploads/${group}/${img}`);

    if (!fs.existsSync(pathImg)) {
        pathImg = path.resolve(__dirname, `../assets/no-img.jpg`);
    }

    res.sendFile(pathImg);
});

module.exports = app;