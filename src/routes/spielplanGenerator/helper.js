const _ = require('lodash');
const logger = require('winston').loggers.get('spielplanGenerator');
const mongoose = require('mongoose');
const async = require('async');
const moment = require('moment');
const helpers = require('../helpers.js')();

const Spielplan = mongoose.model('Spielplan');
const Spiel = mongoose.model('Spiel');
const Gruppen = mongoose.model('Gruppe');
const Team = mongoose.model('Team');

function calcSpieleGesamt(gruppen) {
    let sum = 0;
    _.forEach(gruppen, function (gruppe) {
        const n = gruppe.teams.length;
        sum += (n * (n - 1)) / 2;
    });

    return sum;
}

function getTeamWithoutLast(gruppe, geradeSpielendeTeams, lastPlayingTeams, spiele) {
    let teams = [];
    _.extend(teams, gruppe.teams);
    _.pullAllBy(teams, geradeSpielendeTeams, '_id');

    const moeglTeams = [];
    _.extend(moeglTeams, teams);

    _.pullAllBy(teams, lastPlayingTeams, '_id');
    if (teams.length === 0) {
        teams = moeglTeams;
    }

    if (teams.length === 0) {
        //Empty Game
        return undefined;
    }
    return chooseTeam(teams, spiele);
}

function chooseTeam(teams, spiele) {
    if (_.size(teams) === 0) {
        return undefined;
    }
    let team = _.head(teams);
    let spieleTeam = getSpieleByTeam(team, spiele);
    _.forEach(teams, function (t) {
        const spieleT = getSpieleByTeam(t, spiele);

        if (spieleT.length < spieleTeam.length) {
            team = t;
            spieleTeam = getSpieleByTeam(team, spiele);
        } else if (spieleT.length === spieleTeam.length) {
            //Randomly choose one
            team = _.head(_.shuffle([team, t]));
            spieleTeam = getSpieleByTeam(team, spiele);
        }
    });
    return team;
}

function getPossibleGegner(gruppe, team, geradeSpielendeTeams, lastPlayingTeams, games) {
    const alle = [];
    _.extend(alle, gruppe.teams);
    _.pullAllBy(alle, geradeSpielendeTeams, '_id');
    const spiele = getSpieleByTeam(team, games);
    const bereitsgespielt = [team];
    _.forEach(spiele, function (spiel) {
        if (_.isEqual(spiel.teamA, team._id)) {
            bereitsgespielt.push({
                _id: spiel.teamB
            });
        } else if (_.isEqual(spiel.teamB, team._id)) {
            bereitsgespielt.push({
                _id: spiel.teamA
            });
        }
    });
    _.pullAllBy(alle, bereitsgespielt, '_id');

    let moeglicheGegner = [];
    _.extend(moeglicheGegner, alle);

    _.pullAllBy(moeglicheGegner, lastPlayingTeams, '_id');
    if (moeglicheGegner.length === 0) {
        moeglicheGegner = alle;
    }
    return chooseTeam(moeglicheGegner, games);
}

function addLastTeam(team, geradeSpielendeTeams) {
    geradeSpielendeTeams.push(team);
    return geradeSpielendeTeams;
}

function getSpieleByTeam(team, spiele) {
    return _.filter(spiele, function (o) {
        return _.isEqual(o.teamA, team._id) || _.isEqual(o.teamB, team._id);
    });
}

function getSpieleByGruppe(gruppe, spiele) {
    return _.filter(spiele, function (o) {
        return _.isEqual(o.gruppe, gruppe._id);
    });
}

function checkSpieleFuerGruppeUebrig(gruppe, spiele) {
    const max = (gruppe.teams.length * (gruppe.teams.length - 1) / 2);
    const result = getSpieleByGruppe(gruppe, spiele).length;
    return result < max;
}

function getZeiten(cb) {
    Spielplan.findOne({}).exec(function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(undefined, data);
    });
}

function getGruppen(cb) {
    Gruppen.find({}).deepPopulate('jugend teams').exec(function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(undefined, data);
    });
}

function getAllSpiele(cb) {
    return Spiel.find({}).exec(function (err, data) {
        if (err) {
            return cb(err);
        }
        return cb(undefined, data);
    });
}

function deleteSpiele(cb) {
    Spiel.remove({}).exec(function (err) {
        if (err) {
            return cb(err);
        }
        return cb();
    });
}

function updateAllSpiele(spiele, cb) {
    return Spiel.remove({}).exec(function (err) {
        if (err) {
            return cb(err);
        }

        return saveSpiele(spiele, function (err) {
            if (err) return cb(err);
            return cb();
        });
    });
}

function resetErgebnisse(cb) {
    Team.find().exec(function (err, teams) {
        if (err) {
            return cb(err);
        }

        async.each(teams, function (team, callback) {
            team.resetErgebnis(function (err) {
                if (err) {
                    return callback(err);
                }

                return callback();
            });
        }, function (err) {
            if (err) {
                return cb(err);
            }

            return cb();
        });
    });
}

