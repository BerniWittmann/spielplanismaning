module.exports = function () {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var Gruppe = mongoose.model('Gruppe');
    var Jugend = mongoose.model('Jugend');
    var Team = mongoose.model('Team');

    var messages = require('./messages/messages.js')();
    var helpers = require('./helpers.js');
    var handler = require('./handler.js');

    /**
     * @api {get} /gruppen Get Gruppen
     * @apiName GetGruppen
     * @apiDescription Lädt Gruppen, entweder Alle oder gefiltert nach ID oder Jugend
     * @apiGroup Gruppe
     *
     * @apiParam {String} [id]  Optionale ID der Gruppe.
     * @apiParam {String} [jugend]  Optionale ID der Jugend.
     *
     * @apiSuccess {String} _id ID der Gruppe
     * @apiSuccess {name} name Name der Gruppe
     * @apiUse JugendObject
     * @apiSuccess {Array} teams Teams der Gruppe
     * @apiUse vResponse
     *
     * @apiUse ErrorGruppeNotFoundMessage
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     [{
     *         _id: '57cffb4055a8d45fc084c108',
     *         name: 'Gruppe A',
     *         jugend: {
     *             _id: '57cffb4055a8d45fc084c107',
     *             name: 'Jugend 1',
     *             color: 'gruen',
     *             __v: 4,
     *             teams: [Object],
     *             gruppen: [Object]
     *         },
     *         __v: 3,
     *         teams: [ [Object], [Object], [Object] ]
     *     }]
     **/
    router.get('/', function (req, res) {
        var data = helpers.getEntityQuery(Gruppe, req);
        var query = data.query;
        var searchById = data.searchById;

        query.deepPopulate('jugend teams').exec(function (err, gruppe) {
            return handler.handleQueryResponse(err, gruppe, res, searchById, messages.ErrorGruppeNotFound);
        });
    });

    /**
     * @api {Post} /gruppen Create Gruppen
     * @apiName CreateGruppen
     * @apiDescription Speichert eine neue Gruppe
     * @apiGroup Gruppe
     *
     * @apiParam {String} jugend  ID der Jugend.
     *
     * @apiSuccess {String} _id ID der Gruppe
     * @apiSuccess {name} name Name der Gruppe
     * @apiUse jugendID
     * @apiSuccess {Array} teams Teams der Gruppe
     * @apiUse vResponse
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     [{
     *         _id: '57cffb4055a8d45fc084c108',
     *         name: 'Gruppe A',
     *         jugend: '57cffb4055a8d45fc084c107',
     *         __v: 3,
     *         teams: [ [Object], [Object], [Object] ]
     *     }]
     *
     * @apiUse ErrorMaxZahlGruppe
     * @apiPermission Admin
     *
     * @apiUse ErrorBadRequest
     **/
    router.post('/', function (req, res) {
        if (!req.query.jugend || !req.body.name) {
            return messages.ErrorBadRequest(res);
        }
        var gruppe = new Gruppe(req.body);
        gruppe.jugend = req.query.jugend;
        var query = Jugend.findById(gruppe.jugend);

        query.exec(function (err, jugend) {
            if(!jugend) {
                return messages.ErrorBadRequest(res);
            }
            if (err) {
                return messages.Error(res, err);
            }
            if (jugend.gruppen.length >= 4) {
                return messages.ErrorMaxZahlGruppe(res);
            } else {
                gruppe.save(function (err, gruppe) {
                    if (err) {
                        return messages.Error(res, err);
                    }

                    jugend.pushGruppe(gruppe, function (err) {
                        return handler.handleErrorAndResponse(err, res, gruppe);
                    });
                });
            }

        });
    });

    /**
     * @api {del} /gruppen Delete Gruppe
     * @apiName DeleteGruppe
     * @apiDescription Löscht eine Gruppe
     * @apiGroup Gruppe
     *
     * @apiParam {String} id ID der Gruppe.
     *
     * @apiUse SuccessMessage
     * @apiPermission Admin
     *
     * @apiUse ErrorBadRequest
     * @apiUse ErrorGruppeNotFoundMessage
     **/
    router.delete('/', function (req, res) {
        if (!req.query.id) {
            return messages.ErrorBadRequest(res);
        }
        Gruppe.findById(req.query.id, function (err, gruppe) {
            if(!gruppe) {
                return messages.ErrorGruppeNotFound(res, err);
            }

            if (err) {
                return messages.Error(res, err);
            }

            Jugend.findById(gruppe.jugend, function (err, jugend) {
                if (err) {
                    return messages.Error(res, err);
                }

                jugend.removeGruppe(gruppe, function (err) {
                    if (err) {
                        return messages.Error(res, err);
                    }

                    Team.remove({
                        "gruppe": gruppe
                    }, function (err) {
                        if (err) {
                            return messages.Error(res, err);
                        }

                        Gruppe.remove({
                            "_id": gruppe
                        }, function (err) {
                            return handler.handleErrorAndDeleted(err, res);
                        });
                    });
                });
            });
        });
    });

    return router;
};