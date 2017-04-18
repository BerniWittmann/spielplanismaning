const logger = require('winston').loggers.get('spielplanGenerator');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const helper = require('./helper.js');
const helpers = require('../helpers.js')();

function createSpiel(gruppen, rankA, rankB, jugendid) {
    const label = helper.getSpielUmLabel(rankA, rankB);
    logger.verbose('Generating Spiel: ' + label);
    return {
        fromA: gruppen[0]._id,
        fromB: gruppen[1]._id,
        fromType: 'Gruppe',
        rankA: rankA,
        rankB: rankB,
        label: label,
        jugend: jugendid
    }
}

module.exports = function (payload, cb) {
    logger.verbose('Generate EndRunde for two Gruppen');
    const spiele = payload.spiele;
    let newSpiele = [];
    const gruppenByJugend = helper.getGruppenWithSameJugend(payload.gruppen);
    const maxTeamsAdvance = helper.calcTeamsAdvance(gruppenByJugend);

    _.forIn(gruppenByJugend, function (gruppen, jugendid) {
        const gruppenLength = gruppen.length;
        if (gruppenLength !== 2) {
            return logger.error('Gruppenanzahl stimmt nicht');
        }
        let rank = 1;
        console.log(maxTeamsAdvance);
        while (rank <= maxTeamsAdvance) {
            newSpiele.push(createSpiel(gruppen, rank, rank, jugendid));
            rank++;
        }
    });

    if (Object.keys(gruppenByJugend).length > 1) {
        newSpiele = newSpiele.sort(function (a, b) {
            return b.rankA - a.rankA;
        });
    }

    newSpiele = newSpiele.map(function (spiel, index) {
        const i = spiele.length + 1 + index;
        const dateTimeObject = helper.calcSpielDateTime(i, payload.zeiten);
        spiel.nummer = i;
        spiel.datum = dateTimeObject.datum;
        spiel.platz = dateTimeObject.platz;
        spiel.uhrzeit = dateTimeObject.zeit;
        return spiel;
    });

    return cb(null, spiele.concat(newSpiele));
};