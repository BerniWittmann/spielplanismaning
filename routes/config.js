module.exports = function (env) {
    var express = require('express');
    var router = express.Router();

    router.get('/version', function (req, res) {
        res.json((env.VERSION || 'VERSION-TAG'));
    });

    router.get('/lockdownmode', function (req, res) {
        //noinspection JSUnresolvedVariable
        res.json((env.LOCKDOWNMODE || 'false') == 'true');
    });

    return router;
};