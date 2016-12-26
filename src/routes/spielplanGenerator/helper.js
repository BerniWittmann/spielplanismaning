var _ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');
var moment = require('moment');

var Spielplan = mongoose.model('Spielplan');
var Spiel = mongoose.model('Spiel');
var Gruppen = mongoose.model('Gruppe');
var Team = mongoose.model('Team');

function calcSpieleGesamt(gruppen) {
    var sum = 0;
    _.forEach(gruppen, function (gruppe) {
        var n = gruppe.teams.length;
        sum += (n * (n - 1)) / 2;
    });

    return sum;
}

function getTeamWithoutLast(gruppe, geradeSpielendeTeams, lastPlayingTeams, spiele) {
    var teams = [];
    _.extend(teams, gruppe.teams);
    _.pullAllBy(teams, geradeSpielendeTeams, '_id');

    var moeglTeams = [];
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
    var team = _.head(teams);
    var spieleTeam = getSpieleByTeam(team, spiele);
    _.forEach(teams, function (t) {
        var spieleT = getSpieleByTeam(t, spiele);

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
    var alle = [];
    _.extend(alle, gruppe.teams);
    _.pullAllBy(alle, geradeSpielendeTeams, '_id');
    var spiele = getSpieleByTeam(team, games);
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

    var moeglicheGegner = [];
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

function calcZeit(platz, zeit, spielplan, spielnr) {
    if (spielnr > 1 && platz == 1) {
        zeit = zeit.add(spielplan.spielzeit + spielplan.pausenzeit, 'm');
    }
    return zeit;
}

function calcPlatz(platz, plaetze) {
    platz++;
    if (platz > plaetze) {
        platz = 1;
    }
    return platz;
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
    var max = (gruppe.teams.length * (gruppe.teams.length - 1) / 2);
    var result = getSpieleByGruppe(gruppe, spiele).length;
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

function deleteSpiele(cb) {
    Spiel.remove({}).exec(function (err) {
        if(err) {
            return cb(err);
        }
        return cb();
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
    async.each(spiele, function (spiel, callback) {
        Spiel.create(spiel, function (err) {
            if(err) return callback(err);
            return callback();
        });
    }, function (err) {
        if(err) return cb(err);
        return cb();
    });
}

module.exports = {
    calcSpieleGesamt: calcSpieleGesamt,
    getTeamWithoutLast: getTeamWithoutLast,
    getPossibleGegner: getPossibleGegner,
    addLastTeam: addLastTeam,
    calcZeit: calcZeit,
    calcPlatz: calcPlatz,
    getSpieleByTeam: getSpieleByTeam,
    getSpieleByGruppe: getSpieleByGruppe,
    checkSpieleFuerGruppeUebrig: checkSpieleFuerGruppeUebrig,
    getZeiten: getZeiten,
    getGruppen: getGruppen,
    deleteSpiele: deleteSpiele,
    resetErgebnisse: resetErgebnisse,
    saveSpiele: saveSpiele
};