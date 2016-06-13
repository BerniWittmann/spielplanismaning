module.exports = function (sendgrid) {
	var express = require('express');
	var router = express.Router();

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

		sendgrid.send(email, function (err, json) {
			if (err) {
				return console.error(err);
			}
			res.json('Email sendt');
		});

	});

	return router;
}