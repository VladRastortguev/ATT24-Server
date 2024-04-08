const {Shema, model, default: mongoose} = require('mongoose');

const UserSchema = mongoose.Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String},
    admin: {type: Number, default: 0}
})

module.exports = model('User', UserSchema);