module.exports = function () {
    const logger = require('winston').loggers.get('spielplanGenerator');
    /* eslint no-loop-func: 0 */

    const moment = require('moment');
    const async = require('async');
    const _ = require('lodash');
    const helper = require('./helper.js');
    const helpers = require('../helpers.js')();

    const spielplanGenerator = {};

    function generate(payload, cb) {
        logger.verbose('Generator Started');
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

        const addSpiel = function (spiel) {
            const data = helper.addSpiel(spiel, spiele, i);
            spiele = data.spiele;
            i = data.i;
            teamA = data.teamA;
            teamB = data.teamB;
        };

        const shiftTeams = function () {
            const data = helper.shiftTeams(i, plaetze, geradeSpielendeTeams, lastPlayingTeams);
            lastPlayingTeams = data.lastPlayingTeams;
            geradeSpielendeTeams = data.geradeSpielendeTeams;
        };

        if (spieleGesamt > 0) {
            const leeresSpiel = function () {
                calcSpielDateTime(i);
                addSpiel({
                    nummer: i,
                    platz: platz,
                    datum: datum,
                    uhrzeit: zeit
                });
                const data = helper.leeresSpiel(spieleGesamt, leereSpieleStreak, i);
                spieleGesamt = data.spieleGesamt;
                leereSpieleStreak = data.leereSpieleStreak;
                shiftTeams();
            };

            const calcSpielDateTime = function (i) {
                const data = helper.calcSpielDateTime(i, zeiten);
                platz = data.platz;
                zeit = data.zeit;
                datum = data.datum;
            };

            const getTeam = function(gruppe, gegner, name) {
                const data = helper.getTeam(gruppe, gegner, geradeSpielendeTeams, lastPlayingTeams, spiele, name, i);
                geradeSpielendeTeams = data.geradeSpielendeTeams;
                if (gegner) {
                    //TeamB
                    teamB = data.team;
                } else {
                    //teamA
                    teamA = data.team;
                }
            };

            while (i <= spieleGesamt) {
                leerdurchgelaufeneGruppen = 0;
                if (leereSpieleStreak >= maxLeereSpieleStreak) {
                    //Throw error
                    const errorMessage = 'Spielplanerstellung fehlgeschlagen! Zu viele leere Spiele hintereinander.';
                    logger.error('Spielplan-Generation failed! Too many empty Spiele');
                    return cb(new Error(errorMessage));
                }

                gruppen.forEach(function (gruppe) {
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
                                teamB: teamB._id
                            });
                            logger.verbose('Spiel #%d: Done', i - 1);
                            leereSpieleStreak = 0;
                            shiftTeams();
                            return;
                        }
                    }
                    leerdurchgelaufeneGruppen++;
                });

                if (leerdurchgelaufeneGruppen === gruppen.length) {
                    if (leereSpieleStreak >= maxLeereSpieleStreak) {
                        const errorMessage = 'Spielplanerstellung fehlgeschlagen! Zu viele leere Spiele hintereinander.';
                        logger.error('Spielplan-Generation failed! Too many empty Spiele');
                        return cb(new Error(errorMessage));
                    }
                    leeresSpiel();
                }
            }

            if (_.last(spiele).platz < plaetze) {
                logger.verbose('Filling up last Plätze with empty Spielen');
                for (let j = 0; j <= (plaetze - _.last(spiele).platz); j++) {
                    leeresSpiel();
                }
            }

            return cb(null, spiele);
        }
    }

    spielplanGenerator.generateNew = function (cb) {
        logger.verbose('Generate a complete new Spielplan');
        let zeiten;
        let gruppen;
        return async.parallel([
            function (callback) {
                logger.verbose('Loading Times');
                helper.getZeiten(function (err, data) {
                    if (err) return callback(err);
                    zeiten = data;
                    return callback();
                });
            },
            function (callback) {
                logger.verbose('Loading Gruppen');
                helper.getGruppen(function (err, data) {
                    if (err) return callback(err);
                    gruppen = data;
                    callback();
                });
            }
        ], function (err) {
            if (err) return cb(err);

            return generate({
                zeiten: zeiten,
                gruppen: gruppen,
                spiele: [],
                lastPlayingTeams: [],
                geradeSpielendeTeams: [],
                i: 1
            }, function (err, spiele) {
                if (err) {
                    logger.error('Generator errored', err);
                    return cb(err);
                }

                logger.info('Spielplan-Generator generated %d Spiele', spiele.length);
                return helper.updateAllSpiele(spiele, function (err) {
                    if (err) return cb(err);
                    logger.verbose('Saved All Games');

                    logger.verbose('Resetting Results');
                    return helper.resetErgebnisse(function (err) {
                        if (err) return cb(err);

                        return cb();
                    });
                });
            });
        });
    };

    function filterTeams(spiele, teams) {
        return teams.filter(function (team) {
            const spieleDesTeams = spiele.find(function (spiel) {
                return _.isEqual(spiel.teamA, team._id) || _.isEqual(spiel.teamB, team._id);
            });
            return !_.isUndefined(spieleDesTeams);
        });
    }

    spielplanGenerator.regenerate = function (cb) {
        logger.verbose('Generate Spielplan with keeping completed games');
        let zeiten;
        let gruppen;
        let spiele;

        return async.parallel([
            function (callback) {
                logger.verbose('Loading Times');
                helper.getZeiten(function (err, data) {
                    if (err) return callback(err);
                    zeiten = data;
                    return callback();
                });
            },
            function (callback) {
                logger.verbose('Loading Gruppen');
                helper.getGruppen(function (err, data) {
                    if (err) return callback(err);
                    gruppen = data;
                    callback();
                });
            },
            function (callback) {
                logger.verbose('Loading Games');
                helper.getAllSpiele(function (err, data) {
                    if (err) return callback(err);
                    spiele = data;
                    callback();
                });
            }
        ], function (err) {
            if (err) return cb(err);

            let teams = [];

            gruppen.forEach(function (gruppe) {
                teams = teams.concat(gruppe.teams);
            });

            logger.verbose('filter completed games');
            let beendeteSpiele = _.sortBy(_.filter(spiele, function (spiel) {
                return spiel.beendet;
            }), 'nummer');

            const maxNr = _.maxBy(beendeteSpiele, 'nummer');

            logger.verbose('Fill-Up with empty Games');
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

            logger.verbose('Calculate new Date/Time/Platz for Spiele');
            beendeteSpiele = beendeteSpiele.map(function (spiel) {
                const dateTimeObject = helpers.calcSpielDateTime(spiel.nummer, zeiten);
                spiel.uhrzeit = dateTimeObject.time;
                spiel.datum = dateTimeObject.date;
                spiel.platz = dateTimeObject.platz;
                return spiel;
            });

            if (beendeteSpiele.length === 0) {
                logger.verbose('No completed games. Using normal generator');
                return spielplanGenerator.generateNew(cb);
            }

            let geradeSpielendeTeams = filterTeams(beendeteSpiele.slice(-3), teams);
            let lastPlayingTeams = filterTeams(beendeteSpiele.slice(-6, Math.max(beendeteSpiele.length - 3, 0)), teams);

            if (beendeteSpiele.length % parseInt(process.env.PLAETZE, 10) === 0) {
                lastPlayingTeams = geradeSpielendeTeams;
                geradeSpielendeTeams = [];
            }

            return generate({
                zeiten: zeiten,
                gruppen: gruppen,
                spiele: beendeteSpiele,
                lastPlayingTeams: lastPlayingTeams,
                geradeSpielendeTeams: geradeSpielendeTeams,
                i: beendeteSpiele.length + 1
            }, function (err, spiele) {
                if (err) {
                    logger.error('Generator errored', err);
                    return cb(err);
                }

                logger.info('Spielplan-Generator generated %d Spiele', spiele.length);
                return helper.updateAllSpiele(spiele, function (err) {
                    if (err) return cb(err);
                    logger.verbose('Saved All Games');
                    return cb();
                });
            });
        });
    };

    return spielplanGenerator;
};