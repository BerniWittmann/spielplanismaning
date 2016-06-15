module.exports = function (sendgrid, env, url) {
	var mailGenerator = {};

	mailGenerator.sendErgebnisUpdate = function (team, spiel, emails, cb) {
		if (emails.length > 0) {
			var spielausgang = 'gespielt.';
			if (spiel.unentschieden) {
				spielausgang = 'Unentschieden gespielt.';
			} else {
				if (spiel.gewinner._id == team._id) {
					spielausgang = 'gewonnen.';
				} else {
					spielausgang = 'verloren.';
				}
			}
			var mail = new sendgrid.Email();
			mail.setTos(emails);
			mail.setSmtpapiTos(emails);
			mail.setFrom('mail@spielplanismaning.herokuapp.com');
			mail.setFromName('Kinderbeachturnier Ismaning');
			mail.setSubject('Ergebnis-Update: ' + team.name + ' hat ' + spielausgang);
			mail.setText('Ergebnis-Update: ' + team.name + ' hat ' + spielausgang);
			mail.setHtml('<p>Ergebnis-Update: ' + team.name + ' hat ' + spielausgang + '</p>');
			mail.replyto = 'berniw@mnet-online.de';
			mail.addBcc('spielplanismaning@byom.de');

			mail.addSubstitution(':teamname', team.name);
			mail.addSubstitution(':teamaname', spiel.teamA.name);
			mail.addSubstitution(':toreA', spiel.toreA);
			mail.addSubstitution(':toreB', spiel.toreB);
			mail.addSubstitution(':teambname', spiel.teamB.name);

			mail.addSubstitution(':spielausgang', spielausgang);
			mail.addSubstitution(':spiellink', url + '#/spiel/' + spiel._id);
			mail.setFilters({
				'templates': {
					'settings': {
						'enable': 1
						, 'template_id': '23e8b62c-a7ca-4cfc-b571-e0ea0b9b1cac'
					}
				}
			});

			sendMail(mail, cb);
		}
	};

	mailGenerator.sendSpielReminder = function (team, spiel, emails, cb) {
		if (emails.length > 0) {
			var mail = new sendgrid.Email();
			mail.setTos(emails);
			mail.setSmtpapiTos(emails);
			mail.setFrom('mail@spielplanismaning.herokuapp.com');
			mail.setFromName('Kinderbeachturnier Ismaning');
			mail.setSubject('Spiel-Erinnerung: ' + team.name);
			mail.setText('Spiel-Erinnerung: ' + team.name);
			mail.setHtml('<p>Spiel-Erinnerung: ' + team.name + '</p>');
			mail.replyto = 'berniw@mnet-online.de';
			mail.addBcc('spielplanismaning@byom.de');

			mail.addSubstitution(':teamname', team.name);
			var teambname;
			if (team._id == spiel.teamA._id) {
				teambname = spiel.teamB.name;
			} else  {
				teambname = spiel.teamA.name;
			}
			mail.addSubstitution(':platz', spiel.platz);
			mail.addSubstitution(':uhrzeit', spiel.uhrzeit);
			mail.addSubstitution(':teambname', teambname);

			mail.addSubstitution(':spiellink', url + '#/spiel/' + spiel._id);
			mail.setFilters({
				'templates': {
					'settings': {
						'enable': 1
						, 'template_id': '5f56b047-5a30-4dbd-adf7-75d3d24c920f'
					}
				}
			});

			sendMail(mail, cb);
		}
	};

	function sendMail(mail, cb) {
		if (env == 'PROD') {
			sendgrid.send(mail, cb);
		} else {
			mail.setTos(['wittmann_b@web.de']);
			mail.setSmtpapiTos(['wittmann_b@web.de']);
			console.log('Mail Sendt');
			sendgrid.send(mail, cb);
		}
	}

	return mailGenerator;
}