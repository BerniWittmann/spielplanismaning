module.exports = function (sendgrid, env, url, disableMails) {
    const logger = require('winston').loggers.get('apiSpiele');
    const express = require('express');
    const router = express.Router();
    const cls = require('../config/cls.js');

    const mongoose = require('mongoose');
    const async = require('async');
    const moment = require('moment');

    const importer = require('./spielImporter/importer.js');

    const Spiel = mongoose.model('Spiel');
    const Subscriber = mongoose.model('Subscriber');
    const Spielplan = mongoose.model('Spielplan');
    const MailGenerator = require('./mailGenerator/mailGenerator.js')(sendgrid, env, url, disableMails);

    const messages = require('./messages/messages.js')();
    const helpers = require('./helpers.js');
    const handler = require('./handler.js');

    function notifySubscribers(spiel, fn, callback) {
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            return async.eachSeries([spiel.teamA, spiel.teamB], function (team, asyncdone) {
                if (team && team._id) {
                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);
                        Subscriber.getByTeam(team._id).then(function (mails) {
                            const emails = [];
                            mails.forEach(function (mail) {
                                emails.push(mail.email);
                            });
                            if (emails.length > 0) {
                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', beachEventID);
                                    fn(team, spiel, emails, asyncdone);
                                });
                            } else {
                                return asyncdone(null, {});
                            }

                        });
                    });
                } else {
                    return callback(null, {});
                }
            }, function (err) {
                if (err) return messages.Error(res, err);
                return callback(null, {});
            });
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
        if (!req.spielplanEnabled) return messages.ErrorSpielplanDisabled(res);
        logger.warn('This method is deprecated');
        logger.verbose('Create new Spiel', req.body);

        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            const spiel = new Spiel(req.body);
            spiel.jugend = req.body.jugend;
            spiel.gruppe = req.body.gruppe;
            spiel.veranstaltung = beachEventID;
            spiel.save(function (err, spiel) {
                logger.verbose('Saved Spiel');
                return handler.handleErrorAndResponse(err, res, spiel);
            });
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
        if (!req.spielplanEnabled) return messages.ErrorSpielplanDisabled(res);
        logger.warn('This method is deprecated');
        logger.verbose('Delete Spiel %s', req.query.id);
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            return helpers.removeEntityBy(Spiel, '_id', req.query.id, function (err) {
                return handler.handleErrorAndDeleted(err, res);
            });
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
        if (!req.spielplanEnabled) return messages.ErrorSpielplanDisabled(res);
        const spiele = req.body;
        logger.verbose('%d Spiele should be updated', spiele.length);
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            async.eachSeries(spiele, function (singlespiel, asyncdone) {
                logger.silly('Updating Spiel %s', singlespiel._id);
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    const spiel = new Spiel(singlespiel);
                    spiel.jugend = singlespiel.jugend;
                    spiel.gruppe = singlespiel.gruppe;
                    spiel.save(asyncdone);
                });
            }, function (err) {
                logger.verbose('Updated all Spiele');
                return handler.handleErrorAndMessage(err, res, messages.SpielplanErstellt);
            });
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
        if (!req.spielplanEnabled) return messages.ErrorSpielplanDisabled(res);
        logger.verbose('Removing all Spiele');
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            Spiel.remove({veranstaltung: beachEventID}, function (err) {
                return handler.handleErrorAndDeleted(err, res);
            });
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
        if (!req.spielplanEnabled) return messages.ErrorSpielplanDisabled(res);
        logger.verbose('Reset Spiel %s', req.query.id);

        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            return helpers.checkSpielChangeable(req.query.id, function (err, result) {
                if (err) return messages.Error(res, err);

                if (!result) return messages.ErrorSpielNotChangeable(res);

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return Spiel.findById(req.query.id).exec(function (err, spiel) {
                        if (err) {
                            return messages.Error(res, err);
                        }

                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);

                            return helpers.clsdeepPopulate(Spiel, spiel, 'gruppe jugend teamA teamB fromA fromB', function (err, spiel) {
                                if (err) return messages.Error(res, err);
                                if (!spiel.teamA || !spiel.teamA.name || !spiel.teamB || !spiel.teamB.name) {
                                    return messages.ErrorSpielNotFilled(res);
                                }

                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', beachEventID);
                                    return spiel.reset(function (err, spiel) {
                                        logger.verbose('Reseted Spiel');
                                        handler.handleErrorAndResponse(err, res, spiel);
                                    });
                                });
                            });
                        });
                    });
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
        if (!req.spielplanEnabled) return messages.ErrorSpielplanDisabled(res);
        logger.verbose('Set Result for Spiel %s', req.query.id);
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            return helpers.checkSpielChangeable(req.query.id, function (err, result) {
                if (err) return messages.Error(res, err);

                if (!result) return messages.ErrorSpielNotChangeable(res);
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);

                    return Spiel.findById(req.query.id, function (err, spiel) {
                        if (err) return messages.Error(res, err);

                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            return helpers.clsdeepPopulate(Spiel, spiel, 'gruppe jugend teamA teamB fromA fromB veranstaltung', function (err, spiel) {
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

                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', beachEventID);
                                    spiel.setTore(req.body, function (err, spiel) {
                                        if (err) {
                                            if (err.message === 'Keine Halbzeit Daten gefunden') {
                                                return messages.ErrorBadRequest(res, err.message);
                                            }
                                            return messages.Error(res, err);
                                        }

                                        function sendNextSpielUpdates(cb) {
                                            logger.verbose('Check if Spiel-Reminder for next Games should be sent');
                                            return clsSession.run(function () {
                                                clsSession.set('beachEventID', beachEventID);
                                                return Spiel.findOne({
                                                    nummer: spiel.nummer + 6
                                                }).exec(function (err, nextspiel) {
                                                    if (err) {
                                                        return messages.Error(res, err);
                                                    }

                                                    if (nextspiel) {
                                                        if (!nextspiel.beendet && spiel.datum === nextspiel.datum) {
                                                            logger.verbose('Send Spiel-Reminder for next Games');
                                                            return clsSession.run(function () {
                                                                clsSession.set('beachEventID', beachEventID);
                                                                nextspiel.deepPopulate('teamA teamB', function (err, nextspiel) {
                                                                    if (err) return cb(err);

                                                                    return clsSession.run(function () {
                                                                        clsSession.set('beachEventID', beachEventID);
                                                                        notifySubscribers(nextspiel, MailGenerator.sendSpielReminder, cb);
                                                                    });
                                                                });
                                                            });
                                                        } else {
                                                            return cb(null, {});
                                                        }
                                                    } else {
                                                        return cb(null, {});
                                                    }
                                                });
                                            });
                                        }

                                        return clsSession.run(function () {
                                            clsSession.set('beachEventID', beachEventID);
                                            return helpers.fillSpiele(function (err) {
                                                if (err) logger.warn(err);

                                                logger.verbose('Filled Spiele');

                                                if (disableMails !== 'true') {
                                                    return clsSession.run(function () {
                                                        clsSession.set('beachEventID', beachEventID);

                                                        return sendNextSpielUpdates(function (err) {
                                                            if (err) {
                                                                return messages.Error(res, err);
                                                            }

                                                            logger.verbose('Send Spiel-Result Update to Subscribers');
                                                            return clsSession.run(function () {
                                                                clsSession.set('beachEventID', beachEventID);
                                                                return notifySubscribers(spiel, MailGenerator.sendErgebnisUpdate, function (err) {
                                                                    return handler.handleErrorAndResponse(err, res, spiel);
                                                                });
                                                            });
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
                        });
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
        if (!req.spielplanEnabled) return messages.ErrorSpielplanDisabled(res);
        const spiele = req.body.spiele;
        const delays = req.body.delays || {};

        logger.verbose('Checking if new order is valid');
        const errorIndex = helpers.checkSpielOrderChangeAllowed(spiele);
        if (errorIndex >= 0) {
            logger.verbose('Order is invalid at index %d', errorIndex);
            return messages.ErrorSpielplanUngueltig(res, errorIndex);
        }

        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            Spielplan.findOne().exec(function (err, spielplan) {
                if (err) {
                    return messages.Error(res, err);
                }

                logger.verbose('Update Spiele with new Order');
                async.eachSeries(spiele, function (singlespiel, asyncdone) {
                    const index = spiele.indexOf(singlespiel);
                    logger.silly('Update Spiel %s', singlespiel._id);

                    if (singlespiel.deleted && singlespiel.isNew) {
                        return asyncdone();
                    }
                    if (singlespiel.deleted && !singlespiel.isNew && singlespiel._id) {
                        logger.silly('Delete Spiel %s', singlespiel._id);
                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            return helpers.removeEntityBy(Spiel, '_id', singlespiel._id, asyncdone);
                        });
                    }
                    if (singlespiel.isNew && !singlespiel.deleted) {
                        logger.silly('Create Spiel %s', singlespiel._id);
                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            const spiel = new Spiel();
                            spiel.veranstaltung = beachEventID;
                            return spiel.save(function (err, spiel) {
                                if (err) return asyncdone(err);

                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', beachEventID);
                                    return updateSpielDateTime(spiel, index, spielplan, delays, asyncdone);
                                });
                            });
                        });
                    }
                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);
                        return updateSpielDateTime(singlespiel, index, spielplan, delays, asyncdone);
                    });
                }, function (err) {
                    if (err) {
                        return messages.Error(res, err);
                    }
                    logger.verbose('All Spiele updated');

                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);
                        Spiel.find().exec(function (err, neueSpiele) {
                            if (err) {
                                return messages.Error(res, err);
                            }

                            return clsSession.run(function () {
                                clsSession.set('beachEventID', beachEventID);

                                return helpers.clsdeepPopulate(Spiel, neueSpiele, 'gruppe jugend teamA teamB gewinner fromA fromB', function (err, neueSpiele) {
                                    if (err) return messages.Error(res, err);
                                    return messages.SpielplanAktualisert(res, neueSpiele);
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    function updateSpielDateTime(singlespiel, index, spielplan, delays, cb) {
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            return Spiel.findById(singlespiel._id).exec(function (err, spiel) {
                if (err) {
                    return cb(err);
                }
                logger.silly('Calculating New Spiel Date/Time/Place');
                const dateTimePlace = helpers.calcSpielDateTime(index + 1, spielplan, delays);

                spiel.datum = dateTimePlace.date;
                spiel.uhrzeit = dateTimePlace.time;
                spiel.platz = dateTimePlace.platz;
                spiel.nummer = index + 1;
                logger.silly('Save new Spiel Data');
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    spiel.save(cb);
                });
            });
        });
    }

    router.put('/import', function (req, res) {
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);

            return importer.importSpiele(req.body, function (err, spiele) {
                if (err) return messages.Error(res, err);

                return messages.SpielplanAktualisert(res, spiele)
            });
        });
    });

    return router;
}
;