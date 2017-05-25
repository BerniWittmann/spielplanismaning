const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const tokens = {};
const ids = require('./ids');

const admin = {
    _id: ids.user[0],
    username: 'admin',
    email: 'admin@byom.de',
    role: {
        name: 'Admin',
        rank: 1
    },
    resetToken: null,
    resetTokenExp: null,
    password: 'admin123'
};

const bearbeiter = {
    _id: ids.user[1],
    username: 'bearbeiter',
    email: 'bearbeiter@byom.de',
    role: {
        name: 'Bearbeiter',
        rank: 0
    },
    resetToken: null,
    resetTokenExp: null,
    password: 'bearbeiter123'
};

function generateJWT(user) {
    // set expiration to 60 days
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    const obj = {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        exp: parseInt(exp.getTime() / 1000, 10),
        iat: parseInt(today.getTime() / 1000, 10)
    };
    return jwt.sign(obj, process.env.SECRET);
}

function setPassword(password) {
    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');

    return {
        salt: salt,
        hash: hash
    }
}

function generateUser(user) {
    const passwordData = setPassword(user.password);
    user.salt = passwordData.salt;
    user.hash = passwordData.hash;
    delete user.password;

    tokens[user.role.name] = generateJWT(user);
    return user;
}

const data = [generateUser(admin), generateUser(bearbeiter)];

function getTokens() {
    return tokens;
}

module.exports = {
    getTokens: getTokens,
    data: data
};