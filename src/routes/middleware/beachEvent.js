module.exports = function (app) {
    const mongoose = require('mongoose');
    const logger = require('winston').loggers.get('middlewareEvent');
    const Veranstaltung = mongoose.model('Veranstaltung');
    const constants = require('../../config/constants.js');
    const _ = require('lodash');
    const messages = require('../messages/messages.js')();

    function sendError(res) {
        return messages.ErrorBadRequest(res, 'No valid ' + constants.BEACH_EVENT_HEADER_NAME + ' was set.');
    }

    const handleBeachEvent = function (req, res, next) {
        const beachEventID = req.get(constants.BEACH_EVENT_HEADER_NAME);
        logger.silly('Handling Beach Event ID: %s', beachEventID);
        if (_.includes(constants.EVENT_IGNORED_ROUTES, req.url)) {
            logger.silly('Beach Event Route ignored: %s', req.url);
            return next();
        }

        if (!beachEventID) return sendError(res);

        return Veranstaltung.findById(beachEventID, function (err, event) {
            if (err || !event) return sendError(res);

            req.eventID = beachEventID;
            if (!res.headersSent) {
                return next();
            }
        });
    };

    app.use(handleBeachEvent)
};