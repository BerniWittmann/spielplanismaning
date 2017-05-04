module.exports = function () {
    const logger = require('winston').loggers.get('apiJugenden');
    const express = require('express');
    const router = express.Router();

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
                return messages.ErrorBadRequest(res, ['Jugend not found']);
            }
            if (err) {
                return messages.Error(res, err);
            }

            return helpers.removeEntityBy(Team, 'jugend', req.query.id, function (err) {
                if (err) return messages.Error(res, err);
                logger.verbose('Removed All Teams from this Jugend');
                return helpers.removeEntityBy(Gruppe, 'jugend', req.query.id, function (err) {
                    if (err) return messages.Error(res, err);
                    logger.verbose('Removed All Gruppen from this Jugend');
                    return helpers.removeEntityBy(Jugend, '_id', req.query.id, function (err) {
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
        let query = Spiel.find();
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

    return router;
};