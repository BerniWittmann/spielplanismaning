module.exports = function (env) {
    var express = require('express');
    var app = express();
    var mongoose = require('mongoose');
    var bodyParser = require('body-parser');

    process.env.SECRET = process.env.SECRET || env.SECRET || 'TEST-SECRET';
    process.env.ENVIRONMENT = process.env.ENVIRONMENT || env.ENVIRONMENT || 'TEST';
    process.env.URL = process.env.URL || env.URL || 'http://localhost:8001';
    process.env.DISABLEEMAIL = process.env.DISABLEEMAIL || env.DISABLEEMAIL || 'true';
    process.env.VERSION = process.env.VERSION || env.VERSION || 'vtag';
    process.env.LOCKDOWNMODE = process.env.LOCKDOWNMODE || env.LOCKDOWNMODE || 'false';
    process.env.KONTAKE = process.env.KONTAKTE || '[{"name": "Klaus Krecken", "email": "klaus@krecken.de", "turnier": "Kinderbeachturnier"},{"name": "Stefan Meyer", "email": "vorsitzender@fhi-ismaning.de", "turnier": "DBT Stoneline Beach Cup"}]';

    sendgrid = require('sendgrid')((process.env.SENDGRID_USERNAME || 'test'), (process.env.SENDGRID_PASSWORD || 'test'));
    sendgrid.send = function (mail, cb) {
        console.log('Mail sent.');
        console.log(mail);
        return cb();
    };

    if (!mongoose.models.Gruppe) {
        require('./../../models/Gruppen');
    }
    if (!mongoose.models.Jugend) {
        require('./../../models/Jugenden');
    }
    if (!mongoose.models.Spiel) {
        require('./../../models/Spiele');
    }
    if (!mongoose.models.Spielplan) {
        require('./../../models/Spielplan');
    }
    if (!mongoose.models.Team) {
        require('./../../models/Teams');
    }
    if (!mongoose.models.Subscriber) {
        require('./../../models/Subscriber');
    }
    if (!mongoose.models.User) {
        require('./../../models/Users')((process.env.SECRET || 'SECRET'));
    }
    require('../../config/passport');

    var routes = require('../../routes/index')();
    var users = require('../../routes/users')();
    var email = require('../../routes/email')(sendgrid, (process.env.ENVIRONMENT || 'DEV'), (process.env.URL || 'http://localhost:8000/'));
    var config = require('../../routes/config')(process.env);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.use('/api', routes);
    app.use('/api/users', users);
    app.use('/api/email', email);
    app.use('/api/config', config);

    return app;
};

