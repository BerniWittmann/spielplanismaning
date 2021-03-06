module.exports = function () {
    const logger = require('winston').loggers.get('apiJugenden');
    const express = require('express');
    const async = require('async');
    const router = express.Router();
    const cls = require('../config/cls.js');

    const mongoose = require('mongoose');
    const Gruppe = mongoose.model('Gruppe');
    const Jugend = mongoose.model('Jugend');
    const Team = mongoose.model('Team');
    const Spiel = mongoose.model('Spiel');

    const messages = require('./messages/messages.js')();
    const helpers = require('./helpers.js');
    const handler = require('./handler.js');

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
     *
     * @apiUse ErrorJugendNotFoundMessage
     **/
    router.get('/', function (req, res) {
        return helpers.getEntity(Jugend, 'gruppen teams gruppen.teams', messages.ErrorJugendNotFound, res, req);
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
     * @apiPermission Admin
     * @apiUse AuthHeader
     *
     * @apiUse ErrorBadRequest
     *
     * @apiParam {String} name Name der Jugend.
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
        logger.verbose('Creating Jugend %s', req.body.name);

        if (req.body.gruppen && req.body.gruppen.length > 0) {
            return createFilledJugend(req, res);
        }
        return createBlankJugend(req, res);
    });

    function createBlankJugend(req, res) {
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            const jugend = new Jugend(req.body);
            jugend.veranstaltung = beachEventID;
            jugend.save(function (err, jugend) {
                if (err) {
                    return messages.Error(res, err);
                }
                logger.verbose('Jugend created');
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    const gruppe = new Gruppe({
                        name: "Gruppe A",
                        jugend: jugend._id,
                        veranstaltung: beachEventID
                    });

                    gruppe.save(function (err, gruppe) {
                        if (err) {
                            return messages.Error(res, err);
                        }

                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            jugend.gruppen.push(gruppe._id);

                            jugend.save(function (err, jugend) {
                                if (err) {
                                    return messages.Error(res, err);
                                }

                                logger.verbose('Added default Gruppe');

                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', beachEventID);
                                    jugend.deepPopulate('gruppen teams gruppen.teams', function (err, jgd) {
                                        return handler.handleErrorAndResponse(err, res, jgd);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    function createFilledJugend(req, res) {
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            const jugend = new Jugend({
                name: req.body.name,
                color: req.body.color
            });
            jugend.veranstaltung = beachEventID;
            return jugend.save(function (err, jugend) {
                if (err) {
                    return messages.Error(res, err);
                }

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    let teamids = [];
                    let gruppenids = [];
                    return async.each(req.body.gruppen, function (gruppe, asyncdone) {
                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            return helpers.createGruppeWithTeams(jugend._id, gruppe, function (err, returnedData) {
                                if (err) return asyncdone(err);

                                if (returnedData.teamids) {
                                    teamids = teamids.concat(returnedData.teamids);
                                }
                                if (returnedData.gruppe) {
                                    gruppenids = gruppenids.concat(returnedData.gruppe._id);
                                }
                                return asyncdone();
                            });
                        });
                    }, function (err) {
                        if (err) return messages.Error(res, err);

                        jugend.teams = teamids;
                        jugend.gruppen = gruppenids;
                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            return jugend.save(function (err, jugend) {
                                if (err) return messages.Error(res, err);
                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', beachEventID);
                                    return jugend.deepPopulate('teams gruppen gruppen.teams', function (err, jugend) {
                                        return handler.handleErrorAndResponse(err, res, jugend);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    /**
     * @api {del} /jugenden Delete Jugend
     * @apiName DeleteJugend
     * @apiDescription Löscht eine Jugend
     * @apiGroup Jugend
     * @apiPermission Admin
     * @apiUse AuthHeader
     *
     * @apiUse ErrorBadRequest
     *
     * @apiParam {String} id ID der Jugend.
     *
     * @apiUse SuccessDeleteMessage
     **/
    router.delete('/', function (req, res) {
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            Jugend.findOne({_id: mongoose.Types.ObjectId(req.query.id)}, function (err, jgd) {
                if (!jgd) {
                    logger.warn('Jugend %s not found', req.query.id);
                    return messages.ErrorBadRequest(res, ['Jugend not found']);
                }
                if (err) {
                    return messages.Error(res, err);
                }

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    return helpers.removeEntityBy(Team, 'jugend', req.query.id, function (err) {
                        if (err) return messages.Error(res, err);
                        logger.verbose('Removed All Teams from this Jugend');
                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            return helpers.removeEntityBy(Gruppe, 'jugend', req.query.id, function (err) {
                                if (err) return messages.Error(res, err);
                                logger.verbose('Removed All Gruppen from this Jugend');
                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', beachEventID);
                                    return helpers.removeEntityBy(Jugend, '_id', req.query.id, function (err) {
                                        return handler.handleErrorAndDeleted(err, res);
                                    });
                                });
                            });
                        });
                    });
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
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            let query = Spiel.find({});
            if (req.query.id) {
                query = Spiel.find({'jugend': req.query.id});
            }
            let tore = 0;
            query.exec(function (err, spiele) {
                if (err) {
                    return messages.Error(res, err);
                }
                spiele.forEach(function (spiel) {
                    if (spiel.beendet) {
                        tore += spiel.toreA;
                        tore += spiel.toreB;
                    }
                });
                logger.verbose('%d Tore counted', tore);
                return res.json(tore);
            });
        });
    });

    return router;
};