const logger = require('winston').loggers.get('apiHelper');
const async = require('async');
const messages = require('./messages/messages.js')();
const _ = require('lodash');
const handler = require('./handler.js');
const jsonwebtoken = require('jsonwebtoken');
const md5 = require('md5');
const moment = require('moment');
const mongoose = require('mongoose');
const Spiel = mongoose.model('Spiel');
const Team = mongoose.model('Team');
const Gruppe = mongoose.model('Gruppe');
const Jugend = mongoose.model('Jugend');

function getEntityQuery(model, req) {
    logger.silly('Getting Entity Query');
    let query = model.find();
    let searchById = false;
    if (req.query.id) {
        logger.silly('Query by ID');
        searchById = true;
        query = model.findById(req.query.id);
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
    }
    return {
        query: query,
        searchById: searchById
    }
}

function getEntity(model, population, notFoundMessage, res, req) {
    const queryData = getEntityQuery(model, req);
    const query = queryData.query;
    const searchById = queryData.searchById;
    logger.silly('Getting Entity %s', model.modelName);
    const populatedQuery = query.deepPopulate(population).populate('fromA fromB from');
    populatedQuery.exec(function (err, data) {
        if (err) {
            return messages.Error(res, err);
        }

        return fill(data, function (err, data) {
            return handler.handleQueryResponse(err, data, res, searchById, notFoundMessage);
        });
    });
}

function findEntityAndPushTeam(model, id, team, res, callback) {
    return model.findById(id).exec(function (err, data) {
        if (err) {
            return messages.Error(res, err);
        }
        return data.pushTeams(team, function (err) {
            if (err) {
                return messages.Error(res, err);
            }

            return callback();
        });
    });
}

