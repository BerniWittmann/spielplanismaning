module.exports = function (sendgrid, env, url, disableMails) {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var async = require('async');

    var Spiel = mongoose.model('Spiel');
    var Subscriber = mongoose.model('Subscriber');
    var MailGenerator = require('./mailGenerator/mailGenerator.js')(sendgrid, env, url, disableMails);

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
     * @apiUse spielResponse
     **/
    router.get('/', function (req, res) {
        var query = Spiel.find();
        if (req.param('id')) {
            query = Spiel.findById(req.param('id'));
        } else if (req.param('team')) {
            //noinspection JSUnresolvedFunction
            query = Spiel.find({}).or([{
                teamA: req.param('team')
            }, {
                teamB: req.param('team')
            }]);
        } else if (req.param('gruppe')) {
            query = Spiel.find({gruppe: req.param('gruppe')});
        }
        else if (req.param('jugend')) {
            query = Spiel.find({jugend: req.param('jugend')});
        }

        query.deepPopulate('gruppe jugend teamA teamB gewinner').exec(function (err, spiele) {
            if (err) {
                throw err;
            }

            res.json(spiele);
        });
    });

    /**
     * @api {Post} /spiele Create Spiel
     * @apiName CreateSpiel
     * @apiDescription Speichert ein Spiel
     * @apiGroup Spiele
     *
     * @apiUse spielResponse
     *
     **/
    router.post('/', function (req, res) {
        var spiel = new Spiel(req.body);
        spiel.jugend = req.body.jugend;
        spiel.gruppe = req.body.gruppe;

        spiel.save(function (err, spiel) {
            if (err) {
                throw err;
            }

            res.json(spiel);
        });
    });

    /**
     * @api {del} /spiele Delete Spiel
     * @apiName DeleteSpiel
     * @apiDescription Löscht ein Spiel
     * @apiGroup Spiele
     *
     * @apiParam {String} id ID des Spiels.
     *
     * @apiSuccess {String} body Erfolgsnachricht: success
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "success"
     *     }
     **/
    router.delete('/', function (req, res) {
        Spiel.remove({
            "_id": req.param('id')
        }, function (err) {
            if (err) {
                throw err;
            }

            res.json('success');
        });
    });

    /**
     * @api {Post} /spiele/alle Create Spielplan
     * @apiName CreateSpiele
     * @apiDescription Speichert alle Spiele
     * @apiGroup Spiele
     *
     * @apiSuccess {String} body Erfolgsnachricht: Spielplan erstellt
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "Spielplan erstellt"
     *     }
     *
     **/
    router.post('/alle', function (req, res) {
        var spiele = req.body;
        async.eachSeries(spiele, function (singlespiel, asyncdone) {
            var spiel = new Spiel(singlespiel);
            spiel.jugend = singlespiel.jugend;
            spiel.gruppe = singlespiel.gruppe;
            spiel.save(asyncdone);
        }, function (err) {
            if (err) return console.log(err);
            res.json('Spielplan erstellt');
        });
    });

    /**
     * @api {del} /spiele/alle Delete Alle Spiele
     * @apiName DeleteAlleSpiel
     * @apiDescription Löscht alle Spiele
     * @apiGroup Spiele
     *
     * @apiSuccess {String} body Erfolgsnachricht: success
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "success"
     *     }
     **/
    router.delete('/alle', function (req, res) {
        Spiel.remove({}, function (err) {
            if (err) {
                throw err;
            }

            res.json('success');
        });
    });

    /**
     * @api {del} /spiele/tore Delete Spiel Ergebnis
     * @apiName DeleteSpielErgebnis
     * @apiDescription Löscht die Ergebnisse eines Spiels
     * @apiGroup Spiele
     *
     * @apiParam {String} id ID des Spiels
     *
     * @apiUse spielResponse
     **/
    router.delete('/tore', function (req, res) {
        var query = Spiel.findById(req.param('id'));
        query.deepPopulate('gruppe jugend teamA teamB').exec(function (err, spiel) {
            if (err) {
                throw err;
            }

            var toreAOld = spiel.toreA;
            var toreBOld = spiel.toreB;
            var punkteAOld = spiel.punkteA;
            var punkteBOld = spiel.punkteB;
            spiel.reset(function (err, spiel) {
                if (err) {
                    throw err;
                }

                //TODO mit async lösen
                //Set Ergebnis Team A
                spiel.teamA.setErgebnis(0, toreAOld, 0, toreBOld, 0, punkteAOld, 0, punkteBOld, function (err) {
                    if (err) {
                        throw err;
                    }

                    //Set Ergebnis Team B
                    spiel.teamB.setErgebnis(0, toreBOld, 0, toreAOld, 0, punkteBOld, 0, punkteAOld, function (err) {
                        if (err) {
                            throw err;
                        }

                        res.json(spiel);
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
     *
     * @apiParam {String} id ID des Spiels
     *
     * @apiUse spielResponse
     *
     **/
    router.put('/tore', function (req, res) {
        var query = Spiel.findById(req.param('id'));
        query.deepPopulate('gruppe jugend teamA teamB').exec(function (err, spiel) {
            if (err) {
                throw err;
            }
            var toreAOld = spiel.toreA;
            var toreBOld = spiel.toreB;
            var punkteAOld = spiel.punkteA;
            var punkteBOld = spiel.punkteB;
            spiel.setTore(req.body.toreA, req.body.toreB, function (err, spiel) {
                if (err) {
                    throw err;
                }

                //Set Ergebnis Team A
                spiel.teamA.setErgebnis(req.body.toreA, toreAOld, req.body.toreB, toreBOld, spiel.punkteA, punkteAOld, spiel.punkteB, punkteBOld, function (
                    err,
                    teamA
                ) {
                    if (err) {
                        throw err;
                    }

                    //Set Ergebnis Team B
                    spiel.teamB.setErgebnis(req.body.toreB, toreBOld, req.body.toreA, toreAOld, spiel.punkteB, punkteBOld, spiel.punkteA, punkteAOld, function (
                        err,
                        teamB
                    ) {
                        if (err) {
                            throw err;
                        }

                        function sendNextSpielUpdates(cb) {
                            Spiel.findOne({
                                nummer: spiel.nummer + 6
                            }).deepPopulate('teamA teamB').exec(function (err, nextspiel) {
                                if (err) {
                                    return console.log(err)
                                }
                                if (nextspiel) {
                                    if (!nextspiel.beendet) {
                                        async.eachSeries([nextspiel.teamA, nextspiel.teamB], function (
                                            team,
                                            asyncdone
                                        ) {
                                            Subscriber.getByTeam(team._id).then(function (mails) {
                                                var emails = [];
                                                mails.forEach(function (mail) {
                                                    emails.push(mail.email);
                                                });
                                                if (emails.length > 0) {
                                                    //noinspection JSUnresolvedFunction
                                                    MailGenerator.sendSpielReminder(team, nextspiel, emails, asyncdone);
                                                } else {
                                                    return asyncdone(null, {});
                                                }
                                            });
                                        }, function (err) {
                                            if (err) {
                                                console.log(err);
                                            }
                                            return cb(null, {});
                                        });
                                    } else {
                                        return cb(null, {});
                                    }
                                } else {
                                    return cb(null, {});
                                }

                            });
                        }

                        if (disableMails != 'true') {
                            return sendNextSpielUpdates(function (err) {
                                if (err) {
                                    return console.log(err);
                                }

                                async.eachSeries([spiel.teamA, spiel.teamB], function (team, asyncdone) {
                                    Subscriber.getByTeam(team._id).then(function (mails) {
                                        var emails = [];
                                        mails.forEach(function (mail) {
                                            emails.push(mail.email);
                                        });
                                        if (emails.length > 0) {
                                            //noinspection JSUnresolvedFunction
                                            MailGenerator.sendErgebnisUpdate(team, spiel, emails, asyncdone);
                                        } else {
                                            return asyncdone(null, {});
                                        }

                                    });
                                }, function (err) {
                                    if (err) return console.log(err);
                                    res.json(spiel);
                                });
                            });
                        } else {
                            res.json(spiel);
                        }
                    });
                });
            });
        });
    });

    return router;
};