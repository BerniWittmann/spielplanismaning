module.exports = function (env) {
    var express = require('express');
    var router = express.Router();
    var exampleContacts = '[{"name": "Klaus Krecken", "email": "klaus@krecken.de", "turnier": "Kinderbeachturnier"},{"name": "Stefan Meyer", "email": "vorsitzender@fhi-ismaning.de", "turnier": "DBT Stoneline Beach Cup"}]';

    router.get('/version', function (req, res) {
        var version = (env.VERSION || 'VERSION-TAG');
        if (env.ENVIRONMENT == 'TESTING') {
            version += ' TESTUMGEBUNG';
        }
        res.json(version);
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