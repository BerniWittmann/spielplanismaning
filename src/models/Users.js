module.exports = function (secret) {
    const mongoose = require('mongoose');
    const crypto = require('crypto');
    const jwt = require('jsonwebtoken');
    const moment = require('moment');
    const uuidTokenGen = require('uuid-token-generator');
    const tokenGenerator = new uuidTokenGen();
    const _ = require('lodash');
    const md5 = require('md5');
    const roles = ['Bearbeiter', 'Admin'];

    const UserSchema = new mongoose.Schema({
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
        resetToken: String,
        resetTokenExp: String,
        hash: String,
        salt: String
    });

    UserSchema.methods.generateJWT = function () {
        // set expiration to 60 days
        const today = new Date();
        const exp = new Date(today);
        exp.setDate(today.getDate() + 60);
        const obj = {
            _id: this._id,
            username: this.username,
            email: this.email,
            role: this.role,
            exp: parseInt(exp.getTime() / 1000, 10),
            iat: parseInt(today.getTime() / 1000, 10)
        };
        return jwt.sign(obj, secret);
    };

    UserSchema.methods.setPassword = function (password) {
        this.salt = crypto.randomBytes(32).toString('hex');
        //noinspection JSUnresolvedVariable
        this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
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
        const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');

        return this.hash === hash;
    };

    UserSchema.methods.generateResetToken = function () {
        this.resetToken = tokenGenerator.generate();
        this.resetTokenExp = moment().add(1, 'd').toISOString();
        return this.resetToken;
    };

    UserSchema.methods.removeResetToken = function () {
        this.resetToken = undefined;
        this.resetTokenExp = undefined;
    };

    UserSchema.methods.validateResetToken = function (token) {
        if (token && this.resetToken && this.resetTokenExp) {
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

    const deepPopulate = require('mongoose-deep-populate')(mongoose);
    UserSchema.plugin(deepPopulate, {});

    mongoose.model('User', UserSchema);
};