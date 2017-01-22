module.exports = function (app) {
    var messages = require('./../messages/messages.js')();
    var _ = require('lodash');
    var helpers = require('./../helpers.js')();
    var fs = require('fs');
    var path = require('path');
    var routes = JSON.parse(fs.readFileSync(path.join(__dirname, '/routeConfig.json'), 'utf8'));

    var handleBadRequest = function (req, res, next) {
        var requiredKeys = helpers.getRequiredRouteConfig(routes, req.path, req.method, 'PARAMS');
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