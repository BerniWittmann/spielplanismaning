module.exports = function (sendgrid, env, url, disableEmails, secret) {
    const express = require('express');
    const router = express.Router();

    const mongoose = require('mongoose');
    const User = mongoose.model('User');
    const passport = require('passport');
    const jwt = require('express-jwt');
    const jsonwebtoken = require('jsonwebtoken');

    const messages = require('./messages/messages.js')();
    const mailGenerator = require('./mailGenerator/mailGenerator.js')(sendgrid, env, url, disableEmails);
    const helpers = require('./helpers.js')();
    const handler = require('./handler.js');

    /**
     * @api {post} /users/register Register User
     * @apiName UserRegister
     * @apiDescription Registriert einen neuen Benutzer
     * @apiGroup Users
     *
     * @apiPermission Admin
     * @apiUse AuthHeader
     *
     * @apiParam {String} username Username des neuen Nutzers.
     * @apiParam {String} email E-Mail-Adresse des neuen Nutzers.
     * @apiParam {String} role Rolle des neuen Nutzers.
     *
     * @apiUse ErrorUnbekannteRolle
     *
     * @apiUse ErrorBadRequest
     *
     * @apiUse SuccessMessage
     **/
    router.post('/register', function (req, res) {
        const user = new User();

        user.username = req.body.username;
        user.email = req.body.email;
        if (!user.setRole(req.body.role)) {
            return messages.ErrorUnbekannteRolle(res);
        }

        user.setRandomPassword();
        user.generateResetToken();

        return helpers.saveUserAndSendMail(user, res, mailGenerator.registerMail);
    });

    /**
     * @api {post} /users/login Login User
     * @apiName UserLogin
     * @apiDescription Loggt einen Benutzer ein
     * @apiGroup Users
     *
     * @apiParam {String} username Username des Nutzers.
     * @apiParam {String} password Passwort des Nutzers.
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
     * @apiUse AuthHeader
     *
     * @apiParam {String} username Username des zu löschenden Nutzers.
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
     * @apiParam {String} email E-Mail des Nutzers.
     *
     * @apiUse ErrorBadRequest
     *
     * @apiUse SuccessMessage
     **/
    router.put('/password-forgot', function (req, res) {
        const email = req.body.email;

        User.findOne({$or: [{'username': email}, {'email': email}]}).exec(function (err, user) {
            if (!user) {
                return messages.Success(res);
            }
            if (err) {
                return messages.Error(res, err);
            }

            user.generateResetToken();

            return helpers.saveUserAndSendMail(user, res, mailGenerator.passwordForgotMail);
        });
    });

    /**
     * @api {put} /users/password-reset/check Prüft ob der ResetToken korrekt ist
     * @apiName UserPasswordResetCheck
     * @apiDescription Prüft ob der ResetToken zum Zurücksetzen des Passworts korrekt ist
     * @apiGroup Users
     *
     * @apiParam {String} token Reset-Token des Nutzers.
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
     * @apiParam {String} token Reset-Token des Nutzers.
     * @apiParam {String} username Username des Nutzers.
     * @apiParam {String} password Neues Passwort des Nutzers.
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
     * @apiPermission Admin
     * @apiPermission Bearbeiter
     * @apiUse AuthHeader
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
        const user = helpers.verifyToken(req, secret);

        if (!user || !user._id) {
            return messages.ErrorForbidden(res);
        }

        User.findOne({username: user.username}).exec(function (err, userDB) {
            if (err || !userDB) {
                return messages.ErrorForbidden(res);
            }

            const result = {
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
     * @apiPermission Admin
     * @apiPermission Bearbeiter
     * @apiUse AuthHeader
     *
     * @apiParam {String} username Username des neuen Nutzers.
     * @apiParam {String} email E-Mail-Adresse des Nutzers.
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
        const user = helpers.verifyToken(req, secret);

        if (!user || !user._id) {
            return messages.ErrorForbidden(res);
        }

        User.findOne({username: user.username}).exec(function (err, userDB) {
            if (err || !userDB) {
                return messages.ErrorForbidden(res);
            }

            let username = userDB.username;
            if (req.body.username) {
                username = req.body.username.toLowerCase();
            }

            let email = (userDB.email || "");
            if (req.body.email) {
                email = req.body.email;
            }

            return User.findOneAndUpdate({username: userDB.username}, { $set: { username: username, email: email }}, {runValidators: true, new: true}, function (err, userNew) {
                if (err) {
                    return messages.Error(res, err);
                }

                const result = {
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
