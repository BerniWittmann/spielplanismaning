module.exports = function () {

    var messages = require('./messages/messages.js')();
    var _ = require('lodash');
    var handler = require('./handler.js');
    var jsonwebtoken = require('jsonwebtoken');
    var md5 = require('md5');

    function getEntityQuery(model, req) {
        var query = model.find();
        var searchById = false;
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
        var {query, searchById} = getEntityQuery(model, req);
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
        var query = {};
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
        try {
            var obj = jsonwebtoken.verify(req.get('Authorization'), secret);
        } catch (err) {
            return undefined;
        }
        var checksum = obj.checksum;
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
        var entity = new model(req.body);

        entity.save(function (err, entity) {
            return handler.handleErrorAndResponse(err, res, entity);
        });
    }

    function getRequiredRouteConfig(routes, path, method, configKey) {
        path = removeLastSlashFromPath(path);
        var route = routes[path];

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

        var routeconfig = route[method];

        if (_.isArray(routeconfig)) {
            return routeconfig;
        }

        if (_.isString(routeconfig)) {
            return routeconfig.split(' ');
        }

        return [];
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
        addEntity: addEntity
    }
};