const logger = require('winston').loggers.get('apiHelper');
const async = require('async');
const messages = require('./messages/messages.js')();
const _ = require('lodash');
const handler = require('./handler.js');
const jsonwebtoken = require('jsonwebtoken');
const md5 = require('md5');
const moment = require('moment');
const mongoose = require('mongoose');
const Team = mongoose.model('Team');
const Gruppe = mongoose.model('Gruppe');
const Jugend = mongoose.model('Jugend');
const Spiel = mongoose.model('Spiel');
const Veranstaltung = mongoose.model('Veranstaltung');
const request = require('request');
const helper = require('../models/helper.js');
const cls = require('../config/cls.js');

function getEntityQuery(model, req) {
    logger.silly('Getting Entity Query');
    let query = model.find({});
    let searchById = false;
    if (req.query.id) {
        logger.silly('Query by ID');
        searchById = true;
        query = model.findOne({_id: mongoose.Types.ObjectId(req.query.id)});
    } else if (req.query.team) {
        //noinspection JSUnresolvedFunction
        logger.silly('Query by Team');
        query = model.find({}).or([{
            teamA: req.query.team
        }, {
            teamB: req.query.team
        }]);
    } else if (req.query.gruppe) {
        logger.silly('Query by Gruppe');
        query = model.find({gruppe: req.query.gruppe});
        if (model.modelName === 'Team') {
            query = model.find({$or: [{gruppe: req.query.gruppe}, {zwischengruppe: req.query.gruppe}]});
        }
    } else if (req.query.jugend) {
        logger.silly('Query by Jugend');
        query = model.find({jugend: req.query.jugend});
    } else if (req.query.date) {
        logger.silly('Query by Date');
        const day = moment(req.query.date, 'YYYY-MM-DD');
        query = model.find({datum: day.format('DD.MM.YYYY')});
    } else if (req.query.slug) {
        logger.silly('Query by Slug');
        searchById = true;
        query = model.findOne({rawSlug: req.query.slug});
    } else if (req.query.identifier) {
        logger.silly('Query by Slug Or ID');
        searchById = true;
        let id;
        try {
            id = mongoose.Types.ObjectId(req.query.identifier);
            query = model.findOne({_id: id});
        } catch (err) {
            query = model.findOne({slug: req.query.identifier});
        }
    }
    return {
        query: query,
        searchById: searchById
    }
}

function splitPopulation(populationStr) {
    return _.groupBy(populationStr.split(' '), function (str) {
        return str.split('.').length;
    });
}

function clsdeepPopulate(model, data, population, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    const splittedPopulation = splitPopulation(population);

    let result = data;
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return async.forEachOf(splittedPopulation, function (val, key, cb) {
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);

                const fn = key === 1 ? model.populate : clsSession.bind(model.deepPopulate.bind(model));
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return fn(data, val.join(' '), function (err, doc) {
                        if (err) return cb(err);

                        result = doc;
                        return cb();
                    });
                });
            });
        }, function (err) {
            if (err) return cb(err);

            return cb(null, data);
        });
    });
}

