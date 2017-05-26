module.exports = function (sendgrid, env, url, disableEmails) {
    const logger = require('winston').loggers.get('apiEmail');
    const express = require('express');
    const router = express.Router();

    const mongoose = require('mongoose');
    const Subscriber = mongoose.model('Subscriber');
    const MailGenerator = require('./mailGenerator/mailGenerator.js')(sendgrid, env, url, disableEmails);
    const messages = require('./messages/messages.js')();
    const helpers = require('./helpers.js');
    const handler = require('./handler.js');
    const cls = require('../config/cls.js');

    /**
     * @api {post} /email Send Email
     * @apiName SendEmail
     * @apiDescription Sendet eine Email an alle Abonnenten
     * @apiGroup Email
     * @apiPermission Admin
     *
     * @apiUse AuthHeader
     *
     * @apiParam {String} subject  Betreff der Email.
     * @apiParam {String} text     Text der Email.
     *
     * @apiUse SuccessMessage
     *
     * @apiUse ErrorBadRequest
     **/
    router.post('/', function (req, res) {
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            Subscriber.find().exec(function (err, subs) {
                if (err) {
                    return messages.Error(res, err);
                }

                let emails = [];
                subs.forEach(function (sub) {
                    emails.push(sub.email);
                });

                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }

                emails = emails.filter(onlyUnique);

                logger.verbose('Found %d E-Mail-Addresses', emails.length);
                logger.verbose('Sending E-Mail', {subject: req.body.subject, text: req.body.text});

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    //noinspection JSUnresolvedFunction
                    MailGenerator.sendDefaultMail(emails, req.body.subject, req.body.text, function (err) {
                        return handler.handleErrorAndSuccess(err, res);
                    });
                });
            });
        });
    });

    /**
     * @api {post} /email/subscriber Create Subscriber
     * @apiName CreateSubscriber
     * @apiDescription Speichert einen neuen Abonnenten
     * @apiGroup Email
     *
     * @apiParam {String} email  Email-Adresse des Abonnenten.
     * @apiParam {String} team ID des Teams.
     *
     * @apiSuccess {String} _id ID des Abonnements
     * @apiSuccess {String} email Email-Adresse des Abonnenten.
     * @apiUse teamID
     * @apiUse vResponse
     *
     * @apiUse ErrorBadRequest
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *     _id: '57dc1186d7917dd51623b363',
     *     email: 'test@t.de',
     *     team: '57cffb7a55a8d45fc084c123',
     *      __v: 0,
     *     }
     **/
    router.post('/subscriber', function (req, res) {
        helpers.addEntity(Subscriber, req, res);
    });

    /**
     * @api {del} /email/subscriber Delete Subscriber
     * @apiName DeleteSubscriber
     * @apiDescription Löscht einen Abonnenten
     * @apiGroup Email
     *
     * @apiParam {String} email  Email-Adresse des Abonnenten.
     * @apiParam {String} team ID des Teams.
     *
     * @apiUse ErrorBadRequest
     *
     * @apiUse SuccessDeleteMessage
     **/
    router.delete('/subscriber', function (req, res) {
        logger.verbose('Deleting Subscriber with email %s', req.query.email, {team: req.query.team});
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            Subscriber.remove({email: req.query.email, team: req.query.team, veranstaltung: beachEventID}, function (err) {
                return handler.handleErrorAndDeleted(err, res)
            });
        });
    });

    /**
     * @api {get} /email/subscriber Get Subscribers
     * @apiName GetSubscribers
     * @apiDescription Lädt alle Abonnenten
     * @apiGroup Email
     *
     * @apiSuccess {String} _id ID des Abonnements
     * @apiSuccess {String} email Email-Adresse des Abonnenten.
     * @apiUse TeamObject
     * @apiUse vResponse
     * @apiPermission Admin
     * @apiUse AuthHeader
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     [{
     *      _id: '57cffbe355a8d45fc084c14a',
     *      email: 'test@test.de',
     *      team: {
     *          _id: '57cffb7a55a8d45fc084c123',
     *          name: 'Team AA 1',
     *          gruppe: '57cffb4055a8d45fc084c108',
     *          jugend: {
     *              _id: '57cffb4055a8d45fc084c107',
     *              name: 'Jugend 1',
     *              color: 'gruen',
     *              __v: 4,
     *              teams: [Object],
     *              gruppen: [Object]
     *          },
     *          __v: 0,
     *          gpunkte: 2,
     *          punkte: 0,
     *          gtore: 4,
     *          tore: 1
     *      },
     *      __v: 0
     *     }]
     **/
    router.get('/subscriber', function (req, res) {
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            Subscriber.find({}, function (err, subs) {
                if (err) return messages.Error(res, err);

                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    Subscriber.deepPopulate(subs, 'team team.jugend', function (err, subs) {
                        return handler.handleErrorAndResponse(err, res, subs);
                    });
                });
            });
        });
    });

    /**
     * @api {post} /email/bug Send Bug-Report-Email
     * @apiName SendBugEmail
     * @apiDescription Sendet eine Email mit einem BugReport
     * @apiGroup Email
     * @apiPermission Admin
     *
     * @apiParam {String} email E-Mail des Melders.
     *
     * @apiUse SuccessMessage
     *
     * @apiUse ErrorBadRequest
     **/
    router.post('/bug', function (req, res) {
        const beachEventID = cls.getBeachEventID();
        const clsSession = cls.getNamespace();
        return clsSession.run(function () {
            clsSession.set('beachEventID', beachEventID);
            MailGenerator.bugReportMail(req.body, function (err) {
                return handler.handleErrorAndSuccess(err, res);
            });
        });
    });

    return router;
};