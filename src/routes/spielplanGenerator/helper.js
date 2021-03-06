const _ = require('lodash');
const logger = require('winston').loggers.get('spielplanGenerator');
const mongoose = require('mongoose');
const async = require('async');
const moment = require('moment');
const helpers = require('../helpers.js');

const Spielplan = mongoose.model('Spielplan');
const Spiel = mongoose.model('Spiel');
const Gruppen = mongoose.model('Gruppe');
const Team = mongoose.model('Team');
const Jugend = mongoose.model('Jugend');
const spielLabels = require('./spielLabels.js');
const cls = require('../../config/cls.js');

function calcSpieleGesamt(gruppen) {
    let sum = 0;
    _.forEach(gruppen, function (gruppe) {
        const n = gruppe.teams.length;
        sum += (n * (n - 1)) / 2;
    });

    return sum;
}

function getPlaetze() {
    return parseInt(process.env.PLAETZE, 10) || 3;
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
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return Spielplan.findOne({}, function (err, data) {
            if (err) {
                return cb(err);
            }
            return cb(undefined, data);
        });
    });
}

function getGruppen(cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        return Gruppen.find({}).exec(function (err, data) {
            if (err) {
                return cb(err);
            }

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                Gruppen.deepPopulate(data, 'jugend teams', function (err, data) {
                    if (err) return cb(err);
                    return cb(undefined, data);
                });
            });

        });
    });
}

function getAllSpiele(cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return Spiel.find({}).exec(function (err, data) {
            if (err) {
                return cb(err);
            }
            return cb(undefined, data);
        });
    });
}

function deleteSpiele(cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        Spiel.remove({veranstaltung: beachEventID}).exec(function (err) {
            if (err) {
                return cb(err);
            }
            return cb();
        });
    });
}

function updateAllSpiele(spiele, keep, cb) {
    let query = deleteSpiele;
    if (keep) {
        query = deleteNotCompletedSpiele;
    }
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return query(function (err) {
            if (err) {
                return cb(err);
            }

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return saveSpiele(spiele, function (err) {
                    if (err) return cb(err);
                    return cb();
                });
            });
        });
    });
}

function saveSpiele(spiele, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return async.each(spiele, function (spiel, callback) {
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                spiel.veranstaltung = beachEventID;
                const game = new Spiel(spiel);
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return game.save(function (err) {
                        if (err) return callback(err);

                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            return callback();
                        });
                    });
                });
            });
        }, function (err) {
            if (err) return cb(err);
            return cb();
        });
    });
}

