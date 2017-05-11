module.exports = function () {
    const logger = require('winston').loggers.get('apiVeranstaltungen');
    const express = require('express');
    const router = express.Router();

    const mongoose = require('mongoose');
    const Veranstaltung = mongoose.model('Veranstaltung');

    const messages = require('./messages/messages.js')();
    const helpers = require('./helpers.js');
    const handler = require('./handler.js');

    router.get('/', function (req, res) {
        return helpers.getEntity(Veranstaltung, '', messages.ErrorVeranstaltungNotFound, res, req);
    });

    router.post('/', function (req, res) {
        helpers.addEntity(Veranstaltung, req, res);
    });

    router.delete('/', function (req, res) {
        return helpers.removeEntityBy(Veranstaltung, '_id', req.query.id, function (err) {
            return handler.handleErrorAndDeleted(err, res);
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