function getEntity(model, population, notFoundMessage, res, req) {
    const queryData = getEntityQuery(model, req);
    const query = queryData.query;
    const searchById = queryData.searchById;
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();

    logger.silly('Getting Entity %s', model.modelName);
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return query.exec(function (err, data) {
            if (err) {
                return messages.Error(res, err);
            }

            if (!data) {
                return messages.ErrorNotFound(res);
            }

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);

                clsdeepPopulate(model, data, population, function (err, data) {
                    if (err) return messages.Error(res, err);

                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);

                        return model.populate(data, 'fromA fromB from teamA.from teamB.from', function (err, data) {
                            if (err) return messages.Error(res, err);

                            return clsSession.run(function () {
                                clsSession.set('beachEventID', beachEventID);
                                return fill(data, function (err, data) {
                                    return handler.handleQueryResponse(err, data, res, searchById, notFoundMessage);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

function findEntityAndPushTeam(model, id, team, res, callback) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return model.findOne({_id: mongoose.Types.ObjectId(id)}).exec(function (err, data) {
            if (err) {
                return messages.Error(res, err);
            }

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return data.pushTeams(team, function (err) {
                    if (err) {
                        return messages.Error(res, err);
                    }

                    return callback();
                });
            });
        });
    });
}

function removeEntityBy(model, by, value, cb) {
    const query = {};
    query[by] = value;
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        query.veranstaltung = beachEventID;
        return model.remove(query, function (err) {
            if (err) {
                return cb(err);
            }

            return cb(null);
        });
    });
}

function removeLastSlashFromPath(path) {
    //Cut off slash at the end
    if (_.isEqual(path.slice(-1), '/')) {
        path = path.substring(0, path.length - 1);
    }
    return path;
}

function verifyToken(req, secret) {
    logger.silly('Verifying Token');
    let obj;
    try {
        obj = jsonwebtoken.verify(req.get('Authorization'), secret, {algorithms: ["HS256"]});
    } catch (err) {
        logger.warn('Token not valid!');
        return undefined;
    }
    logger.silly('Token is valid');
    return obj;
}

function saveUserAndSendMail(user, res, mail) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return user.save(function (err) {
            if (err) {
                if (err.code === 11000) {
                    logger.warn('User %s already exists', user.username);
                    return messages.ErrorUserExistiertBereits(res, user.username);
                }
                return messages.Error(res, err);
            }

            logger.verbose('Sending Mail');
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return mail(user, function (err) {
                    return handler.handleErrorAndSuccess(err, res);
                });
            });
        });
    });
}

function addEntity(model, req, res) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        const entity = new model(req.body);

        entity.veranstaltung = beachEventID;
        entity.save(function (err, entity) {
            return handler.handleErrorAndResponse(err, res, entity);
        });
    });
}

function getRequiredRouteConfig(routes, path, method, configKey) {
    logger.silly('Getting Route Config');
    path = removeLastSlashFromPath(path);
    let route = routes[path];

    if (_.isUndefined(route) || _.isNull(route)) {
        logger.silly('No Route-Config Found');
        return undefined;
    }

    route = _.cloneDeep(route[configKey]);

    logger.silly('Check Route is for all Methods');
    if (_.isArray(route)) {
        return route;
    }

    if (_.isString(route)) {
        return route.split(' ');
    }

    if (_.isUndefined(route) || _.isNull(route)) {
        return undefined;
    }

    logger.silly('Get Route Config for Method');

    const routeconfig = route[method];

    if (_.isArray(routeconfig) || _.isObject(route)) {
        return routeconfig;
    }

    if (_.isString(routeconfig)) {
        return routeconfig.split(' ');
    }

    logger.silly('No Route-Config Found');
    return undefined;
}

function checkSpielOrderChangeAllowed(spiele) {
    logger.verbose('Check Spiel Order Allowed');
    const plaetze = parseInt(process.env.PLAETZE, 10);
    logger.verbose('Calculated %d Plätze', plaetze);
    let teamsParallel = [];
    for (let i = 0; i < spiele.length; i += plaetze) {
        logger.verbose('Adding Teams to Array for every Spiel');
        for (let j = i; j < i + plaetze; j++) {
            if (j < spiele.length) {
                if (spiele[j].teamA && spiele[j].teamB) {
                    teamsParallel.push(spiele[j].teamA._id);
                    teamsParallel.push(spiele[j].teamB._id);
                }
            }
        }

        logger.verbose('Check if Team is duplicate');
        if (_.uniq(teamsParallel).length !== teamsParallel.length) {
            logger.warn('Duplicate Team found at index %d. The Spiel-Order is not valid', i);
            return i;
        }
        teamsParallel = [];
    }

    logger.verbose('Spiel Order is Valid');
    return -1;
}

function checkSpielplanZeitValid(val, format) {
    if (!val) {
        logger.error('%s is not given', val);
        return false
    }

    if (!moment(val, format).isValid()) {
        logger.error('%s is not valid', val);
        return false;
    }

    return true;
}

