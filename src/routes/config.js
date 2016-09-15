module.exports = function (env) {
    var express = require('express');
    var version = require('../../package.json').version;
    var router = express.Router();
    var exampleContacts = '[{"name": "Klaus Krecken", "email": "klaus@krecken.de", "turnier": "Kinderbeachturnier"},{"name": "Stefan Meyer", "email": "vorsitzender@fhi-ismaning.de", "turnier": "DBT Stoneline Beach Cup"}]';

    /**
     * @api {get} /config/version Version
     * @apiName GetVersion
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

    router.get('/env', function (req, res) {
        res.json((env.ENVIRONMENT || 'DEV'));
    });

    router.get('/lockdownmode', function (req, res) {
        //noinspection JSUnresolvedVariable
        res.json((env.LOCKDOWNMODE || 'false') == 'true');
    });

    router.get('/kontakt', function (req, res) {
        res.json(JSON.parse(env.KONTAKTE || exampleContacts));
    });

    return router;
};