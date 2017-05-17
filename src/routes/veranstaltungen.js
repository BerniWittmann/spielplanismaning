module.exports = function () {
    const logger = require('winston').loggers.get('apiVeranstaltungen');
    const express = require('express');
    const router = express.Router();
    const async = require('async');

    const mongoose = require('mongoose');
    const Veranstaltung = mongoose.model('Veranstaltung');
    const Team = mongoose.model('Team');
    const Gruppe = mongoose.model('Gruppe');
    const Jugend = mongoose.model('Jugend');
    const Spiel = mongoose.model('Spiel');
    const Spielplan = mongoose.model('Spielplan');
    const Subscriber = mongoose.model('Subscriber');

    const constants = require('../config/constants.js');
    const messages = require('./messages/messages.js')();
    const helpers = require('./helpers.js');
    const handler = require('./handler.js');
    const cls = require('../config/cls.js');

    router.get('/', function (req, res) {
        return helpers.getEntity(Veranstaltung, '', messages.ErrorVeranstaltungNotFound, res, req);
    });

    router.post('/', function (req, res) {
        const veranstaltung = new Veranstaltung(req.body);
        return veranstaltung.save(function (err, veranstaltung) {
            if (err) return messages.Error(res, err);

            const beachEventID = veranstaltung._id;
            const clsSession = cls.getNamespace();
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                const spielplan = new Spielplan(constants.SPIELPLAN_DEFAULTS);
                spielplan.save(function (err) {
                    return handler.handleErrorAndResponse(err, res, veranstaltung);
                });
            });
        });
    });

    router.delete('/', function (req, res) {
        return helpers.removeEntityBy(Veranstaltung, '_id', req.query.id, function (err) {
            if (err) return messages.Error(res, err);

            const beachEventID = req.query.id;
            const clsSession = cls.getNamespace();
            return async.each([Team, Gruppe, Jugend, Spiel, Spielplan, Subscriber], function (model, cb) {
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return model.remove({veranstaltung: beachEventID}, cb);
                });
            }, function (err) {
                return handler.handleErrorAndDeleted(err, res);
            });
        });
    });

    router.put('/', function (req, res) {
        Veranstaltung.findById(req.query.id, function (err, veranstaltung) {
            if (!veranstaltung) {
                return messages.ErrorVeranstaltungNotFound(res, err);
            }

            if (err) {
                return messages.Error(res, err);
            }

            logger.verbose('Updating Veranstaltung', req.body);

            veranstaltung = helpers.updateDocByKeys(veranstaltung, ['name', 'bildUrl', 'spielModus', 'printMannschaftslisten'], req.body);

            logger.silly('Save', veranstaltung);
            veranstaltung.save(function (err, veranstaltung) {
                return handler.handleErrorAndResponse(err, res, veranstaltung);
            });
        });
    });

    return router;
};