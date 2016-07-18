module.exports = function () {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var Gruppe = mongoose.model('Gruppe');
    var Jugend = mongoose.model('Jugend');
    var Team = mongoose.model('Team');

    router.get('/', function (req, res, next) {
        var query = Gruppe.find();
        if (req.param('id')) {
            query = Gruppe.findById(req.param('id'));
        } else if (req.param('jugend')) {
            query = Gruppe.find({
                "jugend": req.param('jugend')
            });
        }

        query.deepPopulate('jugend teams').exec(function (err, gruppe) {
            if (err) {
                throw err;
            }
            if (!gruppe) {
                return next(new Error('can\'t find Gruppe'));
            }

            res.json(gruppe);
        });
    });

    router.post('/', function (req, res) {
        var gruppe = new Gruppe(req.body);
        gruppe.jugend = req.param('jugend');
        var query = Jugend.findById(gruppe.jugend);

        query.exec(function (err, jugend) {
            if (jugend.gruppen.length >= 4) {
                return res.status(418).json({
                    message: 'Maximalzahl an Gruppen für diese Jugend erreicht'
                });
            } else {
                gruppe.save(function (err, gruppe) {
                    if (err) {
                        throw err;
                    }

                    jugend.pushGruppe(gruppe, function (err) {
                        if (err) {
                            throw err;
                        }

                        res.json(gruppe);
                    })
                });
            }

        });
    });

    router.delete('/', function (req, res) {
        Gruppe.findById(req.param('id'), function (err, gruppe) {
            if (err) {
                return err;
            }
            Jugend.findById(gruppe.jugend, function (err, jugend) {
                if (err) {
                    throw err;
                }

                jugend.removeGruppe(gruppe, function (err) {
                    if (err) {
                        throw err;
                    }

                    Team.remove({
                        "gruppe": gruppe
                    }, function (err) {
                        if (err) {
                            throw err;
                        }

                        Gruppe.remove({
                            "_id": gruppe
                        }, function (err) {
                            if (err) {
                                throw err;
                            }

                            res.json("success");
                        });
                    });
                });
            });
        });
    });

    return router;
};