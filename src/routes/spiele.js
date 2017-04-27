module.exports = function (sendgrid, env, url, disableMails) {
    const logger = require('winston').loggers.get('apiSpiele');
    const express = require('express');
    const router = express.Router();

    const mongoose = require('mongoose');
    const async = require('async');
    const moment = require('moment');

    const Spiel = mongoose.model('Spiel');
    const Subscriber = mongoose.model('Subscriber');
    const Spielplan = mongoose.model('Spielplan');
    const MailGenerator = require('./mailGenerator/mailGenerator.js')(sendgrid, env, url, disableMails);

    const messages = require('./messages/messages.js')();
    const helpers = require('./helpers.js');
    const handler = require('./handler.js');

    function notifySubscribers(spiel, fn, callback) {
        return async.eachSeries([spiel.teamA, spiel.teamB], function (team, asyncdone) {
            if (team && team._id) {
                Subscriber.getByTeam(team._id).then(function (mails) {
                    const emails = [];
                    mails.forEach(function (mail) {
                        emails.push(mail.email);
                    });
                    if (emails.length > 0) {
                        fn(team, spiel, emails, asyncdone);
                    } else {
                        return asyncdone(null, {});
                    }

                });
            } else {
                return callback(null, {});
            }
        }, function (err) {
            if (err) return messages.Error(res, err);
            return callback(null, {});
        });
    }

    /**
     * @api {get} /spiele Get Spiele
     * @apiName GetSpiele
     * @apiDescription Lädt Spiele, entweder Alle oder gefiltert nach ID, Gruppe, Jugend oder Team
     * @apiGroup Spiele
     *
     * @apiParam {String} [id]  Optionale ID des Spiels.
     * @apiParam {String} [gruppe]  Optionale ID der Gruppe.
     * @apiParam {String} [jugend]  Optionale ID der Jugend.
     * @apiParam {String} [team]  Optionale ID des Teams.
     *
     *
     * @apiUse ErrorSpielNotFoundMessage
     * @apiUse spielResponse
     **/
    router.get('/', function (req, res) {
        return helpers.getEntity(Spiel, 'gruppe jugend teamA teamB gewinner fromA fromB teamA.from teamB.from', messages.ErrorSpielNotFound, res, req);
    });

    /**
     * @api {Post} /spiele Create Spiel
     * @apiName CreateSpiel
     * @apiDescription Speichert ein Spiel
     * @apiGroup Spiele
     * @apiPermission Admin
     * @apiUse AuthHeader
     *
     * @apiUse spielResponse
     *
     * @apiParam {String} jugend ID der Gruppe.
     * @apiParam {String} gruppe ID der Jugend.
     *
     * @apiUse ErrorBadRequest
     *
     * @apiUse Deprecated
     **/
    router.post('/', function (req, res) {
        logger.warn('This method is deprecated');
        logger.verbose('Create new Spiel', req.body);

        const spiel = new Spiel(req.body);
        spiel.jugend = req.body.jugend;
        spiel.gruppe = req.body.gruppe;

        spiel.save(function (err, spiel) {
            logger.verbose('Saved Spiel');
            return handler.handleErrorAndResponse(err, res, spiel);
        });
    });

    /**
     * @api {del} /spiele Delete Spiel
     * @apiName DeleteSpiel
     * @apiDescription Löscht ein Spiel
     * @apiGroup Spiele
     * @apiPermission Admin
     *
     * @apiParam {String} id ID des Spiels.
     * @apiUse AuthHeader
     *
     * @apiUse SuccessDeleteMessage
     *
     * @apiUse ErrorBadRequest
     * @apiUse Deprecated
     **/
    router.delete('/', function (req, res) {
        logger.warn('This method is deprecated');
        logger.verbose('Delete Spiel %s', req.query.id);
        return helpers.removeEntityBy(Spiel, '_id', req.query.id, res, function (err) {
            return handler.handleErrorAndDeleted(err, res);
        });
    });

    /**
     * @api {Put} /spiele/alle Update Alle Spiele
     * @apiName UpdateSpiele
     * @apiDescription Speichert alle Spiele
     * @apiGroup Spiele
     *
     * @apiPermission Admin
     * @apiUse AuthHeader
     *
     * @apiUse SpielplanErstelltMessage
     * @apiUse Deprecated
     **/
    router.put('/alle', function (req, res) {
        logger.warn('This method is deprecated');

        const spiele = req.body;
        logger.verbose('%d Spiele should be updated', spiele.length);
        async.eachSeries(spiele, function (singlespiel, asyncdone) {
            logger.silly('Updating Spiel %s', singlespiel._id);
            const spiel = new Spiel(singlespiel);
            spiel.jugend = singlespiel.jugend;
            spiel.gruppe = singlespiel.gruppe;
            spiel.save(asyncdone);
        }, function (err) {
            logger.verbose('Updated all Spiele');
            return handler.handleErrorAndMessage(err, res, messages.SpielplanErstellt);
        });
    });

    /**
     * @api {del} /spiele/alle Delete Alle Spiele
     * @apiName DeleteAlleSpiel
     * @apiDescription Löscht alle Spiele
     * @apiGroup Spiele
     * @apiPermission Admin
     * @apiUse AuthHeader
     *
     * @apiUse SuccessDeleteMessage
     * @apiUse Deprecated
     **/
    router.delete('/alle', function (req, res) {
        logger.verbose('Removing all Spiele');
        Spiel.remove({}, function (err) {
            return handler.handleErrorAndDeleted(err, res);
        });
    });

    /**
     * @api {del} /spiele/tore Delete Spiel Ergebnis
     * @apiName DeleteSpielErgebnis
     * @apiDescription Löscht die Ergebnisse eines Spiels
     * @apiGroup Spiele
     * @apiPermission Admin
     * @apiPermission Bearbeiter
     * @apiUse AuthHeader
     *
     * @apiParam {String} id ID des Spiels
     *
     * @apiUse spielResponse
     *
     * @apiUse ErrorBadRequest
     **/
    router.delete('/tore', function (req, res) {
        logger.verbose('Reset Spiel %s', req.query.id);

        return helpers.checkSpielChangeable(req.query.id, function (err, result) {
            if (err) return messages.Error(res, err);

            if (!result) return messages.ErrorSpielNotChangeable(res);

            return Spiel.findById(req.query.id).deepPopulate('gruppe jugend teamA teamB').populate('fromA fromB').exec(function (err, spiel) {
                if (err) {
                    return messages.Error(res, err);
                }

                if (!spiel.teamA || !spiel.teamA.name || !spiel.teamB || !spiel.teamB.name) {
                    return messages.ErrorSpielNotFilled(res);
                }

                return spiel.reset(function (err, spiel) {
                    logger.verbose('Reseted Spiel');
                    handler.handleErrorAndResponse(err, res, spiel);
                });
            });
        });
    });

    /**
     * @api {PUT} /spiele/tore Update Spiel Ergebnis
     * @apiName UpdateSpielErgebnis
     * @apiDescription Speichert das Ergebnis eines Spiels
     * @apiGroup Spiele
     * @apiPermission Admin
     * @apiPermission Bearbeiter
     * @apiUse AuthHeader
     *
     * @apiParam {String} id ID des Spiels
     * @apiParam {Number} toreA Tore von Team A
     * @apiParam {Number} toreB Tore von Team B
     *
     * @apiUse spielResponse
     *
     * @apiUse ErrorBadRequest
     *
     **/
    router.put('/tore', function (req, res) {
        logger.verbose('Set Result for Spiel %s', req.query.id);
        return helpers.checkSpielChangeable(req.query.id, function (err, result) {
            if (err) return messages.Error(res, err);

            if (!result) return messages.ErrorSpielNotChangeable(res);
            const query = Spiel.findById(req.query.id);
            query.deepPopulate('gruppe jugend teamA teamB').populate('fromA fromB').exec(function (err, spiel) {
                if (err) {
                    return messages.Error(res, err);
                }
                if (!spiel) {
                    logger.error('Spiel %s not found', req.query.id);
                    return messages.Error(res, err);
                }
                if (!spiel.teamA || !spiel.teamA.name || !spiel.teamB || !spiel.teamB.name) {
                    return messages.ErrorSpielNotFilled(res);
                }

                spiel.setTore(req.body.toreA, req.body.toreB, function (err, spiel) {
                    if (err) {
                        return messages.Error(res, err);
                    }

                    function sendNextSpielUpdates(cb) {
                        logger.verbose('Check if Spiel-Reminder for next Games should be sent');
                        return Spiel.findOne({
                            nummer: spiel.nummer + 6
                        }).deepPopulate('teamA teamB').exec(function (err, nextspiel) {
                            if (err) {
                                return messages.Error(res, err);
                            }
                            if (nextspiel) {
                                if (!nextspiel.beendet && spiel.datum === nextspiel.datum) {
                                    logger.verbose('Send Spiel-Reminder for next Games');
                                    notifySubscribers(nextspiel, MailGenerator.sendSpielReminder, cb);
                                } else {
                                    return cb(null, {});
                                }
                            } else {
                                return cb(null, {});
                            }

                        });
                    }

                    return helpers.fillSpiele(function (err) {
                        if (err) logger.warn(err);

                        logger.verbose('Filled Spiele');

                        if (disableMails !== 'true') {
                            return sendNextSpielUpdates(function (err) {
                                if (err) {
                                    return messages.Error(res, err);
                                }

                                logger.verbose('Send Spiel-Result Update to Subscribers');
                                return notifySubscribers(spiel, MailGenerator.sendErgebnisUpdate, function (err) {
                                    return handler.handleErrorAndResponse(err, res, spiel);
                                });
                            });
                        } else {
                            return res.json(spiel);
                        }
                    });
                });
            });
        });
    });

    /**
     * @api {Put} /spiele/order Update die Reihenfolge Spiele
     * @apiName UpdateSpieleOrder
     * @apiDescription Speichert die Reihenfolge der Spiele
     * @apiGroup Spiele
     *
     * @apiPermission Admin
     * @apiUse AuthHeader
     *
     * @apiUse SpielplanAktualisiertMessage
     * @apiUse ErrorSpielplanUngueltig
     **/
    router.put('/order', function (req, res) {
        const spiele = req.body;

        logger.verbose('Checking if new order is valid');
        const errorIndex = helpers.checkSpielOrderChangeAllowed(spiele);
        if (errorIndex >= 0) {
            logger.verbose('Order is invalid at index %d', errorIndex);
            return messages.ErrorSpielplanUngueltig(res, errorIndex);
        }


        Spielplan.findOne().exec(function (err, spielplan) {
            if (err) {
                return messages.Error(res, err);
            }

            logger.verbose('Update Spiele with new Order');
            async.eachSeries(spiele, function (singlespiel, asyncdone) {
                const index = spiele.indexOf(singlespiel);
                logger.silly('Update Spiel %s', singlespiel._id);
                Spiel.findById(singlespiel._id).exec(function (err, spiel) {
                    if (err) {
                        return asyncdone(err);
                    }
                    logger.silly('Calculating New Spiel Date/Time/Place');
                    const dateTimePlace = helpers.calcSpielDateTime(index + 1, spielplan);

                    spiel.datum = dateTimePlace.date;
                    spiel.uhrzeit = dateTimePlace.time;
                    spiel.platz = dateTimePlace.platz;
                    spiel.nummer = index + 1;
                    logger.silly('Save new Spiel Data');
                    spiel.save(asyncdone);
                });
            }, function (err) {
                if (err) {
                    return messages.Error(res, err);
                }
                logger.verbose('All Spiele updated');

                Spiel.find().deepPopulate('gruppe jugend teamA teamB gewinner').populate('fromA fromB').exec(function (err, neueSpiele) {
                    if (err) {
                        return messages.Error(res, err);
                    }

                    return messages.SpielplanAktualisert(res, neueSpiele);
                });
            });
        });
    });

    return router;
};