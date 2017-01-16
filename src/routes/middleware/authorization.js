module.exports = function (app, secret) {
    var messages = require('./../messages/messages.js')();
    var jwt = require('jsonwebtoken');
    var authUtil = require('./authUtil.js')();
    var _ = require('lodash');
    var mongoose = require('mongoose');
    var User = mongoose.model('User');
    var helpers = require('../helpers.js')();

    var authenticate = function (req, res, next) {
        var requiredRoles = authUtil.getRequiredRoles(req.path, req.method);

        var authNeeded = requiredRoles && requiredRoles.length > 0;

        if (!authNeeded) {
            return next();
        }

        if (!req.get('Authorization')) {
            return messages.ErrorNotAuthorized(res);
        }

        var user = helpers.verifyToken(req, secret);

        if (!user || !user._id || !user.role) {
            return messages.ErrorForbidden(res);
        }

        return User.findOne({username: user.username}).exec(function (err, userDB) {
            if (err || !userDB) {
                return messages.ErrorForbidden(res);
            }

            var roleName = user.role.name.toLowerCase();
            if (!_.isEqual(roleName, userDB.role.name.toLowerCase())) {
                return messages.ErrorForbidden(res);
            }


            if (!_.includes(requiredRoles, roleName)) {
                return messages.ErrorForbidden(res);
            }

            if(!res.headersSent) {
                return next();
            }
        });
    };

    app.use(authenticate);
};