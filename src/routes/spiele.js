module.exports = function (sendgrid, env, url, disableMails) {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var async = require('async');
    var moment = require('moment');

    var Spiel = mongoose.model('Spiel');
    var Subscriber = mongoose.model('Subscriber');
    var Spielplan = mongoose.model('Spielplan');
    var MailGenerator = require('./mailGenerator/mailGenerator.js')(sendgrid, env, url, disableMails);

    var messages = require('./messages/messages.js')();
    var helpers = require('./helpers.js')();
    var handler = require('./handler.js');

    function notifySubscribers(spiel, fn, callback) {
        return async.eachSeries([spiel.teamA, spiel.teamB], function (team, asyncdone) {
            if (team && team._id) {
                Subscriber.getByTeam(team._id).then(function (mails) {
                    var emails = [];
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
        return helpers.getEntity(Spiel, 'gruppe jugend teamA teamB gewinner', messages.ErrorSpielNotFound, res, req);
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
        var spiel = new Spiel(req.body);
        spiel.jugend = req.body.jugend;
        spiel.gruppe = req.body.gruppe;

        spiel.save(function (err, spiel) {
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
        //TODO Entweder kann das gelöscht werden, oder es kommt später wieder zum Einsatz z.B: beim Verschieben der Spiele
        var spiele = req.body;
        async.eachSeries(spiele, function (singlespiel, asyncdone) {
            var spiel = new Spiel(singlespiel);
            spiel.jugend = singlespiel.jugend;
            spiel.gruppe = singlespiel.gruppe;
            spiel.save(asyncdone);
        }, function (err) {
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
        var query = Spiel.findById(req.query.id);
        query.deepPopulate('gruppe jugend teamA teamB').exec(function (err, spiel) {
            if (err) {
                return messages.Error(res, err);
            }

            var oldData = {
                toreA: spiel.toreA,
                toreB: spiel.toreB,
                punkteA: spiel.punkteA,
                punkteB: spiel.punkteB
            };
            spiel.reset(function (err, spiel) {
                if (err) {
                    return messages.Error(res, err);
                }

                async.parallel([
                    function (cb) {
                        helpers.resetErgebnis(res, spiel, oldData, 'teamA', cb);
                    },
                    function (cb) {
                        helpers.resetErgebnis(res, spiel, oldData, 'teamB', cb);
                    }
                ], function (err) {
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
        var query = Spiel.findById(req.query.id);
        query.deepPopulate('gruppe jugend teamA teamB').exec(function (err, spiel) {
            if (err) {
                return messages.Error(res, err);
            }
            var toreAOld = spiel.toreA;
            var toreBOld = spiel.toreB;
            var punkteAOld = spiel.punkteA;
            var punkteBOld = spiel.punkteB;
            spiel.setTore(req.body.toreA, req.body.toreB, function (err, spiel) {
                if (err) {
                    return messages.Error(res, err);
                }

                //Set Ergebnis Team A
                spiel.teamA.setErgebnis(req.body.toreA, toreAOld, req.body.toreB, toreBOld, spiel.punkteA, punkteAOld, spiel.punkteB, punkteBOld, function (err,
                                                                                                                                                            teamA) {
                    if (err) {
                        return messages.Error(res, err);
                    }

                    //Set Ergebnis Team B
                    spiel.teamB.setErgebnis(req.body.toreB, toreBOld, req.body.toreA, toreAOld, spiel.punkteB, punkteBOld, spiel.punkteA, punkteAOld, function (err,
                                                                                                                                                                teamB) {
                        if (err) {
                            return messages.Error(res, err);
                        }

                        function sendNextSpielUpdates(cb) {
                            return Spiel.findOne({
                                nummer: spiel.nummer + 6
                            }).deepPopulate('teamA teamB').exec(function (err, nextspiel) {
                                if (err) {
                                    return messages.Error(res, err);
                                }
                                if (nextspiel) {
                                    if (!nextspiel.beendet) {
                                        notifySubscribers(nextspiel, MailGenerator.sendSpielReminder, cb);
                                    } else {
                                        return cb(null, {});
                                    }
                                } else {
                                    return cb(null, {});
                                }

                            });
                        }

                        if (disableMails !== 'true') {
                            return sendNextSpielUpdates(function (err) {
                                if (err) {
                                    return messages.Error(res, err);
                                }

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
        var spiele = req.body;

        var errorIndex = helpers.checkSpielOrderChangeAllowed(spiele);
        if (errorIndex >= 0) {
            return messages.ErrorSpielplanUngueltig(res, errorIndex);
        }


        Spielplan.findOne().exec(function (err, spielplan) {
            if (err) {
                return messages.Error(res, err);
            }

            async.eachSeries(spiele, function (singlespiel, asyncdone) {
                var index = spiele.indexOf(singlespiel);
                Spiel.findById(singlespiel._id).exec(function (err, spiel) {
                    if (err) {
                        return asyncdone(err);
                    }

                    var dateTimePlace = helpers.calcSpielDateTime(index + 1, spielplan);

                    spiel.datum = dateTimePlace.date;
                    spiel.uhrzeit = dateTimePlace.time;
                    spiel.platz = dateTimePlace.platz;
                    spiel.nummer = index + 1;
                    spiel.save(asyncdone);
                });
            }, function (err) {
                if (err) {
                    return messages.Error(res, err);
                }

                Spiel.find().deepPopulate('gruppe jugend teamA teamB gewinner').exec(function (err, neueSpiele) {
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