function saveSpiele(spiele, cb) {
    return async.each(spiele, function (spiel, callback) {
        Spiel.create(spiel, function (err) {
            if (err) return callback(err);
            return callback();
        });
    }, function (err) {
        if (err) return cb(err);
        return cb();
    });
}

function deleteNotCompletedSpiele(cb) {
    return Spiel.remove({beendet: false}, function (err) {
        if (err) return cb(err);
        return cb();
    });
}

function addSpiel(spiel, spiele, i) {
    spiele.push(spiel);
    i++;

    return {spiele: spiele, i: i, teamA: undefined, teamB: undefined};
}

function shiftTeams(i, plaetze, geradeSpielendeTeams, lastPlayingTeams) {
    if (i > 1 && (i - 1) % plaetze === 0) {
        lastPlayingTeams = geradeSpielendeTeams;
        geradeSpielendeTeams = [];
    }
    return {lastPlayingTeams: lastPlayingTeams, geradeSpielendeTeams: geradeSpielendeTeams};
}

function leeresSpiel(spieleGesamt, leereSpieleStreak, i) {
    logger.verbose('Spiel #%d: Empty Spiel', i);
    spieleGesamt++;
    leereSpieleStreak++;
    return {spieleGesamt: spieleGesamt, leereSpieleStreak: leereSpieleStreak};
}

function calcSpielDateTime(i, zeiten) {
    const dateTimeObj = helpers.calcSpielDateTime(i, zeiten);
    if (!dateTimeObj) {
        return logger.error('Couldn\'t calculate spiel data');
    }
    const platz = dateTimeObj.platz;
    const zeit = dateTimeObj.time;
    const datum = dateTimeObj.date;

    logger.verbose('Spiel #%d: Platz %d Date&Time %s %s', i, platz, datum, zeit);

    return {platz: platz, zeit: zeit, datum: datum};
}

function getTeam(gruppe, gegner, geradeSpielendeTeams, lastPlayingTeams, spiele, name, i) {
    let team;
    if (gegner) {
        //TeamB
        team = getPossibleGegner(gruppe, gegner, geradeSpielendeTeams, lastPlayingTeams, spiele);
    } else {
        //teamA
        team = getTeamWithoutLast(gruppe, geradeSpielendeTeams, lastPlayingTeams, spiele);
    }
    if (!_.isUndefined(team)) {
        geradeSpielendeTeams = addLastTeam(team, geradeSpielendeTeams);
        logger.verbose('Spiel #%d: Choose %s: %s', i, name, team.name);
    }
    return {team: team, geradeSpielendeTeams: geradeSpielendeTeams};
}

function configureProperties(payload) {
    logger.silly('Running with Payload', payload);
    const plaetze = parseInt(process.env.PLAETZE, 10) || 3;
    logger.verbose('Using %d Plätze', plaetze);
    const gruppen = payload.gruppen;
    const spiele = payload.spiele;
    const zeiten = payload.zeiten;
    const leereSpiele = _.countBy(spiele, 'beendet')['undefined'] || 0;
    const spieleGesamt = calcSpieleGesamt(gruppen) + leereSpiele;
    logger.verbose('%d Spiele need to be generated', spieleGesamt);
    return {
        plaetze: plaetze,
        zeiten: zeiten,
        gruppen: gruppen,
        spiele: spiele,
        lastPlayingTeams: payload.lastPlayingTeams,
        geradeSpielendeTeams: payload.geradeSpielendeTeams,
        i: payload.i,
        platz: plaetze,
        leerdurchgelaufeneGruppen: 0,
        datum: undefined,
        leereSpieleStreak: 0,
        teamA: undefined,
        teamB: undefined,
        maxLeereSpieleStreak: plaetze * 2,
        zeit: moment(zeiten.startzeit, 'HH:mm'),
        spieleGesamt: spieleGesamt
    }
}

module.exports = {
    calcSpieleGesamt: calcSpieleGesamt,
    getTeamWithoutLast: getTeamWithoutLast,
    getPossibleGegner: getPossibleGegner,
    addLastTeam: addLastTeam,
    getSpieleByTeam: getSpieleByTeam,
    getSpieleByGruppe: getSpieleByGruppe,
    checkSpieleFuerGruppeUebrig: checkSpieleFuerGruppeUebrig,
    getZeiten: getZeiten,
    getGruppen: getGruppen,
    deleteSpiele: deleteSpiele,
    resetErgebnisse: resetErgebnisse,
    saveSpiele: saveSpiele,
    deleteNotCompletedSpiele: deleteNotCompletedSpiele,
    getAllSpiele: getAllSpiele,
    updateAllSpiele: updateAllSpiele,
    addSpiel: addSpiel,
    shiftTeams: shiftTeams,
    leeresSpiel: leeresSpiel,
    calcSpielDateTime: calcSpielDateTime,
    getTeam: getTeam,
    configureProperties: configureProperties
};