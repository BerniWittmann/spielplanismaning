module.exports = function (sendgrid, env, url, disableMails) {
    var _ = require('lodash');
    var mailGenerator = {};

    mailGenerator.sendErgebnisUpdate = function (team, spiel, emails, cb) {
        if (emails.length > 0) {
            var spielausgang = 'gespielt.';
            if (spiel.unentschieden) {
                spielausgang = 'Unentschieden gespielt.';
            } else {
                if (spiel.gewinner._id === team._id) {
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
            mail.replyto = 'kinderbeach.ismaning@mail.com';

            mail.addSubstitution('-teamname-', team.name);
            mail.addSubstitution('-teamaname-', spiel.teamA.name);
            mail.addSubstitution('-toreA-', spiel.toreA);
            mail.addSubstitution('-toreB-', spiel.toreB);
            mail.addSubstitution('-teambname-', spiel.teamB.name);

            mail.addSubstitution('-spielausgang-', spielausgang);
            mail.addSubstitution('-spiellink-', url + '#/spiel/' + spiel._id);
            mail.addSubstitution('-unsubscribelink-', url + '#/teams/' + team._id + '/deabonnieren');
            mail.setFilters({
                'templates': {
                    'settings': {
                        'enable': 1,
                        'template_id': '23e8b62c-a7ca-4cfc-b571-e0ea0b9b1cac'
                    }
                }
            });

            sendMail(mail, cb);
        } else {
            return cb(null, {});
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
            mail.replyto = 'kinderbeach.ismaning@mail.com';

            mail.addSubstitution('-teamname-', team.name);
            var teambname;
            if (team._id === spiel.teamA._id) {
                teambname = spiel.teamB.name;
            } else {
                teambname = spiel.teamA.name;
            }
            mail.addSubstitution('-platz-', spiel.platz);
            mail.addSubstitution('-uhrzeit-', spiel.uhrzeit);
            mail.addSubstitution('-teambname-', teambname);

            mail.addSubstitution('-spiellink-', url + '#/spiel/' + spiel._id);
            mail.addSubstitution('-unsubscribelink-', url + '#/teams/' + team._id + '/deabonnieren');
            mail.setFilters({
                'templates': {
                    'settings': {
                        'enable': 1,
                        'template_id': '5f56b047-5a30-4dbd-adf7-75d3d24c920f'
                    }
                }
            });

            sendMail(mail, cb);
        } else {
            return cb(null, {});
        }
    };

    mailGenerator.sendDefaultMail = function (emails, subject, body, cb) {
        if (emails.length > 0) {
            var mail = new sendgrid.Email();
            mail.setTos(emails);
            mail.setSmtpapiTos(emails);
            mail.setFrom('mail@spielplanismaning.herokuapp.com');
            mail.setFromName('Kinderbeachturnier Ismaning');
            mail.setSubject(subject);
            mail.setText(body);
            mail.setHtml(body);
            mail.replyto = 'kinderbeach.ismaning@mail.com';

            mail.addSubstitution('-teamname-', 'Kinderbeachturnier Ismaning');
            mail.addSubstitution('-subject-', subject);
            mail.addSubstitution('-body-', body);

            mail.addSubstitution('-unsubscribelink-', url + '#/home');
            mail.setFilters({
                'templates': {
                    'settings': {
                        'enable': 1,
                        'template_id': '1e4a9e27-027c-46c3-9991-2b999bfd62b5'
                    }
                }
            });

            sendMail(mail, cb);
        } else {
            return cb(null, {});
        }
    };

    mailGenerator.registerMail = function (user, cb) {
        if (user) {
            var email;
            if(!user.email) {
                email = user.username;
            } else {
                email = user.email;
            }
            var mail = new sendgrid.Email();
            mail.setTos(email);
            mail.setSmtpapiTos(email);
            mail.setFrom('mail@spielplanismaning.herokuapp.com');
            mail.setFromName('Beachturnier Ismaning');
            mail.setSubject('Account-Freischaltung');
            mail.setText('Account-Freischaltung');
            mail.setHtml('<p>Account freischalten</p>');
            mail.replyto = 'kinderbeach.ismaning@mail.com';

            mail.addSubstitution('-resetUrl-', url + 'reset-password?token=' + user.resetToken);
            mail.addSubstitution('-kontaktUrl-', url + 'kontakt');
            mail.addSubstitution('-username-', user.username);
            mail.addSubstitution('-userEmail-', email);
            mail.addSubstitution('-baseUrl', url);

            mail.setFilters({
                'templates': {
                    'settings': {
                        'enable': 1,
                        'template_id': '3b025968-9909-4fc3-90e2-76b98b83a14d'
                    }
                }
            });

            sendMail(mail, cb, true);
        } else {
            return cb(null, {});
        }
    };

    mailGenerator.passwordForgotMail = function (user, cb) {
        if (user) {
            var email;
            if(!user.email) {
                email = user.username;
            } else {
                email = user.email;
            }
            var mail = new sendgrid.Email();
            mail.setTos(email);
            mail.setSmtpapiTos(email);
            mail.setFrom('mail@spielplanismaning.herokuapp.com');
            mail.setFromName('Beachturnier Ismaning');
            mail.setSubject('Passwort zurücksetzen');
            mail.setText('Passwort zurücksetzen');
            mail.setHtml('<p>Passwort zurücksetzen</p>');
            mail.replyto = 'kinderbeach.ismaning@mail.com';

            mail.addSubstitution('-resetUrl-', url + 'reset-password?token=' + user.resetToken);
            mail.addSubstitution('-kontaktUrl-', url + 'kontakt');

            mail.setFilters({
                'templates': {
                    'settings': {
                        'enable': 1,
                        'template_id': '2574c091-af4e-4922-9721-c926ca2885fd'
                    }
                }
            });

            sendMail(mail, cb, true);
        } else {
            return cb(null, {});
        }
    };

    function sendMail(mail, cb, ignoreEnvironment) {
        if (_.isUndefined(ignoreEnvironment) || _.isNull(ignoreEnvironment)) {
            ignoreEnvironment = false;
        }

        if (disableMails === 'true') {
            if (ignoreEnvironment || env !== 'production') {
                mail.setTos(['kinderbeach.ismaning@byom.com']);
                mail.setSmtpapiTos(['kinderbeach.ismaning@byom.com']);
            }
            sendgrid.send(mail, cb);
        } else {
            return cb(null, {});
        }
    }

    return mailGenerator;
};