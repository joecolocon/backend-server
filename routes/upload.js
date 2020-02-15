//Requires
var express = require('express');
var fileupload = require('express-fileupload');
var fs = require('fs');

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();
app.use(fileupload());

//rutas
app.put('/:grupo/:id', (req, res) => {

    var grupo = req.params.grupo;
    var id = req.params.id;

    if (!req.files) {
        return res.status(422).json({
            ok: false,
            message: 'fichero requerido',
            error: { mensaje: grupo + ' not found' }
        });
    }

    const imagen = req.files.imagen;
    const nombre = imagen.name.split('.');
    const extension = nombre[nombre.length - 1];
    const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    const gruposValidos = ['usuarios', 'hospitales', 'medicos'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(422).json({
            ok: false,
            message: 'El fichero no es un tipo de imagen soportado',
            error: { mensaje: `${extension} not supported. Valid extensions ${ extensionesValidas.join(', ') } ` }
        });
    }

    if (gruposValidos.indexOf(grupo) < 0) {
        return res.status(422).json({
            ok: false,
            message: 'El grupo no es valido',
            error: { mensaje: `${grupo} not supported. Valid groups ${ gruposValidos.join(', ') }` }
        });
    }

    let nombreExclusivo = `${ id }-${new Date().getMilliseconds()}.${ extension}`;
    let path = `./uploads/${ grupo }/${ nombreExclusivo }`;

    imagen.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error guardando el fichero',
                error: err
            });
        }

        subirPorGrupo(grupo, id, nombreExclusivo, res);
    });
});


/**
 * Utilidad para actualizar el registro  de BD (documentos mongo) con el nuevo fichero creado. 
 * 
 * @param {*} grupo folder asociado en el directorio uploads
 * @param {*} id  id del documento mongo a actualizar
 * @param {*} filename nombre del fichero fisico (sin contener)
 * @param {*} res ExpressResponse object usado para retornar los errores o ejecucion en formato HTTP
 */
function subirPorGrupo(grupo, id, filename, res) {

    if (grupo === 'usuarios') {
        _subirPorGrupo(Usuario, 'usuario', grupo, id, filename, res);
    }

    if (grupo === 'hospitales') {
        _subirPorGrupo(Hospital, 'hospital', grupo, id, filename, res);
    }

    if (grupo === 'medicos') {
        _subirPorGrupo(Medico, 'medico', grupo, id, filename, res);
    }
}


/**
 * Utilidad para actualizar el campo "img" de Documentos Mongo
 *
 * @param {*} dbobject Objecto schema mongo
 * @param {*} tipo nombre del atributo retornado conteniendo el documento mongo actualizado
 * @param {*} grupo folder asociado en el directorio uploads
 * @param {*} id  id del documento mongo a actualizar
 * @param {*} filename nombre del fichero fisico (sin contener)
 * @param {*} res ExpressResponse object usado para retornar los errores o ejecucion en formato HTTP
 */
function _subirPorGrupo(dbobject, tipo, grupo, id, filename, res) {

    dbobject.findById(id, 'nombre email img usuario hospital', (err, registro) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: `Error buscando el registro ${ id }`,
                error: err
            });
        }

        if (!registro) {
            return res.status(404).json({
                ok: false,
                message: `registro del  ${ id } no encontrado`,
                error: { message: `not found register with ${id} of type ${tipo} ` }
            });
        }

        oldfile = `./uploads/${ grupo }/${ registro.img }`;
        if (fs.existsSync(oldfile)) {
            fs.unlinkSync(oldfile);
        }

        registro.img = filename;
        registro.save((err, registroUpdated) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: `Error actualizando el registro ${ id }`,
                    error: err
                });
            }

            return res.status(200).json({
                ok: true,
                message: 'registro actualizado',
                [tipo]: registroUpdated
            });
        });
    });

}

module.exports = app;