function checkSpielplanZeitenValid(spielplan) {
    const requiredKeys = [{
        val: spielplan.startzeit,
        format: 'HH:mm'
    }, {
        val: spielplan.endzeit,
        format: 'HH:mm'
    }, {
        val: spielplan.spielzeit,
        format: 'numer'
    }, {
        val: spielplan.pausenzeit,
        format: 'HH:mm'
    }, {
        val: spielplan.startdatum,
        format: 'DD.MM.YYYY'
    }];
    let valid = true;
    _.forEach(requiredKeys, function (current) {
        if (!checkSpielplanZeitValid(current.val, current.format)) {
            valid = false;
        }
    });
    return valid;
}

function getPlaetze() {
    let plaetze;
    try {
        plaetze = parseInt(process.env.PLAETZE, 10);
    } catch (err) {
        logger.error(err);
    }
    if (!plaetze || _.isNaN(plaetze)) {
        return logger.error('Anzahl Plätze is not given');
    }
    return plaetze;
}

function calcSpielDateTimePresets(spielplan, nr, plaetze, delays) {
    const startDatum = moment(spielplan.startdatum, 'DD.MM.YYYY');
    const dailyStartTime = moment(spielplan.startzeit, 'HH:mm');
    const dailyEndTime = moment(spielplan.endzeit, 'HH:mm');
    let spielzeit, pausenzeit;
    try {
        spielzeit = parseInt(spielplan.spielzeit, 10);
        pausenzeit = parseInt(spielplan.pausenzeit, 10);
    } catch (e) {
        logger.error(e);
        return undefined;
    }
    const spielePerDay = Math.floor(dailyEndTime.diff(dailyStartTime, 'minutes') / (spielzeit + pausenzeit)) * plaetze;
    if (spielePerDay < 0) {
        logger.warn('Less than 0 Spiele per Day were calculated');
        return undefined;
    }
    const offsetDays = Math.floor((nr - 1) / spielePerDay);
    if (offsetDays < 0) {
        logger.warn('Negative Offset of Days!');
        return undefined;
    }
    const offsetSpiele = (nr - 1) % spielePerDay;
    if (offsetSpiele < 0) {
        logger.warn('Negative Offset of Spiele!');
        return undefined;
    }
    let delayBefore = 0;

    _.forIn(delays, function (value, key) {
        const i = parseInt(key, 10);

        if (i < (nr - 1)) {
            delayBefore += value;
        }
    });
    return {
        dailyStartTime: dailyStartTime,
        dailyEndTime: dailyEndTime,
        spielePerDay: spielePerDay,
        offsetDays: offsetDays,
        offsetSpiele: offsetSpiele,
        delayBefore: delayBefore,
        startDatum: startDatum,
        spielzeit: spielzeit,
        pausenzeit: pausenzeit
    }
}

function calcSpielDateTime(nr, spielplan, delays) {
    delays = delays || {};
    logger.silly('Calculate Date and Time for a Spiel');
    if (!checkSpielplanZeitenValid(spielplan)) {
        return undefined;
    }

    const plaetze = getPlaetze();
    const presets = calcSpielDateTimePresets(spielplan, nr, plaetze, delays);
    logger.silly('Calculated Presets', {
        dailyStartTime: presets.dailyStartTime.format('HH:mm'),
        dailyEndTime: presets.dailyEndTime.format('HH:mm'),
        spielePerDay: presets.spielePerDay,
        offsetDays: presets.offsetDays,
        offsetSpiele: presets.offsetSpiele,
        delayBefore: presets.delayBefore,
        startDatum: presets.startDatum.format('DD.MM.YYYY'),
        spielzeit: presets.spielzeit,
        pausenzeit: presets.pausenzeit
    });

    if (!presets) {
        return;
    }

    const date = presets.startDatum
        .set({'hour': presets.dailyStartTime.get('hour'), 'minute': presets.dailyStartTime.get('minute')})
        .add(presets.offsetDays, 'days')
        .add(presets.delayBefore, 'minutes');
    const time = presets.dailyStartTime
        .add(Math.floor(presets.offsetSpiele / plaetze) * (presets.spielzeit + presets.pausenzeit) + presets.delayBefore, 'minutes');
    const platz = (presets.offsetSpiele % plaetze) + 1;
    logger.silly('Calculated Date: %s', date.format('DD.MM.YYYY'));
    logger.silly('Calculated Time: %s', time.format('HH:mm'));
    logger.silly('Calculated Platz: %d', platz);
    return {
        date: date.format('DD.MM.YYYY'),
        time: time.format('HH:mm'),
        platz: platz
    }
}

