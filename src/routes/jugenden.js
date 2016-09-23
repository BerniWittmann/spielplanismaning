module.exports = function () {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var Gruppe = mongoose.model('Gruppe');
    var Jugend = mongoose.model('Jugend');
    var Team = mongoose.model('Team');

    var messages = require('./messages/messages.js')();

    /**
     * @api {get} /jugenden Get Jugenden
     * @apiName GetJugenden
     * @apiDescription Lädt Jugenden, entweder Alle oder gefiltert nach ID
     * @apiGroup Jugend
     *
     * @apiParam {String} [id]  Optionale ID der Jugend.
     *
     * @apiSuccess {String} _id ID der Jugend
     * @apiSuccess {name} name Name der Jugend
     * @apiSuccess {String} color Farbe der Jugend
     * @apiSuccess {Array} grupppen Gruppen der Jugend
     * @apiSuccess {Array} teams Teams der Jugend
     * @apiUse vResponse
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     [{
     *         _id: '57cffb4055a8d45fc084c107',
     *         name: 'Jugend 1',
     *         color: 'gruen',
     *         teams: [Object],
     *         gruppen: [Object],
     *         __v: 4
     *     }]
     **/
    router.get('/', function (req, res) {
        var query = Jugend.find();
        if (req.param('id')) {
            query = Jugend.findById(req.param('id'));
        }
        query.deepPopulate('gruppen teams gruppen.teams').exec(function (err, jugenden) {
            if (err) {
                return messages.Error(res, err);
            }

            return res.json(jugenden);
        });
    });

    /**
     * @api {Post} /jugenden Create Jugend
     * @apiName CreateJugend
     * @apiDescription Speichert eine neue Jugend
     * @apiGroup Jugend
     *
     * @apiSuccess {String} _id ID der Jugend
     * @apiSuccess {name} name Name der Jugend
     * @apiSuccess {String} color Farbe der Jugend
     * @apiSuccess {Array} grupppen Gruppen der Jugend
     * @apiSuccess {Array} teams Teams der Jugend
     * @apiUse vResponse
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         _id: '57cffb4055a8d45fc084c107',
     *         name: 'Jugend 1',
     *         color: 'gruen',
     *         teams: [ [Object], [Object] ],
     *         gruppen: [Object],
     *         __v: 4
     *     }
     *
     **/
    router.post('/', function (req, res) {
        var jugend = new Jugend(req.body);

        jugend.save(function (err, jugend) {
            if (err) {
                return messages.Error(res, err);
            }
            var gruppe = new Gruppe({
                name: "Gruppe A"
                , jugend: jugend._id
            });

            gruppe.save(function (err, gruppe) {
                if (err) {
                    return messages.Error(res, err);
                }

                jugend.gruppen.push(gruppe._id);

                jugend.save(function (err, jugend) {
                    if (err) {
                        return messages.Error(res, err);
                    }

                    jugend.deepPopulate('gruppen teams gruppen.teams', function (err, jgd) {
                        if (err) {
                            return messages.Error(res, err);
                        }

                        return res.json(jgd);
                    });
                });
            });
        });
    });

    /**
     * @api {del} /jugenden Delete Jugend
     * @apiName DeleteJugend
     * @apiDescription Löscht eine Jugend
     * @apiGroup Jugend
     *
     * @apiParam {String} id ID der Jugend.
     *
     * @apiSuccess {String} body Erfolgsnachricht: Successful
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "Successful"
     *     }
     **/
    router.delete('/', function (req, res) {
        Team.remove({
            "jugend": req.param('id')
        }, function (err) {
            if (err) {
                return messages.Error(res, err);
            }

            Gruppe.remove({
                "jugend": req.param('id')
            }, function (err) {
                if (err) {
                    return messages.Error(res, err);
                }

                Jugend.remove({
                    "_id": req.param('id')
                }, function (err) {
                    if (err) {
                        return messages.Error(res, err);
                    }
                    return messages.Deleted(res);
                });
            });
        });
    });

    /**
     * @api {get} /jugenden/tore Get Tore
     * @apiName GetTore
     * @apiDescription Lädt die Tore, entweder die aller Jugenden oder einer einzelnen
     * @apiGroup Jugend
     *
     * @apiParam {String} [id]  Optionale ID der Jugend.
     *
     * @apiSuccess {Integer} Body Tore
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         9
     *     }
     **/
    router.get('/tore', function (req, res) {
        var query = Jugend.find();
        if (req.param('id')) {
            query = Jugend.findById(req.param('id'));
        }
        var tore = 0;
        var teams = [];
        query.deepPopulate('teams').exec(function (err, jugenden) {
            if (err) {
                return messages.Error(res, err);
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
            return res.json(tore);
        });
    });

    return router;
};