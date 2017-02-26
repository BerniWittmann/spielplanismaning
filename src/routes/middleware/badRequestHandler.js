module.exports = function (app) {
    const messages = require('./../messages/messages.js')();
    const _ = require('lodash');
    const helpers = require('./../helpers.js')();
    const fs = require('fs');
    const path = require('path');
    const routes = JSON.parse(fs.readFileSync(path.join(__dirname, '/routeConfig.json'), 'utf8'));

    const handleBadRequest = function (req, res, next) {
        const requiredKeys = helpers.getRequiredRouteConfig(routes, req.path, req.method, 'PARAMS');
        _.forEach(requiredKeys, function (key) {
            if (!_.has(req, key) || _.isUndefined(_.get(req, key)) || _.get(req, key).length === 0) {
                if (!res.headersSent) {
                    return messages.ErrorBadRequest(res);
                }
            }
        });

        if (!res.headersSent) {
            return next();
        }
    };

    app.use(handleBadRequest)
};