function getSpielErgebnisse(cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return Spiel.find({}).exec(function (err, spiele) {
            if (err) return cb(err, undefined);

            const ergebnisse = [];
            spiele.forEach(function (spiel) {
                if (spiel.beendet) {
                    ergebnisse.push({
                        teamA: spiel.teamA,
                        teamB: spiel.teamB,
                        toreA: spiel.toreA,
                        toreB: spiel.toreB
                    });
                }
            });

            return cb(undefined, ergebnisse);
        });
    });
}

function gruppeFindPlace(teams, spieleDerGruppe, platz, gruppe, callback) {
    logger.silly('Calculating Platz of Gruppe');
    const nichtbeendete = spieleDerGruppe.filter(function (single) {
        return !single.beendet;
    });
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        const key = gruppe.type === 'normal' ? 'gruppe' : 'zwischenGruppe';
        if (nichtbeendete.length === 0) {
            logger.silly('All Games Played');
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return helper.sortTeams(teams, key, Spiel, gruppe, function (err, sorted) {
                    if (err) return callback(err);

                    return callback(null, sorted[platz - 1]);
                });
            });
        }

        return callback(null, undefined);
    });
}

function fillSpielFromSpiel(spiel, cb) {
    logger.verbose('Filling Spiel Nummer %d from Spiel', spiel.nummer);
    const calculatedTeams = {
        A: undefined,
        B: undefined
    };
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return async.each(['A', 'B'], function (letter, next) {
            const from = spiel['from' + letter];
            if (!from) {
                return next();
            }
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return Spiel.findOne({_id: mongoose.Types.ObjectId(from._id)}, function(err, foundSpiel) {
                    if (err) return next(err);

                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);
                        Spiel.populate(foundSpiel, 'teamA teamB gewinner', function (err, foundSpiel) {
                            if (err) return next(err);

                            if (!foundSpiel || !foundSpiel.beendet) {
                                return next();
                            }

                            if (spiel['rank' + letter] > 0) {
                                calculatedTeams[letter] = foundSpiel.gewinner;
                            } else {
                                if (foundSpiel.teamA && foundSpiel.teamA._id &&
                                    foundSpiel.teamB && foundSpiel.teamB._id &&
                                    foundSpiel.gewinner && foundSpiel.gewinner._id) {
                                    if (foundSpiel.teamA._id.toString() === foundSpiel.gewinner._id.toString()) {
                                        calculatedTeams[letter] = foundSpiel.teamB;
                                    } else {
                                        calculatedTeams[letter] = foundSpiel.teamA;
                                    }
                                }
                            }
                            return next();
                        });
                    });
                });
            });
        }, function (err) {
            if (err) return cb(err);

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return Spiel.findOneAndUpdate({'_id': mongoose.Types.ObjectId(spiel._id.toString())}, {
                    $set: {
                        teamA: calculatedTeams.A,
                        teamB: calculatedTeams.B
                    }
                }, {new: true}, function (err, spiel) {
                    if (err) return cb(err);

                    return cb();
                });
            });
        });
    });
}

