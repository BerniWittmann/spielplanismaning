module.exports = function () {
    const logger = require('winston').loggers.get('apiAnsprechpartner');
    const express = require('express');
    const router = express.Router();

    const mongoose = require('mongoose');
    const Ansprechpartner = mongoose.model('Ansprechpartner');

    const messages = require('./messages/messages.js')();
    const helpers = require('./helpers.js');
    const handler = require('./handler.js');

    /**
     * @api {get} /ansprechpartner Get Ansprechpartner
     * @apiName GetAnsprechpartner
     * @apiDescription Lädt Ansprechpartner
     * @apiGroup Ansprechpartner
     *
     * @apiParam {String} [id]  Optionale ID des Ansprechpartners.
     *
     * @apiSuccess {String} _id ID des Ansprechpartners
     * @apiSuccess {String} name Name des Ansprechpartners
     * @apiSuccess {String} email Email des Ansprechpartners
     * @apiSuccess {String} turnier zuständiges Turnier des Ansprechpartners
     * @apiUse vResponse
     *
     * @apiUse ErrorAnsprechpartnerNotFoundMessage
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     [{
     *         _id: '57cffb4055a8d45fc084c107',
     *         name: 'Hans Meyer',
     *         email: 'email@test.de',
     *         turnier: 'Kinderbeach',
     *         __v: 4
     *     }]
     *
     **/
    router.get('/', function (req, res) {
        return helpers.getEntity(Ansprechpartner, '', messages.ErrorAnsprechpartnerNotFound, res, req);
    });

    /**
     * @api {Post} /ansprechpartner Create Ansprechpartner
     * @apiName PostAnsprechpartner
     * @apiDescription Speichert einen neuen Ansprechpartner
     * @apiGroup Ansprechpartner
     *
     * @apiSuccess {String} _id ID des Ansprechpartners
     * @apiSuccess {String} name Name des Ansprechpartners
     * @apiSuccess {String} email Email des Ansprechpartners
     * @apiSuccess {String} turnier zuständiges Turnier des Ansprechpartners
     * @apiUse vResponse
     *
     * @apiPermission Admin
     *
     * @apiUse ErrorBadRequest
     * @apiUse AuthHeader
     * @apiParam {String} name Name des Ansprechpartners.
     * @apiParam {String} turnier Zuständiges Turnier des Ansprechpartners.
     * @apiParam {String} email E-Mail-Adresse des Ansprechpartners.
     *
     * @apiSuccessExample Success-Response:
     *      HTTP/1.1 200 OK
     *     [{
     *         _id: '57cffb4055a8d45fc084c107',
     *         name: 'Hans Meyer',
     *         email: 'email@test.de',
     *         turnier: 'Kinderbeach',
     *         __v: 4
     *     }]
     *
     **/
    router.post('/', function (req, res) {
        helpers.addEntity(Ansprechpartner, req, res);
    });

    /**
     * @api {del} /ansprechpartner Delete Ansprechpartner
     * @apiName DeleteAnsprechpartner
     * @apiDescription Löscht einen Ansprechpartner
     * @apiGroup Ansprechpartner
     * @apiPermission Admin
     *
     * @apiUse ErrorBadRequest
     * @apiUse AuthHeader
     *
     * @apiParam {String} id ID des Ansprechpartners.
     *
     * @apiUse SuccessDeleteMessage
     **/
    router.delete('/', function (req, res) {
        return helpers.removeEntityBy(Ansprechpartner, '_id', req.query.id, function (err) {
            return handler.handleErrorAndDeleted(err, res);
        });
    });

    /**
     * @api {put} /ansprechpartner Update Ansprechpartner
     * @apiName UpdateAnsprechpartner
     * @apiDescription Speichert Ansprechpartner
     * @apiGroup Ansprechpartner
     * @apiPermission Admin
     *
     * @apiUse ErrorBadRequest
     * @apiUse AuthHeader
     *
     * @apiParam {String} id ID des Ansprechpartners.
     *
     * @apiUse SuccessDeleteMessage
     * @apiUse ErrorAnsprechpartnerNotFoundMessage
     **/
    router.put('/', function (req, res) {
        Ansprechpartner.findById(req.query.id, function (err, ansprechpartner) {
            if (!ansprechpartner) {
                return messages.ErrorAnsprechpartnerNotFound(res, err);
            }

            if (err) {
                return messages.Error(res, err);
            }

            logger.verbose('Updating Ansprechpartner', req.body);

            ansprechpartner = helpers.updateDocByKeys(ansprechpartner, ['name', 'email', 'turnier'], req.body);

            logger.silly('Save', ansprechpartner);
            ansprechpartner.save(function (err, ansprechpartner) {
                return handler.handleErrorAndResponse(err, res, ansprechpartner);
            });
        });
    });

    return router;
};