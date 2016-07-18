module.exports = function () {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');

    var Gruppe = mongoose.model('Gruppe');
    var Jugend = mongoose.model('Jugend');
    var Spiel = mongoose.model('Spiel');
    var Spielplan = mongoose.model('Spielplan');
    var Team = mongoose.model('Team');
    var User = mongoose.model('User');
    var Subscriber = mongoose.model('Subscriber');

    /* GET home page. */
    router.get('/', function (req, res, next) {
        res.render('index');
        next();
    });

    return router;
};