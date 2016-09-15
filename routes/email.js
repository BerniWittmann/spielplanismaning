module.exports = function (sendgrid, env, url, disableEmails) {
    var express = require('express');
    var router = express.Router();

    var mongoose = require('mongoose');
    var Subscriber = mongoose.model('Subscriber');
    var MailGenerator = require('./mailGenerator/mailGenerator.js')(sendgrid, env, url, disableEmails);

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
        Subscriber.find({email: req.param('email'), team: req.param('team')}).remove().exec(function (err, sub) {
            if (err) {
                return err;
            }

            res.json(sub);
        });
    });

    router.get('/subscriber', function (req, res) {
        var query = Subscriber.find();
        query.deepPopulate('team team.jugend').exec(function (err, subs) {
            if(err) {
                throw err;
            }

            res.json(subs);
        });
    });

    return router;
};