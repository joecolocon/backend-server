//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//initvar
var app = express();

//body-parser configuration to analyze application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//parse application/json
app.use(bodyParser.json());

//rutas required
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

//conexion a bd
mongoose.connect('mongodb://localhost:27017/hospitalDB',
    (err, res) => {

        if (err) throw err;
        console.log("MongoDB conectado en puerto 27017: \x1b[32m%s\x1b[0m", "online");

    }
);

//Rutas
app.use('/usuarios', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

//Listen calls
app.listen(3000, () => {
    console.log("Express server en puerto 3000: \x1b[32m%s\x1b[0m", "online");
});