module.exports = function (sendgrid, env, url, disableEmails, secret) {
    const logger = require('winston').loggers.get('apiUsers');
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
     * @apiUse ErrorUserExistiertBereits
     * @apiUse ErrorBadRequest
     *
     * @apiUse SuccessMessage
     **/
    router.post('/register', function (req, res) {
        const user = new User();

        logger.verbose('Creating new User');

        user.username = req.body.username;
        user.email = req.body.email;
        if (!user.setRole(req.body.role)) {
            logger.warn('Unkown Role');
            return messages.ErrorUnbekannteRolle(res);
        }

        logger.verbose('Setting Random Password');
        user.setRandomPassword();
        logger.verbose('Generating Reset Token');
        user.generateResetToken();

        logger.verbose('Saving User');
        logger.verbose('Send Registration E-Mail');
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
        logger.verbose('Trying to login User %s', req.body.username);
        passport.authenticate('local', function (err, user) {
            if (err) {
                return messages.Error(res, err);
            }

            if (user) {
                logger.verbose('Login successful');
                return res.json({
                    token: user.generateJWT()
                });
            } else {
                logger.warn('Login failed');
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
        logger.verbose('Checking User is deleteable');
        if (req.body.username === 'berni') {
            logger.warn('User is not deleteable');
            return messages.ErrorUserNichtLoeschbar(res);
        }
        User.find({
            username: req.body.username
        }).remove().exec(function (err, user) {
            if (err) {
                return messages.Error(res, err);
            }
            if (user.result.n > 0) {
                logger.verbose('Deleted User');
                return messages.Deleted(res);
            } else {
                logger.warn('User %s Not Found', req.body.username);
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

        logger.verbose('Requesting new Password for User with E-Mail %s', email);
        User.findOne({$or: [{'username': email}, {'email': email}]}).exec(function (err, user) {
            if (!user) {
                logger.warn('User not found');
                //Still sending success to prevent brute-forcing for a correct username
                return messages.Success(res);
            }
            if (err) {
                return messages.Error(res, err);
            }

            logger.verbose('Generate Reset Token');
            user.generateResetToken();

            logger.verbose('Saving User');
            return User.findOneAndUpdate({$or: [{'username': email}, {'email': email}]}, { $set: { resetTokenExp: user.resetTokenExp, resetToken: user.resetToken }}, {new: true}, function (err, userNew) {
                if (err) {
                    return messages.Error(res, err);
                }

                logger.verbose('Sending Password-Forgot E-Mail');
                return helpers.saveUserAndSendMail(userNew, res, mailGenerator.passwordForgotMail);
            });
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
        logger.verbose('Checking Reset Token %s', req.body.token);
        return User.findOne({'resetToken': req.body.token}).exec(function (err, user) {
            if (!user) {
                logger.warn('Token Not Found');
                return messages.ErrorInvalidToken(res);
            }
            if (err) {
                return messages.Error(res, err);
            }

            if (user.validateResetToken(req.body.token)) {
                logger.verbose('Token Valid');
                return messages.Success(res);
            } else {
                logger.warn('Token Invalid');
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
        logger.verbose('Set new Password for User');
        User.findOne({'username': req.body.username}).exec(function (err, user) {
            if (!user) {
                logger.warn('User Not Found');
                return messages.ErrorUserNotFound(res, req.body.username);
            }
            if (err) {
                return messages.Error(res, err);
            }

            if (user.validateResetToken(req.body.token)) {
                logger.verbose('Valid Token');
                logger.verbose('Setting new Password');
                user.setPassword(req.body.password);
                logger.verbose('Removing Reset-Token');
                user.removeResetToken();

                logger.verbose('Saving User');
                return User.findOneAndUpdate({'username': user.username}, { $set: { hash: user.hash, salt: user.salt, resetToken: user.resetToken, resetTokenExp: user.resetTokenExp }}, {new: true}, function (err) {
                    return handler.handleErrorAndSuccess(err, res);
                });
            } else {
                logger.warn('Token Invalid');
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
        logger.verbose('Getting user Details');
        logger.verbose('Verifying Token');
        const user = helpers.verifyToken(req, secret);

        if (!user || !user._id) {
            logger.verbose('Token Invalid');
            return messages.ErrorForbidden(res);
        }

        User.findOne({username: user.username}).exec(function (err, userDB) {
            if (err || !userDB) {
                logger.warn('User not Found');
                return messages.ErrorForbidden(res);
            }

            const result = {
                _id: userDB._id,
                username: userDB.username,
                email: userDB.email,
                role: userDB.role
            };
            logger.verbose('Sending User-Details');
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
        logger.verbose('Updating User-Details');
        logger.verbose('Verifying Token');
        const user = helpers.verifyToken(req, secret);

        if (!user || !user._id) {
            logger.warn('Token Invalid');
            return messages.ErrorForbidden(res);
        }

        User.findOne({username: user.username}).exec(function (err, userDB) {
            if (err || !userDB) {
                logger.warn('Token Invalid');
                return messages.ErrorForbidden(res);
            }

            let username = userDB.username;
            if (req.body.username) {
                logger.verbose('Updating Username');
                username = req.body.username.toLowerCase();
            }

            let email = (userDB.email || "");
            if (req.body.email) {
                logger.verbose('Updating E-Mail');
                email = req.body.email;
            }

            return User.findOneAndUpdate({username: userDB.username}, { $set: { username: username, email: email }}, {runValidators: true, new: true}, function (err, userNew) {
                if (err) {
                    return messages.Error(res, err);
                }
                logger.verbose('Saved User-Details');

                const result = {
                    _id: userNew._id,
                    username: userNew.username,
                    email: userNew.email,
                    role: userNew.role,
                    token: userNew.generateJWT()
                };

                logger.verbose('Sending User-Details');
                return res.json(result);
            });
        });
    });

    return router;
};
