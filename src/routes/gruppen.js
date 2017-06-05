module.exports = function () {
    const logger = require('winston').loggers.get('apiGruppen');
    const express = require('express');
    const router = express.Router();
    const cls = require('../config/cls.js');

    const mongoose = require('mongoose');
    const async = require('async');
    const _ = require('lodash');
    const Gruppe = mongoose.model('Gruppe');
    const Jugend = mongoose.model('Jugend');
    const Team = mongoose.model('Team');

    const messages = require('./messages/messages.js')();
    const helpers = require('./helpers.js');
    const handler = require('./handler.js');

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
        return helpers.getEntity(Gruppe, 'jugend teams', messages.ErrorGruppeNotFound, res, req);
    });

    /**
     * @api {Post} /gruppen Create Gruppen
     * @apiName CreateGruppen
     * @apiDescription Speichert eine neue Gruppe
     * @apiGroup Gruppe
     *
     * @apiParam {String} jugend  ID der Jugend.
     * @apiParam {String} name Name der Gruppe
     *
     * @apiSuccess {String} _id ID der Gruppe
     * @apiSuccess {name} name Name der Gruppe
     * @apiUse jugendID
     * @apiSuccess {Array} teams Teams der Gruppe
     * @apiUse vResponse
     * @apiUse AuthHeader
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
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            logger.verbose('Creating Gruppe %s', req.body.name);
            const gruppe = new Gruppe(req.body);
            logger.verbose('Setting Jugend %s', req.query.jugend);
            gruppe.jugend = req.query.jugend;
            gruppe.veranstaltung = beachEventID;
            const query = Jugend.findOne({_id: mongoose.Types.ObjectId(gruppe.jugend)});

            query.exec(function (err, jugend) {
                if (!jugend) {
                    logger.warn('Jugend %s not found', req.query.jugend);
                    return messages.ErrorBadRequest(res, ['Jugend not found']);
                }
                if (err) {
                    return messages.Error(res, err);
                }

                const normalGroups = jugend.gruppen.filter(function (single) {
                    return single.type === 'normal';
                });
                if (normalGroups.length >= 4) {
                    logger.warn('Maximum amount of Gruppen in Jugend reached');
                    return messages.ErrorMaxZahlGruppe(res);
                } else {
                    logger.verbose('Saving Gruppe %s', req.body.name);
                    return clsSession.run(function () {
                        clsSession.set('beachEventID', beachEventID);
                        gruppe.save(function (err, gruppe) {
                            if (err) {
                                return messages.Error(res, err);
                            }
                            logger.verbose('Gruppe saved');

                            return clsSession.run(function () {
                                clsSession.set('beachEventID', beachEventID);
                                jugend.pushGruppe(gruppe, function (err) {
                                    logger.verbose('Add Gruppe to Jugend');
                                    return handler.handleErrorAndResponse(err, res, gruppe);
                                });
                            });
                        });
                    });
                }
            });
        });
    });

    router.post('/zwischengruppe', function (req, res) {
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            helpers.removeZwischenGruppen(function (err) {
                if (err) return messages.Error(res, err);

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);

                    return async.each(req.body, function (gruppe, asyncdone) {
                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            return createZwischenGruppe(gruppe, req.query.jugend, asyncdone);
                        });
                    }, function (err) {
                        if (err) return messages.Error(res, err);

                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            return Jugend.findOne({_id: mongoose.Types.ObjectId(req.query.jugend)}, function (err, jugend) {
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
    });

    function createZwischenGruppe(data, jugendid, cb) {
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            logger.verbose('Creating Zwischen Gruppe %s', data.name);
            const gruppe = new Gruppe({
                name: data.name,
                type: 'zwischenrunde',
                jugend: jugendid
            });
            gruppe.veranstaltung = beachEventID;
            const teamids = data.teams.map(function (single) {
                if (_.isObject(single)) {
                    return single._id;
                }
                return single;
            });
            gruppe.teams = teamids;
            const query = Jugend.findOne({_id: mongoose.Types.ObjectId(gruppe.jugend)});

            query.exec(function (err, jugend) {
                if (!jugend) {
                    logger.warn('Jugend %s not found', jugendid);
                    return cb(new Error('Jugend not found'));
                }
                if (err) {
                    return cb(err);
                }
                logger.verbose('Saving Gruppe %s', data.name);
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    gruppe.save(function (err, gruppe) {
                        if (err) {
                            return cb(err);
                        }
                        logger.verbose('Gruppe saved');

                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            jugend.pushGruppe(gruppe, function (err) {
                                logger.verbose('Add Gruppe to Jugend');
                                if (err) return cb(err);

                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', beachEventID);
                                    return async.each(teamids, function (teamid, asyncdone) {

                                        return clsSession.run(function () {
                                            clsSession.set('beachEventID', beachEventID);

                                            return helpers.TeamAddZwischengruppe(teamid, gruppe._id, asyncdone);
                                        });
                                    }, cb);
                                });
                            });
                        });
                    });
                });
            });
        });
    }

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
     * @apiUse AuthHeader
     *
     * @apiUse ErrorBadRequest
     * @apiUse ErrorGruppeNotFoundMessage
     **/
    router.delete('/', function (req, res) {
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            Gruppe.findOne({_id: mongoose.Types.ObjectId(req.query.id)}, function (err, gruppe) {
                if (!gruppe) {
                    logger.warn('Gruppe %s not found', req.query.id);
                    return messages.ErrorGruppeNotFound(res, err);
                }

                if (err) {
                    return messages.Error(res, err);
                }

                if (gruppe.type !== 'normal') {
                    logger.warn('Gruppe %s kann nicht gelöscht werden', gruppe.name);
                    return messages.ErrorBadRequest(res);
                }

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    Jugend.findById(gruppe.jugend, function (err, jugend) {
                        if (err) {
                            return messages.Error(res, err);
                        }

                        return clsSession.run(function () {
                            clsSession.set('beachEventID', beachEventID);
                            jugend.removeGruppe(gruppe, function (err) {
                                if (err) {
                                    return messages.Error(res, err);
                                }
                                logger.verbose('Removed Gruppe from Jugend');

                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', beachEventID);
                                    return helpers.removeEntityBy(Team, 'gruppe', gruppe, function (err) {
                                        if (err) return messages.Error(res, err);
                                        logger.verbose('Removed All Teams from this Gruppe');
                                        return clsSession.run(function () {
                                            clsSession.set('beachEventID', beachEventID);
                                            return helpers.removeEntityBy(Gruppe, '_id', gruppe, function (err) {
                                                if (err) return messages.Error(res, err);
                                                logger.verbose('Removed Gruppe');
                                                return handler.handleErrorAndDeleted(err, res);
                                            })
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    return router;
};