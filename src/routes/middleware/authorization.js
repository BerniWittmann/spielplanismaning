module.exports = function (app, secret) {
    const messages = require('./../messages/messages.js')();
    const jwt = require('jsonwebtoken');
    const _ = require('lodash');
    const mongoose = require('mongoose');
    const User = mongoose.model('User');
    const helpers = require('../helpers.js')();
    const fs = require('fs');
    const path = require('path');
    const routes = JSON.parse(fs.readFileSync(path.join(__dirname, '/routeConfig.json'), 'utf8'));

    const authenticate = function (req, res, next) {
        const requiredRoles = helpers.getRequiredRouteConfig(routes, req.path, req.method, 'AUTH');

        const authNeeded = requiredRoles && requiredRoles.length > 0;

        if (!authNeeded) {
            return next();
        }

        if (!req.get('Authorization')) {
            return messages.ErrorNotAuthorized(res);
        }

        const user = helpers.verifyToken(req, secret);

        if (!user || !user._id || !user.role) {
            return messages.ErrorForbidden(res);
        }

        return User.findOne({username: user.username}).exec(function (err, userDB) {
            if (err || !userDB) {
                return messages.ErrorForbidden(res);
            }

            const roleName = user.role.name.toLowerCase();
            if (!_.isEqual(roleName, userDB.role.name.toLowerCase())) {
                return messages.ErrorForbidden(res);
            }


            if (!_.includes(requiredRoles, roleName)) {
                return messages.ErrorForbidden(res);
            }

            if (!res.headersSent) {
                return next();
            }
        });
    };

    app.use(authenticate);
};