function deleteNotCompletedSpiele(cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return Spiel.remove({beendet: false, veranstaltung: beachEventID}, function (err) {
            if (err) return cb(err);
            return cb();
        });
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
    const dateTimeObj = helpers.calcSpielDateTime(i, zeiten, {});
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
    const plaetze = getPlaetze();
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

function filterTeams(spiele, teams) {
    return teams.filter(function (team) {
        const spieleDesTeams = spiele.find(function (spiel) {
            return _.isEqual(spiel.teamA, team._id) || _.isEqual(spiel.teamB, team._id);
        });
        return !_.isUndefined(spieleDesTeams);
    });
}

function fillBeendeteSpieleWithEmpty(beendeteSpiele) {
    const maxNr = _.maxBy(beendeteSpiele, 'nummer');
    if (maxNr && maxNr.nummer !== beendeteSpiele.length) {
        const arr = [];
        for (let i = 1; i <= maxNr.nummer; i++) {
            let spiel = _.find(beendeteSpiele, function (single) {
                return single.nummer === i;
            });

            if (!spiel) {
                spiel = {
                    nummer: i
                };
            }

            arr.push(spiel);
        }
        beendeteSpiele = arr;
    }

    return beendeteSpiele;
}

function filterCompleteSpiele(spiele) {
    return _.sortBy(_.filter(spiele, function (spiel) {
        return spiel.beendet;
    }), 'nummer');
}

function recalculateDateTimePlatzForSpiele(spiele, zeiten) {
    if (spiele && zeiten) {
        return spiele.map(function (spiel) {
            const dateTimeObject = helpers.calcSpielDateTime(spiel.nummer, zeiten, {});
            spiel.uhrzeit = dateTimeObject.time;
            spiel.datum = dateTimeObject.date;
            spiel.platz = dateTimeObject.platz;
            return spiel;
        });
    }
    return undefined
}

function calculatePresetSpielplanData(data) {
    let teams = [];

    data.gruppen.forEach(function (gruppe) {
        teams = teams.concat(gruppe.teams);
    });

    logger.verbose('Filter completed games');
    let beendeteSpiele = filterCompleteSpiele(data.spiele);

    logger.verbose('Fill-Up with empty Games');
    beendeteSpiele = fillBeendeteSpieleWithEmpty(beendeteSpiele);

    logger.verbose('Calculate new Date/Time/Platz for Spiele');
    beendeteSpiele = recalculateDateTimePlatzForSpiele(beendeteSpiele, data.zeiten);

    if (beendeteSpiele.length === 0) {
        logger.verbose('No completed games. Using normal generator');
        return {
            spiele: [],
            lastPlayingTeams: [],
            geradeSpielendeTeams: [],
            i: 1
        };
    }

    let geradeSpielendeTeams = filterTeams(beendeteSpiele.slice(-3), teams);
    let lastPlayingTeams = filterTeams(beendeteSpiele.slice(-6, Math.max(beendeteSpiele.length - 3, 0)), teams);

    if (beendeteSpiele.length % getPlaetze() === 0) {
        lastPlayingTeams = geradeSpielendeTeams;
        geradeSpielendeTeams = [];
    }

    return {
        spiele: beendeteSpiele,
        lastPlayingTeams: lastPlayingTeams,
        geradeSpielendeTeams: geradeSpielendeTeams,
        i: beendeteSpiele.length + 1
    }
}

function getGruppenWithSameJugend(gruppen) {
    const jugenden = _.groupBy(gruppen, 'jugend._id');
    return _.pickBy(jugenden, function (jugend) {
        return jugend.length > 1;
    });
}

function getMaxGruppenProJugend(gruppen) {
    return _.reduce(getGruppenWithSameJugend(gruppen), function (max, current) {
        if (current && current.length > max) {
            return current.length;
        }
        return max;
    }, 0);
}

function checkGenerateEndRunde(gruppen) {
    return getMaxGruppenProJugend(gruppen) > 1;
}

function calcTeamsAdvance(gruppenByJugend) {
    const result = process.env.TEAMS_ADVANCE || 99999;
    let max = 99999;
    _.forIn(gruppenByJugend, function (gruppen) {
        gruppen.forEach(function (gruppe) {
            max = gruppe.teams.length < max ? gruppe.teams.length : max;
        });
    });

    return Math.min(Math.max(result, 0), max);
}

function getSpielUmLabel(rankA, rankB) {
    if (rankA !== rankB || rankA < 1) {
        return undefined;
    }
    let i = 1;
    let result = 1;
    while (i < rankA) {
        result += 2;
        i++;
    }
    if (result === 1) {
        return spielLabels.FINALE;
    }
    return spielLabels.SPIEL_UM + result;
}

function fillLastEmptySpiele(spiele, zeiten, label) {
    const plaetze = getPlaetze();
    if (_.last(spiele).platz < plaetze) {
        logger.verbose('Filling up last Plätze with empty Spielen');
        const start = spiele.length + 1;
        for (let j = 0; j <= (plaetze - _.last(spiele).platz); j++) {
            const i = start + j;
            const dateTimeObj = calcSpielDateTime(i, zeiten);
            spiele.push({
                nummer: i,
                uhrzeit: dateTimeObj.zeit,
                datum: dateTimeObj.datum,
                platz: dateTimeObj.platz,
                label: label
            });
        }
    }
    return spiele;
}

function calcSortForZwischenrunde(a, b) {
    if (a.label === spielLabels.ZWISCHENRUNDENSPIEL && a.label !== b.label) {
        return -1;
    } else if (b.label === spielLabels.ZWISCHENRUNDENSPIEL && a.label !== b.label) {
        return 1;
    }
    return a.nummer - b.nummer;
}
function calcSortForFinale(a, b) {
    if (a.label === spielLabels.FINALE && a.label !== b.label) {
        return 1;
    } else if (b.label === spielLabels.FINALE && a.label !== b.label) {
        return -1;
    }
    return 0;
}
function calcSortForHalbFinale(a, b) {
    if (a.label === spielLabels.HALBFINALE && a.label !== b.label) {
        return b.rankA >= 3 ? 1 : -1;
    } else if (b.label === spielLabels.HALBFINALE && a.label !== b.label) {
        return a.rankA >= 3 ? -1 : 1;
    }
    return 0;
}


function sortEndrundeSpiele(a, b) {
    if (a.label === spielLabels.ZWISCHENRUNDENSPIEL || b.label === spielLabels.ZWISCHENRUNDENSPIEL) {
        return calcSortForZwischenrunde(a, b);
    }
    if (a.label === spielLabels.FINALE || b.label === spielLabels.FINALE) {
        return calcSortForFinale(a, b);
    }
    if (a.label === spielLabels.HALBFINALE || b.label === spielLabels.HALBFINALE) {
        return calcSortForHalbFinale(a, b);
    }
    if (a.label && b.label && a.label !== b.label) {
        return a.label < b.label;
    }
    return 0;
}

function getLastZwischenrundeSpielIndex(spiele) {
    return _.findLastIndex(spiele, function (spiel) {
        return !spiel.label;
    });
}

function getLastHalbfinaleIndex(spiele) {
    return _.findLastIndex(spiele, function (spiel) {
        return spiel.label === spielLabels.HALBFINALE;
    });
}

function fillWithEmptyEndrundeByFunction(spiele, fn) {
    const index = fn(spiele);
    const plaetze = getPlaetze();
    const diff = (index + 1) % plaetze;
    if (index > 0 && diff !== 0) {
        for (let i = 1; i <= (3 - diff); i++) {
            spiele.splice((index + i), 0, {label: spielLabels.ZWISCHENRUNDENSPIEL});
        }
    }
    return spiele;
}

function fillEndrundeSpieleWithEmpty(spiele) {
    spiele = fillWithEmptyEndrundeByFunction(spiele, getLastZwischenrundeSpielIndex);
    spiele = fillWithEmptyEndrundeByFunction(spiele, getLastHalbfinaleIndex);
    return spiele;
}

function removeZwischenRundenGruppenUndSpiele(callback) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return removeZwischenRundenGruppe(function (err) {
            if (err) return callback(err);

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return removeEndSpiele(callback);
            });
        });
    });
}

