//Requires
var express = require('express');
var cors = require('cors');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//initvar
var app = express();

//enable cors calls
app.use(cors());

//body-parser configuration to analyze application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//parse application/json
app.use(bodyParser.json());

//rutas required
var imgRoutes = require('./routes/img');
var appRoutes = require('./routes/app');
var loginRoutes = require('./routes/login');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');


//conexion a bd
mongoose.connect('mongodb://localhost:27017/hospitalDB',
    (err, res) => {

        if (err) throw err;
        console.log("MongoDB conectado en puerto 27017: \x1b[32m%s\x1b[0m", "online");

    }
);

// Serve index config (hace visible las carpetas de un directorio)
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));


//Rutas
app.use('/img', imgRoutes);
app.use('/upload', uploadRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

//Listen calls
app.listen(3000, () => {
    console.log("Express server en puerto 3000: \x1b[32m%s\x1b[0m", "online");
});