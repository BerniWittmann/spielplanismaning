module.exports = function () {
    const logger = require('winston').loggers.get('apiJugenden');
    const express = require('express');
    const router = express.Router();

    const mongoose = require('mongoose');
    const Gruppe = mongoose.model('Gruppe');
    const Jugend = mongoose.model('Jugend');
    const Team = mongoose.model('Team');

    const messages = require('./messages/messages.js')();
    const helpers = require('./helpers.js')();
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
        const jugend = new Jugend(req.body);

        jugend.save(function (err, jugend) {
            if (err) {
                return messages.Error(res, err);
            }
            logger.verbose('Jugend created');
            const gruppe = new Gruppe({
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

                    logger.verbose('Added default Gruppe');

                    jugend.deepPopulate('gruppen teams gruppen.teams', function (err, jgd) {
                        return handler.handleErrorAndResponse(err, res, jgd);
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
        Jugend.findById(req.query.id, function (err, jgd) {
            if (!jgd) {
                logger.warn('Jugend %s not found', req.query.id);
                return messages.ErrorBadRequest(res);
            }
            if (err) {
                return messages.Error(res, err);
            }

            return helpers.removeEntityBy(Team, 'jugend', req.query.id, res, function () {
                logger.verbose('Removed All Teams from this Jugend');
                return helpers.removeEntityBy(Gruppe, 'jugend', req.query.id, res, function () {
                    logger.verbose('Removed All Gruppen from this Jugend');
                    return helpers.removeEntityBy(Jugend, '_id', req.query.id, res, function (err) {
                        logger.verbose('Deleted Jugend');
                        return handler.handleErrorAndDeleted(err, res);
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
        let query = Jugend.find();
        if (req.query.id) {
            query = Jugend.findById(req.query.id);
        }
        let tore = 0;
        const teams = [];
        query.deepPopulate('teams').exec(function (err, jugenden) {
            if (err) {
                return messages.Error(res, err);
            }
            if (!req.query.id) {
                logger.verbose('Get Tore from all Jugenden');
                logger.verbose('%d Jugenden found', jugenden.length);
                jugenden.forEach(function (jugend) {
                    jugend.teams.forEach(function (team) {
                        teams.push(team);
                    });
                });
            } else {
                logger.verbose('Get Tore from certain Jugend %s', req.query.id);

                jugenden.teams.forEach(function (team) {
                    teams.push(team);
                });
            }
            logger.verbose('%d Teams found', teams.length);
            teams.forEach(function (team) {
                tore += team.tore;
            });
            logger.verbose('%d Tore counted', tore);
            return res.json(tore);
        });
    });

    return router;
};