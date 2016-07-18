module.exports = function () {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var moment = require('moment');
    var async = require('async');

    var Spielplan = mongoose.model('Spielplan');
    var Spiel = mongoose.model('Spiel');

    router.get('/', function (req, res) {
        var query = Spielplan.findOne({});
        query.deepPopulate('ausnahmen ausnahmen.team1 ausnahmen.team2').exec(function (err, spielplan) {
            if (err) {
                throw err;
            }
            res.json(spielplan);
        });
    });

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