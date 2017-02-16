module.exports = function () {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var moment = require('moment');
    var async = require('async');

    var Spielplan = mongoose.model('Spielplan');
    var Spiel = mongoose.model('Spiel');

    var messages = require('./messages/messages.js')();
    var spielplanGenerator = require('./spielplanGenerator/spielplanGenerator')();
    var handler = require('./handler.js');

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
        var query = Spielplan.findOne({});
        query.deepPopulate('ausnahmen ausnahmen.team1 ausnahmen.team2').exec(function (err, spielplan) {
            return handler.handleErrorAndResponse(err, res, spielplan);
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
        spielplanGenerator.generateNew(function (err) {
            return handler.handleErrorAndMessage(err, res, messages.SpielplanErstellt);
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
     *
     * @apiUse SuccessMessage
     *
     * @apiUse ErrorBadRequest
     **/
    router.put('/zeiten', function (req, res) {
        Spielplan.findOneAndUpdate({}, req.body, {
            upsert: true
        }, function (err) {
            if (err) return messages.Error(res, err);

            Spiel.find().exec(function (err, spiele) {
                if (err) {
                    return messages.Error(res, err);
                }

                spiele = spiele.sort(compareNumbers);
                async.eachSeries(spiele, function (singlespiel, asyncdone) {
                    var zeit = moment(req.body.startzeit, 'HH:mm').add(Math.floor((singlespiel.nummer - 1) / 3) * (req.body.spielzeit + req.body.pausenzeit), 'm');
                    singlespiel.uhrzeit = zeit.format('HH:mm');
                    singlespiel.save(asyncdone);
                }, function (err) {
                    return handler.handleErrorAndSuccess(err, res);

                });

                function compareNumbers(a, b) {
                    return a.nummer - b.nummer;
                }
            });
        });
    });

    return router;
};