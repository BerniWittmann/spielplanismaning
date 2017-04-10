module.exports = function () {
    /* eslint no-loop-func: 0 */

    const moment = require('moment');
    const async = require('async');
    const _ = require('lodash');
    const helper = require('./helper.js');
    const helpers = require('../helpers.js')();

    const spielplanGenerator = {};

    function generate(payload, cb) {
        const zeiten = payload.zeiten, gruppen = payload.gruppen, spiele = payload.spiele;
        let lastPlayingTeams = payload.lastPlayingTeams, geradeSpielendeTeams = payload.geradeSpielendeTeams, i = payload.i;

        const leereSpiele = _.countBy(spiele, 'beendet')['undefined'] || 0;

        const plaetze = parseInt(process.env.PLAETZE, 10) || 3;
        const maxLeereSpieleStreak = plaetze * 2;
        let zeit = moment(zeiten.startzeit, 'HH:mm');
        let spieleGesamt = helper.calcSpieleGesamt(gruppen) + leereSpiele;
        let platz = plaetze, leerdurchgelaufeneGruppen = 0, datum, leereSpieleStreak = 0;

        const addSpiel = function (spiel) {
            spiele.push(spiel);
            i++;
        };

        const shiftTeams = function () {
            if (i > 1 && (i - 1) % plaetze === 0) {
                lastPlayingTeams = geradeSpielendeTeams;
                geradeSpielendeTeams = [];
            }
        };

        if (spieleGesamt > 0) {
            console.log('Spielplanerstellung: Anzahl Spiele: ' + spieleGesamt);

            const leeresSpiel = function () {
                console.log('Spielplanerstellung: Spiel Nr.' + i + ': Leeres Spiel');
                const dateTimeObj = helpers.calcSpielDateTime(i, zeiten);
                platz = dateTimeObj.platz;
                zeit = dateTimeObj.time;
                datum = dateTimeObj.date;
                addSpiel({
                    nummer: i,
                    platz: platz,
                    datum: datum,
                    uhrzeit: zeit
                });
                spieleGesamt++;
                leereSpieleStreak++;

                shiftTeams();
            };

            while (i <= spieleGesamt) {
                leerdurchgelaufeneGruppen = 0;
                if (leereSpieleStreak >= maxLeereSpieleStreak) {
                    //Throw error
                    const errorMessage = 'Spielplanerstellung fehlgeschlagen! Zu viele leere Spiele hintereinander.';
                    console.error(errorMessage);
                    return cb(new Error(errorMessage));
                }

                gruppen.forEach(function (gruppe) {
                    if (helper.checkSpieleFuerGruppeUebrig(gruppe, spiele)) {
                        console.log('Spielerstellung Nr. ' + i + ': gestartet');
                        const teamA = helper.getTeamWithoutLast(gruppe, geradeSpielendeTeams, lastPlayingTeams, spiele);
                        if (!_.isUndefined(teamA)) {
                            geradeSpielendeTeams = helper.addLastTeam(teamA, geradeSpielendeTeams);
                            console.log('Spielerstellung Nr. ' + i + ': TeamA gewählt: ' + teamA.name);

                            const teamB = helper.getPossibleGegner(gruppe, teamA, geradeSpielendeTeams, lastPlayingTeams, spiele);
                            if (!_.isUndefined(teamB)) {
                                geradeSpielendeTeams = helper.addLastTeam(teamB, geradeSpielendeTeams);
                                console.log('Spielerstellung Nr. ' + i + ': TeamB gewählt: ' + teamB.name);

                                const dateTimeObj = helpers.calcSpielDateTime(i, zeiten);
                                if (!dateTimeObj) {
                                    console.error('Couldn\'t calculate spiel data');
                                }
                                platz = dateTimeObj.platz;
                                zeit = dateTimeObj.time;
                                datum = dateTimeObj.date;

                                console.log('Spielerstellung Nr. ' + i + ': Platz vergeben: ' + platz);
                                console.log('Spielerstellung Nr. ' + i + ': Spielzeit angesetzt: ' + datum + ' ' + zeit);

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
                                console.log('Spielplanerstellung: Spiel Nr.' + (i - 1)  + ' für Gruppe ' + gruppe.name + ' erstellt.');
                                leereSpieleStreak = 0;
                                shiftTeams();
                                return;
                            }
                        }
                    }
                    leerdurchgelaufeneGruppen++;
                });

                if (leerdurchgelaufeneGruppen === gruppen.length) {
                    if (leereSpieleStreak >= maxLeereSpieleStreak) {
                        console.error('Spielerstellung gescheitert: Zu viele leere Spiele');
                        return cb(new Error('Zu viele leere Spiele'));
                    }
                    leeresSpiel();
                }
            }

            if (_.last(spiele).platz < plaetze) {
                for (let j = 0; j <= (plaetze - _.last(spiele).platz); j++) {
                    leeresSpiel();
                }
            }

            return cb(null, spiele);
        }
    }

    spielplanGenerator.generateNew = function (cb) {
        let zeiten;
        let gruppen;
        return async.parallel([
            function (callback) {
                helper.getZeiten(function (err, data) {
                    if (err) return callback(err);
                    zeiten = data;
                    return callback();
                });
            },
            function (callback) {
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
                    return cb(err);
                }

                return helper.updateAllSpiele(spiele, function (err) {
                    if (err) return cb(err);
                    console.log('Alle Spiele gespeichert');

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
        let zeiten;
        let gruppen;
        let spiele;

        return async.parallel([
            function (callback) {
                helper.getZeiten(function (err, data) {
                    if (err) return callback(err);
                    zeiten = data;
                    return callback();
                });
            },
            function (callback) {
                helper.getGruppen(function (err, data) {
                    if (err) return callback(err);
                    gruppen = data;
                    callback();
                });
            },
            function (callback) {
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

            let beendeteSpiele = _.sortBy(_.filter(spiele, function (spiel) {
                return spiel.beendet;
            }), 'nummer');

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

            beendeteSpiele = beendeteSpiele.map(function (spiel) {
                const dateTimeObject = helpers.calcSpielDateTime(spiel.nummer, zeiten);
                spiel.uhrzeit = dateTimeObject.time;
                spiel.datum = dateTimeObject.date;
                spiel.platz = dateTimeObject.platz;
                return spiel;
            });

            if (beendeteSpiele.length === 0) {
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
                    return cb(err);
                }

                return helper.updateAllSpiele(spiele, function (err) {
                    if (err) return cb(err);
                    console.log('Alle Spiele gespeichert');
                    return cb();
                });
            });
        });
    };

    return spielplanGenerator;
};