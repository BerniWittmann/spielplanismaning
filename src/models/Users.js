module.exports = function (secret) {
    var mongoose = require('mongoose');
    var crypto = require('crypto');
    var jwt = require('jsonwebtoken');
    var roles = ['Bearbeiter', 'Admin'];

    var UserSchema = new mongoose.Schema({
        username: {
            type: String
            , lowercase: true
            , unique: true
        }
        , role: {
            name: {
                type: String
            },
            rank: {
                type: Number
            }
        }
        , hash: String
        , salt: String
    });

    UserSchema.methods.generateJWT = function () {

        // set expiration to 60 days
        var today = new Date();
        var exp = new Date(today);
        exp.setDate(today.getDate() + 60);

        return jwt.sign({
            _id: this._id
            , username: this.username
            , role: this.role
            , exp: parseInt(exp.getTime() / 1000)
        }, secret);
    };

    UserSchema.methods.setPassword = function (password) {
        this.salt = crypto.randomBytes(16).toString('hex');
        //noinspection JSUnresolvedVariable
        this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    };

    UserSchema.methods.setRole = function (rolename) {
        if (roles.indexOf(rolename) >= 0) {
            this.role = {name: rolename, rank: roles.indexOf(rolename)};
            return true;
        } else {
            return false;
        }
    };

    UserSchema.methods.validPassword = function (password) {
        var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

        return this.hash === hash;
    };

    var deepPopulate = require('mongoose-deep-populate')(mongoose);
    UserSchema.plugin(deepPopulate, {});

    mongoose.model('User', UserSchema);
};