module.exports = function (sendgrid, env, url, disableEmails) {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var User = mongoose.model('User');
    var passport = require('passport');
    var jwt = require('express-jwt');

    var messages = require('./messages/messages.js')();
    var mailGenerator = require('./mailGenerator/mailGenerator.js')(sendgrid, env, url, disableEmails);

    /**
     * @api {post} /users/register Register User
     * @apiName UserRegister
     * @apiDescription Registriert einen neuen Benutzer
     * @apiGroup Users
     *
     * @apiPermission Admin
     *
     * @apiUse ErrorUnbekannteRolle
     *
     * @apiUse ErrorBadRequest
     *
     * @apiUse SuccessMessage
     **/
    router.post('/register', function (req, res) {
        if (!req.body.username || !req.body.password || !req.body.email) {
            return messages.ErrorFehlendeFelder(res);
        }

        var user = new User();

        user.username = req.body.username;
        user.email = req.body.email;
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
     * @apiUse ErrorFehlendeFelder
     *
     * @apiUse ErrorFalscheAnmeldedaten
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
            return messages.ErrorBadRequest(res);
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
     * @apiPermission Admin
     *
     * @apiUse ErrorUserNotFound
     *
     * @apiUse ErrorUserNichtLoeschbar
     *
     * @apiUse ErrorBadRequest
     *
     * @apiUse SuccessDeleteMessage
     **/
    router.put('/delete', function (req, res) {
        if (!req.body.username) {
            return messages.ErrorBadRequest(res);
        }
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

    /**
     * @api {put} /users/password-forgot Fordert ein neues Passwort an
     * @apiName UserPasswordForgot
     * @apiDescription Fordert ein neues Passwort für einen Benutzer an
     * @apiGroup Users
     *
     * @apiUse ErrorBadRequest
     *
     * @apiUse SuccessMessage
     **/
    router.put('/password-forgot', function (req, res) {
        if (!req.body.email) {
            return messages.ErrorBadRequest(res)
        }

        var email = req.body.email;

        User.findOne({ $or:[ {'username':email}, {'email':email} ]}).exec(function (err, user) {
            if (err) {
                return messages.Error(res, err);
            }

            if (!user) {
                return messages.Success(res);
            }

            user.generateResetToken();

            return user.save(function (err) {
                if (err) {
                    return messages.Error(res, err);
                }

                return mailGenerator.passwordForgotMail(user, function (err) {
                    if (err) {
                        return messages.Error(res, err);
                    }

                    return messages.Success(res);
                });

            });
        });
    });

    /**
     * @api {put} /users/password-reset/check Prüft ob der ResetToken korrekt ist
     * @apiName UserPasswordResetCheck
     * @apiDescription Prüft ob der ResetToken zum Zurücksetzen des Passworts korrekt ist
     * @apiGroup Users
     *
     * @apiUse ErrorBadRequest
     *
     * @apiUse ErrorInvalidTokenMessage
     *
     * @apiUse SuccessMessage
     **/
    router.put('/password-reset/check', function (req, res) {
        if (!req.body.token) {
            return messages.ErrorBadRequest(res)
        }

        User.findOne({'resetToken': req.body.token}).exec(function (err, user) {
            if (!user) {
                return messages.ErrorInvalidToken(res);
            }
            if (err) {
                return messages.Error(res, err);
            }

            if (user.validateResetToken(req.body.token)) {
                return messages.Success(res);
            } else {
                return messages.ErrorInvalidToken(res);
            }
        });
    });

    /**
     * @api {put} /users/password-reset Setzt ein neues Passwort für einen Benutzer
     * @apiName UserPasswordReset
     * @apiDescription Setzt ein neues Passwort für einen Benutzer
     * @apiGroup Users
     *
     * @apiUse ErrorBadRequest
     *
     * @apiUse ErrorUserNotFound
     * @apiUse ErrorInvalidTokenMessage
     *
     * @apiUse SuccessMessage
     **/
    router.put('/password-reset', function (req, res) {
        if (!req.body.token || !req.body.username || !req.body.password) {
            return messages.ErrorBadRequest(res)
        }
        User.findOne({'username': req.body.username}).exec(function (err, user) {
            if (!user) {
                return messages.ErrorUserNotFound(res, req.body.username);
            }
            if (err) {
                return messages.Error(res, err);
            }

            if (user.validateResetToken(req.body.token)) {
                user.setPassword(req.body.password);
                user.removeResetToken();

                return user.save(function (err) {
                    if (err) {
                        return messages.Error(res, err);
                    }

                    return messages.Success(res);
                });
            } else {
                return messages.ErrorInvalidToken(res);
            }
        });

    });

    return router;
};
