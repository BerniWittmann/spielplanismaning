module.exports = function (env) {
    var express = require('express');
    var app = express();
    var mongoose = require('mongoose');
    var bodyParser = require('body-parser');

    process.env.SECRET = process.env.SECRET || env.SECRET || 'TEST-SECRET';
    process.env.ENVIRONMENT = process.env.ENVIRONMENT || env.ENVIRONMENT || 'DEV';
    process.env.URL = process.env.URL || env.URL || 'http://localhost:8001';
    process.env.DISABLEEMAIL = process.env.DISABLEEMAIL || env.DISABLEEMAIL || 'true';
    process.env.VERSION = process.env.VERSION || env.VERSION || 'vtag';
    process.env.LOCKDOWNMODE = process.env.LOCKDOWNMODE || env.LOCKDOWNMODE || 'false';
    process.env.KONTAKE = process.env.KONTAKTE || '[{"name": "Klaus Krecken", "email": "klaus@krecken.de", "turnier": "Kinderbeachturnier"},{"name": "Stefan Meyer", "email": "vorsitzender@fhi-ismaning.de", "turnier": "DBT Stoneline Beach Cup"}]';
    process.env.DISABLE_EMAILS = process.env.DISABLE_EMAILS || 'true';
    process.env.MONGO_DB_URI = process.env.MONGO_DB_URI || env.MONGO_DB_URI || 'mongodb://localhost/spielplan-test';

    sendgrid = require('sendgrid')((process.env.SENDGRID_USERNAME || 'test'), (process.env.SENDGRID_PASSWORD || 'test'));
    sendgrid.send = function (mail, cb) {
        console.log('Mail sent.');
        console.log(mail);
        return cb();
    };

    if (!mongoose.models.Gruppe) {
        require('./../../src/models/Gruppen');
    }
    if (!mongoose.models.Jugend) {
        require('./../../src/models/Jugenden');
    }
    if (!mongoose.models.Spiel) {
        require('./../../src/models/Spiele');
    }
    if (!mongoose.models.Spielplan) {
        require('./../../src/models/Spielplan');
    }
    if (!mongoose.models.Team) {
        require('./../../src/models/Teams');
    }
    if (!mongoose.models.Subscriber) {
        require('./../../src/models/Subscriber');
    }
    if (!mongoose.models.User) {
        require('./../../src/models/Users')((process.env.SECRET || 'SECRET'));
    }
    require('../../src/config/passport');

    var routes = require('../../src/routes/index')();
    var users = require('../../src/routes/users')();
    var email = require('../../src/routes/email')(sendgrid, (process.env.ENVIRONMENT || 'DEV'), (process.env.URL || 'http://localhost:8000/'), process.env.DISABLE_EMAILS);
    var config = require('../../src/routes/config')(process.env);
    var gruppen = require('../../src/routes/gruppen')();
    var jugenden = require('../../src/routes/jugenden')();
    var spiele = require('../../src/routes/spiele')(sendgrid, (process.env.ENVIRONMENT || 'DEV'), (process.env.URL || 'http://localhost:8000/'), process.env.DISABLE_EMAILS);
    var spielplan = require('../../src/routes/spielplan')();
    var teams = require('../../src/routes/teams')();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    var homepath = __dirname.substring(0, __dirname.length - 'test/backend/'.length);
    app.set('views', homepath + '/src/views');
    app.set('view engine', 'ejs');

    app.use('/api/users', users);
    app.use('/api/email', email);
    app.use('/api/gruppen', gruppen);
    app.use('/api/config', config);
    app.use('/api/jugenden', jugenden);
    app.use('/api/spiele', spiele);
    app.use('/api/spielplan', spielplan);
    app.use('/api/teams', teams);
    app.use(/\/.*/, routes);

    var databaseSetup = require('./database-setup/database-setup')(process.env.MONGO_DB_URI);

    app.connectDB = databaseSetup.connect;
    app.disconnectDB = databaseSetup.disconnect;

    return app;
};

