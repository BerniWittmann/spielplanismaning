module.exports = function () {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var User = mongoose.model('User');
    var passport = require('passport');
    var jwt = require('express-jwt');

    router.post('/register', function (req, res) {
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({
                message: 'Bitte alle Felder ausfüllen'
            });
        }

        var user = new User();

        user.username = req.body.username;
        if (!user.setRole(req.body.role)) {
            return res.status(400).json({
                message: 'Unbekannte Rolle'
            });
        }

        user.setPassword(req.body.password);

        user.save(function (err) {
            if (err) {
                return res.status(500).json(err);
            }

            return res.json({message: 'success'});

        });
    });

    router.post('/login', function (req, res, next) {
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({
                message: 'Bitte alle Felder ausfüllen'
            });
        }

        //noinspection JSUnresolvedFunction
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                throw err;
            }

            if (user) {
                return res.json({
                    token: user.generateJWT()
                });
            } else {
                return res.status(401).json(info);
            }
        })(req, res, next);
    });

    router.put('/delete', function (req, res) {
        if (req.body.username == 'berni') {
            return res.status(500).json('Dieser User kann nicht gelöscht werden!');
        }
        User.find({
            username: req.body.username
        }).remove().exec(function (err, user) {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            }
            if (user.result.n > 0) {
                return res.json(user);
            } else {
                return res.status(404).json('Konnte keinen User mit Namen ' + req.body.username + ' finden.');
            }

        });
    });

    return router;
};