function fillSpielFromGruppe(spiel, cb) {
    logger.verbose('Filling Spiel Nummer %d from Gruppe', spiel.nummer);
    const calculatedTeams = {
        A: undefined,
        B: undefined
    };
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return async.each(['A', 'B'], function (letter, next) {
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return Team.find({
                    $or: [{
                        gruppe: spiel['from' + letter]._id,
                        veranstaltung: beachEventID
                    }, {
                        zwischengruppe: spiel['from' + letter].id,
                        veranstaltung: beachEventID
                    }]
                }, function (err, teams) {
                    if (err) return next(err);

                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);
                        return fill(teams, function (err, teams) {
                            if (err) return next(err);

                            return clsSession.run(function () {
                                clsSession.set('beachEventID', beachEventID);
                                return Spiel.find({gruppe: spiel['from' + letter]._id}).exec(function (err, spiele) {
                                    if (err) return next(err);

                                    return clsSession.run(function () {
                                        clsSession.set('beachEventID', beachEventID);
                                        return gruppeFindPlace(teams, spiele, spiel['rank' + letter], spiel['from' + letter], function (err, team) {
                                            if (err) return next(err);

                                            calculatedTeams[letter] = team;
                                            return next();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }, function (err) {
            if (err) return cb(err);

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return Spiel.findOneAndUpdate({'_id': mongoose.Types.ObjectId(spiel._id.toString())}, {
                    $set: {
                        teamA: calculatedTeams.A,
                        teamB: calculatedTeams.B
                    }
                }, {new: true}, function (err) {
                    if (err) return cb(err);

                    return cb();
                });
            });
        });
    });
}

function fillTeamFromGruppe(team, cb) {
    logger.verbose('Filling Team %s from Gruppe', team._id);
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return Team.find({gruppe: team.from._id}).exec(function (err, teams) {
            if (err) return cb(err);

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return Team.populate(teams, 'jugend', function (err, teams) {
                    if (err) return cb(err);

                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);
                        return Spiel.find({gruppe: team.from._id}).exec(function (err, spiele) {
                            if (err) return cb(err);

                            return clsSession.run(function () {
                                clsSession.set('beachEventID', beachEventID);
                                return gruppeFindPlace(teams, spiele, team.rank, team.from, function (err, originalTeam) {
                                    if (err) return cb(err);
                                    if (!originalTeam) return cb();

                                    return clsSession.run(function () {
                                        clsSession.set('beachEventID', beachEventID);
                                        return Team.update({'_id': originalTeam}, {'zwischengruppe': team.gruppe._id}, function (err) {
                                            if (err) return cb(err);

                                            return clsSession.run(function () {
                                                clsSession.set('beachEventID', beachEventID);
                                                return Gruppe.updateTeamInGruppe(team.gruppe._id, team._id, originalTeam._id, function (err) {
                                                    if (err) return cb(err);

                                                    return clsSession.run(function () {
                                                        clsSession.set('beachEventID', beachEventID);
                                                        return Spiel.updateTeamInSpiele(team._id, originalTeam._id, function (err) {
                                                            if (err) return cb(err);

                                                            return clsSession.run(function () {
                                                                clsSession.set('beachEventID', beachEventID);
                                                                return Jugend.removeTeam(originalTeam.jugend._id, team._id, function (err) {
                                                                    if (err) return cb(err);

                                                                    return clsSession.run(function () {
                                                                        clsSession.set('beachEventID', beachEventID);
                                                                        return removeEntityBy(Team, '_id', team._id, cb);
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
                        });
                    });
                });
            });
        });
    });
}

function fillSpiele(callback) {
    logger.verbose('Filling Spiele with Team Infos');
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return Spiel.find({label: {$ne: 'normal'}}).exec(function (err, spiele) {
            if (err) return callback(err);

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                Spiel.deepPopulate(spiele, 'jugend gruppe teamA teamB fromA fromB', function (err, spiele) {
                    if (err) return callback(err);

                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);
                        Spiel.populate(spiele, 'fromA fromB', function (err, spiele) {
                            if (err) return callback(err);
                            return clsSession.run(function () {
                                clsSession.set('beachEventID', beachEventID);
                                Spiel.populate(spiele, 'fromA.teams fromB.teams', function (err, spiele) {
                                    if (err) return callback(err);


                                    return async.each(spiele, function (spiel, cb) {
                                        if (!spiel.from && !spiel.fromType) {
                                            return cb();
                                        }
                                        return clsSession.run(function () {
                                            clsSession.set('beachEventID', beachEventID);
                                            if (spiel.fromType === 'Spiel' && !spiel.beendet) {
                                                return clsSession.run(function () {
                                                    clsSession.set('beachEventID', beachEventID);
                                                    fillSpielFromSpiel(spiel, cb);
                                                });
                                            } else if (spiel.fromType === 'Gruppe' && !spiel.beendet) {
                                                return clsSession.run(function () {
                                                    clsSession.set('beachEventID', beachEventID);
                                                    return fillSpielFromGruppe(spiel, cb);
                                                });
                                            }
                                            return cb('Invalid fromType ' + spiel.fromType);
                                        });
                                    }, function (err) {
                                        if (err) return callback(err);

                                        return clsSession.run(function () {
                                            clsSession.set('beachEventID', beachEventID);
                                            return Team.find({isPlaceholder: true}).exec(function (err, teams) {
                                                if (err) return callback(err);

                                                return clsSession.run(function () {
                                                    clsSession.set('beachEventID', beachEventID);

                                                    return Team.populate(teams, 'teamA teamB from gruppe jugend', function (err, teams) {
                                                        if (err) return callback(err);

                                                        teams = teams.filter(function (single) {
                                                            return !single.name && single.from
                                                        });

                                                        return async.each(teams, function (team, cb) {
                                                            return clsSession.run(function () {
                                                                clsSession.set('beachEventID', beachEventID);
                                                                if (team.fromType === 'Gruppe') {
                                                                    return fillTeamFromGruppe(team, cb);
                                                                }
                                                                return cb('Invalid fromType ' + team.fromType);
                                                            });
                                                        }, function (err) {
                                                            if (err) return callback(err);

                                                            return callback();
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
            });
        });
    });
}

function teamCalcErgebnisse(team, gruppe, cb) {
    const query = {
        beendet: true
    };
    if (gruppe) {
        query.gruppe = gruppe;
    }
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return Spiel.find(query).or([{
            teamA: team
        }, {
            teamB: team
        }]).exec(function (err, spiele) {
            if (err) return cb(err);

            const result = {
                punkte: 0,
                gpunkte: 0,
                tore: 0,
                gtore: 0,
                spiele: spiele.length
            };

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return async.each(spiele, function (spiel, next) {
                    const isTeamA = spiel.teamA.toString() === team._id.toString();
                    result.punkte += spiel['punkte' + (isTeamA ? 'A' : 'B')];
                    result.gpunkte += spiel['punkte' + (isTeamA ? 'B' : 'A')];
                    result.tore += spiel['tore' + (isTeamA ? 'A' : 'B')];
                    result.gtore += spiel['tore' + (isTeamA ? 'B' : 'A')];
                    return next();
                }, function (err) {
                    if (err) return cb(err);

                    return cb(null, result);
                });
            });
        });
    });
}

function fill(entity, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        if (_.isArray(entity)) {
            if (entity.length === 0) return cb(null, entity);
            const data = [];

            return async.eachOf(entity, function (e, index, next) {
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    if (typeof e.fill !== "function") {
                        data[index] = e;
                        return next();
                    }
                    return e.fill(function (err, d) {
                        if (err) return next(err);
                        data[index] = d;
                        return next();
                    });
                });
            }, function (err) {
                if (err) return cb(err);

                return cb(null, data);
            });
        } else if (_.isObject(entity)) {
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);

                if (typeof entity.fill !== "function" || !entity._id) {
                    return cb(null, entity);
                }
                return entity.fill(cb);
            });
        }
        return cb('Not able to fill');
    });
}

function checkSpielnextBeendet(spiel, cb) {
    let checks = [{fromA: spiel._id}, {fromB: spiel._id}];
    if (spiel.gruppe && spiel.gruppe._id) {
        checks = checks.concat([{fromA: spiel.gruppe._id}, {fromB: spiel.gruppe._id}]);
    }
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return Spiel.find({$or: checks}).exec(function (err, spiele) {
            if (err) return cb(err);

            const beendete = spiele.filter(function (single) {
                return single.beendet;
            });

            return cb(null, beendete.length === 0);
        });
    });
}

function checkSpielChangeable(spielid, cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return Spiel.findOne({_id: mongoose.Types.ObjectId(spielid)}).exec(function (err, spiel) {
            if (err) return cb(err);

            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                spiel.populate('gruppe', function (err, spiel) {
                    if (err) return cb(err);

                    if (spiel.label === 'normal') {
                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            return checkEndrundeStarted(function (err, res) {
                                if (err) return cb(err);

                                if (res) {
                                    return cb(null, false);
                                }

                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', beachEventID);
                                    return checkSpielnextBeendet(spiel, cb);
                                });
                            });
                        });
                    }
                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);
                        return checkSpielnextBeendet(spiel, cb);
                    });
                });
            });
        });
    });
}

function checkEndrundeStarted(callback) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return Spiel.find({label: {$ne: 'normal'}}).exec(function (err, spiele) {
            if (err) return callback(err);

            if (!spiele || spiele.length === 0) {
                return callback(null, false);
            }

            const endrundeSpieleBeendet = spiele.filter(function (single) {
                return single.beendet;
            });

            if (endrundeSpieleBeendet.length > 0) {
                return callback(null, true);
            }

            return callback(null, false);
        });
    });
}

function updateDocByKeys(doc, keys, data) {
    keys.forEach(function (key) {
        if (data[key]) {
            logger.silly('Set %s to %s', key, data[key]);
            doc[key] = data[key];
        }
    });
    return doc;
}

function reloadAnmeldeObjects(cb) {
    const beachEventID = cls.getBeachEventID();
    const clsSession = cls.getNamespace();
    return clsSession.run(function () {
        clsSession.set('beachEventID', beachEventID);
        return Team.find({anmeldungsId: {$ne: null}}, function (err, teams) {
            if (err) return cb(err);

            return async.each(teams, function (team, next) {
                return request(process.env.BEACHENMELDUNG_TEAM_URL + team.anmeldungsId, function (err, status, body) {
                    if (err) {
                        logger.warn('Error when retrieving Team from Anmeldung', err);
                        return next();
                    }

                    body = JSON.parse(body);

                    if (status.statusCode < 400 && body && body._id) {
                        _.assign(body, {'expires': moment().add(1, 'd').toISOString()});
                        team.anmeldungsObjectString = JSON.stringify(body);
                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            return team.save(function (err) {
                                if (err) {
                                    logger.warn(err);
                                }

                                return next();
                            });
                        });
                    }
                    return next();
                });
            }, function (err) {
                if (err) return cb(err);

                return cb();
            });
        });
    });
}

function getVeranstaltungData(cb) {
    const result = {
        SPIEL_MODE: undefined,
        MANNSCHAFTSLISTEN_PRINT: undefined
    };
    const beachEventID = cls.getBeachEventID();
    if (!beachEventID) {
        logger.warn('No beachEventID present for config');
        return cb(null, result);
    }
    return Veranstaltung.findById(beachEventID, function (err, event) {
        if (err) return cb(err);
        result.SPIEL_MODE = event.spielModus;
        result.MANNSCHAFTSLISTEN_PRINT = event.printMannschaftslisten;
        return cb(null, result);
    });
}

module.exports = {
    getEntityQuery: getEntityQuery,
    getEntity: getEntity,
    removeEntityBy: removeEntityBy,
    removeLastSlashFromPath: removeLastSlashFromPath,
    verifyToken: verifyToken,
    saveUserAndSendMail: saveUserAndSendMail,
    findEntityAndPushTeam: findEntityAndPushTeam,
    getRequiredRouteConfig: getRequiredRouteConfig,
    addEntity: addEntity,
    checkSpielOrderChangeAllowed: checkSpielOrderChangeAllowed,
    calcSpielDateTime: calcSpielDateTime,
    getSpielErgebnisse: getSpielErgebnisse,
    sortTeams: helper.sortTeams,
    fillSpiele: fillSpiele,
    gruppeFindPlace: gruppeFindPlace,
    teamCalcErgebnisse: teamCalcErgebnisse,
    checkSpielChangeable: checkSpielChangeable,
    checkEndrundeStarted: checkEndrundeStarted,
    updateDocByKeys: updateDocByKeys,
    reloadAnmeldeObjects: reloadAnmeldeObjects,
    getVeranstaltungData: getVeranstaltungData,
    clsdeepPopulate: clsdeepPopulate
};