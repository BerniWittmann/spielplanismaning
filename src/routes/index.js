module.exports = function () {
    const express = require('express');
    const router = express.Router();
    const version = require('../../package.json').version;

    router.get('/', function (req, res) {
        return res.render('index', {
            version: version,
            environment: process.env.NODE_ENV,
            sentryEnabled: process.env.NODE_ENV === 'production',
            sentryPublicUrl: process.env.c
        });
    });

    return router;
};