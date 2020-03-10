//Requires
var express = require('express');
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
var seed = require('../config/config');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(seed.CLIENT_ID);

var app = express();

// ===============================================
// GOOGLE
// ===============================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: [seed.CLIENT_ID]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token).catch(e => {
        return res.status(500).json({
            ok: false,
            message: 'Error de acceso',
            errors: e
        });
    });

    //guardar el usuario
    Usuario.findOne({ email: googleUser.email }, (err, usuariodb) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error durante el proceso de busqueda',
                errors: err
            });
        }

        if (usuariodb && !usuariodb.google) {
            return res.status(401).json({
                ok: false,
                message: 'identifiación errónea. Use identificación estandard',
                errors: { message: 'usuario no registrado usando google identification' }
            });
        }

        if (usuariodb && usuariodb.google) {
            return usuarioYToken(usuariodb, res);
        }

        if (!usuariodb) {
            //Crar el usuario en BD -> equivale a un "autoregistro".
            let usuario = new Usuario({
                nombre: googleUser.nombre,
                email: googleUser.email,
                password: 'n/a',
                img: googleUser.img,
                google: true
            });

            usuario.save((err, usuariodb) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error de creación de usuario',
                        errors: err
                    });
                }

                return usuarioYToken(usuariodb, res);
            });
        }

    });
});


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

        return usuarioYToken(usuariodb, res);
    });


});

function usuarioYToken(usuariodb, res) {
    // crear JSON token a retornar, guardando el usuario._id de BD.
    usuariodb.password = ";-)";
    var token = jwt.sign({ usuario: usuariodb }, seed.SEED, {
        expiresIn: 60 * 60 * 4 // expires in 4 hours
    });

    return res.status(200).json({
        ok: true,
        message: 'identificación correcta',
        body: usuariodb,
        token: token,
        menu: obtenerMenu(usuariodb.role)
    });

}

function obtenerMenu(ROLE) {

    console.log("menu del role", ROLE);

    let menu = [{
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Tablero', url: '/dashboard' },
                { titulo: 'Progreso', url: '/progress' },
                { titulo: 'Gráficas', url: '/graficas1' },
                { titulo: 'Promesas', url: '/promesas' },
                { titulo: 'Observables', url: '/rxjs' }
            ]
        },
        {
            titulo: 'Mantenimiento',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Médicos', url: '/medicos' }
            ]
        }
    ];

    if (ROLE == 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }

    return menu;
}

module.exports = app;