module.exports = function (env) {
    var express = require('express');
    var version = require('../../package.json').version;
    var router = express.Router();
    var exampleContacts = '[{"name": "Klaus Krecken", "email": "klaus@krecken.de", "turnier": "Kinderbeachturnier"},{"name": "Stefan Meyer", "email": "vorsitzender@fhi-ismaning.de", "turnier": "DBT Stoneline Beach Cup"}]';

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
        res.json(version);
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
     *       "TESTING"
     *     }
     *
     * @apiSuccessExample Success-Response Production:
     *     HTTP/1.1 200 OK
     *     {
     *       "PRODUCTION"
     *     }
     *
     * @apiSuccessExample Success-Response Development:
     *     HTTP/1.1 200 OK
     *     {
     *       "DEV"
     *     }
     **/
    router.get('/env', function (req, res) {
        res.json((env.ENVIRONMENT || 'DEV'));
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
        //noinspection JSUnresolvedVariable
        res.json((env.LOCKDOWNMODE || 'false') == 'true');
    });

    /**
     * @api {get} /config/kontakt Kontakt
     * @apiName GetKontakt
     * @apiDescription Gibt Kontaktadressen zurück
     * @apiGroup Config
     *
     * @apiSuccess {String} name Name
     * @apiSuccess {String} email Email
     * @apiSuccess {String} turnier Turniername
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     [{
     *         "name": "Name Nachname",
     *         "email": "email@test.de",
     *         "turnier": "Kinderbeachturnier"
     *     },{
     *         "name": "Hans Meyer",
     *         "email": "hm@mail.de",
     *         "turnier": "DBT Stoneline Beach Cup"
     *     }]
     *
     **/
    router.get('/kontakt', function (req, res) {
        res.json(JSON.parse(env.KONTAKTE || exampleContacts));
    });

    return router;
};