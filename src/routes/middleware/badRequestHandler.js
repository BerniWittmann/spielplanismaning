module.exports = function (app) {
    const logger = require('winston').loggers.get('middlewareBadRequest');
    const messages = require('./../messages/messages.js')();
    const _ = require('lodash');
    const helpers = require('./../helpers.js')();
    const fs = require('fs');
    const path = require('path');
    const async = require('async');
    const routes = require('./routeConfig.js');
    const Joi = require('joi');
    const options = {
        abortEarly: false
    };

    const handleBadRequest = function (req, res, next) {
        const requiredKeys = helpers.getRequiredRouteConfig(routes, req.path, req.method, 'PARAMS');
        if (requiredKeys) {
            logger.silly('Required Keys', requiredKeys);

            const errors = [];

            return async.each(['params', 'query', 'body'], function (prop, cb) {
                if (!requiredKeys[prop]) {
                    return cb();
                }

                return Joi.validate(req[prop], requiredKeys[prop], options, function (err) {
                    if (err && err.name === 'ValidationError' && err.details) {
                        err.details.forEach(function (detail) {
                            errors.push(detail.message);
                        });
                    }
                    return cb();
                });
            }, function (err) {
                if (err) {
                    logger.error(err);
                }

                if (errors && errors.length > 0) {
                    logger.verbose('Bad Request', errors);
                    return messages.ErrorBadRequest(res, errors);
                }

                if (!res.headersSent) {
                    return next();
                }
            });
        }

        if (!res.headersSent) {
            return next();
        }
    };

    app.use(handleBadRequest)
};