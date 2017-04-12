module.exports = function () {
    const logger = require('winston').loggers.get('apiHelper');
    const messages = require('./messages/messages.js')();
    const _ = require('lodash');
    const handler = require('./handler.js');
    const jsonwebtoken = require('jsonwebtoken');
    const md5 = require('md5');
    const moment = require('moment');
    const mongoose = require('mongoose');
    const Spiel = mongoose.model('Spiel');

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

    function resetErgebnis(res, spiel, oldData, team, cb) {
        function callback(err) {
            if (err) {
                return messages.Error(res, err);
            }
            return cb();
        }

        if (_.isEqual(team, 'teamA')) {
            return spiel.teamA.setErgebnis(0, oldData.toreA, 0, oldData.toreB, 0, oldData.punkteA, 0, oldData.punkteB, callback);
        } else if (_.isEqual(team, 'teamB')) {
            return spiel.teamB.setErgebnis(0, oldData.toreB, 0, oldData.toreA, 0, oldData.punkteB, 0, oldData.punkteA, callback);
        }
    }

    function getEntity(model, population, notFoundMessage, res, req) {
        const {query, searchById} = getEntityQuery(model, req);
        logger.silly('Getting Entity %s', model.modelName);
        query.deepPopulate(population).exec(function (err, data) {
            return handler.handleQueryResponse(err, data, res, searchById, notFoundMessage);
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
        logger.verbose('Verifying Token');
        let obj;
        try {
            obj = jsonwebtoken.verify(req.get('Authorization'), secret);
        } catch (err) {
            logger.warn('Token not valid!');
            return undefined;
        }
        const checksum = obj.checksum;
        delete obj.checksum;
        if (checksum && md5(JSON.stringify(obj)) === checksum) {
            logger.verbose('Token is valid');
            return obj;
        }
        logger.warn('Checksums didn\'t match');
        return undefined;
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
            return []
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
            return [];
        }

        logger.silly('Get Route Config for Method');

        const routeconfig = route[method];

        if (_.isArray(routeconfig)) {
            return routeconfig;
        }

        if (_.isString(routeconfig)) {
            return routeconfig.split(' ');
        }

        logger.silly('No Route-Config Found');
        return [];
    }

    function checkSpielOrderChangeAllowed(spiele) {
        logger.verbose('Check Spiel Order Allowed');
        const plaetze = parseInt(process.env.PLAETZE, 10);
        logger.verbose('Calculated %d Plätze', plaetze);
        let teamsParallel = [];
        for(let i = 0; i < spiele.length; i += plaetze) {
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

    return {
        getEntityQuery: getEntityQuery,
        resetErgebnis: resetErgebnis,
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
        getSpielErgebnisse: getSpielErgebnisse
    }
};