function removeEntityBy(model, by, value, res, cb) {
    const query = {};
    query[by] = value;
    return model.remove(query, function (err) {
        if (err) {
            return messages.Error(res, err);
        }

        return cb(null);
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
            obj = jsonwebtoken.verify(req.get('Authorization'), secret);
        } catch (err) {
            logger.warn('Token not valid!');
            return undefined;
        }
        logger.silly('Token is valid');
        return obj;
    }

function saveUserAndSendMail(user, res, mail) {
    return user.save(function (err) {
        if (err) {
            if (err.code === 11000) {
                logger.warn('User %s already exists', user.username);
                return messages.ErrorUserExistiertBereits(res, user.username);
            }
            return messages.Error(res, err);
        }

        logger.verbose('Sending Mail');
        return mail(user, function (err) {
            return handler.handleErrorAndSuccess(err, res);
        });

    });
}

function addEntity(model, req, res) {
    const entity = new model(req.body);

    entity.save(function (err, entity) {
        return handler.handleErrorAndResponse(err, res, entity);
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

function calcSpielDateTime(nr, spielplan) {
    logger.silly('Calculate Date and Time for a Spiel');
    const plaetze = parseInt(process.env.PLAETZE, 10);
    logger.silly('Calculated %d Plätze', plaetze);
    const dailyStartTime = moment(spielplan.startzeit, 'HH:mm');
    const dailyEndTime = moment(spielplan.endzeit, 'HH:mm');
    const spielePerDay = Math.floor(dailyEndTime.diff(dailyStartTime, 'minutes') / (spielplan.spielzeit + spielplan.pausenzeit)) * plaetze;
    logger.silly('Calculated %d Spiele per Day', spielePerDay);
    if (spielePerDay < 0) {
        logger.warn('Less than 0 Spiele per Day were calculated');
        return undefined;
    }
    const offsetDays = Math.floor((nr - 1) / spielePerDay);
    logger.silly('Calculated offset of %d days for the Spiel', offsetDays);
    if (offsetDays < 0) {
        logger.warn('Negative Offset of Days!');
        return undefined;
    }
    const offsetSpiele = (nr - 1) % spielePerDay;
    logger.silly('Calculated offset of %d Spiele within the day', offsetSpiele);
    if (offsetSpiele < 0) {
        logger.warn('Negative Offset of Spiele!');
        return undefined;
    }

    const date = moment(spielplan.startdatum, 'DD.MM.YYYY').add(offsetDays, 'days');
    const time = dailyStartTime.add(Math.floor(offsetSpiele / plaetze) * (spielplan.spielzeit + spielplan.pausenzeit), 'minutes');
    const platz = (offsetSpiele % plaetze) + 1;
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
}

function sortTeams(teams, key) {
    if (!key) {
        key = 'all';
    }
    return teams.sort(function (a, b) {
        const ergebnisseA = a.ergebnisse && a.ergebnisse[key] ? a.ergebnisse[key] : {};
        const ergebnisseB = b.ergebnisse && b.ergebnisse[key] ? b.ergebnisse[key] : {};
        let result = ergebnisseA.punkte - ergebnisseB.punkte;
        if (result === 0) {
            result = (ergebnisseA.tore - ergebnisseA.gtore) - (ergebnisseB.tore - ergebnisseB.gtore);
            if (result === 0) {
                result = ergebnisseA.tore - ergebnisseB.tore;
            }
        }
        return result * -1;
    });
}

function gruppeFindPlace(teams, spieleDerGruppe, platz, gruppenType) {
    logger.silly('Calculating Platz of Gruppe');
    const nichtbeendete = spieleDerGruppe.filter(function (single) {
        return !single.beendet;
    });
    const key = gruppenType === 'normal' ? 'gruppe' : 'zwischenGruppe';
    if (nichtbeendete.length === 0) {
        logger.silly('All Games Played');
        const sorted = sortTeams(teams, key);
        return sorted[platz - 1];
    }

    return undefined;
}

function fillSpielFromSpiel(spiel, cb) {
    logger.verbose('Filling Spiel Nummer %d from Spiel', spiel.nummer);
    const calculatedTeams = {
        A: undefined,
        B: undefined
    };
    return async.each(['A', 'B'], function (letter, next) {
        const from = spiel['from' + letter];
        if (!from) {
            return next();
        }
        return Spiel.findById(from._id).populate('teamA teamB gewinner').exec(function (err, foundSpiel) {
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
    }, function (err) {
        if (err) return cb(err);

        return Spiel.findOneAndUpdate({'_id': spiel._id.toString()}, {
            $set: {
                teamA: calculatedTeams.A,
                teamB: calculatedTeams.B
            }
        }, {new: true}, function (err, spiel) {
            if (err) return cb(err);

            return cb();
        });
    });
}

function fillSpielFromGruppe(spiel, cb) {
    logger.verbose('Filling Spiel Nummer %d from Gruppe', spiel.nummer);
    const calculatedTeams = {
        A: undefined,
        B: undefined
    };
    return async.each(['A', 'B'], function (letter, next) {
        return Team.find({gruppe: spiel['from' + letter]._id}).exec(function (err, teams) {
            if (err) return next(err);

            return Spiel.find({gruppe: spiel['from' + letter]._id}).exec(function (err, spiele) {
                if (err) return next(err);

                calculatedTeams[letter] = gruppeFindPlace(teams, spiele, spiel['rank' + letter], spiel['from' + letter].type);
                return next();
            });
        });
    }, function (err) {
        if (err) return cb(err);

        return Spiel.findOneAndUpdate({'_id': spiel._id.toString()}, {
            $set: {
                teamA: calculatedTeams.A,
                teamB: calculatedTeams.B
            }
        }, {new: true}, function (err) {
            if (err) return cb(err);

            return cb();
        });
    });
}

function fillTeamFromGruppe(team, cb) {
    logger.verbose('Filling Team %s from Gruppe', team._id);
    return Team.find({gruppe: team.from._id}).deepPopulate('jugend').exec(function (err, teams) {
        if (err) return cb(err);

        return Spiel.find({gruppe: team.from._id}).exec(function (err, spiele) {
            if (err) return cb(err);

            const originalTeam = gruppeFindPlace(teams, spiele, team.rank, team.from.type);

            if (!originalTeam) {
                return cb();
            }
            return Team.update({'_id': originalTeam}, {'zwischengruppe': team.gruppe._id}, function (err) {
                if (err) return cb(err);

                return Gruppe.updateTeamInGruppe(team.gruppe._id, team._id, originalTeam._id, function (err) {
                    if (err) return cb(err);

                    return Spiel.updateTeamInSpiele(team._id, originalTeam._id, function (err) {
                        if (err) return cb(err);

                        return Jugend.removeTeam(originalTeam.jugend._id, team._id, function (err) {
                            if (err) return cb(err);

                            return removeEntityBy(Team, '_id', team._id, {}, cb);
                        });
                    });
                });
            });
        });
    });
}

function fillSpiele(callback) {
    logger.verbose('Filling Spiele with Team Infos');
    return Spiel.find({label: {$ne: 'normal'}}).deepPopulate('jugend gruppe teamA teamB fromA fromB').populate('fromA fromB').populate('fromA.teams fromB.teams').exec(function (err, spiele) {
        if (err) return callback(err);

        return async.each(spiele, function (spiel, cb) {
            if (!spiel.from && !spiel.fromType) {
                return cb();
            }
            if (spiel.fromType === 'Spiel' && !(spiel.teamA && spiel.teamB)) {
                return fillSpielFromSpiel(spiel, cb);
            } else if (spiel.fromType === 'Gruppe' && !(spiel.teamA && spiel.teamB)) {
                return fillSpielFromGruppe(spiel, cb);
            }
            return cb('Invalid fromType ' + spiel.fromType);
        }, function (err) {
            if (err) return callback(err);

            return Team.find({isPlaceholder: true}).populate('teamA teamB from gruppe jugend').exec(function (err, teams) {
                if (err) return callback(err);

                teams = teams.filter(function (single) {
                    return !single.name && single.from
                });

                return async.each(teams, function (team, cb) {
                    if (team.fromType === 'Gruppe') {
                        return fillTeamFromGruppe(team, cb);
                    }
                    return cb('Invalid fromType ' + team.fromType);
                }, function (err) {
                    if (err) return callback(err);

                    return callback();
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

        return async.each(spiele, function (spiel, next) {
            if (spiel.teamA.toString() === team._id.toString()) {
                result.punkte += spiel.punkteA;
                result.gpunkte += spiel.punkteB;
                result.tore += spiel.toreA;
                result.gtore += spiel.toreB;
            } else {
                result.punkte += spiel.punkteB;
                result.gpunkte += spiel.punkteA;
                result.tore += spiel.toreB;
                result.gtore += spiel.toreA;
            }
            return next();
        }, function (err) {
            if (err) return cb(err);

            return cb(null, result);
        });
    });
}

function fill(entity, cb) {
    if (_.isArray(entity)) {
        if (entity.length === 0) return cb(null, entity);
        const data = [];

        return async.eachOf(entity, function (e, index, next) {
            if (typeof e.fill !== "function") {
                data[index] = e;
                return next();
            }
            return e.fill(function (err, d) {
                if (err) return next(err);
                data[index] = d;
                return next();
            })
        }, function (err) {
            if (err) return cb(err);

            return cb(null, data);
        });
    } else if (_.isObject(entity)) {
        if (typeof entity.fill !== "function" || !entity._id) {
            return cb(null, entity);
        }
        return entity.fill(cb);
    }
    return cb('Not able to fill');
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
    sortTeams: sortTeams,
    fillSpiele: fillSpiele,
    gruppeFindPlace: gruppeFindPlace,
    teamCalcErgebnisse: teamCalcErgebnisse
};