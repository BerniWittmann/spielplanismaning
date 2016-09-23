module.exports = function () {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var User = mongoose.model('User');
    var passport = require('passport');
    var jwt = require('express-jwt');

    var messages = require('./messages/messages.js')();

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
            return messages.ErrorFehlendeFelder(res);
        }

        var user = new User();

        user.username = req.body.username;
        if (!user.setRole(req.body.role)) {
            return messages.ErrorUnbekannteRolle(res);
        }

        user.setPassword(req.body.password);

        user.save(function (err) {
            if (err) {
                return messages.Error(res, err);
            }

            return messages.Success(res);
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
            return messages.ErrorFehlendeFelder(res);
        }

        //noinspection JSUnresolvedFunction
        passport.authenticate('local', function (err, user) {
            if (err) {
                return messages.Error(res, err);
            }

            if (user) {
                return res.json({
                    token: user.generateJWT()
                });
            } else {
                return messages.ErrorFalscheAnmeldedaten(res);
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
           return messages.ErrorUserNichtLoeschbar(res);
        }
        User.find({
            username: req.body.username
        }).remove().exec(function (err, user) {
            if (err) {
                return messages.Error(res, err);
            }
            if (user.result.n > 0) {
                return messages.Deleted(res);
            } else {
                return messages.ErrorUserNotFound(res, req.body.username);
            }
        });
    });

    return router;
};
