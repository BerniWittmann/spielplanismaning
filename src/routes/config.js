module.exports = function (env) {
    const express = require('express');
    const version = require('../../package.json').version;
    const router = express.Router();

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
        return res.json({
            version: version,
            env: env.NODE_ENV,
            lockdown: env.LOCKDOWNMODE === 'true'
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
        return res.json(env.LOCKDOWNMODE === 'true');
    });

    return router;
};