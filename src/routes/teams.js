module.exports = function () {
    const logger = require('winston').loggers.get('apiTeams');
    const express = require('express');
    const router = express.Router();
    const mongoose = require('mongoose');
    const Gruppe = mongoose.model('Gruppe');
    const Jugend = mongoose.model('Jugend');
    const Team = mongoose.model('Team');
    const async = require('async');

    const messages = require('./messages/messages.js')();
    const helpers = require('./helpers.js');
    const handler = require('./handler.js');

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
        return helpers.getEntity(Team, 'gruppe jugend gruppe.teams zwischengruppe zwischengruppe.teams', messages.ErrorTeamNotFound, res, req);
    });

    /**
     * @api {del} /teams Delete Team
     * @apiName DeleteTeams
     * @apiDescription Löscht ein Team
     * @apiGroup Teams
     * @apiPermission Admin
     * @apiUse AuthHeader
     *
     * @apiParam {String} id ID des Teams.
     *
     * @apiUse SuccessDeleteMessage
     **/
    router.delete('/', function (req, res) {
        const query = Team.findById(req.query.id);
        logger.verbose('Delete Team %s', req.query.id);
        query.deepPopulate('gruppe, jugend').exec(function (err, team) {
            if (err) {
                return messages.Error(res, err);
            }
            logger.verbose('Remove Team from Jugend');
            team.jugend.teams.splice(team.jugend.teams.indexOf(team), 1);
            team.jugend.save(function (err) {
                if (err) {
                    return messages.Error(res, err);
                }

                logger.verbose('Remove Team from Gruppe');
                team.gruppe.teams.splice(team.gruppe.teams.indexOf(team), 1);
                team.gruppe.save(function (err) {
                    if (err) {
                        return messages.Error(res, err);
                    }

                    logger.verbose('Delete Team');
                    return helpers.removeEntityBy(Team, '_id', team, res, function (err) {
                        return handler.handleErrorAndDeleted(err, res);
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
     * @apiParam {String} name Name des Teams.
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
     * @apiUse AuthHeader
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
        logger.verbose('Create new Team', req.body);
        const team = new Team(req.body);
        team.jugend = req.query.jugend;
        team.gruppe = req.query.gruppe;

        team.save(function (err, team) {
            if (err) {
                return messages.Error(res, err);
            }

            async.parallel([
                function (cb) {
                    logger.verbose('Add Team to Gruppe');
                    return helpers.findEntityAndPushTeam(Gruppe, team.gruppe, team, res, cb);
                },
                function (cb) {
                    logger.verbose('Add Team to Jugend');
                    return helpers.findEntityAndPushTeam(Jugend, team.jugend, team, res, cb);
                }
            ], function (err) {
                return handler.handleErrorAndResponse(err, res, team);
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
     * @apiUse AuthHeader
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
        Team.findById(req.query.id, function (err, team) {
            if (err) {
                return messages.Error(res, err);
            }

            const keys = ['name', 'anmeldungsId'];

            keys.forEach(function (key) {
               if (req.body[key]) {
                   logger.verbose('Set %s to %s', key, req.body[key]);
                   team[key] = req.body[key];
               }
            });

            team.save(function (err, team) {
                return handler.handleErrorAndResponse(err, res, team);
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
     * @apiUse AuthHeader
     *
     * @apiUse ResetMessage
     * @apiUse Deprecated
     **/
    router.put('/resetErgebnisse', function (req, res) {
        return messages.ErrorDeprecated(res);
    });

    return router;
};
