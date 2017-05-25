module.exports = function (env) {
    const logger = require('winston').loggers.get('apiConfig');
    const express = require('express');
    const version = require('../../package.json').version;
    const router = express.Router();
    const messages = require('./messages/messages.js')();
    const helpers = require('./helpers.js');
    const cls = require('../config/cls.js');

    /**
     * @api {get} /config/ Config
     * @apiName GetConfig
     * @apiDescription Gibt die aktuelle Config der App zurück
     * @apiGroup Config
     *
     * @apiSuccess {String} version Version of the app.
     * @apiSuccess {String} env Environment of the app.
     * @apiSuccess {Boolean} lockdown Lockdownmode
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "1.0.0"
     *     }
     **/
    router.get('/', function (req, res) {
        return helpers.getVeranstaltungData(function (err, data) {
            if (err) return messages.Error(res, err);

            const config = {
                version: version,
                env: env.NODE_ENV,
                lockdown: env.LOCKDOWNMODE === 'true',
                plaetze: env.PLAETZE,
                spielmodus: data.SPIEL_MODE || undefined,
                mannschaftslisten: data.MANNSCHAFTSLISTEN_PRINT || undefined
            };
            logger.verbose('Summary', {config: config});
            return res.json(config);
        });
    });

    /**
     * @api {get} /config/version Version
     * @apiName GetVersion
     * @apiDescription Gibt die aktuelle Version der App zurück
     * @apiGroup Config
     *
     * @apiSuccess {String} body Version of the app.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "1.0.0"
     *     }
     **/
    router.get('/version', function (req, res) {
        logger.verbose('Version %s', version);
        return res.json(version);
    });

    /**
     * @api {get} /config/env Environment
     * @apiName GetEnvironment
     * @apiDescription Gibt die Umgebungsvariable zurück
     * @apiGroup Config
     *
     * @apiSuccess {String} body Umgebungsvariable
     *
     * @apiSuccessExample Success-Response Testing:
     *     HTTP/1.1 200 OK
     *     {
     *       "testing"
     *     }
     *
     * @apiSuccessExample Success-Response Production:
     *     HTTP/1.1 200 OK
     *     {
     *       "production"
     *     }
     *
     * @apiSuccessExample Success-Response Development:
     *     HTTP/1.1 200 OK
     *     {
     *       "development"
     *     }
     **/
    router.get('/env', function (req, res) {
        logger.verbose('Environment %s', env.NODE_ENV);
        res.json(env.NODE_ENV);
    });

    /**
     * @api {get} /config/lockdownmode Lockdownmode
     * @apiName GetLockdownmode
     * @apiDescription Gibt zurück ob der Lockdownmode aktiviert ist
     * @apiGroup Config
     *
     * @apiSuccess {Boolean} body Lockdownmode
     *
     * @apiSuccessExample Success-Response Lockdownmode aktiviert:
     *     HTTP/1.1 200 OK
     *     {
     *       true
     *     }
     *
     * @apiSuccessExample Success-Response Lockdownmode deaktiviert:
     *     HTTP/1.1 200 OK
     *     {
     *       false
     *     }
     *
     **/
    router.get('/lockdownmode', function (req, res) {
        logger.verbose('Lockdown-Mode %s', env.LOCKDOWNMODE === 'true');
        return res.json(env.LOCKDOWNMODE === 'true');
    });

    /**
     * @api {get} /config/plaetze PLätze
     * @apiName GetConfig
     * @apiDescription Gibt die Anzahl der Plätze zurück
     * @apiGroup Config
     *
     * @apiSuccess {Number} body Anzahl Plätze
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       3
     *     }
     **/
    router.get('/plaetze', function (req, res) {
        logger.verbose('Plätze %d', env.PLAETZE);
        return res.json(env.PLAETZE);
    });

    /**
     * @api {get} /config/spielmodus SpielModus
     * @apiName GetConfig
     * @apiDescription Gibt den Spielmodus zurück
     * @apiGroup Config
     *
     * @apiSuccess {String} body Spielmodus
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       complex
     *     }
     **/
    router.get('/spielmodus', function (req, res) {
        return helpers.getVeranstaltungData(function (err, data) {
            if (err) return messages.Error(res, err);
            logger.verbose('Spielmodus %s', data.SPIEL_MODE);
            return res.json(data.SPIEL_MODE);
        });
    });

    /**
     * @api {get} /config/mannschaftslisten Mannschaftslisten
     * @apiName GetConfig
     * @apiDescription Gibt an ob Mannschaftslisten aktiviert sind
     * @apiGroup Config
     *
     * @apiSuccess {String} body Mannschaftslisten
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       complex
     *     }
     **/
    router.get('/mannschaftslisten', function (req, res) {
        return helpers.getVeranstaltungData(function (err, data) {
            if (err) return messages.Error(res, err);
            logger.verbose('Mannschaftslisten %s', data.MANNSCHAFTSLISTEN_PRINT);
            return res.json(data.MANNSCHAFTSLISTEN_PRINT);
        });
    });

    return router;
};