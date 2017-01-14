module.exports = function () {
    /* eslint no-loop-func: 0 */

    var moment = require('moment');
    var async = require('async');
    var _ = require('lodash');
    var helper = require('./helper.js');

    var spielplanGenerator = {};

    spielplanGenerator.generateNew = function (cb) {
        //init variables
        var leereSpieleStreak = 0;
        var maxLeereSpieleStreak = 6;
        var spiele = [];
        var spieleGesamt;
        var plaetze = 3;

        var zeit;
        var zeiten;
        var gruppen = [];
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

                var lastPlayingTeams = [];
                var geradeSpielendeTeams = [];
                var i = 1;
                var platz = plaetze; //Bei 3 anfangen macht calcPlatz einfacher
                var leerdurchgelaufeneGruppen = 0;

                var leeresSpiel = function () {
                    console.log('Spielplanerstellung: Spiel Nr.' + i + ': Leeres Spiel');
                    platz = helper.calcPlatz(platz, plaetze);
                    zeit = helper.calcZeit(platz, zeit, zeiten, i);
                    var spiel = {
                        nummer: i,
                        platz: platz,
                        uhrzeit: zeit.format('HH:mm')
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
                        //Throw error
                    }

                    /* jshint loopfunc: true */
                    _.forEach(gruppen, function (gruppe) {
                        if (helper.checkSpieleFuerGruppeUebrig(gruppe, spiele)) {
                            console.log('Spielerstellung Nr. ' + i + ': gestartet');
                            var teamA = helper.getTeamWithoutLast(gruppe, geradeSpielendeTeams, lastPlayingTeams, spiele);
                            if (!_.isUndefined(teamA)) {
                                geradeSpielendeTeams = helper.addLastTeam(teamA, geradeSpielendeTeams);
                                console.log('Spielerstellung Nr. ' + i + ': TeamA gewählt: ' + teamA.name);

                                var teamB = helper.getPossibleGegner(gruppe, teamA, geradeSpielendeTeams, lastPlayingTeams, spiele);
                                if (!_.isUndefined(teamB)) {
                                    geradeSpielendeTeams = helper.addLastTeam(teamB, geradeSpielendeTeams);
                                    console.log('Spielerstellung Nr. ' + i + ': TeamB gewählt: ' + teamB.name);

                                    platz = helper.calcPlatz(platz, plaetze);
                                    console.log('Spielerstellung Nr. ' + i + ': Platz vergeben: ' + platz);

                                    zeit = helper.calcZeit(platz, zeit, zeiten, i);
                                    console.log('Spielerstellung Nr. ' + i + ': Spielzeit angesetzt: ' + zeit.format('HH:mm'));

                                    var neuesSpiel = {
                                        nummer: i,
                                        platz: platz,
                                        uhrzeit: zeit.format('HH:mm'),
                                        gruppe: gruppe._id,
                                        jugend: gruppe.jugend._id,
                                        teamA: teamA._id,
                                        teamB: teamB._id
                                    };
                                    spiele.push(neuesSpiel);
                                    console.log('Spielplanerstellung: Spiel Nr.' + i + ' für Gruppe ' + gruppe.name + ' erstellt.');
                                    i++;
                                    leereSpieleStreak = 0;
                                    if (i > 1 && (i - 1) % 3 === 0) {
                                        lastPlayingTeams = geradeSpielendeTeams;
                                        geradeSpielendeTeams = [];
                                    }
                                }else {
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
                        leeresSpiel();
                    }
                }
                if (_.last(spiele).platz === 1) {
                    for (var j = 0; j < 2; j++) {
                        leeresSpiel();
                    }
                } else if (_.last(spiele).platz === 2) {
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