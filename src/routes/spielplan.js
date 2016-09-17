module.exports = function () {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var moment = require('moment');
    var async = require('async');

    var Spielplan = mongoose.model('Spielplan');
    var Spiel = mongoose.model('Spiel');

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
     * @apiSuccess {Array} spiele Spiele (wird nicht genutzt) TODO entfernen
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
     *         ausnahmen: [ [ Object ], [ Object ] ],
     *         spiele: []
     *     }]
     **/
    router.get('/', function (req, res) {
        var query = Spielplan.findOne({});
        query.deepPopulate('ausnahmen ausnahmen.team1 ausnahmen.team2').exec(function (err, spielplan) {
            if (err) {
                throw err;
            }
            res.json(spielplan);
        });
    });

    /**
     * @api {Put} /spielplan/zeiten Update Spielplan-Zeiten
     * @apiName PutSpielplanZeiten
     * @apiDescription Updatet die Spielplan-Zeiten
     * @apiGroup Spielplan
     *
     * @apiSuccess {String} body Success-Message: Spielplan erstellt
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         "Spielplan erstellt"
     *     }
     **/
    router.put('/zeiten', function (req, res) {
        Spielplan.findOneAndUpdate({}, req.body, {
            upsert: true
        }, function (err) {
            if (err) return res.send(500, {
                error: err
            });

            Spiel.find().exec(function (err, spiele) {
                if (err) {
                    return err;
                }

                spiele = spiele.sort(compareNumbers);
                async.eachSeries(spiele, function (singlespiel, asyncdone) {
                    var zeit = moment(req.body.startzeit, 'HH:mm').add(Math.floor((singlespiel.nummer - 1) / 3) * (req.body.spielzeit + req.body.pausenzeit), 'm');
                    singlespiel.uhrzeit = zeit.format('HH:mm');
                    singlespiel.save(asyncdone);
                }, function (err) {
                    if (err) return console.log(err);

                    res.json('Spielplan erstellt');

                });

                function compareNumbers(a, b) {
                    return a.nummer - b.nummer;
                }
            });
        });
    });

    /**
     * @api {Put} /spielplan/ausnahmen Update Spielplan-Ausnahmen
     * @apiName PutSpielplanAusnahmen
     * @apiDescription Updatet die Spielplan-Ausnahmen
     * @apiGroup Spielplan
     *
     * @apiSuccess {String} _id ID der Ausnahme
     * @apiSuccess {Object} team1 Team-Object des ersten Teams
     * @apiSuccess {Object} team2 Team-Object des zweiten Teams
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     [ {
     *         _id: '5769b241246cc9db21377284',
     *         team1: [Object],
     *         team2: [Object]
     *     }, {
     *         team1: null,
     *         team2: null,
     *         _id: '577be9e15060bba2b1d5659d'
     *      } ]
     **/
    router.put('/ausnahmen', function (req, res) {
        Spielplan.findOne({}).exec(function (err, spielplan) {
            if (err) {
                throw err;
            }

            spielplan.setAusnahmen(req.body, function (err, spielplan) {
                if (err) {
                    throw err;
                }

                res.json(spielplan.ausnahmen);
            });
        });
    });

    /**
     * @api {get} /spielplan/ausnahmen Get Spielplan-Ausnahmen
     * @apiName GetSpielplanAusnahmen
     * @apiDescription Lädt die Spielplan-Ausnahmen
     * @apiGroup Spielplan
     *
     * @apiSuccess {String} _id ID der Ausnahme
     * @apiSuccess {Object} team1 Team-Object des ersten Teams
     * @apiSuccess {Object} team2 Team-Object des zweiten Teams
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     [ {
     *         _id: '5769b241246cc9db21377284',
     *         team1: [Object],
     *         team2: [Object]
     *     }, {
     *         team1: null,
     *         team2: null,
     *         _id: '577be9e15060bba2b1d5659d'
     *      } ]
     **/
    router.get('/ausnahmen', function (req, res) {
        Spielplan.findOne({}).deepPopulate('ausnahmen ausnahmen.team1 ausnahmen.team2').exec(function (err, spielplan) {
            if (err) {
                throw err;
            }

            res.json(spielplan.ausnahmen);
        });
    });

    return router;
};