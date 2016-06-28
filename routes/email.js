module.exports = function (sendgrid, env, url) {
    var express = require('express');
    var router = express.Router();
    var mongoose = require('mongoose');
    var Subscriber = mongoose.model('Subscriber');
    var MailGenerator = require('./mailGenerator/mailGenerator.js')(sendgrid, env, url);

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
            MailGenerator.sendDefaultMail(emails, req.body.subject, req.body.text, function (err, result) {
                if (err) {
                    return console.log(err);
                }

                res.json(result);
            });
        });
    });

    router.post('/subscriber', function (req, res) {
        var subscriber = new Subscriber(req.body);
        subscriber.save(function (err, sub) {
            if (err) {
                return err;
            }

            res.json(sub);
        });
    });

    router.delete('/subscriber', function (req, res) {
        Subscriber.find(req.body).remove().exec(function (err, sub) {
            if (err) {
                return err;
            }

            res.json(sub);
        });
    });

    return router;
};