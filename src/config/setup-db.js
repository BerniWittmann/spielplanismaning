module.exports = function (sendgrid, env, url, disableEmails) {
    const mongoose = require('mongoose');
    const logger = require('winston').loggers.get('dbSetup');
    const User = mongoose.model('User');
    const Team = mongoose.model('Team');
    const Gruppe = mongoose.model('Gruppe');
    const Jugend = mongoose.model('Jugend');
    const Spiel = mongoose.model('Spiel');
    const Spielplan = mongoose.model('Spielplan');
    const Subscriber = mongoose.model('Subscriber');
    const Veranstaltung = mongoose.model('Veranstaltung');
    const async = require('async');
    const helpers = require('../routes/helpers.js');
    const mailGenerator = require('../routes/mailGenerator/mailGenerator.js')(sendgrid, env, url, disableEmails);

    function checkDBNeedsSetup(cb) {
        return User.count(function (err, res) {
            if (err) return cb(err, false);

            if (res > 0) return cb(null, false);

            return cb(null, true);
        });
    }

    function handleDefaultUser() {
        return checkDBNeedsSetup(function (err, result) {
            if (err) logger.error('Error while checking db ', err);
            if (!result) return;

            const user = new User({
                username: 'berni',
                email: 'b.wittmann@mail.de'
            });
            user.setRandomPassword();
            user.setRole('Admin');
            user.generateResetToken();

            logger.info('Created default User: Username %s E-Mail: %s', user.username, user.email);

            return helpers.saveUserAndSendMail(user, {}, mailGenerator.passwordForgotMail);
        });
    }

    return Veranstaltung.find({}, function (err, events) {
        if (err) logger.error('Error while getting events', err);
        if (events.length === 0) return handleDefaultUser();

        const ids = events.map(function (single) {
            return single._id.toString();
        });
        async.each([Team, Gruppe, Jugend, Spiel, Spielplan, Subscriber], function (model, cb) {
            return model.remove({veranstaltung: {$nin: ids}}, cb);
        }, function (err) {
            if (err) logger.error('Error while cleaning up db ', err);

            handleDefaultUser();
        });
    });
};