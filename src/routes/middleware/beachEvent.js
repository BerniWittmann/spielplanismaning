module.exports = function (app) {
    const mongoose = require('mongoose');
    const logger = require('winston').loggers.get('middlewareEvent');
    const Veranstaltung = mongoose.model('Veranstaltung');
    const constants = require('../../config/constants.js');
    const _ = require('lodash');
    const messages = require('../messages/messages.js')();
    const cls = require('../../config/cls.js');

    function sendError(res) {
        return messages.ErrorBadRequest(res, 'No valid ' + constants.BEACH_EVENT_HEADER_NAME + ' was set.');
    }

    function checkIncludes(arr, path) {
        return arr.find(function (single) {
            return _.includes(path, single);
        });
    }

    const handleBeachEvent = function (req, res, next) {
        const beachEventID = req.get(constants.BEACH_EVENT_HEADER_NAME);
        logger.silly('Handling Beach Event ID: %s', beachEventID);
        if (!checkIncludes(constants.EVENT_REQUIRED_ROUTES, req.path)) {
            logger.silly('Beach Event Route ignored: %s', req.path);
            return next();
        }

        if (!beachEventID && checkIncludes(constants.EVENT_EXCLUDED_ROUTES, req.path)) {
            if (!res.headersSent) {
                return next();
            }
        }

        if (!beachEventID) return sendError(res);

        return Veranstaltung.findById(beachEventID, function (err, event) {
            if (err || !event) return sendError(res);

            req.eventID = beachEventID;
            const clsSession = cls.getNamespace();
            clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);

                if (!res.headersSent) {
                    return next();
                }
            });
        });
    };

    app.use(handleBeachEvent)
};