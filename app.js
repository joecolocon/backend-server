//Requires
var express = require('express');
var mongoose = require('mongoose');

//initvar
var app = express();

//conexion a bd
mongoose.connect('mongodb://localhost:27017/hospitaldDB',
    (err, res) => {

        if (err) throw err;
        console.log("MongoDB conectado en puerto 27017: \x1b[32m%s\x1b[0m", "online");

    }
);

//rutas
app.get('/', (_req, res, _next) => {
    res.status(200).json({
        ok: true,
        message: 'peticion correcta'
    });
});

//Listen calls
app.listen(3000, () => {
    console.log("Express server en puerto 3000: \x1b[32m%s\x1b[0m", "online");
});