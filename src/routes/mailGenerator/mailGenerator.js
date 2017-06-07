module.exports = function (sendgrid, env, url, disableMails) {
    const logger = require('winston').loggers.get('mailGenerator');
    const _ = require('lodash');
    const constants = require('./constants.js');
    const ejs = require('ejs');
    const path = require('path');
    const fs = require('fs');
    const emailTemplatesFolderName = 'emailTemplates';
    const mailGenerator = {};
    const cls = require('../../config/cls.js');

    mailGenerator.sendErgebnisUpdate = function (team, spiel, emails, cb) {
        logger.verbose('Sending Ergebnis-Update to %d Subscribers', emails.length);
        const beachEventID = cls.getBeachEventID();
        if (emails.length > 0) {
            const templatePath = path.join(__dirname, emailTemplatesFolderName, 'ergebnisUpdate.ejs');
            return fs.readFile(templatePath, 'utf-8', function (err, template) {
                if (err) {
                    return cb(err, {});
                }
                let spielausgang = 'gespielt.';
                if (spiel.unentschieden) {
                    spielausgang = 'Unentschieden gespielt.';
                } else {
                    if (spiel.gewinner._id === team._id) {
                        spielausgang = 'gewonnen.';
                    } else {
                        spielausgang = 'verloren.';
                    }
                }
                const mail = new sendgrid.Email();
                mail.setTos(emails);
                mail.setSmtpapiTos(emails);
                mail.setFrom(constants.DEFAULT_MAIL_FROM.EMAIL);
                mail.setFromName(constants.DEFAULT_MAIL_FROM.NAME);
                mail.setSubject('Ergebnis-Update: ' + team.name + ' hat ' + spielausgang);
                mail.setText('Ergebnis-Update: ' + team.name + ' hat ' + spielausgang);
                mail.replyto = 'kinderbeach.ismaning@mail.com';

                const isComplexMode = process.env.SPIEL_MODE === 'complex';
                const tore = {
                    toreA: isComplexMode ? spiel.punkteA : spiel.toreA,
                    toreB: isComplexMode ? spiel.punkteB : spiel.toreA
                };
                const data = {
                    teamname: team.name,
                    teamaname: spiel.teamA.name,
                    toreA: tore.toreA,
                    toreB: tore.toreB,
                    teambname: spiel.teamB.name,
                    spielausgang: spielausgang,
                    spielUrl: url + beachEventID + '/spiel/' + spiel._id,
                    unsubscribelink: url +  beachEventID + '/teams/' + team._id + '/deabonnieren',
                    kontaktUrl: url + 'kontakt',
                    imageUrl: url + 'assets/img/hoelle_sued_beach_logo_email.png'
                };

                const html = ejs.render(template, data);

                mail.setHtml(html);

                sendMail(mail, cb);
            });
        } else {
            logger.verbose('No Subscribers found, so no Mail was sent');
            return cb(null, {});
        }
    };

    mailGenerator.sendSpielReminder = function (team, spiel, emails, cb) {
        logger.verbose('Sending Spiel-Reminder to %d Subscribers', emails.length);
        const beachEventID = cls.getBeachEventID();
        if (emails.length > 0) {
            const templatePath = path.join(__dirname, emailTemplatesFolderName, 'spielReminder.ejs');
            return fs.readFile(templatePath, 'utf-8', function (err, template) {
                if (err) {
                    return cb(err, {});
                }
                const mail = new sendgrid.Email();
                mail.setTos(emails);
                mail.setSmtpapiTos(emails);
                mail.setFrom(constants.DEFAULT_MAIL_FROM.EMAIL);
                mail.setFromName(constants.DEFAULT_MAIL_FROM.NAME);
                mail.setSubject('Spiel-Erinnerung: ' + team.name);
                mail.setText('Spiel-Erinnerung: ' + team.name);
                mail.replyto = 'kinderbeach.ismaning@mail.com';

                mail.addSubstitution('-teamname-', team.name);
                let teambname;
                if (team._id === spiel.teamA._id) {
                    teambname = spiel.teamB.name;
                } else {
                    teambname = spiel.teamA.name;
                }

                const data = {
                    teamname: team.name,
                    platz: spiel.platz,
                    uhrzeit: spiel.uhrzeit,
                    teambname: teambname,
                    spielUrl: url + beachEventID + '/spiel/' + spiel._id,
                    unsubscribelink: url + beachEventID + '/teams/' + team._id + '/deabonnieren',
                    kontaktUrl: url + 'kontakt',
                    imageUrl: url + 'assets/img/hoelle_sued_beach_logo_email.png'
                };

                const html = ejs.render(template, data);

                mail.setHtml(html);

                sendMail(mail, cb);
            });
        } else {
            logger.verbose('No Subscribers found, so no Mail was sent');
            return cb(null, {});
        }
    };

    mailGenerator.sendDefaultMail = function (emails, subject, body, cb) {
        logger.verbose('Sending Plain-Email to %d Subscribers', emails.length);
        if (emails.length > 0) {
            const templatePath = path.join(__dirname, emailTemplatesFolderName, 'default.ejs');
            return fs.readFile(templatePath, 'utf-8', function (err, template) {
                if (err) {
                    return cb(err, {});
                }
                const mail = new sendgrid.Email();
                mail.setTos(emails);
                mail.setSmtpapiTos(emails);
                mail.setFrom(constants.DEFAULT_MAIL_FROM.EMAIL);
                mail.setFromName(constants.DEFAULT_MAIL_FROM.NAME);
                mail.setSubject(subject);
                mail.setText(body);
                mail.replyto = 'kinderbeach.ismaning@mail.com';

                const data = {
                    subject: subject,
                    body: body,
                    kontaktUrl: url + 'kontakt',
                    imageUrl: url + 'assets/img/hoelle_sued_beach_logo_email.png'
                };

                const html = ejs.render(template, data);

                mail.setHtml(html);

                sendMail(mail, cb);
            });
        } else {
            logger.verbose('No Subscribers found, so no Mail was sent');
            return cb(null, {});
        }
    };

    mailGenerator.registerMail = function (user, cb) {
        logger.verbose('Sending Register-Mail');
        if (user) {
            const templatePath = path.join(__dirname, emailTemplatesFolderName, 'register.ejs');
            return fs.readFile(templatePath, 'utf-8', function (err, template) {
                if (err) {
                    return cb(err, {});
                }

                let email;
                if (!user.email) {
                    email = user.username;
                } else {
                    email = user.email;
                }
                const mail = new sendgrid.Email();
                mail.setTos(email);
                mail.setSmtpapiTos(email);
                mail.setFrom(constants.DEFAULT_MAIL_FROM.EMAIL);
                mail.setFromName(constants.DEFAULT_MAIL_FROM.NAME);
                mail.setSubject('Account-Freischaltung');
                mail.setText('Account-Freischaltung');
                mail.replyto = 'kinderbeach.ismaning@mail.com';

                const data = {
                    resetUrl: url + 'reset-password?token=' + user.resetToken,
                    kontaktUrl: url + 'kontakt',
                    username: user.username,
                    email: email,
                    baseUrl: url,
                    imageUrl: url + 'assets/img/hoelle_sued_beach_logo_email.png'
                };
                const html = ejs.render(template, data);

                mail.setHtml(html);


                sendMail(mail, cb, true);
            });
        } else {
            logger.warn('No User given, so no Mail was sent');
            return cb(null, {});
        }
    };

    mailGenerator.passwordForgotMail = function (user, cb) {
        logger.verbose('Sending Password-Forgot-Email');
        if (user) {
            const templatePath = path.join(__dirname, emailTemplatesFolderName, 'passwordForgot.ejs');
            return fs.readFile(templatePath, 'utf-8', function (err, template) {
                if (err) {
                    return cb(err, {});
                }

                let email;
                if (!user.email) {
                    email = user.username;
                } else {
                    email = user.email;
                }
                const mail = new sendgrid.Email();
                mail.setTos(email);
                mail.setSmtpapiTos(email);
                mail.setFrom(constants.DEFAULT_MAIL_FROM.EMAIL);
                mail.setFromName(constants.DEFAULT_MAIL_FROM.NAME);
                mail.setSubject('Passwort zurücksetzen');
                mail.setText('Passwort zurücksetzen');
                mail.replyto = 'kinderbeach.ismaning@mail.com';

                const data = {
                    resetUrl: url + 'reset-password?token=' + user.resetToken,
                    kontaktUrl: url + 'kontakt',
                    imageUrl: url + 'assets/img/hoelle_sued_beach_logo_email.png'
                };
                const html = ejs.render(template, data);

                mail.setHtml(html);

                sendMail(mail, cb, true);
            });
        } else {
            logger.warn('No User given, so no Mail was sent');
            return cb(null, {});
        }
    };

    mailGenerator.bugReportMail = function (data, cb) {
        logger.verbose('Sending Bug-Report');
        const beachEventID = cls.getBeachEventID();
        const templatePath = path.join(__dirname, emailTemplatesFolderName, 'bugReport.ejs');
        return fs.readFile(templatePath, 'utf-8', function (err, template) {
            if (err) {
                return cb(err, {});
            }
            if (!data.name) {
                data.name = data.vorname + ' ' + data.nachname;
            }
            if (!data.email) {
                data.email = data.username;
            }
            if (!data.role) {
                data.role = 'Nicht eingeloggt';
            }
            if (!data.username) {
                data.username = 'Nicht eingeloggt';
            }
            data.eventID = beachEventID || 'kein Event gewählt';
            const mail = new sendgrid.Email();
            mail.setTos(constants.BUG_REPORT_EMAIL_TO);
            mail.setSmtpapiTos(constants.BUG_REPORT_EMAIL_TO);
            mail.setFrom(data.email);
            mail.setFromName(data.name);
            const subject = constants.BUG_REPORT_EMAIL_SUBJECT_PREFIX + ' ' + data.title + ' ' + constants.BUG_REPORT_EMAIL_LABEL + ' ' + constants.BUG_REPORT_EMAIL_MEMBER;
            mail.setSubject(subject);

            mail.replyto = data.email;

            const html = ejs.render(template, data);

            mail.setHtml(html);

            sendMail(mail, cb, true);
        });
    };

    function sendMail(mail, cb, ignoreEnvironment) {
        if (_.isUndefined(ignoreEnvironment) || _.isNull(ignoreEnvironment)) {
            ignoreEnvironment = false;
        }

        if (disableMails !== 'true') {
            if (!ignoreEnvironment && env !== 'production') {
                const email = 'isibeach@byom.de';
                logger.verbose('E-Mail redirected to Test-Email Account %s', email);
                mail.setTos([email]);
                mail.setSmtpapiTos([email]);
            }
            sendgrid.send(mail, cb);
        } else {
            logger.verbose('Mails are disabled');
            return cb(null, {});
        }
    }

    return mailGenerator;
};