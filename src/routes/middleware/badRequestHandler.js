module.exports = function (app) {
    var messages = require('./../messages/messages.js')();
    var _ = require('lodash');
    var helpers = require('./../helpers.js')();

    var arr = {
        '/api/email': {
            POST: ['body.subject', 'body.text']
        },
        '/api/email/subscriber': {
            POST: ['body.team', 'body.email'],
            DELETE: ['query.team', 'query.email']
        },
        '/api/email/bug': {
            POST: ['body.email']
        },
        '/api/gruppen': {
            POST: ['query.jugend', 'body.name'],
            DELETE: ['query.id']
        },
        '/api/teams': {
            POST: ['query.jugend', 'query.gruppe', 'body.name'],
            DELETE: ['query.id'],
            PUT: ['query.id']
        },
        '/api/teams/resetErgebnisse': ['admin'],
        '/api/jugenden': {
            POST: ['body.name'],
            DELETE: ['query.id']
        },
        '/api/spiele': {
            POST: ['body.jugend', 'body.gruppe'],
            DELETE: ['query.id']
        },
        '/api/spiele/tore': {
            PUT: ['query.id'],
            DELETE: ['query.id']
        },
        '/api/spielplan/zeiten': {
            PUT: ['body.startzeit', 'body.spielzeit', 'body.pausenzeit']
        },
        '/api/users/register': {
            POST: ['body.username', 'body.email', 'body.role']
        },
        '/api/users/login': {
            POST: ['body.username', 'body.password']
        },
        '/api/users/delete': {
            PUT: ['body.username']
        },
        '/api/users/password-forgot': {
            PUT: ['body.email']
        },
        '/api/users/password-reset/check': {
            PUT: ['body.token']
        },
        '/api/users/password-reset': {
            PUT: ['body.token', 'body.username', 'body.password']
        },
        '/api/users/user-details': {
            PUT: ['body.email', 'body.username']
        }
    };

    function getRequiredKeys(path, method) {
        path = helpers.removeLastSlashFromPath(path);
        var keys;
        var route = arr[path];

        if(!_.isUndefined(route)) {
            keys = route[method];
        }

        if(_.isUndefined(keys)) {
            keys = [];
        }

        return _.cloneDeep(keys);
    }

    var handleBadRequest = function (req, res, next) {
        var requiredKeys = getRequiredKeys(req.path, req.method);
        _.forEach(requiredKeys, function (key) {
            if(!_.has(req, key) || _.isUndefined(_.get(req, key)) || _.get(req, key).length === 0) {
                if(!res.headersSent) {
                    return messages.ErrorBadRequest(res);
                }
            }
        });

        if(!res.headersSent) {
            return next();
        }
    };

    app.use(handleBadRequest)
};