module.exports = function (sendgrid, env, url, disableMails) {
    const _ = require('lodash');
    const constants = require('./constants.js');
    const ejs = require('ejs');
    const path = require('path');
    const fs = require('fs');
    const emailTemplatesFolderName = 'emailTemplates';
    const mailGenerator = {};

    mailGenerator.sendErgebnisUpdate = function (team, spiel, emails, cb) {
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
                mail.setFrom('mail@spielplanismaning.herokuapp.com');
                mail.setFromName('Kinderbeachturnier Ismaning');
                mail.setSubject('Ergebnis-Update: ' + team.name + ' hat ' + spielausgang);
                mail.setText('Ergebnis-Update: ' + team.name + ' hat ' + spielausgang);
                mail.replyto = 'kinderbeach.ismaning@mail.com';

                const data = {
                    teamname: team.name,
                    teamaname: spiel.teamA.name,
                    toreA: spiel.toreA,
                    toreB: spiel.toreB,
                    teambname: spiel.teamB.name,
                    spielausgang: spielausgang,
                    spielUrl: url + 'spiel/' + spiel._id,
                    unsubscribelink: url + 'teams/' + team._id + '/deabonnieren',
                    kontaktUrl: url + 'kontakt'
                };

                const html = ejs.render(template, data);

                mail.setHtml(html);

                sendMail(mail, cb);
            });
        } else {
            return cb(null, {});
        }
    };

    mailGenerator.sendSpielReminder = function (team, spiel, emails, cb) {
        if (emails.length > 0) {
            const templatePath = path.join(__dirname, emailTemplatesFolderName, 'spielReminder.ejs');
            return fs.readFile(templatePath, 'utf-8', function (err, template) {
                if (err) {
                    return cb(err, {});
                }
                const mail = new sendgrid.Email();
                mail.setTos(emails);
                mail.setSmtpapiTos(emails);
                mail.setFrom('mail@spielplanismaning.herokuapp.com');
                mail.setFromName('Kinderbeachturnier Ismaning');
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
                    spielUrl: url + 'spiel/' + spiel._id,
                    unsubscribelink: url + 'teams/' + team._id + '/deabonnieren',
                    kontaktUrl: url + 'kontakt'
                };

                const html = ejs.render(template, data);

                mail.setHtml(html);

                sendMail(mail, cb);
            });
        } else {
            return cb(null, {});
        }
    };

    mailGenerator.sendDefaultMail = function (emails, subject, body, cb) {
        if (emails.length > 0) {
            const templatePath = path.join(__dirname, emailTemplatesFolderName, 'default.ejs');
            return fs.readFile(templatePath, 'utf-8', function (err, template) {
                if (err) {
                    return cb(err, {});
                }
                const mail = new sendgrid.Email();
                mail.setTos(emails);
                mail.setSmtpapiTos(emails);
                mail.setFrom('mail@spielplanismaning.herokuapp.com');
                mail.setFromName('Kinderbeachturnier Ismaning');
                mail.setSubject(subject);
                mail.setText(body);
                mail.replyto = 'kinderbeach.ismaning@mail.com';

                const data = {
                    subject: subject,
                    body: body,
                    kontaktUrl: url + 'kontakt'
                };

                const html = ejs.render(template, data);

                mail.setHtml(html);

                sendMail(mail, cb);
            });
        } else {
            return cb(null, {});
        }
    };

    mailGenerator.registerMail = function (user, cb) {
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
                mail.setFrom('mail@spielplanismaning.herokuapp.com');
                mail.setFromName('Beachturnier Ismaning');
                mail.setSubject('Account-Freischaltung');
                mail.setText('Account-Freischaltung');
                mail.replyto = 'kinderbeach.ismaning@mail.com';

                const data = {
                    resetUrl: url + 'reset-password?token=' + user.resetToken,
                    kontaktUrl: url + 'kontakt',
                    username: user.username,
                    email: email,
                    baseUrl: url
                };
                const html = ejs.render(template, data);

                mail.setHtml(html);


                sendMail(mail, cb, true);
            });
        } else {
            return cb(null, {});
        }
    };

    mailGenerator.passwordForgotMail = function (user, cb) {
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
                mail.setFrom('mail@spielplanismaning.herokuapp.com');
                mail.setFromName('Beachturnier Ismaning');
                mail.setSubject('Passwort zurücksetzen');
                mail.setText('Passwort zurücksetzen');
                mail.replyto = 'kinderbeach.ismaning@mail.com';

                const data = {
                    resetUrl: url + 'reset-password?token=' + user.resetToken,
                    kontaktUrl: url + 'kontakt'
                };
                const html = ejs.render(template, data);

                mail.setHtml(html);

                sendMail(mail, cb, true);
            });
        } else {
            return cb(null, {});
        }
    };

    mailGenerator.bugReportMail = function (data, cb) {
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
                mail.setTos(['isibeach@byom.de']);
                mail.setSmtpapiTos(['isibeach@byom.de']);
            }
            sendgrid.send(mail, cb);
        } else {
            return cb(null, {});
        }
    }

    return mailGenerator;
};