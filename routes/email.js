module.exports = function (sendgrid, env) {
	var express = require('express');
	var router = express.Router();
	var mongoose = require('mongoose');
	var Subscriber = mongoose.model('Subscriber');

	router.post('/', function (req, res) {
		var email = {
			to: req.body.to
			, from: 'mail@spielplanismaning.herokuapp.com'
			, subject: req.body.subject
			, text: req.body.text
			, html: req.body.html
			, replyto: 'berniw@mnet-online.de'
			, bcc: 'spielplanismaning@byom.de'
		}

		if (env == 'PROD') {
			sendgrid.send(email, function (err, json) {
				if (err) {
					return console.error(err);
				}
				res.json('Email sendt');
			});
		} else {
			res.json(email);
		}
	});
	
	router.post('/subscriber', function (req, res) {
		var subscriber = new Subscriber(req.body);
		subscriber.save(function (err, sub) {
			if(err) {
				return err;
			}
			
			res.json(sub);
		});
	});
	
	router.delete('/subscriber', function (req, res) {
		Subscriber.find(req.body).remove().exec(function (err, sub) {
			if(err) {
				return err;
			}
			
			res.json(sub);
		});
	});

	return router;
}