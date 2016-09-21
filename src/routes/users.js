module.exports = function () {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var User = mongoose.model('User');
    var passport = require('passport');
    var jwt = require('express-jwt');

    /**
     * @api {post} /users/register Register User
     * @apiName UserRegister
     * @apiDescription Registriert einen neuen Benutzer
     * @apiGroup Users
     *
     * @apiUse FehlendeFelderError
     *
     * @apiError UnbekannteRolle Unbekannte Benutzerrolle
     *
     * @apiErrorExample Error-Response UnbekannteRolle:
     *     HTTP/1.1 400 Bad Request
     *     {
     *         "message": "Unbekannte Rolle"
     *     }
     *
     * @apiSuccess {String} message Success-Message: success
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         "message": "success"
     *     }
     **/
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

    /**
     * @api {post} /users/login Login User
     * @apiName UserLogin
     * @apiDescription Loggt einen Benutzer ein
     * @apiGroup Users
     *
     * @apiUse FehlendeFelderError
     *
     * @apiError FalscheAnmeldedaten Falscher Benutzerame oder/und Falsches Passwort
     *
     * @apiErrorExample Error-Response FalscheAnmeldedaten:
     *     HTTP/1.1 401 Unauthorized
     *     {
     *         "message": "Falscher Benutzername/Passwort"
     *     }
     *
     * @apiSuccess {String} token User-Token
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         "token": "12345abc"
     *     }
     **/
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

    /**
     * @api {del} /users/delete Löscht einen User
     * @apiName UserDelete
     * @apiDescription Löscht einen Benutzer
     * @apiGroup Users
     *
     * @apiError BerniError Benutzer Berni kann nicht gelöscht werden
     *
     * @apiErrorExample Error-Response BerniError:
     *     HTTP/1.1 500 Internal Server Error
     *     {
     *         "Dieser User kann nicht gelöscht werden!"
     *     }
     *
     * @apiError UserNotFound Nutzer Nicht gefunden
     *
     * @apiErrorExample Error-Response UserNotFound:
     *     HTTP/1.1 404 NOT FOUND
     *     {
     *         "Konnte keinen User mit Namen test-user finden."
     *     }
     *
     * @apiSuccess {Integer} ok Anzahl gefundene Nutzer
     * @apiSuccess {Integer} n Anzahl gelöschte Nutzer
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       ok: 1,
     *       n: 1
     *     }
     **/
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
