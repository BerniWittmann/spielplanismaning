const logger = require('winston').loggers.get('spielplanGenerator');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const helper = require('./helper.js');
const helpers = require('../helpers.js');
const mongoose = require('mongoose');
const spielLabels = require('./spielLabels.js');
const Gruppe = mongoose.model('Gruppe');
const Jugend = mongoose.model('Jugend');
const Team = mongoose.model('Team');
const maxTeamsAdvance = 2;

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

        return helper.generateZwischenGruppenHelper(groups, maxTeamsAdvance, payload.zeiten, function (err, groups, spiele) {
            if (err) return cb(err);
            newSpiele = newSpiele.concat(spiele);

            const gruppenByJugend = helper.getGruppenWithSameJugend(groups);
            return async.forEachOf(gruppenByJugend, function (gruppen, jugendid, callback) {

                newSpiele = newSpiele.concat(helper.calculateFinalspiele(gruppen, jugendid));
                newSpiele = newSpiele.concat(helper.calculatePlatzierungsspiele(gruppen, jugendid, maxTeamsAdvance));

                return callback();
            }, function (err) {
                if (err) return cb(err);

                newSpiele = newSpiele.sort(helper.sortEndrundeSpiele);

                newSpiele = helper.fillEndrundeSpieleWithEmpty(newSpiele);

                newSpiele = helper.calcDateTimeForEndrundeSpiele(newSpiele, gruppenSpiele.length + 1, payload.zeiten);

                return cb(null, gruppenSpiele.concat(newSpiele));
            });
        });
    });
};