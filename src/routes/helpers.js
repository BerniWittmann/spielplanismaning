module.exports = function () {

    const messages = require('./messages/messages.js')();
    const _ = require('lodash');
    const handler = require('./handler.js');
    const jsonwebtoken = require('jsonwebtoken');
    const md5 = require('md5');
    const moment = require('moment');

    function getEntityQuery(model, req) {
        let query = model.find();
        let searchById = false;
        if (req.query.id) {
            searchById = true;
            query = model.findById(req.query.id);
        } else if (req.query.team) {
            //noinspection JSUnresolvedFunction
            query = model.find({}).or([{
                teamA: req.query.team
            }, {
                teamB: req.query.team
            }]);
        } else if (req.query.gruppe) {
            query = model.find({gruppe: req.query.gruppe});
        }
        else if (req.query.jugend) {
            query = model.find({jugend: req.query.jugend});
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
        let obj;
        try {
            obj = jsonwebtoken.verify(req.get('Authorization'), secret);
        } catch (err) {
            return undefined;
        }
        const checksum = obj.checksum;
        delete obj.checksum;
        if (checksum && md5(JSON.stringify(obj)) === checksum) {
            return obj;
        }
        return undefined;
    }

    function saveUserAndSendMail(user, res, mail) {
        return user.save(function (err) {
            if (err) {
                return messages.Error(res, err);
            }

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
        path = removeLastSlashFromPath(path);
        let route = routes[path];

        if (_.isUndefined(route) || _.isNull(route)) {
            return []
        }

        route = _.cloneDeep(route[configKey]);

        if (_.isArray(route)) {
            return route;
        }

        if (_.isString(route)) {
            return route.split(' ');
        }

        if (_.isUndefined(route) || _.isNull(route)) {
            return [];
        }

        const routeconfig = route[method];

        if (_.isArray(routeconfig)) {
            return routeconfig;
        }

        if (_.isString(routeconfig)) {
            return routeconfig.split(' ');
        }

        return [];
    }

    function checkSpielOrderChangeAllowed(spiele) {
        let teamsParallel = [];
        for(let i = 0; i < spiele.length; i += 3) {
            for (let j = i; j < i + 3; j++) {
                if (j < spiele.length) {
                    if (spiele[j].teamA && spiele[j].teamB) {
                        teamsParallel.push(spiele[j].teamA._id);
                        teamsParallel.push(spiele[j].teamB._id);
                    }
                }
            }

            if (_.uniq(teamsParallel).length !== teamsParallel.length) {
                console.warn(i);
                return i;
            }
            teamsParallel = [];
        }

        return -1;
    }

    function calcSpielDateTime(nr, spielplan) {
        const dailyStartTime = moment(spielplan.startzeit, 'HH:mm');
        const dailyEndTime = moment(spielplan.endzeit, 'HH:mm');
        const spielePerDay = Math.floor(dailyEndTime.diff(dailyStartTime, 'minutes') / (spielplan.spielzeit + spielplan.pausenzeit)) * 3;
        if (spielePerDay < 0) {
            return undefined;
        }
        const offsetDays = Math.floor((nr - 1) / spielePerDay);
        if (offsetDays < 0) {
            return undefined;
        }
        const offsetSpiele = (nr - 1) % spielePerDay;
        if (offsetSpiele < 0) {
            return undefined;
        }

        const date = moment(spielplan.startdatum, 'DD.MM.YYYY').add(offsetDays, 'days');
        const time = dailyStartTime.add(Math.floor(offsetSpiele / 3) * (spielplan.spielzeit + spielplan.pausenzeit), 'minutes');
        const platz = (offsetSpiele % 3) + 1;
        return {
            date: date.format('DD.MM.YYYY'),
            time: time.format('HH:mm'),
            platz: platz
        }
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
        calcSpielDateTime: calcSpielDateTime
    }
};