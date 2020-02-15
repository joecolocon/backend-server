var jwt = require("jsonwebtoken");
var config = require('../config/config');

exports.verificaToken = (req, res, next) => {

    var tokenHeader = req.header('authorization') || '';
    var token = req.query.token || tokenHeader.replace('Bearer ', '');

    jwt.verify(token, config.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Error en identificación -invalid token',
                error: err
            });
        }

        // establezco el usuario en todas las request que usen esta funcion de autenticacion.
        req.usuario = decoded.usuario;

        //Continuar con el flujo que continua en el modulo.
        next();

    });

};