const logger = require('winston').loggers.get('spielplanGenerator');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const helper = require('./helper.js');
const helpers = require('../helpers.js');
const cls = require('../../config/cls.js');

module.exports = function (payload, cb) {
    const properties = helper.configureProperties(payload);
    const plaetze = properties.plaetze,
        zeiten = properties.zeiten,
        gruppen = properties.gruppen,
        maxLeereSpieleStreak = properties.maxLeereSpieleStreak;

    let spiele = properties.spiele,
        i = properties.i,
        teamA = properties.teamA,
        teamB = properties.teamB,
        lastPlayingTeams = properties.lastPlayingTeams,
        geradeSpielendeTeams = properties.geradeSpielendeTeams,
        platz = properties.platz,
        zeit = properties.zeit,
        datum = properties.datum,
        leerdurchgelaufeneGruppen = properties.leerdurchgelaufeneGruppen,
        leereSpieleStreak = properties.leereSpieleStreak,
        spieleGesamt = properties.spieleGesamt;

    function addSpiel(spiel) {
        const data = helper.addSpiel(spiel, spiele, i);
        spiele = data.spiele;
        i = data.i;
        teamA = data.teamA;
        teamB = data.teamB;
    }

    function shiftTeams() {
        const data = helper.shiftTeams(i, plaetze, geradeSpielendeTeams, lastPlayingTeams);
        lastPlayingTeams = data.lastPlayingTeams;
        geradeSpielendeTeams = data.geradeSpielendeTeams;
    }

    function leeresSpiel(gruppe) {
        calcSpielDateTime(i);
        addSpiel({
            nummer: i,
            platz: platz,
            datum: datum,
            uhrzeit: zeit,
            label: helper.calcSpielLabel(gruppe)
        });
        const data = helper.leeresSpiel(spieleGesamt, leereSpieleStreak, i);
        spieleGesamt = data.spieleGesamt;
        leereSpieleStreak = data.leereSpieleStreak;
        shiftTeams();
    }

    function calcSpielDateTime(i) {
        const data = helper.calcSpielDateTime(i, zeiten);
        platz = data.platz;
        zeit = data.zeit;
        datum = data.datum;
    }

    function getTeam(gruppe, gegner, name) {
        const data = helper.getTeam(gruppe, gegner, geradeSpielendeTeams, lastPlayingTeams, spiele, name, i);
        geradeSpielendeTeams = data.geradeSpielendeTeams;
        if (gegner) {
            teamB = data.team;
        } else {
            teamA = data.team;
        }
    }

    function failure(reason) {
        let errorMessage = 'Unkown Error when generating Gruppenphase';
        switch(reason) {
            case 'tooManyEmptySpiele':
                errorMessage = 'Spielplan-Generation failed! Too many empty Spiele';
                break;
            case 'spieleGesamtNull':
                errorMessage = 'SpieleGesamt calulation returned invalid value';
                break;
        }

        logger.error(errorMessage);
        return cb(new Error(errorMessage));
    }

    function gruppenIterator(gruppe) {
        if (helper.checkSpieleFuerGruppeUebrig(gruppe, spiele)) {
            logger.verbose('Spiel #%d: Started', i);
            logger.verbose('Spiel #%d: Gruppe %s', i, gruppe.name);

            getTeam(gruppe, undefined, 'TeamA');
            getTeam(gruppe, teamA, 'TeamB');

            if (!_.isUndefined(teamA) && !_.isUndefined(teamB)) {
                calcSpielDateTime(i);

                addSpiel({
                    nummer: i,
                    platz: platz,
                    uhrzeit: zeit,
                    datum: datum,
                    gruppe: gruppe._id,
                    jugend: gruppe.jugend._id,
                    teamA: teamA._id,
                    teamB: teamB._id,
                    label: helper.calcSpielLabel(gruppe)
                });
                logger.verbose('Spiel #%d: Done', i - 1);
                leereSpieleStreak = 0;
                shiftTeams();
                return;
            }
        }
        leerdurchgelaufeneGruppen++;
    }

    if (spieleGesamt > 0) {
        while (i <= spieleGesamt) {
            leerdurchgelaufeneGruppen = 0;
            if (leereSpieleStreak >= maxLeereSpieleStreak) {
                return failure('tooManyEmptySpiele');
            }

            // Main Part
            gruppen.forEach(gruppenIterator);

            if (leerdurchgelaufeneGruppen === gruppen.length) {
                if (leereSpieleStreak >= maxLeereSpieleStreak) {
                    return failure('tooManyEmptySpiele');
                }
                leeresSpiel(gruppen[0]);
            }
        }

        return cb(null, spiele);
    }

    return failure('spieleGesamtNull');
};