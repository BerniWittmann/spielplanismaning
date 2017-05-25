const mongoose = require('mongoose');

const ids = require('./data/ids');
const user = require('./data/users');
const veranstaltung = require('./data/veranstaltung');
const ansprechpartner = require('./data/ansprechpartner');
const jugend = require('./data/jugenden');

console.log(ids);
const data = {
    ansprechpartner: ansprechpartner.data,
    user: user.data,
    veranstaltung: veranstaltung.data,
    jugend: jugend.data
};

function insert(name, cb) {
    return mongoose.model(name).insertMany(data[name.toLowerCase()], cb);
}

function insertAnsprechpartner(cb) {
    return insert('Ansprechpartner', cb);
}

function insertUser(cb) {
    return insert('User', cb);
}

function insertVeranstaltungen(cb) {
    return insert('Veranstaltung', cb);
}

function insertJugenden(cb) {
    return insert('Jugend', cb);
}

function getTokens() {
    return user.getTokens();
}

function getEventID() {
    return getIDs().veranstaltung;
}

function getIDs() {
    return ids;
}

module.exports = {
    getTokens: getTokens,
    getEventID: getEventID,
    insert: insert,
    insertAnsprechpartner: insertAnsprechpartner,
    insertUser: insertUser,
    insertVeranstaltungen: insertVeranstaltungen,
    insertJugenden: insertJugenden,
    getIDs: getIDs
};