module.exports = function () {
    const logger = require('winston').loggers.get('apiSpiele');
    const express = require('express');
    const router = express.Router();
    const cls = require('../config/cls.js');

    const mongoose = require('mongoose');
    const moment = require('moment');
    const async = require('async');

    const Spielplan = mongoose.model('Spielplan');
    const Spiel = mongoose.model('Spiel');

    const messages = require('./messages/messages.js')();
    const spielplanGenerator = require('./spielplanGenerator/spielplanGenerator')();
    const handler = require('./handler.js');
    const helpers = require('./helpers.js');

    /**
     * @api {get} /spielplan Get Spielplan
     * @apiName GetSpielplan
     * @apiDescription Lädt den Spielplan
     * @apiGroup Spielplan
     *
     * @apiSuccess {String} _id ID des Spielplans
     * @apiSuccess {String} startzeit Startzeit
     * @apiSuccess {Integer} spielzeit Spielzeit in Minuten
     * @apiSuccess {Integer} pausenzeit Pausenzeit in Minuten
     * @apiSuccess {Array} ausnahmen Ausnahmen bei der Spielplanerstellung
     * @apiUse vResponse
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     [{
     *         _id: '57579d1eff6aa513ad6859df',
     *         startzeit: '09:00',
     *         spielzeit: 8,
     *         pausenzeit: 2,
     *         __v: 50,
     *         ausnahmen: [ [ Object ], [ Object ] ]
     *     }]
     **/
    router.get('/', function (req, res) {
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            Spielplan.findOne({}, function (err, spielplan) {
                if (err) return messages.Error(res, err);

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    Spielplan.deepPopulate(spielplan, 'ausnahmen ausnahmen.team1 ausnahmen.team2', function (err, spielplan) {
                        return handler.handleErrorAndResponse(err, res, spielplan);
                    });
                });
            });
        });
    });

    /**
     * @api {Put} /spielplan Update Spielplan
     * @apiName PutSpielplan
     * @apiDescription Generiert den Spielplan
     * @apiGroup Spielplan
     * @apiPermission Admin
     * @apiUse AuthHeader
     *
     * @apiUse SpielplanErstelltMessage
     **/
    router.put('/', function (req, res) {
        if (!req.spielplanEnabled) return messages.ErrorSpielplanDisabled(res);
        logger.verbose('Create Spielplan');
        let generator = spielplanGenerator.generateNew;

        if (req.body.keep) {
            logger.verbose('Keeping complete Spiele');
            generator = spielplanGenerator.regenerate;
        }

        const beachEventID = cls.getBeachEventID();
        logger.verbose('Start Generator');
        const clsSession = cls.getNamespace();

        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);

            return generator(function (err) {
                logger.verbose('Generator finished');
                if (err) {
                    if (err.message !== 'SpieleGesamt calulation returned invalid value') {
                        return messages.Error(res, err);
                    }
                    err = null;
                }
                return handler.handleErrorAndMessage(err, res, messages.SpielplanErstellt);
            });
        });
    });


    /**
     * @api {Put} /spielplan/zeiten Update Spielplan-Zeiten
     * @apiName PutSpielplanZeiten
     * @apiDescription Updatet die Spielplan-Zeiten
     * @apiGroup Spielplan
     * @apiPermission Admin
     * @apiUse AuthHeader
     *
     * @apiParam {String} startzeit Gewählte Startzeit im Format HH:mm.
     * @apiParam {Number} spielzeit Gewählte Spielzeit in Minuten.
     * @apiParam {Number} pausenzeit Gewählte Pausenzeit in Minuten.
     * @apiParam {String} endzeit Gewählte Endzeit im Format HH:mm.
     * @apiParam {String} startdatum Startdatum im Format DD.MM.YYYY.
     * @apiParam {String} enddatum Enddatum im Format DD.MM.YYYY.
     *
     * @apiUse SuccessMessage
     *
     * @apiUse ErrorZeitenUngueltig
     *
     * @apiUse ErrorBadRequest
     **/
    router.put('/zeiten', function (req, res) {
        if (!req.spielplanEnabled) return messages.ErrorSpielplanDisabled(res);
        logger.verbose('Check for valid Times');
        if (moment(req.body.startdatum, 'DD.MM.YYYY').isAfter(moment(req.body.enddatum, 'DD.MM.YYYY')) || moment(req.body.startzeit, 'HH:mm').isAfter(moment(req.body.endzeit, 'HH:mm'))) {
            logger.warn('Times are not valid', req.body);
            return messages.ErrorZeitenUngueltig(res);
        }

        logger.verbose('Update Times');
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            Spielplan.findOneAndUpdate({}, req.body, {
                upsert: true
            }, function (err) {
                if (err) return messages.Error(res, err);

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    Spiel.find().exec(function (err, spiele) {
                        if (err) {
                            return messages.Error(res, err);
                        }

                        logger.verbose('Update Spiele according to new Times');
                        spiele = spiele.sort(compareNumbers);
                        async.eachSeries(spiele, function (singlespiel, asyncdone) {
                            return clsSession.run(function () {
                                clsSession.set('beachEventID', beachEventID);
                                if (singlespiel) {
                                    logger.silly('Updating Spiel #%d', singlespiel.nummer);
                                    const dateTimeObject = helpers.calcSpielDateTime(singlespiel.nummer, req.body, {});
                                    singlespiel.uhrzeit = dateTimeObject.time;
                                    singlespiel.datum = dateTimeObject.date;
                                    singlespiel.platz = dateTimeObject.platz;
                                    singlespiel.save(asyncdone);
                                } else {
                                    logger.warn('Spiel is undefined');
                                    return asyncdone();
                                }
                            });
                        }, function (err) {
                            logger.verbose('Updated all Spiele');
                            return handler.handleErrorAndSuccess(err, res);
                        });

                        function compareNumbers(a, b) {
                            return a.nummer - b.nummer;
                        }
                    });
                });
            });
        });
    });

    return router;
};