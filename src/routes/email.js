module.exports = function (sendgrid, env, url, disableEmails) {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var Subscriber = mongoose.model('Subscriber');
    var MailGenerator = require('./mailGenerator/mailGenerator.js')(sendgrid, env, url, disableEmails);
    var messages = require('./messages/messages.js')();

    /**
     * @api {post} /email Send Email
     * @apiName SendEmail
     * @apiDescription Sendet eine Email an alle Abonnenten
     * @apiGroup Email
     *
     * @apiParam {String} subject  Betreff der Email.
     * @apiParam {String} text     Text der Email.
     *
     * @apiSuccess {Array} body Empty TODO
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       []
     *     }
     **/
    router.post('/', function (req, res) {
        Subscriber.find().exec(function (err, subs) {
            var emails = [];
            subs.forEach(function (sub) {
                emails.push(sub.email);
            });

            function onlyUnique(value, index, self) {
                return self.indexOf(value) === index;
            }

            emails = emails.filter(onlyUnique);

            //noinspection JSUnresolvedFunction
            MailGenerator.sendDefaultMail(emails, req.body.subject, req.body.text, function (err) {
                if (err) {
                    return messages.Error(res, err);
                }

                return messages.Success(res);
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
        var subscriber = new Subscriber(req.body);
        subscriber.save(function (err, sub) {
            if (err) {
                return messages.Error(res, err);
            }

            return res.json(sub);
        });
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
     * @apiSuccess {Integer} ok Anzahl gefundene Abonnements
     * @apiSuccess {Integer} n Anzahl gelöschte Abonnements
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       ok: 1,
     *       n: 1
     *     }
     **/
    router.delete('/subscriber', function (req, res) {
        Subscriber.find({email: req.param('email'), team: req.param('team')}).remove().exec(function (err, sub) {
            if (err) {
                return messages.Error(res, err);
            }

            return messages.Deleted(res);
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
        var query = Subscriber.find();
        query.deepPopulate('team team.jugend').exec(function (err, subs) {
            if (err) {
                return messages.Error(res, err);
            }

            return res.json(subs);
        });
    });

    return router;
};