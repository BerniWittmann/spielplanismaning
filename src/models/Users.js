module.exports = function (secret) {
    var mongoose = require('mongoose');
    var crypto = require('crypto');
    var jwt = require('jsonwebtoken');
    var moment = require('moment');
    var uuidTokenGen = require('uuid-token-generator');
    var tokenGenerator = new uuidTokenGen();
    var _ = require('lodash');
    var roles = ['Bearbeiter', 'Admin'];

    var UserSchema = new mongoose.Schema({
        username: {
            type: String,
            lowercase: true,
            unique: true
        },
        email: {
            type: String,
            unique: true
        },
        role: {
            name: {
                type: String
            },
            rank: {
                type: Number
            }
        },
        hash: String,
        salt: String,
        resetToken: String,
        resetTokenExp: Date
    });

    UserSchema.methods.generateJWT = function () {
        // set expiration to 60 days
        var today = new Date();
        var exp = new Date(today);
        exp.setDate(today.getDate() + 60);
        return jwt.sign({
            _id: this._id,
            username: this.username,
            email: this.email,
            role: this.role,
            exp: parseInt(exp.getTime() / 1000, 10)
        }, secret);
    };

    UserSchema.methods.setPassword = function (password) {
        this.salt = crypto.randomBytes(16).toString('hex');
        //noinspection JSUnresolvedVariable
        this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    };

    UserSchema.methods.setRandomPassword = function () {
        this.setPassword(tokenGenerator.generate());
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

    UserSchema.methods.generateResetToken = function () {
        this.resetToken = tokenGenerator.generate();
        this.resetTokenExp = moment().add(1, 'd').toDate();
        return this.resetToken;
    };

    UserSchema.methods.removeResetToken = function () {
        this.resetToken = undefined;
        this.resetTokenExp = undefined;
    };

    UserSchema.methods.validateResetToken = function (token) {
        if (token) {
            if (_.isEqual(token, this.resetToken)) {
                if (this.resetTokenExp) {
                    if (moment().isSameOrBefore(this.resetTokenExp)) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    UserSchema.methods.setUsername = function (username) {
        this.username = username;
    };

    UserSchema.methods.setEmail = function (email) {
        this.email = email;
    };

    var deepPopulate = require('mongoose-deep-populate')(mongoose);
    UserSchema.plugin(deepPopulate, {});

    mongoose.model('User', UserSchema);
};