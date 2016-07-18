angular
    .module('spi.spielplan', ['spi.auth', 'spi.spiel', 'spi.gruppe', 'spi.team']).factory('spielplan', ['$http', '$q', 'auth', 'spiel', 'gruppe', 'team', 'Logger', function (
    $http,
    $q,
    auth,
    spiel,
    gruppe,
    team,
    Logger
) {

    var ENDPOINT_URL = '/api/spielplan';

    var spielplan = {
        startzeit: undefined
        , spielzeit: undefined
        , pausenzeit: undefined
        , spiele: []
        , progress: 0
        , maxProgress: 0
    };

    var lastPlayingTeams;
    var i;
    var spieleGesamt;
    var platz;
    var plätze = 3;
    var zeit;
    var leereSpieleStreak;
    var maxLeereSpieleStreak = 6;

    var spielplanerstellungRunning = false;

    spielplan.getZeiten = function () {
        return $http.get(ENDPOINT_URL).success(function (data) {
            if (!_.isUndefined(data) && !_.isNull(data)) {
                spielplan.startzeit = moment(data.startzeit, 'HH:mm');
                spielplan.spielzeit = data.spielzeit;
                spielplan.pausenzeit = data.pausenzeit;
                spielplan.ausnahmen = data.ausnahmen;
                zeit = spielplan.startzeit;
            } else {
                spielplan.startzeit = "09:00";
                spielplan.spielzeit = 8;
                spielplan.pausenzeit = 2;
                spielplan.ausnahmen = [];
            }
            return spielplan.data;
        });
    };

    spielplan.saveZeiten = function (zeiten) {
        return $http.put(ENDPOINT_URL + '/zeiten', zeiten, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function (data) {
            return data;
        });
    };

    spielplan.createSpielplan = function () {
        spielplanerstellungRunning = true;
        spielplan.progress = 0;
        spielplan.getZeiten();
        spiel.deleteAll();
        leereSpieleStreak = 0;
        spielplan.spiele = [];
        team.resetErgebnisse();
        spielplan.error = undefined;
        return gruppe.getAll().then(function (gruppen) {
            spieleGesamt = calcSpieleGesamt(gruppen.data);
            Logger.log('Spielplanerstellung: Anzahl Spiele: ' + spieleGesamt);
            spielplan.maxProgress = spieleGesamt + 1;

            lastPlayingTeams = [];
            geradeSpielendeTeams = [];
            i = 1;
            platz = 3; //Bei 3 anfangen macht calcPlatz einfacher

            var leerdurchgelaufeneGruppen = 0;

            while (i <= spieleGesamt) {
                leerdurchgelaufeneGruppen = 0;
                if(leereSpieleStreak >= maxLeereSpieleStreak) {
                    Logger.log('Zu viele Ausnahmen! ' + leereSpieleStreak + ' leere Spiele hintereinander.');
                    spieleGesamt = 0;
                    spiel.deleteAll();
                    spielplan.spiele = [];
                    team.resetErgebnisse();
                    spielplanerstellungRunning = false;
                    spielplan.progress = 0;
                    spielplan.error = 'Zu viele Ausnahmen! Spielplanerstellung nicht möglich!';
                    return undefined;
                }
                _.forEach(gruppen.data, function (gruppe) {
                    if (checkSpieleFürGruppeÜbrig(gruppe)) {
                        Logger.log('Spielerstellung Nr. ' + i + ': gestartet');

                        var teamA = getTeamWithoutLast(gruppe);
                        if (!_.isUndefined(teamA)) {
                            addLastTeam(teamA);
                            Logger.log('Spielerstellung Nr. ' + i + ': TeamA gewählt: ' + teamA.name);

                            var teamB = getPossibleGegner(gruppe, teamA);
                            if (!_.isUndefined(teamB)) {
                                addLastTeam(teamB);
                                Logger.log('Spielerstellung Nr. ' + i + ': TeamB gewählt: ' + teamB.name);

                                var platz = calcPlatz();
                                Logger.log('Spielerstellung Nr. ' + i + ': Platz vergeben: ' + platz);

                                var zeit = calcZeit(platz);
                                Logger.log('Spielerstellung Nr. ' + i + ': Spielzeit angesetzt: ' + zeit);

                                var neuesSpiel = {
                                    nummer: i
                                    , platz: platz
                                    , uhrzeit: zeit
                                    , gruppe: gruppe._id
                                    , jugend: gruppe.jugend._id
                                    , teamA: teamA._id
                                    , teamB: teamB._id
                                };

                                spielplan.spiele.push(neuesSpiel);
                                Logger.log('Spielplanerstellung: Spiel Nr.' + i + ' für Gruppe ' + gruppe.name + ' erstellt.');
                                i++;
                                leereSpieleStreak = 0;
                                spielplan.progress++;
                                if (i > 1 && (i - 1) % 3 == 0) {
                                    lastPlayingTeams = geradeSpielendeTeams
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
                if (leerdurchgelaufeneGruppen == gruppen.data.length) {
                    //Leeres Spiel
                    Logger.log('Spielplanerstellung: Spiel Nr.' + i + ': Leeres Spiel');
                    var leeresSpiel = {
                        nummer: i
                        , platz: calcPlatz()
                        , uhrzeit: calcZeit()
                    }
                    spielplan.spiele.push(leeresSpiel);
                    i++;
                    spieleGesamt++;
                    leereSpieleStreak++;
                    spielplan.progress++;
                    spielplan.maxProgress++;
                    if (i > 1 && (i - 1) % 3 == 0) {
                        lastPlayingTeams = geradeSpielendeTeams
                        geradeSpielendeTeams = [];
                    }
                }
            }

            if (_.last(spielplan.spiele).platz == 1) {
                for (var j = 0; j < 2; j++) {
                    Logger.log('Spielplanerstellung: Spiel Nr.' + i + ': Leeres Spiel');
                    var leeresSpiel = {
                        nummer: i
                        , platz: calcPlatz()
                        , uhrzeit: calcZeit()
                    };
                    spielplan.spiele.push(leeresSpiel);
                    i++;
                    spieleGesamt++;
                    leereSpieleStreak++;
                    spielplan.progress++;
                    spielplan.maxProgress++;
                    if (i > 1 && (i - 1) % 3 == 0) {
                        lastPlayingTeams = geradeSpielendeTeams;
                        geradeSpielendeTeams = [];
                    }
                }
            } else if (_.last(spielplan.spiele).platz == 2) {
                Logger.log('Spielplanerstellung: Spiel Nr.' + i + ': Leeres Spiel');
                var leeresSpiel = {
                    nummer: i
                    , platz: calcPlatz()
                    , uhrzeit: calcZeit()
                };
                spielplan.spiele.push(leeresSpiel);
                i++;
                spieleGesamt++;
                leereSpieleStreak++;
                spielplan.progress++;
                spielplan.maxProgress++;
                if (i > 1 && (i - 1) % 3 == 0) {
                    lastPlayingTeams = geradeSpielendeTeams
                    geradeSpielendeTeams = [];
                }
            }

            spielplan.maxProgress++;
            $http.post('/api/spiele/alle', spielplan.spiele).then(pushSpiele, function (err) {
                console.log(err);
            });

            function pushSpiele() {
                Logger.log('Alle Spiele gespeichert');
                spiel.getAll().then(function (spiele) {
                    spielplan.spiele = spiele;
                });

                spielplan.progress = spielplan.maxProgress;
                spielplanerstellungRunning = false;
            }
        });
    };

    function calcSpieleGesamt(gruppen) {
        var sum = 0;
        _.forEach(gruppen, function (gruppe) {
            var n = gruppe.teams.length;
            sum += (n * (n - 1)) / 2;
        });

        return sum;
    }

    function getTeamWithoutLast(gruppe) {
        var teams = [];
        _.extend(teams, gruppe.teams);
        _.pullAllBy(teams, geradeSpielendeTeams, '_id');

        teams = removeAusnahmen(teams, geradeSpielendeTeams);
        var moeglTeams = [];
        _.extend(moeglTeams, teams);

        _.pullAllBy(teams, lastPlayingTeams, '_id');
        if (teams.length == 0) {
            teams = moeglTeams;
        }

        if (teams.length == 0) {
            //Empty Game
            return undefined;
        }
        return chooseTeam(teams);
    }

    function chooseTeam(teams) {
        if (_.size(teams) === 0) {
            return undefined;
        }
        var team = _.head(teams);
        spieleTeam = getSpieleByTeam(team);
        _.forEach(teams, function (t) {
            spieleT = getSpieleByTeam(t);

            if (spieleT.length < spieleTeam.length) {
                team = t;
                spieleTeam = getSpieleByTeam(team);
            } else if (spieleT.length === spieleTeam.length) {
                //Randomly choose one
                team = _.head(_.shuffle([team, t]));
                spieleTeam = getSpieleByTeam(team);
            }
        });
        return team;
    }

    function getPossibleGegner(gruppe, team) {
        var alle = [];
        _.extend(alle, gruppe.teams);

        _.pullAllBy(alle, geradeSpielendeTeams, '_id');
        alle = removeAusnahmen(alle, geradeSpielendeTeams);

        var spiele = getSpieleByTeam(team);
        var bereitsgespielt = [team];
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

        var möglicheGegner = [];
        _.extend(möglicheGegner, alle);

        _.pullAllBy(möglicheGegner, lastPlayingTeams, '_id');
        if (möglicheGegner.length == 0) {
            möglicheGegner = alle;
        }
        return chooseTeam(möglicheGegner);
    }

    function addLastTeam(team) {
        geradeSpielendeTeams.push(team);
    }

    function calcZeit(platz) {
        if (i > 1 && platz == 1) {
            zeit = zeit.add(spielplan.spielzeit + spielplan.pausenzeit, 'm');
        }
        return zeit.format('HH:mm');

    }

    function calcPlatz() {
        platz++;
        if (platz > plätze) {
            platz = 1;
        }
        return platz;
    }

    function getSpieleByTeam(team) {
        return _.filter(spielplan.spiele, function (o) {
            return _.isEqual(o.teamA, team._id) || _.isEqual(o.teamB, team._id);
        });
    }

    function getSpieleByGruppe(gruppe) {
        return _.filter(spielplan.spiele, function (o) {
            return _.isEqual(o.gruppe, gruppe._id);
        })
    }

    function checkSpieleFürGruppeÜbrig(gruppe) {
        var max = (gruppe.teams.length * (gruppe.teams.length - 1) / 2);
        var result = getSpieleByGruppe(gruppe).length;
        return result < max;
    }

    function removeAusnahmen(teams, geradeSpielendeTeams) {
        var zuloeschendeTeams = [];
        _.forEach(geradeSpielendeTeams, function (team) {
            var ausnahmeproTeam = getAusnahmenGegner(team);
            _.forEach(ausnahmeproTeam, function (o) {
                zuloeschendeTeams.push(o);
            })
        });
        _.pullAllBy(teams, zuloeschendeTeams, '_id');
        return teams;
    }

    function getAusnahmenGegner(team) {
        var ausnahmenGegner = [];
        _.forEach(spielplan.ausnahmen, function (o) {
            if(!_.isNull(o.team1) && _.isEqual(o.team1._id, team._id)) {
                ausnahmenGegner.push(o.team2);
            }else if(!_.isNull(o.team2) && _.isEqual(o.team2._id, team._id)) {
                ausnahmenGegner.push(o.team1);
            }
        });
        return ausnahmenGegner;
    }

    window.onbeforeunload = function () {
        if (spielplanerstellungRunning) {
            return "Achtung! Spielplan wird gerade erstellt! Es verbleiben noch " + Math.round(spielplan.progress / spielplan.maxProgress) + "%. Bitte schließen Sie die Seite noch nicht!";
        }
    };

    return spielplan;
}]);