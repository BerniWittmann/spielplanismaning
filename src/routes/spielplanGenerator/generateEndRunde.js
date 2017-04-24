const logger = require('winston').loggers.get('spielplanGenerator');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const helper = require('./helper.js');
const helpers = require('../helpers.js')();
const mongoose = require('mongoose');
const spielLabels = require('./spielLabels.js');
const Gruppe = mongoose.model('Gruppe');
const Jugend = mongoose.model('Jugend');
const Team = mongoose.model('Team');
const maxTeamsAdvance = 2;

function createSpiel(gruppen, rankA, rankB, jugendid, label) {
    logger.verbose('Generating Spiel: ' + label);
    return {
        _id: mongoose.Types.ObjectId(),
        fromA: gruppen[0]._id,
        fromB: gruppen[1]._id,
        fromType: 'Gruppe',
        rankA: rankA,
        rankB: rankB,
        label: label,
        jugend: jugendid
    }
}

function createSpielFromSpiel(spielA, spielB, rankA, rankB, jugendid, label) {
    logger.verbose('Generating Spiel: ' + label);
    return {
        fromA: spielA._id,
        fromB: spielB._id,
        fromType: 'Spiel',
        rankA: rankA,
        rankB: rankB,
        label: label,
        jugend: jugendid
    }
}

function generateZwischenGruppen(gruppen, maxTeamsAdvance, zeiten, cb) {
    let relevantGruppen = [];

    const gruppenByJugend = helper.getGruppenWithSameJugend(gruppen);
    return async.forEachOf(gruppenByJugend, function (gruppen, jugendid, callback) {
        return helper.generateZwischenGruppen(gruppen, jugendid, maxTeamsAdvance, function (err, groups) {
            if (err) return callback(err);

            relevantGruppen = relevantGruppen.concat(groups);
            return callback();
        });
    }, function (err) {
        if (err) return cb(err);

        return require('./generateGruppenPhase.js')({
            zeiten: zeiten,
            gruppen: relevantGruppen,
            spiele: [],
            lastPlayingTeams: [],
            geradeSpielendeTeams: [],
            i: 1
        }, function (err, spiele) {
            if (err) return cb(err);

            spiele = helper.fillLastEmptySpiele(spiele, zeiten, spielLabels.ZWISCHENRUNDENSPIEL);
            return cb(null, relevantGruppen, spiele);
        });
    });
}

function calculateFinalspiele(gruppen, jugendid) {
    // HF 1 HF 2 + Finale + Spiel um Platz 3
    const spiele = [];

    // HF
    const hf1 = createSpiel(gruppen, 1, 2, jugendid, spielLabels.HALBFINALE);
    const hf2 = createSpiel(gruppen, 2, 1, jugendid, spielLabels.HALBFINALE);
    spiele.push(hf1, hf2);
    // Finale
    spiele.push(createSpielFromSpiel(hf1, hf2, 1, 1, jugendid, spielLabels.FINALE));

    // Spiel um Platz 3
    spiele.push(createSpielFromSpiel(hf1, hf2, 0, 0, jugendid, helper.getSpielUmLabel(2, 2)));

    return spiele;
}

function calculatePlatzierungsspiele(gruppen, jugendid, maxTeamsAdvance) {
    // Spiel um Platz 5 etc.
    const spiele = [];
    let rank = 3;
    while (rank <= maxTeamsAdvance * gruppen.length) {
        const label = helper.getSpielUmLabel(rank, rank);
        spiele.push(createSpiel(gruppen, rank, rank, jugendid, label));
        rank++;
    }

    return spiele;
}

module.exports = function (payload, cb) {
    logger.verbose('Generate End-Runde');
    const gruppenSpiele = payload.spiele;
    let newSpiele = [];
    const gruppenByJugend = helper.getGruppenWithSameJugend(payload.gruppen);

    let groups = [];

    return async.forEachOf(gruppenByJugend, function (gruppen, jugendid, callback) {
        const gruppenLength = gruppen.length;
        if (gruppenLength < 2 || gruppenLength > 8) {
            logger.error('Gruppenanzahl stimmt nicht');
            return callback('Gruppenanzahl stimmt nicht');
        }

        groups = groups.concat(gruppen);

        return callback();
    }, function (err) {
        if (err) return cb(err);

        return generateZwischenGruppen(groups, maxTeamsAdvance, payload.zeiten, function (err, groups, spiele) {
            if (err) return cb(err);
            newSpiele = newSpiele.concat(spiele);

            const gruppenByJugend = helper.getGruppenWithSameJugend(groups);
            return async.forEachOf(gruppenByJugend, function (gruppen, jugendid, callback) {

                newSpiele = newSpiele.concat(calculateFinalspiele(gruppen, jugendid));
                newSpiele = newSpiele.concat(calculatePlatzierungsspiele(gruppen, jugendid, maxTeamsAdvance));

                return callback();
            }, function (err) {
                if (err) return cb(err);

                newSpiele = newSpiele.sort(helper.sortEndrundeSpiele);

                newSpiele = helper.fillEndrundeSpieleWithEmpty(newSpiele);

                newSpiele = newSpiele.map(function (spiel, index) {
                    const i = gruppenSpiele.length + 1 + index;
                    const dateTimeObject = helper.calcSpielDateTime(i, payload.zeiten);
                    spiel.nummer = i;
                    spiel.datum = dateTimeObject.datum;
                    spiel.platz = dateTimeObject.platz;
                    spiel.uhrzeit = dateTimeObject.zeit;
                    return spiel;
                });

                return cb(null, gruppenSpiele.concat(newSpiele));
            });
        });
    });
};