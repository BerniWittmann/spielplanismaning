module.exports = function (app, secret) {
    const logger = require('winston').loggers.get('middlewareAuthorization');
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

        logger.silly('Required Roles: ', requiredRoles);

        const authNeeded = requiredRoles && requiredRoles.length > 0;

        if (!authNeeded) {
            logger.silly('No Authorization needed');
            return next();
        }

        if (!req.get('Authorization')) {
            logger.warn('Authorization Header is missing');
            return messages.ErrorNotAuthorized(res);
        }

        const user = helpers.verifyToken(req, secret);

        if (!user || !user._id || !user.role) {
            logger.warn('User not found');
            return messages.ErrorForbidden(res);
        }

        return User.findOne({username: user.username}).exec(function (err, userDB) {
            if (err || !userDB) {
                logger.warn('User not found');
                return messages.ErrorForbidden(res);
            }

            const roleName = user.role.name.toLowerCase();
            if (!_.isEqual(roleName, userDB.role.name.toLowerCase())) {
                logger.warn('User-Roles don\'t match! ', {userDB: userDB, user: user});
                return messages.ErrorForbidden(res);
            }


            if (!_.includes(requiredRoles, roleName)) {
                logger.warn('User-Role is not authorized for this route');
                return messages.ErrorForbidden(res);
            }

            logger.verbose('User %s is authorized', user.username);

            if (!res.headersSent) {
                return next();
            }
        });
    };

    app.use(authenticate);
};