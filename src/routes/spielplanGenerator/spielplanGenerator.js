module.exports = function () {
    /* eslint no-loop-func: 0 */

    const moment = require('moment');
    const async = require('async');
    const _ = require('lodash');
    const helper = require('./helper.js');
    const helpers = require('../helpers.js')();

    const spielplanGenerator = {};

    spielplanGenerator.generateNew = function (cb) {
        //init variables
        let leereSpieleStreak = 0;
        const maxLeereSpieleStreak = 6;
        const spiele = [];
        let spieleGesamt;
        const plaetze = parseInt(process.env.PLAETZE, 10) || 3;

        let zeit;
        let zeiten;
        let gruppen = [];
        //GetZeiten, GetGruppen, delete Spiele, resetErgebnisse
        async.parallel([
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
            helper.deleteSpiele,
            helper.resetErgebnisse
        ], function (err) {
            if (err) return cb(err);

            zeit = moment(zeiten.startzeit, 'HH:mm');
            spieleGesamt = helper.calcSpieleGesamt(gruppen);
            if (spieleGesamt > 0) {
                console.log('Spielplanerstellung: Anzahl Spiele: ' + spieleGesamt);

                let lastPlayingTeams = [];
                let geradeSpielendeTeams = [];
                let i = 1;
                let platz = plaetze; //Bei n anfangen macht calcPlatz einfacher
                let leerdurchgelaufeneGruppen = 0;
                let datum;

                const leeresSpiel = function () {
                    console.log('Spielplanerstellung: Spiel Nr.' + i + ': Leeres Spiel');
                    const dateTimeObj = helpers.calcSpielDateTime(i, zeiten);
                    platz = dateTimeObj.platz;
                    zeit = dateTimeObj.time;
                    datum = dateTimeObj.date;
                    const spiel = {
                        nummer: i,
                        platz: platz,
                        datum: datum,
                        uhrzeit: zeit
                    };
                    spiele.push(spiel);
                    i++;
                    spieleGesamt++;
                    leereSpieleStreak++;
                    if (i > 1 && (i - 1) % plaetze === 0) {
                        lastPlayingTeams = geradeSpielendeTeams;
                        geradeSpielendeTeams = [];
                    }
                };

                while (i <= spieleGesamt) {
                    leerdurchgelaufeneGruppen = 0;
                    if (leereSpieleStreak >= maxLeereSpieleStreak) {
                        console.error('Spielerstellung gescheitert: Zu viele leere Spiele');
                        return cb(new Error('Zu viele leere Spiele'));
                    }

                    _.forEach(gruppen, function (gruppe) {
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
                                    platz = dateTimeObj.platz;
                                    zeit = dateTimeObj.time;
                                    datum = dateTimeObj.date;

                                    console.log('Spielerstellung Nr. ' + i + ': Platz vergeben: ' + platz);
                                    console.log('Spielerstellung Nr. ' + i + ': Spielzeit angesetzt: ' + datum + ' ' + zeit);

                                    const neuesSpiel = {
                                        nummer: i,
                                        platz: platz,
                                        uhrzeit: zeit,
                                        datum: datum,
                                        gruppe: gruppe._id,
                                        jugend: gruppe.jugend._id,
                                        teamA: teamA._id,
                                        teamB: teamB._id
                                    };
                                    spiele.push(neuesSpiel);
                                    console.log('Spielplanerstellung: Spiel Nr.' + i + ' für Gruppe ' + gruppe.name + ' erstellt.');
                                    i++;
                                    leereSpieleStreak = 0;
                                    if (i > 1 && (i - 1) % plaetze === 0) {
                                        lastPlayingTeams = geradeSpielendeTeams;
                                        geradeSpielendeTeams = [];
                                    }
                                } else {
                                    leerdurchgelaufeneGruppen++;
                                }
                            } else {
                                leerdurchgelaufeneGruppen++;
                            }
                        } else {
                            leerdurchgelaufeneGruppen++;
                        }
                    });
                    if(leerdurchgelaufeneGruppen === gruppen.length) {
                        if (leereSpieleStreak >= maxLeereSpieleStreak) {
                            console.error('Spielerstellung gescheitert: Zu viele leere Spiele');
                            return cb(new Error('Zu viele leere Spiele'));
                        }
                        leeresSpiel();
                    }
                }
                for (let j = 0; j <= (plaetze - _.last(spiele).platz); j++) {
                    leeresSpiel();
                }

                helper.saveSpiele(spiele, function (err) {
                    if(err) return cb(err);
                    console.log('Alle Spiele gespeichert');
                    return cb();
                });
            }
        });
    };

    return spielplanGenerator;
};