function removeEndSpiele(callback) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return Spiel.remove({label: {$ne: 'normal'}, veranstaltung: beachEventID}, callback);
    });
}

function removeZwischenRundenGruppe(callback) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return Gruppen.find({type: 'zwischenrunde'}, function (err, gruppen) {
            if (err) {
                return callback(err);
            }

            if (!gruppen || gruppen.length === 0) {
                return callback();
            }

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return async.eachSeries(gruppen, function (gruppe, cb) {
                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);

                        return Jugend.findById(gruppe.jugend, function (err, jugend) {
                            if (err) {
                                return cb(err);
                            }

                            if (!jugend) {
                                return cb();
                            }

                            return clsSession.run(function () {
                                clsSession.set('beachEventID', beachEventID);
                                return jugend.removeGruppe(gruppe._id.toString(), function (err) {
                                    if (err) {
                                        return cb(err);
                                    }

                                    return clsSession.run(function () {
                                        clsSession.set('beachEventID', beachEventID);
                                        return helpers.removeEntityBy(Spiel, 'gruppe', gruppe._id.toString(), function (err) {
                                            if (err) return cb(err);

                                            return clsSession.run(function () {
                                                clsSession.set('beachEventID', beachEventID);
                                                return helpers.removeEntityBy(Gruppen, '_id', gruppe._id.toString(), function (err) {
                                                    if (err) {
                                                        return cb(err);
                                                    }

                                                    return cb();
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }, function (err) {
                if (err) return callback(err);

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return helpers.removeEntityBy(Team, 'isPlaceholder', true, function (err) {
                        if (err) return callback(err);

                        return callback();
                    });
                });
            });
        });
    });
}

function calcSpielLabel(gruppe) {
    return gruppe.type === 'normal' ? spielLabels.NORMAL : spielLabels.ZWISCHENRUNDENSPIEL
}

function generateZwischenGruppen(gruppen, jugendid, maxTeamsAdvance, callback) {
    const gruppenLength = gruppen.length;
    const relevantGruppen = [];
    if (gruppenLength <= 2) {
        return callback(null, []);
    }

    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        const groups = [];
        return async.times(maxTeamsAdvance, function (i, next) {
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                const nummer = i + 1;
                logger.verbose('Generating Zwischengruppe ' + nummer);
                const teams = [];

                const gruppenID = mongoose.Types.ObjectId();

                for (let seq = 0; seq < gruppenLength; seq++) {
                    teams.push({
                        _id: mongoose.Types.ObjectId(),
                        rank: ((nummer + seq) % 2 + 1),
                        fromType: 'Gruppe',
                        from: gruppen[seq],
                        isPlaceholder: true,
                        gruppe: gruppenID,
                        jugend: jugendid
                    });
                }

                const gruppe = new Gruppen({
                    _id: gruppenID,
                    name: 'Zwischenrunde Gruppe ' + nummer,
                    type: 'zwischenrunde',
                    jugend: jugendid,
                    teams: teams
                });
                logger.silly('Setting Jugend %s', jugendid);
                gruppe.jugend = jugendid;
                const query = Jugend.findById(gruppe.jugend);

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return query.exec(function (err, jugend) {
                        if (err) {
                            return next(err);
                        }
                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            return gruppe.save(function (err, gruppe) {
                                if (err) {
                                    return next(err);
                                }
                                logger.silly('Gruppe saved');

                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', beachEventID);
                                    return jugend.pushGruppe(gruppe, function (err) {
                                        if (err) return next(err);

                                        groups.push(gruppe);

                                        return async.eachSeries(teams, function (team, callback) {
                                            const t = new Team(team);
                                            return clsSession.run(function () {
                                                clsSession.set('beachEventID', beachEventID);
                                                t.save(function (err) {
                                                    if (err) return callback(err);

                                                    return callback();
                                                });
                                            }, function (err) {
                                                if (err) return next(err);

                                                return clsSession.run(function () {
                                                    clsSession.set('beachEventID', beachEventID);
                                                    return gruppe.deepPopulate('teams jugend', function (err, gruppe) {
                                                        if (err) return next(err);

                                                        relevantGruppen.push(gruppe);
                                                        return next();
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }, function (err) {
            if (err) return callback(err);

            return callback(null, relevantGruppen);
        });
    });
}

function calcDateTimeForEndrundeSpiele(spiele, start, zeiten) {
    return spiele.map(function (spiel, index) {
        const i = start + index;
        const dateTimeObject = calcSpielDateTime(i, zeiten);
        spiel.nummer = i;
        spiel.datum = dateTimeObject.datum;
        spiel.platz = dateTimeObject.platz;
        spiel.uhrzeit = dateTimeObject.zeit;
        return spiel;
    });
}

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

function generateZwischenGruppenHelper(gruppen, maxTeamsAdvance, zeiten, cb) {
    let relevantGruppen = [];
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();

    const gruppenByJugend = getGruppenWithSameJugend(gruppen);
    return async.forEachOf(gruppenByJugend, function (gruppen, jugendid, callback) {
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            return generateZwischenGruppen(gruppen, jugendid, maxTeamsAdvance, function (err, groups) {
                if (err) return callback(err);

                relevantGruppen = relevantGruppen.concat(groups);
                return callback();
            });
        });
    }, function (err) {
        if (err) return cb(err);

        if (!relevantGruppen || relevantGruppen.length === 0) {
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return cb(null, gruppen, []);
            });
        }

        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            return require('./generateGruppenPhase.js')({
                zeiten: zeiten,
                gruppen: relevantGruppen,
                spiele: [],
                lastPlayingTeams: [],
                geradeSpielendeTeams: [],
                i: 1
            }, function (err, spiele) {
                if (err) return cb(err);

                spiele = fillLastEmptySpiele(spiele, zeiten, spielLabels.ZWISCHENRUNDENSPIEL);

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return cb(null, relevantGruppen, spiele);
                });
            });
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
    spiele.push(createSpielFromSpiel(hf1, hf2, 0, 0, jugendid, getSpielUmLabel(2, 2)));

    return spiele;
}

function calculatePlatzierungsspiele(gruppen, jugendid, maxTeamsAdvance) {
    // Spiel um Platz 5 etc.
    const spiele = [];
    let rank = 3;
    const min = gruppen.reduce(function (min, gruppe) {
        return min > gruppe.teams.length ? gruppe.teams.length : min;
    }, Number.MAX_SAFE_INTEGER);
    while (rank <= min) {
        const label = getSpielUmLabel(rank, rank);
        spiele.push(createSpiel(gruppen, rank, rank, jugendid, label));
        rank++
    }

    return spiele;
}

function checkEndrundeStarted(callback) {
    return helpers.checkEndrundeStarted(callback);
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
    saveSpiele: saveSpiele,
    deleteNotCompletedSpiele: deleteNotCompletedSpiele,
    getAllSpiele: getAllSpiele,
    updateAllSpiele: updateAllSpiele,
    addSpiel: addSpiel,
    shiftTeams: shiftTeams,
    leeresSpiel: leeresSpiel,
    calcSpielDateTime: calcSpielDateTime,
    getTeam: getTeam,
    configureProperties: configureProperties,
    filterTeams: filterTeams,
    fillBeendeteSpieleWithEmpty: fillBeendeteSpieleWithEmpty,
    filterCompleteSpiele: filterCompleteSpiele,
    recalculateDateTimePlatzForSpiele: recalculateDateTimePlatzForSpiele,
    calculatePresetSpielplanData: calculatePresetSpielplanData,
    getPlaetze: getPlaetze,
    checkGenerateEndRunde: checkGenerateEndRunde,
    getGruppenWithSameJugend: getGruppenWithSameJugend,
    calcTeamsAdvance: calcTeamsAdvance,
    getSpielUmLabel: getSpielUmLabel,
    fillLastEmptySpiele: fillLastEmptySpiele,
    getMaxGruppenProJugend: getMaxGruppenProJugend,
    sortEndrundeSpiele: sortEndrundeSpiele,
    fillEndrundeSpieleWithEmpty: fillEndrundeSpieleWithEmpty,
    removeZwischenRundenGruppe: removeZwischenRundenGruppe,
    calcSpielLabel: calcSpielLabel,
    generateZwischenGruppen: generateZwischenGruppen,
    calcDateTimeForEndrundeSpiele: calcDateTimeForEndrundeSpiele,
    createSpiel: createSpiel,
    generateZwischenGruppenHelper: generateZwischenGruppenHelper,
    calculateFinalspiele: calculateFinalspiele,
    calculatePlatzierungsspiele: calculatePlatzierungsspiele,
    removeZwischenRundenGruppenUndSpiele: removeZwischenRundenGruppenUndSpiele,
    checkEndrundeStarted: checkEndrundeStarted
};