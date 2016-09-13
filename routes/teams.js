module.exports = function () {
    var express = require('express');
    var router = express.Router();
    var mongoose = require('mongoose');
    var Gruppe = mongoose.model('Gruppe');
    var Jugend = mongoose.model('Jugend');
    var Team = mongoose.model('Team');

    router.get('/', function (req, res) {
        var query = Team.find();
        if (req.param('id')) {
            //TODO findById verwenden, damit kein Array rauskommt
            query = Team.find({_id: req.param('id')});
        } else if (req.param('gruppe')) {
            query = Team.find({gruppe: req.param('gruppe')});
        } else if (req.param('jugend')) {
            query = Team.find({jugend: req.param('jugend')});
        }

        query.deepPopulate('gruppe jugend').exec(function (err, teams) {
            if (err) {
                throw err;
            }

            res.json(teams);
        });
    });

    router.delete('/', function (req, res) {
        var query = Team.findById(req.param('id'));
        query.deepPopulate('gruppe, jugend').exec(function (err, team) {
            if (err) {
                throw err;
            }
            team.jugend.teams.splice(team.jugend.teams.indexOf(team), 1);
            team.jugend.save(function (err) {
                if (err) {
                    throw err;
                }

                team.gruppe.teams.splice(team.gruppe.teams.indexOf(team), 1);
                team.gruppe.save(function (err) {
                    if (err) {
                        throw err;
                    }

                    Team.remove({
                        "_id": team
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

    router.post('/', function (req, res) {
        var team = new Team(req.body);
        team.jugend = req.param('jugend');
        team.gruppe = req.param('gruppe');

        team.save(function (err, team) {
            if (err) {
                throw err;
            }
            Gruppe.findById(team.gruppe).exec(function (err, gruppe) {
                if (err) {
                    throw err;
                }
                gruppe.pushTeams(team, function (err) {
                    if (err) {
                        throw err;
                    }

                    Jugend.findById(team.jugend).exec(function (err, jugend) {
                        if (err) {
                            throw err;
                        }

                        jugend.pushTeams(team, function (err) {
                            if (err) {
                                throw err;
                            }

                            res.json(team);
                        })
                    });

                });
            });

        });
    });

    router.put('/', function (req, res) {
        Team.findById(req.param('id'), function (err, team) {
            team.name = req.body.name;
            team.save(function (err, team) {
                if (err) {
                    throw err;
                }

                res.json(team);
            });
        });
    });

    router.put('/resetErgebnisse', function (req, res) {
        var query = Team.find();
        query.exec(function (err, teams) {
            if (err) {
                throw err;
            }

            //TODO mit async besser lösen
            for (var i = 0; i < teams.length; i++) {
                var team = teams[i];
                team.resetErgebnis(function (err) {
                    if (err) {
                        throw err;
                    }
                })
            }
            res.json('Successful Reset');
        });
    });

    return router;
};
