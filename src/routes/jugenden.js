module.exports = function () {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var Gruppe = mongoose.model('Gruppe');
    var Jugend = mongoose.model('Jugend');
    var Team = mongoose.model('Team');

    router.get('/', function (req, res) {
        var query = Jugend.find();
        if (req.param('id')) {
            query = Jugend.findById(req.param('id'));
        }
        query.deepPopulate('gruppen teams gruppen.teams').exec(function (err, jugenden) {
            if (err) {
                throw err;
            }

            res.json(jugenden);
        });
    });

    router.post('/', function (req, res) {
        var jugend = new Jugend(req.body);

        jugend.save(function (err, jugend) {
            if (err) {
                throw err;
            }
            var gruppe = new Gruppe({
                name: "Gruppe A"
                , jugend: jugend._id
            });

            gruppe.save(function (err, gruppe) {
                if (err) {
                    throw err;
                }

                jugend.gruppen.push(gruppe._id);

                jugend.save(function (err, jugend) {
                    if (err) {
                        throw err;
                    }

                    res.json(jugend);
                });
            });
        });
    });

    router.delete('/', function (req, res) {
        Team.remove({
            "jugend": req.param('id')
        }, function (err) {
            if (err) {
                throw err;
            }

            Gruppe.remove({
                "jugend": req.param('id')
            }, function (err) {
                if (err) {
                    throw err;
                }

                Jugend.remove({
                    "_id": req.param('id')
                }, function (err) {
                    if (err) {
                        throw err;
                    }
                    res.json('Successful');
                });
            });
        });
    });

    router.get('/tore', function (req, res) {
        var query = Jugend.find();
        if (req.param('id')) {
            query = Jugend.findById(req.param('id'));
        }
        var tore = 0;
        var teams = [];
        query.deepPopulate('teams').exec(function (err, jugenden) {
            if (err) {
                return err;
            }
            if (!req.param('id')) {
                jugenden.forEach(function (jugend) {
                    jugend.teams.forEach(function (team) {
                        teams.push(team);
                    });
                });
            } else {
                jugenden.teams.forEach(function (team) {
                    teams.push(team);
                });
            }
            teams.forEach(function (team) {
                tore += team.tore;
            });
            res.json(tore);
        });
    });

    return router;
};