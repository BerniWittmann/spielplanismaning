module.exports = function (sendgrid, env, url, disableEmails, secret) {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var User = mongoose.model('User');
    var passport = require('passport');
    var jwt = require('express-jwt');
    var jsonwebtoken = require('jsonwebtoken');

    var messages = require('./messages/messages.js')();
    var mailGenerator = require('./mailGenerator/mailGenerator.js')(sendgrid, env, url, disableEmails);
    var helpers = require('./helpers.js');
    var handler = require('./handler.js');

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
        var user = new User();

        user.username = req.body.username;
        user.email = req.body.email;
        if (!user.setRole(req.body.role)) {
            return messages.ErrorUnbekannteRolle(res);
        }

        user.setRandomPassword();
        user.generateResetToken();

        return user.save(function (err) {
            if (err) {
                return messages.Error(res, err);
            }

            return mailGenerator.registerMail(user, function (err) {
                return handler.handleErrorAndSuccess(err, res);
            });

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
        if (req.body.username === 'berni') {
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
        var email = req.body.email;

        User.findOne({$or: [{'username': email}, {'email': email}]}).exec(function (err, user) {
            if (!user) {
                return messages.Success(res);
            }
            if (err) {
                return messages.Error(res, err);
            }

            user.generateResetToken();

            return user.save(function (err) {
                if (err) {
                    return messages.Error(res, err);
                }

                return mailGenerator.passwordForgotMail(user, function (err) {
                    return handler.handleErrorAndSuccess(err, res);
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
                    return handler.handleErrorAndSuccess(err, res);
                });
            } else {
                return messages.ErrorInvalidToken(res);
            }
        });

    });

    /**
     * @api {get} /users/userDetails Lädt die NutzerDetails
     * @apiName UserDetailsLoad
     * @apiDescription Lädt die NutzerDetails des Users
     * @apiGroup Users
     * @apiPermission Admin_Bearbeiter
     *
     * @apiUse ErrorForbiddenMessage
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         _id: '57cffb4055a8d45fc084c107',
     *         username: 'Username',
     *         email: 'test@email.de',
     *         role: {
     *             name: 'Bearbeiter',
     *             rank: 0,
     *         }
     *     }
     **/
    router.get('/user-details', function (req, res) {
        var user = helpers.verifyToken(req, secret);

        if (!user || !user._id) {
            return messages.ErrorForbidden(res);
        }

        User.findOne({username: user.username}).exec(function (err, userDB) {
            if (err || !userDB) {
                return messages.ErrorForbidden(res);
            }

            var result = {
                _id: userDB._id,
                username: userDB.username,
                email: userDB.email,
                role: userDB.role
            };
            return res.send(result);
        });
    });

    /**
     * @api {put} /users/userDetails Updated die NutzerDetails
     * @apiName UserDetailsUpdate
     * @apiDescription Speichert die NutzerDetails des Users
     * @apiGroup Users
     * @apiPermission Admin_Bearbeiter
     *
     * @apiUse ErrorUserNotFound
     *
     * @apiUse ErrorForbiddenMessage
     * @apiUse ErrorBadRequest
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *         _id: '57cffb4055a8d45fc084c107',
     *         username: 'Username',
     *         email: 'test@email.de',
     *         role: {
     *             name: 'Bearbeiter',
     *             rank: 0,
     *         },
     *         token: 'jwtToken'
     *     }
     **/
    router.put('/user-details', function (req, res) {
        var user = helpers.verifyToken(req, secret);

        if (!user || !user._id) {
            return messages.ErrorForbidden(res);
        }

        User.findOne({username: user.username}).exec(function (err, userDB) {
            if (err || !userDB) {
                return messages.ErrorForbidden(res);
            }

            var username = userDB.username;
            if (req.body.username) {
                username = req.body.username.toLowerCase();
            }

            var email = (userDB.email || "");
            if (req.body.email) {
                email = req.body.email;
            }

            return User.findOneAndUpdate({username: userDB.username}, { $set: { username: username, email: email }}, {runValidators: true, new: true}, function (err, userNew) {
                if (err) {
                    return messages.Error(res, err);
                }

                var result = {
                    _id: userNew._id,
                    username: userNew.username,
                    email: userNew.email,
                    role: userNew.role,
                    token: userNew.generateJWT()
                };

                return res.json(result);
            });
        });
    });

    return router;
};
