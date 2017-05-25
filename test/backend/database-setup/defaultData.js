const mongoose = require('mongoose');
const cls = require('../../../src/config/cls.js');

const ids = require('./data/ids');
const user = require('./data/users');
const veranstaltung = require('./data/veranstaltung');
const ansprechpartner = require('./data/ansprechpartner');
const jugend = require('./data/jugenden');
const gruppe = require('./data/gruppen');
const spiel = require('./data/spiele');
const spielplan = require('./data/spielplan');
const subscriber = require('./data/subscriber');
const team = require('./data/teams');

const data = {
    ansprechpartner: ansprechpartner.data,
    user: user.data,
    veranstaltung: veranstaltung.data,
    jugend: jugend.data,
    gruppe: gruppe.data,
    spiel: spiel.data,
    spielplan: spielplan.data,
    subscriber: subscriber.data,
    team: team.data
};

function insert(name, cb) {
    const beachEventID = ids.veranstaltung;
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return mongoose.model(name).insertMany(data[name.toLowerCase()], cb);
    });
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

function insertGruppe(cb) {
    return insert('Gruppe', cb);
}

function insertSpiel(cb) {
    return insert('Spiel', cb);
}

function insertSpielplan(cb) {
    return insert('Spielplan', cb);
}

function insertSubscriber(cb) {
    return insert('Subscriber', cb);
}

function insertTeam(cb) {
    return insert('Team', cb);
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
    getIDs: getIDs,
    insert: insert,
    insertAnsprechpartner: insertAnsprechpartner,
    insertUser: insertUser,
    insertVeranstaltungen: insertVeranstaltungen,
    insertJugenden: insertJugenden,
    insertGruppe: insertGruppe,
    insertSpiel: insertSpiel,
    insertSpielplan: insertSpielplan,
    insertSubscriber: insertSubscriber,
    insertTeam: insertTeam
};