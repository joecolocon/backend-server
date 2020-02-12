var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator'); // plugin que permite definir un mensaje a la condicion "unique"

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol autorizado'
}

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'nombre requerido'] },
    email: { type: String, required: [true, 'correo requerido'], unique: true },
    password: { type: String, required: [true, 'contraseña requerida'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);