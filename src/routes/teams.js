module.exports = function () {
    var express = require('express');
    var router = express.Router();
    var mongoose = require('mongoose');
    var Gruppe = mongoose.model('Gruppe');
    var Jugend = mongoose.model('Jugend');
    var Team = mongoose.model('Team');
    var async = require('async');

    var messages = require('./messages/messages.js')();
    var helpers = require('./helpers.js');

    /**
     * @api {get} /teams Get Team
     * @apiName GetTeams
     * @apiDescription Lädt Teams, entweder Alle oder gefiltert nach ID, Jugend oder Gruppe
     * @apiGroup Teams
     *
     * @apiParam {String} [id] Optionale ID des Teams.
     * @apiParam {String} [gruppe] Optionale ID der Gruppe.
     * @apiParam {String} [jugend] Optionale ID der Jugend.
     *
     * @apiSuccess {String} _id ID des Teams
     * @apiSuccess {name} name Name des Teams
     * @apiUse JugendObject
     * @apiUse GruppeObject
     * @apiSuccess {Integer} tore Anzahl Tore des Teams
     * @apiSuccess {Integer} gtore Anzahl Gegen-Tore des Teams
     * @apiSuccess {Integer} punkte Anzahl Punkte des Teams
     * @apiSuccess {Integer} gpunkte Anzahl Gegenpunkte des Teams
     * @apiUse vResponse
     *
     * @apiUse ErrorTeamNotFoundMessage
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         _id: '57cffb4055a8d45fc084c108',
     *         name: 'Team A1',
     *         jugend: [ Object ],
     *         gruppe: [ Object ],
     *         tore: 4,
     *         gtore: 1,
     *         punkte: 2,
     *         gpunkte: 0
     *         __v: 3
     *     }
     **/
    router.get('/', function (req, res) {
        var data = helpers.getEntityQuery(Team, req);
        var query = data.query;
        var searchById = data.searchById;

        query.deepPopulate('gruppe jugend').exec(function (err, teams) {
            return helpers.handleQueryResponse(err, teams, res, searchById, messages.ErrorTeamNotFound);
        });
    });

    /**
     * @api {del} /teams Delete Team
     * @apiName DeleteTeams
     * @apiDescription Löscht ein Team
     * @apiGroup Teams
     * @apiPermission Admin
     *
     * @apiParam {String} id ID des Teams.
     *
     * @apiUse SuccessDeleteMessage
     **/
    router.delete('/', function (req, res) {
        if (!req.query.id) {
            return messages.ErrorBadRequest(res);
        }
        var query = Team.findById(req.query.id);
        query.deepPopulate('gruppe, jugend').exec(function (err, team) {
            if (err) {
                return messages.Error(res, err);
            }
            team.jugend.teams.splice(team.jugend.teams.indexOf(team), 1);
            team.jugend.save(function (err) {
                if (err) {
                    return messages.Error(res, err);
                }

                team.gruppe.teams.splice(team.gruppe.teams.indexOf(team), 1);
                team.gruppe.save(function (err) {
                    if (err) {
                        return messages.Error(res, err);
                    }

                    Team.remove({
                        "_id": team
                    }, function (err) {
                        if (err) {
                            return messages.Error(res, err);
                        }

                        return messages.Deleted(res);
                    });
                });
            });
        });
    });

    /**
     * @api {post} /teams Create Team
     * @apiName CreateTeams
     * @apiDescription Speichert ein neues Team
     * @apiGroup Teams
     *
     * @apiParam {String} gruppe ID der Gruppe.
     * @apiParam {String} jugend ID der Jugend.
     *
     * @apiSuccess {String} _id ID des Teams
     * @apiSuccess {name} name Name des Teams
     * @apiUse JugendObject
     * @apiUse GruppeObject
     * @apiSuccess {Integer} tore Anzahl Tore des Teams
     * @apiSuccess {Integer} gtore Anzahl Gegen-Tore des Teams
     * @apiSuccess {Integer} punkte Anzahl Punkte des Teams
     * @apiSuccess {Integer} gpunkte Anzahl Gegenpunkte des Teams
     * @apiUse vResponse
     * @apiPermission Admin
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     [{
     *         _id: '57cffb4055a8d45fc084c108',
     *         name: 'Neues Team',
     *         jugend: [ Object ],
     *         gruppe: [ Object ],
     *         tore: 0,
     *         gtore: 0,
     *         punkte: 0,
     *         gpunkte: 0
     *         __v: 3
     *     }]
     **/
    router.post('/', function (req, res) {
        if (!req.query.jugend || !req.query.gruppe || !req.body.name) {
            return messages.ErrorBadRequest(res);
        }
        var team = new Team(req.body);
        team.jugend = req.query.jugend;
        team.gruppe = req.query.gruppe;

        team.save(function (err, team) {
            if (err) {
                return messages.Error(res, err);
            }

            async.parallel([
                function (cb) {
                    Gruppe.findById(team.gruppe).exec(function (err, gruppe) {
                        if (err) {
                            return messages.Error(res, err);
                        }
                        gruppe.pushTeams(team, function (err) {
                            if (err) {
                                return messages.Error(res, err);
                            }

                            return cb();
                        });
                    });
                },
                function (cb) {
                    Jugend.findById(team.jugend).exec(function (err, jugend) {
                        if (err) {
                            return messages.Error(res, err);
                        }

                        jugend.pushTeams(team, function (err) {
                            if (err) {
                                return messages.Error(res, err);
                            }

                            return cb();
                        });
                    });
                }
            ], function (err) {
                if (err) {
                    return messages.Error(res, err);
                }

                return res.json(team);
            });
        });
    });

    /**
     * @api {put} /teams Update Team
     * @apiName UpdateTeam
     * @apiDescription Speichert einen neuen Team Namen
     * @apiGroup Teams
     *
     * @apiParam {String} id ID des Teams.
     *
     * @apiSuccess {String} _id ID des Teams
     * @apiSuccess {name} name Name des Teams
     * @apiUse JugendObject
     * @apiUse GruppeObject
     * @apiSuccess {Integer} tore Anzahl Tore des Teams
     * @apiSuccess {Integer} gtore Anzahl Gegen-Tore des Teams
     * @apiSuccess {Integer} punkte Anzahl Punkte des Teams
     * @apiSuccess {Integer} gpunkte Anzahl Gegenpunkte des Teams
     * @apiUse vResponse
     *
     * @apiPermission Admin
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     [{
     *         _id: '57cffb4055a8d45fc084c108',
     *         name: 'Neuer Name',
     *         jugend: [ Object ],
     *         gruppe: [ Object ],
     *         tore: 4,
     *         gtore: 1,
     *         punkte: 2,
     *         gpunkte: 0
     *         __v: 3
     *     }]
     **/
    router.put('/', function (req, res) {
        if (!req.query.id) {
            return messages.ErrorBadRequest(res);
        }
        Team.findById(req.query.id, function (err, team) {
            if (err) {
                return messages.Error(res, err);
            }

            team.name = req.body.name;
            team.save(function (err, team) {
                if (err) {
                    return messages.Error(res, err);
                }

                return res.json(team);
            });
        });
    });

    /**
     * @api {put} /teams/resetErgebnisse Reset Team-Ergebnis
     * @apiName ResetTeamErgebnis
     * @apiDescription Setzt die Ergebnisse aller Teams zurück
     * @apiGroup Teams
     *
     * @apiPermission Admin
     *
     * @apiUse ResetMessage
     **/
    router.put('/resetErgebnisse', function (req, res) {
        var query = Team.find();
        query.exec(function (err, teams) {
            if (err) {
                return messages.Error(res, err);
            }

            async.each(teams, function (team, cb) {
                team.resetErgebnis(function (err) {
                    if (err) {
                        return messages.Error(res, err);
                    }

                    return cb();
                });
            }, function (err) {
                if (err) {
                    return messages.Error(res, err);
                }

                return messages.Reset(res);
            });
        });
    });

    return router;
};
